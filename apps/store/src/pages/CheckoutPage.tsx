import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Lock, ShoppingBag, TriangleAlert } from 'lucide-react';
import {
  KENYA_COUNTIES,
  PAYMENT_METHOD_LABELS,
  checkoutSchema,
  formatKES,
  type CheckoutForm,
} from '@areqa/shared';
import { CheckoutError } from '@areqa/shared/services';
import { CheckoutSection } from '@/components/checkout/CheckoutSection';
import { OrderItemsMini } from '@/components/checkout/OrderItemsMini';
import { DiscountField } from '@/components/cart/DiscountField';
import { SummaryRows } from '@/components/cart/SummaryRows';
import { Field, Input, Select, Textarea } from '@/components/form/Field';
import { RadioCard } from '@/components/form/RadioCard';
import { Seo } from '@/components/Seo';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/features/cart/cartStore';
import { useLiveCart } from '@/features/cart/useLiveCart';
import { useDeliveryQuote } from '@/features/checkout/delivery';
import { useAppliedDiscount, useDiscountCheck } from '@/features/checkout/discount';
import { submitOrder } from '@/features/checkout/submitOrder';
import { useDeliveryZones, useSettings } from '@/features/content/hooks';
import { rateLimit } from '@/lib/rateLimit';
import { cn } from '@/lib/cn';

