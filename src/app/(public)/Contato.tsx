import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Clock, MessageSquare, CheckCircle2, Send, ArrowRight } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

export function Contato() {
  const seo = useSeo({
    title: "Fale Conosco — Suporte TradeXa Fretes",
    description:
      "Entre em contato com a TradeXa Fretes. Tire dúvidas sobre fretes, planos ou suporte técnico. Nossa equipe responde em até 24 horas úteis.",
    keywords:
      "contato TradeXa, suporte frete, help tradexa, dúvidas frete, falar com vendas",
    canonical: "https://www.tradexafretes.com.br/contato",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ContactPage",
          name: "Contato — Fale com a TradeXa Fretes",
          description:
            "Entre em contato com a TradeXa Fretes. Tire dúvidas sobre fretes, planos ou suporte.",
          mainEntity: {
            "@type": "Organization",
            name: "TradeXa Fretes",
            email: "help@tradexafretes.com.br",
            contactPoint: [
              {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "help@tradexafretes.com.br",
                availableLanguage: ["Portuguese", "English"],
              },
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.tradexafretes.com.br" },
            { "@type": "ListItem", position: 2, name: "Contato", item: "https://www.tradexafretes.com.br/contato" },
          ],
        },
      ],
    },
  });

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simulate send — TODO: replace with real API call (e.g., Supabase Edge Function or SendGrid API)
    // Backend endpoint suggestion: POST /api/contact { name, email, subject, message }
    // See: scripts/contact-api-example.js for reference
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  };

  return (
    <>
      {seo}
      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
              Contato
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] mb-4">
              Fale com a gente
            </h1>
            <p className="text-lg text-[#5E6278] max-w-xl mx-auto">
              Dúvidas sobre fretes, planos ou precisa de ajuda? Estamos aqui.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FORM + INFO ──────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          {/* Left — Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
                ><h2 className="sr-only">{sent ? "Mensagem enviada com sucesso" : "Formulário de Contato"}</h2>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl p-10 border border-black/[0.06] text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-[#10b981] mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-[#0F111A] mb-2">
                    Mensagem enviada!
                  </h2>
                  <p className="text-[#5E6278] mb-6">
                    Responderemos em até 24 horas úteis.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white rounded-xl px-6 py-3 text-sm font-semibold transition-all"
                    >
                      Voltar ao início <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        setSent(false);
                        setForm({ name: "", email: "", subject: "", message: "" });
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-black/[0.15] px-6 py-3 text-sm font-semibold text-[#0F111A] hover:bg-black/[0.03] transition-colors"
                    >
                      Nova mensagem
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl p-8 border border-black/[0.06] space-y-5"
                >
                  <div>
                    <label htmlFor="contato-name" className="text-sm font-bold text-[#0F111A] mb-1.5 block">
                      Nome
                    </label>
                    <input
                      id="contato-name"
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="block w-full h-12 rounded-xl border-2 border-slate-200 px-4 text-sm outline-none transition-colors focus:border-[#2563eb] focus:ring-0"
                    />
                  </div>
                  <div>
                    <label htmlFor="contato-email" className="text-sm font-bold text-[#0F111A] mb-1.5 block">
                      Email
                    </label>
                    <input
                      id="contato-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="block w-full h-12 rounded-xl border-2 border-slate-200 px-4 text-sm outline-none transition-colors focus:border-[#2563eb] focus:ring-0"
                    />
                  </div>
                  <div>
                    <label htmlFor="contato-subject" className="text-sm font-bold text-[#0F111A] mb-1.5 block">
                      Assunto
                    </label>
                    <input
                      id="contato-subject"
                      type="text"
                      placeholder="Dúvida, sugestão, parceria..."
                      required
                      value={form.subject}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, subject: e.target.value }))
                      }
                      className="block w-full h-12 rounded-xl border-2 border-slate-200 px-4 text-sm outline-none transition-colors focus:border-[#2563eb] focus:ring-0"
                    />
                  </div>
                  <div>
                    <label htmlFor="contato-message" className="text-sm font-bold text-[#0F111A] mb-1.5 block">
                      Mensagem
                    </label>
                    <textarea
                      id="contato-message"
                      placeholder="Descreva sua dúvida ou solicitação..."
                      rows={5}
                      required
                      value={form.message}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, message: e.target.value }))
                      }
                      className="block w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#2563eb] focus:ring-0 resize-y"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white rounded-xl h-12 font-bold transition-all disabled:opacity-70"
                  >
                    {sending ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Mensagem
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right — Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
            role="complementary"
            aria-label="Informações de contato"
          >
            {/* Contact Info */}
            <address className="not-italic space-y-6">
              {/* Email */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06]">
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-[#2563eb] mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-[#0F111A] mb-1 text-base">Email</h3>
                  <a
                    href="mailto:help@tradexafretes.com.br"
                    className="text-[#2563eb] hover:underline text-sm"
                  >
                    help@tradexafretes.com.br
                  </a>
                  <p className="text-xs text-[#5E6278] mt-1">
                    Resposta em até 24h úteis
                  </p>
                </div>
              </div>
            </div>

            {/* Horário */}
            <div className="bg-white rounded-2xl p-6 border border-black/[0.06]">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-[#2563eb] mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-[#0F111A] mb-1 text-base">Horário</h3>
                  <p className="text-sm text-[#5E6278]">
                    Segunda a Sexta, 9h às 18h (horário de Brasília)
                  </p>
                </div>
              </div>
            </div>
          </address>

            {/* FAQ — separate from address for semantic correctness */}
            <div className="bg-white rounded-2xl p-6 border border-black/[0.06]">
              <div className="flex gap-3">
                <MessageSquare className="w-5 h-5 text-[#2563eb] mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-[#0F111A] mb-1 text-base">FAQ</h3>
                  <ul className="text-sm text-[#5E6278] space-y-2">
                    <li>
                      •{" "}
                      <Link
                        to="/como-funciona"
                        className="text-[#2563eb] hover:underline"
                      >
                        Como funciona a TradeXa Fretes?
                      </Link>
                    </li>
                    <li>
                      •{" "}
                      <Link
                        to="/planos"
                        className="text-[#2563eb] hover:underline"
                      >
                        Qual plano escolher?
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
