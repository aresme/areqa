import { useEffect, useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import {
  discountPercent,
  formatKES,
  variantKey,
  whatsappLink,
  type Product,
  type WithId,
} from '@areqa/shared';
import { useInventory } from '@/features/catalog/hooks';
import { defaultColor, stockOf } from '@/features/catalog/variants';
import { useAddToCart } from '@/features/cart/useAddToCart';
import { useSettings } from '@/features/content/hooks';
import { config } from '@/lib/env';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { QuantityInput } from '@/components/ui/QuantityInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stars } from '@/components/ui/Stars';
import { SizeGuideModal } from './SizeGuideModal';
import { VariantSelector } from './VariantSelector';
import { WishlistButton } from './WishlistButton';

interface PurchasePanelProps {
  product: WithId<Product>;
  categoryName: string;
  color: string;
  onColor: (color: string) => void;
}

export function PurchasePanel({ product, categoryName, color, onColor }: PurchasePanelProps) {
  const { data: stock, isLoading } = useInventory(product.id);
  const { settings } = useSettings();
  const addToCart = useAddToCart();
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(oneSize ? product.sizes[0]! : null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Pick the first in-stock colour once stock arrives.
  useEffect(() => {
    if (stock && !color) onColor(defaultColor(stock, product.colors, product.sizes));
  }, [stock, color, product, onColor]);

  const available = size ? stockOf(stock, color, size) : null;
  const totalLeft = useMemo(() => Object.values(stock ?? {}).reduce((a, b) => a + b, 0), [stock]);
  const soldOut = stock !== undefined && totalLeft === 0;
  const off = discountPercent(product.price, product.compareAtPrice);
  const guide = oneSize
    ? undefined
    : (settings.sizeGuides[product.categoryId] ?? settings.sizeGuides.default);

  const changeColor = (c: string) => {
    onColor(c);
    if (size && !oneSize && stockOf(stock, c, size) === 0) setSize(null);
    setQty(1);
  };

  const onAdd = () => {
    if (!size) return setSizeError(true);
    const res = addToCart(
      {
        productId: product.id,
        variantKey: variantKey(color, size),
        slug: product.slug,
        name: product.name,
        image: (product.images.find((i) => i.color === color) ?? product.images[0])?.url ?? '',
        color,
        size,
        price: product.price,
      },
      qty,
      available ?? 0,
    );
    if (res === 'added' || res === 'updated') setQty(1);
  };

  const whatsappNumber = settings.whatsappNumber || config.whatsappFallback;
  const waMessage = [
    `Hi ${settings.storeName}! I'd like to order:`,
    `• ${product.name}`,
    color && `• Colour: ${color}`,
    size && `• Size: ${size}`,
    `• Quantity: ${qty}`,
    `• Price: ${formatKES(product.price)}`,
    `${config.siteUrl}/product/${product.slug}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div>
      <p className="label text-muted">{categoryName}</p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight sm:text-4xl">
          {product.name}
        </h1>
        <WishlistButton
          productId={product.id}
          name={product.name}
          className="border-line mt-1 shrink-0 border"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Price price={product.price} compareAt={product.compareAtPrice} className="text-xl" />
        {off > 0 && <Badge tone="sale">Save {off}%</Badge>}
        {product.isNew && <Badge tone="new">New</Badge>}
      </div>
      {product.ratingCount > 0 && (
        <a
          href="#reviews-heading"
          className="text-muted hover:text-ink mt-3 inline-flex items-center gap-2 text-xs"
        >
          <Stars value={product.ratingAvg} /> {product.ratingCount} reviews
        </a>
      )}
      <p className="text-muted mt-5 leading-relaxed">{product.shortDescription}</p>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <VariantSelector
            colors={product.colors}
            sizes={product.sizes}
            stock={stock}
            color={color}
            size={size}
            onColor={changeColor}
            onSize={(s) => {
              setSize(s);
              setSizeError(false);
              setQty(1);
            }}
            lowStockThreshold={settings.lowStockThreshold}
            onSizeGuide={guide ? () => setGuideOpen(true) : undefined}
            sizeError={sizeError}
          />
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <QuantityInput
          value={qty}
          onChange={setQty}
          max={Math.max(1, Math.min(10, available ?? 10))}
        />
        <Button
          size="lg"
          className="flex-1"
          onClick={onAdd}
          disabled={isLoading || soldOut || available === 0}
        >
          {soldOut ? 'Sold out' : available === 0 ? 'Size sold out' : 'Add to bag'}
        </Button>
      </div>

      {whatsappNumber && (
        <a
          href={whatsappLink(whatsappNumber, waMessage)}
          target="_blank"
          rel="noreferrer"
          className="border-ink hover:text-ink mt-3 flex h-12 w-full items-center justify-center gap-2 rounded border text-xs font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-[#25D366]"
        >
          <MessageCircle className="size-4" aria-hidden /> Order via WhatsApp
        </a>
      )}

      <ul className="text-muted mt-6 space-y-1.5 text-xs">
        <li>✓ Pay on delivery or via M-Pesa after confirmation</li>
        {settings.freeDeliveryThreshold > 0 && (
          <li>✓ Free delivery on orders over {formatKES(settings.freeDeliveryThreshold)}</li>
        )}
        <li>✓ 7-day exchanges on unworn items</li>
      </ul>

      <SizeGuideModal guide={guide} open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
