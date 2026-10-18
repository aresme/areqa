import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ShoppingBag } from 'lucide-react';
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  formatDateTime,
  formatKES,
  normalizeKenyanPhone,
  toDate,
  type OrderStatus,
} from '@areqa/shared';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useOrdersLive } from '@/features/orders/api';
import { cn } from '@/lib/cn';

export default function OrderList() {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') ?? '') as OrderStatus | '';
  const q = params.get('q') ?? '';
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { data: orders, loading, error } = useOrdersLive();

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { '': orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const phone = normalizeKenyanPhone(q);
    const fromT = from ? new Date(`${from}T00:00:00`).getTime() : 0;
    const toT = to ? new Date(`${to}T23:59:59`).getTime() : Infinity;
    return orders.filter((o) => {
      const t = toDate(o.createdAt)?.getTime() ?? 0;
      return (
        (!status || o.status === status) &&
        t >= fromT &&
        t <= toT &&
        (!needle ||
          o.orderNumber.toLowerCase().includes(needle) ||
          o.customer.name.toLowerCase().includes(needle) ||
          o.customer.email.includes(needle) ||
          (phone && o.customer.phone === phone))
      );
    });
  }, [orders, status, q, from, to]);

  return (
    <>
      <PageHeader title="Orders" description="Updates live as customers check out." />

      <div
        className="mb-4 flex gap-1 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Filter by status"
      >
        {(['', ...ORDER_STATUSES] as const).map((s) => (
          <button
            key={s || 'all'}
            role="tab"
            aria-selected={status === s}
            onClick={() => set('status', s)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors',
              status === s ? 'bg-ink text-paper' : 'bg-paper text-muted hover:text-ink',
            )}
          >
            {s ? ORDER_STATUS_LABELS[s] : 'All'}
            <span
              className={cn(
                'rounded-full px-1.5 text-[11px] tabular-nums',
                status === s ? 'bg-mint text-ink' : 'bg-mist',
              )}
            >
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="card mb-4 flex flex-wrap items-end gap-3 p-3">
        <label className="min-w-56 flex-1 text-xs font-medium">
          Search
          <input
            value={q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Order no., phone, name or email"
            className="border-line mt-1 h-10 w-full rounded border px-3 text-sm font-normal"
          />
        </label>
        <label className="text-xs font-medium">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border-line mt-1 block h-10 rounded border px-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border-line mt-1 block h-10 rounded border px-2 text-sm"
          />
        </label>
        {(q || from || to || status) && (
          <button
            className="h-10 text-xs underline"
            onClick={() => {
              setFrom('');
              setTo('');
              setParams({}, { replace: true });
            }}
          >
            Reset
          </button>
        )}
      </div>

      {error ? (
        <div className="card">
          <EmptyState icon={AlertTriangle} title="Could not load orders" body={error.message} />
        </div>
      ) : loading ? (
        <Skeleton className="h-96 w-full" />
      ) : orders.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            body="New orders appear here instantly."
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-line bg-mist text-muted border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Placed</th>
                <th className="p-3 text-right">Items</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-mist/60 cursor-pointer">
                  <td className="p-3">
                    <Link to={`/orders/${o.id}`} className="font-semibold hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="p-3">
                    {o.customer.name}
                    <span className="text-muted block text-xs">
                      {o.delivery.method === 'pickup'
                        ? 'Pickup'
                        : `${o.delivery.town}, ${o.delivery.county}`}
                    </span>
                  </td>
                  <td className="text-muted p-3">{formatDateTime(o.createdAt)}</td>
                  <td className="p-3 text-right tabular-nums">{o.itemCount}</td>
                  <td className="p-3 text-right font-medium tabular-nums">{formatKES(o.total)}</td>
                  <td className="p-3">
                    {o.paymentStatus === 'paid' ? (
                      <StatusPill tone="mint">Paid</StatusPill>
                    ) : (
                      <StatusPill tone="outline">Unpaid</StatusPill>
                    )}
                  </td>
                  <td className="p-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="text-muted p-8 text-center text-sm">No orders match these filters.</p>
          )}
        </div>
      )}
    </>
  );
}
