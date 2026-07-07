import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZE_MAP = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
} as const;

/**
 * Accessible loading indicator. Always announces itself to assistive tech
 * via `role="status"` + visually-hidden label, even when used bare.
 */
export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center justify-center">
      <Loader2
        className={cn('animate-spin text-text-tertiary', SIZE_MAP[size], className)}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
