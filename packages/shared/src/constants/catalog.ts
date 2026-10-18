export const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export const SHOE_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45'] as const;
export const ONE_SIZE = 'One size';

export const SIZE_PRESETS = {
  apparel: [...APPAREL_SIZES],
  shoes: [...SHOE_SIZES],
  waist: ['28', '30', '32', '34', '36', '38'],
  oneSize: [ONE_SIZE],
} as const;

/** Canonical sort order so size chips always appear in a sensible sequence. */
export const SIZE_ORDER: string[] = [
  ...APPAREL_SIZES,
  ...SIZE_PRESETS.waist,
  ...SHOE_SIZES,
  ONE_SIZE,
];

export const COLOR_PALETTE = [
  { name: 'Black', hex: '#0B0B0B' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Off White', hex: '#F3EFE6' },
  { name: 'Grey', hex: '#9CA3AF' },
  { name: 'Charcoal', hex: '#374151' },
  { name: 'Navy', hex: '#1E2A44' },
  { name: 'Olive', hex: '#5B6236' },
  { name: 'Sage', hex: '#A3B899' },
  { name: 'Mint', hex: '#B8F2C4' },
  { name: 'Sand', hex: '#D8C3A5' },
  { name: 'Camel', hex: '#B5835A' },
  { name: 'Brown', hex: '#6B4226' },
  { name: 'Rust', hex: '#B4532A' },
  { name: 'Red', hex: '#B91C1C' },
  { name: 'Pink', hex: '#F4B6C2' },
  { name: 'Blue', hex: '#3B6EA8' },
  { name: 'Denim', hex: '#5A7BA6' },
] as const;

export const GENDERS = ['men', 'women', 'unisex'] as const;

export const GENDER_LABELS = { men: 'Men', women: 'Women', unisex: 'Unisex' } as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'best_selling', label: 'Best selling' },
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export const PRODUCTS_PAGE_SIZE = 12;
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;
