import { discountPercent, type CatalogIndexEntry } from '@areqa/shared';
import { useSettings } from '@/features/content/hooks';
import { Badge } from '@/components/ui/Badge';

export function ProductBadges({ entry }: { entry: CatalogIndexEntry }) {
  const { settings } = useSettings();
  const off = discountPercent(entry.price, entry.compareAtPrice);
  if (entry.totalStock === 0) return <Badge tone="out">Sold out</Badge>;
  return (
    <>
      {entry.isNew && <Badge tone="new">New</Badge>}
      {off > 0 && <Badge tone="sale">−{off}%</Badge>}
      {entry.totalStock <= settings.lowStockThreshold && <Badge tone="low">Low stock</Badge>}
    </>
  );
}
