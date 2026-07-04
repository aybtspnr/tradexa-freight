import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate, formatWeight, formatVolume } from "@/utils/format";

/* ─── Types ─────────────────────────────────────────────────── */

interface Quotation {
  id: string;
  shipper_id: string;
  cargo_type: string;
  cargo_description: string;
  weight_kg: number;
  volume_m3: number;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  pickup_date: string;
  delivery_date: string;
  status: string;
  created_at: string;
}

interface Bid {
  id: string;
  quotation_id: string;
  carrier_id: string;
  price: number;
  estimated_days: number;
  vehicle_id: string | null;
  driver_id: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  vehicle?: { plate: string; model: string } | null;
  driver?: { name: string } | null;
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  year: number;
  capacity_kg: number;
  capacity_m3: number;
  vehicle_type: string;
}

interface Driver {
  id: string;
  name: string;
  cpf: string;
}

/* ─── Labels ────────────────────────────────────────────────── */

const CARGO_TYPE_LABEL: Record<string, string> = {
  caixa: "Caixa",
  pallet: "Pallet",
  container: "Container",
  granel: "Granel",
};

const VEHICLE_TYPE_LABEL: Record<string, string> = {
  caminhao: "Caminhão",
  van: "Van",
  carreta: "Carreta",
  utilitario: "Utilitário",
  bitrem: "Bitrem",
  rodotrem: "Rodotrem",
};

const QUOTATION_STATUS_LABEL: Record<string, string> = {
  open: "Aberta",
  bidding: "Com Ofertas",
  closed: "Fechada",
  cancelled: "Cancelada",
};

const BID_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendente", cls: "bg-amber-100 text-amber-700" },
  accepted: { label: "Aceita", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Recusada", cls: "bg-red-100 text-red-700" },
};

/* ─── Skeleton ──────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-white p-5">
      <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mb-3 space-y-2">
        <div className="h-3 w-1/2 rounded bg-gray-100" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
      </div>
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
        <div className="h-5 w-20 rounded-full bg-gray-100" />
      </div>
      <div className="mb-4 h-3 w-1/2 rounded bg-gray-100" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 rounded bg-gray-100" />
        <div className="h-9 w-24 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────────── */

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white px-6 py-16 shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-16 shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Erro ao carregar dados</h3>
      <p className="mt-1 text-sm text-red-600">
        Não foi possível carregar as cotações. Verifique sua conexão.
      </p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] shadow-sm"
      >
        Tentar Novamente
      </button>
    </div>
  );
}

/* ─── Status Badge ──────────────────────────────────────────── */

