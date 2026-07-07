import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type CardProps = HTMLAttributes<HTMLDivElement>;

/** Base surface for grouped content: hairline border, subtle radius, no heavy shadow. */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-surface p-5', className)}
      {...props}
    />
  );
}
