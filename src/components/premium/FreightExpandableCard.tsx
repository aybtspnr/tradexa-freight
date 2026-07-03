import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, ArrowUpRight } from "lucide-react";

interface Feature {
  name: string;
  desc: string;
}

interface FreightExpandableCardProps {
  icon: React.ElementType;
  title: string;
  shortDesc: string;
  longDesc: string;
  features: Feature[];
  color: string;
  actionRoute: string;
  landingRoute: string;
  actionLabel?: string;
  moreInfoLabel?: string;
  badge?: string;
}

export function FreightExpandableCard({
  icon: Icon,
  title,
  shortDesc,
  longDesc,
  features,
  color,
  actionRoute,
  landingRoute,
  actionLabel = "Acessar",
  moreInfoLabel,
  badge,
}: FreightExpandableCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cardId = title.replace(/\s+/g, "-").toLowerCase();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_12px_-6px_rgba(15,17,26,0.08)] hover:shadow-[0_8px_32px_-8px_rgba(37,99,235,0.12)] hover:border-[#2563eb]/20 transition-all duration-300"
    >
      {/* Header clicável */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 md:p-5"
        aria-expanded={expanded}
        aria-controls={`card-panel-${cardId}`}
        id={`card-btn-${cardId}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: color + "15" }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F111A] flex items-center gap-1.5">
                {title}
                {badge && <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{badge}</span>}
              </h3>
              <p className="text-[11px] text-[#5E6278]/60 font-medium mt-0.5">Clique para expandir</p>
            </div>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-5 h-5 text-[#5E6278]/40 mt-1.5" />
          </motion.div>
        </div>
        <p className="text-[13px] text-[#5E6278] leading-relaxed line-clamp-2">{shortDesc}</p>
      </button>

      {/* Expandido */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
            role="region"
            aria-labelledby={`card-btn-${cardId}`}
            id={`card-panel-${cardId}`}
          >
            <div className="px-5 pb-5 border-t border-black/[0.05]">
              <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                {features.map((f) => (
                  <span key={f.name} className="text-[10px] font-semibold text-[#5E6278] bg-[#F1F1F1] rounded-full px-2.5 py-1">
                    {f.name}
                  </span>
                ))}
              </div>

              <p className="text-xs text-[#5E6278] leading-relaxed mb-4">{longDesc}</p>

              <div className="flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                <Link
                  to={actionRoute}
                  className="flex-1 rounded-xl h-10 font-bold gap-2 text-sm text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                  style={{ background: color }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {actionLabel}
                </Link>
                <Link to={landingRoute} className="flex-1 rounded-xl h-10 font-bold gap-2 text-sm border border-black/[0.08] text-[#0F111A] hover:bg-black/[0.02] hover:border-[#2563eb]/20 transition-all flex items-center justify-center">
                  {moreInfoLabel || `Ver ${title.length > 18 ? title.slice(0, 15) + "…" : title}`}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
