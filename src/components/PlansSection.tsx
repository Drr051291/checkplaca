import { CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export const PlansSection = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Rápida",
      price: "R$ 0,00",
      headline: "Teste Grátis",
      description: "Descubra dados básicos",
      features: [
        "Dados básicos do veículo",
        "Marca, modelo e ano",
        "Cor e tipo",
        "Consulta instantânea"
      ],
      cta: "Começar grátis",
      popular: false,
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    {
      name: "Completa",
      price: "R$ 19,90",
      headline: "Mais Popular",
      description: "Ideal para quem vai comprar carro usado",
      features: [
        "Tudo do plano Rápida",
        "Histórico de débitos",
        "IPVA e licenciamento",
        "Multas e pendências",
        "Restrições judiciais",
        "Download em PDF"
      ],
      cta: "Começar com este plano",
      popular: true,
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    {
      name: "Premium",
      price: "R$ 39,90",
      headline: "Segurança Total",
      description: "Segurança total e rastreabilidade completa",
      features: [
        "Tudo do plano Completa",
        "Verificação de sinistros",
        "Histórico de recalls",
        "Laudo com fotos",
        "Rastreamento de leilão",
        "Suporte prioritário",
        "Relatórios ilimitados"
      ],
      cta: "Começar com este plano",
      popular: false,
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  ];

  return (
    <section id="planos" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transparência total com dados oficiais verificados
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative shadow-soft hover:shadow-strong transition-smooth ${
                plan.popular ? 'border-2 border-primary scale-105 shadow-strong' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {plan.headline}
                </Badge>
              )}
              
              <CardHeader className="text-center pt-8 pb-4">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                {!plan.popular && (
                  <p className="text-sm text-muted-foreground mb-2">{plan.headline}</p>
                )}
                <div className="mb-2">
                  <span className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full h-12 font-semibold ${
                    plan.popular 
                      ? 'gradient-primary hover:opacity-90' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  onClick={plan.onClick}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
