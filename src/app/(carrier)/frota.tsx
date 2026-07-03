import { useCallback, useEffect, useState } from "react";
import { Plus, Truck, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

type TipoVeiculo = "caminhao" | "van" | "carreta" | "utililitario" | "bitrem" | "rodotrem";
type StatusVeiculo = "disponivel" | "em_rota" | "manutencao" | "inativo";

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  ano: number;
  capacidade_kg: number;
  capacidade_m3: number;
  tipo: TipoVeiculo;
  status: StatusVeiculo;
}

const TIPOS: { value: TipoVeiculo; label: string }[] = [
  { value: "caminhao", label: "Caminhão" },
  { value: "van", label: "Van" },
  { value: "carreta", label: "Carreta" },
  { value: "utililitario", label: "Utilitário" },
  { value: "bitrem", label: "Bitrem" },
  { value: "rodotrem", label: "Rodotrem" },
];

const STATUS_OPTS: { value: StatusVeiculo; label: string }[] = [
  { value: "disponivel", label: "Disponível" },
  { value: "em_rota", label: "Em Rota" },
  { value: "manutencao", label: "Manutenção" },
  { value: "inativo", label: "Inativo" },
];

const STATUS_STYLES: Record<string, string> = {
  disponivel: "bg-emerald-50 text-emerald-700 border-emerald-200",
  em_rota: "bg-blue-50 text-blue-700 border-blue-200",
  manutencao: "bg-amber-50 text-amber-700 border-amber-200",
  inativo: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  disponivel: "Disponível",
  em_rota: "Em Rota",
  manutencao: "Manutenção",
  inativo: "Inativo",
};

const TIPO_LABELS: Record<string, string> = {
  caminhao: "Caminhão",
  van: "Van",
  carreta: "Carreta",
  utililitario: "Utilitário",
  bitrem: "Bitrem",
  rodotrem: "Rodotrem",
};

// Mapping between UI status and DB status
const UI_TO_DB_STATUS: Record<string, string> = {
  disponivel: "available",
  em_rota: "in_transit",
  manutencao: "maintenance",
  inativo: "maintenance",
};

const DB_TO_UI_STATUS: Record<string, StatusVeiculo> = {
  available: "disponivel",
  in_transit: "em_rota",
  maintenance: "manutencao",
};

function validarPlaca(placa: string): boolean {
  const mercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  const antigo = /^[A-Z]{3}-?\d{4}$/;
  return mercosul.test(placa.toUpperCase()) || antigo.test(placa.toUpperCase());
}

function formatarPlaca(placa: string): string {
  const upper = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(upper)) {
    return upper.slice(0, 3) + upper.slice(3, 4) + upper.slice(4, 5) + upper.slice(5);
  }
  if (/^[A-Z]{3}\d{4}$/.test(upper)) {
    return upper.slice(0, 3) + "-" + upper.slice(3);
  }
  return placa;
}

const EMPTY_FORM = {
  placa: "",
  modelo: "",
  ano: new Date().getFullYear(),
  capacidade_kg: 0,
  capacidade_m3: 0,
  tipo: "caminhao" as TipoVeiculo,
  status: "disponivel" as StatusVeiculo,
};

