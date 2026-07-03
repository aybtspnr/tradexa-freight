import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package, TrendingUp, FileText, Star,
  ArrowUpRight, Plus, Truck, MapPin, Users,
} from "lucide-react";

interface Freight {
  id: string;
  origin: string;
  destination: string;
  value: number;
  status: "active" | "in_transit" | "delivered" | "cancelled";
  date: string;
}

const MOCK_FRETES: Freight[] = [
  { id: "1", origin: "São Paulo, SP", destination: "Rio de Janeiro, RJ", value: 4500, status: "active", date: "15/06/2026" },
  { id: "2", origin: "Belo Horizonte, MG", destination: "Vitória, ES", value: 3200, status: "in_transit", date: "14/06/2026" },
  { id: "3", origin: "Curitiba, PR", destination: "Florianópolis, SC", value: 2800, status: "delivered", date: "12/06/2026" },
  { id: "4", origin: "Brasília, DF", destination: "Goiânia, GO", value: 1900, status: "active", date: "16/06/2026" },
  { id: "5", origin: "Salvador, BA", destination: "Recife, PE", value: 5100, status: "delivered", date: "10/06/2026" },
];

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  in_transit: "Em trânsito",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-blue-50 text-blue-700 border-blue-200",
  in_transit: "bg-amber-50 text-amber-700 border-amber-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export function Dashboard() {
  const kpis = useMemo(
    () => ({
      activeFreights: MOCK_FRETES.filter((f) => f.status === "active" || f.status === "in_transit").length,
      monthlyRevenue: MOCK_FRETES.filter((f) => f.status === "delivered").reduce((s, f) => s + f.value, 0),
      availableQuotes: 12,
      rating: 4.8,
      totalVehicles: 6,
      totalDrivers: 8,
    }),
    [],
  );

  const recentFreights = useMemo(() => MOCK_FRETES.slice(0, 5), []);

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
          value={kpis.activeFreights.toString()}
          icon={Package}
          color="#2563eb"
          bgColor="bg-blue-50"
        />
        <KpiCard
          label="Faturamento (mês)"
          value={`R$ ${kpis.monthlyRevenue.toLocaleString("pt-BR")}`}
          icon={TrendingUp}
          color="#10b981"
          bgColor="bg-emerald-50"
        />
        <KpiCard
          label="Cotações"
          value={kpis.availableQuotes.toString()}
          icon={FileText}
          color="#f59e0b"
          bgColor="bg-amber-50"
        />
        <KpiCard
          label="Avaliação"
          value={`${kpis.rating}`}
          icon={Star}
          color="#8b5cf6"
          bgColor="bg-purple-50"
        />
        <KpiCard
          label="Veículos"
          value={kpis.totalVehicles.toString()}
          icon={Truck}
          color="#0ea5e9"
          bgColor="bg-sky-50"
        />
        <KpiCard
          label="Motoristas"
          value={kpis.totalDrivers.toString()}
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
              {recentFreights.map((f) => (
                <tr key={f.id} className="transition-colors hover:bg-[#f8fafc]">
                  <td className="px-6 py-4 font-medium text-[#0F111A]">{f.origin}</td>
                  <td className="px-6 py-4 text-[#5E6278]">{f.destination}</td>
                  <td className="px-6 py-4 font-medium text-[#0F111A]">
                    R$ {f.value.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_STYLES[f.status]
                      }`}
                    >
                      {STATUS_LABELS[f.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#5E6278]">{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-bold text-[#0F111A]">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-[#5E6278]">{label}</p>
    </div>
  );
}

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
