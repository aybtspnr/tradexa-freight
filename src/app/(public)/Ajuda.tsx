export function Ajuda() {
  const faqItems = [
    {
      q: "Como funciona o Tradexa Fretes?",
      a: "Tradexa Fretes é um marketplace B2B de fretes. Embarcadores publicam suas cargas, transportadoras verificadas enviam propostas, e você escolhe a melhor. Tudo com rastreamento, documentação digital e pagamento seguro integrados.",
    },
    {
      q: "Preciso ter CNPJ para usar?",
      a: "Sim, a plataforma é exclusiva para pessoas jurídicas. Embarcadores e transportadoras precisam de CNPJ ativo. Transportadoras também precisam de RNTRC (ANTT) regular.",
    },
    {
      q: "Quanto custa?",
      a: "Temos planos a partir de R$ 149/mês (Plano Pro) com cotações ilimitadas. O plano Grátis permite até 3 cotações por mês. Consulte nossa página de planos para detalhes completos.",
    },
    {
      q: "Como as transportadoras são verificadas?",
      a: "Toda transportadora passa por validação de documentos: CNPJ, RNTRC, certidões negativas, comprovante de seguro. Além disso, mantemos um sistema de reputação com avaliações de embarcadores.",
    },
    {
      q: "Como funciona o pagamento?",
      a: "O pagamento é processado online via split automático. O embarcador paga, a transportadora recebe, e a plataforma retém a comissão. Aceitamos PIX, cartão de crédito e boleto bancário.",
    },
    {
      q: "E se a carga for danificada ou roubada?",
      a: "Todas as cargas contam com seguro obrigatório. Em caso de sinistro, a transportadora é responsável. A Tradexa Fretes oferece mediação e suporte para garantir a resolução.",
    },
    {
      q: "Como é feito o rastreamento?",
      a: "O motorista ativa o GPS pelo aplicativo (PWA) e o embarcador acompanha em tempo real pelo mapa. Alertas de desvio de rota, atraso e previsão de chegada são enviados automaticamente.",
    },
    {
      q: "O que é a integração com NCM da Tradexa?",
      a: "Se você já usa o Tradexa para classificação NCM de seus produtos, os dados são automaticamente aproveitados para cotar fretes. Isso elimina retrabalho e garante compliance regulatório completo (ANTT, ANVISA, Exército, IBAMA).",
    },
    {
      q: "Como cadastrar minha transportadora?",
      a: "Crie sua conta gratuita, selecione o perfil 'Transportadora' e preencha os dados da sua empresa. Após aprovação dos documentos, você já pode dar lances em cargas disponíveis.",
    },
    {
      q: "Posso cancelar minha assinatura?",
      a: "Sim, você pode cancelar a qualquer momento. O acesso permanece até o fim do período já pago. Não há multa de cancelamento.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            ❓ Ajuda
          </span>
          <h1 className="mt-4 text-4xl font-bold text-text sm:text-5xl">
            Perguntas <span className="text-primary">frequentes</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-muted">
            Tire suas dúvidas sobre o Tradexa Fretes. Se não encontrar o que precisa, entre em contato.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border bg-white p-6 shadow-sm transition-all open:border-primary/20 open:shadow-md dark:border-gray-700 dark:bg-gray-900"
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

        {/* Contact CTA */}
        <div className="mt-12 rounded-2xl border border-border bg-surface p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <span className="text-3xl">💬</span>
          <h2 className="mt-3 text-xl font-bold text-text">Ainda tem dúvidas?</h2>
          <p className="mt-2 text-sm text-text-muted">
            Nossa equipe está pronta para ajudar. Fale conosco pelo chat, WhatsApp ou e-mail.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="/contato"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
            >
              Fale conosco
            </a>
            <a
              href="/como-funciona"
              className="rounded-lg border border-border bg-white px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Como funciona
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Ajuda;
