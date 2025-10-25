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
import { usePaymentTracking } from "@/hooks/usePaymentTracking";
import { trackViewItem, createProductData, trackPurchase } from "@/lib/analytics";

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

  // Track payment status changes for purchase event
  usePaymentTracking({ reportId: reportId || '', enabled: !!reportId });

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

        // Verifica acesso via função de backend (ignora RLS)
        const { data: accessResult, error: accessError } = await supabase.functions.invoke('report-access', {
          body: { reportId }
        });
        if (accessError) console.error('[Report] report-access error:', accessError);
        if (accessResult?.hasAccess) {
          setHasPaidPlan(true);
        } else {
          // Fallback: tentativa via consulta direta (quando RLS permitir)
          const { data: paymentData } = await supabase
            .from('payments')
            .select('*')
            .eq('report_id', reportId)
            .eq('status', 'paid')
            .maybeSingle();
          setHasPaidPlan(!!paymentData);
        }
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

    // Subscribe to payment status changes in realtime
    const channel = supabase
      .channel(`payment-status-${reportId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `report_id=eq.${reportId}`,
        },
        (payload) => {
          console.log('[Report] Payment change detected:', payload);
          const payment = payload.new as any;
          if (payment?.status === 'paid') {
            console.log('[Report] Payment confirmed, unlocking report');
            setHasPaidPlan(true);
            
            // Track purchase event for GA4 and Meta Pixel
            const planType = payment.plan_type === 'premium' ? 'premium' : 'completo';
            const value = parseFloat(payment.amount);
            const product = createProductData(planType, reportId);
            
            // Send Purchase event to GA4
            trackPurchase({
              transaction_id: payment.asaas_payment_id || reportId,
              value: value,
              currency: 'BRL',
              items: [product],
              payment_method: payment.payment_method,
            });
            
            // Send Purchase event to Meta Pixel
            if (window.fbq) {
              window.fbq('track', 'Purchase', {
                value: value,
                currency: 'BRL',
                content_name: `Relatório Veicular ${planType}`,
                content_type: 'product',
                content_ids: [reportId],
              });
              console.log('[Report] Purchase events sent to GA4 and Meta Pixel:', { value, currency: 'BRL' });
            }
            
            toast({
              title: "✅ Pagamento confirmado!",
              description: "Seu relatório completo já está disponível!",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    const message = `🚗 *Relatório de Veículo - Checkplaca*\n\n` +
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
  const leilao = reportData.leilao || {};
  const debitos = reportData.debitos || {};
  const restricoes = reportData.restricoes || {};
  const rawData = reportData.raw?.dados?.informacoes_veiculo || {};
  const dadosLeilao = reportData.raw?.dados?.leilao || {};
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
                Checkplaca
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Car className="w-8 h-8" />
                  <div>
                    <div className="text-sm opacity-90">Placa consultada</div>
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
                        <CardHeader className="relative overflow-hidden text-center pb-6 pt-8 bg-gradient-to-br from-accent via-accent to-accent-glow">
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                          <div className="relative z-10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                              <Crown className="w-8 h-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />
                            </div>
                            <CardTitle className="text-3xl mb-3 text-white font-display font-bold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                              Premium Plus
                            </CardTitle>
                            <div className="text-5xl font-display font-black text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)] tracking-tight">
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

          {/* Debts Section */}
          <Card className="shadow-soft">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Débitos e Multas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {debitos?.quantidade_total > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 border border-destructive/50 bg-destructive/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-lg text-destructive">
                        Total de Débitos: {debitos.quantidade_total}
                      </div>
                      {debitos.total_geral > 0 && (
                        <div className="text-2xl font-bold text-destructive">
                          R$ {debitos.total_geral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </div>

                  {debitos.ipva?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-destructive" />
                        IPVA ({debitos.ipva.length})
                      </h4>
                      {debitos.ipva.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="grid md:grid-cols-3 gap-2 text-sm">
                            <div><span className="text-muted-foreground">Ano:</span> {item.ano || 'N/A'}</div>
                            <div><span className="text-muted-foreground">Valor:</span> R$ {item.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'N/A'}</div>
                            <div><span className="text-muted-foreground">Status:</span> {item.status || 'Pendente'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {debitos.multas?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-destructive" />
                        Multas ({debitos.multas.length})
                      </h4>
                      {debitos.multas.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <div><span className="text-muted-foreground">Data:</span> {item.data || 'N/A'}</div>
                            <div><span className="text-muted-foreground">Valor:</span> R$ {item.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'N/A'}</div>
                            <div className="col-span-2"><span className="text-muted-foreground">Infração:</span> {item.descricao || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {debitos.licenciamento?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-destructive" />
                        Licenciamento ({debitos.licenciamento.length})
                      </h4>
                      {debitos.licenciamento.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="grid md:grid-cols-3 gap-2 text-sm">
                            <div><span className="text-muted-foreground">Ano:</span> {item.ano || 'N/A'}</div>
                            <div><span className="text-muted-foreground">Valor:</span> R$ {item.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'N/A'}</div>
                            <div><span className="text-muted-foreground">Status:</span> {item.status || 'Pendente'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-accent" />
                  <div>
                    <div className="font-semibold text-lg">Sem débitos pendentes</div>
                    <div className="text-sm text-muted-foreground">
                      Não foram encontrados débitos de IPVA, multas ou licenciamento
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Restrictions Section */}
          <Card className="shadow-soft">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Restrições e Gravames
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {restricoes?.tem_restricoes ? (
                <div className="space-y-4">
                  {restricoes.roubo_furto?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-destructive">
                        <XCircle className="w-5 h-5" />
                        Roubo/Furto ({restricoes.roubo_furto.length})
                      </h4>
                      {restricoes.roubo_furto.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 border border-destructive/50 bg-destructive/5 rounded-lg">
                          <div className="space-y-1 text-sm">
                            <div><span className="font-semibold">Data:</span> {item.data || 'N/A'}</div>
                            <div><span className="font-semibold">Tipo:</span> {item.tipo || 'N/A'}</div>
                            <div><span className="font-semibold">Status:</span> {item.status || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {restricoes.judiciais?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="w-5 h-5" />
                        Restrições Judiciais ({restricoes.judiciais.length})
                      </h4>
                      {restricoes.judiciais.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <div className="text-sm">{item.descricao || JSON.stringify(item)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {restricoes.administrativas?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="w-5 h-5" />
                        Restrições Administrativas ({restricoes.administrativas.length})
                      </h4>
                      {restricoes.administrativas.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <div className="text-sm">{item.descricao || JSON.stringify(item)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {restricoes.alienacao?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-blue-600">
                        <FileText className="w-5 h-5" />
                        Alienação Fiduciária ({restricoes.alienacao.length})
                      </h4>
                      {restricoes.alienacao.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="space-y-1 text-sm">
                            <div><span className="font-semibold">Credor:</span> {item.credor || 'N/A'}</div>
                            <div><span className="font-semibold">Contrato:</span> {item.contrato || 'N/A'}</div>
                            <div><span className="font-semibold">Data:</span> {item.data || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

          {/* Auction/Leilão Section */}
          <Card className="shadow-soft">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                Histórico de Leilão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {leilao?.tem_historico && leilao.historico?.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-lg text-yellow-800 dark:text-yellow-400">
                          ⚠️ Veículo com Histórico de Leilão
                        </div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                          Este veículo já passou por processo de leilão
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {leilao.historico.map((item: any, index: number) => (
                    <div key={index} className="p-4 border border-border bg-secondary/30 rounded-lg space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        {item.data_leilao && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Data do Leilão</div>
                            <div className="font-semibold">{item.data_leilao}</div>
                          </div>
                        )}
                        {item.leiloeiro && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Leiloeiro</div>
                            <div className="font-semibold">{item.leiloeiro}</div>
                          </div>
                        )}
                        {item.comitente && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Comitente</div>
                            <div className="font-semibold">{item.comitente}</div>
                          </div>
                        )}
                        {item.lote && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Lote</div>
                            <div className="font-semibold">{item.lote}</div>
                          </div>
                        )}
                        {item.situacao && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Situação</div>
                            <Badge variant="outline" className="border-yellow-600 text-yellow-700 dark:text-yellow-400">
                              {item.situacao}
                            </Badge>
                          </div>
                        )}
                      </div>
                      {item.observacao && (
                        <div className="pt-3 border-t">
                          <div className="text-xs text-muted-foreground mb-1">Observação</div>
                          <div className="text-sm">{item.observacao}</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {leilao.detalhes && (
                    <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-2">Detalhes Adicionais</div>
                      <div className="text-sm">{JSON.stringify(leilao.detalhes, null, 2)}</div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                    ℹ️ <strong>Importante:</strong> Veículos com histórico de leilão podem ter tido sinistro, 
                    recuperação de seguros ou outras ocorrências. Recomenda-se vistoria detalhada antes da compra.
                  </div>
                </div>
              ) : dadosLeilao && Object.keys(dadosLeilao).length > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                      <div className="space-y-2 w-full">
                        <div className="font-semibold text-yellow-800 dark:text-yellow-400">
                          Informações de Leilão Detectadas
                        </div>
                        <pre className="text-xs bg-background/50 p-3 rounded overflow-auto">
                          {JSON.stringify(dadosLeilao, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-accent" />
                  <div>
                    <div className="font-semibold text-lg">Sem histórico de leilão</div>
                    <div className="text-sm text-muted-foreground">
                      Não foram encontrados registros de leilão para este veículo
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