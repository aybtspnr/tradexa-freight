import { useMemo } from "react";
import { Link } from "react-router-dom";

/* ─── Types ───────────────────────────────────────────────── */

interface Cotacao {
  id: string;
  origem: string;
  destino: string;
  data: string;
  status: "aberta" | "encerrada";
  ofertas: number;
}

/* ─── Mock data ──────────────────────────────────────────── */

const MOCK_COTACOES: Cotacao[] = [
  { id: "1", origem: "São Paulo, SP", destino: "Rio de Janeiro, RJ", data: "18/06/2026", status: "aberta", ofertas: 3 },
  { id: "2", origem: "Belo Horizonte, MG", destino: "Vitória, ES", data: "17/06/2026", status: "aberta", ofertas: 2 },
  { id: "3", origem: "Curitiba, PR", destino: "Florianópolis, SC", data: "15/06/2026", status: "encerrada", ofertas: 5 },
  { id: "4", origem: "Brasília, DF", destino: "Goiânia, GO", data: "14/06/2026", status: "encerrada", ofertas: 4 },
  { id: "5", origem: "Salvador, BA", destino: "Recife, PE", data: "12/06/2026", status: "aberta", ofertas: 1 },
];

const STATUS_COLORS: Record<string, string> = {
  aberta: "bg-blue-100 text-blue-700",
  encerrada: "bg-gray-100 text-gray-600",
};

/* ─── Component ──────────────────────────────────────────── */

export function Dashboard() {
  const kpis = useMemo(() => {
    const abertas = MOCK_COTACOES.filter((c) => c.status === "aberta").length;
    const fretesAndamento = 4;
    const economia = 1250;
    return { cotacoesAtivas: abertas, fretesAndamento, economia };
  }, []);

  const recentes = useMemo(() => MOCK_COTACOES.slice(0, 3), []);

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
          value={kpis.cotacoesAtivas.toString()}
          icon="💰"
          color="bg-blue-500"
        />
        <KpiCard
          label="Fretes em Andamento"
          value={kpis.fretesAndamento.toString()}
          icon="📦"
          color="bg-amber-500"
        />
        <KpiCard
          label="Economia Estimada"
          value={`R$ ${kpis.economia.toLocaleString("pt-BR")}`}
          icon="📉"
          color="bg-green-500"
        />
      </div>

      {/* Quick actions */}
      <div>
        <Link
          to="/shipper/cotacoes"
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
              {recentes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.origem}</td>
                  <td className="px-6 py-4 text-gray-700">{c.destino}</td>
                  <td className="px-6 py-4 text-gray-500">{c.data}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[c.status]
                      }`}
                    >
                      {c.status === "aberta" ? "Aberta" : "Encerrada"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{c.ofertas} ofertas</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
