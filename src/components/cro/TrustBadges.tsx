import { Shield, Lock, CreditCard, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export const TrustBadges = () => {
  const badges = [
    { icon: Lock, text: "Pagamento Seguro" },
    { icon: Shield, text: "Dados Protegidos" },
    { icon: CreditCard, text: "PIX Instantâneo" },
    { icon: Award, text: "Certificado SSL" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6 py-4">
      {badges.map((badge, i) => (
        <div 
          key={i} 
          className={cn(
            "flex items-center gap-2 text-muted-foreground",
            "transition-all duration-300 ease-out",
            "hover:text-primary cursor-default group"
          )}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <badge.icon className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
          <span className="text-sm font-medium">{badge.text}</span>
        </div>
      ))}
    </div>
  );
};
