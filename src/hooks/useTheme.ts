import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { useMediaQuery } from './useMediaQuery';
import { setThemePreference } from '@/stores/slices/theme.slice';
import type { ResolvedTheme, ThemePreference } from '@/types/theme';

interface UseThemeResult {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

/**
 * Single source of truth for theme reads/writes across the app. Resolves
 * the user's 'system' preference against the OS-level media query so
 * consumers never need to know about that indirection.
 */
export function useTheme(): UseThemeResult {
  const dispatch = useAppDispatch();
  const preference = useAppSelector((state) => state.theme.preference);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (preference === 'system') return prefersDark ? 'dark' : 'light';
    return preference;
  }, [preference, prefersDark]);

  const setPreference = useCallback(
    (next: ThemePreference) => dispatch(setThemePreference(next)),
    [dispatch],
  );

  return { preference, resolvedTheme, setPreference };
}
