import { useCallback, useEffect, useState } from "react";
import { Plus, MapPin, ArrowRight, ToggleLeft, ToggleRight, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

interface Rota {
  id: string;
  cidade_origem: string;
  estado_origem: string;
  cidade_destino: string;
  estado_destino: string;
  distancia_km: number;
  status: "ativa" | "inativa";
}

interface Cidade {
  nome: string;
  estado: string;
  lat: number;
  lon: number;
}

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

function calcularDistancia(origem: Cidade, destino: Cidade): number {
  const dlat = origem.lat - destino.lat;
  const dlon = origem.lon - destino.lon;
  return Math.round(100 * Math.sqrt(dlat * dlat + dlon * dlon));
}

const STATUS_STYLES: Record<string, string> = {
  ativa: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inativa: "bg-gray-50 text-gray-600 border-gray-200",
};

export function Rotas() {
  const profile = useAuthStore((s) => s.profile);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    cidade_origem: "",
    estado_origem: "",
    cidade_destino: "",
    estado_destino: "",
  });

  const loadRotas = useCallback(async () => {
    if (!profile?.id) {
      setRotas([]);
      return;
    }
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("carrier_id", profile.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Erro ao carregar rotas:", error);
      return;
    }
    setRotas(
      ((data || []) as any[]).map((r: any) => ({
        id: r.id,
        cidade_origem: r.origin_city,
        estado_origem: r.origin_state,
        cidade_destino: r.destination_city,
        estado_destino: r.destination_state,
        distancia_km: r.distance_km,
        status: r.active ? ("ativa" as const) : ("inativa" as const),
      })),
    );
  }, [profile?.id]);

  useEffect(() => {
    loadRotas();
  }, [loadRotas]);

  const handleCadastrar = useCallback(async () => {
    if (!profile?.id) return;
    const origem = CIDADES.find(
      (c) => c.nome === form.cidade_origem && c.estado === form.estado_origem,
    );
    const destino = CIDADES.find(
      (c) => c.nome === form.cidade_destino && c.estado === form.estado_destino,
    );
    if (!origem || !destino) return;
    if (origem.nome === destino.nome && origem.estado === destino.estado) return;

    const distancia = calcularDistancia(origem, destino);
    const { error } = await (supabase.from("routes") as any).insert({
      carrier_id: profile.id,
      origin_city: origem.nome,
      origin_state: origem.estado,
      destination_city: destino.nome,
      destination_state: destino.estado,
      distance_km: distancia,
      active: true,
    });
    if (error) {
      console.error("Erro ao cadastrar rota:", error);
      return;
    }
    await loadRotas();
    setModalOpen(false);
    setForm({ cidade_origem: "", estado_origem: "", cidade_destino: "", estado_destino: "" });
  }, [form, profile?.id, loadRotas]);

  const handleToggleStatus = useCallback(
    async (id: string) => {
      const rota = rotas.find((r) => r.id === id);
      if (!rota) return;
      const { error } = await (supabase.from("routes") as any)
        .update({ active: rota.status === "inativa" })
        .eq("id", id);
      if (error) {
        console.error("Erro ao alterar status:", error);
        return;
      }
      await loadRotas();
    },
    [rotas, loadRotas],
  );

  const handleExcluir = useCallback(
    async (id: string) => {
      const { error } = await (supabase.from("routes") as any).delete().eq("id", id);
      if (error) {
        console.error("Erro ao excluir rota:", error);
        return;
      }
      await loadRotas();
    },
    [loadRotas],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F111A]">Rotas</h1>
          <p className="text-sm text-[#5E6278]">Gerencie as rotas da transportadora</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova Rota
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-xs font-semibold uppercase text-[#5E6278]">
                <th className="px-6 py-3">Origem</th>
                <th className="px-6 py-3">Destino</th>
                <th className="px-6 py-3">Distância</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {rotas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#5E6278]">
                      <MapPin className="h-8 w-8 text-[#94a3b8]" />
                      <p className="text-sm font-medium">Nenhuma rota cadastrada</p>
                      <p className="text-xs">Clique em "Nova Rota" para começar.</p>
                    </div>
                  </td>
                </tr>
              )}
              {rotas.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-[#f8fafc]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-[#0F111A]">
                      <MapPin className="h-3.5 w-3.5 text-[#2563eb]" />
                      {r.cidade_origem}, {r.estado_origem}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#5E6278]">
                      <MapPin className="h-3.5 w-3.5 text-[#10b981]" />
                      {r.cidade_destino}, {r.estado_destino}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#0F111A]">{r.distancia_km} km</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_STYLES[r.status]
                      }`}
                    >
                      {r.status === "ativa" ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold text-[#5E6278] transition-colors hover:bg-gray-50"
                      >
                        {r.status === "ativa" ? <ToggleRight className="h-3.5 w-3.5 text-emerald-500" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                        {r.status === "ativa" ? "Ativa" : "Inativa"}
                      </button>
                      <button
                        onClick={() => handleExcluir(r.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F111A]">Cadastrar Nova Rota</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#5E6278] transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Cidade de Origem</label>
                <select
                  value={form.cidade_origem}
                  onChange={(e) => {
                    const cidade = CIDADES.find((c) => c.nome === e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      cidade_origem: e.target.value,
                      estado_origem: cidade?.estado ?? "",
                    }));
                  }}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                >
                  <option value="">Selecione...</option>
                  {CIDADES.map((c) => (
                    <option key={`${c.nome}-${c.estado}`} value={c.nome}>
                      {c.nome} / {c.estado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Cidade de Destino</label>
                <select
                  value={form.cidade_destino}
                  onChange={(e) => {
                    const cidade = CIDADES.find((c) => c.nome === e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      cidade_destino: e.target.value,
                      estado_destino: cidade?.estado ?? "",
                    }));
                  }}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                >
                  <option value="">Selecione...</option>
                  {CIDADES.map((c) => (
                    <option key={`${c.nome}-${c.estado}`} value={c.nome}>
                      {c.nome} / {c.estado}
                    </option>
                  ))}
                </select>
              </div>

              {form.cidade_origem && form.cidade_destino && (
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm text-[#2563eb]">
                  <MapPin className="h-4 w-4" />
                  {form.cidade_origem} → {form.cidade_destino}
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#5E6278] transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCadastrar}
                  disabled={!form.cidade_origem || !form.cidade_destino}
                  className="rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                >
                  Cadastrar Rota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rotas;
