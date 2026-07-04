import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency, formatDate } from "@/utils/format";

/* ─── Types ───────────────────────────────────────────────── */

interface Contract {
  id: string;
  shipper_id: string;
  carrier_id: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  weight_kg: number | null;
  volume_m3: number | null;
  cargo_description: string | null;
  cargo_type: string | null;
  price: number;
  frequency: string;
  day_of_week: number | null;
  day_of_month: number | null;
  start_date: string;
  end_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  shipper_name?: string;
}

type FilterTab = "all" | "active" | "closed";

/* ─── Constants ───────────────────────────────────────────── */

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const dayNamesFull = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const freqLabels: Record<string, string> = {
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
};

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  active:    { label: "Ativo",     bg: "bg-emerald-50",  text: "text-emerald-700",  dot: "bg-emerald-500" },
  paused:    { label: "Pausado",   bg: "bg-amber-50",    text: "text-amber-700",    dot: "bg-amber-500" },
  cancelled: { label: "Cancelado", bg: "bg-red-50",      text: "text-red-600",      dot: "bg-red-400" },
  completed: { label: "Concluído", bg: "bg-blue-50",     text: "text-blue-700",     dot: "bg-blue-500" },
};

const cargoTypeLabels: Record<string, string> = {
  fracionado: "Fracionado",
  lotacao: "Lotação",
  perigoso: "Perigoso",
  refrigerado: "Refrigerado",
  valor: "Alto valor",
};

/* ─── Helpers ─────────────────────────────────────────────── */

function getScheduleLabel(c: Contract): string {
  if (c.frequency === "weekly")    return `Toda ${dayNamesFull[c.day_of_week ?? 1]}`;
  if (c.frequency === "biweekly") return `Quinzenal (${dayNames[c.day_of_week ?? 1]})`;
  if (c.frequency === "monthly")  return `Dia ${c.day_of_month} de cada mês`;
  return c.frequency;
}

