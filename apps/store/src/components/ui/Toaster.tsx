import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { useToasts, type ToastTone } from '@/features/ui/toastStore';
import { cn } from '@/lib/cn';

const icons: Record<ToastTone, typeof Info> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = icons[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="bg-ink text-paper shadow-soft pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg p-4"
            >
              <Icon
                className={cn(
                  'mt-0.5 size-5 shrink-0',
                  t.tone === 'error' ? 'text-danger' : 'text-mint',
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="text-paper/70 mt-0.5 text-sm">{t.description}</p>}
                {t.action && (
                  <Link
                    to={t.action.href}
                    onClick={() => dismiss(t.id)}
                    className="text-mint mt-2 inline-block text-xs font-semibold uppercase tracking-wider underline-offset-4 hover:underline"
                  >
                    {t.action.label}
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="text-paper/60 hover:text-paper"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