const PAYMENT_HELP = {
  pay_on_delivery: 'Pay the rider in cash or M-Pesa when your order arrives.',
  mpesa_after_confirmation: 'We call to confirm, then send our Till number. We dispatch once paid.',
} as const;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { data: zones = [] } = useDeliveryZones();
  const { items, subtotal } = useLiveCart();
  const cart = useCart();
  const { code, clear: clearDiscount } = useAppliedDiscount();
  const { check } = useDiscountCheck(code, subtotal);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, control, formState } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      method: 'delivery',
      county: '',
      town: '',
      address: '',
      notes: '',
      paymentMethod: 'pay_on_delivery',
      website: '',
    },
    mode: 'onTouched',
  });
  const [method, county, town] = useWatch({ control, name: ['method', 'county', 'town'] });
  const discount = code && check?.ok ? { code, amount: check.amount } : null;
  const quote = useDeliveryQuote(method, county, town, subtotal - (discount?.amount ?? 0));
  const towns = useMemo(
    () => [...new Set(zones.filter((z) => z.counties.includes(county)).flatMap((z) => z.towns))],
    [zones, county],
  );
  const errors = formState.errors;

  const onSubmit = async (form: CheckoutForm) => {
    setSubmitError(null);
    if (form.website) return; // honeypot
    if (method === 'delivery' && !quote.zone) {
      setSubmitError(
        'We do not have a delivery zone for that location yet. Choose store pickup or WhatsApp us.',
      );
      return;
    }
    if (!rateLimit('checkout', { max: 5, windowMs: 10 * 60_000 })) {
      setSubmitError('Too many attempts. Please wait a few minutes and try again.');
      return;
    }
    try {
      const order = await submitOrder(
        {
          userId: null,
          lines: items.map((i) => ({
            productId: i.productId,
            variantKey: i.variantKey,
            qty: i.qty,
          })),
          customer: { name: form.name, email: form.email, phone: form.phone },
          delivery: {
            method: form.method,
            county: form.county,
            town: form.town,
            address: form.address,
            notes: form.notes,
            zoneId: quote.zone?.id ?? null,
            zoneName: quote.zone?.name ?? '',
            zoneFee: quote.zoneFee,
            estimatedDays: quote.estimatedDays,
          },
          paymentMethod: form.paymentMethod,
          discountCode: discount?.code ?? null,
          freeDeliveryThreshold: settings.freeDeliveryThreshold,
        },
        settings,
      );
      cart.clear();
      clearDiscount();
      navigate(`/order/${order.orderNumber}`, { replace: true });
    } catch (err) {
      if (err instanceof CheckoutError) {
        // Fix the bag so the customer can retry straight away.
        err.lines.forEach((l) =>
          l.available === 0
            ? cart.remove(l.productId, l.variantKey)
            : cart.setQty(l.productId, l.variantKey, l.available),
        );
        if (err.code === 'discount_invalid') clearDiscount();
        setSubmitError(
          err.lines.length > 0
            ? `${err.message} We have updated your bag — please review and try again.`
            : err.message,
        );
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <Seo title="Checkout" noIndex />
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out"
          body="Your bag is empty."
          action={<ButtonLink to="/shop">Start shopping</ButtonLink>}
        />
      </div>
    );
  }

  const total = subtotal - (discount?.amount ?? 0) + (quote.fee ?? 0);
  const summary = (
    <div className="space-y-6">
      <OrderItemsMini items={items} />
      <DiscountField check={check} loading={false} />
      <SummaryRows
        subtotal={subtotal}
        discount={discount}
        deliveryFee={quote.fee}
        deliveryLabel={method === 'pickup' ? 'Store pickup' : 'Delivery'}
      />
    </div>
  );

  return (
    <div className="container-page pb-20 pt-8 sm:pt-12">
      <Seo title="Checkout" noIndex />
      <div className="mb-8 flex items-end justify-between gap-4">
        <h1 className="text-display uppercase">Checkout</h1>
        <Link to="/cart" className="text-sm underline underline-offset-4">
          Edit bag
        </Link>
      </div>

      {/* Mobile summary toggle */}
      <div className="bg-mist mb-8 rounded-lg lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          className="flex w-full items-center justify-between p-4 text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            {summaryOpen ? 'Hide' : 'Show'} order summary{' '}
            <ChevronDown
              className={cn('size-4 transition-transform', summaryOpen && 'rotate-180')}
            />
          </span>
          <span className="font-display text-lg">{formatKES(total)}</span>
        </button>
        {summaryOpen && <div className="border-line border-t p-4">{summary}</div>}
      </div>

      {submitError && (
        <div
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger-deep mb-8 flex gap-3 rounded-lg border p-4 text-sm"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>{submitError}</p>
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-16">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          <CheckoutSection step={1} title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name?.message} className="sm:col-span-2">
                {(a) => <Input {...a} {...register('name')} autoComplete="name" />}
              </Field>
              <Field
                label="Phone"
                error={errors.phone?.message}
                hint="We call this number to confirm your order."
              >
                {(a) => (
                  <Input
                    {...a}
                    {...register('phone')}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0712 345 678"
                  />
                )}
              </Field>
              <Field
                label="Email"
                error={errors.email?.message}
                hint="For your order confirmation."
              >
                {(a) => (
                  <Input
                    {...a}
                    {...register('email')}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                  />
                )}
              </Field>
            </div>
            <p className="text-muted mt-4 text-sm">
              Have an account?{' '}
              <Link
                to="/login?next=/checkout"
                className="text-ink font-medium underline underline-offset-4"
              >
                Sign in
              </Link>{' '}
              for faster checkout.
            </p>
          </CheckoutSection>

          <CheckoutSection step={2} title="Delivery">
            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">Delivery method</legend>
              <RadioCard
                {...register('method')}
                value="delivery"
                title="Deliver to me"
                description="Rider or courier to your door"
              />
              <RadioCard
                {...register('method')}
                value="pickup"
                title="Pick up from store"
                description={settings.pickupLocation || 'Collect from our studio'}
                aside="Free"
              />
            </fieldset>

            {method === 'delivery' && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="County" error={errors.county?.message}>
                  {(a) => (
                    <Select {...a} {...register('county')} autoComplete="address-level1">
                      <option value="">Choose county</option>
                      {KENYA_COUNTIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label="Town / area" error={errors.town?.message}>
                  {(a) => (
                    <>
                      <Input
                        {...a}
                        {...register('town')}
                        list="town-options"
                        autoComplete="address-level2"
                        placeholder="e.g. Milimani"
                      />
                      <datalist id="town-options">
                        {towns.map((t) => (
                          <option key={t} value={t} />
                        ))}
                      </datalist>
                    </>
                  )}
                </Field>
                <Field
                  label="Street, building & landmark"
                  error={errors.address?.message}
                  className="sm:col-span-2"
                >
                  {(a) => (
                    <Input
                      {...a}
                      {...register('address')}
                      autoComplete="street-address"
                      placeholder="e.g. Kenyatta Ave, Imani Plaza, 2nd floor"
                    />
                  )}
                </Field>
                {quote.zone ? (
                  <p className="bg-mint/40 rounded px-4 py-3 text-sm sm:col-span-2" role="status">
                    <strong>{quote.zone.name}</strong> · {quote.estimatedDays} ·{' '}
                    {quote.fee === 0 ? (
                      <strong className="text-mint-deep">Free delivery</strong>
                    ) : (
                      formatKES(quote.fee ?? 0)
                    )}
                  </p>
                ) : county ? (
                  <p className="text-danger-deep text-sm sm:col-span-2">
                    We don't deliver to {county} yet. Choose store pickup or WhatsApp us to arrange
                    delivery.
                  </p>
                ) : null}
              </div>
            )}
            <Field label="Delivery notes" optional className="mt-4">
              {(a) => (
                <Textarea
                  {...a}
                  {...register('notes')}
                  placeholder="Gate code, best time to call, landmarks…"
                />
              )}
            </Field>
          </CheckoutSection>

          <CheckoutSection step={3} title="Payment">
            <fieldset className="grid gap-3">
              <legend className="sr-only">Payment method</legend>
              {(['pay_on_delivery', 'mpesa_after_confirmation'] as const).map((m) => (
                <RadioCard
                  key={m}
                  {...register('paymentMethod')}
                  value={m}
                  title={PAYMENT_METHOD_LABELS[m]}
                  description={PAYMENT_HELP[m]}
                />
              ))}
            </fieldset>
            <p className="text-muted mt-4 flex items-center gap-2 text-xs">
              <Lock className="size-3.5" aria-hidden /> No card or payment details are collected on
              this site.
            </p>
          </CheckoutSection>

          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="hidden"
            {...register('website')}
          />

          <div>
            <Button type="submit" size="lg" block disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Placing order…' : `Place order · ${formatKES(total)}`}
            </Button>
            <p className="text-muted mt-3 text-center text-xs">
              By placing your order you agree to our{' '}
              <Link to="/terms" className="underline">
                terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </form>

        <aside aria-label="Order summary" className="hidden lg:block">
          <div className="bg-mist sticky top-24 rounded-lg p-6">
            <h2 className="font-display mb-5 text-lg font-bold uppercase">Order summary</h2>
            {summary}
          </div>
        </aside>
      </div>
    </div>
  );
}
