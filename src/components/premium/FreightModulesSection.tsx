import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, BarChart3, TrendingUp, Map, Truck, Ship, 
  Shield, FileText, Calculator, BellRing, Users,
} from "lucide-react";
import { FreightExpandableCard } from "./FreightExpandableCard";

interface ExpandedModule {
  icon: React.ElementType;
  title: string;
  shortDesc: string;
  longDesc: string;
  features: { name: string; desc: string }[];
  color: string;
  actionRoute: string;
  landingRoute: string;
  actionLabel?: string;
  moreInfoLabel?: string;
  badge?: string;
}

interface Category {
  id: string;
  icon: React.ElementType;
  titulo: string;
  descricao: string;
  ctaTexto: string;
  ctaRota: string;
  modulos: ExpandedModule[];
}

const BLUE = "#2563eb";
const GREEN = "#10b981";
const AMBER = "#f59e0b";
const PURPLE = "#8b5cf6";

const CATEGORIES: Category[] = [
  {
    id: "cotacao",
    icon: Search,
    titulo: "Cotação e Contratação",
    descricao: "Publique cargas e receba propostas em minutos",
    ctaTexto: "Cotar frete agora",
    ctaRota: "/cadastro",
    modulos: [
      {
        icon: BarChart3, title: "Cotação Inteligente",
        shortDesc: "Publique sua carga e receba propostas em minutos",
        longDesc: "Preencha origem, destino, peso e volume. Nossa plataforma notifica transportadoras compatíveis. Compare preços, prazos e condições lado a lado. Escolha a melhor proposta e contrate com um clique.",
        features: [
          { name: "Multi-transportadoras", desc: "Propostas simultâneas" },
          { name: "Comparação", desc: "Preço, prazo e condições lado a lado" },
          { name: "Contratação", desc: "Contrate com um clique" },
        ],
        color: BLUE,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
      },
      {
        icon: TrendingUp, title: "Tabelas de Frete",
        shortDesc: "Defina preços fixos por rota para seus clientes",
        longDesc: "Transportadoras podem criar tabelas de frete com preços fixos por origem, destino e tipo de carga. Embarcadores veem o preço na hora sem precisar esperar cotação personalizada.",
        features: [
          { name: "Preços fixos", desc: "Defina valores por rota" },
          { name: "Múltiplas rotas", desc: "Cadastre quantas rotas quiser" },
          { name: "Atualização fácil", desc: "Ajuste preços em tempo real" },
        ],
        color: GREEN,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
      },
      {
        icon: Calculator, title: "Simulador de Frete",
        shortDesc: "Calcule o valor do frete antes de publicar",
        longDesc: "Simule o valor do frete com base em origem, destino, peso, volume e tipo de carga. Veja estimativas de preço por km, por tonelada e por eixo. Planeje seu orçamento com antecedência.",
        features: [
          { name: "Estimativa rápida", desc: "Valor aproximado em segundos" },
          { name: "Por km ou tonelada", desc: "Múltiplas métricas de cálculo" },
          { name: "Comparativo", desc: "Veja variação entre modalidades" },
        ],
        color: AMBER,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
      },
    ],
  },
  {
    id: "rastreamento",
    icon: Ship,
    titulo: "Rastreamento e Monitoramento",
    descricao: "Acompanhe sua carga em tempo real, do início ao fim",
    ctaTexto: "Rastrear Carga",
    ctaRota: "/cadastro",
    modulos: [
      {
        icon: Map, title: "Rastreamento GPS ao Vivo",
        shortDesc: "Acompanhe sua carga em tempo real com GPS",
        longDesc: "Rastreamento veicular com GPS ao vivo. Veja a localização exata da sua carga no mapa, com atualização em tempo real. Histórico de rota percorrida e pontos de parada.",
        features: [
          { name: "GPS ao vivo", desc: "Localização em tempo real" },
          { name: "Histórico de rota", desc: "Trajeto completo percorrido" },
          { name: "Pontos de parada", desc: "Todas as paradas registradas" },
        ],
        color: BLUE,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
        badge: "Premium",
      },
      {
        icon: BellRing, title: "Alertas Inteligentes",
        shortDesc: "Notificações de desvios, atrasos e eventos",
        longDesc: "Configure alertas personalizados: desvio de rota, atraso na entrega, chegada ao destino, abertura de comporta. Receba notificações por email e WhatsApp.",
        features: [
          { name: "Múltiplos alertas", desc: "Desvio, atraso, chegada" },
          { name: "Notificações", desc: "Email e WhatsApp" },
          { name: "Personalizável", desc: "Configure seus alertas" },
        ],
        color: AMBER,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
      },
      {
        icon: TrendingUp, title: "ETA Inteligente",
        shortDesc: "Previsão de chegada com machine learning",
        longDesc: "Previsão de horário de chegada baseada em machine learning. Considera condições de tráfego, clima, feriados e histórico do motorista. Precisão de até 95%.",
        features: [
          { name: "ML integrado", desc: "Previsão por machine learning" },
          { name: "Alta precisão", desc: "Até 95% de acerto" },
          { name: "Atualização dinâmica", desc: "ETA recalcula em tempo real" },
        ],
        color: PURPLE,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
        badge: "Novo",
      },
    ],
  },
  {
    id: "gestao",
    icon: Truck,
    titulo: "Gestão de Frotas e Motoristas",
    descricao: "Gerencie veículos, motoristas e documentação",
    ctaTexto: "Gerenciar Frota",
    ctaRota: "/cadastro",
    modulos: [
      {
        icon: Truck, title: "Cadastro de Veículos",
        shortDesc: "Gerencie sua frota com validação Mercosul",
        longDesc: "Cadastre veículos com validação automática de placa no padrão Mercosul. Controle documento (CRLV), seguro, vencimentos e manutenção. Alertas de documentos vencendo.",
        features: [
          { name: "Placa Mercosul", desc: "Validação automática" },
          { name: "Documentação", desc: "CRLV, seguro, vencimentos" },
          { name: "Alertas", desc: "Notificação de vencimentos" },
        ],
        color: GREEN,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
      },
      {
        icon: Users, title: "Cadastro de Motoristas",
        shortDesc: "Motoristas com CNH digital e documentação",
        longDesc: "Cadastre motoristas com validação de CNH, RG e CPF. Formatação automática de documentos. Controle de vencimento da CNH, exames e cursos obrigatórios.",
        features: [
          { name: "CNH digital", desc: "Validação e formatação" },
          { name: "Documentação", desc: "RG, CPF, exames" },
          { name: "Vencimentos", desc: "Alertas de renovação" },
        ],
        color: BLUE,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
      },
      {
        icon: Shield, title: "Score de Reputação",
        shortDesc: "Avaliação transparente de transportadoras",
        longDesc: "Score de reputação para transportadoras baseado em entregas realizadas, avaliações de embarcadores, pontualidade e documentação em dia. Transparência total.",
        features: [
          { name: "Avaliações", desc: "Feedback de embarcadores" },
          { name: "Pontualidade", desc: "Histórico de entregas" },
          { name: "Documentação", desc: "Regularidade documental" },
        ],
        color: AMBER,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
        badge: "Novo",
      },
    ],
  },
  {
    id: "documentacao",
    icon: FileText,
    titulo: "Documentação e Pagamentos",
    descricao: "Tudo digital: documentos fiscais e pagamento seguro",
    ctaTexto: "Ver Documentação",
    ctaRota: "/como-funciona",
    modulos: [
      {
        icon: FileText, title: "CT-e e MDF-e Digital",
        shortDesc: "Documentos fiscais eletrônicos automatizados",
        longDesc: "Geração automática de CT-e (Conhecimento de Transporte Eletrônico) e MDF-e (Manifesto Eletrônico de Documentos Fiscais). OCR com IA para extrair dados automaticamente.",
        features: [
          { name: "CT-e automático", desc: "Geração com dados da carga" },
          { name: "MDF-e", desc: "Manifesto eletrônico integrado" },
          { name: "OCR com IA", desc: "Extração automática de dados" },
        ],
        color: BLUE,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
      },
      {
        icon: Shield, title: "Pagamento Seguro",
        shortDesc: "Pagamento online com split automático",
        longDesc: "Pagamento processado via Stripe Connect com split automático entre embarcador e transportadora. Aceitamos PIX, cartão de crédito e boleto bancário. Segurança e transparência.",
        features: [
          { name: "Split automático", desc: "Pagamento dividido na hora" },
          { name: "Múltiplos métodos", desc: "PIX, cartão e boleto" },
          { name: "Stripe Connect", desc: "Plataforma segura e confiável" },
        ],
        color: GREEN,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
      },
      {
        icon: Calculator, title: "CIOT Digital",
        shortDesc: "Código Identificador da Operação de Transporte",
        longDesc: "Geração automática de CIOT para cada operação. Controle de pagamento de frete, vale pedágio e outros encargos. Tudo registrado e auditável.",
        features: [
          { name: "CIOT automático", desc: "Gerado para cada operação" },
          { name: "Controle financeiro", desc: "Frete, pedágio e encargos" },
          { name: "Auditável", desc: "Registro completo das operações" },
        ],
        color: PURPLE,
        actionRoute: "/cadastro",
        landingRoute: "/como-funciona",
      },
    ],
  },
];

export function FreightModulesSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563eb]/[0.08] border border-[#2563eb]/[0.15] text-[#2563eb] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            Módulos da Plataforma
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08]">
            Tudo que você precisa{" "}
            <span className="text-[#2563eb]">
              para gerenciar fretes
            </span>
          </h2>
          <p className="text-base md:text-lg text-[#5E6278] max-w-3xl mx-auto leading-relaxed mt-4">
            Clique em cada card para expandir e ver detalhes, funcionalidades e ações disponíveis.
          </p>
        </motion.div>

        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="mb-16 last:mb-0">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-lg bg-[#2563eb]/10 flex items-center justify-center">
                <cat.icon className="w-4.5 h-4.5 text-[#2563eb]" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#0F111A]">{cat.titulo}</h3>
                <p className="text-xs text-[#5E6278] font-medium">{cat.descricao}</p>
              </div>
              <Link
                to={cat.ctaRota}
                className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:gap-2 transition-all"
              >
                {cat.ctaTexto}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.modulos.map((mod) => (
                <FreightExpandableCard key={mod.title} {...mod} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
