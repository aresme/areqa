import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GENDER_LABELS, type Gender } from '@areqa/shared';
import { useCatalog, useCategories, useCollections } from '@/features/catalog/hooks';
import { Img } from '@/components/ui/Img';

/** Desktop dropdown for a gender: categories that actually have stock for it, collections, and a featured product. */
export function MegaMenu({ gender, onNavigate }: { gender: Gender; onNavigate: () => void }) {
  const { data: catalog = [] } = useCatalog();
  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();

  const forGender = catalog.filter(
    (e) => e.gender === gender || (gender !== 'unisex' && e.gender === 'unisex'),
  );
  const cats = categories.filter((c) => forGender.some((e) => e.categoryId === c.id));
  const featured = forGender.find((e) => e.isFeatured) ?? forGender[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="border-line bg-paper shadow-soft absolute inset-x-0 top-full border-b"
    >
      <div className="container-page grid grid-cols-12 gap-8 py-10">
        <div className="col-span-3">
          <p className="label text-muted mb-4">Shop {GENDER_LABELS[gender]}</p>
          <ul className="space-y-2.5">
            <li>
              <Link
                to={`/shop/${gender}`}
                onClick={onNavigate}
                className="hover:text-mint-deep font-semibold"
              >
                View all
              </Link>
            </li>
            {cats.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/shop/${gender}?category=${c.id}`}
                  onClick={onNavigate}
                  className="hover:text-mint-deep"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3">
          <p className="label text-muted mb-4">Collections</p>
          <ul className="space-y-2.5">
            {collections.map((c) => (
              <li key={c.id}>
                <Link to={`/shop/${c.slug}`} onClick={onNavigate} className="hover:text-mint-deep">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/shop/new-in" onClick={onNavigate} className="hover:text-mint-deep">
                New in
              </Link>
            </li>
            <li>
              <Link to="/shop/sale" onClick={onNavigate} className="text-mint-deep hover:underline">
                Sale
              </Link>
            </li>
          </ul>
        </div>
        {featured && (
          <Link
            to={`/product/${featured.slug}`}
            onClick={onNavigate}
            className="group col-span-6 grid grid-cols-2 gap-6"
          >
            <div className="aspect-product overflow-hidden rounded">
              <Img
                src={featured.images[0] ?? ''}
                alt={featured.name}
                aspect={0.8}
                sizes="20vw"
                maxWidth={640}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-end">
              <p className="label text-mint-deep">Featured</p>
              <p className="font-display mt-2 text-2xl font-bold uppercase leading-tight">
                {featured.name}
              </p>
              <p className="mt-3 text-sm font-semibold underline underline-offset-4">Shop now</p>
            </div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
