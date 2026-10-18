import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { formatDate, formatKES, type Order, type WithId } from '@areqa/shared';
import { Img } from '@/components/ui/Img';
import { OrderStatusBadge } from './OrderStatusBadge';

export function OrderCard({ order }: { order: WithId<Order> }) {
  return (
    <Link
      to={`/account/orders/${order.id}`}
      className="border-line hover:border-ink group flex items-center gap-4 rounded-lg border p-4 transition-colors"
    >
      <div className="flex -space-x-3">
        {order.items.slice(0, 3).map((i) => (
          <Img
            key={i.variantKey}
            src={i.image}
            alt=""
            aspect={0.8}
            sizes="48px"
            maxWidth={320}
            className="aspect-product border-paper w-12 rounded border-2 object-cover"
          />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{order.orderNumber}</p>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-muted mt-1 text-sm">
          {formatDate(order.createdAt)} · {order.itemCount}{' '}
          {order.itemCount === 1 ? 'item' : 'items'} · {formatKES(order.total)}
        </p>
      </div>
      <ChevronRight
        className="text-muted size-5 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
