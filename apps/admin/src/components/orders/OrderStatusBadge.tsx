import { ORDER_STATUS_LABELS, type OrderStatus } from '@areqa/shared';
import { StatusPill, type PillTone } from '@/components/ui/StatusPill';

const tone: Record<OrderStatus, PillTone> = {
  pending: 'warn',
  confirmed: 'mist',
  packed: 'mist',
  out_for_delivery: 'mint',
  delivered: 'ink',
  cancelled: 'danger',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusPill tone={tone[status]}>{ORDER_STATUS_LABELS[status]}</StatusPill>;
}
