import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  link?: { to: string; label: string };
  className?: string;
  id?: string;
}

export function SectionHeader({ eyebrow, title, link, className, id }: SectionHeaderProps) {
  return (
    <div className={cn('mb-8 flex items-end justify-between gap-6 sm:mb-10', className)}>
      <div>
        {eyebrow && <p className="label text-mint-deep mb-2">{eyebrow}</p>}
        <h2 id={id} className="section-title">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          to={link.to}
          className="group mb-1 hidden shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] sm:inline-flex md:mr-24"
        >
          {link.label}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}
