import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const IncludedSection = () => {
  const benefits = [
    { text: "Histórico completo de débitos e multas", highlight: false },
    { text: "Verificação de sinistros e colisões", highlight: true },
    { text: "Consulta de restrições e alienações", highlight: false },
    { text: "Situação de IPVA e licenciamento", highlight: false },
    { text: "Histórico de recalls do fabricante", highlight: true },
    { text: "Relatório profissional em PDF", highlight: false },
    { text: "Especificações técnicas completas", highlight: false },
    { text: "Verificação de leilão e salvados", highlight: true }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa saber antes de comprar
            </h2>
            <p className="text-muted-foreground text-lg mb-2">
              Relatório completo por apenas
            </p>
            <p className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              R$ 19,90
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-4 rounded-xl bg-background shadow-soft hover:shadow-strong transition-smooth animate-fade-in ${
                  benefit.highlight ? 'border-2 border-accent/20' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                <span className="font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              className="h-14 px-10 gradient-primary hover:opacity-90 transition-smooth font-semibold shadow-strong"
              onClick={() => {
                const exampleSection = document.getElementById('exemplo-relatorio');
                if (exampleSection) {
                  exampleSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Ver exemplo completo do relatório
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Sem compromisso • Teste grátis disponível
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
