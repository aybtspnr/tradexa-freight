import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency, formatDate } from "@/utils/format";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Banknote } from "lucide-react";

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  platform_fee: number | null;
  carrier_amount: number | null;
  status: string;
  payment_method: string | null;
  created_at: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  processing: "Processando",
  completed: "Concluído",
  refunded: "Reembolsado",
  failed: "Falhou",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  refunded: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-700",
};

export function Financeiro() {
  const profile = useAuthStore((s) => s.profile);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    supabase
      .from("payments")
      .select("*")
      .or(`shipper_id.eq.${profile.id},carrier_id.eq.${profile.id}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPayments((data || []) as Payment[]);
        setLoading(false);
      });
  }, [profile?.id]);

  const totalRecebido = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalTaxas = payments
    .filter((p) => p.status === "completed" && p.platform_fee)
    .reduce((sum, p) => sum + (p.platform_fee || 0), 0);

  const pendentes = payments.filter((p) => p.status === "pending").length;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500">Extrato de pagamentos e movimentações</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl">💰</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{formatCurrency(totalRecebido)}</p>
          <p className="text-sm text-gray-500">Total Recebido</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📊</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{formatCurrency(totalTaxas)}</p>
          <p className="text-sm text-gray-500">Taxas da Plataforma</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl">⏳</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{pendentes}</p>
          <p className="text-sm text-gray-500">Pagamentos Pendentes</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Pagamentos</h2>
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <Banknote className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm">Nenhuma movimentação financeira encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Taxa</th>
                  <th className="px-6 py-3">Líquido</th>
                  <th className="px-6 py-3">Método</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {p.platform_fee ? formatCurrency(p.platform_fee) : "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {p.carrier_amount ? formatCurrency(p.carrier_amount) : formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        {p.payment_method === "pix" ? <CreditCard className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                        {p.payment_method === "pix" ? "PIX" : p.payment_method === "credit_card" ? "Cartão" : p.payment_method === "boleto" ? "Boleto" : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {p.created_at ? formatDate(p.created_at) : "—"}
                    </td>
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

export default Financeiro;