export function Frota() {
  const profile = useAuthStore((s) => s.profile);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [placaError, setPlacaError] = useState("");

  const loadVeiculos = useCallback(async () => {
    if (!profile?.id) {
      setVeiculos([]);
      return;
    }
    const { data, error } = await (supabase.from("fleet") as any)
      .select("*")
      .eq("carrier_id", profile.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Erro ao carregar frota:", error);
      return;
    }
    setVeiculos(
      ((data || []) as any[]).map((v: any) => ({
        id: v.id,
        placa: v.plate,
        modelo: v.model,
        ano: v.year,
        capacidade_kg: v.capacity_kg,
        capacidade_m3: v.capacity_m3,
        tipo: v.vehicle_type as TipoVeiculo,
        status: DB_TO_UI_STATUS[v.status] ?? ("manutencao" as StatusVeiculo),
      })),
    );
  }, [profile?.id]);

  useEffect(() => {
    loadVeiculos();
  }, [loadVeiculos]);

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPlacaError("");
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((v: Veiculo) => {
    setEditingId(v.id);
    setForm({
      placa: v.placa,
      modelo: v.modelo,
      ano: v.ano,
      capacidade_kg: v.capacidade_kg,
      capacidade_m3: v.capacidade_m3,
      tipo: v.tipo,
      status: v.status,
    });
    setPlacaError("");
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!profile?.id) return;
    if (!form.placa || !form.modelo || form.ano < 1900) return;
    const placaUpper = form.placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!validarPlaca(placaUpper)) {
      setPlacaError("Formato inválido. Use ABC1D23 (Mercosul) ou ABC-1234");
      return;
    }
    setPlacaError("");

    const dbStatus = UI_TO_DB_STATUS[form.status] ?? "available";
    const record: any = {
      carrier_id: profile.id,
      plate: formatarPlaca(placaUpper),
      model: form.modelo,
      year: form.ano,
      capacity_kg: form.capacidade_kg,
      capacity_m3: form.capacidade_m3,
      vehicle_type: form.tipo,
      has_gps: false,
      status: dbStatus,
    };

    if (editingId) {
      const { error } = await (supabase.from("fleet") as any).update(record).eq("id", editingId);
      if (error) {
        console.error("Erro ao atualizar veículo:", error);
        return;
      }
    } else {
      const { error } = await (supabase.from("fleet") as any).insert(record);
      if (error) {
        console.error("Erro ao cadastrar veículo:", error);
        return;
      }
    }

    await loadVeiculos();
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }, [form, editingId, profile?.id, loadVeiculos]);

  const handleExcluir = useCallback(
    async (id: string) => {
      if (!window.confirm("Excluir este veículo?")) return;
      const { error } = await (supabase.from("fleet") as any).delete().eq("id", id);
      if (error) {
        console.error("Erro ao excluir veículo:", error);
        return;
      }
      await loadVeiculos();
    },
    [loadVeiculos],
  );

  const statusCounts = {
    disponivel: veiculos.filter((v) => v.status === "disponivel").length,
    em_rota: veiculos.filter((v) => v.status === "em_rota").length,
    manutencao: veiculos.filter((v) => v.status === "manutencao").length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F111A]">Frota</h1>
          <p className="text-sm text-[#5E6278]">Gerencie os veículos da transportadora</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Veículo
        </button>
      </div>

      {/* Status summary */}
      {veiculos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {statusCounts.disponivel} Disponível{statusCounts.disponivel !== 1 ? "is" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            {statusCounts.em_rota} Em Rota
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {statusCounts.manutencao} Em Manutenção
          </span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-xs font-semibold uppercase text-[#5E6278]">
                <th className="px-6 py-3">Placa</th>
                <th className="px-6 py-3">Modelo</th>
                <th className="px-6 py-3">Ano</th>
                <th className="px-6 py-3">Cap. kg</th>
                <th className="px-6 py-3">Cap. m³</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {veiculos.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#5E6278]">
                      <Truck className="h-8 w-8 text-[#94a3b8]" />
                      <p className="text-sm font-medium">Nenhum veículo cadastrado</p>
                      <p className="text-xs">Clique em "Novo Veículo" para começar.</p>
                    </div>
                  </td>
                </tr>
              )}
              {veiculos.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-[#f8fafc]">
                  <td className="px-6 py-4 font-mono font-bold text-[#0F111A]">{v.placa}</td>
                  <td className="px-6 py-4 text-[#5E6278]">{v.modelo}</td>
                  <td className="px-6 py-4 text-[#0F111A]">{v.ano}</td>
                  <td className="px-6 py-4 text-[#0F111A]">{v.capacidade_kg.toLocaleString("pt-BR")}</td>
                  <td className="px-6 py-4 text-[#0F111A]">{v.capacidade_m3}</td>
                  <td className="px-6 py-4 text-[#5E6278]">{TIPO_LABELS[v.tipo] ?? v.tipo}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_STYLES[v.status]
                      }`}
                    >
                      {STATUS_LABELS[v.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(v)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold text-[#5E6278] transition-colors hover:bg-gray-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(v.id)}
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
              <h2 className="text-lg font-bold text-[#0F111A]">
                {editingId ? "Editar Veículo" : "Novo Veículo"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#5E6278] transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Placa</label>
                <input
                  type="text"
                  value={form.placa}
                  onChange={(e) => { setForm((p) => ({ ...p, placa: e.target.value })); setPlacaError(""); }}
                  placeholder="ABC1D23 ou ABC-1234"
                  maxLength={8}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm font-mono text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
                {placaError && <p className="mt-1 text-xs text-red-500">{placaError}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Modelo</label>
                <input
                  type="text"
                  value={form.modelo}
                  onChange={(e) => setForm((p) => ({ ...p, modelo: e.target.value }))}
                  placeholder="Ex: Volvo FH 460"
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Ano</label>
                <input
                  type="number"
                  min={1980}
                  max={new Date().getFullYear() + 1}
                  value={form.ano}
                  onChange={(e) => setForm((p) => ({ ...p, ano: Number(e.target.value) }))}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Capacidade (kg)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={form.capacidade_kg}
                    onChange={(e) => setForm((p) => ({ ...p, capacidade_kg: Number(e.target.value) }))}
                    className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Capacidade (m³)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.capacidade_m3}
                    onChange={(e) => setForm((p) => ({ ...p, capacidade_m3: Number(e.target.value) }))}
                    className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Tipo de Veículo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as TipoVeiculo }))}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                >
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StatusVeiculo }))}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                >
                  {STATUS_OPTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-[#e2e8f0] pt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#5E6278] transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.placa || !form.modelo || form.ano < 1900}
                className="rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
              >
                {editingId ? "Salvar Alterações" : "Cadastrar Veículo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Frota;
