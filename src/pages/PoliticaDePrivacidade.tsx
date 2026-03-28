import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { Lock, Database, Eye, Share2, Cookie, UserCheck, ShieldCheck, Mail } from "lucide-react";

const PoliticaDePrivacidade = () => {
  const breadcrumbItems = [
    { label: "Início", href: "/" },
    { label: "Política de Privacidade" },
  ];

  const sections = [
    {
      icon: Lock,
      title: "1. Informações que Coletamos",
      content: `Coletamos informações que você nos fornece diretamente ao utilizar nossos serviços: placa do veículo para consulta, dados de pagamento (nome, CPF, e-mail e telefone) para processamento de relatórios pagos. Também coletamos automaticamente dados de navegação como endereço IP, tipo de navegador, páginas visitadas, horários de acesso e dados de referência (UTM).`,
    },
    {
      icon: Database,
      title: "2. Como Utilizamos seus Dados",
      content: `Utilizamos as informações coletadas para: (a) processar e entregar os relatórios solicitados; (b) processar pagamentos de forma segura; (c) melhorar a experiência do usuário e a qualidade do serviço; (d) enviar comunicações relacionadas ao serviço contratado; (e) gerar estatísticas anônimas e agregadas para análise de desempenho; (f) prevenir fraudes e uso indevido da plataforma.`,
    },
    {
      icon: Eye,
      title: "3. Armazenamento e Proteção",
      content: `Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS/SSL) e em repouso. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda, alteração ou destruição. Os dados de pagamento são processados por parceiros certificados e não são armazenados em nossos servidores. Mantemos os dados pelo tempo necessário para cumprir as finalidades descritas ou conforme exigido por lei.`,
    },
    {
      icon: Share2,
      title: "4. Compartilhamento de Dados",
      content: `Não vendemos, alugamos ou comercializamos seus dados pessoais. Compartilhamos informações apenas com: (a) processadores de pagamento para concluir transações; (b) provedores de infraestrutura para hospedagem e funcionamento do serviço; (c) autoridades competentes quando exigido por lei ou ordem judicial. Todos os parceiros estão sujeitos a obrigações de confidencialidade.`,
    },
    {
      icon: Cookie,
      title: "5. Cookies e Tecnologias de Rastreamento",
      content: `Utilizamos cookies e tecnologias similares para: manter suas preferências de sessão, analisar o tráfego do site, medir a eficácia de campanhas e melhorar nossos serviços. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do site. Utilizamos ferramentas de analytics para compreender padrões de uso de forma agregada e anônima.`,
    },
    {
      icon: UserCheck,
      title: "6. Seus Direitos (LGPD)",
      content: `Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a: (a) confirmar a existência de tratamento de dados; (b) acessar seus dados pessoais; (c) corrigir dados incompletos ou desatualizados; (d) solicitar a anonimização ou eliminação de dados desnecessários; (e) revogar o consentimento a qualquer momento; (f) solicitar a portabilidade dos dados. Para exercer seus direitos, entre em contato pelo e-mail contato@checkplaca.com.`,
    },
    {
      icon: ShieldCheck,
      title: "7. Segurança de Menores",
      content: `Nossos serviços não são destinados a menores de 18 anos. Não coletamos intencionalmente dados de menores de idade. Se tomarmos conhecimento de que dados de um menor foram coletados inadvertidamente, tomaremos as medidas necessárias para excluí-los de nossos registros.`,
    },
    {
      icon: Mail,
      title: "8. Contato do Encarregado (DPO)",
      content: `Para questões relacionadas à privacidade e proteção de dados, entre em contato com nosso Encarregado de Proteção de Dados pelo e-mail: privacidade@checkplaca.com. Responderemos sua solicitação em até 15 dias úteis, conforme previsto na LGPD. Caso não obtenha resposta satisfatória, você pode recorrer à Autoridade Nacional de Proteção de Dados (ANPD).`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Política de Privacidade | Checkplaca"
        description="Conheça a Política de Privacidade da Checkplaca. Saiba como coletamos, usamos e protegemos seus dados pessoais em conformidade com a LGPD."
        canonical="/politica-de-privacidade"
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
            <Lock className="w-4 h-4" />
            Em conformidade com a LGPD
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sua privacidade é importante para nós. Entenda como tratamos seus dados pessoais com transparência e segurança.
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
            Veja também nossos{" "}
            <a href="/termos-de-uso" className="text-primary hover:underline font-medium">
              Termos de Uso
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

export default PoliticaDePrivacidade;
