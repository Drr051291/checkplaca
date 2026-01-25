import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Shield, FileText, Zap, ArrowRight } from "lucide-react";

interface BlogCTABannerProps {
  variant?: "inline" | "sidebar" | "footer";
  className?: string;
}

export const BlogCTABanner = ({ variant = "inline", className = "" }: BlogCTABannerProps) => {
  if (variant === "sidebar") {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div className="bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Search className="h-5 w-5" />
            </div>
          </div>
          
          <h3 className="text-lg font-bold mb-2">
            Consulte a Placa
          </h3>
          <p className="text-sm text-primary-foreground/90 mb-4">
            Relatório completo com histórico, débitos e muito mais.
          </p>
          
          <Button 
            asChild 
            variant="secondary" 
            className="w-full font-semibold"
          >
            <Link to="/">
              Consultar Agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
            <div className="text-xs">
              <Shield className="h-4 w-4 mx-auto mb-1 opacity-80" />
              <span className="opacity-80">Seguro</span>
            </div>
            <div className="text-xs">
              <Zap className="h-4 w-4 mx-auto mb-1 opacity-80" />
              <span className="opacity-80">Imediato</span>
            </div>
            <div className="text-xs">
              <FileText className="h-4 w-4 mx-auto mb-1 opacity-80" />
              <span className="opacity-80">PDF</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "footer") {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 border-l-4 border-primary">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">
                Consulte seu Veículo Agora
              </h3>
              <p className="text-muted-foreground mb-0 md:mb-0">
                Descubra histórico completo, débitos, recalls e muito mais. 
                Relatório disponível em segundos.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <Button asChild size="lg" className="font-semibold">
                <Link to="/">
                  Consultar Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // inline variant
  return (
    <Card className={`overflow-hidden my-8 ${className}`}>
      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl">
            <Search className="h-6 w-6" />
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-bold text-lg mb-1">
              Está pensando em comprar um veículo?
            </h4>
            <p className="text-sm text-primary-foreground/90">
              Consulte a placa antes e evite surpresas desagradáveis.
            </p>
          </div>
          
          <Button asChild variant="secondary" className="font-semibold whitespace-nowrap">
            <Link to="/">
              Consultar Placa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
