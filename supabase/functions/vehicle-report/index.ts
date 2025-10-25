import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plate } = await req.json();
    
    if (!plate || plate.length !== 7) {
      throw new Error('Placa inválida. Deve conter 7 caracteres.');
    }

    console.log('Consultando veículo na API Consultar Placa:', plate);

    const apiKey = Deno.env.get('CONSULTAR_PLACA_API_KEY')?.trim();
    const apiEmail = Deno.env.get('CONSULTAR_PLACA_EMAIL')?.trim();
    if (!apiKey || !apiEmail) {
      throw new Error('Credenciais da Consultar Placa não configuradas (email e api key)');
    }

    console.log('API Key configurada:', 'Sim');
    console.log('Email configurado:', 'Sim');
    console.log('Tamanho da API Key:', apiKey.length);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Solicitando relatório...');

    // Autenticação Basic: email:apiKey (conforme documentação)
    const credentials = `${apiEmail}:${apiKey}`;
    // Encode credentials safely even if email has non-ASCII chars
    const encodedCredentials = btoa(unescape(encodeURIComponent(credentials)));
    const basicAuth = `Basic ${encodedCredentials}`;

    // Consulta direta por placa
    console.log('Chamando endpoint consultarPlaca...');
    const consultaResponse = await fetch(`https://api.consultarplaca.com.br/v2/consultarPlaca?placa=${encodeURIComponent(plate)}` , {
      method: 'GET',
      headers: {
        'Authorization': basicAuth,
        'Accept': 'application/json',
      },
    });

    if (!consultaResponse.ok) {
      const errorText = await consultaResponse.text();
      let message = `Erro ao consultar placa: ${consultaResponse.status}`;
      try {
        const maybeJson = JSON.parse(errorText);
        if (maybeJson?.mensagem) message = maybeJson.mensagem;
        if (maybeJson?.error) message = maybeJson.error;
      } catch {}
      console.error('Erro ao consultar placa:', message);
      return new Response(
        JSON.stringify({ success: false, error: message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: consultaResponse.status }
      );
    }

    const consultaData = await consultaResponse.json();
    console.log('Resposta da consulta:', JSON.stringify(consultaData));

    if (consultaData.status !== 'ok') {
      throw new Error(consultaData.mensagem || 'Erro na consulta de placa');
    }

    // Extrair dados do veículo conforme estrutura da documentação
    const dados = consultaData.dados || {};
    
    // A API pode retornar dados como array ou objeto
    const dadosArray = Array.isArray(dados) ? dados : [dados];
    
    // Extrair informações do veículo
    const infoVeiculoObj = dadosArray.find(d => d.informacoes_veiculo) || {};
    const infoVeiculo = infoVeiculoObj.informacoes_veiculo || dados.informacoes_veiculo || {};
    const dadosVeiculo = infoVeiculo.dados_veiculo || {};
    const dadosTecnicos = infoVeiculo.dados_tecnicos || {};
    const dadosCarga = infoVeiculo.dados_carga || {};
    
    // Extrair informações de leilão e sinistros
    const leilaoObj = dadosArray.find(d => d.informacoes_sobre_leilao) || {};
    const leilaoInfo = leilaoObj.informacoes_sobre_leilao || dados.leilao || {};
    const registroLeiloes = leilaoInfo.registro_leiloes || {};
    const registroSinistros = leilaoInfo.registro_sinistros_acidentes || {};
    const registroOferta = leilaoInfo.registro_sobre_oferta || {};
    
    // Extrair débitos do DETRAN
    const detranObj = dadosArray.find(d => d.informacoes_do_detran) || {};
    const detranInfo = detranObj.informacoes_do_detran || dados.debitos || {};
    const debitosDetran = detranInfo.debitos_detran || {};
    const restricoesDetran = detranInfo.restricoes_detran || {};
    
    // Extrair RENAINF
    const renainf = dadosArray.find(d => d.registro_debitos_por_infracoes_renainf) || {};
    const renainfInfo = renainf.registro_debitos_por_infracoes_renainf || {};
    const infracoesRenainf = renainfInfo.infracoes_renainf || {};
    
    // Extrair histórico de roubo e furto
    const rouboFurtoObj = dadosArray.find(d => d.historico_roubo_furto) || {};
    const rouboFurtoInfo = rouboFurtoObj.historico_roubo_furto || {};
    const registrosRouboFurto = rouboFurtoInfo.registros_roubo_furto || {};
    
    // Extrair recalls (se existir)
    const recalls = dados.recalls || [];
    
    // Extrair histórico de proprietários (se existir)
    const historicoProprietarios = dados.historico_proprietarios || {};
    
    console.log('Dados de leilão:', JSON.stringify(leilaoInfo));
    console.log('Dados de sinistros:', JSON.stringify(registroSinistros));
    console.log('Débitos DETRAN encontrados:', JSON.stringify(debitosDetran));
    console.log('RENAINF encontrado:', JSON.stringify(infracoesRenainf));
    console.log('Restrições DETRAN:', JSON.stringify(restricoesDetran));
    console.log('Roubo e Furto:', JSON.stringify(registrosRouboFurto));
    console.log('Recalls encontrados:', recalls.length);
    
    // Consolidar dados do relatório
    const reportData = {
      plate,
      vehicleInfo: {
        marca_modelo: dadosVeiculo.marca || dadosVeiculo.marca_modelo || dadosVeiculo.modelo,
        ano_fabricacao: dadosVeiculo.ano_fabricacao,
        ano_modelo: dadosVeiculo.ano_modelo,
        chassi: dadosVeiculo.chassi,
        placa: dadosVeiculo.placa || plate,
        renavam: detranInfo.numero_renavam || dadosVeiculo.renavam,
        cor: dadosVeiculo.cor,
        combustivel: dadosVeiculo.combustivel,
        categoria: dadosVeiculo.tipo_veiculo || dadosVeiculo.categoria,
        segmento: dadosVeiculo.segmento,
        procedencia: dadosVeiculo.procedencia,
        municipio: dadosVeiculo.municipio,
        uf: dadosVeiculo.uf_municipio || dadosVeiculo.uf,
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
      leilao: {
        possui_registro: leilaoInfo.possui_registro === 'sim',
        classificacao: registroOferta.classificacao,
        dicionario_classificacoes: registroOferta.dicionario_classificacoes,
        historico: registroLeiloes.registros || [],
      },
      sinistros: {
        possui_registro: registroSinistros.possui_registro === 'sim',
      },
      debitos: {
        ipva: {
          possui_debito: debitosDetran.debitos_ipva?.possui_debido === 'sim',
          valor: debitosDetran.debitos_ipva?.debido || 0,
        },
        licenciamento: {
          possui_debito: debitosDetran.debitos_licenciamento?.possui_debido === 'sim',
          valor: debitosDetran.debitos_licenciamento?.debido || 0,
        },
        multas: {
          possui_debito: debitosDetran.debitos_multa?.possui_debido === 'sim',
          valor: debitosDetran.debitos_multa?.debido || 0,
        },
        dpvat: {
          possui_debito: debitosDetran.debitos_dpvat?.possui_debido === 'sim',
          valor: debitosDetran.debitos_dpvat?.debido || 0,
        },
        municipais: {
          possui_debito: debitosDetran.debitos_municipais?.possui_debido === 'sim',
          valor: debitosDetran.debitos_municipais?.debido || 0,
        },
      },
      restricoes: {
        situacao_veiculo: restricoesDetran.situacao_veiculo,
        remarcacao_chassi: restricoesDetran.remarcacao_chassi,
        furto: {
          possui_restricao: restricoesDetran.restricao_furto?.possui_restricao === 'sim',
          restricao: restricoesDetran.restricao_furto?.restricao,
          descricao: restricoesDetran.restricao_furto?.descricao,
        },
        guincho: {
          possui_restricao: restricoesDetran.restricao_guincho?.possui_restricao === 'sim',
          restricao: restricoesDetran.restricao_guincho?.restricao,
          descricao: restricoesDetran.restricao_guincho?.descricao,
        },
        administrativa: {
          possui_restricao: restricoesDetran.restricao_administrativa?.possui_restricao === 'sim',
          restricao: restricoesDetran.restricao_administrativa?.restricao,
          descricao: restricoesDetran.restricao_administrativa?.descricao,
        },
        judicial: {
          possui_restricao: restricoesDetran.restricao_judicial?.possui_restricao === 'sim',
          restricao: restricoesDetran.restricao_judicial?.restricao,
          descricao: restricoesDetran.restricao_judicial?.descricao,
        },
        tributaria: {
          possui_restricao: restricoesDetran.restricao_tributaria?.possui_restricao === 'sim',
          restricao: restricoesDetran.restricao_tributaria?.restricao,
          descricao: restricoesDetran.restricao_tributaria?.descricao,
        },
        renajud: {
          possui_restricao: restricoesDetran.restricao_judicial_renajud?.possui_restricao === 'sim',
          restricao: restricoesDetran.restricao_judicial_renajud?.restricao,
          descricao: restricoesDetran.restricao_judicial_renajud?.descricao,
        },
        outras: {
          possui_restricao: restricoesDetran.outras_restricoes?.possui_restricao === 'sim',
          restricoes: restricoesDetran.outras_restricoes?.restricoes || [],
        },
        comunicacao_venda: {
          possui_comunicacao: restricoesDetran.comunicacao_venda?.possui_comunicacao === 'sim',
          comunicacao: restricoesDetran.comunicacao_venda?.comunicacao,
          descricao: restricoesDetran.comunicacao_venda?.descricao,
        },
      },
      rouboFurto: {
        possui_registro: registrosRouboFurto.possui_registro === 'sim',
        registros: registrosRouboFurto.registros || [],
      },
      renainf: {
        possui_infracoes: infracoesRenainf.possui_infracoes === 'sim',
        infracoes: infracoesRenainf.infracoes || [],
      },
      recalls: recalls,
      historico_proprietarios: historicoProprietarios,
      consultedAt: new Date().toISOString(),
      raw: consultaData,
    };

    console.log('Dados consolidados:', JSON.stringify(reportData));

    // Salvar no banco de dados
    const { data: savedReport, error: saveError } = await supabase
      .from('vehicle_reports')
      .insert({
        plate,
        report_data: reportData,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Erro ao salvar relatório:', saveError);
      throw saveError;
    }

    console.log('Relatório salvo com sucesso:', savedReport.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportId: savedReport.id,
        data: reportData,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao processar consulta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});