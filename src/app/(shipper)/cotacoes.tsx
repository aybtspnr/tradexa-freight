import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

/* ─── Types ───────────────────────────────────────────────── */

interface Cotacao {
  id: string;
  shipper_id: string;
  tipo_carga: string;
  descricao: string;
  peso_kg: number;
  volume_m3: number;
  origem_cidade: string;
  origem_estado: string;
  destino_cidade: string;
  destino_estado: string;
  data_coleta: string;
  data_entrega: string;
  refrigerado: boolean;
  perigoso: boolean;
  seguro: boolean;
  status: "aberta" | "com_ofertas" | "fechada";
  ofertas_recebidas: number;
  created_at: string;
}

interface Bid {
  id: string;
  cotacao_id: string;
  carrier_id: string;
  carrier_nome: string;
  preco: number;
  prazo_dias: number;
  veiculo: string;
  observacoes: string;
  status: "pendente" | "aceita" | "recusada";
  created_at: string;
}

type FiltroStatus = "todas" | "aberta" | "com_ofertas" | "fechada";

/* ─── Helpers ────────────────────────────────────────────── */

function loadBids(): Bid[] {
  try {
    const raw = localStorage.getItem("tradexa_freight_bids");
    if (raw) return JSON.parse(raw) as Bid[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveBids(list: Bid[]) {
  localStorage.setItem("tradexa_freight_bids", JSON.stringify(list));
}

function mapQuotationToCotacao(q: any): Cotacao {
  return {
    id: q.id,
    shipper_id: q.shipper_id,
    tipo_carga: q.cargo_type ?? "",
    descricao: q.cargo_description ?? "",
    peso_kg: Number(q.weight_kg) || 0,
    volume_m3: Number(q.volume_m3) || 0,
    origem_cidade: q.origin_city ?? "",
    origem_estado: q.origin_state ?? "",
    destino_cidade: q.destination_city ?? "",
    destino_estado: q.destination_state ?? "",
    data_coleta: q.pickup_date ?? "",
    data_entrega: q.delivery_date ?? "",
    refrigerado: false,
    perigoso: false,
    seguro: false,
    status: q.status ?? "aberta",
    ofertas_recebidas: 0,
    created_at: q.created_at ?? "",
  };
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

const TIPO_CARGA_LABEL: Record<string, string> = {
  caixa: "Caixa",
  pallet: "Pallet",
  container: "Container",
  granel: "Granel",
};

const STATUS_COLORS: Record<string, string> = {
  aberta: "bg-blue-100 text-blue-700",
  com_ofertas: "bg-yellow-100 text-yellow-700",
  fechada: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  aberta: "Aberta",
  com_ofertas: "Com Ofertas",
  fechada: "Fechada",
};

/* ─── Component ──────────────────────────────────────────── */

export function Cotacoes() {
  const profile = useAuthStore((s) => s.profile);

  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [filtro, setFiltro] = useState<FiltroStatus>("todas");
  const [ofertasModal, setOfertasModal] = useState<{
    cotacao: Cotacao;
    bids: Bid[];
  } | null>(null);
  const [aceitando, setAceitando] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    (supabase as any)
      .from("quotations")
      .select("*")
      .eq("shipper_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }: { data: any; error: any }) => {
        if (!error && data) {
          setCotacoes(data.map(mapQuotationToCotacao));
        } else if (error) {
          console.error("Failed to load quotations:", error);
        }
      });
  }, [profile?.id]);

  const refresh = useCallback(() => {
    if (!profile?.id) return;
    (supabase as any)
      .from("quotations")
      .select("*")
      .eq("shipper_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }: { data: any; error: any }) => {
        if (!error && data) {
          setCotacoes(data.map(mapQuotationToCotacao));
        }
      });
  }, [profile]);

  const filtered = useMemo(
    () => cotacoes.filter((c) => filtro === "todas" || c.status === filtro),
    [cotacoes, filtro],
  );

  /* ─── View offers ──────────────────────────────── */

  const handleVerOfertas = useCallback((cotacao: Cotacao) => {
    const allBids = loadBids();
    const bids = allBids.filter((b) => b.cotacao_id === cotacao.id);
    setOfertasModal({ cotacao, bids });
  }, []);

  /* ─── Accept offer ─────────────────────────────── */

  const handleAceitarOferta = useCallback(
    async (bid: Bid) => {
      if (!profile?.id) return;
      if (!window.confirm(`Aceitar oferta de ${bid.carrier_nome} no valor de R$ ${bid.preco.toFixed(2)}?`))
        return;

      setAceitando(true);

      // Find the cotação from state (already loaded from Supabase)
      const cotacao = cotacoes.find((c) => c.id === bid.cotacao_id);
      if (!cotacao) {
        setAceitando(false);
        return;
      }

      // Update bid status (localStorage for now — not yet on Supabase)
      const allBids = loadBids();
      const updatedBids = allBids.map((b) =>
        b.id === bid.id ? { ...b, status: "aceita" as const } : b,
      );
      saveBids(updatedBids);

      // Reject other bids for this cotação
      const finalBids = updatedBids.map((b) =>
        b.cotacao_id === bid.cotacao_id && b.id !== bid.id
          ? { ...b, status: "recusada" as const }
          : b,
      );
      saveBids(finalBids);

      // Update quotation status in Supabase
      await (supabase as any)
        .from("quotations")
        .update({ status: "closed" })
        .eq("id", cotacao.id);

      // Create order in Supabase
      await (supabase as any)
        .from("orders")
        .insert({
          quotation_id: cotacao.id,
          shipper_id: profile.id,
          carrier_id: bid.carrier_id,
          bid_id: bid.id,
          price: bid.preco,
          status: "ativo",
          pickup_date: cotacao.data_coleta,
          delivery_date: cotacao.data_entrega,
          notes: `Prazo: ${bid.prazo_dias} dias úteis. Veículo: ${bid.veiculo}. ${bid.observacoes}`,
        });

      setAceitando(false);
      setOfertasModal(null);
      refresh();
    },
    [cotacoes, profile, refresh],
  );

  /* ─── Render ───────────────────────────────────── */

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotações</h1>
          <p className="text-gray-500">Gerencie suas solicitações de frete</p>
        </div>
        <Link
          to="/shipper/cotar"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark no-underline"
        >
          ＋ Nova Cotação
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["todas", "aberta", "com_ofertas", "fechada"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filtro === f
                ? "bg-primary text-white"
                : "border border-border bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "todas"
              ? "Todas"
              : f === "aberta"
                ? "Abertas"
                : f === "com_ofertas"
                  ? "Com Ofertas"
                  : "Fechadas"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <th className="px-6 py-3">Origem → Destino</th>
                <th className="px-6 py-3">Carga</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Ofertas</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Nenhuma cotação encontrada.
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {c.origem_cidade}/{c.origem_estado} → {c.destino_cidade}/{c.destino_estado}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <span className="block">{TIPO_CARGA_LABEL[c.tipo_carga] ?? c.tipo_carga}</span>
                    <span className="text-xs text-gray-400">{c.peso_kg} kg / {c.volume_m3} m³</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[c.status]
                      }`}
                    >
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{c.ofertas_recebidas}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDateTime(c.created_at)}</td>
                  <td className="px-6 py-4">
                    {c.status !== "fechada" && (
                      <button
                        onClick={() => handleVerOfertas(c)}
                        className="rounded-md border border-primary px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                      >
                        Ver Ofertas
                      </button>
                    )}
                    {c.status === "fechada" && (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Offers Modal ──────────────────────────── */}
      {ofertasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Ofertas — {ofertasModal.cotacao.origem_cidade}/{ofertasModal.cotacao.origem_estado} →{" "}
                {ofertasModal.cotacao.destino_cidade}/{ofertasModal.cotacao.destino_estado}
              </h2>
              <button
                onClick={() => setOfertasModal(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Carga info */}
            <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              {TIPO_CARGA_LABEL[ofertasModal.cotacao.tipo_carga] ?? ofertasModal.cotacao.tipo_carga} —{" "}
              {ofertasModal.cotacao.peso_kg} kg — {ofertasModal.cotacao.volume_m3} m³
            </div>

            {ofertasModal.bids.length === 0 && (
              <div className="py-8 text-center text-gray-400">
                Nenhuma oferta recebida ainda.
              </div>
            )}

            <div className="max-h-[50vh] space-y-3 overflow-y-auto">
              {ofertasModal.bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`rounded-lg border-2 p-4 transition-colors ${
                    bid.status === "aceita"
                      ? "border-green-400 bg-green-50"
                      : bid.status === "recusada"
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{bid.carrier_nome}</h3>
                      <p className="text-xs text-gray-500">
                        Oferta em {formatDateTime(bid.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-700">
                        R$ {bid.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">{bid.prazo_dias} dias úteis</p>
                    </div>
                  </div>

                  {bid.veiculo && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Veículo:</span> {bid.veiculo}
                    </p>
                  )}

                  {bid.observacoes && (
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Obs:</span> {bid.observacoes}
                    </p>
                  )}

                  {bid.status === "pendente" && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleAceitarOferta(bid)}
                        disabled={aceitando}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {aceitando ? "Aceitando..." : "✓ Aceitar Proposta"}
                      </button>
                    </div>
                  )}

                  {bid.status === "aceita" && (
                    <div className="mt-2">
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        ✅ Proposta Aceita
                      </span>
                    </div>
                  )}

                  {bid.status === "recusada" && (
                    <div className="mt-2">
                      <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                        Recusada
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOfertasModal(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cotacoes;
