import {
  GENDER_LABELS,
  type CatalogIndexEntry,
  type Category,
  type Collection,
  type Gender,
  type WithId,
} from '@areqa/shared';

export type ShopScope =
  | { kind: 'all'; title: string; description: string }
  | { kind: 'new'; title: string; description: string }
  | { kind: 'sale'; title: string; description: string }
  | { kind: 'gender'; gender: Gender; title: string; description: string }
  | { kind: 'category'; category: WithId<Category>; title: string; description: string }
  | { kind: 'collection'; collection: WithId<Collection>; title: string; description: string }
  | { kind: 'unknown'; title: string; description: string };

const GENDER_COPY: Record<Gender, string> = {
  men: 'Shirts, tailoring, denim and everyday essentials for men.',
  women: 'Dresses, tailoring, knitwear and statement pieces for women.',
  unisex: 'Easy, gender-neutral pieces cut to be shared.',
};

/** Resolves /shop/:category to what is being browsed. */
export function resolveScope(
  param: string | undefined,
  categories: WithId<Category>[],
  collections: WithId<Collection>[],
): ShopScope {
  if (!param) return { kind: 'all', title: 'Shop all', description: 'The full Areqa collection.' };
  if (param === 'new-in')
    return {
      kind: 'new',
      title: 'New in',
      description: 'Just landed. The latest pieces from the studio.',
    };
  if (param === 'sale')
    return { kind: 'sale', title: 'Sale', description: 'Reduced pieces, while sizes last.' };
  if (param in GENDER_LABELS) {
    const gender = param as Gender;
    return {
      kind: 'gender',
      gender,
      title: GENDER_LABELS[gender],
      description: GENDER_COPY[gender],
    };
  }
  const category = categories.find((c) => c.slug === param);
  if (category)
    return { kind: 'category', category, title: category.name, description: category.description };
  const collection = collections.find((c) => c.slug === param);
  if (collection)
    return {
      kind: 'collection',
      collection,
      title: collection.name,
      description: collection.description,
    };
  return { kind: 'unknown', title: 'Not found', description: '' };
}

export function inScope(entry: CatalogIndexEntry, scope: ShopScope): boolean {
  switch (scope.kind) {
    case 'new':
      return entry.isNew;
    case 'sale':
      return entry.isOnSale;
    case 'gender':
      // Unisex pieces appear in both the men's and women's edits.
      return (
        entry.gender === scope.gender || (scope.gender !== 'unisex' && entry.gender === 'unisex')
      );
    case 'category':
      return entry.categoryId === scope.category.id;
    case 'collection':
      return entry.collectionIds.includes(scope.collection.id);
    case 'unknown':
      return false;
    default:
      return true;
  }
}
