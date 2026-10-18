import { ShoppingBag } from 'lucide-react';
import { formatKES } from '@areqa/shared';
import { cartSubtotal, useCart } from '@/features/cart/cartStore';
import { useUi } from '@/features/ui/uiStore';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sheet } from '@/components/ui/Sheet';
import { CartLine } from './CartLine';
import { FreeDeliveryProgress } from './FreeDeliveryProgress';

export function CartDrawer() {
  const { panel, close } = useUi();
  const items = useCart((s) => s.items);
  const subtotal = cartSubtotal(items);
  const count = items.reduce((n, i) => n + i.qty, 0);

  return (
    <Sheet
      open={panel === 'cart'}
      onClose={close}
      title={`Your bag (${count})`}
      footer={
        items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm">Subtotal</span>
              <span className="font-display text-xl font-bold">{formatKES(subtotal)}</span>
            </div>
            <p className="text-muted text-xs">Delivery and discounts are calculated at checkout.</p>
            <div className="grid gap-2">
              <ButtonLink to="/checkout" onClick={close} size="lg" block>
                Checkout
              </ButtonLink>
              <ButtonLink to="/cart" onClick={close} variant="secondary" block>
                View bag
              </ButtonLink>
            </div>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          body="Looks like you haven't added anything yet. Let's change that."
          action={
            <ButtonLink to="/shop/new-in" onClick={close}>
              Shop new in
            </ButtonLink>
          }
        />
      ) : (
        <div className="px-5 pt-5">
          <FreeDeliveryProgress subtotal={subtotal} />
          <ul className="divide-line divide-y">
            {items.map((item) => (
              <CartLine
                key={`${item.productId}-${item.variantKey}`}
                item={item}
                onNavigate={close}
              />
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
