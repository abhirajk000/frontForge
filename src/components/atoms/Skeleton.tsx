import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/**
 * Base loading placeholder. Compose with utility classes for shape
 * (`h-4 w-32 rounded` for text, `size-10 rounded-full` for avatars, etc.)
 * rather than adding shape-specific variants — keeps this component tiny
 * and infinitely reusable.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-bg-subtle', className)}
      aria-hidden="true"
      {...props}
    />
  );
}
