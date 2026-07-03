import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

/* ─── Types ───────────────────────────────────────────────── */

interface CotacaoForm {
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
}

/* ─── Brazilian cities ─────────────────────────────────────── */

interface Cidade {
  nome: string;
  estado: string;
}

const CIDADES: Cidade[] = [
  { nome: "São Paulo", estado: "SP" },
  { nome: "Campinas", estado: "SP" },
  { nome: "Guarulhos", estado: "SP" },
  { nome: "Rio de Janeiro", estado: "RJ" },
  { nome: "Niterói", estado: "RJ" },
  { nome: "Belo Horizonte", estado: "MG" },
  { nome: "Uberlândia", estado: "MG" },
  { nome: "Porto Alegre", estado: "RS" },
  { nome: "Caxias do Sul", estado: "RS" },
  { nome: "Curitiba", estado: "PR" },
  { nome: "Londrina", estado: "PR" },
  { nome: "Florianópolis", estado: "SC" },
  { nome: "Joinville", estado: "SC" },
  { nome: "Salvador", estado: "BA" },
  { nome: "Feira de Santana", estado: "BA" },
  { nome: "Recife", estado: "PE" },
  { nome: "Fortaleza", estado: "CE" },
  { nome: "Manaus", estado: "AM" },
  { nome: "Belém", estado: "PA" },
  { nome: "Brasília", estado: "DF" },
  { nome: "Goiânia", estado: "GO" },
  { nome: "Cuiabá", estado: "MT" },
  { nome: "Campo Grande", estado: "MS" },
  { nome: "Vitória", estado: "ES" },
];

const ESTADOS = [
  "SP", "RJ", "MG", "RS", "PR", "SC", "BA", "PE", "CE", "AM", "PA", "DF", "GO", "MT", "MS", "ES",
];

const TIPOS_CARGA = [
  { value: "caixa", label: "Caixa" },
  { value: "pallet", label: "Pallet" },
  { value: "container", label: "Container" },
  { value: "granel", label: "Granel" },
];

/* ─── Helpers ────────────────────────────────────────────── */

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

/* ─── Steps config ─────────────────────────────────────────── */

const TOTAL_STEPS = 4;

const STEP_LABELS = [
  "Detalhes da Carga",
  "Origem e Destino",
  "Datas e Requisitos",
  "Resumo e Publicar",
];

const STEP_ICONS = ["📦", "📍", "📅", "✅"];

/* ─── Component ──────────────────────────────────────────── */

