import { Link } from 'react-router-dom';
import type { LookbookItem } from '@areqa/shared';
import { SectionHeader } from '@/components/SectionHeader';
import { Img } from '@/components/ui/Img';
import { cn } from '@/lib/cn';

export function Lookbook({ items, instagram }: { items: LookbookItem[]; instagram?: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="lookbook-title" className="container-page py-16 sm:py-24">
      <SectionHeader id="lookbook-title" eyebrow="@areqa" title="The lookbook" />
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
        {items.slice(0, 6).map((item, i) => (
          <li key={item.id} className={cn(i === 0 && 'md:col-span-1 md:row-span-1')}>
            <Link
              to={item.href || '/shop'}
              className="bg-mist group relative block aspect-square overflow-hidden rounded"
            >
              <Img
                src={item.image.url}
                alt={item.image.alt ?? item.caption}
                aspect={1}
                sizes="(min-width:1024px) 16vw, (min-width:768px) 33vw, 50vw"
                maxWidth={640}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="bg-ink/0 group-hover:bg-ink/30 absolute inset-0 flex items-end p-3 opacity-0 transition-all group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="label bg-mint text-ink rounded px-2 py-1">{item.caption}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {instagram && (
        <p className="mt-6 text-center">
          <a
            href={instagram}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold uppercase tracking-[0.08em] underline-offset-4 hover:underline"
          >
            Follow us on Instagram
          </a>
        </p>
      )}
    </section>
  );
}
