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
            Consulta Placa
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

          {/* Upsell Card */}
          <Card className="shadow-strong border-2 border-primary/30">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-3">
                  Quer saber mais sobre este veículo?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Obtenha o relatório completo com todas as informações por apenas
                </p>
                <div className="text-5xl font-bold text-accent my-4">R$ 9,90</div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Débitos e Pendências</div>
                    <div className="text-sm text-muted-foreground">IPVA, multas, licenciamento e taxas</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Histórico de Sinistros</div>
                    <div className="text-sm text-muted-foreground">Acidentes, perdas totais e roubos registrados</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Restrições e Recalls</div>
                    <div className="text-sm text-muted-foreground">Bloqueios judiciais e recalls do fabricante</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">E muito mais...</div>
                    <div className="text-sm text-muted-foreground">Relatório completo disponível para download em PDF</div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGetFullReport}
                className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-smooth"
              >
                Obter Relatório Completo - R$ 9,90
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Pagamento 100% seguro • Resultado instantâneo
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
