import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   Data: Brazilian cities
   ═══════════════════════════════════════════════════════════════ */

interface Cidade {
  nome: string;
  estado: string;
}

const CIDADES: Cidade[] = [
  { nome: "São Paulo", estado: "SP" },
  { nome: "Campinas", estado: "SP" },
  { nome: "Guarulhos", estado: "SP" },
  { nome: "Santos", estado: "SP" },
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
  "SP", "RJ", "MG", "RS", "PR", "SC",
  "BA", "PE", "CE", "AM", "PA", "DF",
  "GO", "MT", "MS", "ES",
] as const;

/* ═══════════════════════════════════════════════════════════════
   Cargo type options with icons
   ═══════════════════════════════════════════════════════════════ */

interface CargoOption {
  value: string;
  label: string;
  icon: string;
  desc: string;
}

const TIPOS_CARGA: CargoOption[] = [
  { value: "caixa", label: "Caixa", icon: "📦", desc: "Cargas embaladas em caixas" },
  { value: "pallet", label: "Pallet", icon: "🧱", desc: "Cargas paletizadas" },
  { value: "container", label: "Container", icon: "🚢", desc: "Container fechado ou aberto" },
  { value: "granel", label: "Granel", icon: "🌾", desc: "Grãos, líquidos ou sólidos" },
];

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/* ═══════════════════════════════════════════════════════════════
   Steps config
   ═══════════════════════════════════════════════════════════════ */

const TOTAL_STEPS = 4;

interface StepConfig {
  label: string;
  subtitle: string;
  icon: string;
}

const STEPS: StepConfig[] = [
  { label: "Carga", subtitle: "Detalhes da carga", icon: "📦" },
  { label: "Rota", subtitle: "Origem e destino", icon: "📍" },
  { label: "Datas", subtitle: "Datas e requisitos", icon: "📅" },
  { label: "Revisão", subtitle: "Resumo e publicar", icon: "✅" },
];

/* ═══════════════════════════════════════════════════════════════
   Inline SVG icons (avoid emoji inconsistency across platforms)
   ═══════════════════════════════════════════════════════════════ */

