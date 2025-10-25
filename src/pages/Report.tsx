import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Car, AlertTriangle, CheckCircle, XCircle, FileText, Loader2, Share2, Image as ImageIcon, Lock, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CarBrandLogo from "@/components/CarBrandLogo";

const Report = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const reportId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [hasPaidPlan, setHasPaidPlan] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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

        // Check if user has paid for this report
        const { data: paymentData } = await supabase
          .from('payments')
          .select('*')
          .eq('report_id', reportId)
          .eq('status', 'paid')
          .maybeSingle();

        setHasPaidPlan(!!paymentData);
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

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`relatorio-${plate}-${new Date().getTime()}.pdf`);
      
      toast({
        title: "PDF baixado com sucesso!",
        description: "O relatório foi salvo no seu dispositivo",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
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
        backgroundColor: '#ffffff'
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `relatorio-${plate}-${new Date().getTime()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Imagem baixada com sucesso!",
            description: "O relatório foi salvo como imagem",
          });
        }
      });
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast({
        title: "Erro ao gerar imagem",
        description: "Não foi possível gerar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!reportRef.current) return;
    
    const vehicleName = vehicleInfo?.marca_modelo || rawData?.dados_veiculo?.modelo || 'Veículo';
    const message = `🚗 *Relatório de Veículo - Consulta Placa*\n\n` +
      `📋 Placa: *${plate}*\n` +
      `🚘 ${vehicleName}\n` +
      `📅 Ano: ${vehicleInfo?.ano_fabricacao}/${vehicleInfo?.ano_modelo}\n\n` +
      `✅ Consulta realizada com sucesso!\n` +
      `🔍 Acesse: ${window.location.origin}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Compartilhar no WhatsApp",
      description: "Abrindo WhatsApp para compartilhar...",
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
              <h1 className="text-2xl font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
                Consulta Placa
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleDownloadPDF}
                className="gradient-primary"
                disabled={generating}
              >
                <Download className="mr-2" />
                {generating ? 'Gerando...' : 'PDF'}
              </Button>
              <Button 
                onClick={handleDownloadImage}
                className="gradient-accent"
                disabled={generating}
              >
                <ImageIcon className="mr-2" />
                {generating ? 'Gerando...' : 'Imagem'}
              </Button>
              <Button 
                onClick={handleShareWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={generating}
              >
                <Share2 className="mr-2" />
                WhatsApp
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-3">
                  <Car className="w-8 h-8" />
                  <div>
                    <div className="text-sm opacity-90">Relatório Completo</div>
                    <div className="text-3xl font-bold tracking-wider">{plate}</div>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-4">
                  {vehicleInfo?.marca_modelo && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <CarBrandLogo brandName={vehicleInfo.marca_modelo} />
                    </div>
                  )}
                  <Badge className="bg-accent text-accent-foreground text-sm px-4 py-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Consulta Realizada
                  </Badge>
                </div>
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

          {/* Upgrade CTAs - Only show if user hasn't paid */}
          {!hasPaidPlan && (
            <>
              <Card className="shadow-strong border-2 border-accent/20 bg-secondary/20">
                <CardContent className="p-8 md:p-12">
                  <div className="text-center space-y-8">
                    <div>
                      <Badge className="bg-accent/10 text-accent border-accent/30 px-5 py-2 mb-6">
                        <Lock className="w-4 h-4 mr-2" />
                        Conteúdo Bloqueado
                      </Badge>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Quer ver o relatório completo?
                      </h2>
                      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Desbloqueie informações detalhadas sobre sinistros, recalls, débitos e muito mais
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                      {/* Plano Completo */}
                      <Card className="relative overflow-hidden hover:shadow-strong transition-smooth bg-background">
                        <CardHeader className="text-center pb-4">
                          <div className="mb-4">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl mb-2">Relatório Completo</CardTitle>
                            <div className="text-4xl font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
                              R$ 19,90
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                          <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">Dados completos do veículo</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">Histórico de sinistros</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">Débitos e multas</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">Recall do fabricante</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">Download em PDF</span>
                            </li>
                          </ul>
                          <Button 
                            className="w-full h-12 gradient-primary font-semibold hover:shadow-glow transition-all"
                            onClick={() => navigate(`/checkout?reportId=${reportId}&plan=completo&plate=${plate}`)}
                          >
                            Comprar Agora
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Plano Premium */}
                      <Card className="relative overflow-hidden border-2 border-accent/40 hover:shadow-strong transition-smooth bg-gradient-to-br from-accent/5 to-accent/10">
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-white text-accent font-semibold shadow-soft px-4 py-1.5">
                            Mais Popular
                          </Badge>
                        </div>
                        <CardHeader className="bg-gradient-accent text-white text-center pb-4 pt-6">
                          <div className="mb-4">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                              <Crown className="w-6 h-6 text-white" />
                            </div>
                            <CardTitle className="text-2xl mb-2">Premium Plus</CardTitle>
                            <div className="text-4xl font-bold">
                              R$ 39,90
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-6 bg-background">
                          <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm font-semibold">Tudo do plano Completo</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">Histórico de leilão</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">Rastreamento de roubo</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">Análise de mercado</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">Suporte prioritário</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">Validade de 30 dias</span>
                            </li>
                          </ul>
                          <Button 
                            className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold shadow-soft hover:shadow-strong transition-all"
                            onClick={() => navigate(`/checkout?reportId=${reportId}&plan=premium&plate=${plate}`)}
                          >
                            Comprar Agora
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      💳 Pagamento seguro via PIX ou Cartão • 🔒 Dados protegidos
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Resto do conteúdo só aparece se tiver pago */}
          {hasPaidPlan && (
            <>

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
          </>
          )}

          {/* Footer Actions - Only show for paid users */}
          {hasPaidPlan && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                onClick={handleDownloadPDF}
                size="lg"
                className="gradient-primary"
                disabled={generating}
              >
                <Download className="mr-2" />
                {generating ? 'Gerando PDF...' : 'Baixar Relatório em PDF'}
              </Button>
              <Button 
                onClick={handleDownloadImage}
                size="lg"
                className="gradient-accent"
                disabled={generating}
              >
                <ImageIcon className="mr-2" />
                {generating ? 'Gerando Imagem...' : 'Baixar como Imagem'}
              </Button>
              <Button 
                onClick={handleShareWhatsApp}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Share2 className="mr-2" />
                Compartilhar WhatsApp
              </Button>
              <Button 
                onClick={() => navigate('/')}
                size="lg"
                variant="outline"
              >
                Fazer Nova Consulta
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;