// Analytics & DataLayer Service
// Sends events to GA4, Google Ads, and Meta Ads

export interface ProductData {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  item_variant?: string;
}

export interface PurchaseData {
  transaction_id: string;
  value: number;
  currency: string;
  items: ProductData[];
  customer_email?: string;
  customer_phone?: string;
  payment_method?: string;
}

// Initialize dataLayer if it doesn't exist
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

// GTM/GA4 Event Helper
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// Push to dataLayer
export const pushToDataLayer = (event: any) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
    console.log('[Analytics] Event pushed to dataLayer:', event);
  }
};

// Meta Pixel Helper
export const fbq = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
};

// ===== E-COMMERCE EVENTS =====

/**
 * Evento: Visualização de Página
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  // GA4
  pushToDataLayer({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });

  // Meta Pixel
  fbq('track', 'PageView');
};

/**
 * Evento: Visualização de Produto/Plano
 * Dispara quando usuário visualiza um plano
 */
export const trackViewItem = (product: ProductData) => {
  // GA4 - Enhanced E-commerce
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: 'BRL',
      value: product.price,
      items: [product],
    },
  });

  // Google Ads
  gtag('event', 'view_item', {
    send_to: 'AW-17745350051',
    value: product.price,
    items: [product],
  });

  // Meta Pixel
  fbq('track', 'ViewContent', {
    content_name: product.item_name,
    content_ids: [product.item_id],
    content_type: 'product',
    value: product.price,
    currency: 'BRL',
  });
};

/**
 * Evento: Início do Checkout
 * Dispara quando usuário inicia o processo de checkout
 */
export const trackBeginCheckout = (product: ProductData) => {
  // GA4
  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'BRL',
      value: product.price,
      items: [product],
    },
  });

  // Google Ads
  gtag('event', 'begin_checkout', {
    send_to: 'AW-17745350051',
    value: product.price,
    items: [product],
  });

  // Meta Pixel
  fbq('track', 'InitiateCheckout', {
    content_name: product.item_name,
    content_ids: [product.item_id],
    content_type: 'product',
    value: product.price,
    currency: 'BRL',
    num_items: 1,
  });
};

/**
 * Evento: Informações de Pagamento Adicionadas
 * Dispara quando usuário escolhe método de pagamento
 */
export const trackAddPaymentInfo = (product: ProductData, paymentMethod: string) => {
  // GA4
  pushToDataLayer({
    event: 'add_payment_info',
    ecommerce: {
      currency: 'BRL',
      value: product.price,
      payment_type: paymentMethod,
      items: [product],
    },
  });

  // Meta Pixel
  fbq('track', 'AddPaymentInfo', {
    content_name: product.item_name,
    content_ids: [product.item_id],
    value: product.price,
    currency: 'BRL',
  });
};

/**
 * Evento: Compra Finalizada
 * Dispara quando pagamento é confirmado
 */
export const trackPurchase = (purchaseData: PurchaseData) => {
  // GA4 - Enhanced E-commerce
  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: purchaseData.transaction_id,
      value: purchaseData.value,
      currency: purchaseData.currency,
      items: purchaseData.items,
    },
  });

  // Google Ads - Purchase Event
  gtag('event', 'purchase', {
    transaction_id: purchaseData.transaction_id,
    value: purchaseData.value,
    currency: purchaseData.currency,
    items: purchaseData.items,
  });

  // Google Ads - Conversion
  gtag('event', 'conversion', {
    send_to: 'AW-17745350051',
    value: purchaseData.value,
    currency: purchaseData.currency,
    transaction_id: purchaseData.transaction_id,
  });

  // Meta Pixel - Purchase
  fbq('track', 'Purchase', {
    content_ids: purchaseData.items.map(item => item.item_id),
    content_type: 'product',
    value: purchaseData.value,
    currency: purchaseData.currency,
    num_items: purchaseData.items.reduce((sum, item) => sum + item.quantity, 0),
  });
};

/**
 * Evento: Busca de Placa
 * Evento customizado para rastrear buscas
 */
export const trackSearch = (plate: string) => {
  // GA4 - DataLayer
  pushToDataLayer({
    event: 'search',
    search_term: plate,
  });

  // GA4 - gtag
  gtag('event', 'search', {
    search_term: plate,
  });

  // Meta Pixel - Search
  fbq('track', 'Search', {
    search_string: plate,
  });
};

/**
 * Evento: Lead (Formulário preenchido)
 * Dispara quando usuário preenche dados no checkout
 */
export const trackLead = (email: string, phone?: string) => {
  // GA4 - DataLayer
  pushToDataLayer({
    event: 'generate_lead',
    value: 0,
  });

  // GA4 - gtag
  gtag('event', 'generate_lead', {
    value: 0,
  });

  // Meta Pixel
  fbq('track', 'Lead', {
    content_name: 'Checkout Form',
  });
};

/**
 * Evento: Geração de Pagamento PIX
 * Evento customizado para rastrear quando PIX é gerado
 */
export const trackPixGenerated = (value: number, paymentId: string) => {
  // GA4 - DataLayer
  pushToDataLayer({
    event: 'pix_generated',
    value: value,
    currency: 'BRL',
    payment_id: paymentId,
  });

  // GA4 - gtag
  gtag('event', 'pix_generated', {
    value: value,
    currency: 'BRL',
    payment_id: paymentId,
  });

  // Meta Pixel
  fbq('trackCustom', 'PixGenerated', {
    value: value,
    currency: 'BRL',
  });
};

// Helper: Criar objeto de produto a partir dos planos
export const createProductData = (
  planType: 'completo' | 'premium',
  plate?: string
): ProductData => {
  const plans = {
    completo: {
      item_id: 'plan_completo',
      item_name: 'Relatório Completo',
      price: 19.90,
      item_category: 'Relatório Veicular',
      item_variant: 'Completo',
    },
    premium: {
      item_id: 'plan_premium',
      item_name: 'Relatório Premium Plus',
      price: 39.90,
      item_category: 'Relatório Veicular',
      item_variant: 'Premium',
    },
  };

  return {
    ...plans[planType],
    quantity: 1,
  };
};
