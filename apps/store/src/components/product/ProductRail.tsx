import type { CatalogIndexEntry } from '@areqa/shared';
import { SectionHeader } from '@/components/SectionHeader';
import { ProductCarousel } from './ProductCarousel';

export function ProductRail({
  id,
  title,
  eyebrow,
  entries,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  entries: CatalogIndexEntry[];
}) {
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby={id} className="border-line border-t py-16">
      <SectionHeader id={id} eyebrow={eyebrow} title={title} />
      <ProductCarousel entries={entries} label={title} />
    </section>
  );
}
