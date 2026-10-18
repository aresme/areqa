import type { ImageAsset } from './common';

export interface CtaLink {
  label: string;
  href: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  headline: string;
  subtext: string;
  image: ImageAsset;
  mobileImage?: ImageAsset | null;
  primaryCta: CtaLink;
  secondaryCta: CtaLink | null;
}

export interface FeatureBanner {
  eyebrow: string;
  headline: string;
  body: string;
  image: ImageAsset;
  cta: CtaLink;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
}

export interface LookbookItem {
  id: string;
  image: ImageAsset;
  caption: string;
  href: string;
}

export interface HomeContent {
  announcement: { text: string; href: string; isActive: boolean };
  heroSlides: HeroSlide[];
  featureBanner: FeatureBanner;
  testimonials: Testimonial[];
  lookbook: LookbookItem[];
  newsletter: { headline: string; body: string };
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  group: string;
}

export type PolicyPageKey = 'about' | 'shipping' | 'returns' | 'privacy' | 'terms';

export interface PolicyPage {
  title: string;
  /** Lightweight markdown (headings, paragraphs, lists, bold, links). */
  body: string;
}

export interface PagesContent {
  faq: FaqItem[];
  pages: Record<PolicyPageKey, PolicyPage>;
}

export interface SizeGuide {
  title: string;
  columns: string[];
  /** Firestore forbids nested arrays, so each row wraps its cells. */
  rows: { cells: string[] }[];
  note: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logo: ImageAsset | null;
  contactEmail: string;
  orderAlertEmail: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  pickupLocation: string;
  businessHours: string;
  social: { instagram: string; tiktok: string; facebook: string; x: string };
  freeDeliveryThreshold: number;
  lowStockThreshold: number;
  /** Keyed by categoryId, with "default" as the fallback. */
  sizeGuides: Record<string, SizeGuide>;
}
