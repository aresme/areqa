import { QueryClient } from '@tanstack/react-query';

/** Admin data should be fresh, but not refetched on every tab focus (read quota). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});
