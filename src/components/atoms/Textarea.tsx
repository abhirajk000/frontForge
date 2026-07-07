import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full resize-y rounded-md border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-focus-ring))] focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-danger focus-visible:ring-danger'
            : 'border-border hover:border-border-strong',
          className,
        )}
        aria-invalid={hasError || undefined}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
