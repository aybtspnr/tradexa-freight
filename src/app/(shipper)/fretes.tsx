import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency, formatDate, formatWeight, formatVolume } from "@/utils/format";

/* ─── Types ───────────────────────────────────────────────── */

/** Raw database statuses for orders */
type DBStatus = "pending" | "confirmed" | "picked_up" | "in_transit" | "delivered" | "cancelled";

/** Filter categories presented to the user */
type FiltroStatus = "todos" | "ativo" | "em_andamento" | "entregue" | "cancelado";

interface FreightOrder {
  id: string;
  carrier_nome: string;
  origem_cidade: string;
  origem_estado: string;
  destino_cidade: string;
  destino_estado: string;
  carga_descricao: string;
  peso_kg: number;
  volume_m3: number;
  valor: number;
  status: DBStatus;
  data_coleta: string;
  data_entrega: string;
  created_at: string;
}

/* ─── Constants ───────────────────────────────────────────── */

/** Ordered workflow steps displayed in the progress bar */
const WORKFLOW_STEPS: { key: DBStatus; label: string; icon: string }[] = [
  { key: "pending", label: "Pendente", icon: "📋" },
  { key: "confirmed", label: "Confirmado", icon: "✅" },
  { key: "picked_up", label: "Coletado", icon: "📦" },
  { key: "in_transit", label: "Em Trânsito", icon: "🚚" },
  { key: "delivered", label: "Entregue", icon: "🏁" },
];

const DB_STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  picked_up: "Coletado",
  in_transit: "Em Trânsito",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const FILTROS: { value: FiltroStatus; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativos" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "entregue", label: "Entregues" },
  { value: "cancelado", label: "Cancelados" },
];

/* ─── Helpers ─────────────────────────────────────────────── */