function getStatusBadge(status: string) {
  const cfg = statusConfig[status] ?? statusConfig.cancelled;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─── Detail Modal ────────────────────────────────────────── */

function ContractDetailModal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const cfg = statusConfig[contract.status] ?? statusConfig.cancelled;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div className="mt-8 w-full max-w-lg rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">📋 Detalhes do Contrato</h2>
            {getStatusBadge(contract.status)}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Route */}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Rota</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{contract.origin_city}</p>
                <p className="text-xs text-gray-500">{contract.origin_state}</p>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <span className="h-px w-8 bg-gray-300" />
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <span className="h-px w-8 bg-gray-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{contract.destination_city}</p>
                <p className="text-xs text-gray-500">{contract.destination_state}</p>
              </div>
            </div>
          </div>

          {/* Value */}
          <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Valor do frete</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(contract.price)}</span>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Frequência</p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">{freqLabels[contract.frequency] ?? contract.frequency}</p>
              <p className="text-xs text-gray-500">{getScheduleLabel(contract)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Vigência</p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">{formatDate(contract.start_date)}</p>
              {contract.end_date && <p className="text-xs text-gray-500">até {formatDate(contract.end_date)}</p>}
            </div>
          </div>

          {/* Cargo details */}
          {(contract.weight_kg || contract.volume_m3 || contract.cargo_type || contract.cargo_description) && (
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Carga</p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-700">
                {contract.weight_kg && <span>📦 {contract.weight_kg.toLocaleString("pt-BR")} kg</span>}
                {contract.volume_m3 && <span>📐 {contract.volume_m3.toLocaleString("pt-BR")} m³</span>}
                {contract.cargo_type && <span>🏷️ {cargoTypeLabels[contract.cargo_type] ?? contract.cargo_type}</span>}
              </div>
              {contract.cargo_description && (
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{contract.cargo_description}</p>
              )}
            </div>
          )}

          {/* Embarcador */}
          {contract.shipper_name && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3">
              <span className="text-lg">🏢</span>
              <div>
                <p className="text-xs text-gray-500">Embarcador</p>
                <p className="text-sm font-medium text-gray-900">{contract.shipper_name}</p>
              </div>
            </div>
          )}

          {contract.notes && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Observações</p>
              <p className="mt-1 text-sm text-gray-700">{contract.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */

export function Contratos() {
  const user = useAuthStore((s) => s.user);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [detailContract, setDetailContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (user) loadContracts();
  }, [user]);

  async function loadContracts() {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("carrier_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    // Batch fetch shipper names
    const shipperIds = [...new Set(data.map((c) => c.shipper_id))];
    const { data: shippers } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", shipperIds);

    const shipperMap = new Map((shippers ?? []).map((p) => [p.id, p.name ?? "Embarcador"]));

    const enriched: Contract[] = data.map((c) => ({
      ...c,
      shipper_name: shipperMap.get(c.shipper_id) ?? "Embarcador",
      created_at: c.created_at ?? "",
    }));

    setContracts(enriched);
    setLoading(false);
  }

  async function handleStatusUpdate(contractId: string, newStatus: string) {
    await supabase
      .from("contracts")
      .update({ status: newStatus })
      .eq("id", contractId);
    loadContracts();
  }

  /* ─── Filtering ──────────────────────────────────────────── */

  const filtered = useMemo(() => {
    if (filter === "all") return contracts;
    if (filter === "active") return contracts.filter((c) => c.status === "active" || c.status === "paused");
    if (filter === "closed") return contracts.filter((c) => c.status === "cancelled" || c.status === "completed");
    return contracts;
  }, [contracts, filter]);

  const stats = useMemo(() => {
    const active = contracts.filter((c) => c.status === "active" || c.status === "paused");
    const totalMonthly = active.reduce((sum, c) => {
      if (c.frequency === "weekly") return sum + c.price * 4;
      if (c.frequency === "biweekly") return sum + c.price * 2;
      return sum + c.price;
    }, 0);
    return { activeCount: active.length, totalMonthly };
  }, [contracts]);

  /* ─── Filter tabs ────────────────────────────────────────── */

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all",    label: "Todos",      count: contracts.length },
    { key: "active", label: "Ativos",     count: contracts.filter((c) => c.status === "active" || c.status === "paused").length },
    { key: "closed", label: "Encerrados", count: contracts.filter((c) => c.status === "cancelled" || c.status === "completed").length },
  ];

  /* ─── Render ─────────────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-6xl">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Contratos Recorrentes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Contratos de frete recorrente firmados com embarcadores.
          </p>
        </div>
      </div>

      {/* ── Stats bar ───────────────────────────────────────── */}
      {!loading && contracts.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Contratos</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{contracts.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Ativos</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.activeCount}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 col-span-2 sm:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Faturamento Mensal Est.</p>
            <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(stats.totalMonthly)}</p>
          </div>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="mt-6">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                filter === tab.key ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Contract cards grid ─────────────────────────────── */}
      {loading ? (
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-gray-500">Carregando contratos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <span className="text-3xl">📋</span>
          </div>
          <p className="mt-4 text-base font-medium text-gray-900">
            {filter === "all" ? "Nenhum contrato encontrado" : filter === "active" ? "Nenhum contrato ativo" : "Nenhum contrato encerrado"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {filter === "all"
              ? "Você ainda não possui contratos recorrentes com embarcadores."
              : "Ajuste os filtros para ver outros contratos."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const cfg = statusConfig[c.status] ?? statusConfig.cancelled;
            const isActive = c.status === "active" || c.status === "paused";
            return (
              <div
                key={c.id}
                onClick={() => setDetailContract(c)}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                {/* Top row: status + frequency */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(c.status)}
                  <span className="text-xs font-medium text-gray-400">{freqLabels[c.frequency]}</span>
                </div>

                {/* Route */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {c.origin_city}/{c.origin_state}
                    </p>
                  </div>
                  <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {c.destination_city}/{c.destination_state}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <p className="mt-3 text-xl font-bold text-primary">{formatCurrency(c.price)}</p>

                {/* Counterpart */}
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-base">🏢</span>
                  <span className="truncate">{c.shipper_name}</span>
                </div>

                {/* Schedule & Cargo pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                    📅 {getScheduleLabel(c)}
                  </span>
                  {c.cargo_type && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                      {cargoTypeLabels[c.cargo_type] ?? c.cargo_type}
                    </span>
                  )}
                </div>

                {/* Dates */}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <span>Início: {formatDate(c.start_date)}</span>
                  {c.end_date && (
                    <>
                      <span>•</span>
                      <span>Fim: {formatDate(c.end_date)}</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                {isActive && (
                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3" onClick={(e) => e.stopPropagation()}>
                    {c.status === "active" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(c.id, "paused"); }}
                        className="flex-1 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        ⏸ Pausar
                      </button>
                    )}
                    {c.status === "paused" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(c.id, "active"); }}
                        className="flex-1 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                      >
                        ▶ Reativar
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(c.id, "cancelled"); }}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ────────────────────────────────────── */}
      {detailContract && (
        <ContractDetailModal
          contract={detailContract}
          onClose={() => setDetailContract(null)}
        />
      )}
    </div>
  );
}

export default Contratos;
