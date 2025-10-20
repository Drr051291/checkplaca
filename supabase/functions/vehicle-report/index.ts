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

    const apiKey = Deno.env.get('CONSULTAR_PLACA_API_KEY');
    if (!apiKey) {
      throw new Error('Chave da API Consultar Placa não configurada');
    }

    console.log('API Key configurada:', apiKey ? 'Sim' : 'Não');
    console.log('Tamanho da API Key:', apiKey?.length || 0);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Solicitando relatório...');

    // Criar FormData para a requisição
    const formData = new FormData();
    formData.append('placa', plate);
    formData.append('tipo_consulta', 'bronze');

    // Solicitar relatório
    const solicitarResponse = await fetch('https://api.consultarplaca.com.br/v2/solicitarRelatorio', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${apiKey}:`)}`,
      },
      body: formData,
    });

    if (!solicitarResponse.ok) {
      const errorText = await solicitarResponse.text();
      console.error('Erro ao solicitar relatório:', errorText);
      throw new Error(`Erro ao solicitar relatório: ${solicitarResponse.status}`);
    }

    const solicitarData = await solicitarResponse.json();
    console.log('Resposta da solicitação:', JSON.stringify(solicitarData));

    if (solicitarData.status !== 'ok') {
      throw new Error(solicitarData.mensagem || 'Erro ao solicitar relatório');
    }

    const protocolo = solicitarData.protocolo;
    console.log('Protocolo gerado:', protocolo);

    // Aguardar um pouco antes de consultar o protocolo
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Consultar resultado do protocolo
    console.log('Consultando resultado do protocolo...');
    const resultadoResponse = await fetch(`https://api.consultarplaca.com.br/v2/consultarProtocolo?protocolo=${protocolo}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${apiKey}:`)}`,
      },
    });

    if (!resultadoResponse.ok) {
      const errorText = await resultadoResponse.text();
      console.error('Erro ao consultar protocolo:', errorText);
      throw new Error(`Erro ao consultar protocolo: ${resultadoResponse.status}`);
    }

    const resultadoData = await resultadoResponse.json();
    console.log('Resultado da consulta:', JSON.stringify(resultadoData));

    if (resultadoData.status !== 'ok') {
      throw new Error(resultadoData.mensagem || 'Erro ao consultar dados do veículo');
    }

    // Extrair dados do veículo
    const dadosVeiculo = resultadoData.dados || {};
    
    // Consolidar dados do relatório
    const reportData = {
      plate,
      vehicleInfo: {
        marca_modelo: dadosVeiculo.MARCA_MODELO || dadosVeiculo.marca_modelo,
        ano_fabricacao: dadosVeiculo.ANO_FABRICACAO || dadosVeiculo.ano_fabricacao,
        ano_modelo: dadosVeiculo.ANO_MODELO || dadosVeiculo.ano_modelo,
        chassi: dadosVeiculo.CHASSI || dadosVeiculo.chassi,
        placa: dadosVeiculo.PLACA || dadosVeiculo.placa || plate,
        renavam: dadosVeiculo.RENAVAM || dadosVeiculo.renavam,
        cor: dadosVeiculo.COR || dadosVeiculo.cor,
        combustivel: dadosVeiculo.COMBUSTIVEL || dadosVeiculo.combustivel,
        categoria: dadosVeiculo.CATEGORIA || dadosVeiculo.categoria,
        municipio: dadosVeiculo.MUNICIPIO || dadosVeiculo.municipio,
        uf: dadosVeiculo.UF || dadosVeiculo.uf,
      },
      restricoes: dadosVeiculo.restricoes || [],
      recalls: dadosVeiculo.recalls || [],
      consultedAt: new Date().toISOString(),
      protocolo: protocolo,
      raw: resultadoData,
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