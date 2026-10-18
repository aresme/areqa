import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useOverlay } from '@/hooks/useOverlay';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = useOverlay(open, onClose);
  const reduce = useReducedMotion();
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="bg-ink/40 absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn(
              'bg-paper shadow-soft relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-lg p-6 sm:rounded-lg sm:p-8',
              className,
            )}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 id="modal-title" className="font-display text-xl font-bold uppercase">
                {title}
              </h2>
              <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-2">
                <X className="size-5" />
              </IconButton>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
