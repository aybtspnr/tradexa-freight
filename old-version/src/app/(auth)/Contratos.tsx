import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useProfile } from "@/hooks/useProfile";
import { NovoContratoModal } from "@/components/contracts/NovoContratoModal";
import { formatCurrency, formatDate } from "@/utils/csv";

const db: any = supabase;

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
  carrier_name?: string;
  shipper_name?: string;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function Contratos() {
  const [user, setUser] = useState<User | null>(null);
  const { profile } = useProfile(user);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState("all");

  const isCarrier = profile?.role === "carrier";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) loadContracts();
  }, [user]);

  async function loadContracts() {
    if (!user) return;
    setLoading(true);

    const { data } = await db.from("contracts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    // Fetch carrier/shipper names
    const enriched: Contract[] = [];
    for (const c of data) {
      const counterpartId = isCarrier ? c.shipper_id : c.carrier_id;
      const { data: counterpart } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", counterpartId)
        .single();
      
      enriched.push({
        ...c,
        carrier_name: isCarrier ? "" : (counterpart?.name || "Transportadora"),
        shipper_name: isCarrier ? (counterpart?.name || "Embarcador") : "",
      });
    }

    setContracts(enriched);
    setLoading(false);
  }

  async function handleStatusUpdate(contractId: string, newStatus: string) {
    await db.from("contracts").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", contractId);
    loadContracts();
  }

  const filtered = filter === "all"
    ? contracts
    : contracts.filter((c) => c.status === filter);

  const freqLabels: Record<string, string> = {
    weekly: "Semanal",
    biweekly: "Quinzenal",
    monthly: "Mensal",
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: "Ativo", color: "bg-green-100 text-green-800" },
    paused: { label: "Pausado", color: "bg-amber-100 text-amber-800" },
    cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-500" },
    completed: { label: "Concluído", color: "bg-blue-100 text-blue-800" },
  };

  function getScheduleLabel(c: Contract): string {
    if (c.frequency === "weekly") return `Toda ${dayNames[c.day_of_week ?? 1]}`;
    if (c.frequency === "biweekly") return `Quinzenal (${dayNames[c.day_of_week ?? 1]})`;
    if (c.frequency === "monthly") return `Dia ${c.day_of_month} de cada mês`;
    return c.frequency;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Contratos recorrentes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isCarrier
              ? "Contratos de frete recorrente com embarcadores."
              : "Crie contratos de frete fixos com transportadoras."}
          </p>
        </div>
        {!isCarrier && (
          <button onClick={() => setShowNew(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark">
            + Novo contrato
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "active", "paused", "completed", "cancelled"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {f === "all" ? "Todos" : statusConfig[f]?.label || f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="mt-8 text-center text-sm text-gray-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-4 text-sm text-gray-500">
            {isCarrier
              ? "Nenhum contrato ativo no momento."
              : "Crie seu primeiro contrato recorrente com uma transportadora."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((c) => {
            const cfg = statusConfig[c.status] || statusConfig.cancelled;
            return (
              <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-primary/20">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">{freqLabels[c.frequency]}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {c.origin_city}/{c.origin_state} → {c.destination_city}/{c.destination_state}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary">{formatCurrency(c.price)}</p>
                </div>

                {/* Schedule */}
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span>📅 {getScheduleLabel(c)}</span>
                  <span>•</span>
                  <span>Início: {formatDate(c.start_date)}</span>
                  {c.end_date && <><span>•</span><span>Término: {formatDate(c.end_date)}</span></>}
                </div>

                {/* Details */}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                  {c.weight_kg && <span>📦 {c.weight_kg} kg</span>}
                  {c.volume_m3 && <span>📐 {c.volume_m3} m³</span>}
                  {c.cargo_type && <span>🏷️ {c.cargo_type}</span>}
                  <span>👤 {isCarrier ? c.shipper_name : c.carrier_name}</span>
                </div>

                {c.cargo_description && (
                  <p className="mt-1 text-xs text-gray-400">{c.cargo_description}</p>
                )}

                {/* Actions */}
                {(c.status === "active" || c.status === "paused") && (
                  <div className="mt-3 flex gap-2">
                    {c.status === "active" && (
                      <button onClick={() => handleStatusUpdate(c.id, "paused")}
                        className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50">
                        ⏸️ Pausar
                      </button>
                    )}
                    {c.status === "paused" && (
                      <button onClick={() => handleStatusUpdate(c.id, "active")}
                        className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50">
                        ▶️ Reativar
                      </button>
                    )}
                    <button onClick={() => handleStatusUpdate(c.id, "cancelled")}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      ❌ Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showNew && user && (
        <NovoContratoModal
          shipperId={user.id}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); loadContracts(); }}
        />
      )}
    </div>
  );
}
