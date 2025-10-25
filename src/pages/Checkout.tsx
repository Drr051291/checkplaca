import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle, Copy, QrCode, CreditCard, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackBeginCheckout, trackAddPaymentInfo, trackLead, trackPixGenerated, createProductData, trackPurchase } from "@/lib/analytics";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const reportId = searchParams.get('reportId') || '';
  const planType = (searchParams.get('plan') || 'completo') as 'completo' | 'premium';
  const plate = searchParams.get('plate') || '';
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [fetchingPix, setFetchingPix] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const planDetails = {
    completo: {
      name: 'Relatório Completo',
      price: 19.90,
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

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})\d+?$/, '$1');
  };

  const formatCardExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\/\d{2})\d+?$/, '$1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'CREDIT_CARD') {
      if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvv) {
        toast({
          title: "Dados do cartão incompletos",
          description: "Por favor, preencha todos os dados do cartão.",
          variant: "destructive",
        });
        return;
      }
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
        paymentMethod,
      };

      // Adiciona dados do cartão se for pagamento com cartão
      if (paymentMethod === 'CREDIT_CARD') {
        const [expiryMonth, expiryYear] = formData.cardExpiry.split('/');
        requestBody.creditCard = {
          holderName: formData.cardName,
          number: formData.cardNumber.replace(/\s/g, ''),
          expiryMonth,
          expiryYear: `20${expiryYear}`,
          ccv: formData.cardCvv,
        };
        requestBody.creditCardHolderInfo = {
          name: formData.name,
          email: formData.email,
          cpfCnpj: formData.cpf.replace(/\D/g, ''),
          phone: formData.phone.replace(/\D/g, ''),
        };
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: requestBody,
      });

      if (error) throw error;

      if (data.success) {
        setPaymentData(data);
        
        // Track PIX generation if payment method is PIX
        if (paymentMethod === 'PIX') {
          trackPixGenerated(currentPlan.price, data.paymentId);
        }

        // Se for cartão e já foi aprovado, redirecionar
        if (paymentMethod === 'CREDIT_CARD' && data.status === 'CONFIRMED') {
          const product = createProductData(planType, plate);
          trackPurchase({
            transaction_id: reportId,
            value: currentPlan.price,
            currency: 'BRL',
            items: [product],
            payment_method: paymentMethod,
          });

          toast({
            title: "🎉 Pagamento aprovado!",
            description: "Redirecionando para o relatório completo...",
          });

          setTimeout(() => {
            navigate(`/report?id=${reportId}`);
          }, 2000);
        } else {
          toast({
            title: "Pagamento gerado!",
            description: paymentMethod === 'CREDIT_CARD' 
              ? "Processando pagamento com cartão..." 
              : "Complete o pagamento para liberar seu relatório.",
          });
        }
      } else {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }
    } catch (error: any) {
      console.error('[Checkout] Erro:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
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
      const { data, error } = await supabase.functions.invoke('check-payment', {
        body: { paymentId: paymentData.paymentId },
      });
      if (error) throw error;
      if (data?.success) {
        setPaymentData((prev: any) => ({
          ...prev,
          pixQrCode: data.pixQrCode || prev?.pixQrCode,
          pixCopyPaste: data.payload || prev?.pixCopyPaste,
          payload: data.payload || prev?.payload,
        }));
      }
    } catch (e) {
      console.error('[Checkout] Erro ao buscar PIX:', e);
      toast({ title: 'Erro', description: 'Não foi possível gerar a chave PIX.', variant: 'destructive' });
    } finally {
      setFetchingPix(false);
    }
  };

  useEffect(() => {
    if (paymentData && paymentMethod === 'PIX' && !paymentData.pixCopyPaste && !paymentData.payload) {
      fetchPix();
    }
  }, [paymentData, paymentMethod]);

  // Check payment status every 5 seconds if PIX payment is pending
  useEffect(() => {
    if (!paymentData?.paymentId || paymentMethod !== 'PIX' || checkingPayment) {
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
          const planType = paymentData.planType === 'premium' ? 'premium' : 'completo';
          const value = paymentData.planType === 'premium' ? 39.90 : 19.90;
          const product = createProductData(planType, reportId);
          
          // Send Purchase event to GA4
          trackPurchase({
            transaction_id: reportId,
            value: value,
            currency: 'BRL',
            items: [product],
            payment_method: paymentData.paymentMethod,
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
  }, [paymentData, paymentMethod, reportId, navigate, checkingPayment]);
  if (paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Checkplaca
            </h1>
            {checkingPayment && paymentMethod === 'PIX' && (
              <div className="mt-2 flex items-center gap-2 text-sm text-accent">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando pagamento automaticamente...</span>
              </div>
            )}
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-strong">
              <CardHeader className="text-center">
                <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                <CardTitle className="text-2xl">Pagamento Gerado</CardTitle>
                <CardDescription>
                  Complete o pagamento para liberar seu relatório
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {paymentMethod === 'PIX' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      {paymentData.pixQrCode ? (
                        <img 
                          src={`data:image/png;base64,${paymentData.pixQrCode}`} 
                          alt="QR Code PIX" 
                          className="mx-auto border-4 border-border rounded-lg w-64 h-64"
                        />
                      ) : (
                        <div className="mx-auto w-64 h-64 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                          QR Code indisponível
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-4">
                        Escaneie o QR Code com o app do seu banco
                      </p>
                    </div>

                    <div className="border-t border-b py-6">
                      <Label className="text-base font-semibold mb-3 block">
                        Ou pague usando o PIX Copia e Cola:
                      </Label>
                      
                      <div className="bg-secondary/30 p-4 rounded-lg mb-3">
                        <p className="text-xs text-muted-foreground mb-2">Chave PIX:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm font-mono break-all bg-background p-3 rounded border">
                            {paymentData.pixCopyPaste || paymentData.payload || 'Gerando código...'}
                          </code>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          size="lg"
                          className="flex-1 h-14 gradient-primary font-semibold"
                          onClick={() => copyToClipboard(paymentData.pixCopyPaste || paymentData.payload, 'Código PIX')}
                          disabled={!paymentData.pixCopyPaste && !paymentData.payload}
                        >
                          <Copy className="w-5 h-5 mr-2" />
                          Copiar Código PIX
                        </Button>
                        {!paymentData.pixCopyPaste && !paymentData.payload && (
                          <Button type="button" variant="outline" size="lg" className="h-14" onClick={fetchPix} disabled={fetchingPix}>
                            <RefreshCcw className="w-5 h-5 mr-2" />
                            {fetchingPix ? 'Gerando...' : 'Gerar chave'}
                          </Button>
                        )}
                      </div>

                      <p className="text-xs text-center text-muted-foreground mt-3">
                        Cole este código no aplicativo do seu banco para realizar o pagamento
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'CREDIT_CARD' && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <CreditCard className="w-16 h-16 mx-auto text-primary mb-2" />
                      <p className="text-lg font-semibold mb-2">
                        {paymentData.status === 'CONFIRMED' ? 'Pagamento Aprovado!' : 'Processando Pagamento...'}
                      </p>
                      <p className="text-muted-foreground">
                        {paymentData.status === 'CONFIRMED' 
                          ? 'Seu pagamento foi confirmado com sucesso' 
                          : 'Aguardando confirmação do pagamento'}
                      </p>
                    </div>

                    {paymentData.status !== 'CONFIRMED' && (
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-sm text-center text-yellow-900 dark:text-yellow-100">
                          ⏱️ Seu pagamento está sendo processado. Isso pode levar alguns instantes.
                        </p>
                      </div>
                    )}
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

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-center text-blue-900 dark:text-blue-100">
                    ⏱️ Após a confirmação do pagamento, seu relatório será liberado <strong>automaticamente</strong>
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
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
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
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Payment Form */}
            <div className="md:col-span-3">
              <Card className="shadow-strong">
                <CardHeader>
                  <CardTitle>Finalizar Compra</CardTitle>
                  <CardDescription>Escolha a forma de pagamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dados Pessoais */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Dados Pessoais</h3>
                      
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                            placeholder="(11) 99999-9999"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            type="text"
                            value={formData.cpf}
                            onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                            placeholder="000.000.000-00"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Método de Pagamento */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Forma de Pagamento</h3>
                      
                      <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'PIX' | 'CREDIT_CARD')}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="PIX" className="flex items-center gap-2">
                            <QrCode className="w-4 h-4" />
                            PIX
                          </TabsTrigger>
                          <TabsTrigger value="CREDIT_CARD" className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Cartão de Crédito
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="PIX" className="mt-4">
                          <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                            <div className="flex items-start gap-3">
                              <QrCode className="w-5 h-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-semibold">Pagamento via PIX</p>
                                <p className="text-sm text-muted-foreground">
                                  Aprovação instantânea. Escaneie o QR Code ou use o PIX Copia e Cola.
                                </p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="CREDIT_CARD" className="mt-4">
                          <div className="space-y-4">
                            <div className="bg-secondary/20 rounded-lg p-4 mb-4">
                              <div className="flex items-start gap-3">
                                <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                  <p className="font-semibold">Cartão de Crédito</p>
                                  <p className="text-sm text-muted-foreground">
                                    Pagamento seguro e processado diretamente no site.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="cardNumber">Número do Cartão</Label>
                              <Input
                                id="cardNumber"
                                type="text"
                                value={formData.cardNumber}
                                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                              />
                            </div>

                            <div>
                              <Label htmlFor="cardName">Nome no Cartão</Label>
                              <Input
                                id="cardName"
                                type="text"
                                value={formData.cardName}
                                onChange={(e) => handleInputChange('cardName', e.target.value.toUpperCase())}
                                placeholder="NOME COMO NO CARTÃO"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="cardExpiry">Validade</Label>
                                <Input
                                  id="cardExpiry"
                                  type="text"
                                  value={formData.cardExpiry}
                                  onChange={(e) => handleInputChange('cardExpiry', formatCardExpiry(e.target.value))}
                                  placeholder="MM/AA"
                                  maxLength={5}
                                />
                              </div>
                              <div>
                                <Label htmlFor="cardCvv">CVV</Label>
                                <Input
                                  id="cardCvv"
                                  type="text"
                                  value={formData.cardCvv}
                                  onChange={(e) => handleInputChange('cardCvv', e.target.value.replace(/\D/g, ''))}
                                  placeholder="000"
                                  maxLength={4}
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 gradient-primary font-semibold"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          {paymentMethod === 'PIX' ? 'Gerar PIX' : 'Pagar com Cartão'}
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>Pagamento 100% seguro e criptografado</span>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-2">
              <Card className="shadow-strong sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{currentPlan.name}</h4>
                    <Badge variant="secondary" className="mb-3">
                      {planType === 'premium' ? 'Mais Completo' : 'Popular'}
                    </Badge>
                    <ul className="space-y-2">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Placa do Veículo:</span>
                      <span className="font-mono font-bold">{plate}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-2xl text-accent">
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
