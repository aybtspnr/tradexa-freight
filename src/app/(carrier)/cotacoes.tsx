import { useCallback, useMemo, useState } from "react";
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

interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  ano: number;
  capacidade_kg: number;
  capacidade_m3: number;
  tipo: string;
  status: string;
}

/* ─── Helpers ────────────────────────────────────────────── */

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function loadCotacoes(): Cotacao[] {
  try {
    const raw = localStorage.getItem("tradexa_freight_quotations");
    if (raw) return JSON.parse(raw) as Cotacao[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveCotacoes(list: Cotacao[]) {
  localStorage.setItem("tradexa_freight_quotations", JSON.stringify(list));
}

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

function loadVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem("tradexa_frota");
    if (raw) return JSON.parse(raw) as Vehicle[];
  } catch {
    /* ignore */
  }
  return [];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("T")) {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  }
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}


const TIPO_CARGA_LABEL: Record<string, string> = {
  caixa: "Caixa",
  pallet: "Pallet",
  container: "Container",
  granel: "Granel",
};

const TIPO_VEICULO_LABEL: Record<string, string> = {
  caminhao: "Caminhão",
  van: "Van",
  carreta: "Carreta",
  utililitario: "Utilitário",
  bitrem: "Bitrem",
  rodotrem: "Rodotrem",
};

/* ─── Component ──────────────────────────────────────────── */

