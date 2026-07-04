import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package, TrendingUp, FileText, Star,
  ArrowUpRight, Plus, Truck, MapPin, Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency, formatDate } from "@/utils/format";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

/* ─── Types ───────────────────────────────────────────────── */

interface Freight {
  id: string;
  origin: string;
  destination: string;
  value: number;
  status: string;
  date: string;
}

interface DashboardData {
  activeFreights: number;
  monthlyRevenue: number;
  availableQuotes: number;
  rating: number;
  totalVehicles: number;
  totalDrivers: number;
  recentFreights: Freight[];
  loading: boolean;
  error: string | null;
}

/* ─── Component ──────────────────────────────────────────── */

export function Dashboard() {
  const profile = useAuthStore((s) => s.profile);
  const [data, setData] = useState<DashboardData>({
    activeFreights: 0,
    monthlyRevenue: 0,
    availableQuotes: 0,
    rating: 4.8,
    totalVehicles: 0,
    totalDrivers: 0,
    recentFreights: [],
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
        // Load orders for this carrier
        const { data: fretes, error: err1 } = await supabase
          .from("orders")
          .select("*, quotation:quotation_id(*)")
          .eq("carrier_id", profile.id)
          .order("created_at", { ascending: false });

        if (err1) throw err1;

        // Load fleet
        const { data: frota, error: err3 } = await supabase
          .from("fleet")
          .select("*")
          .eq("carrier_id", profile.id);

        if (err3) throw err3;

        // Load drivers
        const { data: motoristas, error: err4 } = await supabase
          .from("drivers")
          .select("*")
          .eq("carrier_id", profile.id);

        if (err4) throw err4;

        // Load available quotations (open/bidding, not created by this carrier)
        const { data: cotacoes, error: err5 } = await supabase
          .from("quotations")
          .select("*")
          .neq("shipper_id", profile.id)
          .in("status", ["open", "bidding"]);

        if (err5) throw err5;

        const orders = (fretes || []) as any[];
        const fleet = (frota || []) as any[];
        const drivers = (motoristas || []) as any[];
        const availableQuotesList = (cotacoes || []) as any[];

        // Calculate KPIs
        const activeFreights = orders.filter(
          (f: any) =>
            f.status === "confirmed" ||
            f.status === "picked_up" ||
            f.status === "in_transit",
        ).length;

        const monthlyRevenue = orders
          .filter((f: any) => f.status === "delivered")
          .reduce((sum: number, f: any) => sum + Number(f.price || 0), 0);

        const totalVehicles = fleet.length;
        const totalDrivers = drivers.length;
        const availableQuotes = availableQuotesList.length;

        // Recent freights (top 5)
        const recentFreights: Freight[] = orders.slice(0, 5).map((o: any) => {
          const q = o.quotation || {};
          return {
            id: o.id,
            origin: `${q.origin_city || ""}, ${q.origin_state || ""}`,
            destination: `${q.destination_city || ""}, ${q.destination_state || ""}`,
            value: Number(o.price) || 0,
            status: o.status === "pending" ? "ativo" :
                    o.status === "confirmed" ? "ativo" :
                    o.status === "picked_up" ? "em_andamento" :
                    o.status === "in_transit" ? "em_andamento" :
                    o.status === "delivered" ? "entregue" :
                    o.status === "cancelled" ? "cancelado" : "ativo",
            date: formatDate(o.created_at),
          };
        });

        setData({
          activeFreights,
          monthlyRevenue,
          availableQuotes,
          rating: 4.8,
          totalVehicles,
          totalDrivers,
          recentFreights,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("Carrier dashboard error:", err);
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
        </div>
      </div>
    );
  }

  /* ─── Error state ───────────────────────────────── */

  if (data.error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{data.error}</p>
        </div>
      </div>
    );
  }

  /* ─── Render ────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F111A]">Dashboard</h1>
          <p className="text-sm text-[#5E6278]">Visão geral da transportadora</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/carrier/rotas"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white no-underline transition-all hover:bg-[#1d4ed8] shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nova Rota
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Fretes Ativos"
          value={data.activeFreights.toString()}
          icon={Package}
          color="#2563eb"
          bgColor="bg-blue-50"
        />
        <KpiCard
          label="Faturamento (mês)"
          value={formatCurrency(data.monthlyRevenue)}
          icon={TrendingUp}
          color="#10b981"
          bgColor="bg-emerald-50"
        />
        <KpiCard
          label="Cotações"
          value={data.availableQuotes.toString()}
          icon={FileText}
          color="#f59e0b"
          bgColor="bg-amber-50"
        />
        <KpiCard
          label="Avaliação"
          value={`${data.rating}`}
          icon={Star}
          color="#8b5cf6"
          bgColor="bg-purple-50"
        />
        <KpiCard
          label="Veículos"
          value={data.totalVehicles.toString()}
          icon={Truck}
          color="#0ea5e9"
          bgColor="bg-sky-50"
        />
        <KpiCard
          label="Motoristas"
          value={data.totalDrivers.toString()}
          icon={Users}
          color="#ec4899"
          bgColor="bg-pink-50"
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ActionCard
          icon={MapPin}
          title="Gerenciar Rotas"
          desc="Cadastre e gerencie suas rotas"
          to="/carrier/rotas"
          color="#2563eb"
        />
        <ActionCard
          icon={Truck}
          title="Gerenciar Frota"
          desc="Cadastre veículos e motoristas"
          to="/carrier/frota"
          color="#10b981"
        />
        <ActionCard
          icon={Package}
          title="Ver Fretes"
          desc="Acompanhe fretes ativos e entregues"
          to="/carrier/fretes"
          color="#8b5cf6"
        />
      </div>

      {/* Recent freights table */}
      <div className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">
          <h2 className="text-base font-bold text-[#0F111A]">Últimos Fretes</h2>
          <Link
            to="/carrier/fretes"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] no-underline hover:text-[#1d4ed8]"
          >
            Ver todos
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.recentFreights.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#5E6278]">
            <Package className="mx-auto mb-2 h-8 w-8 text-[#94a3b8]" />
            <p className="text-sm font-medium">Nenhum frete ativo</p>
            <p className="mt-1 text-xs">Os fretes aparecerão aqui quando você aceitar ofertas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-xs font-semibold uppercase text-[#5E6278]">
                  <th className="px-6 py-3">Origem</th>
                  <th className="px-6 py-3">Destino</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {data.recentFreights.map((f) => (
                  <tr key={f.id} className="transition-colors hover:bg-[#f8fafc]">
                    <td className="px-6 py-4 font-medium text-[#0F111A]">{f.origin}</td>
                    <td className="px-6 py-4 text-[#5E6278]">{f.destination}</td>
                    <td className="px-6 py-4 font-medium text-[#0F111A]">
                      {formatCurrency(f.value)}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={f.status} />
                    </td>
                    <td className="px-6 py-4 text-[#5E6278]">{f.date}</td>
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
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 transition-all hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-bold text-[#0F111A]">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-[#5E6278]">{label}</p>
    </div>
  );
}

/* ─── Action Card ────────────────────────────────────────── */

function ActionCard({
  icon: Icon,
  title,
  desc,
  to,
  color,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  to: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 no-underline transition-all hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: color + "15" }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-[#0F111A]">{title}</p>
        <p className="text-xs text-[#5E6278]">{desc}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-[#5E6278]" />
    </Link>
  );
}

export default Dashboard;
