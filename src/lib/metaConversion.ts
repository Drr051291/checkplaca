import { supabase } from '@/integrations/supabase/client';

// Generate unique event ID for deduplication
export function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get fbp and fbc cookies
export function getMetaCookies() {
  const cookies = document.cookie.split(';');
  let fbp = '';
  let fbc = '';
  
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbp') fbp = value;
    if (name === '_fbc') fbc = value;
  });
  
  return { fbp, fbc };
}

interface MetaConversionParams {
  eventName: string;
  eventId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: string;
  contentName?: string;
}

export async function sendMetaConversion(params: MetaConversionParams) {
  try {
    const { fbp, fbc } = getMetaCookies();
    
    const eventData = {
      event_name: params.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId,
      event_source_url: window.location.href,
      action_source: 'website',
      user_data: {
        email: params.email,
        phone: params.phone,
        firstName: params.firstName,
        lastName: params.lastName,
        clientIpAddress: '', // Will be filled by server
        clientUserAgent: navigator.userAgent,
        fbp: fbp || undefined,
        fbc: fbc || undefined,
      },
      custom_data: params.value ? {
        currency: params.currency || 'BRL',
        value: params.value,
        content_ids: params.contentIds,
        content_type: params.contentType,
        content_name: params.contentName,
      } : undefined,
    };

    console.log('[Meta Conversion] Sending event:', params.eventName, 'ID:', params.eventId);

    const { data, error } = await supabase.functions.invoke('meta-conversion', {
      body: eventData,
    });

    if (error) {
      console.error('[Meta Conversion] Error:', error);
      return { success: false, error };
    }

    console.log('[Meta Conversion] Success:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[Meta Conversion] Exception:', error);
    return { success: false, error };
  }
}
