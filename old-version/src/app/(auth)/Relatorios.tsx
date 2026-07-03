import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface MonthlyStats {
  month: string;
  quotations: number;
  bids: number;
  orders: number;
  revenue: number;
}

interface DashboardMetrics {
  totalQuotations: number;
  totalOrders: number;
  conversionRate: number;
  avgFreightValue: number;
  activeUsers: number;
  monthlyGrowth: number;
}

export function Relatorios() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalQuotations: 0, totalOrders: 0, conversionRate: 0,
    avgFreightValue: 0, activeUsers: 0, monthlyGrowth: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [statusDist, setStatusDist] = useState<Record<string, number>>({});
  const [planDist, setPlanDist] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<"overview" | "quotations" | "financial">("overview");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);

    // ── Quotations ──
    const { data: quotations } = await supabase.from("quotations").select("*");
    const qs = quotations ?? [];

    // ── Bids ──
    const { data: bids } = await supabase.from("quotation_bids").select("*");
    const bs = bids ?? [];

    // ── Orders ──
    const { data: orders } = await supabase.from("orders").select("*");
    const os = orders ?? [];

    // ── Profiles ──
    const { data: profiles } = await supabase.from("profiles").select("role");
    const ps = profiles ?? [];

    // ── Subscriptions ──
    const { data: subs } = await supabase.from("subscriptions").select("plan, status");
    const sbs = subs ?? [];

    // Status distribution
    const statusCount: Record<string, number> = {};
    for (const q of qs) {
      const s = (q as any).status ?? "unknown";
      statusCount[s] = (statusCount[s] || 0) + 1;
    }
    setStatusDist(statusCount);

    // Plan distribution
    const planCount: Record<string, number> = {};
    for (const s of sbs) {
      const p = (s as any).plan ?? "free";
      planCount[p] = (planCount[p] || 0) + 1;
    }
    setPlanDist(planCount);

    // Monthly stats (last 6 months)
    const months: MonthlyStats[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toISOString().slice(0, 7);

      const monthQs = qs.filter((q: any) => q.created_at?.startsWith(month));
      const monthBs = bs.filter((b: any) => b.created_at?.startsWith(month));
      const monthOs = os.filter((o: any) => o.created_at?.startsWith(month));

      months.push({
        month,
        quotations: monthQs.length,
        bids: monthBs.length,
        orders: monthOs.length,
        revenue: monthOs
          .filter((o: any) => o.status === "delivered")
          .reduce((acc: number, o: any) => acc + Number(o.price ?? 0), 0),
      });
    }
    setMonthlyData(months);

    // Metrics
    const totalQs = qs.length;
    const totalOs = os.length;
    setMetrics({
      totalQuotations: totalQs,
      totalOrders: totalOs,
      conversionRate: totalQs > 0 ? Math.round((totalOs / totalQs) * 100) : 0,
      avgFreightValue: totalOs > 0
        ? os.reduce((acc: number, o: any) => acc + Number(o.price ?? 0), 0) / totalOs
        : 0,
      activeUsers: ps.length,
      monthlyGrowth: months.length >= 2 && months[months.length - 2].quotations > 0
        ? Math.round(((months[months.length - 1].quotations - months[months.length - 2].quotations) / months[months.length - 2].quotations) * 100)
        : 0,
    });

    setLoading(false);
  }

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const monthLabel = (m: string) => {
    const [y, mo] = m.split("-");
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${months[parseInt(mo) - 1]}/${y.slice(2)}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📊 Relatórios</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Métricas e analytics da plataforma
          </p>
        </div>
        <button
          onClick={loadData}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon="📦" label="Cotações" value={metrics.totalQuotations.toString()} color="blue" />
        <KpiCard icon="📋" label="Pedidos" value={metrics.totalOrders.toString()} color="green" />
        <KpiCard icon="📈" label="Conversão" value={`${metrics.conversionRate}%`} color={metrics.conversionRate > 30 ? "green" : "amber"} />
        <KpiCard icon="💰" label="Ticket médio" value={fmt(metrics.avgFreightValue)} color="purple" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <KpiCard icon="👥" label="Usuários ativos" value={metrics.activeUsers.toString()} color="indigo" />
        <KpiCard icon="📊" label="Crescimento mensal" value={`${metrics.monthlyGrowth >= 0 ? "+" : ""}${metrics.monthlyGrowth}%`} color={metrics.monthlyGrowth >= 0 ? "green" : "red"} />
        <KpiCard icon="💳" label="Planos pagos" value={Object.entries(planDist).filter(([k]) => k !== "free").reduce((a, [, v]) => a + v, 0).toString()} color="amber" />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-gray-200 pb-0 dark:border-gray-700">
        {(["overview", "quotations", "financial"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t === "overview" ? "📈 Visão geral" :
             t === "quotations" ? "📦 Cotações" : "💰 Financeiro"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Monthly chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Atividade mensal</h3>
            <div className="mt-4">
              <div className="flex items-end gap-2" style={{ height: 160 }}>
                {monthlyData.map((m, i) => {
                  const max = Math.max(...monthlyData.map((x) => x.quotations + x.orders), 1);
                  const h = ((m.quotations + m.orders) / max) * 140;
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{m.orders}</span>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-primary/70 to-primary"
                        style={{ height: `${Math.max(h, 4)}px` }}
                        title={`${m.quotations} cotações, ${m.orders} pedidos`}
                      />
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{monthLabel(m.month)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span><span className="inline-block h-2 w-2 rounded bg-primary/70" /> Cotações + Pedidos</span>
              </div>
            </div>
          </div>

          {/* Status distribution */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Status das cotações</h3>
            <div className="mt-4 space-y-3">
              {Object.entries(statusDist).map(([status, count]) => {
                const total = Object.values(statusDist).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const statusColors: Record<string, string> = {
                  open: "bg-blue-500", bidding: "bg-amber-500", closed: "bg-green-500", cancelled: "bg-gray-400",
                };
                const statusLabels: Record<string, string> = {
                  open: "Aberta", bidding: "Em disputa", closed: "Fechada", cancelled: "Cancelada",
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{statusLabels[status] ?? status}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{count} ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`h-2 rounded-full ${statusColors[status] ?? "bg-gray-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(statusDist).length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500">Nenhuma cotação ainda.</p>
              )}
            </div>
          </div>

          {/* Plan distribution */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Distribuição de planos</h3>
            <div className="mt-4 space-y-3">
              {Object.entries(planDist).map(([plan, count]) => {
                const total = Object.values(planDist).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const planColors: Record<string, string> = {
                  free: "bg-gray-400", pro: "bg-blue-500", premium: "bg-amber-500", enterprise: "bg-purple-500",
                };
                return (
                  <div key={plan}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium capitalize text-gray-600 dark:text-gray-400">
                        {plan === "free" ? "Grátis" : plan}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{count} ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`h-2 rounded-full ${planColors[plan] ?? "bg-gray-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly revenue */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Receita mensal</h3>
            <div className="mt-4">
              <div className="flex items-end gap-2" style={{ height: 160 }}>
                {monthlyData.map((m, i) => {
                  const max = Math.max(...monthlyData.map((x) => x.revenue), 1);
                  const h = (m.revenue / max) * 140;
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                        {m.revenue > 0 ? fmt(m.revenue).slice(0, -3) : ""}
                      </span>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-green-400 to-green-500"
                        style={{ height: `${Math.max(h, 4)}px` }}
                      />
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{monthLabel(m.month)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "quotations" && (
        <div className="mt-6">
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Mês</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Cotações</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Lances</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Pedidos</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Conversão</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Receita</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{monthLabel(m.month)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{m.quotations}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{m.bids}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{m.orders}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${m.quotations > 0 ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                        {m.quotations > 0 ? `${Math.round((m.orders / m.quotations) * 100)}%` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-green-700 dark:text-green-400">{fmt(m.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "financial" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Receita recorrente (MRR)</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pro (R$ 97)</span>
                <span className="font-medium">{(planDist.pro ?? 0) * 97}/mês</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Premium (R$ 79)</span>
                <span className="font-medium">{(planDist.premium ?? 0) * 79}/mês</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Enterprise (R$ 497)</span>
                <span className="font-medium">{(planDist.enterprise ?? 0) * 497}/mês</span>
              </div>
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="flex justify-between text-sm font-semibold">
                  <span>MRR Total</span>
                  <span className="text-green-600 dark:text-green-400">
                    {fmt(
                      (planDist.pro ?? 0) * 97 +
                      (planDist.premium ?? 0) * 79 +
                      (planDist.enterprise ?? 0) * 497
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Projeção anual</h3>
            <p className="mt-4 text-3xl font-bold text-green-600 dark:text-green-400">
              {fmt(
                ((planDist.pro ?? 0) * 97 +
                (planDist.premium ?? 0) * 79 +
                (planDist.enterprise ?? 0) * 497) * 12
              )}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Receita recorrente anual estimada (ARR)</p>
            <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 Dica: aumentar conversão de grátis para pago em 5% gera ~
                <strong>{fmt((planDist.free ?? 0) * 0.05 * 97)}</strong>/mês adicionais.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon, label, value, color,
}: {
  icon: string; label: string; value: string; color: string;
}) {
  const bg: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30",
    red: "bg-red-100 dark:bg-red-900/30",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg[color] ?? "bg-gray-100 dark:bg-gray-800"} text-lg`}>
          {icon}
        </span>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
}
