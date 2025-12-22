import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Car, Image as ImageIcon, Loader2, CheckCircle, AlertTriangle, DollarSign, FileWarning, ChevronDown, ChevronUp, Info, Calendar, Cog } from "lucide-react";
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
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 900,
        width: 900
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const totalPages = Math.ceil(imgHeight / (pdfHeight - 20));
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const yOffset = -page * (pdfHeight - 20) + 10;
        pdf.addImage(imgData, 'JPEG', 10, yOffset, imgWidth, imgHeight);
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
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 900,
        width: 900
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
      }, 'image/jpeg', 0.92);
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
    <div className="min-h-screen bg-background print:bg-white">
      {/* Header - Hide on print */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50 print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="ghost" onClick={() => navigate('/')} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nova Consulta
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent]">
                Checkplaca
              </h1>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDownloadPDF} className="gradient-primary" disabled={generating}>
                <Download className="mr-2 h-4 w-4" />
                {generating ? 'Gerando...' : 'PDF'}
              </Button>
              <Button onClick={handleDownloadImage} variant="outline" disabled={generating}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Imagem
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 print:py-4 print:px-2">
        <div 
          ref={reportRef} 
          className="max-w-4xl mx-auto space-y-6 bg-background print:space-y-4"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {/* Header Card */}
          <Card className="shadow-strong border-0 overflow-hidden print:shadow-none print:border print:border-border break-inside-avoid">
            <CardHeader className="bg-gradient-primary text-white py-6 print:py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center print:w-10 print:h-10">
                    <Car className="w-6 h-6 print:w-5 print:h-5" />
                  </div>
                  <div>
                    <div className="text-sm opacity-90 font-normal">Relatório Completo</div>
                    <div className="text-3xl font-bold tracking-wider print:text-2xl">{report.placa}</div>
                  </div>
                </CardTitle>
                <Badge className="bg-accent text-accent-foreground text-sm px-4 py-2 print:px-2 print:py-1">
                  <CheckCircle className="w-4 h-4 mr-2 print:w-3 print:h-3" />
                  Pago
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Identificação do Veículo */}
          <Card className="shadow-soft print:shadow-none print:border print:border-border break-inside-avoid">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="w-5 h-5 text-primary" />
                Identificação do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 print:grid-cols-3 print:gap-x-4 print:gap-y-2">
                <InfoItem label="Marca/Modelo" value={vehicleInfo?.marca_modelo} highlight />
                <InfoItem label="Ano Fab./Modelo" value={`${vehicleInfo?.ano_fabricacao || '-'}/${vehicleInfo?.ano_modelo || '-'}`} highlight />
                <InfoItem label="Cor" value={vehicleInfo?.cor} />
                <InfoItem label="Combustível" value={vehicleInfo?.combustivel} />
                <InfoItem label="Chassi" value={vehicleInfo?.chassi} mono />
                <InfoItem label="Renavam" value={vehicleInfo?.renavam} mono />
                <InfoItem label="Tipo" value={vehicleInfo?.tipo_veiculo} />
                <InfoItem label="Segmento" value={vehicleInfo?.segmento} />
                <InfoItem label="Procedência" value={vehicleInfo?.procedencia} />
                <InfoItem label="Município/UF" value={`${vehicleInfo?.municipio || '-'}/${vehicleInfo?.uf || '-'}`} />
              </div>
            </CardContent>
          </Card>

          {/* Dados Técnicos */}
          <Card className="shadow-soft print:shadow-none print:border print:border-border break-inside-avoid">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cog className="w-5 h-5 text-primary" />
                Dados Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 print:grid-cols-3 print:gap-x-4 print:gap-y-2">
                <InfoItem label="Motor" value={dadosTecnicos?.numero_motor} mono />
                <InfoItem label="Câmbio" value={dadosTecnicos?.numero_caixa_cambio} mono />
                <InfoItem label="Potência" value={dadosTecnicos?.potencia} />
                <InfoItem label="Cilindradas" value={dadosTecnicos?.cilindradas} />
                <InfoItem label="Sub-segmento" value={dadosTecnicos?.sub_segmento} />
              </div>
            </CardContent>
          </Card>

          {/* Capacidades */}
          {dadosCarga && (
            <Card className="shadow-soft print:shadow-none print:border print:border-border break-inside-avoid">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Capacidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 print:grid-cols-4 print:gap-x-4 print:gap-y-2">
                  <InfoItem label="Eixos" value={dadosCarga.numero_eixos} />
                  <InfoItem label="Cap. Tração" value={dadosCarga.capacidade_maxima_tracao} />
                  <InfoItem label="Passageiros" value={dadosCarga.capacidade_passageiro} />
                  <InfoItem label="Peso Bruto" value={dadosCarga.peso_bruto_total} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* FIPE Section */}
          <Card className="shadow-strong border-2 border-primary/20 print:shadow-none print:border print:border-primary/30 break-inside-avoid">
            <CardHeader className="bg-primary/5 pb-3 print:bg-primary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Preço FIPE
                </CardTitle>
                {fipe?.found && fipe?.mesReferencia && (
                  <Badge variant="outline" className="text-xs font-normal">
                    <Calendar className="w-3 h-3 mr-1" />
                    Mês de referência: {fipe.mesReferencia}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 print:pt-4">
              {fipe?.found ? (
                <div className="space-y-5 print:space-y-3">
                  {/* Versão mais provável */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20 print:p-4 print:rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1 font-medium">Versão mais provável</div>
                    <div className="font-semibold text-base text-foreground/90 mb-3">
                      {fipe.versaoMaisProvavel?.modelo}
                    </div>
                    <div className="text-4xl font-bold text-primary print:text-3xl">
                      {fipe.versaoMaisProvavel?.precoFormatted || 'N/D'}
                    </div>
                    {fipe.versaoMaisProvavel?.codigoFipe && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Código FIPE: {fipe.versaoMaisProvavel.codigoFipe}
                      </div>
                    )}
                  </div>

                  {/* Faixa de preço */}
                  {fipe.faixaPreco && (
                    <div className="bg-muted/50 rounded-lg p-4 print:p-3">
                      <div className="text-sm text-muted-foreground mb-2 font-medium">
                        Faixa de preço (todas as versões)
                      </div>
                      <div className="font-semibold text-lg">
                        {fipe.faixaPreco.minFormatted} — {fipe.faixaPreco.maxFormatted}
                      </div>
                    </div>
                  )}

                  {/* Lista de versões */}
                  {fipe.todasVersoes?.length > 1 && (
                    <div className="print:hidden">
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowAllFipeVersions(!showAllFipeVersions)}
                        className="w-full justify-between hover:bg-muted/50"
                      >
                        <span className="text-sm font-medium">
                          Ver todas as {fipe.todasVersoes.length} versões
                        </span>
                        {showAllFipeVersions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      
                      {showAllFipeVersions && (
                        <div className="mt-3 space-y-2 max-h-72 overflow-auto border rounded-lg p-3">
                          {fipe.todasVersoes.map((v: any, i: number) => (
                            <div 
                              key={i} 
                              className="flex justify-between items-start py-2 px-3 bg-muted/30 rounded-lg gap-4"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{v.modelo}</div>
                                <div className="text-xs text-muted-foreground">{v.codigoFipe}</div>
                              </div>
                              <div className="font-semibold text-primary whitespace-nowrap">
                                {v.precoFormatted}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Print-only version list */}
                  {fipe.todasVersoes?.length > 1 && (
                    <div className="hidden print:block">
                      <div className="text-sm font-medium mb-2">Todas as versões ({fipe.todasVersoes.length}):</div>
                      <div className="space-y-1 text-xs">
                        {fipe.todasVersoes.slice(0, 5).map((v: any, i: number) => (
                          <div key={i} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                            <span className="truncate mr-2">{v.modelo}</span>
                            <span className="font-medium whitespace-nowrap">{v.precoFormatted}</span>
                          </div>
                        ))}
                        {fipe.todasVersoes.length > 5 && (
                          <div className="text-muted-foreground italic">
                            ...e mais {fipe.todasVersoes.length - 5} versões
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Explicação */}
                  <Alert className="bg-blue-50/50 border-blue-200/50 print:bg-muted/30 print:border-border">
                    <Info className="w-4 h-4 text-blue-600 print:text-foreground" />
                    <AlertDescription className="text-sm text-muted-foreground leading-relaxed">
                      {fipe.explicacao}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">FIPE não encontrado</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    {fipe?.message || 'Não foi possível localizar um preço FIPE para esta combinação. Isso pode ocorrer quando há divergência de versão/modelo. Tente novamente mais tarde.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* RENAINF Section */}
          <Card className={`shadow-strong border-2 print:shadow-none print:border break-inside-avoid ${
            renainf?.possuiInfracoes 
              ? 'border-destructive/30 print:border-destructive/40' 
              : 'border-accent/30 print:border-accent/40'
          }`}>
            <CardHeader className={`pb-3 ${renainf?.possuiInfracoes ? 'bg-destructive/5' : 'bg-accent/5'}`}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileWarning className={`w-5 h-5 ${renainf?.possuiInfracoes ? 'text-destructive' : 'text-accent'}`} />
                Débitos por Infrações (RENAINF)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 print:pt-4">
              {renainf?.found ? (
                <div className="space-y-4 print:space-y-3">
                  {renainf.possuiInfracoes ? (
                    <>
                      <Alert className="bg-destructive/10 border-destructive/30">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <AlertTitle className="text-destructive">Infrações encontradas</AlertTitle>
                        <AlertDescription className="text-destructive/80">
                          Este veículo possui {renainf.infracoes?.length || 0} infração(ões) registrada(s).
                        </AlertDescription>
                      </Alert>

                      {/* Lista de infrações */}
                      <div className="space-y-3 print:space-y-2">
                        {renainf.infracoes?.map((inf: any, i: number) => (
                          <div 
                            key={i} 
                            className="bg-destructive/5 rounded-lg p-4 border border-destructive/20 break-inside-avoid print:p-3"
                          >
                            <div className="font-semibold mb-3 text-destructive/90 print:mb-2">{inf.descricao}</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm print:text-xs">
                              <div>
                                <span className="text-muted-foreground">Auto nº:</span>{' '}
                                <span className="font-medium">{inf.numeroAuto}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Valor:</span>{' '}
                                <span className="font-semibold text-destructive">{inf.valorFormatted || inf.valor}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Órgão:</span>{' '}
                                <span className="font-medium">{inf.orgaoAutuador}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Data:</span>{' '}
                                <span className="font-medium">{inf.dataHora}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Local:</span>{' '}
                                <span className="font-medium">{inf.localMunicipio}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Alert className="bg-accent/10 border-accent/30">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <AlertTitle className="text-accent">Nenhuma infração encontrada</AlertTitle>
                      <AlertDescription className="text-accent/80">
                        Este veículo não possui infrações RENAINF registradas.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Aviso */}
                  <Alert className="bg-muted/30 border-border print:bg-muted/50">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <AlertDescription className="text-sm text-muted-foreground">
                      {renainf.aviso}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert className="bg-muted/50">
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-muted-foreground">
                    {renainf?.message || 'Não foi possível consultar débitos por infrações.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground py-6 print:py-4 print:border-t print:border-border print:mt-4">
            <p className="font-medium">Relatório gerado em {new Date().toLocaleString('pt-BR')}</p>
            <p className="mt-1 text-xs">Checkplaca - Consulta Veicular Completa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
  mono?: boolean;
}

const InfoItem = ({ label, value, highlight, mono }: InfoItemProps) => (
  <div className="min-w-0">
    <div className="text-xs text-muted-foreground mb-1 font-medium print:text-[10px]">{label}</div>
    <div className={`${highlight ? 'font-semibold' : 'font-medium'} ${mono ? 'font-mono text-sm' : ''} truncate print:text-sm`}>
      {value || 'N/D'}
    </div>
  </div>
);

export default PaidReport;
