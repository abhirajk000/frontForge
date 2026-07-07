import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/atoms/Button';

/**
 * Global crash screen. Deliberately calm and actionable rather than a raw
 * stack trace — the reset button re-mounts the boundary's subtree.
 */
export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-subtle text-danger">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold text-text">Something went wrong</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          An unexpected error interrupted this view. Your progress is saved locally and
          hasn&apos;t been lost.
        </p>
      </div>
      {import.meta.env.DEV && (
        <pre className="max-w-lg overflow-auto rounded-lg border border-border bg-bg-subtle p-3 text-left text-xs text-danger">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      )}
      <Button variant="primary" size="md" onClick={resetErrorBoundary}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
