import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@/utils/format";

interface AdminProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

interface AdminSubscription {
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
}

interface Aggregated {
  totalUsers: number;
  shippers: number;
  carriers: number;
  totalOrders: number;
  activeOrders: number;
  revenue: number;
}

export function Admin() {
  const profile = useAuthStore((s) => s.profile);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [agg, setAgg] = useState<Aggregated>({
    totalUsers: 0, shippers: 0, carriers: 0,
    totalOrders: 0, activeOrders: 0, revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "subscriptions" | "highlights">("overview");

  useEffect(() => {
    if (profile?.role === "admin") setIsAdmin(true);
  }, [profile]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  async function loadData() {
    setLoading(true);

    // Load profiles
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    const profilesData = p ?? [];
    setProfiles(profilesData);

    // Load subscriptions
    const { data: s } = await supabase
      .from("subscriptions")
      .select("*")
      .in("status", ["active", "trialing"]);
    setSubscriptions(s ?? []);

    // Aggregations
    const { data: orders } = await supabase.from("orders").select("*");
    const allOrders = orders ?? [];

    setAgg({
      totalUsers: profilesData.length,
      shippers: profilesData.filter((pr: any) => pr.role === "shipper").length,
      carriers: profilesData.filter((pr: any) => pr.role === "carrier").length,
      totalOrders: allOrders.length,
      activeOrders: allOrders.filter((o: any) => !["delivered", "cancelled"].includes(o.status as string)).length,
      revenue: allOrders
        .filter((o: any) => o.status === "delivered")
        .reduce((acc: number, o: any) => acc + Number(o.price ?? 0), 0),
    });

    setLoading(false);
  }

  async function handleToggleAdmin(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "shipper" : "admin";
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    loadData();
  }

  async function handleCancelSubscription(userId: string) {
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", userId);
    loadData();
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/30">
        <p className="text-4xl">🔒</p>
        <p className="mt-4 text-sm font-medium text-red-700 dark:text-red-400">Acesso restrito a administradores.</p>
      </div>
    );
  }

  const fmt = (v: number) => formatCurrency(v);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🔧 Admin</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gerencie usuários, assinaturas e dados da plataforma.</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
      ) : (
        <>
          {/* Tabs */}
          <div className="mt-6 flex gap-2 border-b border-gray-200 pb-0 dark:border-gray-700">
            {(["overview", "users", "subscriptions"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {t === "overview" ? "📊 Visão Geral" :
t === "users" ? "👥 Usuários" :
t === "subscriptions" ? "💳 Assinaturas" :
"⭐ Destaques"}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <div className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard icon="👥" label="Total de usuários" value={agg.totalUsers.toString()} color="blue" />
                <StatCard icon="📦" label="Embarcadores" value={agg.shippers.toString()} color="indigo" />
                <StatCard icon="🚛" label="Transportadoras" value={agg.carriers.toString()} color="amber" />
                <StatCard icon="📋" label="Total de pedidos" value={agg.totalOrders.toString()} color="green" />
                <StatCard icon="🔄" label="Pedidos ativos" value={agg.activeOrders.toString()} color="purple" />
                <StatCard icon="💰" label="Receita (entregues)" value={fmt(agg.revenue)} color="emerald" />
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Planos ativos</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Grátis</span>
                      <span className="font-medium">{subscriptions.filter((s) => s.plan === "free").length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Pro (R$ 97)</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{subscriptions.filter((s) => s.plan === "pro").length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Premium (R$ 79)</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">{subscriptions.filter((s) => s.plan === "premium").length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Enterprise (R$ 497)</span>
                      <span className="font-medium text-purple-600 dark:text-purple-400">{subscriptions.filter((s) => s.plan === "enterprise").length}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Receita recorrente estimada</span>
                        <span className="text-green-600 dark:text-green-400">
                          {fmt(
                            subscriptions.filter((s) => s.plan === "pro").length * 97 +
                            subscriptions.filter((s) => s.plan === "premium").length * 79 +
                            subscriptions.filter((s) => s.plan === "enterprise").length * 497
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Atividade recente</h3>
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                    {agg.totalOrders > 0
                      ? `📊 ${agg.totalOrders} pedidos no total, ${agg.activeOrders} ativos.`
                      : "Nenhum pedido ainda."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Nome</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Data</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((pr) => {
                    const sub = subscriptions.find((s) => s.user_id === pr.id);
                    return (
                      <tr key={pr.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{pr.name ?? "—"}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{pr.email}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            pr.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                            pr.role === "carrier" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          }`}>
                            {pr.role === "admin" ? "🔧 Admin" :
                             pr.role === "carrier" ? "🚛 Transportadora" : "📦 Embarcador"}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-400 dark:text-gray-500">
                          {new Date(pr.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            {sub && sub.plan !== "free" && (
                              <button
                                onClick={() => handleCancelSubscription(pr.id)}
                                className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                              >
                                Cancelar assinatura
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleAdmin(pr.id, pr.role)}
                              className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                              {pr.role === "admin" ? "Remover admin" : "Tornar admin"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Subscriptions */}
          {tab === "subscriptions" && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Usuário</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Plano</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Período</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const profile = profiles.find((p) => p.id === sub.user_id);
                    const planValues: Record<string, number> = {
                      free: 0, pro: 97, premium: 79, enterprise: 497,
                    };
                    return (
                      <tr key={sub.user_id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 font-medium text-gray-900 dark:text-gray-100">
                          {profile?.name ?? profile?.email ?? sub.user_id.slice(0, 8)}
                        </td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            sub.plan === "pro" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                            sub.plan === "premium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                            sub.plan === "enterprise" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {sub.plan}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            sub.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                            sub.status === "trialing" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-500 dark:text-gray-400">
                          {sub.current_period_end
                            ? `até ${new Date(sub.current_period_end).toLocaleDateString("pt-BR")}`
                            : "—"}
                        </td>
                        <td className="py-3 font-medium">
                          {sub.plan === "free" ? "Grátis" :
                           `R$ ${planValues[sub.plan] ?? 0}/mês`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Highlights */}
          {tab === "highlights" && (
            <div className="mt-6">
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Gerencie transportadoras em destaque. Transportadoras destacadas aparecem primeiro no auto-cálculo.
              </p>
              <HighlightsManager />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HighlightsManager() {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => { loadCarriers(); }, []);

  async function loadCarriers() {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, role, is_featured, featured_until")
      .eq("role", "carrier")
      .order("name", { ascending: true });

    setCarriers(data ?? []);
    setLoading(false);
  }

  async function handleToggle(carrierId: string, currentlyFeatured: boolean) {
    setToggling(carrierId);
    const { error } = await supabase.rpc("toggle_carrier_featured", {
      p_carrier_id: carrierId,
      p_featured: !currentlyFeatured,
      p_days: 30,
    });
    if (error) {
      alert("Erro: " + error.message);
    }
    setToggling(null);
    loadCarriers();
  }

  if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>;

  if (carriers.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
        <p className="text-3xl">🚛</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Nenhuma transportadora cadastrada.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Transportadora</th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Válido até</th>
            <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {carriers.map((c: any) => (
            <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-3 font-medium text-gray-900 dark:text-gray-100">
                {c.name ?? "—"}
                {c.is_featured && <span className="ml-2 text-xs">⭐</span>}
              </td>
              <td className="py-3 text-gray-600 dark:text-gray-400">{c.email}</td>
              <td className="py-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  c.is_featured ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {c.is_featured ? "⭐ Destaque" : "Normal"}
                </span>
              </td>
              <td className="py-3 text-xs text-gray-400 dark:text-gray-500">
                {c.featured_until
                  ? new Date(c.featured_until).toLocaleDateString("pt-BR")
                  : "—"}
              </td>
              <td className="py-3">
                <button
                  onClick={() => handleToggle(c.id, c.is_featured)}
                  disabled={toggling === c.id}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                    c.is_featured
                      ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                      : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40"
                  }`}
                >
                  {toggling === c.id ? "..." :
                   c.is_featured ? "Remover destaque" : "⭐ Destacar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const bg: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg[color] ?? "bg-gray-100 dark:bg-gray-800"} text-lg`}>{icon}</span>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default Admin;
