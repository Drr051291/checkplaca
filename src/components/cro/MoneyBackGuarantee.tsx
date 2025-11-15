import { Shield, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const MoneyBackGuarantee = () => {
  return (
    <Card className="bg-gradient-subtle border-primary/30">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Garantia de 7 Dias
            </h3>
            <p className="text-muted-foreground">
              Se você não ficar 100% satisfeito com as informações do relatório, 
              <span className="font-semibold text-foreground"> devolvemos seu dinheiro sem perguntas</span>. 
              Simples assim. Compra sem risco!
            </p>
          </div>
          
          <div className="shrink-0">
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-center">
              <p className="text-2xl font-bold">7 Dias</p>
              <p className="text-xs opacity-90">Garantia total</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
