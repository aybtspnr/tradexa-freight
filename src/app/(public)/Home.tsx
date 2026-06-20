import { Link } from "react-router-dom";

const features = [
  {
    title: "Cotações em segundos",
    desc: "Publique sua carga e receba propostas de transportadoras verificadas em minutos. Compare preços, prazos e condições.",
  },
  {
    title: "Rastreamento em tempo real",
    desc: "Acompanhe sua carga do início ao fim com GPS ao vivo, alertas de desvio e ETA inteligente com machine learning.",
  },
  {
    title: "Pagamento seguro",
    desc: "Pagamento online com split automático entre transportadora e plataforma. PIX, cartão ou boleto parcelado.",
  },
  {
    title: "Transportadoras verificadas",
    desc: "Todas as transportadoras passam por validação de documentos (RNTRC, CT-e, CNH). Score de reputação transparente.",
  },
  {
    title: "Documentação digital",
    desc: "CT-e, MDF-e e CIOT tudo digital. OCR com IA para extração automática de dados e alertas de vencimento.",
  },
  {
    title: "Cross-sell TradeXa",
    desc: "Importador classifica NCM no TradeXa e já usa os dados para cotar frete. Tudo integrado.",
  },
];

const plans = [
  {
    name: "Free",
    price: "Grátis",
    desc: "Para começar",
    features: [
      "3 cotações/mês",
      "Rastreamento básico",
      "Perfil público",
    ],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$ 149/mês",
    desc: "Para empresas",
    features: [
      "Cotações ilimitadas",
      "Rastreamento premium",
      "Documentação digital",
      "Prioridade no suporte",
    ],
    cta: "Assinar Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    desc: "Para grandes operações",
    features: [
      "Tudo do Pro",
      "API dedicada",
      "Gerente de conta",
      "Personalização",
    ],
    cta: "Falar com vendas",
    highlight: false,
  },
];

const faqItems = [
  {
    q: "Como funciona o processo de cotação?",
    a: "Você preenche os dados da carga (origem, destino, peso, volume), publica a solicitação e transportadoras verificadas enviam suas propostas. Você compara e escolhe a melhor.",
  },
  {
    q: "Preciso ter CNPJ para usar?",
    a: "Sim, a plataforma é focada em pessoas jurídicas. Transportadoras precisam de CNPJ e documentação regular (RNTRC, CT-e).",
  },
  {
    q: "Como é feito o pagamento?",
    a: "Pagamento online via Stripe Connect com split automático. Aceitamos PIX, cartão de crédito e boleto bancário.",
  },
  {
    q: "Como funciona o rastreamento?",
    a: "O motorista ativa o GPS pelo aplicativo PWA e você acompanha em tempo real pelo mapa. Recebe alertas de desvio e previsão de chegada.",
  },
];

export function Home() {
  return (
    <>
      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F0F4F8] via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              🚛 Marketplace de Transporte
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-text sm:text-5xl md:text-6xl">
              Sua carga chegou até aqui.
              <br />
              <span className="text-primary">Agora faça ela chegar ao destino.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted">
              Conectamos embarcadores a transportadores de confiança. Cote,
              contrate e rastreie fretes em todo o Brasil e América do Sul.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                to="/cadastro"
                className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white no-underline shadow-sm transition-colors hover:bg-primary-dark"
              >
                Cotar frete agora
              </Link>
              <Link
                to="/como-funciona"
                className="rounded-lg border border-border bg-white px-8 py-3 text-base font-semibold text-text no-underline transition-colors hover:bg-surface"
              >
                Como funciona
              </Link>
            </div>
          </div>
        </div>
        {/* Gradient decoration */}
        <div className="absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 left-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-text sm:text-4xl">
              Tudo que você precisa para{" "}
              <span className="text-primary">transportar</span>
            </h2>
            <p className="mt-4 text-text-muted">
              Uma plataforma completa para gerenciar suas cargas do início ao fim.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-text group-hover:text-primary">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-text sm:text-4xl">
              Planos <span className="text-primary">simples</span>
            </h2>
            <p className="mt-4 text-text-muted">
              Escolha o plano ideal para o seu negócio.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 ${
                  plan.highlight
                    ? "border-primary bg-primary shadow-lg"
                    : "border-border bg-white shadow-sm"
                }`}
              >
                <h3
                  className={`text-xl font-bold ${
                    plan.highlight ? "text-white" : "text-text"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    plan.highlight ? "text-primary/80" : "text-text-muted"
                  }`}
                >
                  {plan.desc}
                </p>
                <p
                  className={`mt-4 text-3xl font-bold ${
                    plan.highlight ? "text-white" : "text-text"
                  }`}
                >
                  {plan.price}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className={`flex items-center gap-2 text-sm ${
                        plan.highlight ? "text-white/80" : "text-text-muted"
                      }`}
                    >
                      <svg
                        className={`h-4 w-4 shrink-0 ${
                          plan.highlight ? "text-white" : "text-primary"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/cadastro"
                  className={`mt-8 flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold no-underline transition-colors ${
                    plan.highlight
                      ? "bg-white text-primary hover:bg-gray-100"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text sm:text-4xl">
              Perguntas <span className="text-primary">frequentes</span>
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-white p-6 shadow-sm transition-all open:border-primary/20 open:shadow-md"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-text">
                  {item.q}
                  <svg
                    className="h-5 w-5 shrink-0 text-text-muted transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-text-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Junte-se a centenas de empresas que já usam a TradeXa Fretes.
          </p>
          <Link
            to="/cadastro"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-primary no-underline shadow-sm transition-colors hover:bg-gray-100"
          >
            Criar conta gratuita
          </Link>
        </div>
      </section>
    </>
  );
}
