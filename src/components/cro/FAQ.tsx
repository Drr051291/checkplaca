import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { createFAQSchema } from "@/components/SEO";

const faqs = [
  {
    question: "O que está incluído no relatório completo?",
    answer: "O relatório completo inclui dados básicos do veículo, tabela FIPE, verificação de roubo/furto, histórico de leilão, gravames financeiros, recalls pendentes e muito mais. Você terá acesso a todas as informações importantes para tomar uma decisão segura."
  },
  {
    question: "Como funciona a garantia de reembolso?",
    answer: "Oferecemos garantia de 100% do seu dinheiro de volta em até 30 dias se você não ficar satisfeito com o relatório. Sem perguntas, sem complicações. Basta entrar em contato com nosso suporte."
  },
  {
    question: "O relatório é aceito para financiamento?",
    answer: "Sim! Nosso relatório é completo e contém todas as informações que bancos e financeiras precisam para análise de crédito, incluindo verificação de gravames e histórico do veículo."
  },
  {
    question: "Quanto tempo leva para receber o relatório?",
    answer: "O relatório é gerado instantaneamente após a confirmação do pagamento. Você receberá acesso imediato ao relatório completo e poderá fazer o download em PDF."
  },
  {
    question: "Os dados são atualizados?",
    answer: "Sim! Consultamos as bases de dados oficiais em tempo real para garantir que você receba as informações mais atualizadas sobre o veículo, incluindo Detran, Denatran e tabela FIPE."
  },
  {
    question: "Posso consultar quantas placas quiser?",
    answer: "Cada relatório é individual por placa consultada. Se você precisar consultar múltiplos veículos, precisará adquirir um relatório para cada um deles."
  },
  {
    question: "O pagamento é seguro?",
    answer: "Absolutamente! Utilizamos criptografia de ponta e processadores de pagamento certificados (PCI-DSS). Seus dados financeiros estão completamente protegidos."
  },
  {
    question: "Posso ver uma amostra do relatório antes de comprar?",
    answer: "Sim! A consulta gratuita que você acabou de ver mostra os dados básicos. O relatório completo adiciona informações detalhadas sobre FIPE, roubo/furto, leilão, gravames e recalls que não estão disponíveis na versão gratuita."
  },
  {
    question: "Como consultar placa de veículo pelo Checkplaca?",
    answer: "É simples: digite a placa do veículo no campo de busca na página inicial, clique em consultar e veja o resumo gratuito. Para informações completas como tabela FIPE, histórico e gravames, desbloqueie o relatório completo por apenas R$ 17,90."
  },
  {
    question: "Quais informações posso obter consultando uma placa?",
    answer: "Você pode obter: dados cadastrais do veículo (marca, modelo, ano, cor), tabela FIPE atualizada, histórico de roubo e furto, registros de leilão, gravames e restrições financeiras, recalls do fabricante e informações técnicas completas."
  }
];

export const FAQ = () => {
  const faqSchema = createFAQSchema(faqs);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      <Card className="shadow-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center justify-center" id="faq-titulo">
            <HelpCircle className="w-6 h-6 text-primary" aria-hidden="true" />
            <span>Perguntas Frequentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
};
