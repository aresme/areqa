import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@areqa/shared';
import { Markdown } from '@/components/Markdown';
import { Seo } from '@/components/Seo';
import { AccordionItem } from '@/components/ui/Accordion';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePagesContent, useSettings } from '@/features/content/hooks';

export default function FaqPage() {
  const { data, isLoading, isError, refetch } = usePagesContent();
  const { settings } = useSettings();
  const groups = useMemo(() => {
    const map = new Map<string, NonNullable<typeof data>['faq']>();
    for (const item of data?.faq ?? [])
      map.set(item.group || 'General', [...(map.get(item.group || 'General') ?? []), item]);
    return [...map.entries()];
  }, [data]);

  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="container-page pb-24 pt-10 sm:pt-16">
      <Seo
        title="FAQ"
        description="Answers about ordering, payment, delivery across Kenya, returns and sizing at Areqa."
        path="/faq"
      />
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="label text-mint-deep">Help</p>
          <h1 className="text-display mt-2 uppercase">Questions, answered</h1>
          <p className="text-muted mt-4">
            Can't find what you need? We usually reply within an hour during business hours.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {settings.whatsappNumber && (
              <a
                href={whatsappLink(settings.whatsappNumber, 'Hi, I have a question.')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
              >
                <MessageCircle className="size-4" /> WhatsApp us
              </a>
            )}
            <Link to="/contact" className="text-sm font-semibold underline underline-offset-4">
              Send a message
            </Link>
          </div>
        </div>
        <div className="space-y-10">
          {isLoading
            ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-14 w-full" />)
            : groups.map(([group, items]) => (
                <section key={group} aria-labelledby={`faq-${group}`}>
                  <h2 id={`faq-${group}`} className="label text-muted mb-2">
                    {group}
                  </h2>
                  <div className="border-line border-t">
                    {items.map((f) => (
                      <AccordionItem key={f.id} title={f.question}>
                        <Markdown source={f.answer} size="sm" />
                      </AccordionItem>
                    ))}
                  </div>
                </section>
              ))}
        </div>
      </div>
    </div>
  );
}
