import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Database, Eye, UserCheck, Mail } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

const sections = [
  {
    icon: Shield,
    title: "1. Coleta de Informações",
    content:
      "Coletamos informações que você fornece diretamente, como nome, e-mail, CPF/CNPJ e dados operacionais necessários para suas cotações e fretes. Também coletamos automaticamente dados de uso da plataforma para melhorar sua experiência.",
  },
  {
    icon: Lock,
    title: "2. Uso das Informações",
    content:
      "Suas informações são usadas para processar cotações de frete, gerenciar envios, comunicar atualizações, melhorar nossos serviços e cumprir obrigações legais. Não vendemos seus dados para terceiros.",
  },
  {
    icon: Database,
    title: "3. Compartilhamento",
    content:
      "Compartilhamos dados apenas com parceiros operacionais necessários para executar seus fretes e com prestadores de serviços que nos auxiliam na operação da plataforma, todos sob acordos de confidencialidade.",
  },
  {
    icon: Eye,
    title: "4. Transparência",
    content:
      "Você tem direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento. Entre em contato com privacidade@tradexafretes.com.br para exercer seus direitos.",
  },
  {
    icon: UserCheck,
    title: "5. Segurança",
    content:
      "Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição, incluindo criptografia SSL/TLS.",
  },
  {
    icon: Mail,
    title: "6. Cookies",
    content:
      "Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos para entender como você usa nossos serviços. Você pode gerenciar suas preferências nas configurações do navegador.",
  },
  {
    icon: Shield,
    title: "7. Retenção de Dados",
    content:
      "Mantemos seus dados apenas pelo tempo necessário para cumprir as finalidades descritas ou conforme exigido por lei. Após esse período, os dados são excluídos ou anonimizados.",
  },
  {
    icon: Lock,
    title: "8. LGPD",
    content:
      "Estamos em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018). Nosso Encarregado de Dados (DPO) pode ser contatado em dpo@tradexafretes.com.br.",
  },
];

const rights = [
  "Confirmar a existência de tratamento de dados",
  "Acessar seus dados pessoais",
  "Corrigir dados incompletos, inexatos ou desatualizados",
  "Solicitar anonimização, bloqueio ou eliminação de dados",
  "Portabilidade dos dados a outro fornecedor de serviço",
  "Eliminação dos dados tratados com consentimento",
  "Revogar o consentimento a qualquer momento",
];

export function Privacidade() {
  const seo = useSeo({
    title: "Política de Privacidade e LGPD — TradeXa Fretes",
    description:
      "Política de privacidade da TradeXa Fretes em conformidade com a LGPD. Saiba como protegemos seus dados pessoais, seus direitos como titular e como exercê-los.",
    keywords:
      "privacidade, LGPD, proteção de dados, política de privacidade, TradeXa, dados pessoais",
    canonical: "https://www.tradexafretes.com.br/privacidade",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: "Política de Privacidade — TradeXa Fretes",
          description:
            "Política de privacidade da TradeXa Fretes. Saiba como protegemos seus dados pessoais em conformidade com a LGPD.",
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
            { "@type": "ListItem", position: 2, name: "Política de Privacidade", item: "https://www.tradexafretes.com.br/privacidade" },
          ],
        },
      ],
    },
  });

  return (
    <div className="min-h-screen bg-white">
      {seo}
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <span className="inline-block bg-blue-100 text-blue-700 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              Privacidade de Dados
            </span>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-slate-900">
              Política de Privacidade
            </h1>
            <p className="text-xl text-slate-600 font-medium">
              Última atualização: Junho de 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Main Sections */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-black text-slate-900 mb-4">
                Como Protegemos Seus Dados
              </h2>
              <p className="text-slate-600 font-medium">
                Transparência e segurança são nossos princípios fundamentais
              </p>
            </motion.div>

            <div className="space-y-6">
              {sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="bg-white rounded-2xl p-8 border border-black/[0.06] hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <section.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 mb-4">
                          {section.title}
                        </h3>
                        <p className="text-slate-600 font-medium leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Your Rights (LGPD) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <UserCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">
                      Seus Direitos (LGPD)
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Conforme a Lei 13.709/2018
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {rights.map((right, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-200">
                        {right}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
                  <p className="text-sm font-medium text-slate-300 mb-2">
                    Para exercer seus direitos, entre em contato:
                  </p>
                  <p className="text-lg font-black text-white">
                    privacidade@tradexafretes.com.br
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              Dúvidas sobre Privacidade?
            </h2>
            <p className="text-slate-600 font-medium mb-8">
              Nosso time de proteção de dados está disponível para ajudar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/termos"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-bold transition-colors"
              >
                Ver Termos de Uso
              </Link>
              <Link
                to="/cadastro"
                className="inline-flex items-center justify-center border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl h-12 px-8 font-bold transition-colors"
              >
                Criar Conta
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
