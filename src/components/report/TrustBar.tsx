import { Shield, Lock, Zap, FileText, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustItem {
  icon: typeof Shield;
  text: string;
}

const defaultItems: TrustItem[] = [
  { icon: CreditCard, text: "Pagamento via Pix" },
  { icon: Zap, text: "Acesso imediato" },
  { icon: FileText, text: "Relatório em PDF" },
  { icon: Lock, text: "Dados protegidos" },
];

interface TrustBarProps {
  items?: TrustItem[];
  variant?: "default" | "compact";
  className?: string;
}

export const TrustBar = ({ items = defaultItems, variant = "default", className }: TrustBarProps) => {
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap justify-center gap-4 text-xs text-muted-foreground", className)}>
        {items.map((item, i) => (
          <div 
            key={i} 
            className="flex items-center gap-1.5 transition-all duration-200 hover:text-primary cursor-default group"
          >
            <item.icon className="w-3.5 h-3.5 text-primary transition-transform duration-200 group-hover:scale-110" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-5", className)}>
      {items.map((item, i) => (
        <div 
          key={i} 
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50",
            "transition-all duration-300 ease-out",
            "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/70",
            "cursor-default group"
          )}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="p-1.5 rounded-full bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
            <item.icon className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground">{item.text}</span>
        </div>
      ))}
    </div>
  );
};