/**
 * All persisted storage keys in one place, namespaced under `frontforge:`
 * to avoid collisions and make `localStorage` easy to inspect/debug.
 */
export const STORAGE_KEYS = {
  theme: 'frontforge:theme',
  settings: 'frontforge:settings',
  progress: 'frontforge:progress',
  notes: 'frontforge:notes',
  bookmarks: 'frontforge:bookmarks',
  quizResults: 'frontforge:quiz-results',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
