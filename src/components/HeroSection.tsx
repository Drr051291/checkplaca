import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, Clock, Lock, CheckCircle } from "lucide-react";
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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-1.5 mx-auto">
            <CheckCircle className="w-4 h-4 mr-2" />
            Dados oficiais
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Consulte o histórico completo de qualquer veículo pela placa
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dados oficiais do DETRAN • Resultado em segundos • Sem cadastro
            </p>
          </div>

          {/* Search Form */}
          <Card className="shadow-strong border-2 border-primary/20 animate-scale-in max-w-2xl mx-auto">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="ABC1234"
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
              </form>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span className="font-medium">Consulta grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="font-medium">Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              <span className="font-medium">100% seguro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
