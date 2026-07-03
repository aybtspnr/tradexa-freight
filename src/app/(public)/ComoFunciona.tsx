import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";

interface StepProps {
  number: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

function StepCard({ title, desc, icon }: StepProps) {
  return (
    <div className="group relative surface-card rounded-[12px] p-8 transition-all hover:shadow-md">
      {/* Step number badge */}
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#eef2ff] text-[#2563eb]">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-[#0f172a] group-hover:text-[#2563eb]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#475569]">{desc}</p>

      {/* Connecting line (hidden on mobile) */}
      <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block">
        <svg
          className="h-6 w-6 text-[#e2e8f0]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </div>
    </div>
  );
}

const steps = [
  {
    number: 1,
    title: "Cadastro",
    desc: "Crie sua conta gratuita em menos de 2 minutos. Informe seus dados básicos e comece a usar a plataforma imediatamente.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
        />
      </svg>
    ),
  },
  {
    number: 2,
    title: "Cotação",
    desc: "Publique sua carga com origem, destino, peso e volume. Transportadoras verificadas enviam propostas em minutos.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
  },
  {
    number: 3,
    title: "Contratação",
    desc: "Compare preços, prazos e condições. Escolha a melhor proposta e contrate com pagamento seguro integrado.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
        />
      </svg>
    ),
  },
  {
    number: 4,
    title: "Rastreamento",
    desc: "Acompanhe sua carga em tempo real com GPS ao vivo, alertas de desvio de rota e ETA inteligente baseado em machine learning.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        />
      </svg>
    ),
  },
];

const benefits = [
  "Plataforma 100% digital, sem burocracia",
  "Transportadoras verificadas e com score de reputação",
  "Pagamento seguro com split automático",
  "Suporte prioritário para planos Pro e Enterprise",
];

export function ComoFunciona() {
  const seo = useSeo({
    title: "Como Funciona",
    description:
      "Veja como funciona a TradeXa Fretes em 4 passos: cadastro, cotação, contratação e rastreamento. Conecte-se a transportadoras verificadas e otimize seus fretes.",
    keywords:
      "como funciona frete, plataforma de fretes, cotação de frete, rastreamento de carga, TradeXa Fretes, fretes online",
    canonical: "https://www.tradexafretes.com.br/como-funciona",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "HowTo",
          name: "Como usar a TradeXa Fretes",
          description:
            "Veja como funciona a TradeXa Fretes em 4 passos simples: cadastro, cotação, contratação e rastreamento.",
          step: [
            {
              "@type": "HowToStep",
              position: 1,
              name: "Cadastro",
              text: "Crie sua conta gratuita em menos de 2 minutos. Informe seus dados básicos e comece a usar a plataforma imediatamente.",
            },
            {
              "@type": "HowToStep",
              position: 2,
              name: "Cotação",
              text: "Publique sua carga com origem, destino, peso e volume. Transportadoras verificadas enviam propostas em minutos.",
            },
            {
              "@type": "HowToStep",
              position: 3,
              name: "Contratação",
              text: "Compare preços, prazos e condições. Escolha a melhor proposta e contrate com pagamento seguro integrado.",
            },
            {
              "@type": "HowToStep",
              position: 4,
              name: "Rastreamento",
              text: "Acompanhe sua carga em tempo real com GPS ao vivo, alertas de desvio de rota e ETA inteligente.",
            },
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.tradexafretes.com.br" },
            { "@type": "ListItem", position: 2, name: "Como Funciona", item: "https://www.tradexafretes.com.br/como-funciona" },
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
            Como Funciona
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-[#2563eb]"
              style={{
                background: "linear-gradient(135deg, #2563eb, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
            Sua carga em 4 passos simples
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#475569]">
            Do cadastro ao rastreamento, a TradeXa Fretes simplifica cada
            etapa do transporte de cargas. Veja como é fácil.
          </p>
        </div>
      </section>

      {/* ── STEPS ────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <StepCard {...step} />
              </div>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="mx-auto mt-8 hidden max-w-2xl lg:block">
            <div className="flex items-center justify-between">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb] text-xs font-bold text-white">
                    {step.number}
                  </div>
                  <span className="text-xs font-medium text-[#64748b]">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ────────────────────────────────────── */}
      <section className="bg-[#f8fafc] py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-8">
          <h2 className="mb-8 text-[30px] font-bold text-[#0f172a]"
              style={{ borderLeft: "4px solid #2563eb", paddingLeft: 16 }}>
            Por que escolher a TradeXa Fretes
          </h2>
          <p className="mb-8 max-w-2xl text-[#475569]">
            Mais de 500 empresas confiam na nossa plataforma para gerenciar
            seus fretes.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="surface-card rounded-[12px] flex items-center gap-4 p-5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#2563eb]">
                  <svg
                    className="h-4 w-4"
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
                </div>
                <span className="text-sm font-medium text-[#0f172a]">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] py-20">
        <div className="mx-auto max-w-2xl px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Crie sua conta gratuita e comece a cotar fretes em menos de 2
            minutos.
          </p>
          <Link
            to="/cadastro"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-[#2563eb] no-underline shadow-sm transition-colors hover:bg-gray-100"
          >
            Criar conta gratuita
          </Link>
        </div>
      </section>
    </>
  );
}
