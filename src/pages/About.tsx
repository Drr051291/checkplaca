import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO, organizationSchema, createBreadcrumbSchema } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Shield, Users, MapPin, Award, TrendingUp, Clock,
  CheckCircle, Star, Car, Search, FileText, ChevronRight,
  Building2, Target, Heart, Zap
} from "lucide-react";

const stats = [
  { icon: Search, value: "500 mil+", label: "Consultas realizadas", color: "text-primary" },
  { icon: Users, value: "120 mil+", label: "Clientes satisfeitos", color: "text-emerald-500" },
  { icon: Car, value: "3 anos", label: "No mercado", color: "text-amber-500" },
  { icon: Award, value: "#1", label: "Em consulta veicular", color: "text-purple-500" },
];

const values = [
  {
    icon: Shield,
    title: "Segurança",
    description: "Dados protegidos com criptografia de ponta. Suas informações estão sempre seguras conosco.",
  },
  {
    icon: Target,
    title: "Precisão",
    description: "Informações atualizadas em tempo real direto das bases oficiais do governo.",
  },
  {
    icon: Zap,
    title: "Agilidade",
    description: "Resultados em segundos. Sem filas, sem burocracia, sem complicação.",
  },
  {
    icon: Heart,
    title: "Transparência",
    description: "Preços justos e claros. Sem cobranças ocultas ou surpresas desagradáveis.",
  },
];

const timeline = [
  { year: "2023", title: "Fundação em Porto Alegre", description: "Nascemos com a missão de democratizar o acesso à informação veicular no Brasil." },
  { year: "2024", title: "Expansão Nacional", description: "Alcançamos cobertura em todos os estados e ultrapassamos 100 mil consultas realizadas." },
  { year: "2025", title: "Liderança no Mercado", description: "Nos tornamos a plataforma #1 em consulta veicular, com a maior base de dados do país." },
  { year: "2026", title: "Inovação Contínua", description: "Lançamento de relatórios premium com IA e ampliação dos dados disponíveis." },
];

const team = [
  { role: "Tecnologia", count: "12+", description: "Engenheiros e desenvolvedores dedicados à plataforma" },
  { role: "Dados", count: "8+", description: "Especialistas em integração com bases governamentais" },
  { role: "Atendimento", count: "6+", description: "Profissionais focados na experiência do cliente" },
];

const About = () => {
  const navigate = useNavigate();

  const breadcrumbs = [
    { name: "Início", url: "https://checkplaca.lovable.app" },
    { name: "Sobre Nós", url: "https://checkplaca.lovable.app/sobre" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Sobre o Checkplaca | Líder em Consulta Veicular"
        description="Conheça o Checkplaca: empresa de Porto Alegre líder em consulta veicular no Brasil. 3 anos de mercado, 500 mil+ consultas realizadas."
        canonical="/sobre"
        schema={[organizationSchema, createBreadcrumbSchema(breadcrumbs)]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-16 md:pt-12 md:pb-24">
          <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Sobre Nós" }]} />

          <div className="text-center mt-8 md:mt-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Porto Alegre, RS — Brasil
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              A plataforma <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">#1</span> em
              <br className="hidden md:block" /> consulta veicular do Brasil
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Há 3 anos ajudamos brasileiros a tomar decisões seguras na compra e venda de veículos.
              Nascemos em Porto Alegre e hoje somos referência nacional em informação veicular.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <stat.icon className={`w-7 h-7 mx-auto mb-3 ${stat.color}`} />
                <p className="text-2xl md:text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Nossa História</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              De uma startup gaúcha a líder nacional em consulta veicular
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-px" />

            <div className="space-y-10">
              {timeline.map((item, i) => (
                <div
                  key={item.year}
                  className={`relative flex items-start gap-6 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 mt-1.5 z-10" />

                  {/* Card */}
                  <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {item.year}
                      </span>
                      <h3 className="text-lg font-bold text-foreground mt-3">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Nossos Valores</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Os pilares que guiam cada decisão e cada linha de código do Checkplaca
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="group bg-card border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mt-4">{value.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Porto Alegre */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Building2 className="w-4 h-4" />
                Orgulhosamente Gaúcha
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                De Porto Alegre para todo o Brasil
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Nossa sede fica em Porto Alegre, capital do Rio Grande do Sul. De lá, operamos
                uma plataforma que atende milhares de brasileiros todos os dias em todos os 26 estados
                e no Distrito Federal.
              </p>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                A cultura gaúcha de trabalho duro, honestidade e inovação está no DNA do Checkplaca.
                Cada relatório que entregamos reflete nosso compromisso com a qualidade e a confiança.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                {["🇧🇷 Cobertura nacional", "📍 Sede em Porto Alegre", "🏆 3 anos de mercado"].map((tag) => (
                  <span key={tag} className="bg-card border border-border px-3 py-1.5 rounded-full text-sm text-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-border">
                <div className="grid grid-cols-2 gap-4">
                  {team.map((t) => (
                    <div key={t.role} className="bg-card rounded-xl p-4 border border-border text-center">
                      <p className="text-2xl font-extrabold text-primary">{t.count}</p>
                      <p className="font-semibold text-foreground text-sm mt-1">{t.role}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                    </div>
                  ))}
                  <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-extrabold text-primary">26+</p>
                    <p className="font-semibold text-foreground text-sm mt-1">Estados</p>
                    <p className="text-xs text-muted-foreground mt-1">Cobertura em todo o território nacional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por que escolher */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Por que escolher o Checkplaca?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Relatório Mais Completo",
                description: "FIPE, multas, restrições, sinistros, recalls, leilão, gravames — tudo em um só lugar.",
              },
              {
                icon: Clock,
                title: "Resultado Instantâneo",
                description: "Consulte qualquer placa e receba o relatório completo em menos de 30 segundos.",
              },
              {
                icon: TrendingUp,
                title: "Dados Sempre Atualizados",
                description: "Integração direta com DENATRAN, RENAVAM, Tabela FIPE e outras bases oficiais.",
              },
              {
                icon: Shield,
                title: "100% Seguro",
                description: "Seus dados são protegidos com criptografia SSL e nunca compartilhados com terceiros.",
              },
              {
                icon: Star,
                title: "Avaliação 4.9/5",
                description: "Milhares de clientes satisfeitos com nota quase perfeita em avaliações.",
              },
              {
                icon: CheckCircle,
                title: "Garantia de Satisfação",
                description: "Se os dados não estiverem corretos, devolvemos 100% do seu dinheiro.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Pronto para consultar?</h2>
          <p className="mt-4 text-lg opacity-90">
            Junte-se a mais de 120 mil brasileiros que já consultaram com o Checkplaca.
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

      {/* Footer mini */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Checkplaca — Porto Alegre, RS. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default About;
