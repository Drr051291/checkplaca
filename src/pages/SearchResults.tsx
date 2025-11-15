import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialProof } from "@/components/cro/SocialProof";
import { UrgencyTimer } from "@/components/cro/UrgencyTimer";
import { PlanComparison } from "@/components/cro/PlanComparison";
import { Testimonials } from "@/components/cro/Testimonials";
import { MoneyBackGuarantee } from "@/components/cro/MoneyBackGuarantee";
import { TrustBadges } from "@/components/cro/TrustBadges";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plate = searchParams.get('plate') || '';

  // Mock data for demonstration
  const basicData = {
    plate: plate,
    brand: "VOLKSWAGEN",
    model: "GOL 1.6 TOTAL FLEX",
    year: "2018/2019",
    color: "BRANCO",
    status: "Ativo"
  };

  const handleGetFullReport = (planType: 'completo' | 'premium' = 'completo') => {
    navigate(`/checkout?plate=${plate}&planType=${planType}`);
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
          <Card className="shadow-strong mb-8">
            <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <Car className="w-8 h-8" />
                <div>
                  <div className="text-sm opacity-90">Placa consultada</div>
                  <div className="text-3xl font-bold tracking-wider">{basicData.plate}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Marca</div>
                  <div className="text-lg font-semibold">{basicData.brand}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Modelo</div>
                  <div className="text-lg font-semibold">{basicData.model}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ano</div>
                  <div className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {basicData.year}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Cor</div>
                  <div className="text-lg font-semibold">{basicData.color}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge className="bg-accent text-accent-foreground">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {basicData.status}
                  </Badge>
                </div>
              </div>
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
              Quer ver o relatório completo?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Desbloqueie informações detalhadas: FIPE, roubo/furto, histórico de leilão, 
              gravames e recalls
            </p>
          </div>

          {/* Comparação de Planos */}
          <div className="mb-8">
            <PlanComparison onSelectPlan={handleGetFullReport} plate={plate} />
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

          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
