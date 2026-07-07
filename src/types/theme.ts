/** User-selectable theme preference. 'system' follows the OS setting. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** The theme actually applied to the DOM after resolving 'system'. */
export type ResolvedTheme = 'light' | 'dark';
