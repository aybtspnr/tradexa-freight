import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";

interface PlanFeature {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

const planFeatures: PlanFeature[] = [
  {
    label: "Cotações por mês",
    free: "3",
    pro: "Ilimitadas",
    enterprise: "Ilimitadas",
  },
  {
    label: "Rastreamento",
    free: "Básico",
    pro: "Premium (GPS ao vivo)",
    enterprise: "Premium + API",
  },
  {
    label: "Documentação digital",
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    label: "Suporte",
    free: "Comunidade",
    pro: "Prioritário",
    enterprise: "Dedicado 24/7",
  },
  {
    label: "API",
    free: false,
    pro: false,
    enterprise: true,
  },
];

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 text-[#2563eb]"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 12.75 6 6 9-13.5"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      className="h-4 w-4 text-[#94a3b8]"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14"
      />
    </svg>
  );
}

const plans = [
  {
    name: "Essential",
    key: "free" as const,
    price: "Grátis",
    desc: "Para começar",
    cta: "Começar grátis",
    highlight: false,
    linkTo: "/cadastro",
  },
  {
    name: "Pro",
    key: "pro" as const,
    price: "R$ 149/mês",
    desc: "Para empresas",
    cta: "Assinar Pro",
    highlight: true,
    linkTo: "/cadastro",
  },
  {
    name: "Enterprise",
    key: "enterprise" as const,
    price: "Sob consulta",
    desc: "Para grandes operações",
    cta: "Falar com vendas",
    highlight: false,
    linkTo: "/contato",
  },
];

