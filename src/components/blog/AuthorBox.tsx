import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, ArrowRight } from "lucide-react";

interface AuthorBoxProps {
  className?: string;
}

export const AuthorBox = ({ className = "" }: AuthorBoxProps) => {
  return (
    <Card className={`p-6 bg-gradient-to-br from-muted/50 to-background border-border/50 ${className}`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src="/placeholder.svg" alt="Equipe Checkplaca" />
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              Autor
            </span>
          </div>
          <h4 className="text-lg font-semibold mb-2">Equipe Checkplaca</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Especialistas em consulta veicular e segurança na compra de veículos usados. 
            Nossa missão é ajudar você a tomar decisões mais seguras.
          </p>
          <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-primary hover:text-primary/80">
            <Link to="/blog" className="flex items-center gap-1">
              Ver todos os artigos
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
