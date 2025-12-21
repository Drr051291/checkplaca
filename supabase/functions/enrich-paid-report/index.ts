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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, publicAccessToken } = await req.json();

    console.log('[enrich-paid-report] Enriching report for orderId:', orderId);

    // Find order by ID or publicAccessToken
    let orderQuery = supabase.from('orders').select('*');
    
    if (orderId) {
      orderQuery = orderQuery.eq('id', orderId);
    } else if (publicAccessToken) {
      orderQuery = orderQuery.eq('public_access_token', publicAccessToken);
    } else {
      throw new Error('orderId ou publicAccessToken é obrigatório');
    }

    const { data: order, error: orderError } = await orderQuery.single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: 'Pedido não encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Verify payment is confirmed
    if (order.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ success: false, error: 'Pagamento ainda não confirmado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
      );
    }

    // Get plate_query
    const { data: plateQuery, error: pqError } = await supabase
      .from('plate_queries')
      .select('*')
      .eq('id', order.plate_query_id)
      .single();

    if (pqError || !plateQuery) {
      throw new Error('Consulta de placa não encontrada');
    }

    // Check if already enriched
    const { data: existingEnrichment } = await supabase
      .from('enrichments')
      .select('*')
      .eq('plate_query_id', plateQuery.id)
      .maybeSingle();

    if (existingEnrichment?.enriched_at) {
      console.log('[enrich-paid-report] Already enriched, returning cached data');
      
      // Build and return full report from cached data
      const fullReport = buildFullReport(plateQuery, existingEnrichment);
      
      return new Response(
        JSON.stringify({
          success: true,
          report: fullReport,
          cached: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[enrich-paid-report] Fetching FIPE and RENAINF...');

    // Get API credentials
    const apiKey = Deno.env.get('CONSULTAR_PLACA_API_KEY')?.trim();
    const apiEmail = Deno.env.get('CONSULTAR_PLACA_EMAIL')?.trim();
    
    if (!apiKey || !apiEmail) {
      throw new Error('Credenciais da API não configuradas');
    }

    const credentials = `${apiEmail}:${apiKey}`;
    const encodedCredentials = btoa(unescape(encodeURIComponent(credentials)));
    const basicAuth = `Basic ${encodedCredentials}`;

    // Call FIPE endpoint
    let fipeRaw = null;
    try {
      console.log('[enrich-paid-report] Calling FIPE API...');
      const fipeResponse = await fetch(
        `https://api.consultarplaca.com.br/v2/consultarPrecoFipe?placa=${encodeURIComponent(plateQuery.placa)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': basicAuth,
            'Accept': 'application/json',
          },
        }
      );

      if (fipeResponse.ok) {
        fipeRaw = await fipeResponse.json();
        console.log('[enrich-paid-report] FIPE response received');
      } else {
        console.warn('[enrich-paid-report] FIPE API error:', fipeResponse.status);
      }
    } catch (e) {
      console.error('[enrich-paid-report] FIPE fetch error:', e);
    }

    // Call RENAINF endpoint
    let renainfRaw = null;
    try {
      console.log('[enrich-paid-report] Calling RENAINF API...');
      const renainfResponse = await fetch(
        `https://api.consultarplaca.com.br/v2/consultarRegistrosInfracoesRenainf?placa=${encodeURIComponent(plateQuery.placa)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': basicAuth,
            'Accept': 'application/json',
          },
        }
      );

      if (renainfResponse.ok) {
        renainfRaw = await renainfResponse.json();
        console.log('[enrich-paid-report] RENAINF response received');
      } else {
        console.warn('[enrich-paid-report] RENAINF API error:', renainfResponse.status);
      }
    } catch (e) {
      console.error('[enrich-paid-report] RENAINF fetch error:', e);
    }

    // Save enrichment
    const enrichmentData = {
      plate_query_id: plateQuery.id,
      fipe_raw: fipeRaw,
      renainf_raw: renainfRaw,
      fipe_cost_cents: 450,
      renainf_cost_cents: 99,
      enriched_at: new Date().toISOString(),
    };

    if (existingEnrichment) {
      await supabase
        .from('enrichments')
        .update(enrichmentData)
        .eq('id', existingEnrichment.id);
    } else {
      await supabase
        .from('enrichments')
        .insert(enrichmentData);
    }

    // Update order total cost: 37 (basic) + 450 (FIPE) + 99 (RENAINF) = 586
    const totalCostCents = 37 + 450 + 99;
    await supabase
      .from('orders')
      .update({ provider_total_cost_cents: totalCostCents })
      .eq('id', order.id);

    // Update plate_query status
    await supabase
      .from('plate_queries')
      .update({ status: 'enriched' })
      .eq('id', plateQuery.id);

    console.log('[enrich-paid-report] Enrichment complete. Total cost:', totalCostCents, 'cents');

    // Build full report
    const fullReport = buildFullReport(plateQuery, {
      fipe_raw: fipeRaw,
      renainf_raw: renainfRaw,
    });

    return new Response(
      JSON.stringify({
        success: true,
        report: fullReport,
        cached: false,
        providerTotalCostCents: totalCostCents,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[enrich-paid-report] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao enriquecer relatório',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function buildFullReport(plateQuery: any, enrichment: any) {
  const basicRaw = plateQuery.basic_raw || {};
  const dados = basicRaw.dados || {};
  const infoVeiculo = dados.informacoes_veiculo || {};
  const dadosVeiculo = infoVeiculo.dados_veiculo || {};
  const dadosTecnicos = infoVeiculo.dados_tecnicos || {};
  const dadosCarga = infoVeiculo.dados_carga || {};

  // Parse FIPE data
  const fipeData = parseFipeData(enrichment.fipe_raw, dadosVeiculo.modelo);
  
  // Parse RENAINF data
  const renainfData = parseRenainfData(enrichment.renainf_raw);

  return {
    placa: plateQuery.placa,
    preview: plateQuery.preview,
    vehicleInfo: {
      marca: dadosVeiculo.marca || 'N/D',
      modelo: dadosVeiculo.modelo || 'N/D',
      marca_modelo: `${dadosVeiculo.marca || ''} ${dadosVeiculo.modelo || ''}`.trim() || 'N/D',
      ano_fabricacao: dadosVeiculo.ano_fabricacao,
      ano_modelo: dadosVeiculo.ano_modelo,
      chassi: dadosVeiculo.chassi,
      cor: dadosVeiculo.cor,
      combustivel: dadosVeiculo.combustivel,
      tipo_veiculo: dadosVeiculo.tipo_veiculo,
      segmento: dadosVeiculo.segmento,
      procedencia: dadosVeiculo.procedencia,
      municipio: dadosVeiculo.municipio,
      uf: dadosVeiculo.uf_municipio || dadosVeiculo.uf,
      renavam: dadosVeiculo.renavam,
    },
    dadosTecnicos: {
      tipo_veiculo: dadosTecnicos.tipo_veiculo,
      sub_segmento: dadosTecnicos.sub_segmento,
      numero_motor: dadosTecnicos.numero_motor,
      numero_caixa_cambio: dadosTecnicos.numero_caixa_cambio,
      potencia: dadosTecnicos.potencia,
      cilindradas: dadosTecnicos.cilindradas,
    },
    dadosCarga: {
      numero_eixos: dadosCarga.numero_eixos,
      capacidade_maxima_tracao: dadosCarga.capacidade_maxima_tracao,
      capacidade_passageiro: dadosCarga.capacidade_passageiro,
      peso_bruto_total: dadosCarga.peso_bruto_total,
    },
    fipe: fipeData,
    renainf: renainfData,
    isPaid: true,
    enrichedAt: new Date().toISOString(),
  };
}

function parseFipeData(fipeRaw: any, vehicleModelo: string) {
  if (!fipeRaw || fipeRaw.status !== 'ok') {
    return {
      found: false,
      message: 'Não foi possível localizar um preço FIPE para esta combinação. Isso pode acontecer quando há divergência de versão/modelo. Se quiser, tente novamente mais tarde.',
    };
  }

  const dados = fipeRaw.dados || {};
  const informacoesFipe = dados.informacoes_fipe || [];
  
  if (!informacoesFipe.length) {
    return {
      found: false,
      message: 'Não foi possível localizar um preço FIPE para esta combinação.',
    };
  }

  // Find most likely version by comparing with vehicle modelo
  let mostLikelyVersion = informacoesFipe[0];
  const modeloLower = (vehicleModelo || '').toLowerCase();
  
  for (const version of informacoesFipe) {
    const versionModelo = (version.modelo_versao || '').toLowerCase();
    if (versionModelo.includes(modeloLower) || modeloLower.includes(versionModelo.split(' ')[0])) {
      mostLikelyVersion = version;
      break;
    }
  }

  // Calculate price range
  const prices = informacoesFipe
    .map((v: any) => parseFloat((v.preco || '0').replace(/[^\d,]/g, '').replace(',', '.')))
    .filter((p: number) => p > 0);
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    found: true,
    mesReferencia: mostLikelyVersion.mes_referencia,
    versaoMaisProvavel: {
      modelo: mostLikelyVersion.modelo_versao,
      preco: mostLikelyVersion.preco,
      codigoFipe: mostLikelyVersion.codigo_fipe,
    },
    faixaPreco: prices.length > 1 ? {
      min: minPrice,
      max: maxPrice,
      minFormatted: formatBRL(minPrice),
      maxFormatted: formatBRL(maxPrice),
    } : null,
    todasVersoes: informacoesFipe.map((v: any) => ({
      modelo: v.modelo_versao,
      preco: v.preco,
      codigoFipe: v.codigo_fipe,
      combustivel: v.combustivel,
    })),
    explicacao: 'A Tabela FIPE é uma referência de mercado. O valor pode variar conforme versão, estado de conservação, quilometragem e região. Use este preço como base para negociação, seguro e avaliação.',
  };
}

function parseRenainfData(renainfRaw: any) {
  if (!renainfRaw || renainfRaw.status !== 'ok') {
    return {
      found: false,
      possuiInfracoes: false,
      infracoes: [],
      message: 'Não foi possível consultar débitos por infrações.',
    };
  }

  const dados = renainfRaw.dados || {};
  const registroRenainf = dados.registro_debitos_por_infracoes_renainf || {};
  const possuiInfracoes = registroRenainf.possui_infracoes === 'sim';
  const infracoesRenainf = registroRenainf.infracoes_renainf || {};
  const infracoesList = infracoesRenainf.infracoes || [];

  return {
    found: true,
    possuiInfracoes,
    infracoes: infracoesList.map((inf: any) => ({
      descricao: inf.descricao,
      numeroAuto: inf.numero_auto,
      valor: inf.valor,
      orgaoAutuador: inf.orgao_autuador,
      dataHora: inf.data_hora,
      localMunicipio: inf.local_municipio,
    })),
    aviso: 'IMPORTANTE: as infrações listadas podem ou não já terem sido pagas. Para confirmação, verifique junto ao órgão autuador.',
  };
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
