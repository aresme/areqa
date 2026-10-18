import { useEffect, useState } from 'react';
import type { HomeContent, PagesContent } from '@areqa/shared';
import {
  AnnouncementEditor,
  BannerEditor,
  HeroEditor,
  LookbookEditor,
  NewsletterEditor,
  TestimonialsEditor,
} from '@/components/content/HomeEditors';
import { FaqEditor, PolicyEditor } from '@/components/content/PagesEditors';
import { SaveBar } from '@/components/content/SaveBar';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  saveHome,
  savePages,
  useContentCache,
  useHomeContent,
  usePagesContent,
} from '@/features/content/api';
import { toast } from '@/features/ui/toastStore';
import { cn } from '@/lib/cn';

const TABS = [
  { id: 'home', label: 'Home page' },
  { id: 'lookbook', label: 'Lookbook' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faq', label: 'FAQ' },
  { id: 'pages', label: 'Policy pages' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export default function ContentPage() {
  const homeQ = useHomeContent();
  const pagesQ = usePagesContent();
  const cache = useContentCache();
  const [tab, setTab] = useState<Tab>('home');
  const [home, setHome] = useState<HomeContent | null>(null);
  const [pages, setPages] = useState<PagesContent | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (homeQ.data && !home) setHome(homeQ.data);
  }, [homeQ.data, home]);
  useEffect(() => {
    if (pagesQ.data && !pages) setPages(pagesQ.data);
  }, [pagesQ.data, pages]);

  const homeDirty = Boolean(
    home && homeQ.data && JSON.stringify(home) !== JSON.stringify(homeQ.data),
  );
  const pagesDirty = Boolean(
    pages && pagesQ.data && JSON.stringify(pages) !== JSON.stringify(pagesQ.data),
  );
  const onHomeTab = tab === 'home' || tab === 'lookbook' || tab === 'testimonials';

  useEffect(() => {
    if (!homeDirty && !pagesDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [homeDirty, pagesDirty]);

  const save = async () => {
    setSaving(true);
    try {
      if (onHomeTab && home) {
        await saveHome(home);
        cache.setHome(home);
      } else if (pages) {
        await savePages(pages);
        cache.setPages(pages);
      }
      toast.success('Published', {
        description: 'Changes are live on the store (visitors see them on their next visit).',
      });
    } catch (e) {
      toast.error('Could not save', { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  if (!home || !pages) return <Skeleton className="h-[70vh]" />;

  return (
    <>
      <PageHeader
        title="Content"
        description="Edit what customers see on the store — no code changes needed."
      />
      <div className="mb-6 flex gap-1 overflow-x-auto" role="tablist">
        {TABS.map((t) => {
          const dirty = t.id === 'faq' || t.id === 'pages' ? pagesDirty : homeDirty;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded px-4 py-2 text-sm font-medium',
                tab === t.id ? 'bg-ink text-paper' : 'bg-paper text-muted hover:text-ink',
              )}
            >
              {t.label}
              {dirty && (
                <span
                  className="bg-mint-strong size-1.5 rounded-full"
                  aria-label="unsaved changes"
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="space-y-6">
        {tab === 'home' && (
          <>
            <AnnouncementEditor home={home} set={setHome} />
            <HeroEditor home={home} set={setHome} />
            <BannerEditor home={home} set={setHome} />
            <NewsletterEditor home={home} set={setHome} />
          </>
        )}
        {tab === 'lookbook' && <LookbookEditor home={home} set={setHome} />}
        {tab === 'testimonials' && <TestimonialsEditor home={home} set={setHome} />}
        {tab === 'faq' && <FaqEditor pages={pages} set={setPages} />}
        {tab === 'pages' && <PolicyEditor pages={pages} set={setPages} />}
      </div>
      <SaveBar
        dirty={onHomeTab ? homeDirty : pagesDirty}
        saving={saving}
        onSave={() => void save()}
        onReset={() => (onHomeTab ? setHome(homeQ.data!) : setPages(pagesQ.data!))}
      />
    </>
  );
}
