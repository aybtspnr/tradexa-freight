import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatCurrency, formatDate, formatWeight, formatVolume } from "@/utils/format";

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

const DB_TO_UI_STATUS: Record<string, string> = {
  pending: "ativo",
  confirmed: "ativo",
  picked_up: "em_andamento",
  in_transit: "em_andamento",
  delivered: "entregue",
  cancelled: "cancelado",
};

function mapOrderToFreightOrder(o: any): FreightOrder {
  return {
    id: o.id,
    cotacao_id: o.quotation_id,
    shipper_id: o.shipper_id,
    carrier_id: o.carrier_id,
    carrier_nome: o.carrier?.name ?? "Transportadora",
    origem_cidade: o.quotation?.origin_city ?? "",
    origem_estado: o.quotation?.origin_state ?? "",
    destino_cidade: o.quotation?.destination_city ?? "",
    destino_estado: o.quotation?.destination_state ?? "",
    carga_descricao: o.quotation?.cargo_description ?? "",
    peso_kg: Number(o.quotation?.weight_kg) || 0,
    volume_m3: Number(o.quotation?.volume_m3) || 0,
    valor: Number(o.price) || 0,
    prazo_dias: 0,
    status: (DB_TO_UI_STATUS[o.status] ?? "ativo") as "ativo" | "em_andamento" | "entregue" | "cancelado",
    data_coleta: o.pickup_date ?? "",
    data_entrega: o.delivery_date ?? "",
    created_at: o.created_at ?? "",
  };
}

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
  const [orders, setOrders] = useState<FreightOrder[]>([]);
  const [filtro, setFiltro] = useState<FiltroStatus>("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (supabase as any)
      .from("orders")
      .select(`
        *,
        quotation:quotation_id (
          origin_city, origin_state, destination_city, destination_state,
          cargo_description, weight_kg, volume_m3, pickup_date, delivery_date
        ),
        carrier:carrier_id (name)
      `)
      .eq("shipper_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }: { data: any; error: any }) => {
        if (!error && data) {
          setOrders(data.map(mapOrderToFreightOrder));
        } else if (error) {
          console.error("Failed to load orders:", error);
          setError(error.message);
        }
      })
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const filtered = useMemo(
    () => orders.filter((o) => filtro === "todos" || o.status === filtro),
    [orders, filtro],
  );

  const total = useMemo(
    () => filtered.reduce((s, o) => s + o.valor, 0),
    [filtered],
  );

  /* ─── Loading state ────────────────────────────── */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  /* ─── Render ───────────────────────────────────── */

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Fretes</h1>
        <p className="text-gray-500">Acompanhe seus fretes contratados</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary row */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-white px-6 py-4">
        <span className="text-sm text-gray-500">
          {filtered.length} frete{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </span>
        <span className="text-lg font-bold text-gray-900">
          Total: {formatCurrency(total)}
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

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white px-6 py-16 shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Nenhum frete contratado ainda</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aceite uma proposta nas cotações para gerar um frete.
          </p>
        </div>
      )}

      {/* Empty filter result */}
      {orders.length > 0 && filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-white py-12 text-center text-gray-400">
          Nenhum frete encontrado para este filtro.
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
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
                        {formatWeight(o.peso_kg)} / {formatVolume(o.volume_m3)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(o.valor)}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fretes;
