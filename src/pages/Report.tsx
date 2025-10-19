import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Car, AlertTriangle, CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Report = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const reportId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        toast({
          title: "Erro",
          description: "ID do relatório não encontrado",
          variant: "destructive",
        });
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

        setReportData(data.report_data);
      } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        toast({
          title: "Erro ao carregar relatório",
          description: "Não foi possível carregar os dados do relatório",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, navigate, toast]);

  const handleDownloadPDF = () => {
    toast({
      title: "Função em desenvolvimento",
      description: "A geração de PDF estará disponível em breve",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  // Extract vehicle data from API response
  const vehicleInfo = reportData.vehicleInfo;
  const plate = reportData.plate;

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
                    <div className="text-3xl font-bold tracking-wider">{plate}</div>
                  </div>
                </CardTitle>
                <Badge className="bg-accent text-accent-foreground text-sm px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Consulta Realizada
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {vehicleInfo ? (
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Marca/Modelo</div>
                    <div className="font-semibold">{vehicleInfo.marca || 'N/A'}</div>
                    <div className="text-sm">{vehicleInfo.modelo || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Ano</div>
                    <div className="font-semibold">{vehicleInfo.ano_fabricacao}/{vehicleInfo.ano_modelo || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Cor</div>
                    <div className="font-semibold">{vehicleInfo.cor || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">RENAVAM</div>
                    <div className="font-semibold">{vehicleInfo.renavam || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                  <p>Dados do veículo não disponíveis no momento</p>
                  <p className="text-sm mt-2">Algumas informações podem estar temporariamente indisponíveis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* IPVA Section */}
          {vehicleInfo?.debitos_ipva && (
            <Card className="shadow-soft">
              <CardHeader className="bg-secondary/50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  IPVA e Débitos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {vehicleInfo.debitos_ipva.length > 0 ? (
                    vehicleInfo.debitos_ipva.map((debito: any, index: number) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold mb-1">Ano: {debito.ano || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">
                              Valor: {debito.valor ? `R$ ${debito.valor}` : 'N/A'}
                            </div>
                          </div>
                          <Badge variant={debito.situacao === 'PAGO' ? 'default' : 'destructive'}>
                            {debito.situacao || 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-accent" />
                      <div>
                        <div className="font-semibold text-lg">IPVA em dia</div>
                        <div className="text-sm text-muted-foreground">
                          Não foram encontrados débitos de IPVA
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Restrictions Section */}
          <Card className="shadow-soft">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Restrições e Gravames
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {vehicleInfo?.restricoes && vehicleInfo.restricoes.length > 0 ? (
                <div className="space-y-3">
                  {vehicleInfo.restricoes.map((restricao: any, index: number) => (
                    <div key={index} className="p-4 border border-destructive/50 bg-destructive/5 rounded-lg">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                        <div>
                          <div className="font-semibold">{restricao.tipo || 'Restrição'}</div>
                          <div className="text-sm text-muted-foreground">{restricao.descricao || 'Detalhes não disponíveis'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-accent" />
                  <div>
                    <div className="font-semibold text-lg">Sem restrições</div>
                    <div className="text-sm text-muted-foreground">
                      Não foram encontradas restrições ou gravames para este veículo
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recalls Section */}
          {reportData.recall && (
            <Card className="shadow-soft">
              <CardHeader className="bg-secondary/50">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  Recalls do Fabricante
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {reportData.recall.recalls && reportData.recall.recalls.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.recall.recalls.map((recall: any, index: number) => (
                      <div key={index} className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold mb-1">{recall.descricao || 'Recall'}</div>
                            <div className="text-sm text-muted-foreground">
                              Campanha: {recall.numero_campanha || 'N/A'}
                            </div>
                          </div>
                          <Badge variant="outline" className="border-orange-500 text-orange-700 dark:text-orange-400">
                            {recall.status || 'Pendente'}
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
          )}

          {/* Leilão Section */}
          {reportData.leilao && reportData.leilao.leiloes && reportData.leilao.leiloes.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader className="bg-secondary/50">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  Histórico de Leilões
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {reportData.leilao.leiloes.map((leilao: any, index: number) => (
                    <div key={index} className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">{leilao.leiloeiro || 'Leilão'}</div>
                          <div className="text-sm text-muted-foreground">
                            Data: {leilao.data || 'N/A'}
                          </div>
                          {leilao.lote && (
                            <div className="text-sm text-muted-foreground">
                              Lote: {leilao.lote}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Data Debug (only in development) */}
          {import.meta.env.DEV && (
            <Card className="shadow-soft">
              <CardHeader className="bg-secondary/50">
                <CardTitle>Dados Brutos (Debug)</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="text-xs overflow-auto max-h-96 bg-muted p-4 rounded">
                  {JSON.stringify(reportData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

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