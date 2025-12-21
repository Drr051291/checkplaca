import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Calendar, Sparkles, CheckCircle, Lock, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialProof } from "@/components/cro/SocialProof";
import { UrgencyTimer } from "@/components/cro/UrgencyTimer";
import { PlanComparison } from "@/components/cro/PlanComparison";
import { Testimonials } from "@/components/cro/Testimonials";
import { MoneyBackGuarantee } from "@/components/cro/MoneyBackGuarantee";
import { TrustBadges } from "@/components/cro/TrustBadges";
import { FAQ } from "@/components/cro/FAQ";
import { trackCTAClick } from "@/lib/analytics";

const PreviewResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const plateQueryId = searchParams.get('id') || '';
  const placa = searchParams.get('placa') || '';
  const marca = searchParams.get('marca') || 'N/D';
  const modelo = searchParams.get('modelo') || 'N/D';
  const ano = searchParams.get('ano') || 'N/D';
  const cor = searchParams.get('cor') || 'N/D';

  const handleGetFullReport = () => {
    trackCTAClick('Desbloquear Relatório Completo', 'preview_result_page', 17.90);
    navigate(`/checkout-new?plateQueryId=${plateQueryId}&placa=${placa}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-hero sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Checkplaca
            </h1>
            <div className="w-9"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Preview Card - Only 4 fields */}
          <Card className="shadow-strong mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-primary text-white p-3 rounded-lg">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Placa consultada</div>
                  <div className="text-2xl font-bold tracking-wider">{placa}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Marca</div>
                  <div className="font-semibold">{marca}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Modelo</div>
                  <div className="font-semibold">{modelo}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Ano</div>
                  <div className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {ano}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Cor</div>
                  <div className="font-semibold">{cor}</div>
                </div>
              </div>

              {/* CTA Integrado */}
              <div className="bg-gradient-hero text-white rounded-lg p-4 md:p-6 -mx-6 -mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-1">Relatório Completo Disponível</h3>
                    <p className="text-xs md:text-sm opacity-90">
                      Preço FIPE, débitos por infrações (RENAINF), dados técnicos e muito mais
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs md:text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Acesso imediato</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Pagamento via Pix</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>100% seguro</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  onClick={handleGetFullReport}
                  className="w-full bg-white text-primary hover:bg-white/90 font-bold h-12 md:h-14 text-base md:text-lg shadow-strong"
                >
                  <span className="truncate">Desbloquear relatório completo - R$ 17,90</span>
                </Button>
                
                <div className="text-center mt-3 text-xs md:text-sm opacity-90">
                  <span className="line-through mr-2">R$ 34,90</span>
                  <span className="font-bold">-49% OFF</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Principal */}
          <Card className="my-6 md:my-8 bg-gradient-hero text-white border-0 shadow-glow">
            <CardContent className="p-6 md:p-8 text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                🔓 Desbloqueie o Relatório Completo
              </h2>
              <p className="text-base md:text-lg lg:text-xl mb-4 md:mb-6 opacity-95 max-w-2xl mx-auto">
                Acesse o valor FIPE, débitos por infrações, dados técnicos completos e muito mais!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-center mb-4 md:mb-6 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Relatório em segundos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Garantia de 7 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Pagamento seguro</span>
                </div>
              </div>
              <Button 
                size="lg"
                variant="secondary"
                onClick={handleGetFullReport}
                className="w-full sm:w-auto h-12 md:h-16 px-6 md:px-12 text-base md:text-xl font-bold shadow-strong bg-white text-primary hover:bg-white/90"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                <span className="truncate">Ver Relatório - R$ 17,90</span>
              </Button>
              <p className="text-xs md:text-sm mt-3 md:mt-4 opacity-90">
                <span className="line-through mr-2">R$ 34,90</span>
                <Badge className="bg-destructive text-destructive-foreground text-xs">-49% OFF</Badge>
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

          {/* O que está incluído */}
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
            <PlanComparison onSelectPlan={handleGetFullReport} plate={placa} />
          </div>

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
          <div className="mt-8 md:mt-12 text-center bg-gradient-hero text-white rounded-lg p-6 md:p-8 shadow-glow">
            <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              Pronto para tomar a melhor decisão?
            </h3>
            <p className="text-sm md:text-lg mb-4 md:mb-6 opacity-90 max-w-2xl mx-auto">
              Não compre sem saber o histórico completo. Invista R$ 17,90 agora e economize milhares no futuro.
            </p>
            <Button 
              size="lg"
              variant="secondary"
              onClick={handleGetFullReport}
              className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-10 text-base md:text-lg font-bold shadow-strong bg-white text-primary hover:bg-white/90"
            >
              Ver Relatório Completo Agora
            </Button>
            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 text-xs md:text-sm">
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

export default PreviewResult;
