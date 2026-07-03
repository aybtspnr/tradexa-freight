import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, Search, Ship, FileText,
  ArrowRight, Sparkles, Truck,
} from "lucide-react";

interface BentoBlockData {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgClass: string;
  spanClass: string;
  cta?: { label: string; route: string };
  highlights?: { label: string; value: string }[];
}

function BentoBlock({ block, index }: { block: BentoBlockData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl border p-5 md:p-6 lg:p-7 overflow-hidden transition-all duration-300 hover:shadow-lg group ${block.bgClass} ${block.spanClass}`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top right, ${block.color}10 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 h-full flex flex-col">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mb-4"
          style={{ background: block.color + "15" }}
        >
          <block.icon className="w-5 h-5" style={{ color: block.color }} />
        </div>

        <h3 className="text-base md:text-lg font-extrabold text-[#0F111A] mb-2 leading-tight">
          {block.title}
        </h3>

        <p className="text-sm text-[#5E6278] leading-relaxed mb-4 flex-1">
          {block.description}
        </p>

        {block.highlights && block.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {block.highlights.map((h) => (
              <div
                key={h.label}
                className="flex items-baseline gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: block.color + "10", color: block.color }}
              >
                <span className="text-base leading-none">{h.value}</span>
                <span className="opacity-70 font-medium">{h.label}</span>
              </div>
            ))}
          </div>
        )}

        {block.cta && (
          <div className="mt-auto">
            <Link
              to={block.cta.route}
              className="inline-flex items-center gap-1.5 text-sm font-bold hover:gap-2 transition-all"
              style={{ color: block.color }}
            >
              {block.cta.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const BLOCKS: BentoBlockData[] = [
  {
    id: "plataforma",
    icon: Globe,
    title: "Plataforma de Fretes para Embarcadores e Transportadoras",
    description:
      "A TradeXa Fretes conecta quem precisa transportar cargas com quem transporta. Cotações em minutos, rastreamento ao vivo e pagamento seguro — tudo em um só lugar.",
    color: "#2563eb",
    bgClass: "bg-white border-[#2563eb]/[0.10]",
    spanClass: "md:col-span-2 md:row-span-1",
    highlights: [
      { label: "Transportadoras", value: "500+" },
      { label: "Cidades Atendidas", value: "1.200+" },
      { label: "Cargas Rastreadas", value: "10K+" },
      { label: "Economia Média", value: "25%" },
    ],
  },
  {
    id: "cotacao",
    icon: Search,
    title: "Cotação em Segundos",
    description:
      "Publique sua carga com origem, destino, peso e volume. Receba propostas de transportadoras verificadas em minutos. Compare preços e escolha a melhor.",
    color: "#10b981",
    bgClass: "bg-[#10b981]/[0.04] border-[#10b981]/[0.10]",
    spanClass: "md:col-span-1",
    cta: { label: "Cotar frete agora", route: "/cadastro" },
  },
  {
    id: "gratis",
    icon: Sparkles,
    title: "Essencial Grátis",
    description:
      "Plano Essential gratuito com 3 cotações por mês e rastreamento básico. Sem cartão de crédito. Use a plataforma à vontade.",
    color: "#f59e0b",
    bgClass: "bg-[#f59e0b]/[0.04] border-[#f59e0b]/[0.10]",
    spanClass: "md:col-span-1",
    cta: { label: "Criar Conta Grátis", route: "/cadastro" },
  },
  {
    id: "rastreamento",
    icon: Ship,
    title: "Rastreamento ao vivo",
    description:
      "Acompanhe sua carga em tempo real com GPS. Alertas de desvio de rota e ETA inteligente. Notificações automáticas para você e seu cliente.",
    color: "#0ea5e9",
    bgClass: "bg-[#0ea5e9]/[0.04] border-[#0ea5e9]/[0.10]",
    spanClass: "md:col-span-2",
    cta: { label: "Como funciona o rastreamento", route: "/como-funciona" },
  },
  {
    id: "gestao",
    icon: Truck,
    title: "Gestão de frotas e motoristas",
    description:
      "Cadastre veículos com placa Mercosul e motoristas com CNH digital. Controle de documentação, vencimentos e disponibilidade.",
    color: "#8b5cf6",
    bgClass: "bg-[#8b5cf6]/[0.04] border-[#8b5cf6]/[0.10]",
    spanClass: "md:col-span-1",
    cta: { label: "Ver recursos", route: "/cadastro" },
  },
  {
    id: "documentos",
    icon: FileText,
    title: "Documentação digital",
    description:
      "CT-e, MDF-e e CIOT tudo digital. OCR com IA para extração automática de dados. Alertas de vencimento de documentos.",
    color: "#ef4444",
    bgClass: "bg-[#ef4444]/[0.04] border-[#ef4444]/[0.10]",
    spanClass: "md:col-span-1",
    cta: { label: "Ver serviços", route: "/como-funciona" },
  },
];

export function FreightBentoGrid() {
  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2563eb]/15 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563eb]/[0.08] border border-[#2563eb]/[0.15] text-[#2563eb] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            O que é a TradeXa Fretes
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-5">
            Sua carga.{" "}
            <span className="text-[#2563eb]">
              Nossa plataforma.
            </span>
          </h2>
          <p className="text-base md:text-lg text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
            Da cotação ao pagamento — tudo integrado, seguro e em tempo real.{" "}
            <span className="font-semibold text-[#0F111A]">
              Sem burocracia, sem planilhas.
            </span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-auto">
          {BLOCKS.map((block, i) => (
            <BentoBlock key={block.id} block={block} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
