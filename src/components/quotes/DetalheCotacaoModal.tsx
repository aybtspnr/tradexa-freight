import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { AutoQuotes } from "@/components/freight/AutoQuotes";
import { MapRoute } from "@/components/map/MapRoute";
import { usePlan } from "@/hooks/usePlan";
import { formatNcmCode, type NcmInfo } from "@/utils/ncmCompliance";

interface Props {
  quotationId: string;
  userId: string;
  isCarrier: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

interface Bid {
  id: string;
  carrier_id: string;
  price: number;
  estimated_days: number | null;
  notes: string | null;
  status: string | null;
  created_at: string | null;
  quotation_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
}

interface CarrierCertStatus {
  carrierId: string;
  carrierName: string;
  isFullyCompliant: boolean;
  missingCerts: string[];
  certs: Set<string>;
  score: number;
}

interface Quotation {
  id: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  cargo_description: string | null;
  weight_kg: number | null;
  volume_m3: number | null;
  cargo_type: string | null;
  pickup_date: string | null;
  status: string | null;
  created_at: string | null;
  delivery_date: string | null;
}

export function DetalheCotacaoModal({ quotationId, userId, isCarrier, onClose, onUpdated }: Props) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [ncmInfo, setNcmInfo] = useState<NcmInfo | null>(null);
  const [carrierCertStatus, setCarrierCertStatus] = useState<Map<string, CarrierCertStatus>>(new Map());
  const [expandedCompliance, setExpandedCompliance] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [quotationId]);

  async function loadData() {
    setLoading(true);

    const { data: q } = await (supabase as any)
      .from("quotations")
      .select("*, ncm_classifications(*)")
      .eq("id", quotationId)
      .single();

    const { data: b } = await (supabase as any)
      .from("quotation_bids")
      .select("*")
      .eq("quotation_id", quotationId)
      .order("price", { ascending: true });

    setQuotation(q);
    // Load NCM info if available
    const ncmData = (q as any)?.ncm_classifications as NcmInfo | null;
    if (ncmData) {
      setNcmInfo(ncmData);
    }
    setBids(b ?? []);
    setLoading(false);

    // Load carrier certifications for NCM compliance
    if (ncmData && b && b.length > 0) {
      loadCarrierCompliance(b, ncmData, (q as any)?.ncm_classification_id);
    }
  }

  async function loadCarrierCompliance(bidList: Bid[], ncm: NcmInfo, ncmClassificationId?: string) {
    const carrierIds = [...new Set(bidList.map((bid) => bid.carrier_id))];

    // Get carrier names and certs
    const { data: profiles } = await (supabase as any)
      .from("profiles")
      .select("id, name")
      .in("id", carrierIds);

    const profileMap = new Map<string, string>((profiles ?? []).map((p: any) => [p.id, p.name || p.email || "Transportadora"]));

    // Get certifications for each carrier for this NCM
    const certsMap = new Map<string, CarrierCertStatus>();

    for (const cId of carrierIds) {
      // Check if there's a carrier_ncm_certifications table entry
      const { data: certs } = await (supabase as any)
        .from("carrier_ncm_certifications")
        .select("certification_type")
        .eq("carrier_id", cId)
        .eq("ncm_classification_id", ncmClassificationId as string);

      const carrierCerts = new Set<string>((certs ?? []).map((c: any) => c.certification_type));

      const missing: string[] = [];
      if (ncm.requires_antt && !carrierCerts.has("antt")) missing.push("ANTT");
      if (ncm.requires_anvisa && !carrierCerts.has("anvisa")) missing.push("ANVISA");
      if (ncm.requires_exercito && !carrierCerts.has("exercito")) missing.push("Exército");
      if (ncm.requires_ibama && !carrierCerts.has("ibama")) missing.push("IBAMA");
      if (ncm.requires_escort && !carrierCerts.has("escort")) missing.push("Escolta");
      if (ncm.requires_tracking && !carrierCerts.has("tracking")) missing.push("Rastreamento");
      if (ncm.requires_insurance && !carrierCerts.has("insurance")) missing.push("Seguro");

      const totalRequirements = [
        ncm.requires_antt, ncm.requires_anvisa, ncm.requires_exercito,
        ncm.requires_ibama, ncm.requires_escort, ncm.requires_tracking,
        ncm.requires_insurance,
      ].filter(Boolean).length;

      const score = totalRequirements > 0
        ? Math.round(((totalRequirements - missing.length) / totalRequirements) * 100)
        : 100;

      certsMap.set(cId, {
        carrierId: cId,
        carrierName: profileMap.get(cId) || "Transportadora",
        isFullyCompliant: missing.length === 0,
        missingCerts: missing,
        certs: carrierCerts,
        score,
      });
    }

    setCarrierCertStatus(certsMap);
  }

  async function handleAcceptBid(bidId: string, carrierId: string, price: number) {
    const { error } = await (supabase as any).from("orders").insert({
      quotation_id: quotationId,
      shipper_id: userId,
      carrier_id: carrierId,
      bid_id: bidId,
      price,
      status: "pending",
    });

    if (error) { alert("Erro: " + error.message); return; }

    await (supabase as any).from("quotations").update({ status: "closed" }).eq("id", quotationId);
    await (supabase as any).from("quotation_bids").update({ status: "accepted" }).eq("id", bidId);
    await (supabase as any).from("quotation_bids").update({ status: "rejected" }).eq("quotation_id", quotationId).neq("id", bidId);
    onUpdated();
  }

  async function handleCancel() {
    await (supabase as any).from("quotations").update({ status: "cancelled" }).eq("id", quotationId);
    onUpdated();
  }

  if (loading || !quotation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="rounded-xl bg-white p-8 text-sm text-gray-500">Carregando...</div>
      </div>
    );
  }

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const myBid = bids.find((b) => b.carrier_id === userId);
  const { canAccess } = usePlan();
  const hasAutoQuote = canAccess("auto_quote");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="mt-8 w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Detalhes da cotação</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4 p-6">
          {/* Route info */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-lg font-semibold text-gray-900">
              {quotation.origin_city}/{quotation.origin_state} → {quotation.destination_city}/{quotation.destination_state}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
              {quotation.weight_kg && <span>📦 {quotation.weight_kg} kg</span>}
              {quotation.volume_m3 && <span>📐 {quotation.volume_m3} m³</span>}
              {quotation.cargo_type && <span>🏷️ {quotation.cargo_type}</span>}
            </div>
            {quotation.pickup_date && (
              <p className="mt-1 text-sm text-gray-500">📅 {new Date(quotation.pickup_date).toLocaleDateString("pt-BR")}</p>
            )}
            {quotation.cargo_description && (
              <p className="mt-2 text-sm text-gray-600">{quotation.cargo_description}</p>
            )}
          </div>

          {/* Route Map */}
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <MapRoute
              originCity={quotation.origin_city}
              originState={quotation.origin_state}
              destCity={quotation.destination_city}
              destState={quotation.destination_state}
              height="200px"
            />
          </div>

          {/* NCM Compliance */}
          {ncmInfo && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏷️</span>
                <h3 className="text-sm font-semibold text-gray-900">Classificação NCM</h3>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">
                  {formatNcmCode(ncmInfo.ncm_code)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  ncmInfo.risk_level === "low" ? "bg-green-100 text-green-700" :
                  ncmInfo.risk_level === "medium" ? "bg-yellow-100 text-yellow-700" :
                  ncmInfo.risk_level === "high" ? "bg-orange-100 text-orange-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {ncmInfo.risk_level === "low" ? "Baixo risco" :
                   ncmInfo.risk_level === "medium" ? "Risco médio" :
                   ncmInfo.risk_level === "high" ? "Alto risco" : "Risco crítico"}
                </span>
                <span className="text-xs text-gray-400">×{ncmInfo.value_density_factor.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{ncmInfo.description}</p>

              {/* Requirements badges */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ncmInfo.requires_antt && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">ANTT</span>}
                {ncmInfo.requires_anvisa && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">ANVISA</span>}
                {ncmInfo.requires_exercito && <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-white">Exército</span>}
                {ncmInfo.requires_ibama && <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">IBAMA</span>}
                {ncmInfo.requires_tracking && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">📍Tracking</span>}
                {ncmInfo.requires_escort && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">🔫Escolta</span>}
                {ncmInfo.requires_insurance && <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">🛡️Seguro</span>}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              quotation.status === "open" ? "bg-blue-100 text-blue-800" :
              quotation.status === "bidding" ? "bg-amber-100 text-amber-800" :
              quotation.status === "closed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
            }`}>
              {quotation.status === "open" ? "Aberta" :
               quotation.status === "bidding" ? "Em disputa" :
               quotation.status === "closed" ? "Fechada" : "Cancelada"}
            </span>
            {!isCarrier && quotation.status === "open" && (
              <button onClick={handleCancel} className="text-xs text-red-500 hover:text-red-700">Cancelar cotação</button>
            )}
          </div>

          {/* ⚡ Auto quotes (shipper only, when open/bidding) */}
          {!isCarrier && quotation.status !== "closed" && quotation.status !== "cancelled" && hasAutoQuote && (
            <AutoQuotes
              originCity={quotation.origin_city}
              originState={quotation.origin_state}
              destCity={quotation.destination_city}
              destState={quotation.destination_state}
              weightKg={quotation.weight_kg}
              volumeM3={quotation.volume_m3}
              cargoType={quotation.cargo_type}
              quotationId={quotationId}
              userId={userId}
              ncmPriceMultiplier={ncmInfo?.value_density_factor}
              ncmCode={ncmInfo ? ncmInfo.ncm_code.replace(/\./g, "").slice(0, 6) : undefined}
            />
          )}
          {!isCarrier && quotation.status !== "closed" && quotation.status !== "cancelled" && !hasAutoQuote && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
              <span className="text-lg">⚡</span>
              <p className="mt-1 text-sm text-gray-600">Cotações instantâneas disponíveis no plano Pro</p>
              <Link to="/planos" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">Fazer upgrade →</Link>
            </div>
          )}

          {/* My bid (carrier view) */}
          {isCarrier && myBid && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-800">✓ Seu lance: {fmt(myBid.price)}</p>
              {myBid.estimated_days && <p className="text-xs text-blue-600">{myBid.estimated_days} dias</p>}
            </div>
          )}

          {/* Bids */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Propostas ({bids.length})
            </h3>
            {bids.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">
                {isCarrier ? "Seja o primeiro a dar um lance!" : "Nenhuma proposta ainda."}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {bids.map((bid) => (
                  <div key={bid.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">{fmt(bid.price)}</p>
                      {bid.estimated_days && <span className="text-sm text-gray-500">{bid.estimated_days} dias</span>}
                    </div>
                    {bid.notes && <p className="mt-1 text-sm text-gray-600">{bid.notes}</p>}

                    {/* NCM Compliance Score */}
                    {ncmInfo && carrierCertStatus.has(bid.carrier_id) && (
                      <div className="mt-2">
                        <button
                          onClick={() => setExpandedCompliance(expandedCompliance === bid.carrier_id ? null : bid.carrier_id)}
                          className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-left text-xs transition-colors hover:bg-gray-100"
                        >
                          <span className="flex items-center gap-2">
                            {(() => {
                              const status = carrierCertStatus.get(bid.carrier_id)!;
                              if (status.isFullyCompliant) return <span className="text-green-600">✅ Compliance total</span>;
                              if (status.score >= 50) return <span className="text-amber-600">⚠️ Compliance parcial</span>;
                              return <span className="text-red-600">🚫 Sem compliance</span>;
                            })()}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{carrierCertStatus.get(bid.carrier_id)!.score}%</span>
                            <svg className={`h-4 w-4 text-gray-400 transition-transform ${expandedCompliance === bid.carrier_id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                          </span>
                        </button>
                        {expandedCompliance === bid.carrier_id && (
                          <div className="mt-1 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs">
                            {carrierCertStatus.get(bid.carrier_id)!.isFullyCompliant ? (
                              <p className="text-green-700">✅ Possui todas as certificações exigidas para este NCM.</p>
                            ) : (
                              <>
                                <p className="text-gray-700">Certificações pendentes:</p>
                                <ul className="mt-1 list-inside list-disc space-y-0.5 text-gray-500">
                                  {carrierCertStatus.get(bid.carrier_id)!.missingCerts.map((c, j) => (
                                    <li key={j}>{c}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {bid.created_at ? new Date(bid.created_at).toLocaleString("pt-BR") : "—"}
                      </span>
                      {!isCarrier && quotation.status !== "closed" && bid.status === "pending" && (
                        <button onClick={() => handleAcceptBid(bid.id, bid.carrier_id, bid.price)}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                          Aceitar proposta
                        </button>
                      )}
                      {bid.status === "accepted" && <span className="text-xs font-medium text-green-600">✓ Aceita</span>}
                      {bid.status === "rejected" && <span className="text-xs text-gray-400">Recusada</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
