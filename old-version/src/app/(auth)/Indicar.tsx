import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useReferral } from "@/hooks/useReferral";

export function Indicar() {
  const [userId, setUserId] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const { referralCode, stats, referrals, shareableLink, loading } = useReferral(userId);

  async function handleCopy() {
    if (!shareableLink) return;
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareableLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShareWhatsApp() {
    if (!shareableLink) return;
    const text = encodeURIComponent(
      `🚛 Faça parte da Tradexa Fretes! Use meu código de indicação e ganhe benefícios.\n\n🔗 ${shareableLink}\n\nPlataforma de fretes B2B inteligente com integração NCM.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  const rewards = [
    { icon: "🚛", title: "Indique 1 amigo", desc: "Ganhe 1 mês de plano Pro grátis" },
    { icon: "⭐", title: "Indique 3 amigos", desc: "Ganhe 1 mês de Premium grátis" },
    { icon: "👑", title: "Indique 5 amigos", desc: "Ganhe 1 mês de Enterprise grátis" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🤝 Programa de Indicação</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Convide transportadoras e embarcadores para a Tradexa Fretes e ganhe benefícios!
      </p>

      {loading ? (
        <div className="mt-8 animate-pulse space-y-4">
          <div className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referral code card */}
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-blue-50 p-6 dark:from-primary/10 dark:to-gray-900">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Seu código de indicação</h2>
              {referralCode ? (
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white px-6 py-3 font-mono text-2xl font-bold tracking-widest text-primary shadow-sm dark:bg-gray-800">
                      {referralCode}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                    >
                      {copied ? "✅ Copiado!" : "📋 Copiar"}
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Link: <span className="text-primary">{shareableLink}</span>
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
                    >
                      <span>📱</span> Compartilhar no WhatsApp
                    </button>
                    <button
                      onClick={handleCopy}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      📧 Copiar link
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">Carregando código...</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_referrals}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total de indicações</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.converted_referrals}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Convertidas</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.reward_earned ?? "—"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Recompensa atual</p>
              </div>
            </div>

            {/* History */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Histórico de indicações</h3>
              {referrals.length === 0 ? (
                <div className="mt-4 rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
                  <p className="text-3xl">🤝</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Você ainda não indicou ninguém. Compartilhe seu código!
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {referrals.map((ref: any) => (
                    <div key={ref.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {ref.referred?.name ?? ref.referred?.email ?? "Novo usuário"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(ref.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ref.status === "rewarded" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                        ref.status === "converted" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                        ref.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {ref.status === "rewarded" ? "✅ Recompensado" :
                         ref.status === "converted" ? "📦 Convertido" :
                         ref.status === "pending" ? "⏳ Pendente" : "❌ Expirado"}
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
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">🎁 Recompensas</h3>
              <div className="mt-4 space-y-4">
                {rewards.map((r, i) => (
                  <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-lg">{r.icon}</p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{r.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">💡 Como funciona</h3>
              <ol className="mt-3 space-y-2 text-xs text-amber-700 dark:text-amber-400">
                <li>1. Compartilhe seu código único</li>
                <li>2. A pessoa se cadastra usando o código</li>
                <li>3. Ambos ganham benefícios!</li>
                <li>4. Acompanhe suas indicações aqui</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
