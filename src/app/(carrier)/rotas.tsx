import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  MapPin,
  ArrowRight,
  Pencil,
  Trash2,
  X,
  Navigation,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface Rota {
  id: string;
  cidade_origem: string;
  estado_origem: string;
  cidade_destino: string;
  estado_destino: string;
  distancia_km: number;
  ativa: boolean;
}

interface Cidade {
  nome: string;
  estado: string;
  lat: number;
  lon: number;
}

// ---------------------------------------------------------------------------
// 20 principais cidades brasileiras
// ---------------------------------------------------------------------------

const CIDADES: Cidade[] = [
  { nome: "São Paulo", estado: "SP", lat: -23.5505, lon: -46.6333 },
  { nome: "Rio de Janeiro", estado: "RJ", lat: -22.9068, lon: -43.1729 },
  { nome: "Belo Horizonte", estado: "MG", lat: -19.9167, lon: -43.9345 },
  { nome: "Brasília", estado: "DF", lat: -15.7975, lon: -47.8919 },
  { nome: "Salvador", estado: "BA", lat: -12.9714, lon: -38.5014 },
  { nome: "Fortaleza", estado: "CE", lat: -3.7172, lon: -38.5433 },
  { nome: "Recife", estado: "PE", lat: -8.0476, lon: -34.877 },
  { nome: "Curitiba", estado: "PR", lat: -25.429, lon: -49.2671 },
  { nome: "Porto Alegre", estado: "RS", lat: -30.0346, lon: -51.2177 },
  { nome: "Manaus", estado: "AM", lat: -3.119, lon: -60.0217 },
  { nome: "Belém", estado: "PA", lat: -1.4558, lon: -48.4902 },
  { nome: "Goiânia", estado: "GO", lat: -16.6869, lon: -49.2648 },
  { nome: "Vitória", estado: "ES", lat: -20.3155, lon: -40.3128 },
  { nome: "Florianópolis", estado: "SC", lat: -27.5954, lon: -48.5482 },
  { nome: "Campo Grande", estado: "MS", lat: -20.4697, lon: -54.6201 },
  { nome: "Cuiabá", estado: "MT", lat: -15.601, lon: -56.0974 },
  { nome: "Natal", estado: "RN", lat: -5.7793, lon: -35.2009 },
  { nome: "João Pessoa", estado: "PB", lat: -7.115, lon: -34.861 },
  { nome: "São Luís", estado: "MA", lat: -2.5387, lon: -44.2825 },
  { nome: "Teresina", estado: "PI", lat: -5.0892, lon: -42.8019 },
];

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function haversineKm(origem: Cidade, destino: Cidade): number {
  const R = 6371; // raio da Terra em km
  const dLat = ((destino.lat - origem.lat) * Math.PI) / 180;
  const dLon = ((destino.lon - origem.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((origem.lat * Math.PI) / 180) *
      Math.cos((destino.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatarDistancia(km: number): string {
  return km.toLocaleString("pt-BR") + " km";
}

// ---------------------------------------------------------------------------
// Estado inicial do formulário
// ---------------------------------------------------------------------------

interface FormRota {
  cidade_origem: string;
  estado_origem: string;
  cidade_destino: string;
  estado_destino: string;
  distancia_km: number;
}

const EMPTY_FORM: FormRota = {
  cidade_origem: "",
  estado_origem: "",
  cidade_destino: "",
  estado_destino: "",
  distancia_km: 0,
};

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function Rotas() {
  const profile = useAuthStore((s) => s.profile);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormRota>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // -----------------------------------------------------------------------
  // Carregar rotas do banco
  // -----------------------------------------------------------------------

  const loadRotas = useCallback(async () => {
    if (!profile?.id) {
      setRotas([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("carrier_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar rotas:", error);
      setRotas([]);
      setLoading(false);
      return;
    }

    setRotas(
      (data ?? []).map((r) => ({
        id: r.id,
        cidade_origem: r.origin_city,
        estado_origem: r.origin_state,
        cidade_destino: r.destination_city,
        estado_destino: r.destination_state,
        distancia_km: r.distance_km ?? 0,
        ativa: r.active ?? true,
      })),
    );
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    loadRotas();
  }, [loadRotas]);

  // -----------------------------------------------------------------------
  // Abrir / fechar modal
  // -----------------------------------------------------------------------

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((rota: Rota) => {
    setEditingId(rota.id);
    setForm({
      cidade_origem: rota.cidade_origem,
      estado_origem: rota.estado_origem,
      cidade_destino: rota.cidade_destino,
      estado_destino: rota.estado_destino,
      distancia_km: rota.distancia_km,
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }, []);

  // -----------------------------------------------------------------------
  // Distância calculada automaticamente (exibida como sugestão)
  // -----------------------------------------------------------------------

  const distanciaCalculada = (() => {
    const origem = CIDADES.find(
      (c) => c.nome === form.cidade_origem && c.estado === form.estado_origem,
    );
    const destino = CIDADES.find(
      (c) => c.nome === form.cidade_destino && c.estado === form.estado_destino,
    );
    if (!origem || !destino) return null;
    if (origem.nome === destino.nome && origem.estado === destino.estado)
      return 0;
    return haversineKm(origem, destino);
  })();

  // -----------------------------------------------------------------------
  // Salvar (criar ou editar)
  // -----------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    if (!profile?.id) return;
    if (
      !form.cidade_origem ||
      !form.estado_origem ||
      !form.cidade_destino ||
      !form.estado_destino
    )
      return;

    // Impede origem == destino
    if (
      form.cidade_origem === form.cidade_destino &&
      form.estado_origem === form.estado_destino
    )
      return;

    const distancia = form.distancia_km > 0 ? form.distancia_km : (distanciaCalculada ?? 0);

    setSaving(true);

    const record = {
      carrier_id: profile.id,
      origin_city: form.cidade_origem,
      origin_state: form.estado_origem,
      destination_city: form.cidade_destino,
      destination_state: form.estado_destino,
      distance_km: distancia,
      active: true,
    };

    if (editingId) {
      const { error } = await supabase
        .from("routes")
        .update(record)
        .eq("id", editingId);
      if (error) {
        console.error("Erro ao atualizar rota:", error);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("routes").insert(record);
      if (error) {
        console.error("Erro ao cadastrar rota:", error);
        setSaving(false);
        return;
      }
    }

    await loadRotas();
    setSaving(false);
    closeModal();
  }, [form, editingId, profile?.id, distanciaCalculada, loadRotas, closeModal]);

  // -----------------------------------------------------------------------
  // Toggle ativar / desativar
  // -----------------------------------------------------------------------

  const handleToggle = useCallback(
    async (rota: Rota) => {
      const { error } = await supabase
        .from("routes")
        .update({ active: !rota.ativa })
        .eq("id", rota.id);
      if (error) {
        console.error("Erro ao alterar status:", error);
        return;
      }
      await loadRotas();
    },
    [loadRotas],
  );

  // -----------------------------------------------------------------------
  // Excluir
  // -----------------------------------------------------------------------

  const handleExcluir = useCallback(
    async (rota: Rota) => {
      if (
        !window.confirm(
          `Excluir a rota ${rota.cidade_origem} → ${rota.cidade_destino}?`,
        )
      )
        return;
      const { error } = await supabase.from("routes").delete().eq("id", rota.id);
      if (error) {
        console.error("Erro ao excluir rota:", error);
        return;
      }
      await loadRotas();
    },
    [loadRotas],
  );

  // -----------------------------------------------------------------------
  // Contadores
  // -----------------------------------------------------------------------

  const ativas = rotas.filter((r) => r.ativa).length;
  const inativas = rotas.filter((r) => !r.ativa).length;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ================================================================ */}
      {/* Header                                                            */}
      {/* ================================================================ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F111A]">Rotas</h1>
          <p className="text-sm text-[#5E6278]">
            Gerencie as rotas da transportadora
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!loading && (
            <span className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1 text-xs font-semibold text-[#5E6278]">
              {rotas.length} rota{rotas.length !== 1 ? "s" : ""}
              {ativas > 0 && (
                <span className="ml-1 text-emerald-600">· {ativas} ativa{ativas !== 1 ? "s" : ""}</span>
              )}
            </span>
          )}
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nova Rota
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Status summary chips                                              */}
      {/* ================================================================ */}
      {!loading && rotas.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {ativas} Ativa{ativas !== 1 ? "s" : ""}
          </span>
          {inativas > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              {inativas} Inativa{inativas !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* Loading skeleton                                                  */}
      {/* ================================================================ */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-[#e2e8f0] bg-white p-6"
            >
              <div className="mb-4 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mb-3 h-8 w-full rounded bg-gray-100" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/* Empty state                                                       */}
      {/* ================================================================ */}
      {!loading && rotas.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white px-6 py-20 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <MapPin className="h-8 w-8 text-[#2563eb]" />
          </div>
          <p className="mt-4 text-base font-semibold text-[#0F111A]">
            Nenhuma rota cadastrada
          </p>
          <p className="mt-1 text-sm text-[#5E6278]">
            Cadastre sua primeira rota para começar a receber fretes.
          </p>
          <button
            onClick={openNew}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Primeira Rota
          </button>
        </div>
      )}

      {/* ================================================================ */}
      {/* Cards grid                                                        */}
      {/* ================================================================ */}
      {!loading && rotas.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rotas.map((rota) => (
            <div
              key={rota.id}
              className="group relative flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* ---- Status badge no canto superior direito ---- */}
              <span
                className={`absolute right-4 top-4 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  rota.ativa
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                {rota.ativa ? "Ativa" : "Inativa"}
              </span>

              {/* ---- Origem → Destino ---- */}
              <div className="mt-2 mb-5 flex items-center gap-3">
                <div className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex items-center gap-2 self-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                      <MapPin className="h-4 w-4 text-[#2563eb]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[#0F111A] leading-tight">
                        {rota.cidade_origem}
                      </p>
                      <p className="text-xs text-[#5E6278]">
                        {rota.estado_origem}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <ArrowRight className="h-5 w-5 text-[#2563eb]" />
                  <span className="text-[10px] font-medium text-[#5E6278]">
                    {formatarDistancia(rota.distancia_km)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex items-center gap-2 self-end text-right">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#0F111A] leading-tight">
                        {rota.cidade_destino}
                      </p>
                      <p className="text-xs text-[#5E6278]">
                        {rota.estado_destino}
                      </p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                      <Navigation className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ---- Distância destacada ---- */}
              <div className="mb-4 flex items-center justify-center rounded-xl bg-[#f8fafc] py-2">
                <span className="text-sm font-medium text-[#5E6278]">
                  Distância estimada:{" "}
                  <strong className="text-[#0F111A]">
                    {formatarDistancia(rota.distancia_km)}
                  </strong>
                </span>
              </div>

              {/* ---- Ações ---- */}
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#e2e8f0] pt-4">
                <button
                  onClick={() => handleToggle(rota)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    rota.ativa
                      ? "border border-gray-200 text-[#5E6278] hover:bg-gray-50"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {rota.ativa ? "Desativar" : "Ativar"}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(rota)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold text-[#5E6278] transition-colors hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(rota)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/* Modal (Adicionar / Editar)                                        */}
      {/* ================================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* ---- Cabeçalho do modal ---- */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F111A]">
                {editingId ? "Editar Rota" : "Nova Rota"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-[#5E6278] transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[65vh] space-y-5 overflow-y-auto">
              {/* ---- Origem ---- */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                  Cidade de Origem
                </label>
                <select
                  value={form.cidade_origem}
                  onChange={(e) => {
                    const cidade = CIDADES.find((c) => c.nome === e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      cidade_origem: e.target.value,
                      estado_origem: cidade?.estado ?? "",
                      distancia_km: 0, // reset manual distance so auto-calculation applies
                    }));
                  }}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                >
                  <option value="">Selecione a cidade de origem...</option>
                  {CIDADES.map((c) => (
                    <option key={`orig-${c.nome}-${c.estado}`} value={c.nome}>
                      {c.nome} / {c.estado}
                    </option>
                  ))}
                </select>
              </div>

              {/* ---- Destino ---- */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                  Cidade de Destino
                </label>
                <select
                  value={form.cidade_destino}
                  onChange={(e) => {
                    const cidade = CIDADES.find((c) => c.nome === e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      cidade_destino: e.target.value,
                      estado_destino: cidade?.estado ?? "",
                      distancia_km: 0, // reset manual distance
                    }));
                  }}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                >
                  <option value="">Selecione a cidade de destino...</option>
                  {CIDADES.map((c) => (
                    <option key={`dest-${c.nome}-${c.estado}`} value={c.nome}>
                      {c.nome} / {c.estado}
                    </option>
                  ))}
                </select>
              </div>

              {/* ---- Preview da rota ---- */}
              {form.cidade_origem && form.cidade_destino && (
                <div className="flex items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 p-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#0F111A]">
                      {form.cidade_origem}
                    </p>
                    <p className="text-xs text-[#5E6278]">{form.estado_origem}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowRight className="h-6 w-6 text-[#2563eb]" />
                    {distanciaCalculada != null && distanciaCalculada > 0 && (
                      <span className="mt-0.5 text-[10px] font-semibold text-[#2563eb]">
                        ~{formatarDistancia(distanciaCalculada)}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#0F111A]">
                      {form.cidade_destino}
                    </p>
                    <p className="text-xs text-[#5E6278]">{form.estado_destino}</p>
                  </div>
                </div>
              )}

              {/* ---- Erro origem == destino ---- */}
              {form.cidade_origem &&
                form.cidade_destino &&
                form.cidade_origem === form.cidade_destino &&
                form.estado_origem === form.estado_destino && (
                  <p className="text-xs text-red-500">
                    A origem e o destino não podem ser a mesma cidade.
                  </p>
                )}

              {/* ---- Distância (campo manual) ---- */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                  Distância (km)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.distancia_km || ""}
                  placeholder={
                    distanciaCalculada != null
                      ? `Automática: ${formatarDistancia(distanciaCalculada)}`
                      : "Ex: 450"
                  }
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      distancia_km: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
                {distanciaCalculada != null &&
                  distanciaCalculada > 0 &&
                  form.distancia_km === 0 && (
                    <p className="mt-1 text-xs text-[#5E6278]">
                      Distância calculada automaticamente:{" "}
                      <strong>{formatarDistancia(distanciaCalculada)}</strong>.
                      Altere o campo acima para usar um valor manual.
                    </p>
                  )}
              </div>
            </div>

            {/* ---- Botões do modal ---- */}
            <div className="mt-6 flex justify-end gap-3 border-t border-[#e2e8f0] pt-4">
              <button
                onClick={closeModal}
                className="rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#5E6278] transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !form.cidade_origem ||
                  !form.cidade_destino ||
                  (form.cidade_origem === form.cidade_destino &&
                    form.estado_origem === form.estado_destino)
                }
                className="rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
              >
                {saving
                  ? "Salvando..."
                  : editingId
                    ? "Salvar Alterações"
                    : "Cadastrar Rota"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rotas;
