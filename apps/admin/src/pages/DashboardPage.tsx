import { Link } from 'react-router-dom';
import { AlertTriangle, Banknote, Clock, PackageCheck, Shirt, ShoppingBag } from 'lucide-react';
import { formatDateTime, formatKES } from '@areqa/shared';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { StatTile } from '@/components/dashboard/StatTile';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Thumb } from '@/components/ui/Img';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAdminAuth } from '@/features/auth/adminAuth';
import { useDashboard } from '@/features/dashboard/api';
import { summarize } from '@/features/dashboard/summary';

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();
  const name = useAdminAuth((s) => s.admin?.name.split(' ')[0]);

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading dashboard">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Could not load the dashboard"
        body="Check your connection and Firestore indexes."
        action={
          <button className="underline" onClick={() => void refetch()}>
            Try again
          </button>
        }
      />
    );
  }

  const s = summarize(data.orders);
  const recent = data.orders.slice(0, 8);

  return (
    <>
      <PageHeader
        title={`Habari${name ? `, ${name}` : ''}`}
        description={new Intl.DateTimeFormat('en-KE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(new Date())}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile
          label="Today's orders"
          value={String(s.todayCount)}
          icon={ShoppingBag}
          to="/orders"
        />
        <StatTile
          label="Pending"
          value={String(data.pendingCount)}
          hint="Awaiting confirmation call"
          icon={Clock}
          to="/orders?status=pending"
          tone={data.pendingCount > 0 ? 'attention' : 'default'}
        />
        <StatTile
          label="Revenue this week"
          value={formatKES(s.revenueWeek)}
          hint="Delivered orders, from Monday"
          icon={Banknote}
        />
        <StatTile
          label="Revenue this month"
          value={formatKES(s.revenueMonth)}
          hint="Delivered orders"
          icon={PackageCheck}
        />
        <StatTile
          label="Products"
          value={String(data.productCount)}
          hint={`${data.lowStock.length} variants low on stock`}
          icon={Shirt}
          to="/products"
          tone={data.lowStock.length > 0 ? 'attention' : 'default'}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <SalesChart days={s.days} />
        <section className="card p-5" aria-labelledby="top-title">
          <h2 id="top-title" className="text-base uppercase">
            Top sellers
          </h2>
          <p className="text-muted text-xs">Units sold, last 30 days</p>
          {s.topSellers.length === 0 ? (
            <p className="text-muted mt-6 text-sm">No sales in the last 30 days yet.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {s.topSellers.map((t) => {
                const pct = (t.qty / s.topSellers[0]!.qty) * 100;
                return (
                  <li key={t.id} className="flex items-center gap-3">
                    <Thumb src={t.image} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{t.name}</span>
                        <span className="tabular-nums">{t.qty}</span>
                      </div>
                      <div className="bg-mist mt-1 h-1.5 rounded-full" aria-hidden>
                        <div
                          className="bg-mint-deep h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-muted mt-0.5 text-xs">{formatKES(t.revenue)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="card" aria-labelledby="recent-title">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 id="recent-title" className="text-base uppercase">
              Recent orders
            </h2>
            <Link to="/orders" className="text-xs font-medium underline underline-offset-4">
              All orders
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-muted px-5 pb-5 text-sm">
              No orders yet. They will appear here as soon as customers check out.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="border-line bg-mist text-muted border-y text-left text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-2">Order</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Placed</th>
                    <th className="py-2">Status</th>
                    <th className="px-5 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-line divide-y">
                  {recent.map((o) => (
                    <tr key={o.id} className="hover:bg-mist/60">
                      <td className="px-5 py-2.5">
                        <Link to={`/orders/${o.id}`} className="font-medium hover:underline">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5">{o.customer.name}</td>
                      <td className="text-muted py-2.5">{formatDateTime(o.createdAt)}</td>
                      <td className="py-2.5">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums">{formatKES(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card p-5" aria-labelledby="low-title">
          <div className="flex items-center justify-between">
            <h2 id="low-title" className="text-base uppercase">
              Low stock
            </h2>
            <Link to="/inventory" className="text-xs font-medium underline underline-offset-4">
              Inventory
            </Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="text-muted mt-4 text-sm">All variants are above their alert level.</p>
          ) : (
            <ul className="divide-line mt-3 max-h-80 divide-y overflow-y-auto">
              {data.lowStock.slice(0, 20).map((i) => (
                <li
                  key={`${i.productId}-${i.variantKey}`}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <Link to={`/products/${i.productId}`} className="min-w-0 hover:underline">
                    <span className="block truncate font-medium">{i.name}</span>
                    <span className="text-muted text-xs">
                      {i.color} · {i.size}
                    </span>
                  </Link>
                  {i.stock === 0 ? (
                    <StatusPill tone="danger">Sold out</StatusPill>
                  ) : (
                    <StatusPill tone="warn">{i.stock} left</StatusPill>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
