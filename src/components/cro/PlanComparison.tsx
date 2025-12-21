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
    <div className="max-w-2xl mx-auto">
      {/* Plano Completo - DESTAQUE */}
      <Card className="relative border-2 border-primary shadow-glow">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground gap-1">
            <Sparkles className="w-3 h-3" />
            MAIS POPULAR
          </Badge>
        </div>
        <CardHeader className="text-center pb-4 pt-6 bg-gradient-subtle">
          <CardTitle className="text-xl">Completo</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-lg line-through text-muted-foreground">R$ 34,90</span>
            <div className="text-4xl font-bold text-primary">R$ 17,90</div>
          </div>
          <p className="text-xs text-muted-foreground">Relatório completo detalhado</p>
          <Badge variant="destructive" className="mt-2">-49% OFF</Badge>
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
            size="lg"
            className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth shadow-strong"
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
