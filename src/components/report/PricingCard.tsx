import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  subtitle?: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  benefits: string[];
  buttonText: string;
  onSelect: () => void;
  featured?: boolean;
  className?: string;
}

export const PricingCard = ({
  title,
  subtitle,
  price,
  originalPrice,
  discount,
  benefits,
  buttonText,
  onSelect,
  featured = false,
  className,
}: PricingCardProps) => {
  return (
    <Card className={cn(
      "relative overflow-hidden",
      "transition-all duration-300 ease-out",
      "hover:shadow-xl hover:-translate-y-1",
      "group",
      featured && "border-2 border-primary shadow-strong",
      className
    )}>
      {featured && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground rounded-t-none gap-1 text-xs animate-pulse-slow">
            <Sparkles className="w-3 h-3" />
            Mais vendido
          </Badge>
        </div>
      )}
      
      <CardHeader className={cn(
        "text-center pb-3 transition-colors duration-300",
        featured && "pt-8 bg-primary/5 group-hover:bg-primary/10"
      )}>
        <h3 className="text-xl font-bold">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        <div className="flex items-center justify-center gap-2 mt-3">
          {originalPrice && (
            <span className="text-base line-through text-muted-foreground">{originalPrice}</span>
          )}
          <span className="text-3xl font-bold text-primary transition-transform duration-300 group-hover:scale-105">{price}</span>
        </div>
        {discount && (
          <Badge variant="destructive" className="mt-2 animate-bounce-soft">{discount}</Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2.5">
          {benefits.map((benefit, i) => (
            <li 
              key={i} 
              className="flex items-start gap-2 text-sm transition-all duration-200 hover:translate-x-1"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Check className="w-4 h-4 text-accent shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          size="lg"
          className={cn(
            "w-full font-semibold",
            "transform transition-all duration-200",
            "hover:shadow-lg hover:-translate-y-0.5",
            "active:translate-y-0 active:scale-[0.98]",
            featured ? "gradient-primary shadow-strong hover:shadow-xl" : ""
          )}
          onClick={onSelect}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};