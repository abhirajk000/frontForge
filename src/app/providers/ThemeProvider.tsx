import { useEffect, type PropsWithChildren } from 'react';
import { useTheme } from '@/hooks/useTheme';

/**
 * Applies the resolved theme to `<html data-theme="...">` so the CSS
 * variables in `theme/tokens.css` cascade globally. Kept as a thin,
 * side-effect-only provider — all theme state actually lives in Redux.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  return children;
}
