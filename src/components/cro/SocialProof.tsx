import { Star, Users, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const SocialProof = () => {
  return (
    <Card className="p-4 bg-muted/50 border-primary/20">
      <div className="grid md:grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-sm font-semibold">4.9/5.0</p>
          <p className="text-xs text-muted-foreground">+12.450 avaliações</p>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <p className="text-sm font-semibold">+38.760</p>
          <p className="text-xs text-muted-foreground">Relatórios vendidos</p>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="w-6 h-6 text-primary" />
          <p className="text-sm font-semibold">98%</p>
          <p className="text-xs text-muted-foreground">Satisfação garantida</p>
        </div>
      </div>
    </Card>
  );
};
