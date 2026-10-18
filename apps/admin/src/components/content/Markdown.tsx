import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { parseMarkdown, type Inline } from '@areqa/shared';
import { cn } from '@/lib/cn';

function Inlines({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.type === 'text') return <Fragment key={i}>{n.text}</Fragment>;
        if (n.type === 'bold')
          return (
            <strong key={i} className="text-ink font-semibold">
              <Inlines nodes={n.children} />
            </strong>
          );
        if (n.type === 'italic')
          return (
            <em key={i}>
              <Inlines nodes={n.children} />
            </em>
          );
        const internal = n.href.startsWith('/');
        return internal ? (
          <Link
            key={i}
            to={n.href}
            className="text-ink hover:text-mint-deep font-medium underline underline-offset-4"
          >
            <Inlines nodes={n.children} />
          </Link>
        ) : (
          <a
            key={i}
            href={n.href}
            target={n.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="text-ink hover:text-mint-deep font-medium underline underline-offset-4"
          >
            <Inlines nodes={n.children} />
          </a>
        );
      })}
    </>
  );
}

/** Renders owner-written content safely (see parseMarkdown — no HTML is ever injected). */
export function Markdown({
  source,
  className,
  size = 'base',
}: {
  source: string;
  className?: string;
  size?: 'sm' | 'base';
}) {
  const blocks = parseMarkdown(source);
  return (
    <div
      className={cn(
        'text-muted space-y-4 leading-relaxed',
        size === 'sm' ? 'text-sm' : 'text-[15px] sm:text-base',
        className,
      )}
    >
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          const H = b.level === 2 ? 'h2' : 'h3';
          return (
            <H
              key={i}
              className={cn(
                'font-display text-ink pt-4 font-bold uppercase',
                b.level === 2 ? 'text-xl sm:text-2xl' : 'text-lg',
              )}
            >
              <Inlines nodes={b.children} />
            </H>
          );
        }
        if (b.type === 'list') {
          const L = b.ordered ? 'ol' : 'ul';
          return (
            <L
              key={i}
              className={cn(
                'space-y-2 pl-5',
                b.ordered ? 'list-decimal' : 'marker:text-mint-strong list-disc',
              )}
            >
              {b.items.map((item, j) => (
                <li key={j}>
                  <Inlines nodes={item} />
                </li>
              ))}
            </L>
          );
        }
        return (
          <p key={i}>
            <Inlines nodes={b.children} />
          </p>
        );
      })}
    </div>
  );
}
