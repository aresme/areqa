import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useOverlay } from '@/hooks/useOverlay';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';

type Side = 'left' | 'right' | 'bottom' | 'top';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: Side;
  title: string;
  /** Visually hide the title (still announced to screen readers). */
  hideTitle?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const offscreen: Record<Side, Record<string, string | number>> = {
  left: { x: '-100%' },
  right: { x: '100%' },
  bottom: { y: '100%' },
  top: { y: '-100%' },
};

const placement: Record<Side, string> = {
  left: 'inset-y-0 left-0 w-[88vw] max-w-sm',
  right: 'inset-y-0 right-0 w-[92vw] max-w-md',
  bottom: 'inset-x-0 bottom-0 max-h-[88dvh] rounded-t-lg',
  top: 'inset-x-0 top-0 max-h-[100dvh]',
};

/** Slide-in drawer / bottom sheet with focus trap, Escape and backdrop close. */
export function Sheet({
  open,
  onClose,
  side = 'right',
  title,
  hideTitle,
  children,
  footer,
  className,
}: SheetProps) {
  const ref = useOverlay(open, onClose);
  const reduce = useReducedMotion();
  const transition = reduce
    ? { duration: 0 }
    : { type: 'tween' as const, ease: [0.22, 1, 0.36, 1] as const, duration: 0.35 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="bg-ink/40 absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'bg-paper shadow-soft absolute flex flex-col',
              placement[side],
              className,
            )}
            initial={offscreen[side]}
            animate={{ x: 0, y: 0 }}
            exit={offscreen[side]}
            transition={transition}
          >
            <div
              className={cn(
                'flex items-center justify-between gap-4 px-5 py-4',
                !hideTitle && 'border-line border-b',
              )}
            >
              <h2
                className={cn(
                  'font-display text-lg font-bold uppercase tracking-tight',
                  hideTitle && 'sr-only',
                )}
              >
                {title}
              </h2>
              <IconButton label="Close" onClick={onClose} className="-mr-2 ml-auto">
                <X className="size-5" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer && <div className="border-line border-t p-5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
