import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle, Copy, QrCode, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackBeginCheckout, trackAddPaymentInfo, trackLead, trackPixGenerated, createProductData, trackPurchase, trackCTAClick } from "@/lib/analytics";
import { getStoredTrackingParams } from "@/hooks/useTrackingParams";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const reportId = searchParams.get('reportId') || '';
  const planType = (searchParams.get('plan') || 'completo') as 'completo' | 'premium';
  const plate = searchParams.get('plate') || '';
  
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentMethod = 'PIX'; // Apenas PIX disponível
  const [paymentData, setPaymentData] = useState<any>(null);
  const [fetchingPix, setFetchingPix] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });

  const planDetails = {
    completo: {
      name: 'Relatório Completo',
      price: 39.90,
      features: [
        'Dados completos do veículo',
        'Histórico de sinistros',
        'Débitos e multas',
        'Recall do fabricante',
        'Download em PDF',
      ],
    },
    premium: {
      name: 'Relatório Premium Plus',
      price: 39.90,
      features: [
        'Tudo do plano Completo',
        'Histórico de leilão',
        'Rastreamento de roubo',
        'Análise de mercado',
        'Suporte prioritário',
        'Validade de 30 dias',
      ],
    },
  };

  const currentPlan = planDetails[planType];

  // Track begin_checkout on component mount
  useEffect(() => {
    const product = createProductData(planType, plate);
    trackBeginCheckout(product);
  }, [planType, plate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCPF = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return false;
    
    // Valida sequências inválidas
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCpf.charAt(10))) return false;
    
    return true;
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track CTA Click for form submission
    trackCTAClick('Gerar PIX', 'checkout_form', currentPlan.price);
    
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    // Valida CPF
    if (!validateCPF(formData.cpf)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, verifique o CPF informado.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Track lead (form submission)
    trackLead(formData.email, formData.phone);
    
    // Track add_payment_info
    const product = createProductData(planType, plate);
    trackAddPaymentInfo(product, paymentMethod);
    
    try {
      const requestBody: any = {
        reportId,
        planType,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone.replace(/\D/g, ''),
        customerCpf: formData.cpf.replace(/\D/g, ''),
        paymentMethod: 'PIX',
      };

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: requestBody,
      });
      
      // Save customer data to database if payment was created
      if (data?.success && data?.payment?.id) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          
          // Recupera parâmetros de tracking
          const trackingParams = getStoredTrackingParams();
          
          const { error: customerError } = await supabase
            .from('customers')
            .insert({
              report_id: reportId,
              payment_id: data.payment.id,
              name: formData.name,
              email: formData.email,
              phone: formData.phone.replace(/\D/g, ''),
              cpf: formData.cpf.replace(/\D/g, ''),
              plate: plate,
              plan_type: planType,
              amount: currentPlan.price,
              // Adiciona dados de tracking
              utm_source: trackingParams?.utm_source || null,
              utm_medium: trackingParams?.utm_medium || null,
              utm_campaign: trackingParams?.utm_campaign || null,
              utm_term: trackingParams?.utm_term || null,
              utm_content: trackingParams?.utm_content || null,
              referrer: trackingParams?.referrer || null,
              landing_page: trackingParams?.landing_page || null,
            });
          
          if (customerError) {
            console.error('[Checkout] Erro ao salvar dados do cliente:', customerError);
          } else {
            console.log('[Checkout] Dados do cliente salvos com tracking:', trackingParams);
          }
        } catch (customerSaveError) {
          console.error('[Checkout] Erro ao salvar dados do cliente:', customerSaveError);
        }
      }

      if (error) {
        console.error('[Checkout] create-payment error:', error);

        // Extrai mensagem amigável do gateway
        let friendly = 'Não foi possível processar o pagamento no cartão. Verifique os dados e tente novamente.';
        const ctx: any = (error as any).context;

        let body: any = ctx?.body;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch {}
        }
        if (body?.errors?.[0]?.description) {
          friendly = body.errors[0].description;
        } else if (body?.message) {
          friendly = body.message;
        } else if ((error as any).message && !(error as any).message.includes('non-2xx')) {
          friendly = (error as any).message;
        }

        toast({
          title: 'Erro no pagamento',
          description: friendly,
          variant: 'destructive',
        });

        setIsProcessing(false);
        return;
      }

      if (data.success) {
        setPaymentData(data);
        
        // Dispara uma busca do PIX logo após criar (mesmo que já tenha vindo)
        setTimeout(() => {
          fetchPix();
        }, 1000);
        
        // Track PIX generation
        trackPixGenerated(currentPlan.price, data.paymentId);

        toast({
          title: "Pagamento gerado!",
          description: "Complete o pagamento PIX para liberar seu relatório.",
        });
      } else {
        toast({
          title: 'Erro no pagamento',
          description: data.error || 'Não foi possível processar o pagamento. Tente novamente.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }
    } catch (error: any) {
      console.error('[Checkout] Erro:', error);
      let friendly = "Não foi possível processar o pagamento. Tente novamente.";
      const ctx: any = (error as any).context;
      let body: any = ctx?.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
      }
      if (body?.errors?.[0]?.description) friendly = body.errors[0].description;
      else if (body?.message) friendly = body.message;
      else if (error?.message && !(error.message as string).includes('non-2xx')) friendly = error.message;

      toast({
        title: "Erro no pagamento",
        description: friendly,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  const fetchPix = async () => {
    if (!paymentData?.paymentId) return;
    try {
      setFetchingPix(true);
      console.log('[Checkout] Buscando dados PIX para pagamento:', paymentData.paymentId);
      
      const { data, error } = await supabase.functions.invoke('check-payment', {
        body: { paymentId: paymentData.paymentId },
      });
      
      if (error) {
        console.error('[Checkout] Erro ao buscar PIX:', error);
        throw error;
      }
      
      console.log('[Checkout] Resposta do check-payment:', data);
      
      if (data?.success) {
        const hasPixData = data.pixQrCode || data.payload;
        if (hasPixData) {
          console.log('[Checkout] Dados PIX recebidos com sucesso');
          setPaymentData((prev: any) => ({
            ...prev,
            pixQrCode: data.pixQrCode || prev?.pixQrCode,
            pixCopyPaste: data.payload || prev?.pixCopyPaste,
            payload: data.payload || prev?.payload,
            invoiceUrl: data.invoiceUrl || prev?.invoiceUrl,
          }));
        } else {
          console.warn('[Checkout] PIX ainda não disponível');
        }
      }
    } catch (e) {
      console.error('[Checkout] Exceção ao buscar PIX:', e);
      toast({ 
        title: 'Aguardando PIX', 
        description: 'O código PIX está sendo gerado. Tentando novamente...', 
      });
    } finally {
      setFetchingPix(false);
    }
  };

  // Busca PIX automaticamente com retry
  useEffect(() => {
    if (!paymentData?.paymentId) return;
    if (paymentMethod !== 'PIX') return;
    if (paymentData.pixCopyPaste || paymentData.payload) {
      console.log('[Checkout] PIX já disponível, não é necessário buscar');
      return;
    }

    console.log('[Checkout] Iniciando busca automática do PIX...');
    
    // Aguarda 2 segundos antes da primeira tentativa (dá tempo para o backend processar)
    const initialTimeout = setTimeout(() => {
      fetchPix();
    }, 2000);

    // Retry automático: tenta buscar a cada 5 segundos por até 10 tentativas
    let retryCount = 0;
    const maxRetries = 10;
    
    const retryInterval = setInterval(() => {
      if (paymentData.pixCopyPaste || paymentData.payload) {
        console.log('[Checkout] PIX obtido com sucesso, parando retry');
        clearInterval(retryInterval);
        return;
      }
      
      if (retryCount >= maxRetries) {
        console.warn('[Checkout] Número máximo de tentativas atingido');
        clearInterval(retryInterval);
        toast({
          title: "PIX demorando mais que o esperado",
          description: "Clique em 'Atualizar' para tentar novamente.",
          variant: "default",
        });
        return;
      }
      
      retryCount++;
      console.log(`[Checkout] Retry ${retryCount}/${maxRetries}...`);
      fetchPix();
    }, 5000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(retryInterval);
    };
  }, [paymentData?.paymentId, paymentMethod]);

  // Check payment status every 5 seconds for both PIX and CREDIT_CARD
  useEffect(() => {
    if (!paymentData?.paymentId || checkingPayment) {
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        console.log('[Checkout] Verificando status do pagamento...');
        const { data, error } = await supabase.functions.invoke('check-payment', {
          body: { paymentId: paymentData.paymentId }
        });

        if (error) {
          console.error('[Checkout] Erro ao verificar pagamento:', error);
          return;
        }

        console.log('[Checkout] Status do pagamento:', data);

        if (data.isPaid) {
          setCheckingPayment(true);
          
          // Track purchase event for GA4 and Meta Pixel
          const value = currentPlan.price;
          const product = createProductData(planType, plate);
          
          // Send Purchase event to GA4
          trackPurchase({
            transaction_id: reportId,
            value: value,
            currency: 'BRL',
            items: [product],
            payment_method: paymentMethod,
          });
          
          // Send Purchase event to Meta Pixel
          if (window.fbq) {
            window.fbq('track', 'Purchase', {
              value: value,
              currency: 'BRL',
              content_name: currentPlan.name,
              content_type: 'product',
              content_ids: [reportId],
            });
            console.log('[Checkout] Purchase events sent to GA4 and Meta Pixel:', { value, currency: 'BRL' });
          }
          
          toast({
            title: "🎉 Pagamento confirmado!",
            description: "Redirecionando para o relatório completo...",
          });
          
          // Aguarda 2 segundos antes de redirecionar
          setTimeout(() => {
            navigate(`/report?id=${reportId}`);
          }, 2000);
        }
      } catch (error) {
        console.error('[Checkout] Erro ao verificar status:', error);
      }
    };

    // Verifica imediatamente
    checkPaymentStatus();

    // Depois verifica a cada 5 segundos
    const interval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(interval);
  }, [paymentData, reportId, navigate, checkingPayment, paymentMethod, planType, currentPlan, plate]);
  if (paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-gradient-hero border-b border-border/20 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <h1 className="text-xl md:text-2xl font-bold text-white text-center">
              Checkplaca
            </h1>
            {checkingPayment && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs md:text-sm text-white/90">
                <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                <span>Verificando pagamento...</span>
              </div>
            )}
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-strong">
              <CardHeader className="text-center">
                <div className="relative">
                  <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                  {checkingPayment && (
                    <div className="absolute -top-1 -right-1">
                      <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {checkingPayment ? 'Verificando Pagamento...' : 'Pagamento Gerado'}
                </CardTitle>
                <CardDescription>
                  {checkingPayment 
                    ? 'Aguarde enquanto confirmamos seu pagamento' 
                    : 'Complete o pagamento para liberar seu relatório'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {paymentMethod === 'PIX' && (
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      {paymentData.pixQrCode ? (
                        <img 
                          src={`data:image/png;base64,${paymentData.pixQrCode}`} 
                          alt="QR Code PIX" 
                          className="mx-auto border-4 border-border rounded-lg w-64 h-64"
                        />
                      ) : fetchingPix ? (
                        <div className="mx-auto w-64 h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-secondary/30">
                          <Loader2 className="w-12 h-12 animate-spin mb-3 text-accent" />
                          <p className="text-sm font-medium">Gerando QR Code PIX...</p>
                          <p className="text-xs mt-1">Isso pode levar alguns segundos</p>
                        </div>
                      ) : (
                        <div className="mx-auto w-64 h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                          <QrCode className="w-12 h-12 mb-2 opacity-50" />
                          <p className="text-sm">QR Code indisponível</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={fetchPix}
                          >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Atualizar
                          </Button>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Escaneie o QR Code com o app do seu banco
                        </p>
                        
                        {/* CTA Principal - Copiar PIX logo após QR Code */}
                        {(paymentData.pixCopyPaste || paymentData.payload) && (
                          <Button
                            type="button"
                            size="lg"
                            className="w-full max-w-md mx-auto h-12 md:h-14 gradient-primary font-semibold"
                            onClick={() => copyToClipboard(paymentData.pixCopyPaste || paymentData.payload, 'Código PIX')}
                          >
                            <Copy className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                            Copiar Código PIX
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <Label className="text-sm font-semibold mb-3 block text-muted-foreground">
                        Ou visualize o código completo:
                      </Label>
                      
                      <div className="bg-secondary/30 p-3 md:p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">Chave PIX:</p>
                        <div className="flex items-center gap-2">
                          {fetchingPix && !paymentData.pixCopyPaste && !paymentData.payload ? (
                            <div className="flex-1 flex items-center justify-center gap-2 bg-background p-3 rounded border">
                              <Loader2 className="w-4 h-4 animate-spin text-accent" />
                              <span className="text-sm text-muted-foreground">Gerando código PIX...</span>
                            </div>
                          ) : (
                            <code className="flex-1 text-xs md:text-sm font-mono break-all bg-background p-2 md:p-3 rounded border">
                              {paymentData.pixCopyPaste || paymentData.payload || 'Aguardando geração...'}
                            </code>
                          )}
                        </div>
                      </div>

                      {!paymentData.pixCopyPaste && !paymentData.payload && (
                        <div className="mt-4">
                          <Button type="button" variant="outline" size="lg" className="w-full h-12" onClick={fetchPix} disabled={fetchingPix}>
                            {fetchingPix ? (
                              <>
                                <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                                Gerando...
                              </>
                            ) : (
                              <>
                                <RefreshCcw className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                                Atualizar
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      <p className="text-xs text-center text-muted-foreground mt-3">
                        Cole este código no aplicativo do seu banco para realizar o pagamento
                      </p>
                    </div>
                  </div>
                )}


                <div className="bg-secondary/20 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plano</span>
                    <span className="font-semibold">{currentPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Placa</span>
                    <span className="font-mono font-bold">{plate}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold">Valor Total</span>
                    <span className="font-bold text-2xl text-accent">
                      R$ {currentPlan.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                      Aguardando Pagamento
                    </Badge>
                  </div>
                </div>

                <div className={`rounded-lg p-4 border ${
                  checkingPayment 
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                }`}>
                  <p className={`text-sm text-center font-medium ${
                    checkingPayment 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-blue-900 dark:text-blue-100'
                  }`}>
                    {checkingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                        Pagamento detectado! Gerando seu relatório completo...
                      </>
                    ) : (
                      <>
                        ⏱️ Após a confirmação do pagamento, seu relatório completo será gerado <strong>automaticamente</strong>
                      </>
                    )}
                  </p>
                </div>

                <Button
                  onClick={() => navigate(`/report?id=${reportId}`)}
                  variant="outline"
                  className="w-full"
                  disabled={checkingPayment}
                >
                  {checkingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecionando...
                    </>
                  ) : (
                    'Voltar ao relatório'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-hero border-b border-border/20 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Checkplaca
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-5 gap-6 md:gap-8">
            {/* Payment Form */}
            <div className="md:col-span-3">
              <Card className="shadow-strong">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Finalizar Compra</CardTitle>
                  <CardDescription>Preencha seus dados para gerar o PIX</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Dados Pessoais */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-base">Dados Pessoais</h3>
                      
                      <div>
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="João Silva"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="phone" className="text-sm">Telefone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                            placeholder="(11) 99999-9999"
                            required
                            className="h-10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf" className="text-sm">CPF</Label>
                          <Input
                            id="cpf"
                            type="text"
                            value={formData.cpf}
                            onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                            placeholder="000.000.000-00"
                            required
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Método de Pagamento */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-base">Forma de Pagamento</h3>
                      
                      <div className="bg-secondary/20 rounded-lg p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <QrCode className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm">Pagamento via PIX</p>
                            <p className="text-xs text-muted-foreground">
                              Aprovação instantânea após pagamento
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 md:h-14 gradient-primary font-semibold text-base"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                          Gerar PIX - R$ {currentPlan.price.toFixed(2)}
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <Lock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Pagamento 100% seguro</span>
                    </div>

                    {/* Botão de teste - REMOVER EM PRODUÇÃO */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                      disabled={isProcessing}
                      onClick={async () => {
                        try {
                          setIsProcessing(true);
                          
                          // 1. Cria pagamento fake como 'paid'
                          const { error: paymentError } = await supabase.from('payments').insert({
                            report_id: reportId,
                            status: 'paid',
                            plan_type: 'completo',
                            amount: 39.90,
                            payment_method: 'test',
                            asaas_payment_id: `test_${Date.now()}`,
                            asaas_customer_id: `test_customer_${Date.now()}`
                          });
                          
                          if (paymentError) {
                            console.error('Erro ao criar pagamento fake:', paymentError);
                          }
                          
                          // 2. Gera relatório completo via edge function
                          const { data, error } = await supabase.functions.invoke('vehicle-report', {
                            body: { plate, planType: 'completo' }
                          });
                          
                          if (error) {
                            console.error('Erro ao gerar relatório:', error);
                            toast({
                              title: "Erro no teste",
                              description: "Não foi possível gerar o relatório completo",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          console.log('Relatório completo gerado:', data);
                          
                          // 3. Redireciona para relatório
                          navigate(`/report?id=${reportId}`);
                        } catch (error) {
                          console.error('Erro no teste:', error);
                          toast({
                            title: "Erro",
                            description: "Falha ao processar teste",
                            variant: "destructive"
                          });
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                    >
                      🧪 {isProcessing ? 'Processando...' : 'Pular para Teste (Dev Only)'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-2">
              <Card className="shadow-strong md:sticky md:top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-base">{currentPlan.name}</h4>
                    <Badge variant="secondary" className="mb-3 text-xs">
                      {planType === 'premium' ? 'Mais Completo' : 'Popular'}
                    </Badge>
                    <ul className="space-y-1.5">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs md:text-sm">
                          <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-muted-foreground">Placa:</span>
                      <span className="font-mono font-bold">{plate}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-base md:text-lg">Total:</span>
                      <span className="text-xl md:text-2xl text-accent">
                        R$ {currentPlan.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
