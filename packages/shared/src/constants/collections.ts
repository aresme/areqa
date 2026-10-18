/** Firestore collection / document paths in one place. */
export const COL = {
  products: 'products',
  inventory: 'inventory',
  categories: 'categories',
  collections: 'collections',
  orders: 'orders',
  orderLookup: 'orderLookup',
  users: 'users',
  reviews: 'reviews',
  discounts: 'discounts',
  messages: 'messages',
  newsletter: 'newsletter',
  admins: 'admins',
  deliveryZones: 'deliveryZones',
  settings: 'settings',
  content: 'content',
  meta: 'meta',
} as const;

export const DOC = {
  storeSettings: 'store',
  homeContent: 'home',
  pagesContent: 'pages',
  catalogIndex: 'catalogIndex',
} as const;
