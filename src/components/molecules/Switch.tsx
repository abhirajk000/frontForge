import { cn } from '@/utils/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}

/** Accessible toggle switch, fully keyboard operable via native checkbox semantics. */
export function Switch({ checked, onChange, label, description, id }: SwitchProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label
      htmlFor={inputId}
      className="flex cursor-pointer items-start justify-between gap-4 py-1"
    >
      <span className="space-y-0.5">
        <span className="block text-sm font-medium text-text">{label}</span>
        {description && (
          <span className="block text-sm text-text-secondary">{description}</span>
        )}
      </span>
      <span className="relative inline-flex h-5.5 w-9.5 shrink-0 items-center">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            'h-5.5 w-9.5 rounded-full transition-colors duration-[var(--duration-base)]',
            checked ? 'bg-accent' : 'bg-border-strong',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--color-focus-ring))] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
          )}
        />
        <span
          className={cn(
            'absolute left-0.5 size-4.5 rounded-full bg-white shadow-low transition-transform duration-[var(--duration-base)]',
            checked && 'translate-x-4',
          )}
        />
      </span>
    </label>
  );
}
