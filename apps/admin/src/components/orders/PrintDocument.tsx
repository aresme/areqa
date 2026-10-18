import {
  PAYMENT_METHOD_LABELS,
  formatDate,
  formatKES,
  formatKenyanPhone,
  type Order,
  type StoreSettings,
} from '@areqa/shared';

/** Print-only invoice or packing slip; the rest of the admin is hidden by print styles. */
export function PrintDocument({
  order,
  settings,
  kind,
}: {
  order: Order;
  settings: StoreSettings | null | undefined;
  kind: 'invoice' | 'slip';
}) {
  const d = order.delivery;
  return (
    <div className="bg-paper text-ink hidden p-10 text-[12px] leading-relaxed print:block">
      <div className="border-ink flex items-start justify-between border-b-2 pb-6">
        <div>
          <p className="font-display text-3xl font-bold uppercase">
            {settings?.storeName ?? 'Areqa'}
            <span className="text-mint-deep">.</span>
          </p>
          <p className="text-muted mt-1">{settings?.address}</p>
          <p className="text-muted">
            {settings?.phone && formatKenyanPhone(settings.phone)} · {settings?.contactEmail}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold uppercase">
            {kind === 'invoice' ? 'Invoice' : 'Packing slip'}
          </p>
          <p className="mt-1 font-semibold">{order.orderNumber}</p>
          <p className="text-muted">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 py-6">
        <div>
          <p className="text-muted mb-1 text-[10px] font-bold uppercase tracking-widest">
            {kind === 'invoice' ? 'Bill to' : 'Customer'}
          </p>
          <p className="font-semibold">{order.customer.name}</p>
          <p>{formatKenyanPhone(order.customer.phone)}</p>
          <p>{order.customer.email}</p>
        </div>
        <div>
          <p className="text-muted mb-1 text-[10px] font-bold uppercase tracking-widest">
            {d.method === 'pickup' ? 'Store pickup' : 'Deliver to'}
          </p>
          {d.method === 'pickup' ? (
            <p>{settings?.pickupLocation}</p>
          ) : (
            <>
              <p>{d.address}</p>
              <p>
                {d.town}, {d.county}
              </p>
              <p className="text-muted">{d.zoneName}</p>
            </>
          )}
          {d.notes && <p className="mt-1 italic">Note: {d.notes}</p>}
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-ink border-b text-left text-[10px] uppercase tracking-widest">
            {kind === 'slip' && <th className="w-10 py-2">✓</th>}
            <th className="py-2">Item</th>
            <th className="py-2">Colour / size</th>
            <th className="py-2 text-right">Qty</th>
            {kind === 'invoice' && (
              <>
                <th className="py-2 text-right">Unit</th>
                <th className="py-2 text-right">Amount</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.variantKey + i.productId} className="border-line border-b">
              {kind === 'slip' && (
                <td className="py-2">
                  <span className="border-ink inline-block size-4 border" />
                </td>
              )}
              <td className="py-2 font-medium">{i.name}</td>
              <td className="py-2">
                {i.color} · {i.size}
              </td>
              <td className="py-2 text-right">{i.qty}</td>
              {kind === 'invoice' && (
                <>
                  <td className="py-2 text-right">{formatKES(i.unitPrice)}</td>
                  <td className="py-2 text-right">{formatKES(i.unitPrice * i.qty)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {kind === 'invoice' ? (
        <div className="ml-auto mt-4 w-64 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatKES(order.subtotal)}</span>
          </div>
          {order.discount && (
            <div className="flex justify-between">
              <span>Discount ({order.discount.code})</span>
              <span>−{formatKES(order.discount.amount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{order.deliveryFee ? formatKES(order.deliveryFee) : 'Free'}</span>
          </div>
          <div className="border-ink flex justify-between border-t-2 pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatKES(order.total)}</span>
          </div>
          <p className="text-muted pt-2">
            {PAYMENT_METHOD_LABELS[order.paymentMethod]} ·{' '}
            {order.paymentStatus === 'paid'
              ? `Paid${order.paymentRef ? ` (${order.paymentRef})` : ''}`
              : 'Unpaid'}
          </p>
        </div>
      ) : (
        <p className="mt-6">
          Items: <strong>{order.itemCount}</strong> · Packed by: ____________ · Date: ____________
        </p>
      )}
      <p className="border-line text-muted mt-12 border-t pt-4 text-center">
        Thank you for shopping with {settings?.storeName ?? 'Areqa'}. Exchanges within 7 days on
        unworn items with tags.
      </p>
    </div>
  );
}
