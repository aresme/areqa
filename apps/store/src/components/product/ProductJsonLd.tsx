import { Helmet } from 'react-helmet-async';
import { imageUrl, type Product } from '@areqa/shared';
import { config } from '@/lib/env';

/** schema.org Product markup so Google can show price and availability in results. */
export function ProductJsonLd({ product }: { product: Product }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images.slice(0, 4).map((i) => imageUrl(i.url, { width: 1080 })),
    sku: product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: 'Areqa' },
    offers: {
      '@type': 'Offer',
      url: `${config.siteUrl}/product/${product.slug}`,
      priceCurrency: 'KES',
      price: product.price,
      availability:
        product.totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.ratingCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingAvg,
        reviewCount: product.ratingCount,
      },
    }),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
      <meta property="product:price:amount" content={String(product.price)} />
      <meta property="product:price:currency" content="KES" />
    </Helmet>
  );
}
