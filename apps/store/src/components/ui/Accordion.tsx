import { useId, useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-line border-b">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 py-4 text-left font-sans text-sm font-semibold uppercase tracking-[0.08em]"
        >
          {title}
          <Plus
            className={cn('size-4 shrink-0 transition-transform duration-300', open && 'rotate-45')}
            aria-hidden
          />
        </button>
      </h3>
      <div
        id={id}
        role="region"
        className={cn(
          'grid transition-[grid-template-rows] duration-300',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="text-muted pb-5 text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
