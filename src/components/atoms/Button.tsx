import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover active:opacity-90',
  secondary:
    'bg-surface text-text border border-border hover:bg-surface-hover active:bg-border',
  ghost: 'bg-transparent text-text hover:bg-surface-hover active:bg-border',
  danger: 'bg-danger text-white hover:opacity-90 active:opacity-80',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-md',
  lg: 'h-11 px-5 text-base gap-2 rounded-lg',
};

/**
 * The single Button implementation for the entire app. Every clickable
 * action — nav, forms, dialogs, quiz controls — composes this component
 * rather than styling a raw `<button>`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors',
          'duration-[var(--duration-base)] ease-[var(--ease-standard)]',
          'disabled:pointer-events-none disabled:opacity-50',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className,
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
