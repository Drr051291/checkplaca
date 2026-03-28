import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { FileText, Shield, AlertTriangle, Scale, CreditCard, Ban, RefreshCw, Mail } from "lucide-react";

const TermosDeUso = () => {
  const breadcrumbItems = [
    { label: "Início", href: "/" },
    { label: "Termos de Uso" },
  ];

  const sections = [
    {
      icon: FileText,
      title: "1. Aceitação dos Termos",
      content: `Ao acessar e utilizar o site Checkplaca (https://checkplaca.com), você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição aqui prevista, recomendamos que não utilize nossos serviços. O uso continuado do site após eventuais alterações nestes termos constitui aceitação das modificações realizadas.`,
    },
    {
      icon: Shield,
      title: "2. Descrição do Serviço",
      content: `A Checkplaca é uma plataforma de consulta veicular que fornece informações públicas sobre veículos a partir da placa informada. O serviço inclui consulta gratuita com dados básicos e relatórios completos pagos com informações detalhadas como histórico FIPE, restrições, sinistros, débitos e multas. Os dados são obtidos de bases públicas e de parceiros homologados.`,
    },
    {
      icon: AlertTriangle,
      title: "3. Limitação de Responsabilidade",
      content: `A Checkplaca não se responsabiliza pela precisão, completude ou atualização das informações fornecidas, uma vez que os dados são provenientes de fontes públicas e de terceiros. O serviço é oferecido "como está" (as is), sem garantias de qualquer natureza. Não nos responsabilizamos por decisões tomadas com base nas informações consultadas. Recomendamos sempre a verificação junto aos órgãos competentes.`,
    },
    {
      icon: Scale,
      title: "4. Uso Adequado",
      content: `O usuário compromete-se a utilizar o serviço apenas para fins lícitos e de acordo com a legislação brasileira vigente. É vedado: (a) utilizar o serviço para fins ilegais ou fraudulentos; (b) tentar acessar dados de forma não autorizada; (c) reproduzir, distribuir ou comercializar os relatórios sem autorização; (d) sobrecarregar intencionalmente os servidores; (e) utilizar robôs, scrapers ou ferramentas automatizadas de coleta.`,
    },
    {
      icon: CreditCard,
      title: "5. Pagamentos e Reembolsos",
      content: `Os relatórios pagos são processados via PIX com confirmação imediata. Após a geração do relatório, não há possibilidade de reembolso, pois o serviço é prestado instantaneamente. Em caso de falha técnica que impeça a entrega do relatório, o valor será estornado integralmente em até 7 dias úteis. Os preços podem ser alterados a qualquer momento, sem aviso prévio, não afetando compras já realizadas.`,
    },
    {
      icon: Ban,
      title: "6. Suspensão e Encerramento",
      content: `A Checkplaca reserva-se o direito de suspender ou encerrar o acesso de qualquer usuário que viole estes Termos de Uso, sem aviso prévio e sem necessidade de justificativa. A suspensão não gera direito a indenização ou reembolso de valores já pagos por serviços efetivamente prestados.`,
    },
    {
      icon: RefreshCw,
      title: "7. Alterações nos Termos",
      content: `Estes Termos de Uso podem ser modificados a qualquer momento. As alterações entram em vigor imediatamente após a publicação no site. É responsabilidade do usuário revisar periodicamente os termos. O uso continuado dos serviços após alterações constitui aceitação automática das novas condições.`,
    },
    {
      icon: Mail,
      title: "8. Contato e Foro",
      content: `Para dúvidas, sugestões ou reclamações relacionadas a estes Termos de Uso, entre em contato pelo e-mail contato@checkplaca.com. Fica eleito o foro da comarca de Porto Alegre/RS para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Termos de Uso | Checkplaca"
        description="Leia os Termos de Uso da Checkplaca. Conheça as condições de uso do serviço de consulta veicular, responsabilidades e direitos do usuário."
        canonical="/termos-de-uso"
      />

      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
              Checkplaca
            </a>
            <nav className="flex items-center gap-3 sm:gap-6">
              <a href="/" className="text-sm font-medium hover:text-primary transition-smooth">Início</a>
              <a href="/blog" className="text-sm font-medium hover:text-primary transition-smooth">Blog</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Última atualização: Março 2026
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Termos de Uso
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ao utilizar a Checkplaca, você concorda com os termos e condições descritos abaixo. Leia com atenção.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 sm:p-8 hover:shadow-md transition-smooth"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Veja também nossa{" "}
            <a href="/politica-de-privacidade" className="text-primary hover:underline font-medium">
              Política de Privacidade
            </a>
          </p>
          <Button onClick={() => window.location.href = "/"} size="lg" className="font-semibold">
            Voltar ao início
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermosDeUso;
