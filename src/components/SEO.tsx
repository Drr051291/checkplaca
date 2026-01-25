import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  schema?: object | object[];
  children?: React.ReactNode;
}

const BASE_URL = "https://checkplaca.lovable.app";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

export const SEO = ({
  title = "Consultar Placa de Veículo | Checkplaca - Relatório Completo",
  description = "Consulte a placa de qualquer veículo e obtenha relatório completo com IPVA, multas, débitos, sinistros, tabela FIPE e histórico. Resultado imediato e seguro.",
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  noIndex = false,
  schema,
  children,
}: SEOProps) => {
  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  
  // Ensure title is under 60 chars for SEO
  const seoTitle = title.length > 60 ? title.substring(0, 57) + "..." : title;
  
  // Ensure description is under 160 chars
  const seoDescription = description.length > 160 ? description.substring(0, 157) + "..." : description;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Checkplaca" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(schema) ? schema : [schema])}
        </script>
      )}
      
      {children}
    </Helmet>
  );
};

// Pre-built schemas
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Checkplaca",
  "url": BASE_URL,
  "logo": `${BASE_URL}/favicon.ico`,
  "description": "Serviço de consulta veicular com relatórios completos de veículos. Consulte IPVA, multas, débitos, sinistros, tabela FIPE e histórico.",
  "foundingDate": "2024",
  "areaServed": {
    "@type": "Country",
    "name": "Brasil"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "Portuguese"
  },
  "sameAs": []
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Checkplaca",
  "url": BASE_URL,
  "description": "Consulte a placa de qualquer veículo e obtenha relatório completo",
  "inLanguage": "pt-BR",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/?placa={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Consulta Veicular",
  "name": "Relatório Completo de Veículo",
  "description": "Relatório completo com dados do veículo, tabela FIPE, histórico de roubo/furto, leilão, gravames e recalls",
  "provider": {
    "@type": "Organization",
    "name": "Checkplaca"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Brasil"
  },
  "offers": {
    "@type": "Offer",
    "price": "17.90",
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock"
  }
};

export const createFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const createHowToSchema = (steps: string[]) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Como consultar a placa de um veículo",
  "description": "Passo a passo para consultar informações de qualquer veículo pela placa",
  "step": steps.map((text, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "text": text
  }))
});

export const createBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});