function StatusBadge({ label, cls }: { label: string; cls: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

/* ─── Main Component ────────────────────────────────────────── */

export function Cotacoes() {
  const profile = useAuthStore((s) => s.profile);

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filter, setFilter] = useState<"disponiveis" | "minhas_ofertas">("disponiveis");
  const [modalQuotation, setModalQuotation] = useState<Quotation | null>(null);
  const [bidForm, setBidForm] = useState({
    price: 0,
    estimated_days: 3,
    vehicle_id: "",
    driver_id: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carrierId = profile?.id ?? "";

  /* ─── Load data ────────────────────────────────────────── */

  const loadData = useCallback(async () => {
    if (!carrierId) {
      setQuotations([]);
      setBids([]);
      setVehicles([]);
      setDrivers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load fleet (available vehicles)
      const { data: fleetData, error: fleetErr } = await supabase
        .from("fleet")
        .select("*")
        .eq("carrier_id", carrierId)
        .eq("status", "available");

      if (fleetErr) throw fleetErr;
      setVehicles(
        (fleetData ?? []).map((v) => ({
          id: v.id,
          plate: v.plate,
          model: v.model ?? "",
          year: v.year ?? 0,
          capacity_kg: v.capacity_kg ?? 0,
          capacity_m3: v.capacity_m3 ?? 0,
          vehicle_type: v.vehicle_type ?? "caminhao",
        })),
      );

      // Load available drivers
      const { data: driverData, error: driverErr } = await supabase
        .from("drivers")
        .select("*")
        .eq("carrier_id", carrierId)
        .eq("active", true);

      if (driverErr) throw driverErr;
      setDrivers(
        (driverData ?? []).map((d) => ({
          id: d.id,
          name: d.name,
          cpf: d.cpf ?? "",
        })),
      );

      // Load open quotations (not this carrier's)
      const { data: quotData, error: quotErr } = await supabase
        .from("quotations")
        .select("*")
        .neq("shipper_id", carrierId)
        .in("status", ["open", "bidding"])
        .order("created_at", { ascending: false });

      if (quotErr) throw quotErr;
      setQuotations(
        (quotData ?? []).map((q) => ({
          id: q.id,
          shipper_id: q.shipper_id,
          cargo_type: q.cargo_type ?? "",
          cargo_description: q.cargo_description ?? "",
          weight_kg: q.weight_kg ?? 0,
          volume_m3: q.volume_m3 ?? 0,
          origin_city: q.origin_city,
          origin_state: q.origin_state,
          destination_city: q.destination_city,
          destination_state: q.destination_state,
          pickup_date: q.pickup_date ?? "",
          delivery_date: q.delivery_date ?? "",
          status: q.status ?? "open",
          created_at: q.created_at ?? "",
        })),
      );

      // Load this carrier's bids with joins
      const { data: bidData, error: bidErr } = await supabase
        .from("quotation_bids")
        .select("*, vehicle:vehicle_id(plate, model), driver:driver_id(name)")
        .eq("carrier_id", carrierId)
        .order("created_at", { ascending: false });

      if (bidErr) throw bidErr;
      setBids(
        (bidData ?? []).map((b) => ({
          id: b.id,
          quotation_id: b.quotation_id,
          carrier_id: b.carrier_id,
          price: b.price,
          estimated_days: b.estimated_days ?? 0,
          vehicle_id: b.vehicle_id,
          driver_id: b.driver_id,
          notes: b.notes,
          status: b.status ?? "pending",
          created_at: b.created_at ?? "",
          vehicle: b.vehicle as { plate: string; model: string } | null,
          driver: b.driver as { name: string } | null,
        })),
      );
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [carrierId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ─── Filter logic ────────────────────────────────────── */

  const bidQuotationIds = useMemo(
    () => new Set(bids.map((b) => b.quotation_id)),
    [bids],
  );

  const filteredQuotations = useMemo(() => {
    if (filter === "minhas_ofertas") {
      return quotations.filter((q) => bidQuotationIds.has(q.id));
    }
    return quotations.filter((q) => !bidQuotationIds.has(q.id));
  }, [quotations, filter, bidQuotationIds]);

  /* ─── Modal handlers ──────────────────────────────────── */

  const openBidModal = useCallback((q: Quotation) => {
    setBidForm({
      price: Math.round(q.weight_kg * 0.5 * 100) / 100,
      estimated_days: 3,
      vehicle_id: "",
      driver_id: "",
      notes: "",
    });
    setModalQuotation(q);
  }, []);

  const closeBidModal = useCallback(() => {
    if (!submitting) setModalQuotation(null);
  }, [submitting]);

  const handleSubmitBid = useCallback(async () => {
    if (!carrierId || !modalQuotation) return;
    if (bidForm.price <= 0 || bidForm.estimated_days <= 0) return;

    setSubmitting(true);

    const { error: insertErr } = await supabase.from("quotation_bids").insert({
      quotation_id: modalQuotation.id,
      carrier_id: carrierId,
      price: bidForm.price,
      estimated_days: bidForm.estimated_days,
      vehicle_id: bidForm.vehicle_id || null,
      driver_id: bidForm.driver_id || null,
      notes: bidForm.notes || null,
      status: "pending",
    });

    if (insertErr) {
      console.error("Erro ao enviar oferta:", insertErr);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setModalQuotation(null);
    await loadData();
  }, [carrierId, modalQuotation, bidForm, loadData]);

  /* ─── Loading state ───────────────────────────────────── */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotações Disponíveis</h1>
          <p className="text-gray-500">Veja as solicitações de frete e faça suas ofertas</p>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-9 w-36 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <SkeletonGrid />
      </div>
    );
  }

  /* ─── Error state ─────────────────────────────────────── */

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotações Disponíveis</h1>
          <p className="text-gray-500">Veja as solicitações de frete e faça suas ofertas</p>
        </div>
        <ErrorState onRetry={loadData} />
      </div>
    );
  }

  /* ─── Main render ─────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotações Disponíveis</h1>
          <p className="text-sm text-gray-500">
            {filter === "disponiveis"
              ? "Cargas aguardando transportadoras. Faça sua oferta!"
              : "Acompanhe o status das suas ofertas enviadas"}
          </p>
        </div>
      </div>

      {/* ── Filter tabs ─────────────────────────────────── */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("disponiveis")}
          className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            filter === "disponiveis"
              ? "bg-[#2563eb] text-white shadow-sm shadow-[#2563eb]/20"
              : "border border-border bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          📋 Disponíveis
          {filter === "disponiveis" && filteredQuotations.length > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-xs font-bold">
              {filteredQuotations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter("minhas_ofertas")}
          className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            filter === "minhas_ofertas"
              ? "bg-[#2563eb] text-white shadow-sm shadow-[#2563eb]/20"
              : "border border-border bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          💼 Minhas Ofertas
          <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-xs font-bold">
            {bids.length}
          </span>
        </button>
      </div>

      {/* ── Empty: no quotations at all ─────────────────── */}
      {quotations.length === 0 && filter === "disponiveis" && (
        <EmptyState
          icon="🔍"
          title="Nenhuma cotação disponível"
          description="As cotações aparecerão aqui quando embarcadores publicarem cargas. Fique atento!"
        />
      )}

      {/* ── Empty: all already bid ──────────────────────── */}
      {quotations.length > 0 && filteredQuotations.length === 0 && filter === "disponiveis" && (
        <div className="rounded-xl border border-border bg-white py-12 text-center">
          <span className="text-4xl">✅</span>
          <p className="mt-3 text-gray-500">Você já fez ofertas para todas as cotações disponíveis.</p>
          <button
            onClick={() => setFilter("minhas_ofertas")}
            className="mt-4 text-sm font-medium text-[#2563eb] hover:underline"
          >
            Ver minhas ofertas →
          </button>
        </div>
      )}

      {/* ── Empty: no bids yet ──────────────────────────── */}
      {bids.length === 0 && filter === "minhas_ofertas" && (
        <EmptyState
          icon="💼"
          title="Você ainda não fez ofertas"
          description="Navegue pelas cotações disponíveis e faça sua primeira oferta."
          action={{ label: "Ver Cotações Disponíveis", onClick: () => setFilter("disponiveis") }}
        />
      )}

      {/* ── Cards Grid ──────────────────────────────────── */}
      {filteredQuotations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuotations.map((q) => {
            const myBid = filter === "minhas_ofertas"
              ? bids.find((b) => b.quotation_id === q.id)
              : null;
            const statusInfo = QUOTATION_STATUS_LABEL[q.status] ? {
              label: QUOTATION_STATUS_LABEL[q.status],
              cls: q.status === "open"
                ? "bg-blue-100 text-blue-700"
                : q.status === "bidding"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600",
            } : null;

            return (
              <div
                key={q.id}
                className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#2563eb]/30"
              >
                {/* Route */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="truncate">{q.origin_city}/{q.origin_state}</span>
                    <span className="shrink-0 text-[#2563eb]">→</span>
                    <span className="truncate">{q.destination_city}/{q.destination_state}</span>
                  </div>
                </div>

                {/* Cargo info */}
                <div className="mb-3 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {(CARGO_TYPE_LABEL[q.cargo_type] ?? q.cargo_type) || "Carga"}
                    </span>
                    <span className="text-xs">{formatWeight(q.weight_kg)}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs">{formatVolume(q.volume_m3)}</span>
                  </div>
                  {q.cargo_description && (
                    <p className="line-clamp-2 text-xs text-gray-400">{q.cargo_description}</p>
                  )}
                </div>

                {/* Status & Dates */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  {statusInfo && (
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    Coleta: {formatDate(q.pickup_date)}
                    {q.delivery_date && ` → ${formatDate(q.delivery_date)}`}
                  </span>
                </div>

                {/* Action */}
                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-gray-400">
                    #{q.id.slice(0, 8)}
                  </span>

                  {myBid ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(myBid.price)}
                      </span>
                      {BID_STATUS_LABEL[myBid.status] && (
                        <StatusBadge
                          label={BID_STATUS_LABEL[myBid.status].label}
                          cls={BID_STATUS_LABEL[myBid.status].cls}
                        />
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => openBidModal(q)}
                      className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1d4ed8] active:scale-[0.97] shadow-sm"
                    >
                      Fazer Oferta
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Minhas Ofertas: detailed list ────────────────── */}
      {filter === "minhas_ofertas" && bids.length > 0 && (
        <div className="mt-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Histórico de Ofertas ({bids.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Cotação
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Prazo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Veículo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Motorista
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bids.map((b) => {
                    const quotation = quotations.find((q) => q.id === b.quotation_id);
                    const bidStatus = BID_STATUS_LABEL[b.status] ?? {
                      label: b.status,
                      cls: "bg-gray-100 text-gray-600",
                    };
                    const vehicleLabel = b.vehicle
                      ? `${b.vehicle.plate} — ${b.vehicle.model}`
                      : b.vehicle_id || "—";
                    const driverLabel = b.driver?.name ?? "—";

                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {quotation ? (
                            <span className="font-medium text-gray-900">
                              {quotation.origin_city} → {quotation.destination_city}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Cotação removida</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {formatCurrency(b.price)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {b.estimated_days} {b.estimated_days === 1 ? "dia" : "dias"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{vehicleLabel}</td>
                        <td className="px-4 py-3 text-gray-600">{driverLabel}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            label={bidStatus.label}
                            cls={bidStatus.cls}
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-400">
                          {formatDate(b.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border md:hidden">
              {bids.map((b) => {
                const quotation = quotations.find((q) => q.id === b.quotation_id);
                const bidStatus = BID_STATUS_LABEL[b.status] ?? {
                  label: b.status,
                  cls: "bg-gray-100 text-gray-600",
                };
                const vehicleLabel = b.vehicle
                  ? `${b.vehicle.plate} — ${b.vehicle.model}`
                  : b.vehicle_id || "—";
                const driverLabel = b.driver?.name ?? "—";

                return (
                  <div key={b.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        {quotation ? (
                          <p className="font-semibold text-gray-900">
                            {quotation.origin_city} → {quotation.destination_city}
                          </p>
                        ) : (
                          <p className="text-gray-400 italic">Cotação removida</p>
                        )}
                        <p className="text-sm font-bold text-green-600 mt-0.5">
                          {formatCurrency(b.price)}
                        </p>
                      </div>
                      <StatusBadge
                        label={bidStatus.label}
                        cls={bidStatus.cls}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                      <span>Prazo: {b.estimated_days}d</span>
                      <span>Veículo: {vehicleLabel}</span>
                      <span>Motorista: {driverLabel}</span>
                      <span>Data: {formatDate(b.created_at)}</span>
                    </div>
                    {b.notes && (
                      <p className="text-xs text-gray-400 italic">Nota: {b.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Bid Modal ────────────────────────────────────── */}
      {modalQuotation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={closeBidModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Fazer Oferta</h2>
                <p className="text-xs text-gray-500">Preencha os dados da sua proposta</p>
              </div>
              <button
                onClick={closeBidModal}
                disabled={submitting}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Route info banner */}
            <div className="mb-5 rounded-xl bg-blue-50 p-4 border border-blue-100">
              <p className="text-sm font-semibold text-blue-800">
                {modalQuotation.origin_city}/{modalQuotation.origin_state} →{" "}
                {modalQuotation.destination_city}/{modalQuotation.destination_state}
              </p>
              <p className="mt-1 text-xs text-blue-600">
                {(CARGO_TYPE_LABEL[modalQuotation.cargo_type] ?? modalQuotation.cargo_type) || "Carga"} —{" "}
                {formatWeight(modalQuotation.weight_kg)} / {formatVolume(modalQuotation.volume_m3)}
                {modalQuotation.cargo_description && (
                  <span className="block mt-0.5 opacity-75">{modalQuotation.cargo_description}</span>
                )}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Price */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Valor (R$) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={bidForm.price || ""}
                    onChange={(e) =>
                      setBidForm((p) => ({ ...p, price: Number(e.target.value) }))
                    }
                    placeholder="0,00"
                    className="w-full rounded-xl border border-border pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Estimated days */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Prazo (dias úteis) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={bidForm.estimated_days}
                  onChange={(e) =>
                    setBidForm((p) => ({ ...p, estimated_days: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-gray-900 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all"
                />
              </div>

              {/* Vehicle select */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Veículo
                </label>
                <select
                  value={bidForm.vehicle_id}
                  onChange={(e) => setBidForm((p) => ({ ...p, vehicle_id: e.target.value }))}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-gray-900 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all bg-white"
                >
                  <option value="">Selecione um veículo...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} — {v.model} ({VEHICLE_TYPE_LABEL[v.vehicle_type] ?? v.vehicle_type})
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-600">
                    ⚠️ Nenhum veículo disponível. Cadastre veículos na sua frota.
                  </p>
                )}
              </div>

              {/* Driver select */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Motorista
                </label>
                <select
                  value={bidForm.driver_id}
                  onChange={(e) => setBidForm((p) => ({ ...p, driver_id: e.target.value }))}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-gray-900 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all bg-white"
                >
                  <option value="">Selecione um motorista...</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {drivers.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-600">
                    ⚠️ Nenhum motorista disponível. Cadastre motoristas na sua equipe.
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <textarea
                  value={bidForm.notes}
                  onChange={(e) =>
                    setBidForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Informações adicionais sobre a oferta..."
                  rows={3}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={closeBidModal}
                disabled={submitting}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitBid}
                disabled={
                  submitting ||
                  bidForm.price <= 0 ||
                  bidForm.estimated_days <= 0
                }
                className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm shadow-[#2563eb]/20"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  "Enviar Oferta"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cotacoes;
