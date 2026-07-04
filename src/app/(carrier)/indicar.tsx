import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import {
  Copy,
  Check,
  Share2,
  Truck,
  UserPlus,
  Trophy,
  Clock,
  X,
  MessageCircle,
  Mail,
  LinkIcon,
  Zap,
  ChevronRight,
} from "lucide-react";

type ReferralRow = {
  id: string;
  referrer_id: string;
  referred_id: string;
  code_used: string;
  status: string;
  created_at: string | null;
  converted_at: string | null;
  rewarded_at: string | null;
  reward_referrer: string | null;
  reward_referred: string | null;
  referred?: { name: string | null; email: string | null } | null;
};

type ReferralStats = {
  total_referrals: number;
  converted_referrals: number;
  rewarded_referrals: number;
  pending_referrals: number;
  reward_earned: string;
};

function generateReferralCode(userId: string): string {
  const hash = userId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `TF-${hash}`;
}

export function Indicar() {
  const profile = useAuthStore((s) => s.profile);
  const [userId, setUserId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    converted_referrals: 0,
    rewarded_referrals: 0,
    pending_referrals: 0,
    reward_earned: "—",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve user id
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      const id = session?.user?.id ?? profile?.id ?? null;
      if (mounted) setUserId(id);
    });
    return () => {
      mounted = false;
    };
  }, [profile]);

  const loadData = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Ensure referral code exists
      const code = generateReferralCode(uid);
      const { data: existingCode } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", uid)
        .maybeSingle();

      if (!existingCode) {
        await supabase.from("referral_codes").upsert(
          { user_id: uid, code },
          { onConflict: "user_id" }
        );
      }
      setReferralCode(existingCode?.code ?? code);

      // 2. Load referrals with referred profile data
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select(
          "id, referrer_id, referred_id, code_used, status, created_at, converted_at, rewarded_at, reward_referrer, reward_referred, referred:profiles!referrals_referred_id_fkey(name, email)"
        )
        .eq("referrer_id", uid)
        .order("created_at", { ascending: false });

      if (referralsError) throw referralsError;

      const rows: ReferralRow[] = (referralsData ?? []) as unknown as ReferralRow[];
      setReferrals(rows);

      const converted = rows.filter((r) =>
        ["converted", "rewarded"].includes(r.status)
      ).length;
      const rewarded = rows.filter((r) => r.status === "rewarded").length;
      const pending = rows.filter((r) => r.status === "pending").length;

      const rewardText = rewarded
        ? `${rewarded} recompensa${rewarded > 1 ? "s" : ""}`
        : converted >= 3
          ? "1 mês Premium"
          : converted >= 1
            ? "1 mês Pro"
            : pending >= 1
              ? "Em andamento"
              : "—";

      setStats({
        total_referrals: rows.length,
        converted_referrals: converted,
        rewarded_referrals: rewarded,
        pending_referrals: pending,
        reward_earned: rewardText,
      });
    } catch (e: any) {
      console.error("[Indicar] loadData error:", e);
      setError(e?.message ?? "Erro ao carregar indicações");

      // Fallback: localStorage
      const stored = localStorage.getItem(`referrals_${uid}`);
      const localRows: ReferralRow[] = stored ? JSON.parse(stored) : [];
      setReferrals(localRows);
      const converted = localRows.filter((r) =>
        ["converted", "rewarded"].includes(r.status)
      ).length;
      const rewarded = localRows.filter((r) => r.status === "rewarded").length;
      const pending = localRows.filter((r) => r.status === "pending").length;
      setStats({
        total_referrals: localRows.length,
        converted_referrals: converted,
        rewarded_referrals: rewarded,
        pending_referrals: pending,
        reward_earned: rewarded
          ? `${rewarded} recompensa${rewarded > 1 ? "s" : ""}`
          : converted >= 3
            ? "1 mês Premium"
            : converted >= 1
              ? "1 mês Pro"
              : pending >= 1
                ? "Em andamento"
                : "—",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadData(userId);
    }
  }, [userId, loadData]);

  const shareableLink = userId
    ? `${window.location.origin}/cadastro?ref=${referralCode}`
    : "";

  async function handleCopy(text?: string) {
    const target = text ?? shareableLink;
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = target;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleShareWhatsApp() {
    if (!shareableLink) return;
    const text = encodeURIComponent(
      `🚛 Junte-se à TradeXa Fretes! Use meu código de indicação e ganhe benefícios exclusivos.\n\n🔗 ${shareableLink}\n\nPlataforma B2B inteligente para transportadoras e embarcadores.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleShareEmail() {
    if (!shareableLink) return;
    const subject = encodeURIComponent("Indicação TradeXa Fretes");
    const body = encodeURIComponent(
      `Olá!\n\nConheça a TradeXa Fretes, a plataforma B2B inteligente para fretes.\n\nUse meu link de indicação: ${shareableLink}\n\nAbraços!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  }

  function statusBadge(status: string) {
    switch (status) {
      case "rewarded":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Trophy className="h-3 w-3" /> Recompensado
          </span>
        );
      case "converted":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Check className="h-3 w-3" /> Convertido
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <Clock className="h-3 w-3" /> Pendente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            Expirado
          </span>
        );
    }
  }

  const rewards = [
    {
      icon: <Truck className="h-5 w-5 text-[#2563eb]" />,
      title: "Indique 1 transportadora",
      desc: "Ganhe 1 mês de plano Pro grátis",
      threshold: 1,
    },
    {
      icon: <Zap className="h-5 w-5 text-[#2563eb]" />,
      title: "Indique 3 transportadoras",
      desc: "Ganhe 1 mês de Premium grátis",
      threshold: 3,
    },
    {
      icon: <Trophy className="h-5 w-5 text-[#2563eb]" />,
      title: "Indique 5 transportadoras",
      desc: "Ganhe 1 mês de Enterprise grátis",
      threshold: 5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Programa de Indicação
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convide transportadoras e embarcadores para a TradeXa Fretes e ganhe
          benefícios exclusivos.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-4 animate-pulse space-y-4">
          <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referral card */}
            <div className="rounded-2xl border border-dashed border-[#2563eb]/30 bg-gradient-to-br from-[#2563eb]/5 to-blue-50 p-6 dark:from-[#2563eb]/10 dark:to-gray-900">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Seu link de indicação
                </h2>
                <button
                  onClick={() => setShareOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1d4ed8] transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </button>
              </div>

              {referralCode ? (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {shareableLink}
                    </div>
                    <button
                      onClick={() => handleCopy()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Copiar link
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Código:
                    </span>
                    <span className="rounded-lg bg-white px-3 py-1 font-mono text-sm font-bold tracking-wider text-[#2563eb] shadow-sm dark:bg-gray-800">
                      {referralCode}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
                  Carregando código...
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total_referrals}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total de indicações
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.converted_referrals}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Convertidas
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.rewarded_referrals}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recompensadas
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.reward_earned}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recompensa atual
                </p>
              </div>
            </div>

            {/* History */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Transportadoras indicadas
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {referrals.length} registros
                </span>
              </div>

              {referrals.length === 0 ? (
                <div className="mt-4 rounded-xl bg-gray-50 p-8 text-center dark:bg-gray-800">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb]/10">
                    <UserPlus className="h-6 w-6 text-[#2563eb]" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Você ainda não indicou ninguém
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Compartilhe seu link e comece a ganhar recompensas.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {referrals.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb]/10">
                          <Truck className="h-5 w-5 text-[#2563eb]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {ref.referred?.name ??
                              ref.referred?.email ??
                              "Novo usuário"}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {ref.created_at
                              ? new Date(ref.created_at).toLocaleDateString(
                                  "pt-BR"
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                      {statusBadge(ref.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Rewards */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Recompensas
              </h3>
              <div className="mt-4 space-y-3">
                {rewards.map((r) => {
                  const reached = stats.converted_referrals >= r.threshold;
                  return (
                    <div
                      key={r.threshold}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                        reached
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                          : "border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          reached
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40"
                            : "bg-white text-[#2563eb] shadow-sm dark:bg-gray-700"
                        }`}
                      >
                        {reached ? <Check className="h-4 w-4" /> : r.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {r.desc}
                        </p>
                      </div>
                      {reached && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          OK
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Como funciona
              </h3>
              <ol className="mt-3 space-y-3">
                {[
                  "Copie seu link exclusivo de indicação",
                  "Envie para transportadoras e embarcadores",
                  "A pessoa se cadastra usando seu link",
                  "Ambos ganham benefícios automaticamente",
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Compartilhar indicação
              </h3>
              <button
                onClick={() => setShareOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Escolha como deseja enviar seu link de indicação.
            </p>

            <div className="mt-5 space-y-3">
              <button
                onClick={handleShareWhatsApp}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-green-50 hover:text-green-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-green-900/20 dark:hover:text-green-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p>WhatsApp</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Enviar mensagem direta
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>

              <button
                onClick={handleShareEmail}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p>E-mail</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Abrir cliente de e-mail
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>

              <button
                onClick={() => handleCopy()}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-800/70"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700">
                  {copied ? (
                    <Check className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <LinkIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p>{copied ? "Link copiado!" : "Copiar link"}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {copied
                      ? "Pronto para colar onde quiser"
                      : "Copiar para área de transferência"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Link de indicação
              </p>
              <p className="mt-1 break-all text-sm font-medium text-[#2563eb]">
                {shareableLink}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Indicar;
