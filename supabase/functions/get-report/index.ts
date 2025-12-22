import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Robust price parsing utility
function parsePriceToNumber(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  
  if (typeof input === 'number') {
    return isNaN(input) ? null : input;
  }
  
  if (typeof input === 'string') {
    let cleaned = input.trim();
    if (!cleaned) return null;
    
    // Remove currency symbols and spaces
    cleaned = cleaned.replace(/R\$\s*/gi, '').trim();
    
    // Handle different formats:
    // "43208.00" (dot decimal - API format)
    // "43.208,00" (pt-BR format with thousand separator)
    // "130,16" (comma decimal)
    
    const hasDot = cleaned.includes('.');
    const hasComma = cleaned.includes(',');
    
    let numericValue: number;
    
    if (hasDot && hasComma) {
      // Both present: "43.208,00" -> pt-BR format, dot is thousand separator
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      numericValue = parseFloat(cleaned);
    } else if (hasComma && !hasDot) {
      // Only comma: "130,16" -> comma is decimal separator
      cleaned = cleaned.replace(',', '.');
      numericValue = parseFloat(cleaned);
    } else {
      // Only dot or no separator: "43208.00" or "43208"
      numericValue = parseFloat(cleaned);
    }
    
    return isNaN(numericValue) ? null : numericValue;
  }
  
  return null;
}

// Format number as BRL currency
function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/D';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Format month reference from "2025_04" to "04/2025"
function formatMesReferencia(mesRef: string | null | undefined): string {
  if (!mesRef) return 'N/D';
  const parts = mesRef.split('_');
  if (parts.length === 2) {
    return `${parts[1]}/${parts[0]}`;
  }
  return mesRef;
}

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
      message: 'Não foi possível localizar um preço FIPE para esta combinação. Isso pode ocorrer quando há divergência de versão/modelo. Tente novamente mais tarde.',
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

  // Parse prices correctly using the robust parser
  const validVersions: Array<{ version: any; price: number }> = [];
  
  for (const v of informacoesFipe) {
    const price = parsePriceToNumber(v.preco);
    if (price !== null && price > 0) {
      validVersions.push({ version: v, price });
    }
  }

  const prices = validVersions.map(v => v.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  // Parse the most likely version price
  const mainPrice = parsePriceToNumber(mostLikelyVersion.preco);

  // Build explanation text
  const multipleVersions = informacoesFipe.length > 1;
  let explicacao = 'A Tabela FIPE é uma referência média de mercado e não representa um preço final de compra/venda. ';
  explicacao += 'O valor pode variar conforme versão/itens, estado de conservação, quilometragem, região e histórico do veículo. ';
  explicacao += 'Use como base para negociação, seguro e avaliação — e compare com anúncios na sua cidade.';
  
  if (multipleVersions) {
    explicacao += ' Encontramos mais de uma versão compatível; por isso mostramos a faixa e destacamos a mais provável.';
  }

  return {
    found: true,
    mesReferencia: formatMesReferencia(mostLikelyVersion.mes_referencia),
    versaoMaisProvavel: {
      modelo: mostLikelyVersion.modelo_versao,
      preco: mainPrice,
      precoFormatted: formatBRL(mainPrice),
      codigoFipe: mostLikelyVersion.codigo_fipe,
    },
    faixaPreco: (minPrice !== null && maxPrice !== null && prices.length > 1) ? {
      min: minPrice,
      max: maxPrice,
      minFormatted: formatBRL(minPrice),
      maxFormatted: formatBRL(maxPrice),
    } : null,
    todasVersoes: informacoesFipe.map((v: any) => {
      const price = parsePriceToNumber(v.preco);
      return {
        modelo: v.modelo_versao,
        preco: price,
        precoFormatted: formatBRL(price),
        codigoFipe: v.codigo_fipe,
        combustivel: v.combustivel,
      };
    }),
    explicacao,
    multipleVersions,
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
    infracoes: infracoesList.map((inf: any) => {
      const valorNumerico = parsePriceToNumber(inf.valor_aplicado || inf.valor);
      return {
        descricao: inf.descricao,
        numeroAuto: inf.numero_auto,
        valor: valorNumerico,
        valorFormatted: formatBRL(valorNumerico),
        orgaoAutuador: inf.orgao_autuador,
        dataHora: inf.data_hora,
        localMunicipio: inf.local_municipio,
      };
    }),
    aviso: 'IMPORTANTE: as infrações listadas podem ou não já terem sido pagas. Para confirmação, verifique junto ao órgão autuador.',
  };
}
