import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const handleGetFullReport = () => {
    navigate(`/checkout?plate=${plate}`);
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

          {/* Upsell Card - Otimizado para Conversão */}
          <Card className="shadow-strong border-2 border-primary/30 overflow-hidden">
            {/* Header com Urgência */}
            <div className="bg-gradient-primary text-white p-4 text-center">
              <Badge className="bg-white/20 text-white border-white/30 mb-2">
                ⚡ Oferta Limitada
              </Badge>
              <p className="text-sm opacity-90">Relatório completo por apenas R$ 9,90</p>
            </div>

            <CardContent className="p-8">
              {/* Proposta de Valor Principal */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-hero bg-clip-text text-transparent">
                  Descubra TUDO sobre este veículo
                </h2>
                <p className="text-muted-foreground text-lg mb-4">
                  Evite surpresas desagradáveis e compre com segurança
                </p>
                <div className="inline-block">
                  <div className="text-6xl font-bold text-accent mb-1">R$ 9,90</div>
                  <div className="text-sm text-muted-foreground">Pagamento único • Sem mensalidades</div>
                </div>
              </div>

              {/* Benefícios com Destaque Visual */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-accent/10 to-transparent rounded-lg border border-accent/20">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-lg">Débitos e Pendências Financeiras</div>
                    <div className="text-sm text-muted-foreground">IPVA atrasado, multas, licenciamento vencido e todas as taxas pendentes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-accent/10 to-transparent rounded-lg border border-accent/20">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-lg">Histórico Completo de Sinistros</div>
                    <div className="text-sm text-muted-foreground">Acidentes graves, perdas totais, roubos e furtos registrados em seguradora</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-accent/10 to-transparent rounded-lg border border-accent/20">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-lg">Restrições Legais e Recalls</div>
                    <div className="text-sm text-muted-foreground">Bloqueios judiciais, restrições administrativas e recalls pendentes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-accent/10 to-transparent rounded-lg border border-accent/20">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-lg">Relatório em PDF + Análise Detalhada</div>
                    <div className="text-sm text-muted-foreground">Download imediato do relatório completo para compartilhar e guardar</div>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-secondary/30 rounded-lg p-4 mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="font-semibold">Mais de 50.000 consultas realizadas</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Brasileiros já protegeram suas compras com nossos relatórios
                </p>
              </div>

              {/* CTA Principal - Maior e mais visível */}
              <Button 
                onClick={handleGetFullReport}
                className="w-full h-16 text-xl font-bold gradient-primary hover:opacity-90 transition-smooth shadow-strong mb-4"
              >
                🔒 Obter Relatório Completo Agora - R$ 9,90
              </Button>

              {/* Garantias e Segurança */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground border-t border-border pt-4">
                <div>
                  <CheckCircle className="w-5 h-5 text-accent mx-auto mb-1" />
                  <div>Pagamento Seguro</div>
                </div>
                <div>
                  <CheckCircle className="w-5 h-5 text-accent mx-auto mb-1" />
                  <div>Resultado Instantâneo</div>
                </div>
                <div>
                  <CheckCircle className="w-5 h-5 text-accent mx-auto mb-1" />
                  <div>Dados Oficiais</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
