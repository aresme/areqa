import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { imageUrl } from '@areqa/shared';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductJsonLd } from '@/components/product/ProductJsonLd';
import { ProductRail } from '@/components/product/ProductRail';
import { ProductReviews } from '@/components/product/ProductReviews';
import { PurchasePanel } from '@/components/product/PurchasePanel';
import { Seo } from '@/components/Seo';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCatalog, useCatalogMap, useCategories, useProduct } from '@/features/catalog/hooks';
import { useRecentlyViewed } from '@/features/catalog/recentlyViewed';
import { relatedProducts } from '@/features/catalog/related';
import NotFoundPage from './NotFoundPage';

function ProductSkeleton() {
  return (
    <div
      className="container-page grid gap-10 py-8 lg:grid-cols-[1.2fr_1fr] lg:py-12"
      role="status"
      aria-label="Loading product"
    >
      <Skeleton className="aspect-product w-full" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const { data: catalog = [] } = useCatalog();
  const catalogMap = useCatalogMap();
  const { data: categories = [] } = useCategories();
  const recent = useRecentlyViewed();
  const [color, setColor] = useState('');

  useEffect(() => setColor(''), [slug]);
  useEffect(() => {
    if (product) recent.push(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- record once per product view
  }, [product?.id]);

  const images = useMemo(() => {
    if (!product) return [];
    const forColor = product.images.filter((i) => !i.color || i.color === color);
    return forColor.length > 0 ? forColor : product.images;
  }, [product, color]);

  const related = useMemo(
    () => relatedProducts(catalog, product ? catalogMap.get(product.id) : undefined),
    [catalog, catalogMap, product],
  );
  const recentEntries = useMemo(
    () =>
      recent.ids
        .filter((id) => id !== product?.id)
        .map((id) => catalogMap.get(id))
        .filter((e) => e !== undefined),
    [recent.ids, product?.id, catalogMap],
  );

  if (isLoading) return <ProductSkeleton />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (!product) return <NotFoundPage />;

  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <>
      <Seo
        title={product.name}
        description={product.shortDescription}
        image={
          product.images[0]
            ? imageUrl(product.images[0].url, { width: 1200, aspect: 1.91 })
            : undefined
        }
        path={`/product/${product.slug}`}
        type="product"
      />
      <ProductJsonLd product={product} />

      <div className="container-page pb-8 pt-4 sm:pt-8">
        <nav aria-label="Breadcrumb" className="text-muted mb-6 hidden text-xs sm:block">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link to="/" className="hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link to="/shop" className="hover:text-ink">
                Shop
              </Link>
            </li>
            {category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link to={`/shop/${category.slug}`} className="hover:text-ink">
                    {category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <ProductGallery images={images} name={product.name} />
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PurchasePanel
              product={product}
              categoryName={category?.name ?? ''}
              color={color}
              onColor={setColor}
            />
            <ProductDetails product={product} />
          </div>
        </div>

        <ProductReviews productId={product.id} product={product} />
        <ProductRail
          id="related-title"
          eyebrow="Complete the look"
          title="You may also like"
          entries={related}
        />
        <ProductRail
          id="recent-title"
          eyebrow="Your history"
          title="Recently viewed"
          entries={recentEntries}
        />
      </div>
    </>
  );
}
