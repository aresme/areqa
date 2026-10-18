import { QueryClient } from '@tanstack/react-query';

/**
 * Storefront data changes rarely, so cache aggressively: this is what keeps the
 * Firestore Spark quota (50k reads/day) comfortably out of reach.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