function IconCheck(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconPackage(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}

function IconMapPin(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconCalendar(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconTruck(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconArrowRight(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconArrowLeft(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconSnowflake(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <polyline points="4.93 4.93 19.07 19.07" />
      <polyline points="19.07 4.93 4.93 19.07" />
    </svg>
  );
}

function IconAlertTriangle(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconShield(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconSparkles(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

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

  /* ─── Validation per step ─────────────────────────────── */

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

  /* ─── Navigation ──────────────────────────────────────── */

  const nextStep = useCallback(() => {
    if (step < TOTAL_STEPS && stepValid) {
      setStep((s) => s + 1);
    }
  }, [step, stepValid]);

  const prevStep = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  /* ─── Submit ────────────────────────────────────────── */

  const handlePublish = useCallback(async () => {
    if (!profile?.id) return;
    setSubmitting(true);

    let descricao = form.descricao;
    const extras: string[] = [];
    if (form.refrigerado) extras.push("Refrigerado");
    if (form.perigoso) extras.push("Carga Perigosa");
    if (form.seguro) extras.push("Seguro");
    if (extras.length > 0) {
      descricao += ` [${extras.join(", ")}]`;
    }

    const { error } = await supabase.from("quotations").insert({
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
    }, 2000);
  }, [form, profile, navigate]);

  /* ═════════════════════════════════════════════════════════
     Success screen
     ═════════════════════════════════════════════════════════ */

  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        {/* Animated success icon */}
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 ring-4 ring-green-50">
          <IconCheck className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          Cotação Publicada!
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-gray-500">
          Sua solicitação de frete foi enviada com sucesso. Transportadoras
          poderão fazer ofertas em breve.
        </p>

        {/* Redirect indicator */}
        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-medium text-primary">
          <IconSparkles className="h-4 w-4" />
          Redirecionando para suas cotações...
        </div>
      </div>
    );
  }

  /* ═════════════════════════════════════════════════════════
     Render: Progress bar
     ═════════════════════════════════════════════════════════ */

  const renderProgressBar = () => (
    <nav aria-label="Progresso" className="mb-10">
      <ol className="flex items-center">
        {STEPS.map((s, i) => {
          const idx = i + 1;
          const isDone = idx < step;
          const isActive = idx === step;

          return (
            <li
              key={idx}
              className={`relative flex-1 ${idx < TOTAL_STEPS ? "pr-8 sm:pr-12" : ""}`}
            >
              {/* Connecting line behind */}
              {idx < TOTAL_STEPS && (
                <div
                  className="absolute left-0 right-0 top-5 hidden h-0.5 sm:block"
                  style={{ right: "calc(100% - 2.5rem)" }}
                  aria-hidden="true"
                >
                  <div
                    className={`h-full transition-colors duration-300 ${
                      isDone || isActive ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}

              <div className="group flex items-center gap-3">
                {/* Circle */}
                <div
                  className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                    isDone
                      ? "bg-primary text-white shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"
                      : isActive
                        ? "bg-primary text-white shadow-[0_0_0_4px_rgba(37,99,235,0.2)] ring-2 ring-primary/30"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? (
                    <IconCheck className="h-5 w-5" />
                  ) : (
                    <span>{idx}</span>
                  )}
                </div>

                {/* Labels */}
                <div className="hidden sm:block">
                  <p
                    className={`text-sm font-semibold leading-none transition-colors ${
                      isActive
                        ? "text-primary"
                        : isDone
                          ? "text-primary/80"
                          : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p
                    className={`mt-1 text-xs leading-none transition-colors ${
                      isActive ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {s.subtitle}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile step label */}
      <p className="mt-4 text-center text-sm font-medium text-gray-500 sm:hidden">
        Passo {step} de {TOTAL_STEPS} — {STEPS[step - 1].label}
      </p>
    </nav>
  );

  /* ═════════════════════════════════════════════════════════
     Render: Navigation buttons
     ═════════════════════════════════════════════════════════ */

  const renderNavigation = () => (
    <div className="mt-8 flex items-center justify-between">
      <button
        onClick={prevStep}
        disabled={step === 1}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
      >
        <IconArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {step < TOTAL_STEPS ? (
        <button
          onClick={nextStep}
          disabled={!stepValid}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          Avançar
          <IconArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={handlePublish}
          disabled={submitting || !stepValid}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {submitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Publicando...
            </>
          ) : (
            <>
              <IconSparkles className="h-4 w-4" />
              Publicar Cotação
            </>
          )}
        </button>
      )}
    </div>
  );

  /* ═════════════════════════════════════════════════════════
     Step 1: Detalhes da Carga
     ═════════════════════════════════════════════════════════ */

  const renderStep1 = () => (
    <div className="surface-card rounded-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <IconPackage className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Detalhes da Carga
          </h2>
          <p className="text-sm text-gray-500">Informe o que será transportado</p>
        </div>
      </div>

      {/* Tipo de Carga — selectable cards */}
      <fieldset className="mb-6">
        <legend className="mb-3 block text-sm font-semibold text-gray-700">
          Tipo de Carga
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TIPOS_CARGA.map((t) => {
            const selected = form.tipo_carga === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => update("tipo_carga", t.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 text-center transition-all duration-200 ${
                  selected
                    ? "border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                  {t.icon}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    selected ? "text-primary" : "text-gray-700"
                  }`}
                >
                  {t.label}
                </span>
                <span className="text-[11px] leading-tight text-gray-400">
                  {t.desc}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Descrição */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Descrição da Carga
        </label>
        <textarea
          value={form.descricao}
          onChange={(e) => update("descricao", e.target.value)}
          placeholder="Descreva o tipo de produto, dimensões aproximadas, embalagem, etc."
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
        <p className="mt-1.5 text-xs text-gray-400">
          {form.descricao.trim().length > 0
            ? `${form.descricao.trim().length} caracteres`
            : "Mínimo de 3 caracteres"}
        </p>
      </div>

      {/* Peso e Volume lado a lado */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Peso (kg)
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={1}
              value={form.peso_kg || ""}
              onChange={(e) => update("peso_kg", Number(e.target.value))}
              placeholder="Ex: 500"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
              kg
            </span>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Volume (m³)
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.volume_m3 || ""}
              onChange={(e) => update("volume_m3", Number(e.target.value))}
              placeholder="Ex: 2.5"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
              m³
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═════════════════════════════════════════════════════════
     Step 2: Origem e Destino
     ═════════════════════════════════════════════════════════ */

  const renderStep2 = () => {
    const bothSelected =
      form.origem_cidade && form.origem_estado &&
      form.destino_cidade && form.destino_estado;
    const sameLocation =
      bothSelected &&
      form.origem_cidade === form.destino_cidade &&
      form.origem_estado === form.destino_estado;

    return (
      <div className="surface-card rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconMapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Origem e Destino
            </h2>
            <p className="text-sm text-gray-500">
              Selecione as cidades de coleta e entrega
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Origem */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">
                A
              </span>
              Origem
            </label>
            <div className="space-y-3">
              <select
                value={form.origem_cidade}
                onChange={(e) => update("origem_cidade", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Selecione a cidade...</option>
                {CIDADES.map((c) => (
                  <option key={`o-${c.nome}-${c.estado}`} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <select
                value={form.origem_estado}
                onChange={(e) => update("origem_estado", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Estado (UF)</option>
                {ESTADOS.map((uf) => (
                  <option key={`o-uf-${uf}`} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destino */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">
                B
              </span>
              Destino
            </label>
            <div className="space-y-3">
              <select
                value={form.destino_cidade}
                onChange={(e) => update("destino_cidade", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Selecione a cidade...</option>
                {CIDADES.map((c) => (
                  <option key={`d-${c.nome}-${c.estado}`} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <select
                value={form.destino_estado}
                onChange={(e) => update("destino_estado", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Estado (UF)</option>
                {ESTADOS.map((uf) => (
                  <option key={`d-uf-${uf}`} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visual route card */}
        {bothSelected && !sameLocation && (
          <div className="mt-6 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
            <div className="flex items-center justify-between">
              {/* Origin pill */}
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  A
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Origem
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {origemLabel}
                  </p>
                </div>
              </div>

              {/* Animated route line */}
              <div className="relative mx-4 flex flex-1 items-center px-4">
                <div className="h-0.5 w-full bg-blue-200">
                  <div className="h-full w-full animate-pulse bg-blue-400" />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <IconTruck className="h-5 w-5 text-blue-500" />
                </div>
              </div>

              {/* Destination pill */}
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                    Destino
                  </p>
                  <p className="text-right text-sm font-semibold text-gray-900">
                    {destinoLabel}
                  </p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                  B
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Same location warning */}
        {sameLocation && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">
              ⚠️ Origem e destino não podem ser iguais.
            </p>
            <p className="mt-1 text-amber-600">
              Selecione cidades diferentes para continuar.
            </p>
          </div>
        )}
      </div>
    );
  };

  /* ═════════════════════════════════════════════════════════
     Step 3: Datas e Requisitos
     ═════════════════════════════════════════════════════════ */

  const renderStep3 = () => {
    return (
      <div className="surface-card rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconCalendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Datas e Requisitos
            </h2>
            <p className="text-sm text-gray-500">
              Defina o prazo e necessidades especiais
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Data de Coleta
            </label>
            <div className="relative">
              <input
                type="date"
                value={form.data_coleta}
                onChange={(e) => update("data_coleta", e.target.value)}
                min={getTodayISO()}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-11 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <IconCalendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            {form.data_coleta && (
              <p className="mt-1 text-xs text-gray-400">
                {formatDate(form.data_coleta)}
              </p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Data de Entrega
            </label>
            <div className="relative">
              <input
                type="date"
                value={form.data_entrega}
                onChange={(e) => update("data_entrega", e.target.value)}
                min={form.data_coleta || getTodayISO()}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-11 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <IconCalendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            {form.data_entrega && (
              <p className="mt-1 text-xs text-gray-400">
                {formatDate(form.data_entrega)}
              </p>
            )}
          </div>
        </div>

        {/* Special requirements */}
        <fieldset>
          <legend className="mb-4 text-sm font-semibold text-gray-700">
            Requisitos Especiais
          </legend>
          <div className="space-y-3">
            {/* Refrigerado */}
            <label
              className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                form.refrigerado
                  ? "border-sky-300 bg-sky-50 shadow-[0_0_0_4px_rgba(14,165,233,0.06)]"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={form.refrigerado}
                  onChange={(e) => update("refrigerado", e.target.checked)}
                  className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <IconSnowflake
                    className={`h-5 w-5 ${
                      form.refrigerado ? "text-sky-600" : "text-gray-400"
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    Refrigerado
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  A carga necessita de controle de temperatura durante o transporte
                </p>
              </div>
            </label>

            {/* Perigoso */}
            <label
              className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                form.perigoso
                  ? "border-red-300 bg-red-50 shadow-[0_0_0_4px_rgba(239,68,68,0.06)]"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={form.perigoso}
                  onChange={(e) => update("perigoso", e.target.checked)}
                  className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <IconAlertTriangle
                    className={`h-5 w-5 ${
                      form.perigoso ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    Carga Perigosa
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Produtos classificados como perigosos conforme regulamentação ANTT
                </p>
              </div>
            </label>

            {/* Seguro */}
            <label
              className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                form.seguro
                  ? "border-emerald-300 bg-emerald-50 shadow-[0_0_0_4px_rgba(16,185,129,0.06)]"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  checked={form.seguro}
                  onChange={(e) => update("seguro", e.target.checked)}
                  className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <IconShield
                    className={`h-5 w-5 ${
                      form.seguro ? "text-emerald-600" : "text-gray-400"
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    Seguro de Carga
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Contratar seguro para proteção contra avarias e extravios
                </p>
              </div>
            </label>
          </div>
        </fieldset>
      </div>
    );
  };

  /* ═════════════════════════════════════════════════════════
     Step 4: Resumo e Publicar
     ═════════════════════════════════════════════════════════ */

  const renderStep4 = () => {
    const hasReqs = form.refrigerado || form.perigoso || form.seguro;

    return (
      <div className="surface-card rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Resumo da Cotação
            </h2>
            <p className="text-sm text-gray-500">
              Revise os dados antes de publicar
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Cargo summary */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">
            <div className="mb-3 flex items-center gap-2">
              <IconPackage className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Carga
              </h3>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Tipo</dt>
                <dd className="mt-0.5 font-medium text-gray-900">
                  {TIPOS_CARGA.find((t) => t.value === form.tipo_carga)?.icon}{" "}
                  {TIPOS_CARGA.find((t) => t.value === form.tipo_carga)?.label ?? form.tipo_carga}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Peso</dt>
                <dd className="mt-0.5 font-medium text-gray-900">
                  {form.peso_kg.toLocaleString("pt-BR")} kg
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Volume</dt>
                <dd className="mt-0.5 font-medium text-gray-900">
                  {form.volume_m3.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} m³
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-gray-400">Descrição</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {form.descricao}
                </dd>
              </div>
            </dl>
          </div>

          {/* Route summary */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">
            <div className="mb-3 flex items-center gap-2">
              <IconMapPin className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Rota
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">
                A
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {origemLabel}
              </span>
              <IconArrowRight className="h-4 w-4 text-gray-300" />
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">
                B
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {destinoLabel}
              </span>
            </div>
          </div>

          {/* Dates summary */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">
            <div className="mb-3 flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Datas
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Coleta</dt>
                <dd className="mt-0.5 font-medium text-gray-900">
                  {formatDate(form.data_coleta)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Entrega</dt>
                <dd className="mt-0.5 font-medium text-gray-900">
                  {formatDate(form.data_entrega)}
                </dd>
              </div>
            </div>
          </div>

          {/* Requirements summary */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">
            <div className="mb-3 flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Requisitos
              </h3>
            </div>
            {hasReqs ? (
              <div className="flex flex-wrap gap-2">
                {form.refrigerado && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-700">
                    <IconSnowflake className="h-3.5 w-3.5" />
                    Refrigerado
                  </span>
                )}
                {form.perigoso && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700">
                    <IconAlertTriangle className="h-3.5 w-3.5" />
                    Carga Perigosa
                  </span>
                )}
                {form.seguro && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700">
                    <IconShield className="h-3.5 w-3.5" />
                    Seguro
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Nenhum requisito especial</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ═════════════════════════════════════════════════════════
     Main render
     ═════════════════════════════════════════════════════════ */

  return (
    <div className="mx-auto max-w-3xl pb-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          Nova Cotação
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Solicite um orçamento de frete em apenas {TOTAL_STEPS} passos
        </p>
      </div>

      {renderProgressBar()}

      {/* Step content */}
      <div className="animate-in fade-in duration-300">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {renderNavigation()}
    </div>
  );
}

export default Cotar;
