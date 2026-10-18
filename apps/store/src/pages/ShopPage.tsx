import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { PRODUCTS_PAGE_SIZE } from '@areqa/shared';
import { ProductGrid, ProductGridSkeleton, type Density } from '@/components/product/ProductGrid';
import { Seo } from '@/components/Seo';
import { ActiveFilters } from '@/components/shop/ActiveFilters';
import { FilterPanel } from '@/components/shop/FilterPanel';
import { ShopToolbar } from '@/components/shop/ShopToolbar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  applyFilters,
  countActive,
  facetsFor,
  parseFilters,
  withFilters,
  type FilterUpdates,
} from '@/features/catalog/filters';
import { useCatalog, useCategories, useCollections } from '@/features/catalog/hooks';
import { inScope, resolveScope } from '@/features/catalog/scope';
import NotFoundPage from './NotFoundPage';

const PAGE = PRODUCTS_PAGE_SIZE * 2;
const DENSITY_KEY = 'areqa-density';

function readDensity(): Density {
  try {
    const v = localStorage.getItem(DENSITY_KEY);
    return v === 'compact' || v === 'list' ? v : 'comfortable';
  } catch {
    return 'comfortable';
  }
}

export default function ShopPage() {
  const { category: param } = useParams();
  const [params, setParams] = useSearchParams();
  const catalog = useCatalog();
  const categories = useCategories();
  const collections = useCollections();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [density, setDensityState] = useState<Density>(readDensity);
  const [visible, setVisible] = useState(PAGE);

  const filters = useMemo(() => parseFilters(params), [params]);
  const scope = useMemo(
    () => resolveScope(param, categories.data ?? [], collections.data ?? []),
    [param, categories.data, collections.data],
  );
  const scoped = useMemo(
    () => (catalog.data ?? []).filter((e) => inScope(e, scope)),
    [catalog.data, scope],
  );
  const facets = useMemo(() => facetsFor(scoped), [scoped]);
  const results = useMemo(() => applyFilters(scoped, filters), [scoped, filters]);
  const active = countActive(filters);

  const onChange = (updates: FilterUpdates) => {
    setParams((p) => withFilters(p, updates), { replace: true });
    setVisible(PAGE);
  };
  const clearAll = () => {
    setParams(filters.sort !== 'newest' ? { sort: filters.sort } : {}, { replace: true });
    setVisible(PAGE);
  };
  const setDensity = (d: Density) => {
    setDensityState(d);
    try {
      localStorage.setItem(DENSITY_KEY, d);
    } catch {
      /* private mode: density just won't persist */
    }
  };

  const metaLoading = categories.isLoading || collections.isLoading;
  if (!metaLoading && scope.kind === 'unknown') return <NotFoundPage />;
  if (catalog.isError) return <ErrorState onRetry={() => void catalog.refetch()} />;

  const title = filters.q && scope.kind === 'all' ? `Search: ${filters.q}` : scope.title;
  const panel = (
    <FilterPanel
      filters={filters}
      facets={facets}
      categories={categories.data ?? []}
      showCategory={scope.kind !== 'category'}
      showGender={scope.kind !== 'gender'}
      onChange={onChange}
    />
  );

  return (
    <div className="container-page pb-20 pt-8 sm:pt-12">
      <Seo
        title={title}
        description={scope.description || `Shop ${title} at Areqa.`}
        path={`/shop${param ? `/${param}` : ''}`}
      />

      <nav aria-label="Breadcrumb" className="text-muted mb-4 text-xs">
        <ol className="flex gap-2">
          <li>
            <Link to="/" className="hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          {param ? (
            <>
              <li>
                <Link to="/shop" className="hover:text-ink">
                  Shop
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ink">
                {scope.title}
              </li>
            </>
          ) : (
            <li aria-current="page" className="text-ink">
              Shop
            </li>
          )}
        </ol>
      </nav>

      <header className="mb-8 sm:mb-12">
        {metaLoading ? (
          <Skeleton className="h-12 w-64" />
        ) : (
          <h1 className="text-display uppercase sm:text-[clamp(2.5rem,5vw,4.5rem)]">{title}</h1>
        )}
        {scope.description && !filters.q && (
          <p className="text-muted mt-3 max-w-xl">{scope.description}</p>
        )}
        <p className="text-muted mt-2 text-sm lg:hidden">
          {catalog.isLoading
            ? ' '
            : `${results.length} ${results.length === 1 ? 'product' : 'products'}`}
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-8 pr-2">
            {catalog.isLoading ? <Skeleton className="h-96 w-full" /> : panel}
          </div>
        </aside>

        <div>
          <ShopToolbar
            count={results.length}
            sort={filters.sort}
            density={density}
            activeCount={active}
            onSort={(s) => onChange({ sort: s === 'newest' ? null : s })}
            onDensity={setDensity}
            onOpenFilters={() => setFiltersOpen(true)}
          />
          <ActiveFilters
            filters={filters}
            categories={categories.data ?? []}
            onChange={onChange}
            onClear={clearAll}
          />

          {catalog.isLoading ? (
            <ProductGridSkeleton density={density} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matches"
              body="Nothing matches those filters right now. Try removing a filter or two."
              action={
                active > 0 || filters.q ? (
                  <Button variant="secondary" onClick={clearAll}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <ProductGrid entries={results.slice(0, visible)} density={density} />
              <div className="mt-14 flex flex-col items-center gap-4">
                <p className="text-muted text-sm">
                  Showing {Math.min(visible, results.length)} of {results.length}
                </p>
                <div className="bg-line h-0.5 w-48 overflow-hidden rounded-full" aria-hidden>
                  <div
                    className="bg-ink h-full"
                    style={{
                      width: `${(Math.min(visible, results.length) / results.length) * 100}%`,
                    }}
                  />
                </div>
                {visible < results.length && (
                  <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE)}>
                    Load more
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        side="bottom"
        title={`Filter${active ? ` (${active})` : ''}`}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={clearAll} disabled={active === 0}>
              Clear
            </Button>
            <Button onClick={() => setFiltersOpen(false)}>Show {results.length}</Button>
          </div>
        }
      >
        <div className="p-5">{panel}</div>
      </Sheet>
    </div>
  );
}
