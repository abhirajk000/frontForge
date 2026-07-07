import type { ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const VARIANT_CONFIG: Record<AlertVariant, { icon: LucideIcon; styles: string }> = {
  info: { icon: Info, styles: 'border-info/30 bg-info-subtle text-info' },
  success: { icon: CheckCircle2, styles: 'border-success/30 bg-success-subtle text-success' },
  warning: { icon: AlertTriangle, styles: 'border-warning/30 bg-warning-subtle text-warning' },
  danger: { icon: XCircle, styles: 'border-danger/30 bg-danger-subtle text-danger' },
};

/**
 * Inline banner for tips/warnings/notes/errors. This is also the visual
 * basis for the Lesson Viewer's `tip`/`warning`/`note`/`callout` blocks
 * (Milestone 4) — one implementation, many callers.
 */
export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const { icon: Icon, styles } = VARIANT_CONFIG[variant];

  return (
    <div
      role={variant === 'danger' || variant === 'warning' ? 'alert' : 'note'}
      className={cn('flex gap-3 rounded-lg border p-4 text-sm', styles, className)}
    >
      <Icon className="mt-0.5 size-4.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-text">
        {title && <p className="mb-1 font-medium">{title}</p>}
        <div className="text-text-secondary [&_a]:underline [&_a]:underline-offset-2">
          {children}
        </div>
      </div>
    </div>
  );
}
