import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID');
const META_ACCESS_TOKEN = Deno.env.get('META_CONVERSIONS_API_TOKEN');
const META_API_VERSION = 'v18.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

interface CustomData {
  currency?: string;
  value?: number;
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
}

interface MetaEventData {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: string;
  user_data: UserData;
  custom_data?: CustomData;
}

// Hash function for sensitive data (SHA256)
async function hashData(data: string): Promise<string> {
  if (!data) return '';
  
  // Normalize: lowercase and trim
  const normalized = data.toLowerCase().trim();
  
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

// Prepare user data with hashing
async function prepareUserData(userData: UserData): Promise<any> {
  const hashedData: any = {};
  
  if (userData.email) {
    hashedData.em = [await hashData(userData.email)];
  }
  
  if (userData.phone) {
    // Remove non-numeric characters before hashing
    const cleanPhone = userData.phone.replace(/\D/g, '');
    hashedData.ph = [await hashData(cleanPhone)];
  }
  
  if (userData.firstName) {
    hashedData.fn = [await hashData(userData.firstName)];
  }
  
  if (userData.lastName) {
    hashedData.ln = [await hashData(userData.lastName)];
  }
  
  if (userData.city) {
    hashedData.ct = [await hashData(userData.city)];
  }
  
  if (userData.state) {
    hashedData.st = [await hashData(userData.state)];
  }
  
  if (userData.zipCode) {
    hashedData.zp = [await hashData(userData.zipCode)];
  }
  
  if (userData.country) {
    hashedData.country = [await hashData(userData.country)];
  }
  
  // These should NOT be hashed
  if (userData.clientIpAddress) {
    hashedData.client_ip_address = userData.clientIpAddress;
  }
  
  if (userData.clientUserAgent) {
    hashedData.client_user_agent = userData.clientUserAgent;
  }
  
  if (userData.fbc) {
    hashedData.fbc = userData.fbc;
  }
  
  if (userData.fbp) {
    hashedData.fbp = userData.fbp;
  }
  
  return hashedData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Meta Conversion API] Request received');
    
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      throw new Error('Meta Pixel ID or Access Token not configured');
    }

    const eventData: MetaEventData = await req.json();
    
    console.log('[Meta Conversion API] Event:', eventData.event_name, 'ID:', eventData.event_id);

    // Prepare user data with hashing
    const hashedUserData = await prepareUserData(eventData.user_data);

    // Build the payload
    const payload = {
      data: [
        {
          event_name: eventData.event_name,
          event_time: eventData.event_time,
          event_id: eventData.event_id,
          event_source_url: eventData.event_source_url,
          action_source: eventData.action_source,
          user_data: hashedUserData,
          ...(eventData.custom_data && { custom_data: eventData.custom_data }),
        },
      ],
    };

    console.log('[Meta Conversion API] Sending payload to Meta');

    // Send to Meta Conversions API
    const metaUrl = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;
    
    const response = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Meta Conversion API] Error from Meta:', result);
      throw new Error(`Meta API error: ${JSON.stringify(result)}`);
    }

    console.log('[Meta Conversion API] Success:', result);

    return new Response(
      JSON.stringify({
        success: true,
        event_id: eventData.event_id,
        meta_response: result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Meta Conversion API] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
