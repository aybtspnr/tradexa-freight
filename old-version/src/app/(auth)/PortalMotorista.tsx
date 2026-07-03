import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { formatCurrency } from "@/utils/csv";

interface MotoristaOrder {
  id: string;
  quotation_id: string;
  status: string;
  price: number;
  pickup_address: string | null;
  delivery_address: string | null;
  scheduled_date: string | null;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  weight_kg: number | null;
  volume_m3: number | null;
  cargo_description: string | null;
  shipper_name: string;
  shipper_phone: string | null;
}

export function PortalMotorista() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<MotoristaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "completed">("active");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) loadOrders();
  }, [user, activeTab]);

  async function loadOrders() {
    if (!user) return;
    setLoading(true);

    const statusFilter = activeTab === "pending" ? ["pending", "confirmed"]
      : activeTab === "active" ? ["in_transit", "loading"]
      : ["delivered", "completed", "cancelled"];

    // Get carrier's assigned orders with details
    const { data: ordersData } = await supabase
      .from("orders")
      .select(`
        *,
        quotations!inner(
          origin_city, origin_state, destination_city, destination_state,
          weight_kg, volume_m3, cargo_description, shipper_id
        ),
        shipper:quotations!inner(shipper_id)
      `)
      .eq("carrier_id", user.id)
      .in("status", statusFilter)
      .order("created_at", { ascending: false });

    if (!ordersData) {
      setOrders([]);
      setLoading(false);
      return;
    }

    // Transform data
    const formatted: MotoristaOrder[] = [];
    for (const o of ordersData as any[]) {
      const q = o.quotations;
      if (!q) continue;

      // Get shipper profile
      const { data: shipperProfile } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", q.shipper_id)
        .single();

      formatted.push({
        id: o.id,
        quotation_id: o.quotation_id,
        status: o.status,
        price: o.price,
        pickup_address: o.pickup_address || null,
        delivery_address: o.delivery_address || null,
        scheduled_date: o.scheduled_date || null,
        origin_city: q.origin_city,
        origin_state: q.origin_state,
        destination_city: q.destination_city,
        destination_state: q.destination_state,
        weight_kg: q.weight_kg,
        volume_m3: q.volume_m3,
        cargo_description: q.cargo_description,
        shipper_name: shipperProfile?.name || "Embarcador",
        shipper_phone: shipperProfile?.phone || null,
      });
    }

    setOrders(formatted);
    setLoading(false);
  }

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    loadOrders();
  }

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: "Pendente", color: "bg-amber-500", icon: "⏳" },
    confirmed: { label: "Confirmado", color: "bg-blue-500", icon: "✅" },
    loading: { label: "Carregando", color: "bg-indigo-500", icon: "📦" },
    in_transit: { label: "Em trânsito", color: "bg-primary", icon: "🚛" },
    delivered: { label: "Entregue", color: "bg-green-500", icon: "📬" },
    completed: { label: "Concluído", color: "bg-green-600", icon: "🎉" },
    cancelled: { label: "Cancelado", color: "bg-gray-400", icon: "❌" },
  };

  const tabs = [
    { id: "active" as const, label: "🔄 Ativas", statuses: ["in_transit", "loading"] },
    { id: "pending" as const, label: "📋 Pendentes", statuses: ["pending", "confirmed"] },
    { id: "completed" as const, label: "✅ Finalizadas", statuses: ["delivered", "completed"] },
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
            🚛
          </span>
          <div>
            <h1 className="text-lg font-bold text-text">Portal do Motorista</h1>
            <p className="text-xs text-text-muted">
              {orders.length} {activeTab === "active" ? "ativas" : activeTab === "pending" ? "pendentes" : "finalizadas"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-white p-4">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                <div className="mt-3 h-8 w-full rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-12 text-center">
            <span className="text-5xl">🛣️</span>
            <p className="mt-4 text-sm text-text-muted">
              {activeTab === "active"
                ? "Nenhuma viagem ativa no momento."
                : activeTab === "pending"
                ? "Nenhuma carga pendente."
                : "Nenhuma viagem finalizada."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.pending;
              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-white shadow-sm transition-all active:scale-[0.98]"
                >
                  {/* Status badge */}
                  <div className={`flex items-center gap-2 rounded-t-xl px-4 py-2 text-xs font-medium text-white ${cfg.color}`}>
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                    <span className="ml-auto">{formatCurrency(order.price)}</span>
                  </div>

                  {/* Route info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <div className="h-8 w-0.5 bg-gray-300" />
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      </div>
                      <div className="ml-2 flex-1">
                        <p className="text-sm font-semibold text-text">
                          {order.origin_city}/{order.origin_state}
                        </p>
                        <p className="text-xs text-text-muted">→</p>
                        <p className="text-sm font-semibold text-text">
                          {order.destination_city}/{order.destination_state}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-surface p-3 text-xs">
                      {order.weight_kg && <span>📦 {order.weight_kg} kg</span>}
                      {order.volume_m3 && <span>📐 {order.volume_m3} m³</span>}
                      {order.scheduled_date && (
                        <span>📅 {new Date(order.scheduled_date).toLocaleDateString("pt-BR")}</span>
                      )}
                      <span>👤 {order.shipper_name}</span>
                    </div>

                    {order.cargo_description && (
                      <p className="mt-2 text-xs text-text-muted">{order.cargo_description}</p>
                    )}

                    {/* Action buttons (large touch targets for mobile) */}
                    <div className="mt-3 flex gap-3">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(order.id, "loading")}
                            className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.97]"
                          >
                            ✅ Iniciar viagem
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(order.id, "cancelled")}
                            className="flex-1 rounded-lg border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 active:scale-[0.97]"
                          >
                            ❌ Recusar
                          </button>
                        </>
                      )}
                      {order.status === "loading" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "in_transit")}
                          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.97]"
                        >
                          🚛 Saiu para entrega
                        </button>
                      )}
                      {order.status === "in_transit" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "delivered")}
                          className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.97]"
                        >
                          📬 Confirmar entrega
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "loading")}
                          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.97]"
                        >
                          📦 Iniciar carregamento
                        </button>
                      )}
                    </div>

                    {/* Shipper contact */}
                    {order.shipper_phone && (
                      <a
                        href={`https://wa.me/55${order.shipper_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 py-2.5 text-xs font-medium text-green-700 active:scale-[0.97]"
                      >
                        💬 Falar com embarcador via WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
