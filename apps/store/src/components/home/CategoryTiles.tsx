import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { CatalogIndexEntry, Category, WithId } from '@areqa/shared';
import { Img } from '@/components/ui/Img';
import { Skeleton } from '@/components/ui/Skeleton';

interface Tile {
  label: string;
  to: string;
  image: string;
}

function pickImage(
  entries: CatalogIndexEntry[],
  test: (e: CatalogIndexEntry) => boolean,
  skip: Set<string>,
) {
  const e = entries
    .filter(test)
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    .find((x) => x.images[0] && !skip.has(x.images[0]));
  if (e?.images[0]) skip.add(e.images[0]);
  return e?.images[0] ?? '';
}

export function CategoryTiles({
  catalog,
  categories,
  loading,
}: {
  catalog: CatalogIndexEntry[];
  categories: WithId<Category>[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4]" />
        ))}
      </div>
    );
  }
  const used = new Set<string>();
  const accessories = categories.find((c) => c.slug === 'accessories');
  const tiles: Tile[] = [
    {
      label: 'Women',
      to: '/shop/women',
      image: pickImage(catalog, (e) => e.gender === 'women', used),
    },
    { label: 'Men', to: '/shop/men', image: pickImage(catalog, (e) => e.gender === 'men', used) },
    {
      label: 'Unisex',
      to: '/shop/unisex',
      image: pickImage(
        catalog,
        (e) => e.gender === 'unisex' && e.categoryId !== 'accessories',
        used,
      ),
    },
    {
      label: 'Accessories',
      to: '/shop/accessories',
      image:
        accessories?.image?.url ?? pickImage(catalog, (e) => e.categoryId === 'accessories', used),
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {tiles.map((t) => (
        <li key={t.to}>
          <Link
            to={t.to}
            className="bg-mist group relative block aspect-[3/4] overflow-hidden rounded"
          >
            <Img
              src={t.image}
              alt=""
              aspect={0.75}
              sizes="(min-width:1024px) 25vw, 50vw"
              maxWidth={1080}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="from-ink/60 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
              aria-hidden
            />
            <div className="text-paper absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
              <span className="font-display text-xl font-bold uppercase sm:text-3xl">
                {t.label}
              </span>
              <span
                className="bg-paper text-ink group-hover:bg-mint flex size-9 items-center justify-center rounded-full transition-colors"
                aria-hidden
              >
                <ArrowUpRight className="size-4" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