/** Find which workflow step index a given DB status corresponds to */
function getWorkflowIndex(status: DBStatus): number {
  const idx = WORKFLOW_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

/** Map a raw DB status to the simplified filter category */
function getFilterCategory(status: DBStatus): FiltroStatus {
  if (status === "cancelled") return "cancelado";
  if (status === "delivered") return "entregue";
  if (status === "picked_up" || status === "in_transit") return "em_andamento";
  return "ativo"; // pending, confirmed
}

/** Return a Tailwind colour pair (bg+text) for a status badge */
function statusBadgeColors(status: DBStatus): string {
  switch (status) {
    case "pending":
      return "bg-gray-100 text-gray-700";
    case "confirmed":
      return "bg-blue-100 text-blue-700";
    case "picked_up":
      return "bg-amber-100 text-amber-700";
    case "in_transit":
      return "bg-purple-100 text-purple-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

/* ─── Loading Skeleton ────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Summary skeleton */}
      <div className="h-16 animate-pulse rounded-xl bg-gray-100" />

      {/* Filter pills skeleton */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>

      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4 rounded-xl border border-border bg-white p-5">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-5 w-56 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-72 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-7 w-28 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-24 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
          <div className="h-14 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

/* ─── Component ───────────────────────────────────────────── */

export function Fretes() {
  const profile = useAuthStore((s) => s.profile);
  const [orders, setOrders] = useState<FreightOrder[]>([]);
  const [filtro, setFiltro] = useState<FiltroStatus>("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ─── Fetch orders ──────────────────────────────── */

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const { data, error: queryErr } = await supabase
          .from("orders")
          .select(`*, quotation:quotation_id(*), carrier:carrier_id(name)`)
          .eq("shipper_id", profile.id)
          .order("created_at", { ascending: false });

        if (queryErr) {
          setError(queryErr.message);
        } else if (data) {
          setOrders(
            data.map((o: any) => {
              const q = o.quotation || {};
              return {
                id: o.id,
                carrier_nome: o.carrier?.name ?? "Transportadora",
                origem_cidade: q.origin_city ?? "",
                origem_estado: q.origin_state ?? "",
                destino_cidade: q.destination_city ?? "",
                destino_estado: q.destination_state ?? "",
                carga_descricao: q.cargo_description ?? "",
                peso_kg: Number(q.weight_kg) || 0,
                volume_m3: Number(q.volume_m3) || 0,
                valor: Number(o.price) || 0,
                status: (o.status as DBStatus) || "pending",
                data_coleta: o.pickup_date ?? "",
                data_entrega: o.delivery_date ?? "",
                created_at: o.created_at ?? "",
              };
            }),
          );
        }
      } catch (e) {
        console.error("Failed to load orders:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile?.id]);

  /* ─── Derived state ─────────────────────────────── */

  const filtered = useMemo(
    () => orders.filter((o) => filtro === "todos" || getFilterCategory(o.status) === filtro),
    [orders, filtro],
  );

  const total = useMemo(() => filtered.reduce((s, o) => s + o.valor, 0), [filtered]);

  /* ─── Loading state ─────────────────────────────── */

  if (loading) return <LoadingSkeleton />;

  /* ─── Render ────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ──────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Fretes</h1>
        <p className="text-gray-500">Acompanhe seus fretes contratados</p>
      </div>

      {/* ── Error banner ────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Summary row ─────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-white px-6 py-4 shadow-sm">
        <span className="text-sm text-gray-500">
          {filtered.length} frete{filtered.length !== 1 ? "s" : ""} encontrado
          {filtered.length !== 1 ? "s" : ""}
        </span>
        <span className="text-lg font-bold text-gray-900">
          Total: {formatCurrency(total)}
        </span>
      </div>

      {/* ── Filter tabs ─────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filtro === f.value
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Empty state (no orders at all) ─────────── */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white px-6 py-16 shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Nenhum frete contratado ainda
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Aceite uma proposta nas cotações para gerar um frete.
          </p>
        </div>
      )}

      {/* ── Empty filter result ─────────────────────── */}
      {orders.length > 0 && filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-white py-12 text-center text-gray-400">
          Nenhum frete encontrado para este filtro.
        </div>
      )}

      {/* ── Cards ───────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((o) => {
            const wfIdx = getWorkflowIndex(o.status);
            const isCancelled = o.status === "cancelled";
            const isDelivered = o.status === "delivered";

            return (
              <div
                key={o.id}
                className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
              >
                {/* ── Top row ────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <span className="text-gray-500">Transportadora:</span>
                      <span>{o.carrier_nome}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="font-medium">
                        {o.origem_cidade}/{o.origem_estado}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">
                        {o.destino_cidade}/{o.destino_estado}
                      </span>
                    </div>

                    {o.carga_descricao && (
                      <p className="line-clamp-1 text-xs text-gray-500">
                        {o.carga_descricao}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatWeight(o.peso_kg)}</span>
                      <span>·</span>
                      <span>{formatVolume(o.volume_m3)}</span>
                      <span>·</span>
                      <span>{formatDate(o.created_at)}</span>
                    </div>
                  </div>

                  {/* Right info */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(o.valor)}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeColors(o.status)}`}
                    >
                      {DB_STATUS_LABEL[o.status] || o.status}
                    </span>
                  </div>
                </div>

                {/* ── Workflow bar ────────────────────── */}
                {!isCancelled && (
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="flex items-center">
                      {WORKFLOW_STEPS.map((step, idx) => (
                        <div
                          key={step.key}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div className="relative flex w-full items-center">
                            {/* Connector line before (except first) */}
                            {idx > 0 && (
                              <div
                                className={`h-0.5 flex-1 transition-colors ${
                                  idx <= wfIdx ? "bg-primary" : "bg-gray-200"
                                }`}
                              />
                            )}

                            {/* Step circle */}
                            <div
                              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs transition-all ${
                                idx < wfIdx
                                  ? "bg-primary text-white"
                                  : idx === wfIdx
                                    ? "bg-primary text-white ring-4 ring-primary/20"
                                    : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {idx < wfIdx ? "✓" : step.icon}
                            </div>

                            {/* Connector line after (except last) */}
                            {idx < WORKFLOW_STEPS.length - 1 && (
                              <div
                                className={`h-0.5 flex-1 transition-colors ${
                                  idx < wfIdx ? "bg-primary" : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>

                          <span
                            className={`mt-1.5 text-xs whitespace-nowrap ${
                              idx <= wfIdx
                                ? "font-medium text-gray-900"
                                : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Cancelled banner ────────────────── */}
                {isCancelled && (
                  <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                    ✕ Este frete foi cancelado.
                  </div>
                )}

                {/* ── Delivered banner ────────────────── */}
                {isDelivered && (
                  <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                    ✅ Entrega concluída com sucesso!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Fretes;
