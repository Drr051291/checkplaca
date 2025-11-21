import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Calendar, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialProof } from "@/components/cro/SocialProof";
import { UrgencyTimer } from "@/components/cro/UrgencyTimer";
import { PlanComparison } from "@/components/cro/PlanComparison";
import { Testimonials } from "@/components/cro/Testimonials";
import { MoneyBackGuarantee } from "@/components/cro/MoneyBackGuarantee";
import { TrustBadges } from "@/components/cro/TrustBadges";
import { FAQ } from "@/components/cro/FAQ";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plate = searchParams.get('plate') || '';
  const reportId = searchParams.get('reportId') || '';

  // Mock data for demonstration
  const basicData = {
    plate: plate,
    brand: "VOLKSWAGEN",
    model: "GOL 1.6 TOTAL FLEX",
    year: "2018/2019",
    color: "BRANCO",
    status: "Ativo"
  };

  const handleGetFullReport = (planType: 'completo' = 'completo') => {
    navigate(`/checkout?reportId=${reportId}&plan=${planType}&plate=${plate}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Checkplaca
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Basic Info Card */}
          <Card className="shadow-strong mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-primary text-white p-3 rounded-lg">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Placa consultada</div>
                  <div className="text-2xl font-bold tracking-wider">{basicData.plate}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Marca</div>
                  <div className="font-semibold">{basicData.brand}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Modelo</div>
                  <div className="font-semibold">{basicData.model}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Ano</div>
                  <div className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {basicData.year}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Cor</div>
                  <div className="font-semibold">{basicData.color}</div>
                </div>
              </div>

              {/* CTA Principal Integrado */}
              <div className="bg-gradient-hero text-white rounded-lg p-6 -mx-6 -mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Relatório Completo Disponível</h3>
                    <p className="text-sm opacity-90">
                      Histórico de roubo, débitos, FIPE, recalls e muito mais
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Acesso imediato</span>
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>100% seguro</span>
                </div>

                <Button 
                  size="lg"
                  onClick={() => handleGetFullReport('completo')}
                  className="w-full bg-white text-primary hover:bg-white/90 font-bold h-14 text-lg shadow-strong hover:scale-105 transition-smooth"
                >
                  Ver Relatório Completo - R$ 39,90
                </Button>
                
                <div className="text-center mt-3 text-sm opacity-90">
                  <span className="line-through mr-2">R$ 69,90</span>
                  <span className="font-bold">-43% OFF por tempo limitado</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Principal - Acima da dobra */}
          <Card className="my-8 bg-gradient-hero text-white border-0 shadow-glow">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                🔓 Desbloqueie o Relatório Completo
              </h2>
              <p className="text-lg md:text-xl mb-6 opacity-95 max-w-2xl mx-auto">
                Acesse histórico de roubo/furto, débitos, multas, valor FIPE, recalls e muito mais!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Relatório em segundos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Garantia de 7 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Pagamento seguro</span>
                </div>
              </div>
              <Button 
                size="lg"
                variant="secondary"
                onClick={() => handleGetFullReport('completo')}
                className="h-16 px-12 text-xl font-bold shadow-strong hover:scale-105 transition-smooth bg-white text-primary hover:bg-white/90"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Ver Relatório Completo - R$ 39,90
              </Button>
              <p className="text-sm mt-4 opacity-90">
                <span className="line-through mr-2">R$ 69,90</span>
                <Badge className="bg-destructive text-destructive-foreground">-43% OFF</Badge>
              </p>
            </CardContent>
          </Card>

          {/* Prova Social */}
          <div className="mb-8">
            <SocialProof />
          </div>

          {/* Urgência */}
          <div className="flex justify-center mb-8">
            <UrgencyTimer />
          </div>

          {/* Título da Seção */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que está incluído no relatório?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todas as informações que você precisa para tomar a melhor decisão
            </p>
          </div>

          {/* Comparação de Planos */}
          <div className="mb-12">
            <PlanComparison onSelectPlan={handleGetFullReport} plate={plate} />
          </div>

          {/* CTA Intermediário */}
          <Card className="mb-12 bg-gradient-subtle border-2 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                🔒 Acesso completo a todas as informações do veículo
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Evite surpresas na hora da compra. Tenha acesso ao histórico completo e tome a melhor decisão.
              </p>
              <Button 
                size="lg"
                onClick={() => handleGetFullReport('completo')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-strong h-14 px-8 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Desbloquear Relatório Completo - R$ 39,90
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                ✓ Garantia de 7 dias • ✓ Acesso imediato • ✓ Pagamento seguro
              </p>
            </CardContent>
          </Card>

          {/* Garantia */}
          <div className="mb-8">
            <MoneyBackGuarantee />
          </div>

          {/* Depoimentos */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-center mb-6">
              O que nossos clientes dizem
            </h3>
            <Testimonials />
          </div>

          {/* FAQ */}
          <div className="mb-8">
            <FAQ />
          </div>

          {/* Trust Badges */}
          <TrustBadges />

          {/* CTA Final */}
          <div className="mt-12 text-center bg-gradient-hero text-white rounded-lg p-8 shadow-glow">
            <h3 className="text-3xl font-bold mb-4">
              Pronto para tomar a melhor decisão?
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Não compre sem saber o histórico completo. Invista R$ 39,90 agora e economize milhares no futuro.
            </p>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => handleGetFullReport('completo')}
              className="h-14 px-10 text-lg font-bold shadow-strong hover:scale-105 transition-smooth"
            >
              Ver Relatório Completo Agora
            </Button>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <span>✓ Pagamento 100% seguro</span>
              <span>✓ Dados atualizados</span>
              <span>✓ Suporte dedicado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
