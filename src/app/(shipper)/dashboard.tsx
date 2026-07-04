import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency, formatDate } from "@/utils/format";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

/* ─── Types ───────────────────────────────────────────────── */

interface DashboardData {
  cotacoesAtivas: number;
  fretesAndamento: number;
  economiaTotal: number;
  recentes: any[];
  loading: boolean;
  error: string | null;
}

/* ─── Component ──────────────────────────────────────────── */

export function Dashboard() {
  const profile = useAuthStore((s) => s.profile);
  const [data, setData] = useState<DashboardData>({
    cotacoesAtivas: 0,
    fretesAndamento: 0,
    economiaTotal: 0,
    recentes: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!profile?.id) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    const fetchDashboard = async () => {
      try {
        // Fetch quotations
        const { data: cotacoes, error: err1 } = await supabase
          .from("quotations")
          .select("*")
          .eq("shipper_id", profile.id)
          .order("created_at", { ascending: false });

        if (err1) throw err1;

        // Fetch orders
        const { data: fretes, error: err2 } = await supabase
          .from("orders")
          .select("*")
          .eq("shipper_id", profile.id);

        if (err2) throw err2;

        // Calculate KPIs
        const cotacoesAtivas =
          (cotacoes || []).filter(
            (c: any) => c.status === "open" || c.status === "bidding",
          ).length;

        const fretesAndamento =
          (fretes || []).filter(
            (f: any) =>
              f.status === "confirmed" ||
              f.status === "picked_up" ||
              f.status === "in_transit",
          ).length;

        // Economy estimated as 15% of total delivered freight value (mock calculation)
        const totalGasto =
          (fretes || []).reduce(
            (sum: number, f: any) => sum + Number(f.price || 0),
            0,
          );
        const economiaTotal = Math.round(totalGasto * 0.15);

        // Recent quotations (top 5)
        const recentes: any[] = (cotacoes || [])
          .slice(0, 5)
          .map((c: any) => ({
            id: c.id,
            origem: `${c.origin_city || ""}, ${c.origin_state || ""}`,
            destino: `${c.destination_city || ""}, ${c.destination_state || ""}`,
            data: formatDate(c.created_at),
            status: c.status === "open" ? "aberta" : c.status === "bidding" ? "com_ofertas" : "fechada",
            ofertas: 0,
          }));

        setData({
          cotacoesAtivas,
          fretesAndamento,
          economiaTotal,
          recentes,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Erro ao carregar dashboard",
        }));
      }
    };

    fetchDashboard();
  }, [profile?.id]);

  /* ─── Loading state ─────────────────────────────── */

  if (data.loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  /* ─── Error state ───────────────────────────────── */

  if (data.error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{data.error}</p>
        </div>
      </div>
    );
  }

  /* ─── Render ────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral dos seus fretes</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <KpiCard
          label="Cotações Ativas"
          value={data.cotacoesAtivas.toString()}
          icon="💰"
          color="bg-blue-500"
        />
        <KpiCard
          label="Fretes em Andamento"
          value={data.fretesAndamento.toString()}
          icon="📦"
          color="bg-amber-500"
        />
        <KpiCard
          label="Economia Estimada"
          value={formatCurrency(data.economiaTotal)}
          icon="📉"
          color="bg-green-500"
        />
      </div>

      {/* Quick actions */}
      <div>
        <Link
          to="/shipper/cotar"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          ＋ Nova Cotação
        </Link>
      </div>

      {/* Recent quotes */}
      <div className="rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Últimas Cotações</h2>
          <Link
            to="/shipper/cotacoes"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            Ver todas →
          </Link>
        </div>

        {data.recentes.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <p className="text-sm">Nenhuma cotação criada ainda.</p>
            <Link
              to="/shipper/cotar"
              className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary-dark"
            >
              Criar primeira cotação →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <th className="px-6 py-3">Origem</th>
                  <th className="px-6 py-3">Destino</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Ofertas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.origem}</td>
                    <td className="px-6 py-4 text-gray-700">{c.destino}</td>
                    <td className="px-6 py-4 text-gray-500">{c.data}</td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-900">{c.ofertas} ofertas</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── KPI Card ───────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} bg-opacity-15`}>
          <span className="text-lg">{icon}</span>
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default Dashboard;
