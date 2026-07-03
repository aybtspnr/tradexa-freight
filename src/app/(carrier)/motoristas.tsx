import { useCallback, useEffect, useState } from "react";
import { Plus, Users, Pencil, Trash2, X, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

type StatusMotorista = "disponivel" | "em_viagem" | "descanso" | "inativo";

interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  cnh: string;
  validade_cnh: string;
  telefone: string;
  email: string;
  status: StatusMotorista;
}

const STATUS_OPTS: { value: StatusMotorista; label: string }[] = [
  { value: "disponivel", label: "Disponível" },
  { value: "em_viagem", label: "Em Viagem" },
  { value: "descanso", label: "Descanso" },
  { value: "inativo", label: "Inativo" },
];

const STATUS_STYLES: Record<string, string> = {
  disponivel: "bg-emerald-50 text-emerald-700 border-emerald-200",
  em_viagem: "bg-blue-50 text-blue-700 border-blue-200",
  descanso: "bg-amber-50 text-amber-700 border-amber-200",
  inativo: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  disponivel: "Disponível",
  em_viagem: "Em Viagem",
  descanso: "Descanso",
  inativo: "Inativo",
};

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const EMPTY_FORM = {
  nome: "",
  cpf: "",
  cnh: "",
  validade_cnh: "",
  telefone: "",
  email: "",
  status: "disponivel" as StatusMotorista,
};

export function Motoristas() {
  const profile = useAuthStore((s) => s.profile);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadMotoristas = useCallback(async () => {
    if (!profile?.id) {
      setMotoristas([]);
      return;
    }
    const { data, error } = await (supabase.from("drivers") as any)
      .select("*")
      .eq("carrier_id", profile.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Erro ao carregar motoristas:", error);
      return;
    }
    setMotoristas(
      ((data || []) as any[]).map((d: any) => ({
        id: d.id,
        nome: d.name,
        cpf: d.cpf,
        cnh: d.cnh_number,
        validade_cnh: d.cnh_expiry || "",
        telefone: d.phone || "",
        email: d.email || "",
        status: d.active ? ("disponivel" as StatusMotorista) : ("inativo" as StatusMotorista),
      })),
    );
  }, [profile?.id]);

  useEffect(() => {
    loadMotoristas();
  }, [loadMotoristas]);

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((m: Motorista) => {
    setEditingId(m.id);
    setForm({
      nome: m.nome,
      cpf: m.cpf,
      cnh: m.cnh,
      validade_cnh: m.validade_cnh,
      telefone: m.telefone,
      email: m.email,
      status: m.status,
    });
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!profile?.id) return;
    if (!form.nome || !form.cpf || !form.cnh) return;
    if (form.cpf.replace(/\D/g, "").length !== 11) return;

    const record: any = {
      carrier_id: profile.id,
      name: form.nome,
      cpf: form.cpf,
      cnh_number: form.cnh,
      cnh_expiry: form.validade_cnh || null,
      phone: form.telefone || null,
      email: form.email || null,
      active: form.status !== "inativo",
    };

    if (editingId) {
      const { error } = await (supabase.from("drivers") as any).update(record).eq("id", editingId);
      if (error) {
        console.error("Erro ao atualizar motorista:", error);
        return;
      }
    } else {
      const { error } = await (supabase.from("drivers") as any).insert(record);
      if (error) {
        console.error("Erro ao cadastrar motorista:", error);
        return;
      }
    }

    await loadMotoristas();
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }, [form, editingId, profile?.id, loadMotoristas]);

  const handleExcluir = useCallback(
    async (id: string) => {
      if (!window.confirm("Excluir este motorista?")) return;
      const { error } = await (supabase.from("drivers") as any).delete().eq("id", id);
      if (error) {
        console.error("Erro ao excluir motorista:", error);
        return;
      }
      await loadMotoristas();
    },
    [loadMotoristas],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F111A]">Motoristas</h1>
          <p className="text-sm text-[#5E6278]">Gerencie os motoristas cadastrados</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Motorista
        </button>
      </div>

      <div className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-xs font-semibold uppercase text-[#5E6278]">
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">CPF</th>
                <th className="px-6 py-3">CNH</th>
                <th className="px-6 py-3">Validade CNH</th>
                <th className="px-6 py-3">Telefone</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {motoristas.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#5E6278]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-50">
                        <Users className="h-8 w-8 text-[#ec4899]" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[#0F111A]">Nenhum motorista cadastrado</p>
                        <p className="mt-1 text-sm text-[#5E6278]">Cadastre motoristas para associá-los às suas rotas e veículos.</p>
                      </div>
                      <button
                        onClick={openNew}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Cadastrar Primeiro Motorista
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {motoristas.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-[#f8fafc]">
                  <td className="px-6 py-4 font-medium text-[#0F111A]">{m.nome}</td>
                  <td className="px-6 py-4 font-mono text-[#5E6278]">{m.cpf}</td>
                  <td className="px-6 py-4 font-mono text-[#5E6278]">{m.cnh}</td>
                  <td className="px-6 py-4 text-[#5E6278]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {m.validade_cnh || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#5E6278]">{m.telefone}</td>
                  <td className="px-6 py-4 text-[#5E6278]">{m.email || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[m.status]}`}>
                      {STATUS_LABELS[m.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(m)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold text-[#5E6278] transition-colors hover:bg-gray-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(m.id)}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
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
            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Nome Completo</label>
                <input type="text" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">CPF</label>
                <input type="text" value={form.cpf} onChange={(e) => setForm((p) => ({ ...p, cpf: formatCPF(e.target.value) }))}
                  placeholder="000.000.000-00" maxLength={14}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm font-mono text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">CNH</label>
                  <input type="text" value={form.cnh} onChange={(e) => setForm((p) => ({ ...p, cnh: e.target.value }))}
                    placeholder="Número da CNH"
                    className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Validade CNH</label>
                  <input type="date" value={form.validade_cnh} onChange={(e) => setForm((p) => ({ ...p, validade_cnh: e.target.value }))}
                    className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Telefone</label>
                <input type="text" value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: formatPhone(e.target.value) }))}
                  placeholder="(11) 99999-8888" maxLength={16}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="motorista@exemplo.com"
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F111A]">Status</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StatusMotorista }))}
                  className="w-full rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0F111A] outline-none transition-all focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10">
                  {STATUS_OPTS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-[#e2e8f0] pt-4">
              <button onClick={() => setModalOpen(false)}
                className="rounded-xl border-2 border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#5E6278] transition-colors hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave}
                disabled={!form.nome || form.cpf.replace(/\D/g, "").length !== 11 || !form.cnh}
                className="rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm">
                {editingId ? "Salvar Alterações" : "Cadastrar Motorista"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Motoristas;
