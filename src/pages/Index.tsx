import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, CheckCircle, FileText, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [plate, setPlate] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (plate.trim()) {
      navigate(`/search?plate=${plate.toUpperCase()}`);
    }
  };

  const formatPlate = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    // Limit to 7 characters (Brazilian plate format)
    return cleaned.slice(0, 7);
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            AutoCheck Express
          </h1>
          <Button variant="ghost" onClick={() => navigate('/admin/login')}>
            Admin
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Consulte o Histórico do{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Seu Veículo
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Verifique débitos, multas, sinistros e muito mais. Consulta básica gratuita, 
              relatório completo por apenas <span className="font-bold text-accent">R$ 9,90</span>.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
              <Card className="shadow-strong border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Digite a placa (ex: ABC1234)"
                        value={plate}
                        onChange={(e) => setPlate(formatPlate(e.target.value))}
                        className="h-14 text-lg font-semibold tracking-wider text-center"
                        maxLength={7}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="lg"
                      className="h-14 px-8 gradient-primary hover:opacity-90 transition-smooth font-semibold"
                      disabled={plate.length < 7}
                    >
                      <Search className="mr-2" />
                      Consultar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Consulta básica gratuita • Sem cadastro necessário
                  </p>
                </CardContent>
              </Card>
            </form>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <span>Resultado Imediato</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent" />
                <span>Dados Oficiais</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Por que escolher o AutoCheck Express?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-soft hover:shadow-strong transition-smooth">
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">
                O que está incluso no relatório completo?
              </h3>
              <p className="text-muted-foreground">
                Por apenas R$ 9,90, você recebe todas as informações essenciais
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
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
            className="h-14 px-10 text-lg font-semibold"
          >
            Fazer Consulta Gratuita
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 AutoCheck Express. Todos os direitos reservados.</p>
          <p className="mt-2">Dados verificados junto às fontes oficiais</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
