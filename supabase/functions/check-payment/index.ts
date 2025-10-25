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

    const isPaid = paymentData.status === 'CONFIRMED' || paymentData.status === 'RECEIVED';

    // Busca informações do pagamento no banco
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .select('report_id, plan_type')
      .eq('asaas_payment_id', paymentId)
      .single();

    if (paymentError) {
      console.error('[check-payment] Erro ao buscar pagamento:', paymentError);
    }

    // Atualiza status no banco
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: isPaid ? 'paid' : 'pending',
        payment_data: paymentData,
      })
      .eq('asaas_payment_id', paymentId);

    if (updateError) {
      console.error('[check-payment] Erro ao atualizar banco:', updateError);
    }

    // Se o pagamento foi confirmado e ainda não temos um relatório completo, gera agora
    if (isPaid && paymentRecord?.report_id && paymentRecord?.plan_type) {
      console.log('[check-payment] Pagamento confirmado! Gerando relatório completo...');
      
      // Busca o relatório existente para pegar a placa
      const { data: report } = await supabase
        .from('vehicle_reports')
        .select('plate')
        .eq('id', paymentRecord.report_id)
        .single();

      if (report?.plate) {
        try {
          // Chama o vehicle-report para gerar relatório completo
          const { data: newReport, error: reportError } = await supabase.functions.invoke('vehicle-report', {
            body: { 
              plate: report.plate,
              planType: paymentRecord.plan_type
            }
          });

          if (reportError) {
            console.error('[check-payment] Erro ao gerar relatório completo:', reportError);
          } else if (newReport?.success) {
            console.log('[check-payment] Relatório completo gerado com sucesso');
            
            // Atualiza o report_id no pagamento para o novo relatório
            await supabase
              .from('payments')
              .update({ report_id: newReport.reportId })
              .eq('asaas_payment_id', paymentId);
          }
        } catch (e) {
          console.error('[check-payment] Exceção ao gerar relatório:', e);
        }
      }
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
