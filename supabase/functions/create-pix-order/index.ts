import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderRequest {
  plateQueryId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    if (!asaasApiKey) {
      throw new Error('ASAAS_API_KEY não configurada');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      plateQueryId,
      customerName,
      customerEmail,
      customerPhone,
      customerCpf,
    }: CreateOrderRequest = await req.json();

    console.log('[create-pix-order] Creating order for plateQueryId:', plateQueryId);

    // Validate plateQueryId exists
    const { data: plateQuery, error: queryError } = await supabase
      .from('plate_queries')
      .select('*')
      .eq('id', plateQueryId)
      .single();

    if (queryError || !plateQuery) {
      return new Response(
        JSON.stringify({ success: false, error: 'Consulta de placa não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Validate CPF
    const cleanCpf = customerCpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      throw new Error('CPF inválido. O CPF deve conter 11 dígitos.');
    }

    // Price in cents: R$ 17,90 = 1790 cents
    const amountCents = 1790;
    const amountDecimal = 17.90;

    // Create or find customer in Asaas
    let customerId: string;
    
    const searchCustomerResponse = await fetch(
      `https://api.asaas.com/v3/customers?cpfCnpj=${cleanCpf}`,
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
      console.log('[create-pix-order] Existing customer found:', customerId);
    } else {
      // Create new customer
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
            phone: customerPhone.replace(/\D/g, ''),
            cpfCnpj: cleanCpf,
          }),
        }
      );

      const customerData = await createCustomerResponse.json();
      
      if (!createCustomerResponse.ok) {
        console.error('[create-pix-order] Error creating customer:', customerData);
        throw new Error(customerData.errors?.[0]?.description || 'Erro ao criar cliente');
      }

      customerId = customerData.id;
      console.log('[create-pix-order] New customer created:', customerId);
    }

    // Create PIX payment
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1); // Due in 1 day

    const paymentPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: amountDecimal,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Relatório Veicular Completo - ${plateQuery.placa}`,
      externalReference: plateQueryId,
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
      console.error('[create-pix-order] Error creating payment:', paymentData);
      throw new Error(paymentData.errors?.[0]?.description || 'Erro ao criar cobrança');
    }

    console.log('[create-pix-order] Payment created:', paymentData.id);

    // Get PIX QR Code with retry
    let pixQrCode: string | null = null;
    let pixCopyPaste: string | null = null;

    const fetchPixWithRetry = async (attempts = 3, delayMs = 2000) => {
      for (let i = 0; i < attempts; i++) {
        try {
          console.log(`[create-pix-order] Fetching PIX QR (attempt ${i + 1}/${attempts})...`);
          
          if (i === 0) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
          
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
          
          if (pixResponse.ok && pixData?.encodedImage && pixData?.payload) {
            console.log('[create-pix-order] PIX QR obtained successfully');
            return {
              qrCode: pixData.encodedImage,
              payload: pixData.payload
            };
          }
        } catch (e) {
          console.warn(`[create-pix-order] PIX fetch attempt ${i + 1} failed:`, e);
        }
      }
      return { qrCode: null, payload: null };
    };

    const pixResult = await fetchPixWithRetry();
    pixQrCode = pixResult.qrCode;
    pixCopyPaste = pixResult.payload;

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        plate_query_id: plateQueryId,
        payment_status: 'pending',
        pix_txid: paymentData.id,
        asaas_payment_id: paymentData.id,
        asaas_customer_id: customerId,
        amount_cents: amountCents,
        provider_total_cost_cents: 37, // Start with basic cost only
      })
      .select()
      .single();

    if (orderError) {
      console.error('[create-pix-order] DB order error:', orderError);
      throw orderError;
    }

    console.log('[create-pix-order] Order created:', order.id);

    // Update plate_query status
    await supabase
      .from('plate_queries')
      .update({ status: 'paid_pending' })
      .eq('id', plateQueryId);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        paymentId: paymentData.id,
        publicAccessToken: order.public_access_token,
        invoiceUrl: paymentData.invoiceUrl,
        pixQrCode,
        pixCopyPaste,
        status: paymentData.status,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[create-pix-order] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao processar pagamento',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
