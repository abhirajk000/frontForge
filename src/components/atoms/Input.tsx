import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

/**
 * Base text input. Pairs with the `FormField` molecule for label/error/
 * description wiring — this component only owns the field's own styling
 * and stays a plain, uncontrolled-friendly `<input>` for React Hook Form.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-9 w-full rounded-md border bg-surface px-3 text-sm text-text placeholder:text-text-tertiary transition-colors',
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

Input.displayName = 'Input';
