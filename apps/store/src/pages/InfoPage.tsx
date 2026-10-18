import { useLocation } from 'react-router-dom';
import { markdownToText, type PolicyPageKey } from '@areqa/shared';
import { Markdown } from '@/components/Markdown';
import { Seo } from '@/components/Seo';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePagesContent } from '@/features/content/hooks';
import NotFoundPage from './NotFoundPage';

const KEYS: PolicyPageKey[] = ['about', 'shipping', 'returns', 'privacy', 'terms'];

export default function InfoPage() {
  const key = useLocation().pathname.slice(1) as PolicyPageKey;
  const { data, isLoading, isError, refetch } = usePagesContent();
  if (!KEYS.includes(key)) return <NotFoundPage />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  const page = data?.pages[key];

  return (
    <article className="container-page pb-24 pt-10 sm:pt-16">
      <div className="mx-auto max-w-2xl">
        {isLoading ? (
          <div className="space-y-4" role="status" aria-label="Loading">
            <Skeleton className="h-12 w-2/3" />
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : !page ? (
          <NotFoundPage />
        ) : (
          <>
            <Seo
              title={page.title}
              description={markdownToText(page.body).slice(0, 155)}
              path={`/${key}`}
            />
            <p className="label text-mint-deep">
              {key === 'about' ? 'Our story' : 'Customer care'}
            </p>
            <h1 className="text-display mt-2 uppercase">{page.title}</h1>
            <Markdown source={page.body} className="mt-8" />
          </>
        )}
      </div>
    </article>
  );
}
