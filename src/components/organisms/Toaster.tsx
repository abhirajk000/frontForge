import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { toastDismissed, type ToastVariant } from '@/stores/slices/ui.slice';
import { cn } from '@/utils/cn';

const VARIANT_ICON: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
};

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};

/**
 * Global toast host, mounted once at the app root. Reads/writes the `ui`
 * slice so any feature can queue a toast via `dispatch(toastQueued(...))`
 * without prop-drilling a toast API through the tree.
 */
export function Toaster() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 sm:items-end sm:right-4 sm:inset-x-auto"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = VARIANT_ICON[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              role="status"
              className="pointer-events-auto flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-lg border border-border bg-surface p-3.5 shadow-medium"
            >
              <Icon
                className={cn('mt-0.5 size-4.5 shrink-0', VARIANT_STYLES[toast.variant])}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dispatch(toastDismissed(toast.id))}
                className="text-text-tertiary hover:text-text"
                aria-label="Dismiss notification"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
