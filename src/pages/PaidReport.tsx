import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Car, Share2, Image as ImageIcon, Loader2, CheckCircle, AlertTriangle, DollarSign, FileWarning, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PaidReport = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [showAllFipeVersions, setShowAllFipeVersions] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!token) {
        toast({
          title: "Erro",
          description: "Token de acesso não encontrado",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('get-report', {
          body: { publicAccessToken: token }
        });

        if (error) throw error;

        if (!data?.success) {
          throw new Error(data?.error || 'Erro ao buscar relatório');
        }

        if (!data.isPaid) {
          toast({
            title: "Acesso negado",
            description: "Pagamento não confirmado",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setReport(data.report);
      } catch (error: any) {
        console.error('[PaidReport] Error:', error);
        toast({
          title: "Erro ao carregar relatório",
          description: error.message || "Tente novamente",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token, navigate, toast]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        width: 1200
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const totalPages = Math.ceil(imgHeight / pdfHeight);
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const yOffset = -page * pdfHeight;
        pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, imgHeight);
      }
      
      pdf.save(`relatorio-${report.placa}-${Date.now()}.pdf`);
      
      toast({
        title: "PDF baixado!",
        description: `Relatório salvo com ${totalPages} página(s)`,
      });
    } catch (error) {
      console.error('PDF error:', error);
      toast({
        title: "Erro ao gerar PDF",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    
    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        width: 1200
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `relatorio-${report.placa}-${Date.now()}.jpg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({ title: "Imagem baixada!" });
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      toast({ title: "Erro ao gerar imagem", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando relatório completo...</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const { vehicleInfo, dadosTecnicos, dadosCarga, fipe, renainf } = report;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="ghost" onClick={() => navigate('/')} className="mb-2">
                <ArrowLeft className="mr-2" />
                Nova Consulta
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent]">
                Checkplaca
              </h1>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDownloadPDF} className="gradient-primary" disabled={generating}>
                <Download className="mr-2" />
                {generating ? 'Gerando...' : 'PDF'}
              </Button>
              <Button onClick={handleDownloadImage} className="gradient-accent" disabled={generating}>
                <ImageIcon className="mr-2" />
                Imagem
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div ref={reportRef} className="max-w-6xl mx-auto space-y-6 bg-background">
          {/* Header Card */}
          <Card className="shadow-strong">
            <CardHeader className="bg-gradient-primary text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Car className="w-8 h-8" />
                  <div>
                    <div className="text-sm opacity-90">Relatório Completo</div>
                    <div className="text-3xl font-bold tracking-wider">{report.placa}</div>
                  </div>
                </CardTitle>
                <Badge className="bg-accent text-accent-foreground text-sm px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Pago
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Identificação do Veículo */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Identificação do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem label="Marca/Modelo" value={vehicleInfo?.marca_modelo} />
                <InfoItem label="Ano Fab./Modelo" value={`${vehicleInfo?.ano_fabricacao || '-'}/${vehicleInfo?.ano_modelo || '-'}`} />
                <InfoItem label="Cor" value={vehicleInfo?.cor} />
                <InfoItem label="Combustível" value={vehicleInfo?.combustivel} />
                <InfoItem label="Chassi" value={vehicleInfo?.chassi} />
                <InfoItem label="Renavam" value={vehicleInfo?.renavam} />
                <InfoItem label="Tipo" value={vehicleInfo?.tipo_veiculo} />
                <InfoItem label="Segmento" value={vehicleInfo?.segmento} />
                <InfoItem label="Procedência" value={vehicleInfo?.procedencia} />
                <InfoItem label="Município/UF" value={`${vehicleInfo?.municipio || '-'}/${vehicleInfo?.uf || '-'}`} />
              </div>
            </CardContent>
          </Card>

          {/* Dados Técnicos */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Dados Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem label="Motor" value={dadosTecnicos?.numero_motor} />
                <InfoItem label="Câmbio" value={dadosTecnicos?.numero_caixa_cambio} />
                <InfoItem label="Potência" value={dadosTecnicos?.potencia} />
                <InfoItem label="Cilindradas" value={dadosTecnicos?.cilindradas} />
                <InfoItem label="Sub-segmento" value={dadosTecnicos?.sub_segmento} />
              </div>
            </CardContent>
          </Card>

          {/* Capacidades */}
          {dadosCarga && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Capacidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoItem label="Eixos" value={dadosCarga.numero_eixos} />
                  <InfoItem label="Cap. Tração" value={dadosCarga.capacidade_maxima_tracao} />
                  <InfoItem label="Passageiros" value={dadosCarga.capacidade_passageiro} />
                  <InfoItem label="Peso Bruto" value={dadosCarga.peso_bruto_total} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* FIPE Section */}
          <Card className="shadow-strong border-2 border-primary/20">
            <CardHeader className="bg-gradient-subtle">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Preço FIPE
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {fipe?.found ? (
                <div className="space-y-4">
                  {/* Versão mais provável */}
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-1">Versão mais provável</div>
                    <div className="font-semibold text-lg">{fipe.versaoMaisProvavel?.modelo}</div>
                    <div className="text-3xl font-bold text-primary mt-2">{fipe.versaoMaisProvavel?.preco}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Mês de referência: {fipe.mesReferencia}
                    </div>
                  </div>

                  {/* Faixa de preço */}
                  {fipe.faixaPreco && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Faixa de preço (todas as versões)</div>
                      <div className="font-semibold">
                        {fipe.faixaPreco.minFormatted} - {fipe.faixaPreco.maxFormatted}
                      </div>
                    </div>
                  )}

                  {/* Lista de versões */}
                  {fipe.todasVersoes?.length > 1 && (
                    <div>
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowAllFipeVersions(!showAllFipeVersions)}
                        className="w-full justify-between"
                      >
                        Ver todas as {fipe.todasVersoes.length} versões
                        {showAllFipeVersions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      
                      {showAllFipeVersions && (
                        <div className="mt-2 space-y-2 max-h-64 overflow-auto">
                          {fipe.todasVersoes.map((v: any, i: number) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                              <div className="text-sm">{v.modelo}</div>
                              <div className="font-semibold">{v.preco}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explicação */}
                  <Alert>
                    <AlertDescription className="text-sm text-muted-foreground">
                      {fipe.explicacao}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertTitle>FIPE não encontrado</AlertTitle>
                  <AlertDescription>
                    {fipe?.message || 'Não foi possível localizar um preço FIPE para esta combinação.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* RENAINF Section */}
          <Card className="shadow-strong border-2 border-destructive/20">
            <CardHeader className="bg-destructive/5">
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-destructive" />
                Débitos por Infrações (RENAINF)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {renainf?.found ? (
                <div className="space-y-4">
                  {renainf.possuiInfracoes ? (
                    <>
                      <Alert variant="destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertTitle>Infrações encontradas</AlertTitle>
                        <AlertDescription>
                          Este veículo possui {renainf.infracoes?.length || 0} infração(ões) registrada(s).
                        </AlertDescription>
                      </Alert>

                      {/* Lista de infrações */}
                      <div className="space-y-3">
                        {renainf.infracoes?.map((inf: any, i: number) => (
                          <div key={i} className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
                            <div className="font-semibold mb-2">{inf.descricao}</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-muted-foreground">Auto nº:</span> {inf.numeroAuto}</div>
                              <div><span className="text-muted-foreground">Valor:</span> {inf.valor}</div>
                              <div><span className="text-muted-foreground">Órgão:</span> {inf.orgaoAutuador}</div>
                              <div><span className="text-muted-foreground">Data:</span> {inf.dataHora}</div>
                              <div className="col-span-2"><span className="text-muted-foreground">Local:</span> {inf.localMunicipio}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Alert className="bg-accent/10 border-accent">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <AlertTitle>Nenhuma infração encontrada</AlertTitle>
                      <AlertDescription>
                        Este veículo não possui infrações RENAINF registradas.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Aviso */}
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription className="text-sm">
                      {renainf.aviso}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    {renainf?.message || 'Não foi possível consultar débitos por infrações.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground py-6">
            <p>Relatório gerado em {new Date().toLocaleString('pt-BR')}</p>
            <p className="mt-1">Checkplaca - Consulta Veicular</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="font-medium">{value || 'N/D'}</div>
  </div>
);

export default PaidReport;
