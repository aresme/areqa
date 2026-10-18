import type { Gender } from '@areqa/shared';

export interface NavEntry {
  label: string;
  to: string;
  /** Gender mega-menus list categories filtered to that gender. */
  mega?: Gender;
  accent?: boolean;
}

export const MAIN_NAV: NavEntry[] = [
  { label: 'New In', to: '/shop/new-in' },
  { label: 'Men', to: '/shop/men', mega: 'men' },
  { label: 'Women', to: '/shop/women', mega: 'women' },
  { label: 'Unisex', to: '/shop/unisex', mega: 'unisex' },
  { label: 'Accessories', to: '/shop/accessories' },
  { label: 'Sale', to: '/shop/sale', accent: true },
];

export const FOOTER_SHOP = [
  { label: 'New In', to: '/shop/new-in' },
  { label: 'Men', to: '/shop/men' },
  { label: 'Women', to: '/shop/women' },
  { label: 'Accessories', to: '/shop/accessories' },
  { label: 'Sale', to: '/shop/sale' },
];

export const FOOTER_HELP = [
  { label: 'Track order', to: '/track' },
  { label: 'Shipping & delivery', to: '/shipping' },
  { label: 'Returns & exchanges', to: '/returns' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact us', to: '/contact' },
];

export const FOOTER_COMPANY = [
  { label: 'About Areqa', to: '/about' },
  { label: 'Privacy policy', to: '/privacy' },
  { label: 'Terms & conditions', to: '/terms' },
];
