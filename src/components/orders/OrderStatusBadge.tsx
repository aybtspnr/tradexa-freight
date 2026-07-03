import { formatStatus } from "@/utils/format";

/* ─── OrderStatusBadge ──────────────────────────────────── */

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Reusable status badge for orders and quotations.
 * Uses formatStatus from @/utils/format to determine label and color.
 *
 * Statuses supported:
 * - pending → "Pendente" (gray)
 * - confirmed → "Confirmado" (blue)
 * - picked_up → "Coletado" (amber)
 * - in_transit → "Em Trânsito" (amber)
 * - delivered → "Entregue" (green)
 * - cancelled → "Cancelado" (red)
 * - ativo → "Ativo" (blue)
 * - em_andamento → "Em Andamento" (amber)
 * - entregue → "Entregue" (green)
 * - cancelado → "Cancelado" (red)
 * - aberta → "Aberta" (blue)
 * - com_ofertas → "Com Ofertas" (amber)
 * - fechada → "Fechada" (gray)
 */
export function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  const { label, color } = formatStatus(status);

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${color} ${className}`}
    >
      {label}
    </span>
  );
}

export default OrderStatusBadge;
