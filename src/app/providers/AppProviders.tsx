import type { PropsWithChildren } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ErrorBoundary } from 'react-error-boundary';
import { store } from '@/stores/store';
import { ThemeProvider } from './ThemeProvider';
import { ErrorFallback } from '@/components/organisms/ErrorFallback';

/**
 * Composition root for every cross-cutting provider. Ordering matters:
 * Redux must wrap ThemeProvider (which reads theme from the store), and
 * the top-level ErrorBoundary must wrap everything so a crash anywhere in
 * the tree still renders our fallback instead of a blank screen.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.assign('/')}
    >
      <ReduxProvider store={store}>
        <ThemeProvider>{children}</ThemeProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}
