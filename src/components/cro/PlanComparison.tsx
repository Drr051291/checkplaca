import { Check, X, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlanComparisonProps {
  onSelectPlan: (plan: 'completo') => void;
  plate?: string;
}

export const PlanComparison = ({ onSelectPlan, plate }: PlanComparisonProps) => {
  const features = [
    { name: "Informações Básicas", free: true, completo: true },
    { name: "FIPE - Valor de Mercado", free: false, completo: true },
    { name: "Histórico de Roubo/Furto", free: false, completo: true },
    { name: "Débitos e Multas", free: false, completo: true },
    { name: "Restrições Judiciais", free: false, completo: true },
    { name: "Histórico de Leilão", free: false, completo: true },
    { name: "Recalls Pendentes", free: false, completo: true },
    { name: "Dados Técnicos Completos", free: false, completo: true },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Plano Gratuito */}
      <Card className="relative opacity-60">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg">Gratuito</CardTitle>
          <div className="text-3xl font-bold mt-2">R$ 0</div>
          <p className="text-xs text-muted-foreground">Informações básicas</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {feature.free ? (
                <Check className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className={!feature.free ? "text-muted-foreground" : ""}>
                {feature.name}
              </span>
            </div>
          ))}
          <Button 
            variant="outline" 
            className="w-full mt-4 border-primary/30 text-foreground bg-background/50 cursor-not-allowed opacity-100" 
            disabled
          >
            Plano Atual
          </Button>
        </CardContent>
      </Card>

      {/* Plano Completo - DESTAQUE */}
      <Card className="relative border-2 border-primary shadow-glow md:scale-105">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground gap-1">
            <Sparkles className="w-3 h-3" />
            MAIS POPULAR
          </Badge>
        </div>
        <CardHeader className="text-center pb-4 pt-6 bg-gradient-subtle">
          <CardTitle className="text-xl">Completo</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-lg line-through text-muted-foreground">R$ 69,90</span>
            <div className="text-4xl font-bold text-primary">R$ 39,90</div>
          </div>
          <p className="text-xs text-muted-foreground">Relatório completo detalhado</p>
          <Badge variant="destructive" className="mt-2">-43% OFF</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {feature.completo ? (
                <Check className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className={!feature.completo ? "text-muted-foreground" : ""}>
                {feature.name}
              </span>
            </div>
          ))}
          <Button 
            className="w-full mt-4 bg-gradient-primary hover:opacity-90 transition-opacity shadow-strong"
            onClick={() => onSelectPlan('completo')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Desbloquear Agora
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
