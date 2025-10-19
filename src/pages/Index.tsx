import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, CheckCircle, FileText, Clock, Lock, Play, Star, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroVehicle from "@/assets/hero-vehicle.png";

const Index = () => {
  const [plate, setPlate] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (plate.length !== 7) {
      toast({
        title: "Placa inválida",
        description: "Por favor, insira uma placa válida com 7 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('vehicle-report', {
        body: { plate: plate.toUpperCase() },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Consulta realizada!",
          description: "Redirecionando para o relatório...",
        });
        navigate(`/report?id=${data.reportId}`);
      } else {
        throw new Error(data.error || 'Erro ao processar consulta');
      }
    } catch (error: any) {
      console.error('Erro ao consultar veículo:', error);
      toast({
        title: "Erro na consulta",
        description: error.message || "Não foi possível consultar o veículo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const formatPlate = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return cleaned.slice(0, 7);
  };

  // Simulated recent searches for social proof
  const recentSearches = [
    { plate: "NXN-1234", brand: "PEUGEOT", model: "207 XR Sport", time: "1h atrás" },
    { plate: "OKN-5678", brand: "HONDA", model: "Civic LXS", time: "1h atrás" },
    { plate: "PXG-9012", brand: "SUZUKI", model: "Jimny 4ALL", time: "1h atrás" },
    { plate: "SYO-2345", brand: "JEEP", model: "Renegade L.", time: "1h atrás" },
    { plate: "EBZ-6789", brand: "VW", model: "Virtus Hig", time: "1h atrás" },
    { plate: "DSM-3456", brand: "FIAT", model: "Morea Max", time: "1h atrás" },
  ];

  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSearchIndex((prev) => (prev + 1) % recentSearches.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Consulta Segura",
      description: "Dados verificados direto das fontes oficiais"
    },
    {
      icon: Clock,
      title: "Resultado Instantâneo",
      description: "Relatório completo em segundos"
    },
    {
      icon: FileText,
      title: "Relatório Detalhado",
      description: "IPVA, multas, débitos, sinistros e muito mais"
    },
    {
      icon: Lock,
      title: "Pagamento Seguro",
      description: "Transações protegidas e criptografadas"
    }
  ];

  const benefits = [
    "Histórico completo de débitos",
    "Verificação de sinistros e recalls",
    "Consulta de restrições judiciais",
    "Multas e pendências",
    "IPVA e licenciamento",
    "Download em PDF"
  ];

  const stats = [
    { icon: Users, value: "500K+", label: "Consultas realizadas" },
    { icon: Star, value: "4.9/5", label: "Avaliação dos usuários" },
    { icon: Award, value: "100%", label: "Dados oficiais" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              AutoCheck Express
            </h1>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#inicio" className="text-sm font-medium hover:text-primary transition-smooth">
                Início
              </a>
              <a href="#como-funciona" className="text-sm font-medium hover:text-primary transition-smooth">
                Como funciona
              </a>
              <a href="#planos" className="text-sm font-medium hover:text-primary transition-smooth">
                Planos
              </a>
              <Button variant="ghost" onClick={() => navigate('/admin/login')}>
                Entrar
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-1.5">
                <CheckCircle className="w-4 h-4 mr-2" />
                Atualizada com o Mercosul
              </Badge>

              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Pesquise a placa de{" "}
                  <span className="bg-gradient-hero bg-clip-text text-transparent">
                    qualquer veículo.
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Consultas em todo o território nacional, incluindo vários tipos de veículos.
                  Faça seu test-drive gratuito:
                </p>
              </div>

              {/* Search Form */}
              <Card className="shadow-strong border-2 border-primary/20 animate-scale-in">
                <CardContent className="p-6">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Input
                          type="text"
                          placeholder="Insira aqui a placa:"
                          value={plate}
                          onChange={(e) => setPlate(formatPlate(e.target.value))}
                          className="h-14 text-lg font-semibold tracking-wider text-center pr-24"
                          maxLength={7}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                          {[...Array(7)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-smooth ${
                                i < plate.length ? 'bg-primary' : 'bg-border'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        size="lg"
                        className="h-14 px-8 gradient-primary hover:opacity-90 transition-smooth font-semibold"
                        disabled={plate.length < 7 || isSearching}
                      >
                        <Search className="mr-2" />
                        {isSearching ? "Consultando..." : "Pesquisar placa"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Consulta básica gratuita • Sem cadastro necessário
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-5 h-5 text-accent" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5 text-accent" />
                  <span>Resultado Imediato</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="w-5 h-5 text-accent" />
                  <span>Dados Oficiais</span>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:block hidden animate-fade-in">
              <div className="relative">
                <img 
                  src={heroVehicle} 
                  alt="Veículos consultados" 
                  className="w-full h-auto drop-shadow-2xl"
                />
                
                {/* Floating badges */}
                <div className="absolute top-8 left-8 bg-background/95 backdrop-blur p-4 rounded-xl shadow-strong border border-border animate-scale-in">
                  <div className="text-sm text-muted-foreground mb-1">Proprietário Atual</div>
                  <div className="font-bold text-lg">João Silva</div>
                </div>

                <div className="absolute bottom-16 right-8 bg-background/95 backdrop-blur p-4 rounded-xl shadow-strong border border-border animate-scale-in">
                  <div className="text-sm text-muted-foreground mb-1">Laudo com fotos</div>
                  <div className="font-bold text-lg text-accent">✓ Disponível</div>
                </div>

                <div className="absolute top-1/2 -right-8 bg-background/95 backdrop-blur p-4 rounded-xl shadow-strong border border-border animate-scale-in">
                  <div className="text-sm text-muted-foreground mb-1">Sinistros</div>
                  <div className="font-bold text-lg">Nenhum registro</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Searches Carousel */}
      <section className="border-y border-border bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-sm font-medium text-muted-foreground">Últimas avaliações:</span>
          </div>
          <div className="flex overflow-hidden">
            <div className="flex animate-[slide-in-right_30s_linear_infinite] gap-6">
              {[...recentSearches, ...recentSearches].map((search, index) => (
                <Card key={index} className="flex-shrink-0 w-64 shadow-soft">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                      {search.plate.slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{search.brand}</div>
                      <div className="text-xs text-muted-foreground truncate">{search.model}</div>
                      <div className="text-xs text-muted-foreground">{search.time}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            *Laudo com fotos é uma base de dados exclusiva no relatório Discovery. O registro das fotos dependerá de 
            consultar a base.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section id="como-funciona" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              A mais completa plataforma de busca a histórico veicular
            </h3>
          </div>
          <div className="max-w-5xl mx-auto">
            <Card className="shadow-strong overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Button 
                  size="lg" 
                  className="w-20 h-20 rounded-full gradient-primary"
                  onClick={() => alert('Vídeo explicativo seria exibido aqui')}
                >
                  <Play className="w-10 h-10 fill-white" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Por que escolher o AutoCheck Express?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-soft hover:shadow-strong transition-smooth hover-scale">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="planos" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">
                O que está incluso no relatório completo?
              </h3>
              <p className="text-muted-foreground text-lg">
                Por apenas <span className="text-accent font-bold text-2xl">R$ 9,90</span>, você recebe todas as informações essenciais
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-background shadow-soft hover:shadow-strong transition-smooth">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para consultar seu veículo?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Comece com uma consulta básica gratuita agora mesmo
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="h-14 px-10 text-lg font-semibold hover-scale"
          >
            Fazer Consulta Gratuita
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
                AutoCheck Express
              </h4>
              <p className="text-sm text-muted-foreground">
                A plataforma mais completa de consulta veicular do Brasil.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Empresa</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Quem somos</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Como funciona</a></li>
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
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 AutoCheck Express. Todos os direitos reservados.</p>
            <p className="mt-2">Dados verificados junto às fontes oficiais</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
