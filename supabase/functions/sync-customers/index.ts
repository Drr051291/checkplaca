import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('[sync-customers] Iniciando sincronização de clientes...');

    // Busca todos os pagamentos que não têm registro na tabela customers
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, report_id, asaas_customer_id, asaas_payment_id, plan_type, amount, created_at')
      .is('asaas_customer_id', null)
      .eq('status', 'paid');

    if (paymentsError) {
      console.error('[sync-customers] Erro ao buscar pagamentos:', paymentsError);
      throw paymentsError;
    }

    if (!payments || payments.length === 0) {
      console.log('[sync-customers] Nenhum pagamento para sincronizar');
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum pagamento para sincronizar', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sync-customers] Encontrados ${payments.length} pagamentos para sincronizar`);

    let syncedCount = 0;
    let errorCount = 0;

    // Para cada pagamento, busca os dados do cliente no Asaas
    for (const payment of payments) {
      try {
        // Busca o payment no Asaas para obter o customer_id
        const paymentResponse = await fetch(
          `https://api.asaas.com/v3/payments/${payment.asaas_payment_id}`,
          {
            method: 'GET',
            headers: {
              'access_token': asaasApiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!paymentResponse.ok) {
          console.error(`[sync-customers] Erro ao buscar payment ${payment.asaas_payment_id}`);
          errorCount++;
          continue;
        }

        const paymentData = await paymentResponse.json();
        const customerId = paymentData.customer;

        if (!customerId) {
          console.error(`[sync-customers] Customer ID não encontrado para payment ${payment.asaas_payment_id}`);
          errorCount++;
          continue;
        }

        // Busca os dados do cliente no Asaas
        const customerResponse = await fetch(
          `https://api.asaas.com/v3/customers/${customerId}`,
          {
            method: 'GET',
            headers: {
              'access_token': asaasApiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!customerResponse.ok) {
          console.error(`[sync-customers] Erro ao buscar customer ${customerId}`);
          errorCount++;
          continue;
        }

        const customerData = await customerResponse.json();

        // Busca a placa do relatório
        const { data: reportData } = await supabase
          .from('vehicle_reports')
          .select('plate')
          .eq('id', payment.report_id)
          .single();

        const plate = reportData?.plate || 'N/A';

        // Verifica se já existe um customer com este payment_id
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('payment_id', payment.id)
          .maybeSingle();

        if (existingCustomer) {
          console.log(`[sync-customers] Customer já existe para payment ${payment.id}, pulando...`);
          continue;
        }

        // Insere os dados do cliente na tabela customers
        const { error: insertError } = await supabase
          .from('customers')
          .insert({
            report_id: payment.report_id,
            payment_id: payment.id,
            name: customerData.name || 'N/A',
            email: customerData.email || 'contato@checkplaca.com',
            phone: customerData.phone || '00000000000',
            cpf: customerData.cpfCnpj || '00000000000',
            plate: plate,
            plan_type: payment.plan_type,
            amount: payment.amount,
            created_at: payment.created_at,
          });

        if (insertError) {
          console.error(`[sync-customers] Erro ao inserir customer para payment ${payment.id}:`, insertError);
          errorCount++;
        } else {
          console.log(`[sync-customers] Customer sincronizado com sucesso para payment ${payment.id}`);
          syncedCount++;
        }

        // Delay para não sobrecarregar a API do Asaas
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`[sync-customers] Erro ao processar payment ${payment.id}:`, error);
        errorCount++;
      }
    }

    console.log(`[sync-customers] Sincronização concluída. Sucesso: ${syncedCount}, Erros: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        errors: errorCount,
        total: payments.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[sync-customers] Erro:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao sincronizar clientes',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
