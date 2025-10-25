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

    const { paymentId } = await req.json();

    console.log('[check-payment] Verificando pagamento:', paymentId);

    // Busca status no Asaas
    const response = await fetch(
      `https://api.asaas.com/v3/payments/${paymentId}`,
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

    // Tenta obter o QR Code e payload do PIX
    let pixQrCode: string | null = null;
    let payload: string | null = null;
    try {
      const pixResp = await fetch(`https://api.asaas.com/v3/payments/${paymentId}/pixQrCode`, {
        method: 'GET',
        headers: {
          'access_token': asaasApiKey,
          'Content-Type': 'application/json',
        },
      });
      const pixData = await pixResp.json();
      if (pixResp.ok) {
        pixQrCode = pixData?.encodedImage || null;
        payload = pixData?.payload || null;
      }
    } catch (e) {
      console.warn('[check-payment] Não foi possível obter PIX:', e);
    }

    // Atualiza status no banco
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentData.status === 'CONFIRMED' || paymentData.status === 'RECEIVED' ? 'paid' : 'pending',
        payment_data: paymentData,
      })
      .eq('asaas_payment_id', paymentId);

    if (updateError) {
      console.error('[check-payment] Erro ao atualizar banco:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentData.status,
        isPaid: paymentData.status === 'CONFIRMED' || paymentData.status === 'RECEIVED',
        pixQrCode,
        payload,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[check-payment] Erro:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
