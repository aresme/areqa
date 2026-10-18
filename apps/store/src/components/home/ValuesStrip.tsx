import { RotateCcw, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const VALUES = [
  {
    icon: Sparkles,
    title: 'Quality fabrics',
    body: 'Heavyweight cottons, real leather, made to last.',
  },
  { icon: Truck, title: 'Fast delivery', body: 'Same day in Nakuru, 1–4 days countrywide.' },
  { icon: RotateCcw, title: 'Easy returns', body: '7-day exchanges on unworn items.' },
  {
    icon: ShieldCheck,
    title: 'Secure ordering',
    body: 'Pay on delivery or M-Pesa after we confirm.',
  },
];

export function ValuesStrip() {
  return (
    <section aria-label="Why shop with us" className="border-line border-y">
      <ul className="container-page grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4">
        {VALUES.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <span className="bg-mint flex size-11 shrink-0 items-center justify-center rounded-full">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.06em]">{title}</p>
              <p className="text-muted mt-1 text-sm">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
