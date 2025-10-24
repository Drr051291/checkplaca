import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, Clock, Lock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const HeroSection = () => {
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
      console.error('[HeroSection] Erro ao consultar veículo:', error);
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-20 pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          {/* Trust badge */}
          <div className="animate-fade-in">
            <Badge className="bg-accent/10 text-accent border-accent/30 px-5 py-2 text-sm font-medium hover-scale">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mais de 50.000 consultas realizadas
            </Badge>
          </div>

          {/* Main headline */}
          <div className="space-y-6 animate-scale-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight tracking-tight">
              Consulte o histórico completo de{" "}
              <span className="bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
                qualquer veículo
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Dados oficiais do DETRAN • Resultado em segundos • Sem cadastro
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-3xl mx-auto animate-slide-up">
            <Card className="shadow-strong border-2 border-primary/20 hover:border-primary/40 transition-smooth bg-gradient-card">
              <CardContent className="p-8">
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative group">
                      <Input
                        type="text"
                        placeholder="Digite a placa do veículo"
                        value={plate}
                        onChange={(e) => setPlate(formatPlate(e.target.value))}
                        className="h-16 text-xl font-bold tracking-wider text-center pr-28 border-2 focus:border-primary transition-smooth"
                        maxLength={7}
                        autoFocus
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                        {[...Array(7)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                              i < plate.length ? 'bg-primary scale-110' : 'bg-border'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      size="lg"
                      className="h-16 px-10 text-lg font-bold gradient-primary hover:shadow-glow transition-all duration-300 hover-scale"
                      disabled={plate.length < 7 || isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" />
                          Consultando...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2" />
                          Consultar Agora
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    ✓ Gratuito para ver informações básicas • ✓ Resultado instantâneo
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm md:text-base animate-fade-in">
            <div className="flex items-center gap-3 group">
              <div className="p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-smooth">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <span className="font-semibold">Consulta Gratuita</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-smooth">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <span className="font-semibold">Dados Oficiais</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-smooth">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <span className="font-semibold">Resultado Imediato</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-smooth">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <span className="font-semibold">100% Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
