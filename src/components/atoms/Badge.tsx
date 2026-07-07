import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral: 'bg-bg-subtle text-text-secondary',
  accent: 'bg-accent-subtle text-accent-text',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
};

/** Small status/category label. Used for difficulty tags, XP badges, achievement pills. */
export function Badge({ variant = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        VARIANT_STYLES[variant],
        className,
      )}
      {...props}
    />
  );
}
