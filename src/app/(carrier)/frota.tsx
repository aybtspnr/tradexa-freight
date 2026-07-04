import { useCallback, useEffect, useState } from "react";
import { Plus, Truck, Pencil, Trash2, X, Package, Weight, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

// ── Types ──────────────────────────────────────────────

type TipoVeiculo = "caminhao" | "van" | "carreta" | "utilitario" | "bitrem" | "rodotrem";
type StatusVeiculo = "disponivel" | "em_transito" | "manutencao";

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

// ── Constants ──────────────────────────────────────────

const TIPOS: { value: TipoVeiculo; label: string }[] = [
  { value: "caminhao", label: "Caminhão" },
  { value: "van", label: "Van" },
  { value: "carreta", label: "Carreta" },
  { value: "utilitario", label: "Utilitário" },
  { value: "bitrem", label: "Bitrem" },
  { value: "rodotrem", label: "Rodotrem" },
];

const STATUS_OPTS: { value: StatusVeiculo; label: string }[] = [
  { value: "disponivel", label: "Disponível" },
  { value: "em_transito", label: "Em Trânsito" },
  { value: "manutencao", label: "Manutenção" },
];

const STATUS_STYLES: Record<StatusVeiculo, string> = {
  disponivel: "bg-emerald-50 text-emerald-700 border-emerald-200",
  em_transito: "bg-blue-50 text-blue-700 border-blue-200",
  manutencao: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABELS: Record<StatusVeiculo, string> = {
  disponivel: "Disponível",
  em_transito: "Em Trânsito",
  manutencao: "Manutenção",
};

const STATUS_DOT: Record<StatusVeiculo, string> = {
  disponivel: "bg-emerald-500",
  em_transito: "bg-blue-500",
  manutencao: "bg-amber-500",
};

const TIPO_LABELS: Record<TipoVeiculo, string> = {
  caminhao: "Caminhão",
  van: "Van",
  carreta: "Carreta",
  utilitario: "Utilitário",
  bitrem: "Bitrem",
  rodotrem: "Rodotrem",
};

// ── DB ↔ UI mappings ──────────────────────────────────

const UI_TO_DB_STATUS: Record<StatusVeiculo, string> = {
  disponivel: "available",
  em_transito: "in_transit",
  manutencao: "maintenance",
};

const DB_TO_UI_STATUS: Record<string, StatusVeiculo> = {
  available: "disponivel",
  in_transit: "em_transito",
  maintenance: "manutencao",
};

  // ── Unused but kept for reference ──
  /* const UI_TO_DB_TIPO: Record<TipoVeiculo, string> = {...}; */

// ── Helpers ────────────────────────────────────────────

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

// ── Form initial state ─────────────────────────────────

const EMPTY_FORM = {
  placa: "",
  modelo: "",
  ano: new Date().getFullYear(),
  capacidade_kg: 0,
  capacidade_m3: 0,
  tipo: "caminhao" as TipoVeiculo,
  status: "disponivel" as StatusVeiculo,
};

// ── Component ──────────────────────────────────────────

export function Frota() {
  const profile = useAuthStore((s) => s.profile);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [placaError, setPlacaError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Load ─────────────────────────────────────────────

  const loadVeiculos = useCallback(async () => {
    if (!profile?.id) {
      setVeiculos([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("fleet")
      .select("*")
      .eq("carrier_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar frota:", error);
      setLoading(false);
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
        tipo: (v.vehicle_type as TipoVeiculo) ?? "caminhao",
        status: DB_TO_UI_STATUS[v.status] ?? "manutencao",
      })),
    );
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    loadVeiculos();
  }, [loadVeiculos]);

  // ── Modal handlers ───────────────────────────────────

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

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setPlacaError("");
  }, []);

  // ── Save ─────────────────────────────────────────────

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
    const record = {
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
      const { error } = await supabase.from("fleet").update(record as any).eq("id", editingId);
      if (error) { console.error("Erro ao atualizar:", error); return; }
    } else {
      const { error } = await supabase.from("fleet").insert(record as any);
      if (error) { console.error("Erro ao inserir:", error); return; }
    }

    await loadVeiculos();
    closeModal();
  }, [form, editingId, profile?.id, loadVeiculos, closeModal]);

  // ── Delete ───────────────────────────────────────────

  const handleExcluir = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("fleet").delete().eq("id", id);
      if (error) {
        console.error("Erro ao excluir veículo:", error);
        return;
      }
      setDeleteConfirm(null);
      await loadVeiculos();
    },
    [loadVeiculos],
  );

  // ── Stats ────────────────────────────────────────────

  const statusCounts = {
    disponivel: veiculos.filter((v) => v.status === "disponivel").length,
    em_transito: veiculos.filter((v) => v.status === "em_transito").length,
    manutencao: veiculos.filter((v) => v.status === "manutencao").length,
  };

  // ── Render ───────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F111A]">Frota</h1>
          <p className="text-sm text-[#5E6278]">
            {veiculos.length > 0
              ? `${veiculos.length} veículo${veiculos.length !== 1 ? "s" : ""} cadastrado${veiculos.length !== 1 ? "s" : ""}`
              : "Gerencie os veículos da transportadora"}
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Adicionar Veículo
        </button>
      </div>

      {/* ── Status summary ── */}
      {veiculos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {statusCounts.disponivel} Disponível
            {statusCounts.disponivel !== 1 ? "eis" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            {statusCounts.em_transito} Em Trânsito
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {statusCounts.manutencao} Em Manutenção
          </span>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent" />
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && veiculos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
            <Truck className="h-8 w-8 text-[#0ea5e9]" />
          </div>
          <p className="mt-4 text-base font-semibold text-[#0F111A]">Nenhum veículo cadastrado</p>
          <p className="mt-1 text-sm text-[#5E6278]">
            Adicione veículos à sua frota para gerenciar suas operações.
          </p>
          <button
            onClick={openNew}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Primeiro Veículo
          </button>
        </div>
      )}

      {/* ── Vehicle cards grid ── */}
      {!loading && veiculos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {veiculos.map((v) => (
            <div
              key={v.id}
              className="group relative rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#2563eb]/30"
            >
              {/* Delete confirmation overlay */}
              {deleteConfirm === v.id && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/95 p-5 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-[#0F111A]">
                    Excluir veículo {v.placa}?
                  </p>
                  <p className="text-xs text-[#5E6278]">Esta ação não pode ser desfeita.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold text-[#5E6278] hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleExcluir(v.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}

              {/* Card header: plate + status */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold tracking-tight text-[#0F111A] font-mono">
                    {v.placa}
                  </p>
                  <p className="text-sm text-[#5E6278]">{v.modelo}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[v.status]}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[v.status]}`} />
                  {STATUS_LABELS[v.status]}
                </span>
              </div>

              {/* Card body: details */}
              <div className="space-y-2.5 border-t border-[#f1f5f9] pt-3">
                <div className="flex items-center gap-2 text-sm text-[#5E6278]">
                  <Calendar className="h-4 w-4 text-[#94a3b8]" />
                  <span>Ano {v.ano}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5E6278]">
                  <Weight className="h-4 w-4 text-[#94a3b8]" />
                  <span>
                    {v.capacidade_kg.toLocaleString("pt-BR")} kg
                    {v.capacidade_m3 > 0 && (
                      <span className="text-[#94a3b8]"> · </span>
                    )}
                    {v.capacidade_m3 > 0 && `${v.capacidade_m3} m³`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5E6278]">
                  <Package className="h-4 w-4 text-[#94a3b8]" />
                  <span>{TIPO_LABELS[v.tipo] ?? v.tipo}</span>
                </div>
              </div>

              {/* Card actions */}
              <div className="mt-4 flex gap-2 border-t border-[#f1f5f9] pt-3">
                <button
                  onClick={() => openEdit(v)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e2e8f0] px-3 py-2 text-xs font-semibold text-[#5E6278] transition-colors hover:bg-gray-50 hover:text-[#2563eb] hover:border-[#2563eb]/30"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => setDeleteConfirm(v.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal (Add / Edit) ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            {/* Modal header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F111A]">
                {editingId ? "Editar Veículo" : "Novo Veículo"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-[#5E6278] transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="max-h-[calc(70vh-140px)] space-y-4 overflow-y-auto pr-1">
              {/* Placa */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                  Placa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.placa}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, placa: e.target.value }));
                    setPlacaError("");
                  }}
                  placeholder="ABC1D23 ou ABC-1234"
                  maxLength={8}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 font-mono text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
                {placaError && (
                  <p className="mt-1 text-xs text-red-500">{placaError}</p>
                )}
              </div>

              {/* Modelo */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                  Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.modelo}
                  onChange={(e) => setForm((p) => ({ ...p, modelo: e.target.value }))}
                  placeholder="Ex: Volvo FH 460"
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
              </div>

              {/* Ano + Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                    Ano <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1980}
                    max={new Date().getFullYear() + 1}
                    value={form.ano}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, ano: Number(e.target.value) }))
                    }
                    className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                    Tipo
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, tipo: e.target.value as TipoVeiculo }))
                    }
                    className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                  >
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Capacidade kg + m³ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                    Capacidade (kg)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={form.capacidade_kg}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, capacidade_kg: Number(e.target.value) }))
                    }
                    className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                    Capacidade (m³)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.capacidade_m3}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, capacidade_m3: Number(e.target.value) }))
                    }
                    className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value as StatusVeiculo }))
                  }
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                >
                  {STATUS_OPTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal footer */}
            <div className="mt-6 flex justify-end gap-3 border-t border-[#e2e8f0] pt-4">
              <button
                onClick={closeModal}
                className="rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#5E6278] transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.placa || !form.modelo || form.ano < 1900}
                className="rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
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
