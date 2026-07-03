import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

/* ─── Types ───────────────────────────────────────────────── */

interface FreightOrder {
  id: string;
  cotacao_id: string;
  shipper_id: string;
  carrier_id: string;
  carrier_nome: string;
  origem_cidade: string;
  origem_estado: string;
  destino_cidade: string;
  destino_estado: string;
  carga_descricao: string;
  peso_kg: number;
  volume_m3: number;
  valor: number;
  prazo_dias: number;
  status: "ativo" | "em_andamento" | "entregue" | "cancelado";
  data_coleta: string;
  data_entrega: string;
  created_at: string;
}

type FiltroStatus = "todos" | "ativo" | "em_andamento" | "entregue" | "cancelado";

/* ─── Helpers ────────────────────────────────────────────── */

function loadOrders(): FreightOrder[] {
  try {
    const raw = localStorage.getItem("tradexa_freight_orders");
    if (raw) return JSON.parse(raw) as FreightOrder[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveOrders(list: FreightOrder[]) {
  localStorage.setItem("tradexa_freight_orders", JSON.stringify(list));
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

const STATUS_COLORS: Record<string, string> = {
  ativo: "bg-blue-100 text-blue-700",
  em_andamento: "bg-yellow-100 text-yellow-700",
  entregue: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  em_andamento: "Em Andamento",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const FILTROS: { value: FiltroStatus; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativos" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "entregue", label: "Entregues" },
  { value: "cancelado", label: "Cancelados" },
];

/* ─── Component ──────────────────────────────────────────── */

export function Fretes() {
  const profile = useAuthStore((s) => s.profile);
  const [filtro, setFiltro] = useState<FiltroStatus>("todos");

  const carrierId = profile?.id;

  const allOrders = useMemo(() => {
    if (!carrierId) return [];
    return loadOrders().filter((o) => o.carrier_id === carrierId);
  }, [carrierId]);

  const filtered = useMemo(
    () => allOrders.filter((o) => filtro === "todos" || o.status === filtro),
    [allOrders, filtro],
  );

  const total = useMemo(
    () => filtered.reduce((s, o) => s + o.valor, 0),
    [filtered],
  );

  const handleUpdateStatus = (orderId: string, newStatus: FreightOrder["status"]) => {
    const all = loadOrders();
    const updated = all.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o,
    );
    saveOrders(updated);
    // Force re-render by toggling state
    setFiltro((prev) => prev as FiltroStatus);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Fretes</h1>
        <p className="text-gray-500">Acompanhe os fretes contratados com sua transportadora</p>
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-white px-6 py-4">
        <span className="text-sm text-gray-500">
          {filtered.length} frete{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </span>
        <span className="text-lg font-bold text-gray-900">
          Total: R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filtro === f.value
                ? "bg-primary text-white"
                : "border border-border bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-white py-16 text-center text-gray-400">
          Nenhum frete encontrado.
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((o) => (
          <div
            key={o.id}
            className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Left info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <span className="text-gray-500">Cliente:</span>
                  <span>{o.carrier_nome}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                  <span>{o.origem_cidade}/{o.origem_estado}</span>
                  <span className="text-gray-400">→</span>
                  <span>{o.destino_cidade}/{o.destino_estado}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500 line-clamp-1">{o.carga_descricao}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span>{o.peso_kg} kg</span>
                  <span>{o.volume_m3} m³</span>
                  <span>{o.prazo_dias} dias úteis</span>
                  <span>Criado: {formatDateTime(o.created_at)}</span>
                </div>
              </div>

              {/* Right info */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-xl font-bold text-green-700">
                  R$ {o.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    STATUS_COLORS[o.status]
                  }`}
                >
                  {STATUS_LABELS[o.status]}
                </span>

                {/* Status actions */}
                <div className="mt-1 flex gap-1">
                  {o.status === "ativo" && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, "em_andamento")}
                      className="rounded-md border border-yellow-300 px-2.5 py-1 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-50"
                    >
                      Iniciar
                    </button>
                  )}
                  {o.status === "em_andamento" && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, "entregue")}
                      className="rounded-md border border-green-300 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
                    >
                      Finalizar
                    </button>
                  )}
                  {(o.status === "ativo" || o.status === "em_andamento") && (
                    <button
                      onClick={() => {
                        if (window.confirm("Cancelar este frete?"))
                          handleUpdateStatus(o.id, "cancelado");
                      }}
                      className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Fretes;
