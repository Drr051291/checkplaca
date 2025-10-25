import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  reportId: string;
  planType: 'completo' | 'premium';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  paymentMethod: 'PIX' | 'CREDIT_CARD';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    if (!asaasApiKey) {
      throw new Error('ASAAS_API_KEY não configurada');
    }

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      reportId,
      planType,
      customerName,
      customerEmail,
      customerPhone,
      customerCpf,
      paymentMethod,
    }: PaymentRequest = await req.json();

    // Verify user owns the report
    const { data: report, error: reportError } = await supabase
      .from('vehicle_reports')
      .select('user_id')
      .eq('id', reportId)
      .single();

    if (reportError || !report || report.user_id !== user.id) {
      throw new Error('Unauthorized: Report not found or access denied');
    }

    console.log('[create-payment] User:', user.id, 'Report:', reportId, 'Plan:', planType);

    // Define valores dos planos
    const planValues = {
      completo: 19.90,
      premium: 39.90,
    };

    const value = planValues[planType];

    // Primeiro, cria ou busca o cliente no Asaas
    let customerId: string;
    
    // Tenta buscar cliente existente
    const searchCustomerResponse = await fetch(
      `https://api.asaas.com/v3/customers?cpfCnpj=${customerCpf}`,
      {
        method: 'GET',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const searchData = await searchCustomerResponse.json();
    
    if (searchData.data && searchData.data.length > 0) {
      customerId = searchData.data[0].id;
      console.log('[create-payment] Cliente existente encontrado:', customerId);
    } else {
      // Cria novo cliente
      const createCustomerResponse = await fetch(
        'https://api.asaas.com/v3/customers',
        {
          method: 'POST',
          headers: {
            'access_token': asaasApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            cpfCnpj: customerCpf,
          }),
        }
      );

      const customerData = await createCustomerResponse.json();
      
      if (!createCustomerResponse.ok) {
        console.error('[create-payment] Erro ao criar cliente:', customerData);
        throw new Error(customerData.errors?.[0]?.description || 'Erro ao criar cliente');
      }

      customerId = customerData.id;
      console.log('[create-payment] Novo cliente criado:', customerId);
    }

    // Cria a cobrança
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Vencimento em 7 dias

    const paymentPayload: any = {
      customer: customerId,
      billingType: paymentMethod,
      value: value,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Relatório Veicular ${planType === 'completo' ? 'Completo' : 'Premium Plus'}`,
      externalReference: reportId,
      postalService: false,
    };

    const createPaymentResponse = await fetch(
      'https://api.asaas.com/v3/payments',
      {
        method: 'POST',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload),
      }
    );

    const paymentData = await createPaymentResponse.json();

    if (!createPaymentResponse.ok) {
      console.error('[create-payment] Erro ao criar cobrança:', paymentData);
      throw new Error(paymentData.errors?.[0]?.description || 'Erro ao criar cobrança');
    }

    console.log('[create-payment] Cobrança criada com sucesso:', paymentData.id);

    // Para PIX, buscar o QR Code e o payload explicitamente
    let pixQrCode: string | null = null;
    let pixCopyPaste: string | null = null;

    if (paymentMethod === 'PIX') {
      try {
        const pixResponse = await fetch(
          `https://api.asaas.com/v3/payments/${paymentData.id}/pixQrCode`,
          {
            method: 'GET',
            headers: {
              'access_token': asaasApiKey,
              'Content-Type': 'application/json',
            },
          }
        );
        const pixData = await pixResponse.json();
        if (pixResponse.ok) {
          pixQrCode = pixData?.encodedImage || null;
          pixCopyPaste = pixData?.payload || null;
        } else {
          console.warn('[create-payment] Falha ao obter PIX QR Code:', pixData);
        }
      } catch (e) {
        console.warn('[create-payment] Exceção ao obter PIX QR Code:', e);
      }
    }

    // Salva o pagamento no banco
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        report_id: reportId,
        asaas_payment_id: paymentData.id,
        asaas_customer_id: customerId,
        plan_type: planType,
        amount: value,
        status: 'pending',
        payment_method: paymentMethod,
        payment_data: paymentData,
        user_id: user.id,
      });

    if (dbError) {
      console.error('[create-payment] Erro ao salvar no banco:', dbError);
      throw dbError;
    }

    // Retorna dados do pagamento
    return new Response(
      JSON.stringify({
        success: true,
        paymentId: paymentData.id,
        invoiceUrl: paymentData.invoiceUrl,
        pixQrCode: pixQrCode,
        pixCopyPaste: pixCopyPaste,
        payload: pixCopyPaste, // compatibilidade
        status: paymentData.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[create-payment] Erro:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao processar pagamento',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
