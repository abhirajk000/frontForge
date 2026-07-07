import { useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Portal } from '@/components/atoms/Portal';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { cn } from '@/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  hideHeader?: boolean;
}

const SIZE_STYLES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

/**
 * Accessible dialog: focus-trapped, Escape-to-close, backdrop click-to-close,
 * scroll-locked, and labeled via `aria-labelledby`/`aria-describedby`. This
 * is the single Modal implementation — Command Palette, confirmations and
 * future feature dialogs all compose it.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  hideHeader = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEscapeKey(onClose, isOpen);
  useFocusTrap(panelRef, isOpen);
  useLockBodyScroll(isOpen);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[10vh] sm:pt-[15vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby={description ? 'modal-description' : undefined}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                'relative z-10 w-full rounded-lg border border-border bg-surface shadow-high',
                SIZE_STYLES[size],
              )}
            >
              {!hideHeader && (
                <div className="flex items-start justify-between gap-4 border-b border-border p-4">
                  <div>
                    <h2 id="modal-title" className="text-base font-semibold text-text">
                      {title}
                    </h2>
                    {description && (
                      <p id="modal-description" className="mt-0.5 text-sm text-text-secondary">
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
              )}
              <div className="p-4">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
