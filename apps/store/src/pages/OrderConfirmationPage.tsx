import { Link, useParams } from 'react-router-dom';
import { CircleCheck, MessageCircle, Package, Phone } from 'lucide-react';
import { PAYMENT_METHOD_LABELS, formatKES, formatKenyanPhone, whatsappLink } from '@areqa/shared';
import { OrderItemsMini } from '@/components/checkout/OrderItemsMini';
import { SummaryRows } from '@/components/cart/SummaryRows';
import { Seo } from '@/components/Seo';
import { ButtonLink } from '@/components/ui/Button';
import { loadLastOrder } from '@/features/checkout/lastOrder';
import { useSettings } from '@/features/content/hooks';

export default function OrderConfirmationPage() {
  const { orderNumber = '' } = useParams();
  const order = loadLastOrder(orderNumber);
  const { settings } = useSettings();

  const steps = [
    {
      icon: Phone,
      title: 'We call to confirm',
      body: order
        ? `Expect a call on ${formatKenyanPhone(order.customer.phone)} within business hours.`
        : 'Expect a call from our team within business hours.',
    },
    {
      icon: Package,
      title: 'We pack your order',
      body: 'Your items are checked, packed and handed to our rider or courier.',
    },
    {
      icon: CircleCheck,
      title:
        order?.paymentMethod === 'mpesa_after_confirmation'
          ? 'Pay via M-Pesa, then delivery'
          : 'Delivered — pay on arrival',
      body:
        order?.delivery.method === 'pickup'
          ? `Collect from ${settings.pickupLocation || 'our studio'}.`
          : order?.delivery.estimatedDays
            ? `Delivery: ${order.delivery.estimatedDays}.`
            : 'Delivery times depend on your location.',
    },
  ];

  return (
    <div className="container-page pb-20 pt-10 sm:pt-16">
      <Seo title="Order confirmed" noIndex />
      <div className="mx-auto max-w-3xl">
        <span className="bg-mint flex size-14 items-center justify-center rounded-full">
          <CircleCheck className="size-7" aria-hidden />
        </span>
        <p className="label text-mint-deep mt-6">Order {orderNumber}</p>
        <h1 className="text-display mt-2 uppercase">
          Thank you{order ? `, ${order.customer.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-muted mt-4 max-w-xl">
          Your order has been received.
          {order && ` A confirmation has been sent to ${order.customer.email}.`} Keep your order
          number — you will need it with your phone number to track the order.
        </p>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="border-line rounded-lg border p-5">
              <span className="label text-muted">Step {i + 1}</span>
              <Icon className="mt-3 size-5" aria-hidden />
              <p className="mt-3 font-semibold">{title}</p>
              <p className="text-muted mt-1 text-sm">{body}</p>
            </li>
          ))}
        </ol>

        {order && (
          <div className="bg-mist mt-10 grid gap-8 rounded-lg p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <h2 className="label mb-4">Items</h2>
              <OrderItemsMini items={order.items.map((i) => ({ ...i, price: i.unitPrice }))} />
            </div>
            <div>
              <h2 className="label mb-4">Summary</h2>
              <SummaryRows
                subtotal={order.subtotal}
                discount={order.discount}
                deliveryFee={order.deliveryFee}
                deliveryLabel={order.delivery.method === 'pickup' ? 'Store pickup' : 'Delivery'}
              />
              <dl className="mt-6 space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Payment</dt>
                  <dd className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd>
                </div>
                <div>
                  <dt className="text-muted">
                    {order.delivery.method === 'pickup' ? 'Pickup' : 'Deliver to'}
                  </dt>
                  <dd className="font-medium">
                    {order.delivery.method === 'pickup'
                      ? settings.pickupLocation
                      : `${order.delivery.address}, ${order.delivery.town}, ${order.delivery.county}`}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink to={`/track?order=${encodeURIComponent(orderNumber)}`}>
            Track order
          </ButtonLink>
          <ButtonLink to="/shop" variant="secondary">
            Continue shopping
          </ButtonLink>
          {settings.whatsappNumber && (
            <a
              href={whatsappLink(
                settings.whatsappNumber,
                `Hi! I just placed order ${orderNumber}${order ? ` (${formatKES(order.total)})` : ''}.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="hover:text-mint-deep inline-flex h-11 items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.08em]"
            >
              <MessageCircle className="size-4" aria-hidden /> WhatsApp us
            </a>
          )}
        </div>
        {!order && (
          <p className="text-muted mt-6 text-sm">
            Order details are shown right after checkout. You can always check progress on the{' '}
            <Link to="/track" className="underline">
              tracking page
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
