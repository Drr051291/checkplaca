import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO, createBreadcrumbSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Search, FileText, CreditCard, Download, Shield, Clock,
  CheckCircle, ChevronRight, Car, Zap, Lock, Eye
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Digite a placa do veículo",
    description: "Insira a placa no formato antigo (ABC-1234) ou Mercosul (ABC1D23). A consulta funciona para carros, motos, caminhões e ônibus de todo o Brasil.",
    highlight: "Aceita placa antiga e Mercosul",
  },
  {
    number: "02",
    icon: Eye,
    title: "Veja a prévia gratuita",
    description: "Antes de pagar, você confere dados básicos do veículo como marca, modelo, ano e cor para garantir que é o carro certo.",
    highlight: "Prévia grátis e sem compromisso",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Escolha o plano e pague via PIX",
    description: "Selecione o relatório que melhor atende sua necessidade. O pagamento é feito via PIX com confirmação instantânea.",
    highlight: "Pagamento seguro e instantâneo",
  },
  {
    number: "04",
    icon: Download,
    title: "Acesse seu relatório completo",
    description: "Após a confirmação do pagamento, o relatório fica disponível imediatamente. Você pode acessar, imprimir ou salvar em PDF.",
    highlight: "Acesso imediato ao resultado",
  },
];

const includes = [
  { icon: Car, label: "Dados do veículo (marca, modelo, ano, cor, motor)" },
  { icon: FileText, label: "Tabela FIPE atualizada" },
  { icon: Shield, label: "Histórico de roubo e furto" },
  { icon: Search, label: "Consulta de leilão" },
  { icon: Lock, label: "Gravames e alienações" },
  { icon: CheckCircle, label: "Recalls pendentes" },
  { icon: Eye, label: "Restrições judiciais e administrativas" },
  { icon: Zap, label: "Situação do veículo (regular/irregular)" },
];

const faqs = [
  { q: "Quanto tempo leva para receber o relatório?", a: "O relatório é gerado em menos de 30 segundos após a confirmação do pagamento via PIX." },
  { q: "A consulta funciona para qualquer veículo?", a: "Sim! Funciona para carros, motos, caminhões, ônibus e utilitários de todos os estados do Brasil." },
  { q: "Os dados são confiáveis?", a: "Sim. Os dados são obtidos diretamente de bases oficiais como DENATRAN, RENAVAM, Tabela FIPE e outras fontes governamentais." },
  { q: "Posso consultar quantas placas quiser?", a: "Sim, não há limite. Cada consulta é cobrada individualmente." },
  { q: "Tem garantia?", a: "Sim! Se os dados não estiverem corretos, devolvemos 100% do valor pago." },
];

const ComoFunciona = () => {
  const navigate = useNavigate();

  const breadcrumbs = [
    { name: "Início", url: "https://checkplaca.lovable.app" },
    { name: "Como Funciona", url: "https://checkplaca.lovable.app/como-funciona" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Como Funciona | Checkplaca - Consulta Veicular"
        description="Veja como consultar a placa de um veículo no Checkplaca em 4 passos simples. Resultado em segundos, pagamento via PIX, relatório completo."
        canonical="/como-funciona"
        schema={[createBreadcrumbSchema(breadcrumbs)]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-16 md:pt-12 md:pb-20">
          <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Como Funciona" }]} />

          <div className="text-center mt-8 md:mt-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Simples, rápido e seguro
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              Como funciona a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">consulta veicular</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Em apenas 4 passos você obtém o relatório completo de qualquer veículo do Brasil. Sem burocracia, sem cadastro.
            </p>
          </div>
        </div>
      </section>

      {/* Passos */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col md:flex-row gap-6 items-start">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute left-[2.25rem] top-[5rem] bottom-[-2rem] w-0.5 bg-border" />
                )}

                {/* Number */}
                <div className="shrink-0 w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-2xl font-extrabold shadow-lg">
                  {step.number}
                </div>

                {/* Content */}
                <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-3">
                    <step.icon className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  <span className="inline-block mt-3 text-xs font-medium bg-accent/10 text-accent-foreground px-3 py-1 rounded-full">
                    ✓ {step.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O que está incluso */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">O que está incluso no relatório?</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Todas as informações que você precisa para tomar uma decisão segura
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {includes.map((item) => (
              <div key={item.label} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
                <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">Dúvidas frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-card border border-border rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-foreground hover:text-primary transition-colors">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold">Consulte agora em menos de 30 segundos</h2>
          <p className="mt-4 text-lg opacity-90">
            Digite a placa e receba o relatório completo instantaneamente.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="mt-8 bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6 rounded-xl shadow-lg"
          >
            Consultar Placa Agora
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Checkplaca — Porto Alegre, RS. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default ComoFunciona;
