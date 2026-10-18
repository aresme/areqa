import { doc, getDoc } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { COL, DOC, type CatalogIndex } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

/** The storefront's product index: one read gives every active product's live price and name. */
export const useCatalogIndex = () =>
  useQuery({
    queryKey: ['admin-catalog-index'],
    queryFn: async () => {
      const snap = await getDoc(doc(requireFirebase().db, COL.meta, DOC.catalogIndex));
      return snap.exists() ? (snap.data() as CatalogIndex).entries : [];
    },
    staleTime: 60_000,
  });
