import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";
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

const UI_TO_DB_STATUS: Record<string, string> = {
  ativo: "confirmed",
  em_andamento: "in_transit",
  entregue: "delivered",
  cancelado: "cancelled",
};

const DB_TO_UI_STATUS: Record<string, string> = {
  pending: "ativo",
  confirmed: "ativo",
  picked_up: "em_andamento",
  in_transit: "em_andamento",
  delivered: "entregue",
  cancelled: "cancelado",
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
  const [orders, setOrders] = useState<FreightOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const carrierId = profile?.id;

  const loadOrders = useCallback(async () => {
    if (!carrierId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Load orders with the related quotation data via a join
    const { data, error } = await (supabase.from("orders") as any)
      .select("*, quotation:quotation_id(*)")
      .eq("carrier_id", carrierId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar fretes:", error);
      setLoading(false);
      return;
    }

    setOrders(
      ((data || []) as any[]).map((o: any) => {
        const q = o.quotation || {};
        return {
          id: o.id,
          cotacao_id: o.quotation_id,
          shipper_id: o.shipper_id,
          carrier_id: o.carrier_id,
          carrier_nome: profile?.name ?? "Transportadora",
          origem_cidade: q.origin_city || "",
          origem_estado: q.origin_state || "",
          destino_cidade: q.destination_city || "",
          destino_estado: q.destination_state || "",
          carga_descricao: q.cargo_description || "",
          peso_kg: q.weight_kg || 0,
          volume_m3: q.volume_m3 || 0,
          valor: o.price,
          prazo_dias: 0,
          status: (DB_TO_UI_STATUS[o.status] ?? "ativo") as "ativo" | "em_andamento" | "entregue" | "cancelado",
          data_coleta: o.pickup_date || "",
          data_entrega: o.delivery_date || "",
          created_at: o.created_at || "",
        };
      }),
    );
    setLoading(false);
  }, [carrierId, profile?.name]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = useMemo(
    () => orders.filter((o) => filtro === "todos" || o.status === filtro),
    [orders, filtro],
  );

  const total = useMemo(
    () => filtered.reduce((s, o) => s + o.valor, 0),
    [filtered],
  );

  const handleUpdateStatus = useCallback(
    async (orderId: string, newStatus: FreightOrder["status"]) => {
      const dbStatus = UI_TO_DB_STATUS[newStatus] ?? newStatus;
      const { error } = await (supabase.from("orders") as any)
        .update({ status: dbStatus })
        .eq("id", orderId);

      if (error) {
        console.error("Erro ao atualizar status do frete:", error);
        return;
      }

      // Update local state optimistically
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    },
    [],
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
        <p className="text-gray-500">Acompanhe os fretes contratados com sua transportadora</p>
      </div>

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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <span className="text-3xl">🚚</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Nenhum frete contratado ainda</h3>
          <p className="mt-1 text-sm text-gray-500">
            Os fretes aparecerão aqui quando embarcadores aceitarem suas ofertas.
          </p>
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-medium">💡 Continue fazendo ofertas nas cotações disponíveis!</p>
          </div>
        </div>
      )}

      {/* Empty filter result */}
      {orders.length > 0 && filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-white py-12 text-center text-gray-400">
          Nenhum frete encontrado para este filtro.
        </div>
      )}

      {/* Cards */}
      {filtered.length > 0 && (
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
                    <span>{formatWeight(o.peso_kg)}</span>
                    <span>{formatVolume(o.volume_m3)}</span>
                    <span>{o.prazo_dias} dias úteis</span>
                    <span>Criado: {formatDate(o.created_at)}</span>
                  </div>
                </div>

                {/* Right info */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xl font-bold text-green-700">
                    {formatCurrency(o.valor)}
                  </span>
                  <OrderStatusBadge status={o.status} />

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
      )}
    </div>
  );
}

export default Fretes;