export function Cotar() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CotacaoForm>({
    tipo_carga: "",
    descricao: "",
    peso_kg: 0,
    volume_m3: 0,
    origem_cidade: "",
    origem_estado: "",
    destino_cidade: "",
    destino_estado: "",
    data_coleta: "",
    data_entrega: "",
    refrigerado: false,
    perigoso: false,
    seguro: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = useCallback(
    <K extends keyof CotacaoForm>(key: K, value: CotacaoForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /* ─── Validation per step ─────────────────────────── */

  const stepValid = useMemo(() => {
    switch (step) {
      case 1:
        return (
          form.tipo_carga !== "" &&
          form.descricao.trim().length >= 3 &&
          form.peso_kg > 0 &&
          form.volume_m3 > 0
        );
      case 2:
        return (
          form.origem_cidade !== "" &&
          form.origem_estado !== "" &&
          form.destino_cidade !== "" &&
          form.destino_estado !== "" &&
          !(
            form.origem_cidade === form.destino_cidade &&
            form.origem_estado === form.destino_estado
          )
        );
      case 3:
        return form.data_coleta !== "" && form.data_entrega !== "";
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, form]);

  const origemLabel = form.origem_cidade
    ? `${form.origem_cidade}, ${form.origem_estado}`
    : "—";
  const destinoLabel = form.destino_cidade
    ? `${form.destino_cidade}, ${form.destino_estado}`
    : "—";

  /* ─── Navigation ──────────────────────────────────── */

  const nextStep = useCallback(() => {
    if (step < TOTAL_STEPS && stepValid) {
      setStep((s) => s + 1);
    }
  }, [step, stepValid]);

  const prevStep = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const handlePublish = useCallback(async () => {
    if (!profile?.id) return;
    setSubmitting(true);

    // Append special requirements to cargo description
    let descricao = form.descricao;
    const extras: string[] = [];
    if (form.refrigerado) extras.push("Refrigerado");
    if (form.perigoso) extras.push("Carga Perigosa");
    if (form.seguro) extras.push("Seguro");
    if (extras.length > 0) {
      descricao += ` [${extras.join(", ")}]`;
    }

    const { error } = await (supabase as any).from("quotations").insert({
      shipper_id: profile.id,
      origin_city: form.origem_cidade,
      origin_state: form.origem_estado,
      destination_city: form.destino_cidade,
      destination_state: form.destino_estado,
      cargo_description: descricao,
      weight_kg: form.peso_kg,
      volume_m3: form.volume_m3,
      cargo_type: form.tipo_carga,
      pickup_date: form.data_coleta,
      delivery_date: form.data_entrega,
    });

    setSubmitting(false);

    if (error) {
      console.error("Failed to publish quotation:", error);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate("/shipper/cotacoes");
    }, 1500);
  }, [form, profile, navigate]);

  /* ─── Render helpers ──────────────────────────────── */

  const renderProgressBar = () => (
    <div className="mb-8">
      {/* Step circles */}
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const idx = i + 1;
          const isActive = idx === step;
          const isDone = idx < step;
          return (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isDone
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {isDone ? "✓" : STEP_ICONS[i]}
              </div>
              <span
                className={`mt-1.5 hidden text-xs font-medium sm:block ${
                  isActive ? "text-primary" : isDone ? "text-green-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Mobile label */}
      <p className="mt-2 text-center text-sm text-gray-500 sm:hidden">
        Passo {step}/{TOTAL_STEPS} — {STEP_LABELS[step - 1]}
      </p>
    </div>
  );

  const renderNavigation = () => (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
      <button
        onClick={prevStep}
        disabled={step === 1}
        className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Voltar
      </button>

      {step < TOTAL_STEPS ? (
        <button
          onClick={nextStep}
          disabled={!stepValid}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Avançar →
        </button>
      ) : (
        <button
          onClick={handlePublish}
          disabled={submitting || !stepValid}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Publicando..." : "📢 Publicar Cotação"}
        </button>
      )}
    </div>
  );

  /* ─── Success screen ─────────────────────────────── */

  if (success) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✅
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Cotação Publicada!</h1>
        <p className="mt-2 text-gray-500">
          Sua solicitação de frete foi enviada. Transportadoras poderão fazer ofertas em breve.
        </p>
        <p className="mt-4 text-sm text-gray-400">Redirecionando para suas cotações...</p>
      </div>
    );
  }

  /* ─── Main render ────────────────────────────────── */

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nova Cotação</h1>
        <p className="text-gray-500">Solicite um orçamento de frete em poucos passos</p>
      </div>

      {renderProgressBar()}

      {/* ── Step 1: Carga ──────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5 rounded-xl border border-border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Detalhes da Carga</h2>

          {/* Tipo de Carga */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de Carga</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TIPOS_CARGA.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => update("tipo_carga", t.value)}
                  className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                    form.tipo_carga === t.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Descrição da Carga
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => update("descricao", e.target.value)}
              placeholder="Descreva a carga, tipo de produto, dimensões, etc."
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Peso e Volume */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.peso_kg || ""}
                onChange={(e) => update("peso_kg", Number(e.target.value))}
                placeholder="Ex: 500"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Volume (m³)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.volume_m3 || ""}
                onChange={(e) => update("volume_m3", Number(e.target.value))}
                placeholder="Ex: 2.5"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Origem e Destino ───────────────── */}
      {step === 2 && (
        <div className="space-y-5 rounded-xl border border-border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Origem e Destino</h2>

          {/* Origem */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Origem</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <select
                  value={form.origem_cidade}
                  onChange={(e) => update("origem_cidade", e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Cidade...</option>
                  {CIDADES.map((c) => (
                    <option key={`o-${c.nome}-${c.estado}`} value={c.nome}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={form.origem_estado}
                  onChange={(e) => update("origem_estado", e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">UF</option>
                  {ESTADOS.map((uf) => (
                    <option key={`o-uf-${uf}`} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Destino */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Destino</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <select
                  value={form.destino_cidade}
                  onChange={(e) => update("destino_cidade", e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Cidade...</option>
                  {CIDADES.map((c) => (
                    <option key={`d-${c.nome}-${c.estado}`} value={c.nome}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={form.destino_estado}
                  onChange={(e) => update("destino_estado", e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">UF</option>
                  {ESTADOS.map((uf) => (
                    <option key={`d-uf-${uf}`} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {form.origem_cidade && form.destino_cidade && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              {origemLabel} → {destinoLabel}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Datas e Requisitos ─────────────── */}
      {step === 3 && (
        <div className="space-y-5 rounded-xl border border-border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Datas e Requisitos</h2>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Data de Coleta</label>
              <input
                type="date"
                value={form.data_coleta}
                onChange={(e) => update("data_coleta", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Data de Entrega</label>
              <input
                type="date"
                value={form.data_entrega}
                onChange={(e) => update("data_entrega", e.target.value)}
                min={form.data_coleta || new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Requisitos */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Requisitos Especiais</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={form.refrigerado}
                  onChange={(e) => update("refrigerado", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-medium text-gray-900">Refrigerado</span>
                  <p className="text-xs text-gray-500">Carga necessita de refrigeração</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={form.perigoso}
                  onChange={(e) => update("perigoso", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-medium text-gray-900">Carga Perigosa</span>
                  <p className="text-xs text-gray-500">Produtos classificados como perigosos</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={form.seguro}
                  onChange={(e) => update("seguro", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-medium text-gray-900">Seguro</span>
                  <p className="text-xs text-gray-500">Deseja contratar seguro para a carga</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Resumo ─────────────────────────── */}
      {step === 4 && (
        <div className="space-y-5 rounded-xl border border-border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Resumo da Cotação</h2>

          <div className="space-y-4">
            {/* Carga */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                📦 Carga
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Tipo:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {TIPOS_CARGA.find((t) => t.value === form.tipo_carga)?.label ?? form.tipo_carga}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Peso:</span>{" "}
                  <span className="font-medium text-gray-900">{form.peso_kg} kg</span>
                </div>
                <div>
                  <span className="text-gray-500">Volume:</span>{" "}
                  <span className="font-medium text-gray-900">{form.volume_m3} m³</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Descrição:</span>{" "}
                  <span className="font-medium text-gray-900">{form.descricao}</span>
                </div>
              </div>
            </div>

            {/* Rota */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                📍 Rota
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-900">{origemLabel}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-gray-900">{destinoLabel}</span>
              </div>
            </div>

            {/* Datas */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                📅 Datas
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Coleta:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {formatDate(form.data_coleta)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Entrega:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {formatDate(form.data_entrega)}
                  </span>
                </div>
              </div>
            </div>

            {/* Requisitos */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                ⚙️ Requisitos
              </h3>
              <div className="flex flex-wrap gap-2">
                {form.refrigerado && (
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    🧊 Refrigerado
                  </span>
                )}
                {form.perigoso && (
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                    ☢️ Carga Perigosa
                  </span>
                )}
                {form.seguro && (
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    🛡️ Seguro
                  </span>
                )}
                {!form.refrigerado && !form.perigoso && !form.seguro && (
                  <span className="text-sm text-gray-400">Nenhum requisito especial</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {renderNavigation()}
    </div>
  );
}

export default Cotar;
