import { useDeferredValue, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { formatKES } from '@areqa/shared';
import { useCatalog } from '@/features/catalog/hooks';
import { matchesSearch, sortEntries } from '@/features/catalog/filters';
import { useUi } from '@/features/ui/uiStore';
import { Img } from '@/components/ui/Img';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';

const SUGGESTIONS = ['Dress', 'Jacket', 'Tee', 'Chinos', 'Cap', 'Leather'];

/** Instant search over the cached catalog index: zero extra Firestore reads per keystroke. */
export function SearchOverlay() {
  const { panel, close } = useUi();
  const navigate = useNavigate();
  const { data: catalog, isLoading } = useCatalog();
  const [q, setQ] = useState('');
  const deferred = useDeferredValue(q);

  const results = useMemo(() => {
    if (!catalog || deferred.trim().length < 2) return [];
    return sortEntries(
      catalog.filter((e) => matchesSearch(e, deferred)),
      'best_selling',
    );
  }, [catalog, deferred]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    close();
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <Sheet
      open={panel === 'search'}
      onClose={close}
      side="top"
      title="Search"
      hideTitle
      className="pb-6"
    >
      <div className="container-page">
        <form
          onSubmit={submit}
          role="search"
          className="border-ink flex items-center gap-3 border-b-2 pb-3"
        >
          <Search className="size-6 shrink-0" aria-hidden />
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            id="site-search"
            data-autofocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dresses, jackets, tees…"
            autoComplete="off"
            className="font-display placeholder:text-muted/60 w-full bg-transparent text-2xl font-bold outline-none focus-visible:ring-0 sm:text-4xl"
          />
        </form>

        <div className="mt-6 min-h-24" aria-live="polite">
          {deferred.trim().length < 2 ? (
            <div>
              <p className="label text-muted mb-3">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQ(s)}
                    className="border-line hover:border-ink hover:bg-mint rounded-full border px-4 py-2 text-sm transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="aspect-product" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="text-muted">
              No results for “{deferred}”. Try a different word, or{' '}
              <Link to="/shop" onClick={close} className="text-ink font-semibold underline">
                browse everything
              </Link>
              .
            </p>
          ) : (
            <>
              <p className="label text-muted mb-4">
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
                {results.slice(0, 6).map((e) => (
                  <li key={e.id}>
                    <Link to={`/product/${e.slug}`} onClick={close} className="group block">
                      <div className="aspect-product overflow-hidden rounded">
                        <Img
                          src={e.images[0] ?? ''}
                          alt={e.name}
                          aspect={0.8}
                          sizes="(min-width:1024px) 16vw, 50vw"
                          maxWidth={640}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium leading-snug">{e.name}</p>
                      <p className="text-muted text-sm">{formatKES(e.price)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              {results.length > 6 && (
                <button
                  type="button"
                  onClick={submit}
                  className="hover:text-mint-deep mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
                >
                  View all {results.length} results <ArrowRight className="size-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Sheet>
  );
}
