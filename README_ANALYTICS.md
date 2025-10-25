# Guia de Configuração do DataLayer - Checkplaca

Este documento explica como configurar e usar o sistema de analytics implementado no Checkplaca para rastreamento de eventos em GA4, Google Ads e Meta Ads.

## 📊 Estrutura Implementada

O projeto possui um sistema completo de DataLayer que envia eventos de e-commerce para:
- **Google Analytics 4 (GA4)**
- **Google Ads**
- **Meta Ads (Facebook Pixel)**

## 🔧 Configuração Inicial

### 1. Google Tag Manager (GTM)

No arquivo `index.html`, substitua `GTM-XXXXXXX` pelo seu ID do Google Tag Manager:

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-SEU-ID-AQUI');</script>
```

**Como encontrar seu GTM ID:**
1. Acesse [Google Tag Manager](https://tagmanager.google.com)
2. Crie um container para seu site
3. Copie o ID (formato: GTM-XXXXXXX)

### 2. Meta Pixel (Facebook)

No arquivo `index.html`, substitua `YOUR_PIXEL_ID` pelo seu Pixel ID:

```javascript
fbq('init', 'SEU_PIXEL_ID_AQUI');
```

**Como encontrar seu Pixel ID:**
1. Acesse [Meta Events Manager](https://business.facebook.com/events_manager)
2. Crie um Pixel
3. Copie o Pixel ID (número de 15 dígitos)

### 3. Google Ads Conversion ID

No arquivo `src/lib/analytics.ts`, substitua os placeholders:

```typescript
// Linha ~75
gtag('event', 'view_item', {
  send_to: 'AW-SEU_CONVERSION_ID', // Substitua aqui
  value: product.price,
  items: [product],
});

// Linha ~138
gtag('event', 'conversion', {
  send_to: 'AW-SEU_CONVERSION_ID/SEU_CONVERSION_LABEL', // Substitua aqui
  value: purchaseData.value,
  currency: purchaseData.currency,
  transaction_id: purchaseData.transaction_id,
});
```

**Como encontrar seus Conversion IDs:**
1. Acesse [Google Ads](https://ads.google.com)
2. Vá em Ferramentas > Medição > Conversões
3. Crie ações de conversão
4. Copie os IDs no formato `AW-XXXXXXXXXX/XXXXXXXX`

## 📈 Eventos Rastreados

### 1. **page_view** (Visualização de Página)
- **Quando:** Em cada mudança de página
- **Onde:** Automático via GTM
- **Dados:** URL, título da página

### 2. **search** (Busca de Placa)
- **Quando:** Usuário busca uma placa
- **Arquivo:** `src/components/HeroSection.tsx`
- **Dados:** Termo de busca (placa)

### 3. **view_item** (Visualização de Produto)
- **Quando:** Usuário visualiza um plano
- **Arquivo:** `src/components/PlansSection.tsx`
- **Dados:** 
  - Nome do produto
  - Preço
  - Categoria
  - Variante

### 4. **begin_checkout** (Início do Checkout)
- **Quando:** Usuário acessa página de checkout
- **Arquivo:** `src/pages/Checkout.tsx`
- **Dados:**
  - Produto selecionado
  - Valor total
  - Moeda (BRL)

### 5. **generate_lead** (Geração de Lead)
- **Quando:** Usuário preenche formulário de checkout
- **Arquivo:** `src/pages/Checkout.tsx`
- **Dados:** Email e telefone

### 6. **add_payment_info** (Informações de Pagamento)
- **Quando:** Usuário escolhe método de pagamento
- **Arquivo:** `src/pages/Checkout.tsx`
- **Dados:**
  - Método de pagamento (PIX/Cartão)
  - Produto
  - Valor

### 7. **pix_generated** (PIX Gerado) - Evento Customizado
- **Quando:** QR Code PIX é gerado
- **Arquivo:** `src/pages/Checkout.tsx`
- **Dados:**
  - Valor
  - ID do pagamento

### 8. **purchase** (Compra Finalizada) ⭐
- **Quando:** Pagamento é confirmado
- **Arquivo:** `src/hooks/usePaymentTracking.ts`
- **Dados:**
  - ID da transação
  - Valor total
  - Itens comprados
  - Email do cliente
  - Método de pagamento

## 🎯 Como Funciona o Rastreamento de Compras

O rastreamento de compras funciona em tempo real através de:

1. **Realtime Database Subscription**: Hook `usePaymentTracking` monitora mudanças na tabela `payments`
2. **Detecção Automática**: Quando status muda para `paid`, evento `purchase` é disparado
3. **Dados Completos**: Inclui transaction_id, valor, produtos e dados do cliente

## 📋 Estrutura do DataLayer

Todos os eventos seguem o padrão Enhanced E-commerce do GA4:

```javascript
{
  event: 'purchase',
  ecommerce: {
    transaction_id: 'ASS_12345',
    value: 19.90,
    currency: 'BRL',
    items: [{
      item_id: 'plan_completo',
      item_name: 'Relatório Completo',
      price: 19.90,
      quantity: 1,
      item_category: 'Relatório Veicular',
      item_variant: 'Completo'
    }]
  }
}
```

## 🔍 Debugging

Para verificar se os eventos estão sendo enviados:

### No Browser:
1. Abra o Console (F12)
2. Digite: `dataLayer`
3. Veja todos os eventos enviados

### GA4 DebugView:
1. Instale [GA4 Debug Mode](https://chrome.google.com/webstore/detail/google-analytics-debugger)
2. Acesse seu site
3. Vá em GA4 > Configure > DebugView

### Meta Pixel Helper:
1. Instale [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper)
2. Acesse seu site
3. Clique no ícone da extensão

## 🎨 Personalização

### Adicionar Novos Eventos

1. Crie a função em `src/lib/analytics.ts`:
```typescript
export const trackCustomEvent = (eventName: string, data: any) => {
  pushToDataLayer({
    event: eventName,
    ...data
  });
  
  fbq('trackCustom', eventName, data);
};
```

2. Importe e use no componente:
```typescript
import { trackCustomEvent } from '@/lib/analytics';

trackCustomEvent('meu_evento', { 
  parametro1: 'valor1' 
});
```

## ⚠️ Importante

- **GDPR/LGPD**: Implemente um banner de cookies antes de ativar tracking
- **Testes**: Teste todos os eventos antes de colocar em produção
- **Conversões**: Configure metas de conversão no GA4 e Google Ads
- **Catalogo**: No Meta Ads, crie um catálogo de produtos para melhor rastreamento

## 📞 Suporte

Para dúvidas sobre implementação:
- [Documentação GA4](https://support.google.com/analytics/answer/9304153)
- [Documentação GTM](https://support.google.com/tagmanager)
- [Documentação Meta Pixel](https://developers.facebook.com/docs/meta-pixel)
- [Google Ads Conversions](https://support.google.com/google-ads/answer/6095821)

## ✅ Checklist de Configuração

- [ ] Substituir GTM ID no `index.html`
- [ ] Substituir Meta Pixel ID no `index.html`
- [ ] Substituir Google Ads Conversion ID em `src/lib/analytics.ts`
- [ ] Criar Pixel no Meta Events Manager
- [ ] Criar Container no Google Tag Manager
- [ ] Criar Conversões no Google Ads
- [ ] Configurar GA4 no GTM
- [ ] Testar todos os eventos
- [ ] Implementar banner de cookies (LGPD)
- [ ] Ativar modo de produção

---

**Versão:** 1.0  
**Última atualização:** 2024
