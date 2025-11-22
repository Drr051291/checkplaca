import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Calendar, CheckCircle, Sparkles, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CarBrandLogo from "@/components/CarBrandLogo";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plate = searchParams.get('plate') || '';
  const reportId = searchParams.get('reportId') || '';
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vehicle_reports')
          .select('*')
          .eq('id', reportId)
          .single();

        if (error) throw error;

        if (data) {
          setReportData(data.report_data);
        }
      } catch (error) {
        console.error('Erro ao buscar relatório:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do veículo.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando dados do veículo...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  const vehicleInfo = reportData?.dados?.informacoes_veiculo?.dados_veiculo || {};
  const basicData = {
    plate: vehicleInfo.placa || plate,
    brand: vehicleInfo.marca || "N/D",
    model: vehicleInfo.modelo || "N/D",
    year: vehicleInfo.ano_fabricacao && vehicleInfo.ano_modelo 
      ? `${vehicleInfo.ano_fabricacao}/${vehicleInfo.ano_modelo}`
      : "N/D",
    color: vehicleInfo.cor || "N/D",
    status: "Ativo"
  };

  const handleGetFullReport = (planType: 'completo' = 'completo') => {
    navigate(`/checkout?reportId=${reportId}&plan=${planType}&plate=${plate}`);
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
              <div className="bg-gradient-hero text-white rounded-lg p-4 md:p-6 -mx-6 -mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-1">Relatório Completo Disponível</h3>
                    <p className="text-xs md:text-sm opacity-90">
                      Histórico de roubo, débitos, FIPE, recalls e muito mais
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs md:text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Acesso imediato</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>100% seguro</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  onClick={() => handleGetFullReport('completo')}
                  className="w-full bg-white text-primary hover:bg-white/90 font-bold h-12 md:h-14 text-base md:text-lg shadow-strong"
                >
                  <span className="truncate">Ver Relatório - R$ 39,90</span>
                </Button>
                
                <div className="text-center mt-3 text-xs md:text-sm opacity-90">
                  <span className="line-through mr-2">R$ 69,90</span>
                  <span className="font-bold">-43% OFF</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Principal - Acima da dobra */}
          <Card className="my-6 md:my-8 bg-gradient-hero text-white border-0 shadow-glow">
            <CardContent className="p-6 md:p-8 text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                🔓 Desbloqueie o Relatório Completo
              </h2>
              <p className="text-base md:text-lg lg:text-xl mb-4 md:mb-6 opacity-95 max-w-2xl mx-auto">
                Acesse histórico de roubo/furto, débitos, multas, valor FIPE, recalls e muito mais!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-center mb-4 md:mb-6 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Relatório em segundos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Garantia de 7 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Pagamento seguro</span>
                </div>
              </div>
              <Button 
                size="lg"
                variant="secondary"
                onClick={() => handleGetFullReport('completo')}
                className="w-full sm:w-auto h-12 md:h-16 px-6 md:px-12 text-base md:text-xl font-bold shadow-strong bg-white text-primary hover:bg-white/90"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                <span className="truncate">Ver Relatório - R$ 39,90</span>
              </Button>
              <p className="text-xs md:text-sm mt-3 md:mt-4 opacity-90">
                <span className="line-through mr-2">R$ 69,90</span>
                <Badge className="bg-destructive text-destructive-foreground text-xs">-43% OFF</Badge>
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
          <Card className="mb-8 md:mb-12 bg-gradient-subtle border-2 border-primary/20">
            <CardContent className="p-6 md:p-8 text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
                🔒 Acesso completo a todas as informações
              </h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
                Evite surpresas na hora da compra. Tenha acesso ao histórico completo e tome a melhor decisão.
              </p>
              <Button 
                size="lg"
                onClick={() => handleGetFullReport('completo')}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-strong h-12 md:h-14 px-6 md:px-8 text-base md:text-lg"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="truncate">Desbloquear - R$ 39,90</span>
              </Button>
              <p className="text-xs md:text-sm text-muted-foreground mt-3 md:mt-4">
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
          <div className="mt-8 md:mt-12 text-center bg-gradient-hero text-white rounded-lg p-6 md:p-8 shadow-glow">
            <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              Pronto para tomar a melhor decisão?
            </h3>
            <p className="text-sm md:text-lg mb-4 md:mb-6 opacity-90 max-w-2xl mx-auto">
              Não compre sem saber o histórico completo. Invista R$ 39,90 agora e economize milhares no futuro.
            </p>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => handleGetFullReport('completo')}
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

export default SearchResults;
