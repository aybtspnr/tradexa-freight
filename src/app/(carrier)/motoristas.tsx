import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Phone, Mail, FileText, IdCard } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import type { Driver } from "@/types";

/* ─── Formatar CPF: 000.000.000-00 ─── */
function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/* ─── Formatar Telefone: (XX) XXXXX-XXXX ─── */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/* ─── Formulário vazio ─── */
interface FormState {
  name: string;
  cpf: string;
  cnh_number: string;
  cnh_expiry: string;
  phone: string;
  email: string;
  active: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  cpf: "",
  cnh_number: "",
  cnh_expiry: "",
  phone: "",
  email: "",
  active: true,
};

export function Motoristas() {
  const profile = useAuthStore((s) => s.profile);
  const [motoristas, setMotoristas] = useState<Driver[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  /* ─── Carregar motoristas do Supabase ─── */
  const loadMotoristas = useCallback(async () => {
    if (!profile?.id) {
      setMotoristas([]);
      return;
    }
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("carrier_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar motoristas:", error);
      return;
    }
    setMotoristas(data ?? []);
  }, [profile?.id]);

  useEffect(() => {
    loadMotoristas();
  }, [loadMotoristas]);

  /* ─── Abrir modal para novo ─── */
  const openNew = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }, []);

  /* ─── Abrir modal para edição ─── */
  const openEdit = useCallback((d: Driver) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      cpf: d.cpf ?? "",
      cnh_number: d.cnh_number ?? "",
      cnh_expiry: d.cnh_expiry ?? "",
      phone: d.phone ?? "",
      email: d.email ?? "",
      active: d.active ?? true,
    });
    setModalOpen(true);
  }, []);

  /* ─── Salvar (criar ou atualizar) ─── */
  const handleSave = useCallback(async () => {
    if (!profile?.id) return;
    if (!form.name || !form.cpf || !form.cnh_number) return;
    if (form.cpf.replace(/\D/g, "").length !== 11) return;

    setSaving(true);

    const record = {
      carrier_id: profile.id,
      name: form.name,
      cpf: form.cpf,
      cnh_number: form.cnh_number,
      cnh_expiry: form.cnh_expiry || null,
      phone: form.phone || null,
      email: form.email || null,
      active: form.active,
    };

    if (editingId) {
      const { error } = await supabase
        .from("drivers")
        .update(record)
        .eq("id", editingId);
      if (error) {
        console.error("Erro ao atualizar motorista:", error);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("drivers").insert(record);
      if (error) {
        console.error("Erro ao cadastrar motorista:", error);
        setSaving(false);
        return;
      }
    }

    await loadMotoristas();
    setSaving(false);
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }, [form, editingId, profile?.id, loadMotoristas]);

  /* ─── Excluir com confirmação ─── */
  const handleExcluir = useCallback(
    async (id: string) => {
      if (!window.confirm("Tem certeza que deseja excluir este motorista? Esta ação não pode ser desfeita.")) return;
      const { error } = await supabase.from("drivers").delete().eq("id", id);
      if (error) {
        console.error("Erro ao excluir motorista:", error);
        return;
      }
      await loadMotoristas();
    },
    [loadMotoristas],
  );

  /* ─── Formatar data para exibição ─── */
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const count = motoristas.length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F111A]">Motoristas</h1>
          <p className="text-sm text-[#5E6278]">
            {count === 0
              ? "Nenhum motorista cadastrado"
              : `${count} motorista${count > 1 ? "s" : ""} cadastrado${count > 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Adicionar Motorista
        </button>
      </div>

      {/* ─── Grid de Cards ─── */}
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white py-20 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-50">
            <IdCard className="h-10 w-10 text-[#ec4899]" />
          </div>
          <p className="mt-4 text-base font-semibold text-[#0F111A]">Nenhum motorista cadastrado</p>
          <p className="mt-1 text-sm text-[#5E6278]">Cadastre motoristas para associá-los às suas rotas e veículos.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {motoristas.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              {/* ─── Topo: Nome + Status ─── */}
              <div className="mb-4 flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-[#0F111A] leading-tight">{m.name}</h3>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    m.active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      m.active ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  {m.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              {/* ─── Info ─── */}
              <div className="space-y-2.5 text-sm">
                {/* CPF */}
                <div className="flex items-center gap-2 text-[#5E6278]">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono text-xs">{m.cpf || "—"}</span>
                </div>

                {/* CNH */}
                <div className="flex items-center gap-2 text-[#5E6278]">
                  <IdCard className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">
                    CNH: {m.cnh_number || "—"}
                    {m.cnh_expiry && (
                      <span className="ml-1 text-[#94a3b8]">
                        (vence {formatDate(m.cnh_expiry)})
                      </span>
                    )}
                  </span>
                </div>

                {/* Telefone */}
                {m.phone && (
                  <div className="flex items-center gap-2 text-[#5E6278]">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs">{m.phone}</span>
                  </div>
                )}

                {/* Email */}
                {m.email && (
                  <div className="flex items-center gap-2 text-[#5E6278]">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-xs">{m.email}</span>
                  </div>
                )}
              </div>

              {/* ─── Ações ─── */}
              <div className="mt-4 flex gap-2 border-t border-[#e2e8f0] pt-4">
                <button
                  onClick={() => openEdit(m)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e2e8f0] px-3 py-2 text-xs font-semibold text-[#5E6278] transition-colors hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(m.id)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* Cabeçalho */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F111A]">
                {editingId ? "Editar Motorista" : "Novo Motorista"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#5E6278] transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Campos */}
            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              {/* Nome */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
              </div>

              {/* CPF */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => setForm((p) => ({ ...p, cpf: formatCPF(e.target.value) }))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 font-mono text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
              </div>

              {/* CNH + Validade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                    Nº CNH <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.cnh_number}
                    onChange={(e) => setForm((p) => ({ ...p, cnh_number: e.target.value }))}
                    placeholder="Número da CNH"
                    className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">
                    Validade CNH
                  </label>
                  <input
                    type="date"
                    value={form.cnh_expiry}
                    onChange={(e) => setForm((p) => ({ ...p, cnh_expiry: e.target.value }))}
                    className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Telefone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
                  placeholder="(11) 99999-8888"
                  maxLength={16}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="motorista@exemplo.com"
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
              </div>

              {/* Status (ativo/inativo) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, active: true }))}
                    className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                      form.active
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-[#e2e8f0] text-[#5E6278] hover:bg-gray-50"
                    }`}
                  >
                    ✓ Ativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, active: false }))}
                    className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                      !form.active
                        ? "border-gray-400 bg-gray-100 text-gray-600"
                        : "border-[#e2e8f0] text-[#5E6278] hover:bg-gray-50"
                    }`}
                  >
                    ✕ Inativo
                  </button>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="mt-6 flex justify-end gap-3 border-t border-[#e2e8f0] pt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#5E6278] transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !form.name ||
                  form.cpf.replace(/\D/g, "").length !== 11 ||
                  !form.cnh_number
                }
                className="rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
              >
                {saving ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Motorista"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Motoristas;
