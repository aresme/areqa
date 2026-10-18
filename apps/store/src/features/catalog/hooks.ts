import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  fetchApprovedReviews,
  fetchCatalog,
  fetchCategories,
  fetchCollections,
  fetchInventory,
  fetchProductBySlug,
} from './api';

export const useCatalog = () => useQuery({ queryKey: ['catalog'], queryFn: fetchCatalog });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 30 * 60_000 });

export const useCollections = () =>
  useQuery({ queryKey: ['collections'], queryFn: fetchCollections, staleTime: 30 * 60_000 });

export const useProduct = (slug: string | undefined) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: Boolean(slug),
  });

/** Live-ish stock: short stale time so availability is accurate before adding to cart. */
export const useInventory = (productId: string | undefined) =>
  useQuery({
    queryKey: ['inventory', productId],
    queryFn: () => fetchInventory(productId!),
    enabled: Boolean(productId),
    staleTime: 60_000,
  });

export const useReviews = (productId: string | undefined) =>
  useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchApprovedReviews(productId!),
    enabled: Boolean(productId),
  });

/** id → entry lookup over the catalog index. */
export function useCatalogMap() {
  const { data } = useCatalog();
  return useMemo(() => new Map((data ?? []).map((e) => [e.id, e])), [data]);
}
