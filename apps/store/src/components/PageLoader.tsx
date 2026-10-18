import { Skeleton } from './ui/Skeleton';

/** Route-level suspense fallback: a neutral page skeleton rather than a spinner. */
export function PageLoader() {
  return (
    <div className="container-page py-10" role="status" aria-label="Loading page">
      <Skeleton className="mb-6 h-10 w-1/3" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-product w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
