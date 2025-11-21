import { supabase } from "@/integrations/supabase/client";

export async function generateAndSetFavicon() {
  try {
    console.log('Requesting favicon generation...');
    
    const { data, error } = await supabase.functions.invoke('generate-favicon', {
      body: {}
    });

    if (error) {
      console.error('Error generating favicon:', error);
      return false;
    }

    if (data?.success && data?.imageUrl) {
      console.log('Favicon generated, creating blob...');
      
      // Extract base64 data from data URL
      const base64Data = data.imageUrl.split(',')[1];
      const binaryData = atob(base64Data);
      const arrayBuffer = new Uint8Array(binaryData.length);
      
      for (let i = 0; i < binaryData.length; i++) {
        arrayBuffer[i] = binaryData.charCodeAt(i);
      }
      
      const blob = new Blob([arrayBuffer], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      
      // Update favicon in DOM
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = url;
      
      if (!document.querySelector("link[rel*='icon']")) {
        document.head.appendChild(link);
      }
      
      console.log('Favicon updated successfully!');
      
      // Download the favicon for manual saving
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicon.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      return true;
    }

    return false;
  } catch (err) {
    console.error('Exception generating favicon:', err);
    return false;
  }
}
