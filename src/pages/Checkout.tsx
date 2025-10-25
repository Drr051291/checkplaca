import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle, Copy, QrCode, CreditCard, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
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

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          reportId,
          planType,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone.replace(/\D/g, ''),
          customerCpf: formData.cpf.replace(/\D/g, ''),
          paymentMethod,
        },
      });

      if (error) throw error;

      if (data.success) {
        setPaymentData(data);
        toast({
          title: "Pagamento gerado!",
          description: "Complete o pagamento para liberar seu relatório.",
        });
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
  if (paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Checkplaca
            </h1>
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

                {paymentMethod === 'CREDIT_CARD' && paymentData.invoiceUrl && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <CreditCard className="w-16 h-16 mx-auto text-primary mb-2" />
                      <p className="text-muted-foreground">
                        Complete o pagamento no link abaixo
                      </p>
                    </div>

                    <Button
                      size="lg"
                      onClick={() => window.open(paymentData.invoiceUrl, '_blank')}
                      className="w-full h-14 gradient-primary font-semibold"
                    >
                      <CreditCard className="mr-2" />
                      Pagar com Cartão de Crédito
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                      Você será redirecionado para a página segura de pagamento
                    </p>
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
                >
                  Voltar ao relatório
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
                      <h3 className="font-semibold">Seus dados</h3>
                      
                      <div>
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="João Silva"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cpf">CPF *</Label>
                          <Input
                            id="cpf"
                            type="text"
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                            maxLength={14}
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input
                            id="phone"
                            type="text"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                            maxLength={15}
                            required
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="font-semibold">Forma de pagamento</h3>
                      
                      <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-secondary/50">
                          <RadioGroupItem value="PIX" id="pix" />
                          <Label htmlFor="pix" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <QrCode className="w-5 h-5" />
                              <span className="font-semibold">PIX</span>
                              <Badge variant="secondary" className="ml-auto">Aprovação imediata</Badge>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-secondary/50">
                          <RadioGroupItem value="CREDIT_CARD" id="credit" />
                          <Label htmlFor="credit" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5" />
                              <span className="font-semibold">Cartão de Crédito</span>
                              <Badge variant="secondary" className="ml-auto">Aprovação imediata</Badge>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full h-14 text-lg font-semibold gradient-primary"
                    >
                      {isProcessing ? (
                        "Processando..."
                      ) : (
                        <>
                          <Lock className="mr-2" />
                          Finalizar Pagamento - R$ {currentPlan.price.toFixed(2)}
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>Pagamento 100% seguro via Asaas</span>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-2">
              <Card className="shadow-soft sticky top-24">
                <CardHeader className="bg-secondary/50">
                  <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Placa do veículo</div>
                    <div className="text-xl font-bold tracking-wider">{plate}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Plano selecionado</div>
                    <div className="font-semibold">{currentPlan.name}</div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="text-sm text-muted-foreground mb-3">Incluído:</div>
                    <div className="space-y-2">
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-accent">R$ {currentPlan.price.toFixed(2)}</span>
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
