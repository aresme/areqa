import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { formatKES } from '@areqa/shared';
import { useCart, type CartItem } from '@/features/cart/cartStore';
import { Img } from '@/components/ui/Img';
import { QuantityInput } from '@/components/ui/QuantityInput';

export function CartLine({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  return (
    <li className="flex gap-4 py-5">
      <Link
        to={`/product/${item.slug}`}
        onClick={onNavigate}
        className="w-20 shrink-0 overflow-hidden rounded sm:w-24"
      >
        <Img
          src={item.image}
          alt={item.name}
          aspect={0.8}
          sizes="96px"
          maxWidth={320}
          className="aspect-product w-full object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/product/${item.slug}`}
              onClick={onNavigate}
              className="line-clamp-2 text-sm font-semibold hover:underline"
            >
              {item.name}
            </Link>
            <p className="text-muted mt-1 text-xs">
              {item.color} · {item.size}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold">{formatKES(item.price * item.qty)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityInput
            size="sm"
            value={item.qty}
            max={10}
            onChange={(q) => setQty(item.productId, item.variantKey, q)}
            label={`Quantity for ${item.name}`}
          />
          <button
            type="button"
            onClick={() => remove(item.productId, item.variantKey)}
            className="text-muted hover:text-danger-deep inline-flex items-center gap-1.5 text-xs"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="size-3.5" aria-hidden /> Remove
          </button>
        </div>
      </div>
    </li>
  );
}
