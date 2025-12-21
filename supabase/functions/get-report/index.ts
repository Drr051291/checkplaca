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

    const { plateQueryId, publicAccessToken } = await req.json();

    console.log('[get-report] Request:', { plateQueryId, publicAccessToken: !!publicAccessToken });

    // Determine access type
    let isPaid = false;
    let order = null;
    let plateQuery = null;

    if (publicAccessToken) {
      // Paid access via token
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('public_access_token', publicAccessToken)
        .single();

      if (orderError || !orderData) {
        return new Response(
          JSON.stringify({ success: false, error: 'Token de acesso inválido' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      order = orderData;
      isPaid = order.payment_status === 'paid';

      // Get plate query
      const { data: pqData } = await supabase
        .from('plate_queries')
        .select('*')
        .eq('id', order.plate_query_id)
        .single();

      plateQuery = pqData;
    } else if (plateQueryId) {
      // Free preview access
      const { data: pqData, error: pqError } = await supabase
        .from('plate_queries')
        .select('*')
        .eq('id', plateQueryId)
        .single();

      if (pqError || !pqData) {
        return new Response(
          JSON.stringify({ success: false, error: 'Consulta não encontrada' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      plateQuery = pqData;

      // Check if there's a paid order for this plate query
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('plate_query_id', plateQueryId)
        .eq('payment_status', 'paid')
        .maybeSingle();

      if (orderData) {
        order = orderData;
        isPaid = true;
      }
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'plateQueryId ou publicAccessToken é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!plateQuery) {
      return new Response(
        JSON.stringify({ success: false, error: 'Dados da consulta não encontrados' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Free preview: return only preview data
    if (!isPaid) {
      console.log('[get-report] Returning free preview');
      return new Response(
        JSON.stringify({
          success: true,
          isPaid: false,
          plateQueryId: plateQuery.id,
          placa: plateQuery.placa,
          preview: plateQuery.preview,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Paid access: check if enriched
    console.log('[get-report] Paid access, checking enrichment');

    const { data: enrichment } = await supabase
      .from('enrichments')
      .select('*')
      .eq('plate_query_id', plateQuery.id)
      .maybeSingle();

    if (!enrichment || !enrichment.enriched_at) {
      // Need to enrich first
      console.log('[get-report] Not yet enriched, triggering enrichment...');
      
      // Call enrich function
      const { data: enrichResult, error: enrichError } = await supabase.functions.invoke('enrich-paid-report', {
        body: { orderId: order.id }
      });

      if (enrichError || !enrichResult?.success) {
        console.error('[get-report] Enrichment failed:', enrichError || enrichResult?.error);
        // Return basic paid data without enrichment
        return new Response(
          JSON.stringify({
            success: true,
            isPaid: true,
            plateQueryId: plateQuery.id,
            placa: plateQuery.placa,
            report: buildBasicPaidReport(plateQuery),
            enrichmentPending: true,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          isPaid: true,
          plateQueryId: plateQuery.id,
          placa: plateQuery.placa,
          report: enrichResult.report,
          publicAccessToken: order.public_access_token,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return enriched report
    console.log('[get-report] Returning enriched report');
    const fullReport = buildFullReport(plateQuery, enrichment);

    return new Response(
      JSON.stringify({
        success: true,
        isPaid: true,
        plateQueryId: plateQuery.id,
        placa: plateQuery.placa,
        report: fullReport,
        publicAccessToken: order.public_access_token,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[get-report] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao buscar relatório',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function buildBasicPaidReport(plateQuery: any) {
  const basicRaw = plateQuery.basic_raw || {};
  const dados = basicRaw.dados || {};
  const infoVeiculo = dados.informacoes_veiculo || {};
  const dadosVeiculo = infoVeiculo.dados_veiculo || {};
  const dadosTecnicos = infoVeiculo.dados_tecnicos || {};
  const dadosCarga = infoVeiculo.dados_carga || {};

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
    isPaid: true,
    fipe: null,
    renainf: null,
  };
}

function buildFullReport(plateQuery: any, enrichment: any) {
  const basicRaw = plateQuery.basic_raw || {};
  const dados = basicRaw.dados || {};
  const infoVeiculo = dados.informacoes_veiculo || {};
  const dadosVeiculo = infoVeiculo.dados_veiculo || {};
  const dadosTecnicos = infoVeiculo.dados_tecnicos || {};
  const dadosCarga = infoVeiculo.dados_carga || {};

  // Parse FIPE
  const fipeData = parseFipeData(enrichment.fipe_raw, dadosVeiculo.modelo);
  
  // Parse RENAINF
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
    enrichedAt: enrichment.enriched_at,
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

  let mostLikelyVersion = informacoesFipe[0];
  const modeloLower = (vehicleModelo || '').toLowerCase();
  
  for (const version of informacoesFipe) {
    const versionModelo = (version.modelo_versao || '').toLowerCase();
    if (versionModelo.includes(modeloLower) || modeloLower.includes(versionModelo.split(' ')[0])) {
      mostLikelyVersion = version;
      break;
    }
  }

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
