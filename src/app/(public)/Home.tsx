import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { FreightBentoGrid } from "@/components/premium/FreightBentoGrid";
import { FreightModulesSection } from "@/components/premium/FreightModulesSection";
import { useSeo } from "@/hooks/useSeo";

const faq = [
  {
    q: "Como funciona o processo de cotação?",
    a: "Você preenche os dados da carga (origem, destino, peso, volume), publica a solicitação e transportadoras verificadas enviam propostas em minutos. Você compara preços, prazos e condições e contrata com um clique.",
  },
  {
    q: "Preciso ter CNPJ para usar?",
    a: "Sim, a plataforma é focada em pessoas jurídicas. Transportadoras precisam de CNPJ e documentação regular (RNTRC). Embarcadores precisam de CNPJ para emissão de CT-e.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Pagamento online via Stripe Connect com split automático. Aceitamos PIX (1,19%), cartão de crédito (3,99%) e boleto bancário (R$ 3,45). O valor é dividido automaticamente entre transportadora e plataforma.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Todos os planos pagos podem ser cancelados sem multa. Você mantém acesso até o final do período contratado. O plano Essential é gratuito e não requer cancelamento.",
  },
  {
    q: "Como as transportadoras são verificadas?",
    a: "Todos os parceiros passam por validação de documentação: RNTRC ativo, CNH dos motoristas, CRLV dos veículos e certidões negativas. Cada transportadora tem um score de reputação transparente.",
  },
];

export function Home() {
  const seo = useSeo({
    title: "Plataforma de Fretes: Cotação, Rastreamento e Gestão",
    description:
      "Plataforma de fretes online: cotações em minutos, rastreamento GPS ao vivo e pagamento seguro. Conectamos embarcadores a transportadoras verificadas.",
    keywords:
      "frete, plataforma de fretes, cotação de frete, transportadora, embarcador, rastreamento de carga, frete online, TradeXa Fretes",
    canonical: "https://www.tradexafretes.com.br",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "TradeXa Fretes",
          url: "https://www.tradexafretes.com.br",
          description:
            "Plataforma de fretes que conecta embarcadores a transportadoras verificadas. Cotações em minutos, rastreamento ao vivo e pagamento seguro.",
        },
        {
          "@type": "Organization",
          name: "TradeXa Fretes",
          url: "https://www.tradexafretes.com.br",
          logo: "https://www.tradexafretes.com.br/logo-fretes.png",
          image: "https://www.tradexafretes.com.br/og-image.webp",
          description:
            "Plataforma de fretes que conecta embarcadores a transportadoras verificadas. Cotações em minutos, rastreamento ao vivo e pagamento seguro.",
          inLanguage: "pt-BR",
          areaServed: { "@type": "Country", name: "BR" },
          contactPoint: {
            "@type": "ContactPoint",
            email: "help@tradexafretes.com.br",
            contactType: "customer support",
            availableLanguage: ["Portuguese", "English"],
          },
          sameAs: [
            "https://www.linkedin.com/company/tradexa",
            "https://www.instagram.com/tradexafretes",
            "https://www.facebook.com/tradexafretes",
            "https://www.youtube.com/@tradexafretes",
          ],
        },
        {
          "@type": "WebApplication",
          name: "TradeXa Fretes",
          description:
            "Plataforma de fretes que conecta embarcadores a transportadoras verificadas. Cotações em minutos, rastreamento ao vivo e pagamento seguro.",
          url: "https://www.tradexafretes.com.br",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "BRL",
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.tradexafretes.com.br" },
          ],
        },
      ],
    },
  });

  return (
    <>
      {seo}
      {/* ─── HERO ────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 text-xs font-bold uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5" />
              Plataforma de Fretes em Tempo Real
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.1]"
          >
            Cotação, Rastreamento{" "}
            <span className="inline-block text-[#2563eb]">
              e Gestão de Fretes
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Conectamos embarcadores a transportadoras de confiança. Cotações em minutos,
            rastreamento ao vivo e pagamento seguro — tudo em um só lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/cadastro"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-8 py-3.5 text-base font-bold text-white no-underline transition-all hover:shadow-xl"
              style={{ boxShadow: "0 4px 20px rgba(37,99,235,0.4)" }}
            >
              Cotar frete agora <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/como-funciona"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 no-underline transition-colors hover:bg-gray-100"
            >
              Como funciona
            </Link>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400"
        >
          <svg className="w-6 h-6 rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.div>
      </section>

      {/* ─── BENTO GRID ──────────────────────────────────── */}
      <FreightBentoGrid />

      {/* ─── MÓDULOS PREMIUM ─────────────────────────────── */}
      <FreightModulesSection />

      {/* ─── COMO FUNCIONA ────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 text-xs font-bold uppercase tracking-[0.2em] mb-5">
              Como Funciona
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900">
              Sua carga em{" "}
              <span className="text-[#2563eb]">3 passos simples</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Publique sua Carga", desc: "Informe origem, destino, peso e volume. Sua solicitação vai para transportadoras verificadas.", icon: "📋" },
              { step: "02", title: "Compare Propostas", desc: "Receba propostas em minutos. Compare preços, prazos e condições das transportadoras.", icon: "📊" },
              { step: "03", title: "Acompanhe sua Carga", desc: "Contrate e acompanhe sua carga em tempo real com GPS. Pagamento seguro integrado.", icon: "🚚" },
            ].map((item) => (
              <div key={item.step} className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-[#2563eb]/30 hover:shadow-lg transition-all">
                <div className="text-5xl font-black text-gray-200 mb-4">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-[#2563eb]/10 flex items-center justify-center mb-4">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[900px] px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 text-xs font-bold uppercase tracking-[0.2em] mb-5">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
              Perguntas Frequentes
            </h2>
          </div>
          <div className="space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-[12px] bg-[#f1f5f9] p-5 transition-all open:bg-[#eef2ff]"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-[#1e293b]">
                  {item.q}
                  <svg className="h-5 w-5 shrink-0 text-[#64748b] transition-transform group-open:rotate-180"
                       fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ───────────────────────────────────── */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 text-center">
        <div className="mx-auto max-w-2xl px-8">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            Comece gratuitamente agora
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#5E6278]">
            Crie sua conta gratuita em menos de 2 minutos. Sem cartão de crédito.
            Descubra como a TradeXa Fretes pode transformar suas operações de transporte.
          </p>
          <Link
            to="/cadastro"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-10 py-4 text-lg font-bold text-white no-underline shadow-lg transition-all hover:shadow-xl"
            style={{ boxShadow: "0 4px 20px rgba(37,99,235,0.4)" }}
          >
            Criar conta gratuita <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-3 text-[13px] text-[#64748b]">Comece gratuitamente. Sem cartão de crédito.</p>
        </div>
      </section>
    </>
  );
}
