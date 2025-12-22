import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Shield, Clock, CheckCircle, Loader2, Copy, Check, CreditCard, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackBeginCheckout, createProductData } from "@/lib/analytics";
import { TrustBar } from "@/components/report";

const CheckoutNew = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const plateQueryId = searchParams.get('plateQueryId') || '';
  const placa = searchParams.get('placa') || '';
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCode: string | null;
    copyPaste: string | null;
    orderId: string | null;
    publicAccessToken: string | null;
  }>({ qrCode: null, copyPaste: null, orderId: null, publicAccessToken: null });
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');

  useEffect(() => {
    if (!plateQueryId || !placa) {
      toast({
        title: "Erro",
        description: "Dados da consulta não encontrados",
        variant: "destructive",
      });
      navigate('/');
    } else {
      const product = createProductData('completo', placa);
      trackBeginCheckout(product);
    }
  }, [plateQueryId, placa, navigate, toast]);

  // Poll for payment confirmation
  useEffect(() => {
    if (!showPix || !pixData.orderId) return;

    const interval = setInterval(async () => {
      setCheckingPayment(true);
      try {
        const { data, error } = await supabase.functions.invoke('confirm-order-payment', {
          body: { orderId: pixData.orderId }
        });

        if (error) throw error;

        if (data?.isPaid) {
          clearInterval(interval);
          toast({
            title: "✅ Pagamento confirmado!",
            description: "Gerando relatório completo...",
          });
          navigate(`/paid-report?token=${pixData.publicAccessToken}`);
        }
      } catch (error) {
        console.error('[CheckoutNew] Payment check error:', error);
      } finally {
        setCheckingPayment(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [showPix, pixData.orderId, pixData.publicAccessToken, navigate, toast]);

  const formatCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      toast({
        title: "CPF inválido",
        description: "O CPF deve conter 11 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-pix-order', {
        body: {
          plateQueryId,
          customerName: name,
          customerEmail: email,
          customerPhone: phone.replace(/\D/g, ''),
          customerCpf: cleanCpf,
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar pedido');
      }

      setPixData({
        qrCode: data.pixQrCode,
        copyPaste: data.pixCopyPaste,
        orderId: data.orderId,
        publicAccessToken: data.publicAccessToken,
      });
      setShowPix(true);

      toast({
        title: "Pedido criado!",
        description: "Escaneie o QR Code ou copie o código PIX para pagar.",
      });

    } catch (error: any) {
      console.error('[CheckoutNew] Error:', error);
      toast({
        title: "Erro ao processar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = async () => {
    if (!pixData.copyPaste) return;
    
    try {
      await navigator.clipboard.writeText(pixData.copyPaste);
      setCopied(true);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no app do seu banco para pagar.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Tente copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  if (showPix) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50 shadow-soft">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowPix(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
              <h1 className="text-lg font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent]">
                Pagamento PIX
              </h1>
              <div className="w-16"></div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            
            {/* Stepper */}
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-primary font-medium">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</div>
                <span className="hidden sm:inline">Pague o Pix</span>
              </div>
              <div className="w-8 h-px bg-border"></div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">2</div>
                <span className="hidden sm:inline">Confirmação</span>
              </div>
              <div className="w-8 h-px bg-border"></div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">3</div>
                <span className="hidden sm:inline">Acesse o PDF</span>
              </div>
            </div>

            {/* QR Code Card */}
            <Card className="shadow-strong border-0">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-lg">Escaneie o QR Code</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Placa: <span className="font-bold font-mono">{placa}</span> • R$ 17,90
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {pixData.qrCode ? (
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-xl shadow-soft border">
                      <img 
                        src={`data:image/png;base64,${pixData.qrCode}`}
                        alt="QR Code PIX"
                        className="w-52 h-52"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="w-60 h-60 bg-muted rounded-xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}

                {pixData.copyPaste && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Ou copie o código Pix Copia e Cola:</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={pixData.copyPaste}
                        readOnly
                        className="font-mono text-xs bg-muted/50"
                      />
                      <Button 
                        onClick={handleCopyPix}
                        variant="outline"
                        className="shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {checkingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Clock className="w-4 h-4 text-primary" />
                    )}
                    <span className="font-medium text-sm">Aguardando pagamento...</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O relatório será liberado automaticamente após a confirmação.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust */}
            <Alert className="border-accent/30 bg-accent/5">
              <Shield className="w-4 h-4 text-accent" />
              <AlertDescription className="text-sm text-muted-foreground">
                Seu pagamento é processado com segurança. Assim que confirmado, liberamos o acesso automaticamente.
              </AlertDescription>
            </Alert>

            {/* FAQ */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1" className="border rounded-lg bg-background px-3">
                <AccordionTrigger className="text-sm py-3 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    Quanto tempo leva a confirmação do Pix?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  Normalmente a confirmação é instantânea, mas pode levar até 2 minutos dependendo do seu banco.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2" className="border rounded-lg bg-background px-3 mt-2">
                <AccordionTrigger className="text-sm py-3 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    E se eu fechar a página?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  Não se preocupe! Após o pagamento, você receberá um e-mail com o link para acessar seu relatório.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <TrustBar variant="compact" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <h1 className="text-lg font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent]">
              Finalizar Compra
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-5">
          
          {/* Order Summary */}
          <Card className="shadow-soft border-0 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-background shadow-soft">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Relatório Completo</div>
                  <div className="font-bold text-lg font-mono">{placa}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground line-through">R$ 34,90</div>
                  <div className="font-bold text-xl text-primary">R$ 17,90</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF incluso</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Acesso imediato</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="shadow-strong border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Dados para pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-11"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Telefone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="h-11"
                      maxLength={15}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-sm">CPF</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      className="h-11"
                      maxLength={14}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full h-12 text-base font-bold gradient-primary shadow-strong mt-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Pagar com PIX — R$ 17,90
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Trust */}
          <div className="flex justify-center gap-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent" />
              <span>Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Garantia 7 dias</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutNew;