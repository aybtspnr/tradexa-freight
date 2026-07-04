import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency, formatDate, formatWeight, formatVolume } from "@/utils/format";
import {
  FileText,
  Plus,
  TrendingDown,
  Truck,
  MapPin,
  ArrowRight,
  Calendar,
  Package,
  Scale,
  Box,
  X,
  Trophy,
  CheckCircle,
  Search,
  AlertTriangle,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────── */

type FiltroStatus = "todas" | "aberta" | "com_ofertas" | "fechada";

interface Cotacao {
  id: string;
  shipper_id: string;
  tipo_carga: string;
  descricao: string;
  peso_kg: number;
  volume_m3: number;
  origem_cidade: string;
  origem_estado: string;
  destino_cidade: string;
  destino_estado: string;
  data_coleta: string;
  data_entrega: string;
  status: "aberta" | "com_ofertas" | "fechada";
  dbStatus: string;
  ofertas_recebidas: number;
  carrier_nome: string | null;
  created_at: string;
  ncm_classification_id: string | null;
  risk_level: string | null;
}

interface Bid {
  id: string;
  cotacao_id: string;
  carrier_id: string;
  carrier_nome: string;
  preco: number;
  prazo_dias: number;
  observacoes: string;
  status: "aceita" | "recusada" | "pendente";
  dbStatus: string;
  created_at: string;
}

/* ─── Helpers ────────────────────────────────────────────── */

const TIPO_CARGA_LABEL: Record<string, string> = {
  caixa: "Caixa",
  pallet: "Pallet",
  container: "Container",
  granel: "Granel",
};

const TIPO_CARGA_ICON: Record<string, string> = {
  caixa: "📦",
  pallet: "🏗️",
  container: "🚢",
  granel: "🌾",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  open: { label: "Aberta", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  bidding: {
    label: "Com Ofertas",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  closed: {
    label: "Fechada",
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  cancelled: {
    label: "Cancelada",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
};

function mapQuotationToCotacao(q: any, bidsCount?: number, carrierNome?: string | null): Cotacao {
  const dbStatus = q.status ?? "open";
  const statusMap: Record<string, "aberta" | "com_ofertas" | "fechada"> = {
    open: "aberta",
    bidding: "com_ofertas",
    closed: "fechada",
    cancelled: "fechada",
  };

  return {
    id: q.id,
    shipper_id: q.shipper_id,
    tipo_carga: q.cargo_type ?? "",
    descricao: q.cargo_description ?? "",
    peso_kg: Number(q.weight_kg) || 0,
    volume_m3: Number(q.volume_m3) || 0,
    origem_cidade: q.origin_city ?? "",
    origem_estado: q.origin_state ?? "",
    destino_cidade: q.destination_city ?? "",
    destino_estado: q.destination_state ?? "",
    data_coleta: q.pickup_date ?? "",
    data_entrega: q.delivery_date ?? "",
    status: statusMap[dbStatus] ?? "aberta",
    dbStatus,
    ofertas_recebidas: bidsCount ?? 0,
    carrier_nome: carrierNome ?? null,
    created_at: q.created_at ?? "",
    ncm_classification_id: q.ncm_classification_id ?? null,
    risk_level: q.risk_level ?? null,
  };
}

/* ─── Skeleton Card ───────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-100" />
        </div>
        <div className="h-6 w-24 rounded-full bg-gray-200" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-12 rounded-lg bg-gray-100" />
        <div className="h-12 rounded-lg bg-gray-100" />
      </div>
      <div className="mt-4 h-4 w-1/3 rounded bg-gray-200" />
    </div>
  );
}

/* ─── Empty State ─────────────────────────────────────────── */

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-16 shadow-sm">
      {hasFilter ? (
        <>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <Search className="h-7 w-7 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Nenhuma cotação encontrada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Tente alterar o filtro para ver outras cotações.
          </p>
        </>
      ) : (
        <>
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <FileText className="h-10 w-10 text-[#2563eb]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Você ainda não criou nenhuma cotação
          </h3>
          <p className="mt-1 max-w-sm text-center text-sm text-gray-500">
            Crie sua primeira cotação de frete e receba ofertas das melhores
            transportadoras.
          </p>
          <Link
            to="/shipper/cotar"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1d4ed8] hover:shadow-md no-underline"
          >
            <Plus className="h-4 w-4" />
            Criar Primeira Cotação
          </Link>
        </>
      )}
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────── */

function StatusBadge({ dbStatus }: { dbStatus: string }) {
  const cfg = STATUS_CONFIG[dbStatus] ?? STATUS_CONFIG.open;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─── Quote Card ──────────────────────────────────────────── */

function QuoteCard({
  cotacao,
  onVerOfertas,
}: {
  cotacao: Cotacao;
  onVerOfertas: (c: Cotacao) => void;
}) {
  const isFechada = cotacao.status === "fechada";
  const hasOfertas = cotacao.status === "com_ofertas";
  const tipoLabel = (TIPO_CARGA_LABEL[cotacao.tipo_carga] ?? cotacao.tipo_carga) || "Carga";
  const tipoEmoji = TIPO_CARGA_ICON[cotacao.tipo_carga] ?? "📦";

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        hasOfertas ? "ring-1 ring-amber-200" : ""
      }`}
    >
      {/* Header: Route + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MapPin className="h-4 w-4 flex-shrink-0 text-[#2563eb]" />
            <span className="truncate">{cotacao.origem_cidade}/{cotacao.origem_estado}</span>
            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <MapPin className="h-4 w-4 flex-shrink-0 text-red-500" />
            <span className="truncate">{cotacao.destino_cidade}/{cotacao.destino_estado}</span>
          </div>
        </div>
        <StatusBadge dbStatus={cotacao.dbStatus} />
      </div>

      {/* Cargo details */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
          <span className="text-base">{tipoEmoji}</span>
          <div>
            <p className="text-xs text-gray-500">Tipo de Carga</p>
            <p className="font-medium text-gray-900">{tipoLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
          <Scale className="h-4 w-4 text-[#5E6278]" />
          <div>
            <p className="text-xs text-gray-500">Peso / Volume</p>
            <p className="font-medium text-gray-900">
              {formatWeight(cotacao.peso_kg)} / {formatVolume(cotacao.volume_m3)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Date + Offers + Action */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 text-xs text-[#5E6278]">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(cotacao.created_at)}
        </div>

        {/* Offers badge / accepted carrier */}
        {hasOfertas ? (
          <button
            onClick={() => onVerOfertas(cotacao)}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
          >
            <TrendingDown className="h-3.5 w-3.5" />
            {cotacao.ofertas_recebidas}{" "}
            {cotacao.ofertas_recebidas === 1 ? "oferta" : "ofertas"}
          </button>
        ) : isFechada ? (
          <div className="flex items-center gap-1.5 text-xs text-[#5E6278]">
            <Truck className="h-3.5 w-3.5 text-green-600" />
            <span className="font-medium text-gray-700">
              {cotacao.carrier_nome || "Transportadora"}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onVerOfertas(cotacao)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-[#5E6278] transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
          >
            Ver Detalhes
          </button>
        )}
      </div>

      {/* Highlight border for bidding */}
      {hasOfertas && (
        <div className="absolute left-0 top-0 h-full w-1 bg-amber-400" />
      )}
    </div>
  );
}

/* ─── Bid Comparison Modal ───────────────────────────────── */

function OfertasModal({
  cotacao,
  bids,
  aceitando,
  onClose,
  onAceitar,
}: {
  cotacao: Cotacao;
  bids: Bid[];
  aceitando: boolean;
  onClose: () => void;
  onAceitar: (bid: Bid) => void;
}) {
  const tipoLabel = (TIPO_CARGA_LABEL[cotacao.tipo_carga] ?? cotacao.tipo_carga) || "Carga";

  // Find lowest price among pending bids
  const pendingBids = bids.filter((b) => b.status === "pendente");
  const lowestPrice = pendingBids.length
    ? Math.min(...pendingBids.map((b) => b.preco))
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5 rounded-t-2xl">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#0F111A]">
              Ofertas Recebidas
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#5E6278]">
              <MapPin className="h-4 w-4 flex-shrink-0 text-[#2563eb]" />
              <span>{cotacao.origem_cidade}/{cotacao.origem_estado}</span>
              <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" />
              <MapPin className="h-4 w-4 flex-shrink-0 text-red-500" />
              <span>{cotacao.destino_cidade}/{cotacao.destino_estado}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cargo Info */}
        <div className="px-6 pt-4">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-[#5E6278]">
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
              <Package className="h-4 w-4 text-[#2563eb]" />
              {tipoLabel}
            </span>
            <span className="text-gray-300">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Scale className="h-4 w-4" />
              {formatWeight(cotacao.peso_kg)}
            </span>
            <span className="text-gray-300">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Box className="h-4 w-4" />
              {formatVolume(cotacao.volume_m3)}
            </span>
            {cotacao.data_coleta && (
              <>
                <span className="text-gray-300">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Coleta: {formatDate(cotacao.data_coleta)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* No bids */}
        {bids.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <Search className="h-7 w-7 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-900">Nenhuma oferta recebida</p>
            <p className="mt-1 text-sm text-[#5E6278]">
              As transportadoras ainda não enviaram propostas para esta cotação.
            </p>
          </div>
        )}

        {/* Bid Comparison Grid */}
        {bids.length > 0 && (
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bids
                .sort((a, b) => a.preco - b.preco)
                .map((bid) => {
                  const isLowest = bid.status === "pendente" && bid.preco === lowestPrice;
                  const isAccepted = bid.status === "aceita";
                  const isRejected = bid.status === "recusada";

                  return (
                    <div
                      key={bid.id}
                      className={`relative flex flex-col rounded-2xl border-2 p-5 transition-all ${
                        isAccepted
                          ? "border-green-300 bg-green-50 shadow-sm"
                          : isRejected
                            ? "border-gray-200 bg-gray-50/50 opacity-60"
                            : isLowest
                              ? "border-[#2563eb] bg-blue-50/50 shadow-md"
                              : "border-gray-200 bg-white hover:shadow-md"
                      }`}
                    >
                      {/* Badge */}
                      {isLowest && (
                        <span className="absolute -top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#2563eb] px-3 py-1 text-xs font-bold text-white shadow-md">
                          <Trophy className="h-3.5 w-3.5" />
                          Menor Preço
                        </span>
                      )}
                      {isAccepted && (
                        <span className="absolute -top-3 right-3 inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Aceita
                        </span>
                      )}
                      {isRejected && (
                        <span className="absolute -top-3 right-3 inline-flex items-center gap-1 rounded-full bg-gray-400 px-3 py-1 text-xs font-semibold text-white shadow-md">
                          Recusada
                        </span>
                      )}

                      {/* Carrier name */}
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                          {bid.carrier_nome?.charAt(0).toUpperCase() || "T"}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {bid.carrier_nome}
                          </h3>
                          <p className="text-xs text-[#5E6278]">
                            {formatDate(bid.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mt-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-[#5E6278]">
                          Valor do Frete
                        </p>
                        <p
                          className={`mt-0.5 text-2xl font-extrabold ${
                            isLowest ? "text-[#2563eb]" : "text-green-700"
                          }`}
                        >
                          {formatCurrency(bid.preco)}
                        </p>
                      </div>

                      {/* Delivery estimate */}
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-[#5E6278]">
                        <Truck className="h-4 w-4" />
                        <span>
                          Prazo: <strong>{bid.prazo_dias}</strong> dias úteis
                        </span>
                      </div>

                      {/* Notes */}
                      {bid.observacoes && (
                        <div className="mt-3 rounded-lg bg-white/60 p-2.5 text-xs text-[#5E6278]">
                          <p className="font-medium text-gray-700">Observações:</p>
                          <p className="mt-0.5 line-clamp-3">{bid.observacoes}</p>
                        </div>
                      )}

                      {/* Action button */}
                      <div className="mt-auto pt-4">
                        {bid.status === "pendente" && (
                          <button
                            onClick={() => onAceitar(bid)}
                            disabled={aceitando}
                            className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {aceitando ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Aceitando...
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5">
                                <CheckCircle className="h-4 w-4" />
                                Aceitar Proposta
                              </span>
                            )}
                          </button>
                        )}
                        {bid.status === "recusada" && (
                          <span className="block rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-center text-xs font-medium text-gray-400">
                            Proposta Recusada
                          </span>
                        )}
                        {bid.status === "aceita" && (
                          <span className="block rounded-xl bg-green-100 py-2.5 text-center text-xs font-semibold text-green-700">
                            Proposta Aceita ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export function Cotacoes() {
  const profile = useAuthStore((s) => s.profile);

  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [filtro, setFiltro] = useState<FiltroStatus>("todas");
  const [ofertasModal, setOfertasModal] = useState<{
    cotacao: Cotacao;
    bids: Bid[];
  } | null>(null);
  const [aceitando, setAceitando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataFetched = useRef(false);

  /* ─── Load quotations ──────────────────────────── */

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    if (dataFetched.current) return;
    dataFetched.current = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from("quotations")
          .select("*")
          .eq("shipper_id", profile.id)
          .order("created_at", { ascending: false });

        if (err) {
          setError(err.message);
          return;
        }

        if (!data || data.length === 0) {
          setCotacoes([]);
          return;
        }

        const mapped = data.map((q: any) => mapQuotationToCotacao(q));
        setCotacoes(mapped);

        // Fetch bid counts for all quotations
        const { data: countsData, error: countsErr } = await supabase
          .from("quotation_bids")
          .select("quotation_id, carrier_id, status")
          .in(
            "quotation_id",
            mapped.map((c) => c.id)
          );

        if (!countsErr && countsData) {
          // Group by quotation_id
          const groups: Record<string, { count: number; acceptedCarrierId?: string }> = {};
          for (const row of countsData) {
            const qid = row.quotation_id;
            if (!groups[qid]) groups[qid] = { count: 0 };
            groups[qid].count++;
            if (row.status === "accepted") {
              groups[qid].acceptedCarrierId = row.carrier_id;
            }
          }

          // If any accepted bids, fetch carrier names
          const acceptedCarrierIds = Object.values(groups)
            .map((g) => g.acceptedCarrierId)
            .filter(Boolean) as string[];

          let carrierNames: Record<string, string> = {};
          if (acceptedCarrierIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, name")
              .in("id", acceptedCarrierIds);

            if (profiles) {
              for (const p of profiles) {
                carrierNames[p.id] = p.name || "Transportadora";
              }
            }
          }

          setCotacoes((prev) =>
            prev.map((c) => ({
              ...c,
              ofertas_recebidas: groups[c.id]?.count ?? 0,
              status:
                groups[c.id]?.count && groups[c.id]?.count > 0
                  ? (c.status === "fechada" ? "fechada" : "com_ofertas")
                  : c.status,
              dbStatus:
                groups[c.id]?.count && groups[c.id]?.count > 0 && c.dbStatus !== "closed"
                  ? "bidding"
                  : c.dbStatus,
              carrier_nome:
                groups[c.id]?.acceptedCarrierId
                  ? carrierNames[groups[c.id]!.acceptedCarrierId!] || "Transportadora"
                  : c.carrier_nome,
            }))
          );
        }
      } catch (e) {
        console.error("Failed to load quotations:", e);
        setError("Erro ao carregar cotações. Tente novamente.");
      } finally {
        setLoading(false);
      }
    })();
  }, [profile?.id]);

  /* ─── Refresh ──────────────────────────────────── */

  const refresh = useCallback(async () => {
    if (!profile?.id) return;
    dataFetched.current = true;
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("quotations")
        .select("*")
        .eq("shipper_id", profile.id)
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
        return;
      }

      if (!data || data.length === 0) {
        setCotacoes([]);
        return;
      }

      const mapped = data.map((q: any) => mapQuotationToCotacao(q));
      setCotacoes(mapped);

      // Fetch bid counts
      const { data: countsData, error: countsErr } = await supabase
        .from("quotation_bids")
        .select("quotation_id, carrier_id, status")
        .in(
          "quotation_id",
          mapped.map((c) => c.id)
        );

      if (!countsErr && countsData) {
        const groups: Record<string, { count: number; acceptedCarrierId?: string }> = {};
        for (const row of countsData) {
          const qid = row.quotation_id;
          if (!groups[qid]) groups[qid] = { count: 0 };
          groups[qid].count++;
          if (row.status === "accepted") {
            groups[qid].acceptedCarrierId = row.carrier_id;
          }
        }

        const acceptedCarrierIds = Object.values(groups)
          .map((g) => g.acceptedCarrierId)
          .filter(Boolean) as string[];

        let carrierNames: Record<string, string> = {};
        if (acceptedCarrierIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", acceptedCarrierIds);
          if (profiles) {
            for (const p of profiles) {
              carrierNames[p.id] = p.name || "Transportadora";
            }
          }
        }

        setCotacoes((prev) =>
          prev.map((c) => ({
            ...c,
            ofertas_recebidas: groups[c.id]?.count ?? 0,
            status:
              groups[c.id]?.count && groups[c.id]?.count > 0
                ? (c.status === "fechada" ? "fechada" : "com_ofertas")
                : c.status,
            dbStatus:
              groups[c.id]?.count && groups[c.id]?.count > 0 && c.dbStatus !== "closed"
                ? "bidding"
                : c.dbStatus,
            carrier_nome:
              groups[c.id]?.acceptedCarrierId
                ? carrierNames[groups[c.id]!.acceptedCarrierId!] || "Transportadora"
                : c.carrier_nome,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load quotations:", e);
      setError("Erro ao carregar cotações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  /* ─── Filter ───────────────────────────────────── */

  const filtered = useMemo(() => {
    if (filtro === "todas") return cotacoes;
    return cotacoes.filter((c) => c.status === filtro);
  }, [cotacoes, filtro]);

  const contagens = useMemo(() => {
    const t = cotacoes.length;
    const a = cotacoes.filter((c) => c.status === "aberta").length;
    const o = cotacoes.filter((c) => c.status === "com_ofertas").length;
    const f = cotacoes.filter((c) => c.status === "fechada").length;
    return { todas: t, aberta: a, com_ofertas: o, fechada: f };
  }, [cotacoes]);

  /* ─── View offers ──────────────────────────────── */

  const handleVerOfertas = useCallback(async (cotacao: Cotacao) => {
    const { data, error: err } = await supabase
      .from("quotation_bids")
      .select("*, profiles!quotation_bids_carrier_id_fkey(name)")
      .eq("quotation_id", cotacao.id)
      .order("created_at", { ascending: false });

    if (err) {
      console.error("Failed to load bids:", err);
      return;
    }

    const bids: Bid[] = (data || []).map((b: any) => ({
      id: b.id,
      cotacao_id: b.quotation_id,
      carrier_id: b.carrier_id,
      carrier_nome: b.profiles?.name || "Transportadora",
      preco: Number(b.price) || 0,
      prazo_dias: Number(b.estimated_days) || 0,
      observacoes: b.notes || "",
      status:
        b.status === "accepted"
          ? "aceita"
          : b.status === "rejected"
            ? "recusada"
            : "pendente",
      dbStatus: b.status || "pending",
      created_at: b.created_at || "",
    }));

    setOfertasModal({ cotacao, bids });
  }, []);

  /* ─── Accept offer ─────────────────────────────── */

  const handleAceitarOferta = useCallback(
    async (bid: Bid) => {
      if (!profile?.id) return;

      const confirmed = window.confirm(
        `Aceitar oferta de ${bid.carrier_nome} no valor de ${formatCurrency(bid.preco)}? Esta ação não pode ser desfeita.`
      );
      if (!confirmed) return;

      setAceitando(true);

      const cotacao = cotacoes.find((c) => c.id === bid.cotacao_id);
      if (!cotacao) {
        setAceitando(false);
        return;
      }

      try {
        // 1. Accept the chosen bid
        const { error: acceptErr } = await supabase
          .from("quotation_bids")
          .update({ status: "accepted" })
          .eq("id", bid.id);

        if (acceptErr) throw acceptErr;

        // 2. Reject other bids for this quotation
        const { error: rejectErr } = await supabase
          .from("quotation_bids")
          .update({ status: "rejected" })
          .eq("quotation_id", bid.cotacao_id)
          .neq("id", bid.id);

        if (rejectErr) throw rejectErr;

        // 3. Close the quotation
        const { error: closeErr } = await supabase
          .from("quotations")
          .update({ status: "closed" })
          .eq("id", cotacao.id);

        if (closeErr) throw closeErr;

        // 4. Create the order
        const { error: orderErr } = await supabase.from("orders").insert({
          quotation_id: cotacao.id,
          shipper_id: profile.id,
          carrier_id: bid.carrier_id,
          bid_id: bid.id,
          price: bid.preco,
          status: "pending",
          pickup_date: cotacao.data_coleta || null,
          delivery_date: cotacao.data_entrega || null,
          notes: `Prazo: ${bid.prazo_dias} dias úteis. ${bid.observacoes}`.trim(),
        });

        if (orderErr) throw orderErr;
      } catch (e: any) {
        console.error("Failed to accept bid:", e);
        alert(`Erro ao aceitar oferta: ${e?.message || "Tente novamente."}`);
      } finally {
        setAceitando(false);
        setOfertasModal(null);
        refresh();
      }
    },
    [cotacoes, profile, refresh]
  );

  /* ─── Tab filter buttons ───────────────────────── */

  const tabs: { key: FiltroStatus; label: string; count: number; icon: React.ReactNode }[] = [
    { key: "todas", label: "Todas", count: contagens.todas, icon: <FileText className="h-4 w-4" /> },
    { key: "aberta", label: "Abertas", count: contagens.aberta, icon: <Search className="h-4 w-4" /> },
    {
      key: "com_ofertas",
      label: "Com Ofertas",
      count: contagens.com_ofertas,
      icon: <TrendingDown className="h-4 w-4" />,
    },
    {
      key: "fechada",
      label: "Fechadas",
      count: contagens.fechada,
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ];

  /* ─── Render ───────────────────────────────────── */

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F111A] sm:text-3xl">
            Minhas Cotações
          </h1>
          <p className="mt-1 text-sm text-[#5E6278]">
            Gerencie suas solicitações de frete e compare ofertas
          </p>
        </div>
        <Link
          to="/shipper/cotar"
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1d4ed8] hover:shadow-md no-underline"
        >
          <Plus className="h-4 w-4" />
          Nova Cotação
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <p className="font-medium text-red-800">Erro ao carregar dados</p>
            <p className="mt-0.5 text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="ml-auto rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFiltro(tab.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              filtro === tab.key
                ? "bg-[#2563eb] text-white shadow-md"
                : "border border-gray-200 bg-white text-[#5E6278] hover:border-[#2563eb] hover:text-[#2563eb]"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                filtro === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-[#5E6278]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading: Skeleton cards */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && cotacoes.length === 0 && !error && (
        <EmptyState hasFilter={false} />
      )}

      {/* Empty filter result */}
      {!loading && cotacoes.length > 0 && filtered.length === 0 && (
        <EmptyState hasFilter={true} />
      )}

      {/* Quote Cards Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cotacao) => (
            <QuoteCard
              key={cotacao.id}
              cotacao={cotacao}
              onVerOfertas={handleVerOfertas}
            />
          ))}
        </div>
      )}

      {/* Ofertas Modal */}
      {ofertasModal && (
        <OfertasModal
          cotacao={ofertasModal.cotacao}
          bids={ofertasModal.bids}
          aceitando={aceitando}
          onClose={() => setOfertasModal(null)}
          onAceitar={handleAceitarOferta}
        />
      )}
    </div>
  );
}

export default Cotacoes;