export function Planos() {
  const seo = useSeo({
    title: "Planos e Preços de Frete — TradeXa Fretes",
    description:
      "Escolha o plano ideal para seu negócio: Essential gratuito, Pro (R$ 149/mês) ou Enterprise. Cotações ilimitadas, rastreamento premium e suporte prioritário.",
    keywords:
      "planos frete, preços frete, frete grátis, plano essential, plano pro, TradeXa Fretes, assinar frete",
    canonical: "https://www.tradexafretes.com.br/planos",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          name: "TradeXa Fretes — Planos",
          description:
            "Plataforma de fretes com planos Essential (grátis), Pro (R$ 149/mês) e Enterprise (sob consulta).",
          brand: {
            "@type": "Brand",
            name: "TradeXa Fretes",
          },
          offers: [
            {
              "@type": "Offer",
              name: "Essential",
              price: "0",
              priceCurrency: "BRL",
              description: "Plano gratuito com 3 cotações por mês",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              name: "Pro",
              price: "149",
              priceCurrency: "BRL",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "149",
                priceCurrency: "BRL",
                unitText: "month",
              },
              description: "Plano profissional com cotações ilimitadas e rastreamento premium",
              availability: "https://schema.org/InStock",
            },
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.tradexafretes.com.br" },
            { "@type": "ListItem", position: 2, name: "Planos", item: "https://www.tradexafretes.com.br/planos" },
          ],
        },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Posso mudar de plano depois?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor é ajustado proporcionalmente ao restante do mês.",
              },
            },
            {
              "@type": "Question",
              name: "Existe período de teste grátis?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "O plano Free é gratuito por tempo ilimitado. Você pode testar a plataforma com 3 cotações por mês sem pagar nada. Para empresas que precisam de mais, oferecemos 7 dias de teste grátis no plano Pro.",
              },
            },
            {
              "@type": "Question",
              name: "Como funciona o plano Enterprise?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "O plano Enterprise é customizado para grandes operações. Inclui API dedicada para integração com seus sistemas, gerente de conta exclusivo, suporte 24/7 e condições especiais de volume. Entre em contato para um orçamento personalizado.",
              },
            },
          ],
        },
      ],
    },
  });

  return (
    <>
      {seo}
      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white mesh-gradient">
        <div className="mx-auto max-w-[1400px] px-8 py-20 text-center sm:py-28">
          <span className="inline-block rounded-full bg-[#eef2ff] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
            Planos
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-[#2563eb]"
              style={{
                background: "linear-gradient(135deg, #2563eb, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
            Escolha o plano certo para o seu negócio
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#475569]">
            Do embarcador ocasional à grande operadora, temos o plano ideal
            para você. Cancele quando quiser, sem multa.
          </p>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────── */}
      <section className="bg-[#f8fafc] py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-8">
          {/* Cards layout on mobile, grid on md+ */}
          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[12px] border p-8 ${
                  plan.highlight
                    ? "border-[#2563eb] bg-[#2563eb] shadow-lg md:-mt-4"
                    : "surface-card"
                }`}
              >
                <h3
                  className={`text-xl font-bold ${
                    plan.highlight ? "text-white" : "text-[#0f172a]"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    plan.highlight ? "text-white/70" : "text-[#64748b]"
                  }`}
                >
                  {plan.desc}
                </p>
                <p
                  className={`mt-4 text-3xl font-bold ${
                    plan.highlight ? "text-white" : "text-[#0f172a]"
                  }`}
                >
                  {plan.price}
                </p>

                <ul className="mt-6 space-y-3">
                  {planFeatures.map((feat) => {
                    const value = feat[plan.key];
                    return (
                      <li
                        key={feat.label}
                        className={`flex items-center gap-2 text-sm ${
                          plan.highlight ? "text-white/80" : "text-[#475569]"
                        }`}
                      >
                        {value === true ? (
                          <CheckIcon />
                        ) : value === false ? (
                          <MinusIcon />
                        ) : (
                          <span
                            className={`text-xs font-semibold ${
                              plan.highlight ? "text-white" : "text-[#2563eb]"
                            }`}
                          >
                            {value}
                          </span>
                        )}
                        <span className="flex-1">{feat.label}</span>
                        {typeof value === "string" && (
                          <span
                            className={`text-xs font-medium ${
                              plan.highlight
                                ? "text-white/90"
                                : "text-[#0f172a]"
                            }`}
                          >
                            {value}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <Link
                  to={plan.linkTo}
                  className={`mt-8 flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold no-underline transition-colors ${
                    plan.highlight
                      ? "bg-white text-[#2563eb] hover:bg-gray-100"
                      : "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white hover:from-[#1d4ed8]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ PLANOS ────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-8">
          <h2 className="mb-8 text-[30px] font-bold text-[#0f172a]"
              style={{ borderLeft: "4px solid #2563eb", paddingLeft: 16 }}>
            Dúvidas sobre planos
          </h2>
          <p className="mb-8 text-[#475569] max-w-2xl">
            Tire suas dúvidas sobre nossos planos e preços.
          </p>
          <div className="space-y-4 max-w-3xl">
            <details className="group rounded-lg bg-[#f1f5f9] p-6 transition-all open:bg-[#eef2ff]">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-[#1e293b]">
                Posso mudar de plano depois?
                <svg
                  className="h-5 w-5 shrink-0 text-[#64748b] transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-[#475569]">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a
                qualquer momento. O valor é ajustado proporcionalmente ao
                restante do mês.
              </p>
            </details>

            <details className="group rounded-lg bg-[#f1f5f9] p-6 transition-all open:bg-[#eef2ff]">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-[#1e293b]">
                Existe período de teste grátis?
                <svg
                  className="h-5 w-5 shrink-0 text-[#64748b] transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-[#475569]">
                O plano Free é gratuito por tempo ilimitado. Você pode testar a
                plataforma com 3 cotações por mês sem pagar nada. Para empresas
                que precisam de mais, oferecemos 7 dias de teste grátis no plano
                Pro.
              </p>
            </details>

            <details className="group rounded-lg bg-[#f1f5f9] p-6 transition-all open:bg-[#eef2ff]">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-[#1e293b]">
                Como funciona o plano Enterprise?
                <svg
                  className="h-5 w-5 shrink-0 text-[#64748b] transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-[#475569]">
                O plano Enterprise é customizado para grandes operações. Inclui
                API dedicada para integração com seus sistemas, gerente de conta
                exclusivo, suporte 24/7 e condições especiais de volume. Entre
                em contato para um orçamento personalizado.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] py-20">
        <div className="mx-auto max-w-2xl px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ainda tem dúvidas?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Fale com nossa equipe comercial e descubra a melhor solução para sua
            empresa.
          </p>
          <Link
            to="/contato"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-[#2563eb] no-underline shadow-sm transition-colors hover:bg-gray-100"
          >
            Falar com vendas
          </Link>
        </div>
      </section>
    </>
  );
}
