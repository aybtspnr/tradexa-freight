/* ─── Format Helpers ─────────────────────────────────────── */

/**
 * Format a number as BRL currency: R$ 1.234,56
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format an ISO date string to pt-BR: 15/06/2026
 */
export function formatDate(date: string): string {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("pt-BR");
  } catch {
    return date;
  }
}

/**
 * Format an ISO date string with time: 15/06/2026 14:30
 */
export function formatDateTime(date: string): string {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date;
  }
}

/**
 * Status definitions with label and color class (Tailwind).
 * Supports both shipper (aberta/com_ofertas/fechada) and
 * order (pending/confirmed/picked_up/in_transit/delivered/cancelled) statuses.
 */
export type StatusType =
  | "aberta"
  | "com_ofertas"
  | "fechada"
  | "pending"
  | "confirmed"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "ativo"
  | "em_andamento"
  | "entregue"
  | "cancelado";

export interface StatusInfo {
  label: string;
  color: string;
}

const STATUS_MAP: Record<string, StatusInfo> = {
  // Quotation statuses (shipper)
  aberta: { label: "Aberta", color: "bg-blue-100 text-blue-700" },
  com_ofertas: { label: "Com Ofertas", color: "bg-amber-100 text-amber-700" },
  fechada: { label: "Fechada", color: "bg-gray-100 text-gray-600" },
  // Order statuses (DB raw)
  pending: { label: "Pendente", color: "bg-gray-100 text-gray-600" },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  picked_up: { label: "Coletado", color: "bg-amber-100 text-amber-700" },
  in_transit: { label: "Em Trânsito", color: "bg-amber-100 text-amber-700" },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  // UI order statuses
  ativo: { label: "Ativo", color: "bg-blue-100 text-blue-700" },
  em_andamento: { label: "Em Andamento", color: "bg-amber-100 text-amber-700" },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

/**
 * Get label and color for a given status key.
 */
export function formatStatus(status: string): { label: string; color: string } {
  return STATUS_MAP[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
}

/**
 * Format weight in kg: "1.234 kg"
 */
export function formatWeight(kg: number): string {
  return `${kg.toLocaleString("pt-BR")} kg`;
}

/**
 * Format volume in m³: "12,3 m³"
 */
export function formatVolume(m3: number): string {
  return `${m3.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m³`;
}
