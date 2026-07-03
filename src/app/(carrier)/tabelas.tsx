import { useCallback, useState } from "react";

/* ─── Types ───────────────────────────────────────────────── */

interface Rota {
  id: string;
  cidade_origem: string;
  estado_origem: string;
  cidade_destino: string;
  estado_destino: string;
  distancia_km: number;
  status: string;
}

interface TabelaFrete {
  id: string;
  nome: string;
  rota_id: string;
  rota_label: string;
  preco_kg: number;
  preco_m3: number;
  preco_km: number;
  valor_minimo: number;
  validade: string;
}

/* ─── Helpers ────────────────────────────────────────────── */

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function loadRotas(): Rota[] {
  try {
    const raw = localStorage.getItem("tradexa_rotas");
    return raw ? (JSON.parse(raw) as Rota[]) : [];
  } catch {
    return [];
  }
}

function loadTabelas(): TabelaFrete[] {
  try {
    const raw = localStorage.getItem("tradexa_tabelas");
    return raw ? (JSON.parse(raw) as TabelaFrete[]) : [];
  } catch {
    return [];
  }
}

function saveTabelas(tabelas: TabelaFrete[]) {
  localStorage.setItem("tradexa_tabelas", JSON.stringify(tabelas));
}

/* ─── Initial form state ─────────────────────────────────── */

const EMPTY_FORM = {
  nome: "",
  rota_id: "",
  preco_kg: 0,
  preco_m3: 0,
  preco_km: 0,
  valor_minimo: 0,
  validade: "",
};

/* ─── Component ──────────────────────────────────────────── */

export function Tabelas() {
  const [tabelas, setTabelas] = useState<TabelaFrete[]>(loadTabelas);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const rotas = loadRotas().filter((r) => r.status === "ativa");

  const refresh = useCallback(() => setTabelas(loadTabelas()), []);

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((t: TabelaFrete) => {
    setEditingId(t.id);
    setForm({
      nome: t.nome,
      rota_id: t.rota_id,
      preco_kg: t.preco_kg,
      preco_m3: t.preco_m3,
      preco_km: t.preco_km,
      valor_minimo: t.valor_minimo,
      validade: t.validade,
    });
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.nome || !form.rota_id || !form.validade) return;

    const rota = rotas.find((r) => r.id === form.rota_id);
    const rotaLabel = rota
      ? `${rota.cidade_origem}/${rota.estado_origem} → ${rota.cidade_destino}/${rota.estado_destino}`
      : "";

    const todas = loadTabelas();

    if (editingId) {
      const updated = todas.map((t) =>
        t.id === editingId
          ? { ...t, ...form, rota_label: rotaLabel }
          : t,
      );
      saveTabelas(updated);
    } else {
      const nova: TabelaFrete = {
        id: generateId(),
        ...form,
        rota_label: rotaLabel,
      };
      saveTabelas([...todas, nova]);
    }

    refresh();
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  }, [form, editingId, rotas, refresh]);

  const handleExcluir = useCallback(
    (id: string) => {
      if (!window.confirm("Excluir esta tabela de frete?")) return;
      const todas = loadTabelas().filter((t) => t.id !== id);
      saveTabelas(todas);
      refresh();
    },
    [refresh],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tabelas de Frete</h1>
          <p className="text-gray-500">Gerencie as tabelas de preços por rota</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          ＋ Nova Tabela
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Rota</th>
                <th className="px-6 py-3">Preço/kg</th>
                <th className="px-6 py-3">Preço/m³</th>
                <th className="px-6 py-3">Preço/km</th>
                <th className="px-6 py-3">Valor Mín.</th>
                <th className="px-6 py-3">Validade</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tabelas.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Nenhuma tabela cadastrada.
                  </td>
                </tr>
              )}
              {tabelas.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{t.nome}</td>
                  <td className="px-6 py-4 text-gray-700">{t.rota_label}</td>
                  <td className="px-6 py-4 text-gray-900">R$ {t.preco_kg.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-900">R$ {t.preco_m3.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-900">R$ {t.preco_km.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-900">R$ {t.valor_minimo.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500">{t.validade}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="rounded-md border border-border px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(t.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Editar Tabela" : "Nova Tabela de Frete"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nome da Tabela</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Tabela Padrão SP-RJ"
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Rota */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Rota</label>
                <select
                  value={form.rota_id}
                  onChange={(e) => setForm((p) => ({ ...p, rota_id: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecione uma rota ativa...</option>
                  {rotas.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.cidade_origem}/{r.estado_origem} → {r.cidade_destino}/{r.estado_destino} ({r.distancia_km} km)
                    </option>
                  ))}
                </select>
              </div>

              {/* Prices grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Preço por kg (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.preco_kg}
                    onChange={(e) => setForm((p) => ({ ...p, preco_kg: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Preço por m³ (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.preco_m3}
                    onChange={(e) => setForm((p) => ({ ...p, preco_m3: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Preço por km (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.preco_km}
                    onChange={(e) => setForm((p) => ({ ...p, preco_km: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Valor Mínimo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valor_minimo}
                    onChange={(e) => setForm((p) => ({ ...p, valor_minimo: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Validade */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Data de Validade</label>
                <input
                  type="date"
                  value={form.validade}
                  onChange={(e) => setForm((p) => ({ ...p, validade: e.target.value }))}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.nome || !form.rota_id || !form.validade}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editingId ? "Salvar Alterações" : "Cadastrar Tabela"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tabelas;
