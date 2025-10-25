import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, Clock, Lock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackSearch } from "@/lib/analytics";

export const HeroSection = () => {
  const [plate, setPlate] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedPlate = plate.trim().toUpperCase();
    
    if (cleanedPlate.length !== 7) {
      toast({
        title: "Placa inválida",
        description: "A placa deve ter exatamente 7 caracteres (ex: ABC1234 ou ABC1D23).",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Track search event
    trackSearch(plate.toUpperCase());
    
    try {
      const plateToSearch = cleanedPlate;
      
      const { data, error } = await supabase.functions.invoke('vehicle-report', {
        body: { plate: plateToSearch },
      });

      if (error) {
        console.error('[HeroSection] Edge function error:', error);
        throw error;
      }

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
      
      let errorMessage = "Não foi possível consultar o veículo. Tente novamente.";
      
      if (error.message?.includes('invalida') || error.message?.includes('formato')) {
        errorMessage = "Placa inválida. Use o formato: ABC1234 ou ABC1D23";
      }
      
      toast({
        title: "Erro na consulta",
        description: errorMessage,
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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-3 sm:px-4 relative">
        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 md:space-y-10">
          {/* Trust badge */}
          <div className="animate-fade-in">
            <Badge className="bg-accent/10 text-accent border-accent/30 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover-scale">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Mais de 50.000 consultas realizadas
            </Badge>
          </div>

          {/* Main headline */}
          <div className="space-y-4 sm:space-y-6 animate-scale-in px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight tracking-tight">
              Consulte o histórico completo de{" "}
              <span className="bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
                qualquer veículo
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Dados oficiais do DETRAN • Resultado em segundos • Sem cadastro
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-3xl mx-auto animate-slide-up px-2">
            <Card className="shadow-strong border-2 border-primary/20 hover:border-primary/40 transition-smooth bg-gradient-card">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="relative group">
                      <Input
                        type="text"
                        placeholder="ABC1234"
                        value={plate}
                        onChange={(e) => setPlate(formatPlate(e.target.value))}
                        className="h-14 sm:h-16 text-lg sm:text-xl font-bold tracking-wider text-center pr-20 sm:pr-28 border-2 focus:border-primary transition-smooth uppercase"
                        maxLength={7}
                        autoFocus
                        aria-label="Digite a placa do veículo"
                      />
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex gap-0.5 sm:gap-1">
                        {[...Array(7)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                              i < plate.length ? 'bg-primary scale-110' : 'bg-border'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      size="lg"
                      className="h-14 sm:h-16 px-6 sm:px-10 text-base sm:text-lg font-bold gradient-primary hover:shadow-glow transition-all duration-300 hover-scale w-full"
                      disabled={plate.length < 7 || isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span className="hidden sm:inline">Consultando...</span>
                          <span className="sm:hidden">Aguarde...</span>
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">Consultar Agora</span>
                          <span className="sm:hidden">Consultar</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    ✓ Gratuito • ✓ Resultado instantâneo
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-6 md:gap-10 text-xs sm:text-sm md:text-base animate-fade-in px-2">
            <div className="flex items-center gap-2 sm:gap-3 group">
              <div className="p-1.5 sm:p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-smooth">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <span className="font-semibold">Consulta Gratuita</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 group">
              <div className="p-1.5 sm:p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-smooth">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <span className="font-semibold">Dados Oficiais</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 group">
              <div className="p-1.5 sm:p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-smooth">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <span className="font-semibold">Resultado Imediato</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 group">
              <div className="p-1.5 sm:p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-smooth">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <span className="font-semibold">100% Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
