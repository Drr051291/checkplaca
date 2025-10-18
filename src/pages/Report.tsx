import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Car, AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Report = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plate = searchParams.get('plate') || '';

  // Mock comprehensive report data
  const reportData = {
    vehicle: {
      plate: plate,
      brand: "VOLKSWAGEN",
      model: "GOL 1.6 TOTAL FLEX",
      year: "2018/2019",
      color: "BRANCO",
      chassis: "9BWCA05U8JP******",
      renavam: "00123456789"
    },
    ipva: {
      status: "Pago",
      year: 2025,
      value: "R$ 1.245,80",
      paidDate: "15/01/2025"
    },
    fines: {
      total: 2,
      totalValue: "R$ 293,47",
      items: [
        { date: "12/08/2024", description: "Estacionar em local proibido", value: "R$ 130,16", status: "Pendente" },
        { date: "05/03/2024", description: "Excesso de velocidade", value: "R$ 163,31", status: "Pendente" }
      ]
    },
    restrictions: {
      judicial: false,
      theft: false,
      administrative: false
    },
    accidents: {
      total: 0,
      hasRecords: false
    },
    recalls: {
      total: 1,
      items: [
        { campaign: "2024-001", description: "Airbag do motorista", status: "Pendente de realização" }
      ]
    }
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert("Em uma aplicação real, o PDF seria gerado e baixado aqui.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mb-2"
              >
                <ArrowLeft className="mr-2" />
                Nova Consulta
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                AutoCheck Express
              </h1>
            </div>
            <Button 
              onClick={handleDownloadPDF}
              className="gradient-accent"
            >
              <Download className="mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Card */}
          <Card className="shadow-strong">
            <CardHeader className="bg-gradient-primary text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Car className="w-8 h-8" />
                  <div>
                    <div className="text-sm opacity-90">Relatório Completo</div>
                    <div className="text-3xl font-bold tracking-wider">{reportData.vehicle.plate}</div>
                  </div>
                </CardTitle>
                <Badge className="bg-accent text-accent-foreground text-sm px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Relatório Pago
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Marca/Modelo</div>
                  <div className="font-semibold">{reportData.vehicle.brand}</div>
                  <div className="text-sm">{reportData.vehicle.model}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ano</div>
                  <div className="font-semibold">{reportData.vehicle.year}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Cor</div>
                  <div className="font-semibold">{reportData.vehicle.color}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">RENAVAM</div>
                  <div className="font-semibold">{reportData.vehicle.renavam}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IPVA Section */}
          <Card className="shadow-soft">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-accent" />
                IPVA {reportData.ipva.year}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge className="bg-accent text-accent-foreground">
                    {reportData.ipva.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Valor</div>
                  <div className="font-semibold text-lg">{reportData.ipva.value}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Data de Pagamento</div>
                  <div className="font-semibold">{reportData.ipva.paidDate}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fines Section */}
          <Card className="shadow-soft">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                Multas e Infrações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Total de multas</div>
                  <div className="text-2xl font-bold text-destructive">{reportData.fines.total}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Valor total</div>
                  <div className="text-2xl font-bold text-destructive">{reportData.fines.totalValue}</div>
                </div>
              </div>
              <div className="space-y-3">
                {reportData.fines.items.map((fine, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg bg-background">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{fine.description}</div>
                        <div className="text-sm text-muted-foreground">Data: {fine.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-destructive text-lg">{fine.value}</div>
                        <Badge variant="destructive" className="mt-1">{fine.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Restrictions Section */}
          <Card className="shadow-soft">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Restrições
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  {reportData.restrictions.judicial ? (
                    <XCircle className="w-6 h-6 text-destructive" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-accent" />
                  )}
                  <div>
                    <div className="font-semibold">Judicial</div>
                    <div className="text-sm text-muted-foreground">
                      {reportData.restrictions.judicial ? "Possui restrição" : "Sem restrições"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  {reportData.restrictions.theft ? (
                    <XCircle className="w-6 h-6 text-destructive" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-accent" />
                  )}
                  <div>
                    <div className="font-semibold">Roubo/Furto</div>
                    <div className="text-sm text-muted-foreground">
                      {reportData.restrictions.theft ? "Possui registro" : "Sem registros"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  {reportData.restrictions.administrative ? (
                    <XCircle className="w-6 h-6 text-destructive" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-accent" />
                  )}
                  <div>
                    <div className="font-semibold">Administrativa</div>
                    <div className="text-sm text-muted-foreground">
                      {reportData.restrictions.administrative ? "Possui restrição" : "Sem restrições"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accidents Section */}
          <Card className="shadow-soft">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <Car className="w-6 h-6 text-primary" />
                Histórico de Sinistros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-accent" />
                <div>
                  <div className="font-semibold text-lg">Nenhum sinistro registrado</div>
                  <div className="text-sm text-muted-foreground">
                    Não foram encontrados registros de acidentes ou perdas totais
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recalls Section */}
          <Card className="shadow-soft">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                Recalls do Fabricante
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {reportData.recalls.total > 0 ? (
                <div className="space-y-3">
                  {reportData.recalls.items.map((recall, index) => (
                    <div key={index} className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold mb-1">{recall.description}</div>
                          <div className="text-sm text-muted-foreground">Campanha: {recall.campaign}</div>
                        </div>
                        <Badge variant="outline" className="border-orange-500 text-orange-700 dark:text-orange-400">
                          {recall.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <div className="text-sm text-muted-foreground mt-4">
                    ⚠️ Recomendamos procurar uma concessionária autorizada para realizar o recall
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-accent" />
                  <div>
                    <div className="font-semibold text-lg">Nenhum recall pendente</div>
                    <div className="text-sm text-muted-foreground">
                      Não há campanhas de recall ativas para este veículo
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              onClick={handleDownloadPDF}
              size="lg"
              className="gradient-accent"
            >
              <Download className="mr-2" />
              Baixar Relatório em PDF
            </Button>
            <Button 
              onClick={() => navigate('/')}
              size="lg"
              variant="outline"
            >
              Fazer Nova Consulta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
