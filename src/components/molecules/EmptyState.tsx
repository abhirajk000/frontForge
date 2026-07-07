import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Standard empty/placeholder state: icon + message + optional action.
 * Used both for genuinely empty data (no notes yet) and for
 * not-yet-implemented feature placeholders during incremental delivery.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-bg-subtle text-text-tertiary">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-text">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