export function Cotacoes() {
  const profile = useAuthStore((s) => s.profile);

  const [cotacoes, setCotacoes] = useState<Cotacao[]>(() =>
    loadCotacoes().filter((c) => c.status === "aberta" || c.status === "com_ofertas"),
  );
  const [filtro, setFiltro] = useState<"disponiveis" | "fiz_oferta">("disponiveis");
  const [modalOpen, setModalOpen] = useState<Cotacao | null>(null);
  const [bidForm, setBidForm] = useState({
    preco: 0,
    prazo_dias: 3,
    veiculo: "",
    observacoes: "",
  });
  const [enviando, setEnviando] = useState(false);

  const carrierId = profile?.id;
  const carrierNome = profile?.name ?? "Minha Transportadora";

  const refresh = useCallback(() => {
    setCotacoes(
      loadCotacoes().filter((c) => c.status === "aberta" || c.status === "com_ofertas"),
    );
  }, []);

  /* ─── Filter logic ─────────────────────────────── */

  const allBidsForMe = useMemo(() => {
    if (!carrierId) return [];
    return loadBids().filter((b) => b.carrier_id === carrierId);
  }, [carrierId]);

  const cotacaoIdsQueFizOferta = useMemo(
    () => new Set(allBidsForMe.map((b) => b.cotacao_id)),
    [allBidsForMe],
  );

  const filtered = useMemo(() => {
    if (filtro === "fiz_oferta") {
      return cotacoes.filter((c) => cotacaoIdsQueFizOferta.has(c.id));
    }
    return cotacoes.filter((c) => !cotacaoIdsQueFizOferta.has(c.id));
  }, [cotacoes, filtro, cotacaoIdsQueFizOferta]);

  /* ─── Available vehicles ───────────────────────── */

  const vehicles = useMemo(() => {
    return loadVehicles().filter((v) => v.status === "disponivel");
  }, []);

  /* ─── Open bid modal ───────────────────────────── */

  const handleFazerOferta = useCallback((cotacao: Cotacao) => {
    setBidForm({
      preco: Math.round(cotacao.peso_kg * 0.5 * 100) / 100, // suggested price based on weight
      prazo_dias: 3,
      veiculo: "",
      observacoes: "",
    });
    setModalOpen(cotacao);
  }, []);

  /* ─── Submit bid ───────────────────────────────── */

  const handleEnviarOferta = useCallback(() => {
    if (!carrierId || !modalOpen) return;
    if (bidForm.preco <= 0 || bidForm.prazo_dias <= 0) return;

    setEnviando(true);

    const novaBid: Bid = {
      id: generateId(),
      cotacao_id: modalOpen.id,
      carrier_id: carrierId,
      carrier_nome: carrierNome,
      preco: bidForm.preco,
      prazo_dias: bidForm.prazo_dias,
      veiculo: bidForm.veiculo,
      observacoes: bidForm.observacoes,
      status: "pendente",
      created_at: new Date().toISOString(),
    };

    const todas = loadBids();
    saveBids([novaBid, ...todas]);

    // Update cotação: increment ofertas_recebidas and update status
    const allCotacoes = loadCotacoes();
    const updated = allCotacoes.map((c) =>
      c.id === modalOpen.id
        ? {
            ...c,
            ofertas_recebidas: c.ofertas_recebidas + 1,
            status: ("com_ofertas" as const),
          }
        : c,
    );
    saveCotacoes(updated);

    setEnviando(false);
    setModalOpen(null);
    refresh();
  }, [carrierId, carrierNome, modalOpen, bidForm, refresh]);

  /* ─── Render ───────────────────────────────────── */

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cotações Disponíveis</h1>
        <p className="text-gray-500">Veja as solicitações de frete e faça suas ofertas</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro("disponiveis")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filtro === "disponiveis"
              ? "bg-primary text-white"
              : "border border-border bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Disponíveis
        </button>
        <button
          onClick={() => setFiltro("fiz_oferta")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filtro === "fiz_oferta"
              ? "bg-primary text-white"
              : "border border-border bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Fiz Oferta ({allBidsForMe.length})
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400">
            {filtro === "disponiveis"
              ? "Nenhuma cotação disponível no momento."
              : "Você ainda não fez ofertas."}
          </div>
        )}

        {filtered.map((c) => {
          const myBid = filtro === "fiz_oferta"
            ? allBidsForMe.find((b) => b.cotacao_id === c.id)
            : null;

          return (
            <div
              key={c.id}
              className="flex flex-col rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* Route */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <span>{c.origem_cidade}/{c.origem_estado}</span>
                  <span className="text-gray-400">→</span>
                  <span>{c.destino_cidade}/{c.destino_estado}</span>
                </div>
              </div>

              {/* Cargo info */}
              <div className="mb-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {TIPO_CARGA_LABEL[c.tipo_carga] ?? c.tipo_carga}
                  </span>
                  <span>{c.peso_kg} kg</span>
                  <span>{c.volume_m3} m³</span>
                </div>
                <p className="line-clamp-2 text-xs text-gray-500">{c.descricao}</p>
              </div>

              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {c.refrigerado && (
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    🧊 Refrigerado
                  </span>
                )}
                {c.perigoso && (
                  <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    ☢️ Perigoso
                  </span>
                )}
                {c.seguro && (
                  <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    🛡️ Seguro
                  </span>
                )}
              </div>

              {/* Dates */}
              <div className="mb-4 text-xs text-gray-400">
                Coleta: {formatDate(c.data_coleta)} | Entrega: {formatDate(c.data_entrega)}
              </div>

              {/* Spacer + Action */}
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {c.ofertas_recebidas} oferta{c.ofertas_recebidas !== 1 ? "s" : ""}
                </span>

                {myBid ? (
                  <div className="text-right">
                    <span className="block text-sm font-semibold text-green-700">
                      R$ {myBid.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        myBid.status === "aceita"
                          ? "bg-green-100 text-green-700"
                          : myBid.status === "recusada"
                            ? "bg-gray-100 text-gray-500"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {myBid.status === "aceita"
                        ? "✅ Aceita"
                        : myBid.status === "recusada"
                          ? "Recusada"
                          : "⏳ Pendente"}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleFazerOferta(c)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                  >
                    Fazer Oferta
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bid Modal ──────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Fazer Oferta</h2>
              <button
                onClick={() => setModalOpen(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Route info */}
            <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              {modalOpen.origem_cidade}/{modalOpen.origem_estado} →{" "}
              {modalOpen.destino_cidade}/{modalOpen.destino_estado}
              <br />
              <span className="text-xs">
                {TIPO_CARGA_LABEL[modalOpen.tipo_carga] ?? modalOpen.tipo_carga} —{" "}
                {modalOpen.peso_kg} kg / {modalOpen.volume_m3} m³
              </span>
            </div>

            <div className="space-y-4">
              {/* Preço */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={bidForm.preco || ""}
                  onChange={(e) =>
                    setBidForm((p) => ({ ...p, preco: Number(e.target.value) }))
                  }
                  placeholder="Ex: 2500.00"
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Prazo */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Prazo (dias úteis)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={bidForm.prazo_dias}
                  onChange={(e) =>
                    setBidForm((p) => ({ ...p, prazo_dias: Number(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Veículo */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Veículo (opcional)
                </label>
                <select
                  value={bidForm.veiculo}
                  onChange={(e) => setBidForm((p) => ({ ...p, veiculo: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecione um veículo...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={`${v.placa} — ${v.modelo}`}>
                      {v.placa} — {v.modelo} ({TIPO_VEICULO_LABEL[v.tipo] ?? v.tipo})
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    Nenhum veículo disponível cadastrado.
                  </p>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Observações (opcional)
                </label>
                <textarea
                  value={bidForm.observacoes}
                  onChange={(e) =>
                    setBidForm((p) => ({ ...p, observacoes: e.target.value }))
                  }
                  placeholder="Informações adicionais sobre a oferta..."
                  rows={3}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setModalOpen(null)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarOferta}
                disabled={enviando || bidForm.preco <= 0 || bidForm.prazo_dias <= 0}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enviando ? "Enviando..." : "Enviar Oferta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cotacoes;
