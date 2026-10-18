import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Star } from 'lucide-react';
import { PAYMENT_METHOD_LABELS, formatDate, formatKES } from '@areqa/shared';
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge';
import { ReviewForm, type ReviewDraft } from '@/components/account/ReviewForm';
import { SummaryRows } from '@/components/cart/SummaryRows';
import { StatusTimeline } from '@/components/order/StatusTimeline';
import { Img } from '@/components/ui/Img';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  reviewId,
  submitReview,
  useInvalidateMyData,
  useMyOrder,
  useMyReviews,
} from '@/features/account/api';
import { useAuth } from '@/features/auth/authStore';
import { toast } from '@/features/ui/toastStore';
import NotFoundPage from '../NotFoundPage';

export default function AccountOrderDetail() {
  const { id } = useParams();
  const { data: order, isLoading } = useMyOrder(id);
  const { data: reviews = [] } = useMyReviews();
  const { user, profile } = useAuth();
  const invalidate = useInvalidateMyData();
  const [reviewing, setReviewing] = useState<{ productId: string; name: string } | null>(null);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!order) return <NotFoundPage />;

  const reviewed = new Set(reviews.map((r) => r.id));
  const delivered = order.status === 'delivered';
  const uniqueProducts = [...new Map(order.items.map((i) => [i.productId, i])).values()];

  const onReview = async (draft: ReviewDraft) => {
    await submitReview({
      orderId: order.id,
      productId: reviewing!.productId,
      userId: user!.uid,
      userName: (profile?.displayName || 'Customer').split(' ')[0]!,
      ...draft,
    });
    toast.success('Thanks for your review', { description: 'It will appear once approved.' });
    setReviewing(null);
    invalidate();
  };

  return (
    <section>
      <Link
        to="/account/orders"
        className="hover:text-mint-deep mb-6 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" /> All orders
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="section-title text-2xl">{order.orderNumber}</h2>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-muted mt-1 text-sm">Placed {formatDate(order.createdAt)}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <ul className="divide-line border-line divide-y border-y">
            {order.items.map((i) => (
              <li key={i.variantKey} className="flex gap-4 py-4">
                <Link to={`/product/${i.slug}`} className="w-16 shrink-0">
                  <Img
                    src={i.image}
                    alt={i.name}
                    aspect={0.8}
                    sizes="64px"
                    maxWidth={320}
                    className="aspect-product w-full rounded object-cover"
                  />
                </Link>
                <div className="flex-1 text-sm">
                  <Link to={`/product/${i.slug}`} className="font-semibold hover:underline">
                    {i.name}
                  </Link>
                  <p className="text-muted">
                    {i.color} · {i.size} · Qty {i.qty}
                  </p>
                </div>
                <p className="text-sm font-medium">{formatKES(i.unitPrice * i.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 max-w-sm">
            <SummaryRows
              subtotal={order.subtotal}
              discount={order.discount}
              deliveryFee={order.deliveryFee}
              deliveryLabel={order.delivery.method === 'pickup' ? 'Store pickup' : 'Delivery'}
            />
          </div>

          {delivered && (
            <div className="bg-mist mt-10 rounded-lg p-6">
              <h3 className="label mb-4">Review your items</h3>
              <ul className="space-y-3">
                {uniqueProducts.map((i) => {
                  const done = reviewed.has(reviewId(order.id, i.productId));
                  return (
                    <li
                      key={i.productId}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="font-medium">{i.name}</span>
                      {done ? (
                        <span className="text-mint-deep flex items-center gap-1.5">
                          <Check className="size-4" /> Reviewed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReviewing({ productId: i.productId, name: i.name })}
                          className="flex items-center gap-1.5 font-semibold underline underline-offset-4"
                        >
                          <Star className="size-4" /> Write a review
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div>
            <h3 className="label mb-4">Progress</h3>
            <StatusTimeline status={order.status} history={order.statusHistory} />
          </div>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted">Payment</dt>
              <dd className="font-medium">
                {PAYMENT_METHOD_LABELS[order.paymentMethod]} ·{' '}
                {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </dd>
            </div>
            <div>
              <dt className="text-muted">
                {order.delivery.method === 'pickup' ? 'Pickup' : 'Delivery'}
              </dt>
              <dd className="font-medium">
                {order.delivery.method === 'pickup'
                  ? 'Store pickup'
                  : `${order.delivery.address}, ${order.delivery.town}, ${order.delivery.county}`}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <Modal open={Boolean(reviewing)} onClose={() => setReviewing(null)} title="Write a review">
        {reviewing && <ReviewForm productName={reviewing.name} onSubmit={onReview} />}
      </Modal>
    </section>
  );
}
