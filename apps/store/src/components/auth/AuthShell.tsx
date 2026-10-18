import type { ReactNode } from 'react';
import { useHomeContent } from '@/features/content/hooks';
import { Img } from '@/components/ui/Img';

/** Split layout for sign-in pages: editorial image on desktop, form only on mobile. */
export function AuthShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  const { data } = useHomeContent();
  const image = data?.heroSlides[1]?.image ?? data?.heroSlides[0]?.image;
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] lg:grid-cols-2">
      <div className="bg-ink relative hidden overflow-hidden lg:block">
        {image && (
          <Img
            src={image.url}
            alt=""
            sizes="50vw"
            className="absolute inset-0 size-full object-cover opacity-80"
          />
        )}
        <div className="from-ink/70 absolute inset-0 bg-gradient-to-t to-transparent" aria-hidden />
        <p className="font-display text-paper absolute bottom-10 left-10 max-w-sm text-4xl font-bold uppercase leading-tight">
          Faster checkout. Saved favourites. <span className="text-mint">Order history.</span>
        </p>
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <p className="label text-mint-deep">{eyebrow}</p>
          <h1 className="text-display mt-2 uppercase">{title}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
