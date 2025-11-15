import { Shield, Lock, CreditCard, Award } from "lucide-react";

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
        <div key={i} className="flex items-center gap-2 text-muted-foreground">
          <badge.icon className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">{badge.text}</span>
        </div>
      ))}
    </div>
  );
};
