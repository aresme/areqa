import { useMemo, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Phone, Users } from 'lucide-react';
import {
  formatDate,
  formatDateTime,
  formatKES,
  formatKenyanPhone,
  normalizeKenyanPhone,
  telLink,
  whatsappLink,
} from '@areqa/shared';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useCustomers } from '@/features/customers/api';

function CustomerList() {
  const { data = [], isLoading } = useCustomers();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'registered' | 'repeat'>('all');
  const rows = useMemo(() => {
    const needle = q.toLowerCase();
    const phone = normalizeKenyanPhone(q);
    return data.filter(
      (c) =>
        (filter === 'all' || (filter === 'registered' ? c.registered : c.orderCount > 1)) &&
        (!needle ||
          c.name.toLowerCase().includes(needle) ||
          c.email.toLowerCase().includes(needle) ||
          (phone && c.phone === phone)),
    );
  }, [data, q, filter]);

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${data.length} customers · ${data.filter((c) => c.registered).length} with accounts · ${data.filter((c) => c.orderCount > 1).length} repeat buyers`}
      />
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email or phone"
          aria-label="Search customers"
          className="border-line h-10 min-w-56 flex-1 rounded border px-3 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          aria-label="Filter customers"
          className="border-line bg-paper h-10 rounded border px-3 text-sm"
        >
          <option value="all">All customers</option>
          <option value="registered">With accounts</option>
          <option value="repeat">Repeat buyers</option>
        </select>
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : data.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No customers yet"
            body="Customers appear after their first order or sign-up."
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-line bg-mist text-muted border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3 text-right">Orders</th>
                <th className="p-3 text-right">Total spent</th>
                <th className="p-3">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {rows.map((c) => (
                <tr key={c.key} className="hover:bg-mist/60">
                  <td className="p-3">
                    <Link
                      to={`/customers/${encodeURIComponent(c.key)}`}
                      className="font-medium hover:underline"
                    >
                      {c.name || '—'}
                    </Link>
                    {c.registered && (
                      <StatusPill tone="mint" className="ml-2">
                        Account
                      </StatusPill>
                    )}
                    <span className="text-muted block text-xs">{c.email}</span>
                  </td>
                  <td className="p-3 tabular-nums">{c.phone ? formatKenyanPhone(c.phone) : '—'}</td>
                  <td className="p-3 text-right tabular-nums">{c.orderCount}</td>
                  <td className="p-3 text-right font-medium tabular-nums">
                    {formatKES(c.totalSpent)}
                  </td>
                  <td className="text-muted p-3">
                    {c.lastOrderAt ? formatDate(c.lastOrderAt) : 'No orders'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="text-muted p-8 text-center text-sm">No customers match.</p>
          )}
        </div>
      )}
    </>
  );
}

function CustomerDetail() {
  const { key = '' } = useParams();
  const { data = [], isLoading } = useCustomers();
  const c = data.find((x) => x.key === decodeURIComponent(key));
  if (isLoading) return <Skeleton className="h-96" />;
  if (!c)
    return (
      <p>
        Customer not found.{' '}
        <Link to="/customers" className="underline">
          Back
        </Link>
      </p>
    );
  const avg = c.orderCount
    ? Math.round(
        c.totalSpent / Math.max(1, c.orders.filter((o) => o.status !== 'cancelled').length),
      )
    : 0;
  return (
    <>
      <Link
        to="/customers"
        className="text-muted hover:text-ink mb-1 inline-flex items-center gap-1 text-xs"
      >
        <ArrowLeft className="size-3.5" /> Customers
      </Link>
      <PageHeader
        title={c.name || 'Customer'}
        description={c.registered ? `Account since ${formatDate(c.joinedAt)}` : 'Guest customer'}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="card overflow-x-auto">
          <h2 className="label text-muted p-5 pb-3">Orders ({c.orderCount})</h2>
          {c.orders.length === 0 ? (
            <p className="text-muted px-5 pb-5 text-sm">No orders yet.</p>
          ) : (
            <table className="w-full min-w-[520px] text-sm">
              <tbody className="divide-line border-line divide-y border-t">
                {c.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-mist/60">
                    <td className="px-5 py-3">
                      <Link to={`/orders/${o.id}`} className="font-medium hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="text-muted py-3">{formatDateTime(o.createdAt)}</td>
                    <td className="py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatKES(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <aside className="space-y-4">
          <div className="card grid grid-cols-2 gap-4 p-5">
            <div>
              <p className="label text-muted">Spent</p>
              <p className="font-display mt-1 text-xl font-bold">{formatKES(c.totalSpent)}</p>
            </div>
            <div>
              <p className="label text-muted">Avg. order</p>
              <p className="font-display mt-1 text-xl font-bold">{formatKES(avg)}</p>
            </div>
          </div>
          <div className="card grid gap-2 p-5 text-sm">
            {c.phone && (
              <a
                href={telLink(c.phone)}
                className="border-line hover:border-ink flex items-center gap-2 rounded border px-3 py-2"
              >
                <Phone className="size-4" /> {formatKenyanPhone(c.phone)}
              </a>
            )}
            {c.phone && (
              <a
                href={whatsappLink(c.phone)}
                target="_blank"
                rel="noreferrer"
                className="border-line hover:border-ink flex items-center gap-2 rounded border px-3 py-2"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            )}
            {c.email && (
              <a
                href={`mailto:${c.email}`}
                className="border-line hover:border-ink flex items-center gap-2 truncate rounded border px-3 py-2"
              >
                <Mail className="size-4 shrink-0" /> {c.email}
              </a>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

export default function CustomersPage() {
  return (
    <Routes>
      <Route index element={<CustomerList />} />
      <Route path=":key" element={<CustomerDetail />} />
    </Routes>
  );
}
