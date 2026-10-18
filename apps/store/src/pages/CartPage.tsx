import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { KENYA_COUNTIES } from '@areqa/shared';
import { CartLine } from '@/components/cart/CartLine';
import { DiscountField } from '@/components/cart/DiscountField';
import { FreeDeliveryProgress } from '@/components/cart/FreeDeliveryProgress';
import { SummaryRows } from '@/components/cart/SummaryRows';
import { Seo } from '@/components/Seo';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLiveCart } from '@/features/cart/useLiveCart';
import { useDeliveryQuote } from '@/features/checkout/delivery';
import { useAppliedDiscount, useDiscountCheck } from '@/features/checkout/discount';

export default function CartPage() {
  const { items, subtotal, count } = useLiveCart();
  const code = useAppliedDiscount((s) => s.code);
  const { check, loading } = useDiscountCheck(code, subtotal);
  const discount = code && check?.ok ? { code, amount: check.amount } : null;
  const [county, setCounty] = useState('');
  const quote = useDeliveryQuote('delivery', county, '', subtotal - (discount?.amount ?? 0));

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <Seo title="Your bag" noIndex />
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          body="Pieces you add will appear here. Start with what's new this week."
          action={<ButtonLink to="/shop/new-in">Shop new in</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="container-page pb-20 pt-8 sm:pt-12">
      <Seo title="Your bag" noIndex />
      <h1 className="text-display uppercase">
        Your bag <span className="text-muted">({count})</span>
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">
        <section aria-label="Items">
          <FreeDeliveryProgress subtotal={subtotal - (discount?.amount ?? 0)} />
          <ul className="divide-line border-line divide-y border-b">
            {items.map((item) => (
              <CartLine key={`${item.productId}-${item.variantKey}`} item={item} />
            ))}
          </ul>
          <Link
            to="/shop"
            className="hover:text-mint-deep mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
          >
            Continue shopping <ArrowRight className="size-4" />
          </Link>
        </section>

        <aside aria-label="Order summary" className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-mist rounded-lg p-6">
            <h2 className="font-display mb-5 text-lg font-bold uppercase">Summary</h2>
            <DiscountField check={check} loading={loading} />
            <div className="my-5">
              <label htmlFor="estimate-county" className="mb-1.5 block text-sm font-medium">
                Estimate delivery
              </label>
              <select
                id="estimate-county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="border-line bg-paper h-11 w-full rounded border px-3 text-sm"
              >
                <option value="">Choose your county</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {quote.zone && (
                <p className="text-muted mt-1.5 text-xs">
                  {quote.zone.name} · {quote.estimatedDays}
                </p>
              )}
            </div>
            <SummaryRows subtotal={subtotal} discount={discount} deliveryFee={quote.fee} />
            <ButtonLink to="/checkout" size="lg" block className="mt-6">
              Checkout
            </ButtonLink>
            <p className="text-muted mt-4 flex items-center justify-center gap-2 text-xs">
              <ShieldCheck className="size-4" aria-hidden /> No payment online. Pay on delivery or
              via M-Pesa.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
