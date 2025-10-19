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

    console.log('Consultando veículo:', plate);

    const infosimplesToken = Deno.env.get('INFOSIMPLES_API_TOKEN');
    if (!infosimplesToken) {
      throw new Error('Token da Infosimples não configurado');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Consultas principais da API Infosimples
    const consultaUrls = {
      detran: 'https://api.infosimples.com/api/v2/consultas/detran-restricoes',
      leilao: 'https://api.infosimples.com/api/v2/consultas/leilao-veiculo',
      recall: 'https://api.infosimples.com/api/v2/consultas/recall-veiculo',
    };

    console.log('Realizando consultas na API Infosimples...');

    // Realizar consultas em paralelo
    const [leilaoResponse, recallResponse] = await Promise.allSettled([
      fetch(consultaUrls.leilao, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: infosimplesToken,
          placa: plate,
          timeout: 300,
        }),
      }),
      fetch(consultaUrls.recall, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: infosimplesToken,
          placa: plate,
          timeout: 300,
        }),
      }),
    ]);

    // Processar respostas
    const leilaoData = leilaoResponse.status === 'fulfilled' ? await leilaoResponse.value.json() : null;
    const recallData = recallResponse.status === 'fulfilled' ? await recallResponse.value.json() : null;

    console.log('Consultas concluídas. Processando dados...');
    console.log('Leilao response:', JSON.stringify(leilaoData));
    console.log('Recall response:', JSON.stringify(recallData));

    // Consolidar dados do relatório
    const reportData = {
      plate,
      vehicleInfo: null, // Will be populated from leilao or recall data
      leilao: leilaoData?.data || null,
      recall: recallData?.data || null,
      consultedAt: new Date().toISOString(),
      raw: {
        leilao: leilaoData,
        recall: recallData,
      },
    };

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