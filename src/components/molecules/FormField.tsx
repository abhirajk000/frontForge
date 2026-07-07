import { useId, type ReactElement, cloneElement } from 'react';

export interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactElement<{
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    hasError?: boolean;
  }>;
}

/**
 * Wires a label, optional helper text and validation error to a single
 * form control via generated ids — the accessible way to associate them,
 * instead of every feature hand-rolling `htmlFor`/`aria-describedby`.
 */
export function FormField({ label, description, error, required, children }: FormFieldProps) {
  const fieldId = useId();
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-text">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {description && (
        <p id={descriptionId} className="text-sm text-text-secondary">
          {description}
        </p>
      )}
      {cloneElement(children, {
        id: fieldId,
        'aria-describedby': describedBy,
        hasError: Boolean(error),
      })}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
