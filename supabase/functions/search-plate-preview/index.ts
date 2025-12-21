import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate plate format: AAA9999 (old) or AAA9A99 (Mercosul)
function isValidPlate(plate: string): boolean {
  const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
  const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  return oldFormat.test(plate) || mercosulFormat.test(plate);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { placa } = await req.json();
    
    // Normalize plate
    const normalizedPlate = (placa || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (!normalizedPlate || normalizedPlate.length !== 7) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Placa inválida. Deve conter 7 caracteres.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!isValidPlate(normalizedPlate)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Formato de placa inválido. Use AAA1234 ou AAA1A23.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('[search-plate-preview] Consultando placa:', normalizedPlate);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache: look for existing plate_query in last 24 hours
    const cacheThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: cachedQuery, error: cacheError } = await supabase
      .from('plate_queries')
      .select('*')
      .eq('placa', normalizedPlate)
      .gte('created_at', cacheThreshold)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cachedQuery && !cacheError) {
      console.log('[search-plate-preview] Cache HIT:', cachedQuery.id);
      return new Response(
        JSON.stringify({
          success: true,
          plateQueryId: cachedQuery.id,
          preview: cachedQuery.preview,
          cached: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[search-plate-preview] Cache MISS, calling API...');

    // Get API credentials
    const apiKey = Deno.env.get('CONSULTAR_PLACA_API_KEY')?.trim();
    const apiEmail = Deno.env.get('CONSULTAR_PLACA_EMAIL')?.trim();
    
    if (!apiKey || !apiEmail) {
      throw new Error('Credenciais da API não configuradas');
    }

    // Basic auth
    const credentials = `${apiEmail}:${apiKey}`;
    const encodedCredentials = btoa(unescape(encodeURIComponent(credentials)));
    const basicAuth = `Basic ${encodedCredentials}`;

    // Call consultarPlaca API ONCE
    const response = await fetch(
      `https://api.consultarplaca.com.br/v2/consultarPlaca?placa=${encodeURIComponent(normalizedPlate)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': basicAuth,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[search-plate-preview] API error:', response.status, errorText);
      let message = `Erro ao consultar placa: ${response.status}`;
      try {
        const maybeJson = JSON.parse(errorText);
        if (maybeJson?.mensagem) message = maybeJson.mensagem;
        if (maybeJson?.error) message = maybeJson.error;
      } catch {}
      return new Response(
        JSON.stringify({ success: false, error: message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const basicData = await response.json();
    console.log('[search-plate-preview] API response status:', basicData.status);

    if (basicData.status !== 'ok') {
      throw new Error(basicData.mensagem || 'Erro na consulta de placa');
    }

    // Extract preview data (only 4 fields)
    const dados = basicData.dados || {};
    const infoVeiculo = dados.informacoes_veiculo || {};
    const dadosVeiculo = infoVeiculo.dados_veiculo || {};

    // Build preview object
    const marca = dadosVeiculo.marca || 'N/D';
    const modelo = dadosVeiculo.modelo || 'N/D';
    
    // Build ano string: prefer ano_modelo, fallback to ano_fabricacao, or FAB/MOD if both exist
    let ano = 'N/D';
    const anoFab = dadosVeiculo.ano_fabricacao;
    const anoMod = dadosVeiculo.ano_modelo;
    if (anoFab && anoMod && anoFab !== anoMod) {
      ano = `${anoFab}/${anoMod}`;
    } else if (anoMod) {
      ano = String(anoMod);
    } else if (anoFab) {
      ano = String(anoFab);
    }
    
    const cor = dadosVeiculo.cor || 'N/D';

    const preview = {
      marca,
      modelo,
      ano,
      cor,
    };

    console.log('[search-plate-preview] Preview built:', preview);

    // Save to database
    const { data: savedQuery, error: saveError } = await supabase
      .from('plate_queries')
      .insert({
        placa: normalizedPlate,
        preview,
        basic_raw: basicData, // Store full response server-side only
        basic_cost_cents: 37,
        status: 'preview_ready',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('[search-plate-preview] DB save error:', saveError);
      throw saveError;
    }

    console.log('[search-plate-preview] Saved plate_query:', savedQuery.id);

    // Return only preview data (NOT the full basic_raw)
    return new Response(
      JSON.stringify({
        success: true,
        plateQueryId: savedQuery.id,
        preview,
        cached: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[search-plate-preview] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao processar consulta',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
