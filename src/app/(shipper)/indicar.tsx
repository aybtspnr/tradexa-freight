import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

type ReferralStatus = "pending" | "converted" | "rewarded" | "expired";

interface ReferralEntry {
  id: string;
  referred_name: string;
  referred_email: string;
  status: ReferralStatus;
  created_at: string;
}

interface ReferralStats {
  total_referrals: number;
  converted_referrals: number;
  reward_earned: string;
}

function generateReferralCode(userId: string): string {
  const hash = userId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `TF-${hash}`;
}

export function Indicar() {
  const profile = useAuthStore((s) => s.profile);
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    converted_referrals: 0,
    reward_earned: "—",
  });
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const id = session?.user?.id ?? profile?.id ?? null;
      if (id) setUserId(id);
    });
  }, [profile]);

  useEffect(() => {
    if (userId) {
      loadReferralData(userId);
    }
  }, [userId]);

  async function ensureReferralCode(uid: string): Promise<string> {
    const code = generateReferralCode(uid);
    const { data } = await supabase
      .from("api_keys")
      .select("id,key")
      .eq("user_id", uid)
      .eq("name", "referral_code")
      .maybeSingle();

    if (data) {
      return data.key;
    }

    const { error } = await supabase.from("api_keys").insert({
      user_id: uid,
      name: "referral_code",
      key: code,
      active: true,
    } as any);

    if (error) {
      console.error("[Indicar] Failed to save referral code:", error);
    }
    return code;
  }

  async function loadReferralData(uid: string) {
    setLoading(true);
    try {
      await ensureReferralCode(uid);

      const { data: supabaseReferrals, error: refError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", uid)
        .order("created_at", { ascending: false });

      let referralList: ReferralEntry[] = [];
      if (!refError && supabaseReferrals && supabaseReferrals.length > 0) {
        referralList = supabaseReferrals as unknown as ReferralEntry[];
      } else {
        const stored = localStorage.getItem(`referrals_${uid}`);
        if (stored) {
          referralList = JSON.parse(stored) as ReferralEntry[];
        }
      }

      setReferrals(referralList);

      const converted = referralList.filter((r) =>
        ["converted", "rewarded"].includes(r.status),
      ).length;

      let reward = "—";
      if (referralList.some((r) => r.status === "rewarded")) {
        reward = "1 mês Pro";
      } else if (referralList.length >= 5) {
        reward = "1 mês Enterprise";
      } else if (referralList.length >= 3) {
        reward = "1 mês Premium";
      } else if (referralList.length >= 1) {
        reward = "1 mês Pro";
      }

      setStats({
        total_referrals: referralList.length,
        converted_referrals: converted,
        reward_earned: reward,
      });
    } finally {
      setLoading(false);
    }
  }

  const referralCode = userId ? generateReferralCode(userId) : "";
  const shareableLink = userId
    ? `${window.location.origin}/cadastro?ref=${referralCode}`
    : "";

  async function handleCopy() {
    if (!shareableLink) return;
    try {
      await navigator.clipboard.writeText(shareableLink);
    } catch {
      const input = document.createElement("input");
      input.value = shareableLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareWhatsApp() {
    if (!shareableLink) return;
    const text = encodeURIComponent(
      `🚛 Faça parte da Tradexa Fretes! Use meu código de indicação e ganhe benefícios exclusivos.\n\n🔗 ${shareableLink}\n\nPlataforma de fretes B2B inteligente com integração NCM.`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleShareEmail() {
    if (!shareableLink) return;
    const subject = encodeURIComponent("Indicação Tradexa Fretes");
    const body = encodeURIComponent(
      `Olá!\n\nConheça a Tradexa Fretes, a plataforma B2B inteligente para fretes com integração NCM.\n\nUse meu link de indicação: ${shareableLink}\n\nAbraços!`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  }

  const rewards = [
    { count: 1, title: "1 indicação", desc: "1 mês de plano Pro grátis" },
    { count: 3, title: "3 indicações", desc: "1 mês de Premium grátis" },
    { count: 5, title: "5 indicações", desc: "1 mês de Enterprise grátis" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          🤝 Programa de Indicação
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Convide transportadoras e embarcadores para a Tradexa Fretes e ganhe
          benefícios!
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
            <div className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
            <div className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Referral code card */}
            <div className="rounded-xl border-2 border-dashed border-[#2563eb]/30 bg-gradient-to-br from-[#2563eb]/5 to-blue-50 p-6 dark:from-[#2563eb]/10 dark:to-gray-900">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Seu código de indicação
              </h2>
              {referralCode ? (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-lg bg-white px-6 py-3 font-mono text-2xl font-bold tracking-widest text-[#2563eb] shadow-sm dark:bg-gray-800">
                      {referralCode}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-medium text-white hover:bg-[#1d4ed8] transition-colors"
                    >
                      {copied ? "✅ Copiado!" : "📋 Copiar"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                    Link:{" "}
                    <span className="text-[#2563eb]">{shareableLink}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
                    >
                      <span>📱</span> WhatsApp
                    </button>
                    <button
                      onClick={handleShareEmail}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      <span>📧</span> E-mail
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      <span>🔗</span> Mais opções
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  Carregando código...
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total_referrals}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total de indicações
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.converted_referrals}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Convertidas
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
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Histórico de indicações
              </h3>
              {referrals.length === 0 ? (
                <div className="mt-4 rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">
                  <p className="text-3xl">🤝</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Você ainda não indicou ninguém. Compartilhe seu código!
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {referrals.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {ref.referred_name ||
                            ref.referred_email ||
                            "Novo usuário"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(ref.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ref.status === "rewarded"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : ref.status === "converted"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : ref.status === "pending"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {ref.status === "rewarded"
                          ? "✅ Recompensado"
                          : ref.status === "converted"
                            ? "📦 Convertido"
                            : ref.status === "pending"
                              ? "⏳ Pendente"
                              : "❌ Expirado"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rewards sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                🎁 Recompensas
              </h3>
              <div className="mt-4 space-y-4">
                {rewards.map((r) => {
                  const reached =
                    (r.count === 1 && stats.total_referrals >= 1) ||
                    (r.count === 3 && stats.total_referrals >= 3) ||
                    (r.count === 5 && stats.total_referrals >= 5);
                  return (
                    <div
                      key={r.count}
                      className={`rounded-lg border p-3 transition-colors ${
                        reached
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {r.title}
                        </p>
                        {reached && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Concluído
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {r.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                💡 Como funciona
              </h3>
              <ol className="mt-3 space-y-2 text-xs text-amber-700 dark:text-amber-400">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Compartilhe seu código único com amigos.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>A pessoa se cadastra usando seu link.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Ambos ganham benefícios automaticamente!</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Acompanhe suas indicações e recompensas aqui.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Compartilhar
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Escolha como deseja compartilhar seu link de indicação.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  handleShareWhatsApp();
                  setShowShareModal(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors dark:border-green-800 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
              >
                <span className="text-xl">📱</span> WhatsApp
              </button>
              <button
                onClick={() => {
                  handleShareEmail();
                  setShowShareModal(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="text-xl">📧</span> E-mail
              </button>
              <button
                onClick={() => {
                  handleCopy();
                  setShowShareModal(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-[#2563eb]/20 bg-[#2563eb]/5 px-4 py-3 text-sm font-medium text-[#2563eb] hover:bg-[#2563eb]/10 transition-colors dark:border-[#2563eb]/30 dark:bg-[#2563eb]/10 dark:text-blue-300 dark:hover:bg-[#2563eb]/20"
              >
                <span className="text-xl">🔗</span> Copiar link
              </button>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Seu código:{" "}
                <span className="font-mono font-bold text-gray-600 dark:text-gray-300">
                  {referralCode}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Indicar;
