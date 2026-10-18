import { Helmet } from 'react-helmet-async';
import { config } from '@/lib/env';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: 'website' | 'product';
  noIndex?: boolean;
}

const SITE = 'Areqa';
const DEFAULT_DESCRIPTION =
  "Modern men's, women's and unisex fashion. Quality fabrics, fast delivery across Kenya, pay on delivery.";

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  path,
  type = 'website',
  noIndex,
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE}` : `${SITE} — Modern Fashion, Made for Kenya`;
  const url = path ? `${config.siteUrl}${path}` : undefined;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}
      {noIndex && <meta name="robots" content="noindex" />}
      <meta property="og:site_name" content={SITE} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
    </Helmet>
  );
}
