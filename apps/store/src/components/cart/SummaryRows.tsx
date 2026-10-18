import { formatKES } from '@areqa/shared';

interface SummaryRowsProps {
  subtotal: number;
  discount: { code: string; amount: number } | null;
  /** null → not calculated yet. */
  deliveryFee: number | null;
  deliveryLabel?: string;
}

export function SummaryRows({
  subtotal,
  discount,
  deliveryFee,
  deliveryLabel = 'Delivery',
}: SummaryRowsProps) {
  const total = subtotal - (discount?.amount ?? 0) + (deliveryFee ?? 0);
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd>{formatKES(subtotal)}</dd>
      </div>
      {discount && (
        <div className="text-mint-deep flex justify-between">
          <dt>Discount ({discount.code})</dt>
          <dd>−{formatKES(discount.amount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt>{deliveryLabel}</dt>
        <dd>
          {deliveryFee === null ? (
            <span className="text-muted">Calculated at checkout</span>
          ) : deliveryFee === 0 ? (
            <span className="text-mint-deep font-semibold">Free</span>
          ) : (
            formatKES(deliveryFee)
          )}
        </dd>
      </div>
      <div className="border-line flex items-baseline justify-between border-t pt-4">
        <dt className="font-semibold uppercase tracking-wider">Total</dt>
        <dd className="font-display text-2xl font-bold">{formatKES(total)}</dd>
      </div>
    </dl>
  );
}
