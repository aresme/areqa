import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { COL, slugify, type Category, type WithId } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

/** Categories and collections share one shape and editor. */
export type TaxonomyKind = 'categories' | 'collections';
export type Taxon = WithId<Category>;

const db = () => requireFirebase().db;

export async function fetchTaxonomy(kind: TaxonomyKind): Promise<Taxon[]> {
  const snap = await getDocs(query(collection(db(), COL[kind]), orderBy('sortOrder')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Category) }));
}

/** The id is the slug at creation and never changes, so product references stay valid. */
export async function saveTaxon(
  kind: TaxonomyKind,
  id: string | null,
  data: Category,
): Promise<string> {
  const docId = id ?? slugify(data.slug || data.name);
  await setDoc(doc(db(), COL[kind], docId), { ...data, slug: slugify(data.slug || data.name) });
  return docId;
}

export async function countProductsUsing(kind: TaxonomyKind, id: string): Promise<number> {
  const field =
    kind === 'categories'
      ? where('categoryId', '==', id)
      : where('collectionIds', 'array-contains', id);
  const snap = await getDocs(query(collection(db(), COL.products), field, limit(50)));
  return snap.size;
}

export async function deleteTaxon(kind: TaxonomyKind, id: string) {
  await deleteDoc(doc(db(), COL[kind], id));
}

export const useTaxonomy = (kind: TaxonomyKind) =>
  useQuery({
    queryKey: ['admin-taxonomy', kind],
    queryFn: () => fetchTaxonomy(kind),
    staleTime: 5 * 60_000,
  });

export function useInvalidateTaxonomy() {
  const qc = useQueryClient();
  return (kind: TaxonomyKind) => void qc.invalidateQueries({ queryKey: ['admin-taxonomy', kind] });
}
