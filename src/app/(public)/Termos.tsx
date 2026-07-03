import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSeo } from "@/hooks/useSeo";

export function Termos() {
  const seo = useSeo({
    title: "Termos de Uso da Plataforma de Fretes — TradeXa Fretes",
    description:
      "Termos de uso da plataforma TradeXa Fretes. Condições gerais para utilização dos serviços de fretes online, planos, pagamentos e responsabilidades.",
    keywords:
      "termos de uso, TradeXa, condições de uso, fretes, plataforma de fretes, termos",
    canonical: "https://www.tradexafretes.com.br/termos",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: "Termos de Uso — TradeXa Fretes",
          description:
            "Termos de uso da plataforma TradeXa Fretes. Condições gerais para utilização dos serviços de fretes, planos e pagamentos.",
          isPartOf: {
            "@type": "WebSite",
            name: "TradeXa Fretes",
            url: "https://www.tradexafretes.com.br",
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.tradexafretes.com.br" },
            { "@type": "ListItem", position: 2, name: "Termos de Uso", item: "https://www.tradexafretes.com.br/termos" },
          ],
        },
      ],
    },
  });

  const sections = [
    {
      title: "Aceitação dos Termos",
      content:
        "Ao utilizar a plataforma TradeXa Fretes, você aceita integralmente estes Termos de Uso. Caso não concorde com qualquer condição, recomendamos que não utilize nossos serviços. O acesso à plataforma implica concordância plena com todas as disposições aqui descritas.",
    },
    {
      title: "Descrição dos Serviços",
      content:
        "A TradeXa Fretes é uma plataforma digital que conecta embarcadores a transportadoras verificadas. Disponibilizamos funcionalidades de cotação em tempo real, rastreamento de cargas, documentação digital integrada (CT-e, manifesto), pagamento seguro via Stripe Connect e gestão de frota. Não somos transportadores nem assumimos responsabilidade pela execução física do transporte.",
    },
    {
      title: "Cadastro e Conta",
      content:
        "O usuário é responsável pela veracidade e atualização dos dados fornecidos no cadastro. Cada conta é pessoal, intransferível e vinculada a um CNPJ válido. A senha deve ser mantida em sigilo absoluto. A TradeXa reserva-se o direito de suspender ou cancelar contas que apresentem informações falsas, inconsistentes ou que violem estes termos.",
    },
    {
      title: "Planos e Pagamentos",
      content:
        "Oferecemos três modalidades: Essential (grátis, com funcionalidades básicas), Pro (R$ 149/mês, com recursos avançados como relatórios e prioridade no suporte) e Enterprise (sob consulta, para grandes volumes com condições personalizadas). As taxas de serviço sobre transações são informadas previamente. Pagamentos são processados via Stripe Connect e cobranças indevidas devem ser reportadas em até 30 dias.",
    },
    {
      title: "Uso Aceitável",
      content:
        "O usuário compromete-se a utilizar a plataforma exclusivamente para fins lícitos relacionados ao transporte de cargas. É expressamente proibido revender dados, realizar scraping, automatizar acessos sem autorização, cadastrar cargas fictícias ou qualquer conduta que possa prejudicar a integridade do ecossistema TradeXa.",
    },
    {
      title: "Propriedade Intelectual",
      content:
        "Todo o conteúdo da plataforma — incluindo código, design, marcas, logotipos, textos e dados agregados — é propriedade exclusiva da TradeXa Tecnologia Ltda. É vedada a reprodução, distribuição ou uso comercial sem autorização prévia por escrito.",
    },
    {
      title: "Limitação de Responsabilidade",
      content:
        "A plataforma é fornecida \"como está\", sem garantias de disponibilidade ininterrupta ou ausência de erros. A TradeXa não se responsabiliza por avarias, atrasos, extravios ou quaisquer danos decorrentes da execução do transporte, que é de responsabilidade exclusiva da transportadora contratada. Nosso papel é exclusivamente tecnológico.",
    },
    {
      title: "Cancelamento",
      content:
        "O usuário pode cancelar sua conta a qualquer momento, sem multa ou burocracia. Planos pagos mantêm acesso até o final do período já faturado. Não realizamos reembolso proporcional por cancelamento antecipado, salvo disposição em contrário prevista em contrato específico.",
    },
    {
      title: "Disposições Gerais",
      content:
        "Estes Termos de Uso são regidos pela legislação brasileira. Fica eleito o foro da cidade de Florianópolis, Santa Catarina, para dirimir quaisquer controvérsias. A TradeXa poderá alterar estes termos a qualquer momento, notificando os usuários com antecedência mínima de 15 dias por e-mail. O uso continuado após a vigência das alterações constitui aceitação automática.",
    },
  ];

  return (
    <>
      {seo}
      {/* ─── HERO ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <span className="inline-flex px-4 py-1.5 rounded-full bg-[#2563eb]/10 text-[#2563eb] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
              Legal
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold text-[#0F111A] mb-4"
          >
            Termos de Uso
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-[#5E6278]"
          >
            Última atualização: Junho de 2026
          </motion.p>
        </div>
      </section>

      {/* ─── CONTEÚDO ────────────────────────────────────── */}
      <section className="pb-20 md:pb-28 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="max-w-none space-y-10 text-[#5E6278] leading-relaxed text-sm md:text-base">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
              >
                <h2 className="text-xl font-extrabold text-[#0F111A] mb-4">
                  {section.title}
                </h2>
                <p>{section.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="pb-20 md:pb-28 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#2563eb] px-8 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#1d4ed8] hover:shadow-md"
          >
            Voltar ao início
          </Link>
        </div>
      </section>
    </>
  );
}
