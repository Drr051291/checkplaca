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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reportId } = await req.json();
    if (!reportId) {
      return new Response(JSON.stringify({ success: false, error: 'reportId é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[report-access] Verificando acesso para relatório:', reportId);

    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, plan_type, amount, payment_method, status, report_id')
      .eq('report_id', reportId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[report-access] Erro ao consultar pagamentos:', error);
    }

    const hasAccess = !!payment;

    return new Response(
      JSON.stringify({
        success: true,
        hasAccess,
        planType: payment?.plan_type || null,
        amount: payment?.amount || null,
        paymentMethod: payment?.payment_method || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[report-access] Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});