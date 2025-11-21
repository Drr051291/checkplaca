import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('CONSULTAR_PLACA_API_KEY')?.trim();
    const apiEmail = Deno.env.get('CONSULTAR_PLACA_EMAIL')?.trim();
    
    if (!apiKey || !apiEmail) {
      throw new Error('Credenciais da Consultar Placa não configuradas');
    }

    // Autenticação Basic
    const credentials = `${apiEmail}:${apiKey}`;
    const encodedCredentials = btoa(unescape(encodeURIComponent(credentials)));
    const basicAuth = `Basic ${encodedCredentials}`;

    console.log('Consultando saldo da API Consultar Placa...');

    // Endpoint para consultar saldo
    const balanceResponse = await fetch(
      'https://api.consultarplaca.com.br/v2/consultarSaldo',
      {
        method: 'GET',
        headers: {
          'Authorization': basicAuth,
          'Accept': 'application/json',
        },
      }
    );

    if (!balanceResponse.ok) {
      const errorText = await balanceResponse.text();
      let message = `Erro ao consultar saldo: ${balanceResponse.status}`;
      try {
        const maybeJson = JSON.parse(errorText);
        if (maybeJson?.mensagem) message = maybeJson.mensagem;
        if (maybeJson?.error) message = maybeJson.error;
      } catch {}
      console.error('Erro ao consultar saldo:', message);
      throw new Error(message);
    }

    const balanceData = await balanceResponse.json();
    console.log('Resposta de saldo:', JSON.stringify(balanceData));

    // A API pode retornar o saldo em diferentes formatos
    // Vamos extrair o saldo disponível
    const saldo = balanceData.saldo || balanceData.creditos || balanceData.valor || 0;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        saldo: parseFloat(saldo),
        dados: balanceData,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro na função check-balance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        saldo: 0,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
