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
  const recalls = reportData.recalls || [];
  const rawData = reportData.raw?.dados?.informacoes_veiculo || {};
  const dadosTecnicos = rawData.dados_tecnicos || {};
  const dadosCarga = rawData.dados_carga || {};

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
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Marca/Modelo</div>
                      <div className="font-semibold text-lg">{vehicleInfo.marca_modelo || rawData.dados_veiculo?.modelo || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Ano Fabricação/Modelo</div>
                      <div className="font-semibold text-lg">{vehicleInfo.ano_fabricacao || 'N/A'} / {vehicleInfo.ano_modelo || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Placa</div>
                      <div className="font-semibold text-lg tracking-wider">{vehicleInfo.placa || plate || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4">Identificação do Veículo</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Chassi</div>
                        <div className="font-mono text-sm font-semibold">{vehicleInfo.chassi || 'N/A'}</div>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Renavam</div>
                        <div className="font-mono text-sm font-semibold">{vehicleInfo.renavam || rawData.dados_veiculo?.renavam || 'N/A'}</div>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Cor</div>
                        <div className="font-semibold text-sm">{vehicleInfo.cor || rawData.dados_veiculo?.cor || 'N/A'}</div>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Combustível</div>
                        <div className="font-semibold text-sm">{vehicleInfo.combustivel || rawData.dados_veiculo?.combustivel || 'N/A'}</div>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Categoria</div>
                        <div className="font-semibold text-sm">{vehicleInfo.categoria || rawData.dados_veiculo?.segmento || 'N/A'}</div>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Procedência</div>
                        <div className="font-semibold text-sm">{rawData.dados_veiculo?.procedencia || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4">Localização</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Município</div>
                        <div className="font-semibold text-sm">{vehicleInfo.municipio || rawData.dados_veiculo?.municipio || 'N/A'}</div>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">UF</div>
                        <div className="font-semibold text-sm">{vehicleInfo.uf || rawData.dados_veiculo?.uf_municipio || 'N/A'}</div>
                      </div>
                    </div>
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

          {/* Technical Data Section */}
          {(dadosTecnicos && Object.keys(dadosTecnicos).length > 0) && (
            <Card className="shadow-soft">
              <CardHeader className="bg-secondary/50">
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-6 h-6 text-primary" />
                  Dados Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dadosTecnicos.tipo_veiculo && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Tipo de Veículo</div>
                      <div className="font-semibold text-sm">{dadosTecnicos.tipo_veiculo}</div>
                    </div>
                  )}
                  {dadosTecnicos.sub_segmento && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Sub-segmento</div>
                      <div className="font-semibold text-sm">{dadosTecnicos.sub_segmento}</div>
                    </div>
                  )}
                  {dadosTecnicos.numero_motor && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Número do Motor</div>
                      <div className="font-mono text-sm font-semibold">{dadosTecnicos.numero_motor}</div>
                    </div>
                  )}
                  {dadosTecnicos.numero_caixa_cambio && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Número Caixa de Câmbio</div>
                      <div className="font-mono text-sm font-semibold">{dadosTecnicos.numero_caixa_cambio}</div>
                    </div>
                  )}
                  {dadosTecnicos.potencia && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Potência</div>
                      <div className="font-semibold text-sm">{dadosTecnicos.potencia} CV</div>
                    </div>
                  )}
                  {dadosTecnicos.cilindradas && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Cilindradas</div>
                      <div className="font-semibold text-sm">{dadosTecnicos.cilindradas} cc</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cargo Data Section */}
          {(dadosCarga && Object.keys(dadosCarga).length > 0) && (
            <Card className="shadow-soft">
              <CardHeader className="bg-secondary/50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Capacidades e Carga
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dadosCarga.numero_eixos && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Número de Eixos</div>
                      <div className="font-semibold text-sm">{dadosCarga.numero_eixos}</div>
                    </div>
                  )}
                  {dadosCarga.capacidade_passageiro && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Capacidade Passageiros</div>
                      <div className="font-semibold text-sm">{dadosCarga.capacidade_passageiro}</div>
                    </div>
                  )}
                  {dadosCarga.capacidade_maxima_tracao && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Capacidade Máx. Tração</div>
                      <div className="font-semibold text-sm">{dadosCarga.capacidade_maxima_tracao} kg</div>
                    </div>
                  )}
                  {dadosCarga.peso_bruto_total && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Peso Bruto Total</div>
                      <div className="font-semibold text-sm">{dadosCarga.peso_bruto_total} kg</div>
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
          <Card className="shadow-soft">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                Recalls do Fabricante
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recalls && recalls.length > 0 ? (
                <div className="space-y-3">
                  {recalls.map((recall: any, index: number) => (
                    <div key={index} className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold mb-1">{recall.descricao || 'Recall'}</div>
                          <div className="text-sm text-muted-foreground">
                            Identificador: {recall.identificador || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Data: {recall.normalizado_data_registro || recall.data_registro || 'N/A'}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-orange-500 text-orange-700 dark:text-orange-400">
                          {recall.situacao || 'Pendente'}
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