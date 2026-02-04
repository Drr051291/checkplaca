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

    console.log('[sync-customers] Iniciando sincronização de clientes do Asaas...');

    // Busca todos os pedidos pagos que têm asaas_customer_id
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id, 
        created_at, 
        amount_cents, 
        asaas_customer_id, 
        asaas_payment_id,
        plate_query_id,
        plate_queries!inner(placa)
      `)
      .eq('payment_status', 'paid')
      .not('asaas_customer_id', 'is', null);

    if (ordersError) {
      console.error('[sync-customers] Erro ao buscar orders:', ordersError);
      throw ordersError;
    }

    if (!orders || orders.length === 0) {
      console.log('[sync-customers] Nenhum pedido com cliente Asaas encontrado');
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum pedido para sincronizar', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sync-customers] Encontrados ${orders.length} pedidos para sincronizar`);

    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const syncedCustomers: any[] = [];

    for (const order of orders) {
      try {
        const customerId = order.asaas_customer_id;
        const plate = (order as any).plate_queries?.placa || 'N/A';

        // Verifica se já existe um customer com este order id ou asaas_customer_id + placa
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .or(`payment_id.eq.${order.id},and(plate.eq.${plate},created_at.gte.${order.created_at.split('T')[0]})`)
          .maybeSingle();

        if (existingCustomer) {
          console.log(`[sync-customers] Customer já existe para order ${order.id}, pulando...`);
          skippedCount++;
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

        // Gera um UUID para report_id já que orders usa plate_query_id
        const reportId = crypto.randomUUID();

        // Insere os dados do cliente na tabela customers
        const customerRecord = {
          report_id: reportId,
          payment_id: order.id,
          name: customerData.name || 'Cliente',
          email: customerData.email || 'sem-email@checkplaca.com',
          phone: customerData.phone || customerData.mobilePhone || '00000000000',
          cpf: customerData.cpfCnpj || '00000000000',
          plate: plate,
          plan_type: 'completo',
          amount: (order.amount_cents || 1790) / 100,
          created_at: order.created_at,
        };

        const { error: insertError } = await supabase
          .from('customers')
          .insert(customerRecord);

        if (insertError) {
          console.error(`[sync-customers] Erro ao inserir customer para order ${order.id}:`, insertError);
          errorCount++;
        } else {
          console.log(`[sync-customers] Customer sincronizado: ${customerData.name} - ${plate}`);
          syncedCount++;
          syncedCustomers.push({
            name: customerData.name,
            email: customerData.email,
            plate: plate,
            amount: customerRecord.amount,
          });
        }

        // Delay para não sobrecarregar a API do Asaas
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`[sync-customers] Erro ao processar order ${order.id}:`, error);
        errorCount++;
      }
    }

    console.log(`[sync-customers] Sincronização concluída. Novos: ${syncedCount}, Existentes: ${skippedCount}, Erros: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        skipped: skippedCount,
        errors: errorCount,
        total: orders.length,
        customers: syncedCustomers,
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
