import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/HeroSection";
import { ReportExampleSection } from "@/components/ReportExampleSection";
import { IncludedSection } from "@/components/IncludedSection";
import { LatestBlogPosts } from "@/components/LatestBlogPosts";
import { FAQ } from "@/components/cro/FAQ";
import { useTrackingParams } from "@/hooks/useTrackingParams";
import { SEO, organizationSchema, websiteSchema, serviceSchema } from "@/components/SEO";

const Index = () => {
  const navigate = useNavigate();
  
  // Captura parâmetros de rastreamento (UTM, referrer, etc.)
  useTrackingParams();

  // Combined schemas for the home page
  const homeSchemas = [
    organizationSchema,
    websiteSchema,
    serviceSchema
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Consultar Placa de Veículo | Checkplaca"
        description="Consulte a placa de qualquer veículo e obtenha relatório completo com IPVA, multas, débitos, sinistros, tabela FIPE e histórico. Resultado imediato e seguro."
        canonical="/"
        schema={homeSchemas}
      />

      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
              Checkplaca
            </span>
            <nav className="flex items-center gap-3 sm:gap-6" aria-label="Navegação principal">
              <a 
                href="#inicio" 
                className="hidden sm:inline text-sm font-medium hover:text-primary transition-smooth"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Início
              </a>
              <a 
                href="#exemplo-relatorio" 
                className="hidden md:inline text-sm font-medium hover:text-primary transition-smooth"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('exemplo-relatorio')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Ver exemplo
              </a>
              <a 
                href="/blog" 
                className="text-sm font-medium hover:text-primary transition-smooth"
              >
                Blog
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Included Section */}
        <IncludedSection />

        {/* Report Example Section */}
        <section id="exemplo-relatorio" aria-labelledby="exemplo-titulo">
          <ReportExampleSection />
        </section>

        {/* Latest Blog Posts */}
        <LatestBlogPosts />

        {/* FAQ Section */}
        <section id="faq" className="py-12 sm:py-16 lg:py-20 bg-muted/30" aria-labelledby="faq-titulo">
          <div className="container mx-auto px-4 max-w-3xl">
            <FAQ />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-hero text-primary-foreground" aria-labelledby="cta-titulo">
          <div className="container mx-auto px-4 text-center">
            <h2 id="cta-titulo" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Consulte seu veículo agora
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto px-4">
              Busca básica gratuita ou relatório completo por apenas R$ 17,90
            </p>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-semibold shadow-strong hover:scale-105 transition-smooth"
            >
              Consultar placa gratuitamente
            </Button>
            <p className="text-xs sm:text-sm mt-3 sm:mt-4 opacity-75">
              ✓ Sem cadastro ✓ Resultado imediato ✓ Dados públicos disponíveis
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-12 bg-background" role="contentinfo">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="font-bold mb-4 bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
                Checkplaca
              </h3>
              <p className="text-sm text-muted-foreground">
                Consulta veicular com dados públicos disponíveis. Relatórios completos para compra segura de veículos usados.
              </p>
            </div>
            <nav aria-label="Links institucionais">
              <h4 className="font-semibold mb-4">Institucional</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Sobre nós</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Como funciona</a></li>
                <li><a href="#faq" className="hover:text-primary transition-smooth">Dúvidas frequentes</a></li>
                <li><a href="/blog" className="hover:text-primary transition-smooth">Blog</a></li>
              </ul>
            </nav>
            <nav aria-label="Links de suporte">
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Contato</a></li>
                <li><a href="#faq" className="hover:text-primary transition-smooth">FAQ</a></li>
              </ul>
            </nav>
            <nav aria-label="Links legais">
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Termos de uso</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Política de privacidade</a></li>
              </ul>
            </nav>
          </div>
          <div className="border-t border-border pt-8 mt-8 text-center text-sm text-muted-foreground">
            <p className="mb-2">© {new Date().getFullYear()} Checkplaca. Todos os direitos reservados.</p>
            <p className="text-xs">
              Os dados fornecidos são obtidos de fontes públicas disponíveis. A Checkplaca é um serviço independente que não possui vínculo ou autorização de órgãos governamentais. Não nos responsabilizamos por eventuais inconsistências nas bases de dados consultadas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
