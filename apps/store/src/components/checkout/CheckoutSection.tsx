import type { ReactNode } from 'react';

export function CheckoutSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`step-${step}`} className="border-line border-b pb-8">
      <h2
        id={`step-${step}`}
        className="font-display mb-5 flex items-center gap-3 text-lg font-bold uppercase"
      >
        <span className="bg-ink text-paper flex size-7 items-center justify-center rounded-full text-xs">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
