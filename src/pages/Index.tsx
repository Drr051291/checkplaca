import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/HeroSection";
import { PlansSection } from "@/components/PlansSection";
import { ReportExampleSection } from "@/components/ReportExampleSection";
import { IncludedSection } from "@/components/IncludedSection";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
              Consulta Placa
            </h1>
            <nav className="hidden md:flex items-center gap-6">
              <a 
                href="#inicio" 
                className="text-sm font-medium hover:text-primary transition-smooth"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Início
              </a>
              <a 
                href="#exemplo-relatorio" 
                className="text-sm font-medium hover:text-primary transition-smooth"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('exemplo-relatorio')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Ver exemplo
              </a>
              <a 
                href="#planos" 
                className="text-sm font-medium hover:text-primary transition-smooth"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Planos
              </a>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="text-sm font-medium"
              >
                Entrar
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Included Section */}
      <IncludedSection />

      {/* Report Example Section */}
      <div id="exemplo-relatorio">
        <ReportExampleSection />
      </div>

      {/* Plans Section */}
      <PlansSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Faça sua consulta agora mesmo
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Descubra o histórico completo do veículo em segundos. Comece com uma consulta básica gratuita.
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="h-14 px-10 text-lg font-semibold shadow-strong hover:scale-105 transition-smooth"
          >
            Consultar placa gratuitamente
          </Button>
          <p className="text-sm mt-4 opacity-75">
            ✓ Sem cadastro ✓ Resultado imediato ✓ Dados oficiais do DETRAN
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
                Consulta Placa
              </h4>
              <p className="text-sm text-muted-foreground">
                Consulta veicular profissional com dados oficiais do DETRAN. Relatórios completos para compra segura de veículos usados.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Institucional</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Sobre nós</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Como funciona</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Dúvidas frequentes</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Suporte</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Contato</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Termos de uso</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Política de privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 mt-8 text-center text-sm text-muted-foreground">
            <p className="mb-2">© 2024 Consulta Placa. Todos os direitos reservados.</p>
            <p className="text-xs">
              Os dados fornecidos são obtidos de fontes oficiais e públicas. A Consulta Placa não se responsabiliza por eventuais inconsistências nas bases de dados consultadas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
