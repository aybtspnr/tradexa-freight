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

  const allOrders = useMemo(() => {
    if (!profile?.id) return [];
    return loadOrders().filter((o) => o.shipper_id === profile.id);
  }, [profile]);

  const filtered = useMemo(
    () => allOrders.filter((o) => filtro === "todos" || o.status === filtro),
    [allOrders, filtro],
  );

  const total = useMemo(
    () => filtered.reduce((s, o) => s + o.valor, 0),
    [filtered],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Fretes</h1>
        <p className="text-gray-500">Acompanhe seus fretes contratados</p>
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <th className="px-6 py-3">Transportadora</th>
                <th className="px-6 py-3">Origem</th>
                <th className="px-6 py-3">Destino</th>
                <th className="px-6 py-3">Carga</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Nenhum frete encontrado. Aceite uma proposta nas cotações para gerar um frete.
                  </td>
                </tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{o.carrier_nome}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {o.origem_cidade}/{o.origem_estado}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {o.destino_cidade}/{o.destino_estado}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <span className="block text-xs text-gray-400">
                      {o.peso_kg} kg / {o.volume_m3} m³
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    R$ {o.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[o.status]
                      }`}
                    >
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDateTime(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Fretes;
