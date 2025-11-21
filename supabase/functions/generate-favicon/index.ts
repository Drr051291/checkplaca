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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating favicon for Checkplaca...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: "Create a modern, minimalist favicon icon for 'Checkplaca', a Brazilian vehicle license plate lookup service. The icon should be: 32x32 pixels, simple and recognizable at small sizes, featuring a stylized Brazilian license plate or a checkmark combined with a plate element, using a blue-cyan gradient color scheme (#4F46E5 to #06B6D4), clean vector style with a white or transparent background, professional and trustworthy appearance. The design should work well as a small browser favicon."
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Gateway response received');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    console.log('Favicon generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: imageUrl
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {
    console.error('Error generating favicon:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error?.message || 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
