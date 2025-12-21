import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { paymentId, orderId } = await req.json();

    console.log('[confirm-order-payment] Checking payment:', paymentId || orderId);

    // Find order
    let order;
    if (paymentId) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('asaas_payment_id', paymentId)
        .single();
      order = data;
    } else if (orderId) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      order = data;
    }

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, error: 'Pedido não encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check Asaas payment status
    const response = await fetch(
      `https://api.asaas.com/v3/payments/${order.asaas_payment_id}`,
      {
        method: 'GET',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const paymentData = await response.json();

    if (!response.ok) {
      throw new Error('Erro ao consultar pagamento');
    }

    const isPaid = paymentData.status === 'CONFIRMED' || paymentData.status === 'RECEIVED';

    console.log('[confirm-order-payment] Payment status:', paymentData.status, 'isPaid:', isPaid);

    // Try to get PIX QR Code if not paid yet
    let pixQrCode = null;
    let pixCopyPaste = null;

    if (!isPaid) {
      try {
        const pixResponse = await fetch(
          `https://api.asaas.com/v3/payments/${order.asaas_payment_id}/pixQrCode`,
          {
            method: 'GET',
            headers: {
              'access_token': asaasApiKey,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (pixResponse.ok) {
          const pixData = await pixResponse.json();
          pixQrCode = pixData?.encodedImage || null;
          pixCopyPaste = pixData?.payload || null;
        }
      } catch (e) {
        console.warn('[confirm-order-payment] PIX fetch error:', e);
      }
    }

    // Update order status if paid
    if (isPaid && order.payment_status !== 'paid') {
      console.log('[confirm-order-payment] Updating order to paid');
      
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // Update plate_query status
      await supabase
        .from('plate_queries')
        .update({ status: 'paid_confirmed' })
        .eq('id', order.plate_query_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentData.status,
        isPaid,
        orderId: order.id,
        publicAccessToken: order.public_access_token,
        pixQrCode,
        pixCopyPaste,
        invoiceUrl: paymentData?.invoiceUrl || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[confirm-order-payment] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao verificar pagamento',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
