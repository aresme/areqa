import type { ReactNode } from 'react';

export function FormCard({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base uppercase">{title}</h2>
          {description && <p className="text-muted mt-1 text-xs">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
