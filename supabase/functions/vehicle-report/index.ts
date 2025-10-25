import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    // Make authentication optional. If a token is provided, try to read the user; otherwise continue as anonymous
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    let userId: string | null = null;
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const supabaseClient = createClient(
          supabaseUrl,
          supabaseAnonKey,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabaseClient.auth.getUser();
        userId = user?.id ?? null;
      }
    } catch (_) {
      // ignore auth errors to keep the endpoint public
      userId = null;
    }

    const { plate } = await req.json();
    
    // Validate Brazilian plate format
    const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanPlate.length !== 7) {
      throw new Error('Placa deve ter 7 caracteres');
    }
    
    // Check for valid Brazilian plate formats (ABC1234 or ABC1D23)
    const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
    const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    if (!oldFormat.test(cleanPlate) && !mercosulFormat.test(cleanPlate)) {
      throw new Error('Formato de placa inválido. Use ABC1234 ou ABC1D23');
    }

    console.log('[vehicle-report] Processing request, user:', userId ?? 'anonymous', 'plate:', cleanPlate);

    const apiKey = Deno.env.get('CONSULTAR_PLACA_API_KEY');
    const apiEmail = Deno.env.get('CONSULTAR_PLACA_EMAIL');

    if (!apiKey || !apiEmail) {
      throw new Error('API credentials not configured');
    }

    const authString = btoa(`${apiEmail}:${apiKey}`);
    
    const response = await fetch(
      `https://api.consultarplaca.com.br/consultas/placa/${cleanPlate}`,
      {
        headers: {
          'Authorization': `Basic ${authString}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[vehicle-report] API error:', response.status, errorText);
      throw new Error(`Erro ao consultar placa: ${response.status}`);
    }

    const vehicleInfo = await response.json();

    const reportData = {
      basic: {
        plate: cleanPlate,
        brand: vehicleInfo?.marca || '',
        model: vehicleInfo?.modelo || '',
        year: vehicleInfo?.ano || '',
        color: vehicleInfo?.cor || '',
      },
      details: vehicleInfo,
    };

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: report, error: insertError } = await supabase
      .from('vehicle_reports')
      .insert({
        plate: cleanPlate,
        report_data: reportData,
        user_id: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[vehicle-report] Insert error:', insertError);
      throw insertError;
    }

    console.log('[vehicle-report] Report created successfully:', report.id);

    return new Response(
      JSON.stringify({
        success: true,
        reportId: report.id,
        data: reportData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[vehicle-report] Error:', error);
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
