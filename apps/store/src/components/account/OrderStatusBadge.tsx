import { ORDER_STATUS_LABELS, type OrderStatus } from '@areqa/shared';
import { cn } from '@/lib/cn';

const tone: Record<OrderStatus, string> = {
  pending: 'bg-mist text-ink',
  confirmed: 'bg-mint/60 text-ink',
  packed: 'bg-mint/60 text-ink',
  out_for_delivery: 'bg-mint text-ink',
  delivered: 'bg-ink text-paper',
  cancelled: 'border border-danger/40 text-danger-deep',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
        tone[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
