import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const IncludedSection = () => {
  const benefits = [
    { text: "Dados básicos do veículo completos", highlight: false },
    { text: "Tabela FIPE - valor de mercado atualizado", highlight: true },
    { text: "Histórico de roubo e furto", highlight: true },
    { text: "Histórico de leilão e uso anterior", highlight: true },
    { text: "Gravames - restrições financeiras (RENAJUD)", highlight: true },
    { text: "Informações técnicas detalhadas", highlight: false },
    { text: "Verificação de situação do veículo", highlight: false },
    { text: "Relatório profissional completo", highlight: false }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
              Tudo que você precisa saber antes de comprar
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-2">
              Relatório completo por apenas
            </p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
              R$ 39,90
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-background shadow-soft hover:shadow-strong transition-smooth animate-fade-in ${
                  benefit.highlight ? 'border-2 border-accent/20' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0 mt-0.5" />
                <span className="font-medium text-sm sm:text-base">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="text-center px-4">
            <Button 
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-10 gradient-primary hover:opacity-90 transition-smooth font-semibold shadow-strong text-sm sm:text-base w-full sm:w-auto"
              onClick={() => {
                const exampleSection = document.getElementById('exemplo-relatorio');
                if (exampleSection) {
                  exampleSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Ver exemplo completo do relatório
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
              Sem compromisso • Teste grátis disponível
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
