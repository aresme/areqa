import { CategoryTiles } from '@/components/home/CategoryTiles';
import { FeatureBanner } from '@/components/home/FeatureBanner';
import { Hero } from '@/components/home/Hero';
import { Lookbook } from '@/components/home/Lookbook';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { Testimonials } from '@/components/home/Testimonials';
import { ValuesStrip } from '@/components/home/ValuesStrip';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid';
import { SectionHeader } from '@/components/SectionHeader';
import { Seo } from '@/components/Seo';
import { ErrorState } from '@/components/ui/ErrorState';
import { useCatalog, useCategories } from '@/features/catalog/hooks';
import { sortEntries } from '@/features/catalog/filters';
import { useHomeContent, useSettings } from '@/features/content/hooks';

export default function HomePage() {
  const home = useHomeContent();
  const catalog = useCatalog();
  const categories = useCategories();
  const { settings } = useSettings();

  const entries = catalog.data ?? [];
  const inStock = entries.filter((e) => e.totalStock > 0);
  const newArrivals = sortEntries(
    inStock.filter((e) => e.isNew),
    'newest',
  );
  const fallbackNew =
    newArrivals.length >= 4 ? newArrivals : sortEntries(inStock, 'newest').slice(0, 8);
  const bestSellers = sortEntries(
    inStock.filter((e) => e.isBestSeller),
    'best_selling',
  ).slice(0, 8);

  if (home.isError && catalog.isError) {
    return (
      <ErrorState
        onRetry={() => {
          void home.refetch();
          void catalog.refetch();
        }}
      />
    );
  }

  return (
    <>
      <Seo
        description={`${settings.storeName}: ${settings.tagline} Shop men's, women's and unisex fashion with fast delivery across Kenya and pay on delivery.`}
        path="/"
      />
      <Hero slides={home.data?.heroSlides ?? []} loading={home.isLoading} />

      <section aria-labelledby="cat-title" className="container-page py-16 sm:py-24">
        <SectionHeader
          id="cat-title"
          eyebrow="Shop by"
          title="Category"
          link={{ to: '/shop', label: 'Shop all' }}
        />
        <CategoryTiles
          catalog={entries}
          categories={categories.data ?? []}
          loading={catalog.isLoading}
        />
      </section>

      <section aria-labelledby="new-title" className="container-page pb-16 sm:pb-24">
        <SectionHeader
          id="new-title"
          eyebrow="Just landed"
          title="New arrivals"
          link={{ to: '/shop/new-in', label: 'View all' }}
        />
        <ProductCarousel entries={fallbackNew} loading={catalog.isLoading} label="New arrivals" />
      </section>

      {home.data?.featureBanner && <FeatureBanner banner={home.data.featureBanner} />}

      <section aria-labelledby="best-title" className="container-page py-16 sm:py-24">
        <SectionHeader
          id="best-title"
          eyebrow="Most loved"
          title="Best sellers"
          link={{ to: '/shop?sort=best_selling', label: 'View all' }}
        />
        {catalog.isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <ProductGrid entries={bestSellers} priorityCount={0} />
        )}
      </section>

      <ValuesStrip />
      {home.data && <Testimonials items={home.data.testimonials} />}
      {home.data && <Lookbook items={home.data.lookbook} instagram={settings.social.instagram} />}
      {home.data?.newsletter && (
        <NewsletterSection
          headline={home.data.newsletter.headline}
          body={home.data.newsletter.body}
        />
      )}
    </>
  );
}
