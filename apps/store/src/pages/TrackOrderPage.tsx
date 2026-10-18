import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { formatDate, formatKES, type OrderLookup } from '@areqa/shared';
import { Field, Input } from '@/components/form/Field';
import { StatusTimeline } from '@/components/order/StatusTimeline';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/Button';
import { loadLastOrder } from '@/features/checkout/lastOrder';
import { trackOrder } from '@/features/orders/tracking';
import { rateLimit } from '@/lib/rateLimit';

export default function TrackOrderPage() {
  const [params] = useSearchParams();
  const initialNumber = params.get('order') ?? '';
  const last = loadLastOrder(initialNumber || undefined);
  const [number, setNumber] = useState(initialNumber);
  const [phone, setPhone] = useState(
    last?.customer.phone ? `0${last.customer.phone.slice(3)}` : '',
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OrderLookup | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!rateLimit('track', { max: 10, windowMs: 5 * 60_000 }))
      return setError('Too many lookups. Please wait a few minutes.');
    setBusy(true);
    try {
      const res = await trackOrder(number, phone);
      if (res.ok) setResult(res.order);
      else {
        setResult(null);
        setError(res.reason);
      }
    } catch {
      setError('Could not check your order right now. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page pb-20 pt-10 sm:pt-16">
      <Seo
        title="Track your order"
        description="Check the status of your Areqa order with your order number and phone number."
        path="/track"
      />
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
        <div>
          <p className="label text-mint-deep">Order status</p>
          <h1 className="text-display mt-2 uppercase">Track your order</h1>
          <p className="text-muted mt-4">
            Enter the order number from your confirmation email and the phone number you used at
            checkout.
          </p>
          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
            <Field label="Order number" hint="e.g. ORD-20261018-4821">
              {(a) => (
                <Input
                  {...a}
                  value={number}
                  onChange={(e) => setNumber(e.target.value.toUpperCase())}
                  autoComplete="off"
                  spellCheck={false}
                />
              )}
            </Field>
            <Field label="Phone number">
              {(a) => (
                <Input
                  {...a}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0712 345 678"
                />
              )}
            </Field>
            {error && (
              <p role="alert" className="text-danger-deep text-sm">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" block disabled={busy}>
              <Search className="size-4" aria-hidden /> {busy ? 'Checking…' : 'Track order'}
            </Button>
          </form>
        </div>

        <div aria-live="polite">
          {result ? (
            <div className="border-line rounded-lg border p-6 sm:p-8">
              <div className="border-line mb-8 flex flex-wrap items-start justify-between gap-4 border-b pb-6">
                <div>
                  <p className="label text-muted">Order</p>
                  <p className="font-display mt-1 text-xl font-bold">{result.orderNumber}</p>
                  <p className="text-muted mt-1 text-sm">Placed {formatDate(result.createdAt)}</p>
                </div>
                <div className="sm:text-right">
                  <p className="label text-muted">Total</p>
                  <p className="font-display mt-1 text-xl font-bold">{formatKES(result.total)}</p>
                  <p className="text-muted mt-1 text-sm">
                    {result.itemCount} {result.itemCount === 1 ? 'item' : 'items'} ·{' '}
                    {result.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}
                  </p>
                </div>
              </div>
              <StatusTimeline status={result.status} history={result.statusHistory} />
            </div>
          ) : (
            <div className="bg-mist text-muted hidden h-full items-center justify-center rounded-lg p-10 text-center text-sm lg:flex">
              Your order progress will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
