import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { variantKey, type CatalogIndexEntry } from '@areqa/shared';
import { useInventory } from '@/features/catalog/hooks';
import { defaultColor, stockOf } from '@/features/catalog/variants';
import { useAddToCart } from '@/features/cart/useAddToCart';
import { useSettings } from '@/features/content/hooks';
import { Button } from '@/components/ui/Button';
import { Img } from '@/components/ui/Img';
import { Price } from '@/components/ui/Price';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { VariantSelector } from './VariantSelector';

export function QuickAddSheet({
  entry,
  onClose,
}: {
  entry: CatalogIndexEntry | null;
  onClose: () => void;
}) {
  const { data: stock, isLoading } = useInventory(entry?.id);
  const { settings } = useSettings();
  const addToCart = useAddToCart();
  const [color, setColor] = useState('');
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (!entry) return;
    setColor(defaultColor(stock, entry.colors, entry.sizes));
    setSize(entry.sizes.length === 1 ? entry.sizes[0]! : null);
    setSizeError(false);
  }, [entry, stock]);

  const onAdd = () => {
    if (!entry) return;
    if (!size) return setSizeError(true);
    const max = stockOf(stock, color, size);
    const res = addToCart(
      {
        productId: entry.id,
        variantKey: variantKey(color, size),
        slug: entry.slug,
        name: entry.name,
        image: entry.images[0] ?? '',
        color,
        size,
        price: entry.price,
      },
      1,
      max,
    );
    if (res === 'added' || res === 'updated') onClose();
  };

  const selectedOut = size !== null && stock !== undefined && stockOf(stock, color, size) === 0;

  return (
    <Sheet
      open={Boolean(entry)}
      onClose={onClose}
      side="bottom"
      title="Quick add"
      className="sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-0 sm:h-full sm:w-full sm:max-w-md sm:rounded-none"
    >
      {entry && (
        <div className="space-y-6 p-5">
          <div className="flex gap-4">
            <div className="w-24 shrink-0 overflow-hidden rounded">
              <Img
                src={entry.images[0] ?? ''}
                alt={entry.name}
                aspect={0.8}
                sizes="96px"
                maxWidth={320}
                className="aspect-product w-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold">{entry.name}</p>
              <Price
                price={entry.price}
                compareAt={entry.compareAtPrice}
                className="mt-1 text-sm"
              />
              <Link
                to={`/product/${entry.slug}`}
                onClick={onClose}
                className="mt-2 inline-block text-xs underline underline-offset-4"
              >
                View full details
              </Link>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : (
            <VariantSelector
              colors={entry.colors}
              sizes={entry.sizes}
              stock={stock}
              color={color}
              size={size}
              onColor={(c) => {
                setColor(c);
                if (size && stockOf(stock, c, size) === 0)
                  setSize(entry.sizes.length === 1 ? size : null);
              }}
              onSize={(s) => {
                setSize(s);
                setSizeError(false);
              }}
              lowStockThreshold={settings.lowStockThreshold}
              sizeError={sizeError}
            />
          )}
          <Button size="lg" block onClick={onAdd} disabled={isLoading || selectedOut}>
            {selectedOut ? 'Sold out' : 'Add to bag'}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
