import { useEffect, useState } from 'react';

interface TrackingParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
}

const STORAGE_KEY = 'tracking_params';
const EXPIRY_HOURS = 24;

export const useTrackingParams = () => {
  const [trackingParams, setTrackingParams] = useState<TrackingParams | null>(null);

  useEffect(() => {
    // Captura os parâmetros da URL atual
    const urlParams = new URLSearchParams(window.location.search);
    const currentParams: TrackingParams = {};

    // Captura UTM params
    const utm_source = urlParams.get('utm_source');
    const utm_medium = urlParams.get('utm_medium');
    const utm_campaign = urlParams.get('utm_campaign');
    const utm_term = urlParams.get('utm_term');
    const utm_content = urlParams.get('utm_content');

    if (utm_source) currentParams.utm_source = utm_source;
    if (utm_medium) currentParams.utm_medium = utm_medium;
    if (utm_campaign) currentParams.utm_campaign = utm_campaign;
    if (utm_term) currentParams.utm_term = utm_term;
    if (utm_content) currentParams.utm_content = utm_content;

    // Captura referrer
    if (document.referrer && !document.referrer.includes(window.location.hostname)) {
      currentParams.referrer = document.referrer;
    }

    // Captura landing page
    currentParams.landing_page = window.location.pathname + window.location.search;

    // Se há novos parâmetros, salva no localStorage com timestamp
    if (Object.keys(currentParams).length > 0) {
      const dataToStore = {
        params: currentParams,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      setTrackingParams(currentParams);
      console.log('[Tracking] Parâmetros salvos:', currentParams);
    } else {
      // Tenta recuperar do localStorage se existir e não estiver expirado
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        try {
          const { params, timestamp } = JSON.parse(storedData);
          const now = new Date().getTime();
          const hoursPassed = (now - timestamp) / (1000 * 60 * 60);

          if (hoursPassed < EXPIRY_HOURS) {
            setTrackingParams(params);
            console.log('[Tracking] Parâmetros recuperados do cache:', params);
          } else {
            localStorage.removeItem(STORAGE_KEY);
            console.log('[Tracking] Cache expirado, removido');
          }
        } catch (e) {
          console.error('[Tracking] Erro ao recuperar parâmetros:', e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  const clearTrackingParams = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTrackingParams(null);
  };

  return { trackingParams, clearTrackingParams };
};

export const getStoredTrackingParams = (): TrackingParams | null => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) return null;

  try {
    const { params, timestamp } = JSON.parse(storedData);
    const now = new Date().getTime();
    const hoursPassed = (now - timestamp) / (1000 * 60 * 60);

    if (hoursPassed < EXPIRY_HOURS) {
      return params;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  } catch (e) {
    console.error('[Tracking] Erro ao recuperar parâmetros:', e);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};
