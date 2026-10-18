import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { PagesContent, PolicyPageKey } from '@areqa/shared';
import { FormCard } from '@/components/products/FormCard';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { newId } from '@/features/content/api';
import { config } from '@/lib/env';
import { cn } from '@/lib/cn';
import { ListControls } from './ListControls';
import { move } from './listOps';
import { Markdown } from './Markdown';

type Set = (next: PagesContent) => void;

const PAGE_LABELS: Record<PolicyPageKey, string> = {
  about: 'About us',
  shipping: 'Shipping & delivery',
  returns: 'Returns & exchanges',
  privacy: 'Privacy policy',
  terms: 'Terms & conditions',
};

const MD_HELP = '## Heading · **bold** · *italic* · - bullet · 1. numbered · [link text](/track)';

export function FaqEditor({ pages, set }: { pages: PagesContent; set: Set }) {
  const faq = pages.faq;
  const groups = [...new Set(faq.map((f) => f.group).filter(Boolean))];
  const update = (i: number, patch: Partial<PagesContent['faq'][number]>) =>
    set({ ...pages, faq: faq.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
  return (
    <FormCard
      title="FAQ"
      description={`Grouped on the FAQ page by the group name. Answers support: ${MD_HELP}`}
      aside={
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            set({
              ...pages,
              faq: [
                ...faq,
                { id: newId(), group: groups[0] ?? 'Orders', question: '', answer: '' },
              ],
            })
          }
        >
          <Plus className="size-4" /> Question
        </Button>
      }
    >
      <datalist id="faq-groups">
        {groups.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>
      <ol className="space-y-4">
        {faq.map((f, i) => (
          <li
            key={f.id}
            className="border-line grid gap-3 rounded border p-4 sm:grid-cols-[180px_1fr_auto]"
          >
            <Field label="Group">
              {(a) => (
                <input
                  {...a}
                  list="faq-groups"
                  value={f.group}
                  onChange={(e) => update(i, { group: e.target.value })}
                />
              )}
            </Field>
            <Field label="Question">
              {(a) => (
                <input
                  {...a}
                  value={f.question}
                  onChange={(e) => update(i, { question: e.target.value })}
                />
              )}
            </Field>
            <div className="flex items-start pt-6">
              <ListControls
                index={i}
                count={faq.length}
                label={`question ${i + 1}`}
                onMove={(to) => set({ ...pages, faq: move(faq, i, to) })}
                onRemove={() => set({ ...pages, faq: faq.filter((_, j) => j !== i) })}
              />
            </div>
            <Field label="Answer" className="sm:col-span-3">
              {(a) => (
                <textarea
                  {...a}
                  rows={3}
                  value={f.answer}
                  onChange={(e) => update(i, { answer: e.target.value })}
                />
              )}
            </Field>
          </li>
        ))}
      </ol>
    </FormCard>
  );
}

export function PolicyEditor({ pages, set }: { pages: PagesContent; set: Set }) {
  const [key, setKey] = useState<PolicyPageKey>('about');
  const page = pages.pages[key];
  const update = (patch: Partial<typeof page>) =>
    set({ ...pages, pages: { ...pages.pages, [key]: { ...page, ...patch } } });
  return (
    <FormCard title="Pages" description={`Formatting: ${MD_HELP}`}>
      <div className="mb-4 flex flex-wrap gap-1" role="tablist">
        {(Object.keys(PAGE_LABELS) as PolicyPageKey[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={key === k}
            onClick={() => setKey(k)}
            className={cn(
              'rounded px-3 py-1.5 text-sm font-medium',
              key === k ? 'bg-ink text-paper' : 'bg-mist hover:bg-line',
            )}
          >
            {PAGE_LABELS[k]}
          </button>
        ))}
        <a
          href={`${config.storeUrl}/${key}`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto self-center text-xs underline"
        >
          View on store
        </a>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <Field label="Title">
            {(a) => (
              <input
                {...a}
                value={page.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            )}
          </Field>
          <Field label="Content">
            {(a) => (
              <textarea
                {...a}
                className={`${a.className} min-h-[420px] font-mono text-[13px]`}
                value={page.body}
                onChange={(e) => update({ body: e.target.value })}
              />
            )}
          </Field>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium">Preview</p>
          <div className="border-line bg-paper min-h-[420px] rounded border p-6">
            <h2 className="font-display mb-6 text-3xl font-bold uppercase">{page.title}</h2>
            <Markdown source={page.body} size="sm" />
          </div>
        </div>
      </div>
    </FormCard>
  );
}
