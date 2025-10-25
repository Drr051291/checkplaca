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
    const infoVeiculo = dados.informacoes_veiculo || {};
    const dadosVeiculo = infoVeiculo.dados_veiculo || {};
    
    // Extrair informações de leilão
    const leilao = dados.leilao || {};
    const historicoLeiloes = leilao.historico || [];
    
    console.log('Dados de leilão encontrados:', JSON.stringify(leilao));
    
    // Consolidar dados do relatório
    const reportData = {
      plate,
      vehicleInfo: {
        marca_modelo: dadosVeiculo.marca || dadosVeiculo.marca_modelo || dadosVeiculo.modelo,
        ano_fabricacao: dadosVeiculo.ano_fabricacao,
        ano_modelo: dadosVeiculo.ano_modelo,
        chassi: dadosVeiculo.chassi,
        placa: dadosVeiculo.placa || plate,
        renavam: dadosVeiculo.renavam,
        cor: dadosVeiculo.cor,
        combustivel: dadosVeiculo.combustivel,
        categoria: dadosVeiculo.tipo_veiculo || dadosVeiculo.categoria,
        municipio: dadosVeiculo.municipio,
        uf: dadosVeiculo.uf_municipio || dadosVeiculo.uf,
      },
      leilao: {
        tem_historico: historicoLeiloes.length > 0,
        historico: historicoLeiloes,
        detalhes: leilao.detalhes || null,
      },
      restricoes: [],
      recalls: [],
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