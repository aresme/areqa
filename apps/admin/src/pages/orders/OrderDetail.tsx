import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { AlertTriangle, ArrowLeft, Mail, MessageCircle, Phone, Printer } from 'lucide-react';
import {
  ORDER_STATUS_LABELS,
  ORDER_TRANSITIONS,
  PAYMENT_METHOD_LABELS,
  formatDateTime,
  formatKES,
  formatKenyanPhone,
  telLink,
  whatsappLink,
  type OrderStatus,
} from '@areqa/shared';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PrintDocument } from '@/components/orders/PrintDocument';
import { StatusChangeDialog } from '@/components/orders/StatusChangeDialog';
import { Button } from '@/components/ui/Button';
import { Thumb } from '@/components/ui/Img';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAdminAuth } from '@/features/auth/adminAuth';
import { useCatalogIndex } from '@/features/catalog/useCatalogIndex';
import {
  changeStatus,
  markUnpaid,
  priceMismatches,
  recordPayment,
  saveAdminNotes,
  useOrderLive,
} from '@/features/orders/api';
import { useStoreSettings } from '@/features/settings/storeSettings';
import { toast } from '@/features/ui/toastStore';
import { config } from '@/lib/env';

const PAY_METHODS = ['M-Pesa', 'Cash', 'Bank transfer', 'Card (in store)'];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="label text-muted mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const { data: order, loading } = useOrderLive(id);
  const { data: catalog = [] } = useCatalogIndex();
  const { data: settings } = useStoreSettings();
  const uid = useAdminAuth((s) => s.uid);
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [payMethod, setPayMethod] = useState(PAY_METHODS[0]!);
  const [payRef, setPayRef] = useState('');
  const [printKind, setPrintKind] = useState<'invoice' | 'slip'>('invoice');

  useEffect(() => setNotes(order?.adminNotes ?? ''), [order?.adminNotes]);
  const livePrice = useMemo(() => new Map(catalog.map((e) => [e.id, e.price])), [catalog]);

  if (loading) return <Skeleton className="h-[70vh] w-full" />;
  if (!order)
    return (
      <p>
        Order not found.{' '}
        <Link to="/orders" className="underline">
          Back to orders
        </Link>
      </p>
    );

  const mismatches = priceMismatches(order, (pid) => livePrice.get(pid));
  const lineSum = order.items.reduce((n, i) => n + i.qty * i.unitPrice, 0);
  const totalsOff =
    lineSum !== order.subtotal ||
    order.total !== order.subtotal - (order.discount?.amount ?? 0) + order.deliveryFee;
  const next = ORDER_TRANSITIONS[order.status];
  const emailReady = Boolean(
    config.emailjs.publicKey && config.emailjs.serviceId && config.emailjs.templateCustomer,
  );
  const phone = formatKenyanPhone(order.customer.phone);
  const first = order.customer.name.split(' ')[0];

  const print = (kind: 'invoice' | 'slip') => {
    flushSync(() => setPrintKind(kind));
    window.print();
  };

  return (
    <>
      <div className="print:hidden">
        <Link
          to="/orders"
          className="text-muted hover:text-ink mb-1 inline-flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="size-3.5" /> Orders
        </Link>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl uppercase">{order.orderNumber}</h1>
              <OrderStatusBadge status={order.status} />
              {order.paymentStatus === 'paid' ? (
                <StatusPill tone="mint">Paid</StatusPill>
              ) : (
                <StatusPill tone="outline">Unpaid</StatusPill>
              )}
            </div>
            <p className="text-muted mt-1 text-sm">
              Placed {formatDateTime(order.createdAt)}
              {order.userId ? ' · registered customer' : ' · guest checkout'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => print('slip')}>
              <Printer className="size-4" /> Packing slip
            </Button>
            <Button variant="secondary" size="sm" onClick={() => print('invoice')}>
              <Printer className="size-4" /> Invoice / PDF
            </Button>
          </div>
        </div>

        {(mismatches.length > 0 || totalsOff) && (
          <div
            role="alert"
            className="mb-6 flex gap-3 rounded-lg border border-[#E9C46A] bg-[#FFF8E1] p-4 text-sm text-[#7A5A00]"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Check this order's prices before confirming</p>
              {totalsOff && (
                <p>
                  The line items ({formatKES(lineSum)}) or totals do not add up to what the customer
                  was charged.
                </p>
              )}
              {mismatches.map(({ item, live }) => (
                <p key={item.variantKey + item.productId}>
                  {item.name}: ordered at {formatKES(item.unitPrice)}, current price{' '}
                  {formatKES(live!)}. This is normal if you changed the price after the order.
                </p>
              ))}
            </div>
          </div>
        )}

        {next.length > 0 && (
          <div className="card mb-6 flex flex-wrap items-center gap-3 p-4">
            <span className="text-sm font-medium">Next step:</span>
            {next
              .filter((s) => s !== 'cancelled')
              .map((s) => (
                <Button key={s} onClick={() => setTarget(s)}>
                  Mark {ORDER_STATUS_LABELS[s].toLowerCase()}
                </Button>
              ))}
            {next.includes('cancelled') && (
              <button
                onClick={() => setTarget('cancelled')}
                className="text-danger-deep ml-auto text-sm font-semibold underline underline-offset-4"
              >
                Cancel order
              </button>
            )}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card title={`Items (${order.itemCount})`}>
              <ul className="divide-line divide-y">
                {order.items.map((i) => {
                  const live = livePrice.get(i.productId);
                  return (
                    <li key={i.variantKey + i.productId} className="flex items-center gap-4 py-3">
                      <Thumb src={i.image} size={44} />
                      <div className="min-w-0 flex-1 text-sm">
                        <Link
                          to={`/products/${i.productId}`}
                          className="font-medium hover:underline"
                        >
                          {i.name}
                        </Link>
                        <p className="text-muted">
                          {i.color} · {i.size}
                        </p>
                      </div>
                      <p className="text-sm tabular-nums">
                        {i.qty} × {formatKES(i.unitPrice)}
                        {live !== undefined && live !== i.unitPrice && (
                          <span className="block text-xs text-[#7A5A00]">
                            now {formatKES(live)}
                          </span>
                        )}
                      </p>
                      <p className="w-24 text-right text-sm font-semibold tabular-nums">
                        {formatKES(i.qty * i.unitPrice)}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <dl className="border-line ml-auto mt-4 max-w-xs space-y-1.5 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatKES(order.subtotal)}</dd>
                </div>
                {order.discount && (
                  <div className="text-mint-deep flex justify-between">
                    <dt>Discount ({order.discount.code})</dt>
                    <dd className="tabular-nums">−{formatKES(order.discount.amount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Delivery</dt>
                  <dd className="tabular-nums">
                    {order.deliveryFee ? formatKES(order.deliveryFee) : 'Free'}
                  </dd>
                </div>
                <div className="border-line flex justify-between border-t pt-2 text-base font-bold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatKES(order.total)}</dd>
                </div>
              </dl>
            </Card>

            <Card title="History">
              <ol className="space-y-3">
                {[...order.statusHistory].reverse().map((h, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="bg-ink mt-1.5 size-2 shrink-0 rounded-full" aria-hidden />
                    <div>
                      <p>
                        <span className="font-semibold">{ORDER_STATUS_LABELS[h.status]}</span>{' '}
                        <span className="text-muted">
                          · {formatDateTime(h.at)}
                          {h.by === uid
                            ? ' · you'
                            : h.by === 'customer' || h.by === order.userId
                              ? ' · customer'
                              : ''}
                        </span>
                      </p>
                      {h.note && <p className="text-muted">“{h.note}”</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            <Card title="Internal notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border-line w-full rounded border p-2.5 text-sm"
                placeholder="Only visible to staff, e.g. 'Called 10:30, confirmed for tomorrow'"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={notes === order.adminNotes}
                  onClick={async () => {
                    await saveAdminNotes(order.id, notes);
                    toast.success('Notes saved');
                  }}
                >
                  Save notes
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Customer">
              <p className="font-semibold">{order.customer.name}</p>
              <div className="mt-3 grid gap-2">
                <a
                  href={telLink(order.customer.phone)}
                  className="border-line hover:border-ink flex items-center gap-2 rounded border px-3 py-2 text-sm"
                >
                  <Phone className="size-4" /> {phone}
                </a>
                <a
                  href={whatsappLink(
                    order.customer.phone,
                    `Hi ${first}, this is ${settings?.storeName ?? 'Areqa'} about your order ${order.orderNumber}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="border-line hover:border-ink flex items-center gap-2 rounded border px-3 py-2 text-sm"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
                <a
                  href={`mailto:${order.customer.email}?subject=${encodeURIComponent(`Your order ${order.orderNumber}`)}`}
                  className="border-line hover:border-ink flex items-center gap-2 truncate rounded border px-3 py-2 text-sm"
                >
                  <Mail className="size-4 shrink-0" /> {order.customer.email}
                </a>
              </div>
            </Card>

            <Card title={order.delivery.method === 'pickup' ? 'Store pickup' : 'Delivery'}>
              {order.delivery.method === 'pickup' ? (
                <p className="text-sm">{settings?.pickupLocation ?? 'Collect from store'}</p>
              ) : (
                <div className="text-sm leading-relaxed">
                  <p>{order.delivery.address}</p>
                  <p>
                    {order.delivery.town}, {order.delivery.county}
                  </p>
                  <p className="text-muted mt-2">
                    {order.delivery.zoneName} · {order.delivery.estimatedDays} ·{' '}
                    {order.deliveryFee ? formatKES(order.deliveryFee) : 'Free'}
                  </p>
                </div>
              )}
              {order.delivery.notes && (
                <p className="bg-mist mt-3 rounded p-2.5 text-sm">“{order.delivery.notes}”</p>
              )}
            </Card>

            <Card title="Payment">
              <p className="text-sm">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
              {order.paymentStatus === 'paid' ? (
                <div className="bg-mint/40 mt-3 rounded p-3 text-sm">
                  <p className="font-semibold">Paid {formatKES(order.total)}</p>
                  <p className="text-muted">
                    {order.paymentRef} · {formatDateTime(order.paidAt)}
                  </p>
                  <button
                    className="mt-2 text-xs underline"
                    onClick={async () => {
                      await markUnpaid(order.id);
                      toast.info('Marked unpaid');
                    }}
                  >
                    Undo
                  </button>
                </div>
              ) : order.status !== 'cancelled' ? (
                <form
                  className="mt-3 space-y-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await recordPayment(order.id, payMethod, payRef);
                    setPayRef('');
                    toast.success('Payment recorded');
                  }}
                >
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    aria-label="Payment method"
                    className="border-line bg-paper h-10 w-full rounded border px-2 text-sm"
                  >
                    {PAY_METHODS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  <input
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder={
                      payMethod === 'M-Pesa'
                        ? 'M-Pesa code, e.g. SJK4H7X2PL'
                        : 'Reference (optional)'
                    }
                    aria-label="Payment reference"
                    className="border-line h-10 w-full rounded border px-3 font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    block
                    disabled={payMethod === 'M-Pesa' && payRef.trim().length < 8}
                  >
                    Mark as paid
                  </Button>
                </form>
              ) : null}
            </Card>
          </div>
        </div>
      </div>

      <PrintDocument order={order} settings={settings} kind={printKind} />

      <StatusChangeDialog
        to={target}
        hasEmail={emailReady}
        onClose={() => setTarget(null)}
        onConfirm={async ({ note, notify }) => {
          try {
            const res = await changeStatus(order, target!, uid!, settings ?? null, {
              note,
              notify,
            });
            toast.success(`Order ${ORDER_STATUS_LABELS[target!].toLowerCase()}`, {
              description: res.emailed
                ? `${first} has been emailed.`
                : notify
                  ? `Email not sent: ${res.emailReason}`
                  : undefined,
            });
            setTarget(null);
          } catch (e) {
            toast.error('Could not update the order', { description: (e as Error).message });
          }
        }}
      />
    </>
  );
}
