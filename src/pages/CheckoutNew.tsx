import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Shield, Clock, CheckCircle, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackBeginCheckout, createProductData } from "@/lib/analytics";

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
      // Track begin_checkout
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
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-gradient-hero sticky top-0 z-50 shadow-md">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => setShowPix(false)}
                className="text-white hover:bg-white/10 p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Pagamento PIX
              </h1>
              <div className="w-9"></div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="shadow-strong">
              <CardHeader className="text-center">
                <CardTitle>Escaneie o QR Code</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Placa: <span className="font-bold">{placa}</span> • R$ 17,90
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code */}
                {pixData.qrCode ? (
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${pixData.qrCode}`}
                      alt="QR Code PIX"
                      className="w-64 h-64 rounded-lg border"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}

                {/* Copy paste */}
                {pixData.copyPaste && (
                  <div className="space-y-2">
                    <Label>Ou copie o código PIX:</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={pixData.copyPaste}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button 
                        onClick={handleCopyPix}
                        variant="outline"
                        className="shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {checkingPayment ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <Clock className="w-5 h-5 text-primary" />
                    )}
                    <span className="font-medium">Aguardando pagamento...</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O relatório será liberado automaticamente após a confirmação.
                  </p>
                </div>

                {/* Trust badges */}
                <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Pagamento seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Acesso imediato</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-hero sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Finalizar Compra
            </h1>
            <div className="w-9"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Resumo */}
          <Card className="mb-6 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-primary text-white p-3 rounded-lg">
                  <Car className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Relatório Completo</div>
                  <div className="font-bold text-lg">{placa}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground line-through">R$ 34,90</div>
                  <div className="font-bold text-xl text-primary">R$ 17,90</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle>Dados para pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full h-14 text-lg font-bold gradient-primary shadow-strong"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Pagar com PIX - R$ 17,90
                    </>
                  )}
                </Button>

                <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Pagamento seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Garantia 7 dias</span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutNew;
