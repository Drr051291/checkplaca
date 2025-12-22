import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Calendar, Palette, Tag, Sparkles, CheckCircle, Lock, Shield, Clock, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TrustBar, StickyCTA, PricingCard } from "@/components/report";
import { trackCTAClick } from "@/lib/analytics";

const PreviewResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const plateQueryId = searchParams.get('id') || '';
  const placa = searchParams.get('placa') || '';
  const marca = searchParams.get('marca') || '';
  const modelo = searchParams.get('modelo') || '';
  const ano = searchParams.get('ano') || '';
  const cor = searchParams.get('cor') || '';

  const formatValue = (val: string) => {
    if (!val || val === 'N/D' || val === 'undefined' || val === 'null') {
      return 'Não disponível';
    }
    return val;
  };

  const handleGetFullReport = () => {
    trackCTAClick('Desbloquear Relatório Completo', 'preview_result_page', 17.90);
    navigate(`/checkout-new?plateQueryId=${plateQueryId}&placa=${placa}`);
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const previewFields = [
    { icon: Tag, label: "Marca", value: formatValue(marca) },
    { icon: Car, label: "Modelo", value: formatValue(modelo) },
    { icon: Calendar, label: "Ano", value: formatValue(ano) },
    { icon: Palette, label: "Cor", value: formatValue(cor) },
  ];

  const includedItems = [
    "Dados completos de identificação do veículo",
    "Preço FIPE atualizado (quando disponível)",
    "Consulta de infrações RENAINF",
    "Dados técnicos e especificações",
    "Capacidades e informações de carga",
    "Relatório em PDF para download",
  ];

  const pricingBenefits = [
    "Acesso imediato após confirmação do Pix",
    "Relatório organizado e fácil de entender",
    "PDF para salvar e compartilhar",
    "Dados atualizados de fontes públicas",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Nova consulta</span>
            </Button>
            <h1 className="text-lg font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent]">
              Checkplaca
            </h1>
            <div className="w-20 sm:w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24 sm:pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Report-style Header */}
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-sm font-mono tracking-wider px-4 py-1.5">
              {placa}
            </Badge>
            <h2 className="text-2xl font-bold text-foreground">Resumo gratuito</h2>
            <p className="text-sm text-muted-foreground">
              Consultado em {currentDate} às {currentTime}
            </p>
          </div>

          {/* Preview Card */}
          <Card className="shadow-strong border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 divide-x divide-y divide-border">
                {previewFields.map((field, i) => (
                  <div 
                    key={i} 
                    className="p-4 sm:p-5 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <field.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground font-medium mb-0.5">
                        {field.label}
                      </div>
                      <div className="font-semibold text-foreground truncate">
                        {field.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upsell Block */}
          <Card className="shadow-strong border-2 border-primary/20 overflow-hidden">
            <div className="bg-gradient-hero text-white p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-white/20 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Desbloqueie o relatório completo</h3>
                  <p className="text-sm opacity-90">
                    Inclui histórico, dados técnicos, FIPE e infrações (quando disponíveis).
                  </p>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {pricingBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button 
                size="lg"
                onClick={handleGetFullReport}
                className="w-full bg-white text-primary hover:bg-white/90 font-bold h-12 sm:h-14 text-base shadow-strong"
              >
                Desbloquear relatório completo — R$ 17,90
              </Button>

              <div className="flex items-center justify-center gap-3 mt-4 text-sm">
                <span className="line-through opacity-70">R$ 34,90</span>
                <Badge className="bg-white/20 text-white border-0">-49% OFF</Badge>
              </div>
            </div>

            <CardContent className="p-4 bg-primary/5">
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Acesso imediato</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>PDF incluso</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Included Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="included" className="border rounded-lg shadow-soft bg-background">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4 text-primary" />
                  Ver o que está incluso no relatório
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2.5">
                  {includedItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="link" 
                  className="mt-3 p-0 h-auto text-primary"
                  onClick={handleGetFullReport}
                >
                  Desbloquear agora →
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Trust Bar */}
          <TrustBar className="pt-2" />

          {/* Secondary CTA */}
          <div className="text-center pt-4">
            <Button 
              size="lg"
              onClick={handleGetFullReport}
              className="gradient-primary shadow-strong h-12 px-8 font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ver Relatório Completo — R$ 17,90
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Pagamento via Pix • Acesso imediato após confirmação
            </p>
          </div>
        </div>
      </div>

      {/* Sticky CTA - Mobile Only */}
      <StickyCTA
        label="Relatório completo"
        price="R$ 17,90"
        buttonText="Desbloquear"
        onClick={handleGetFullReport}
        showAfterScroll={200}
      />
    </div>
  );
};

export default PreviewResult;