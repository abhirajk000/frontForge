/**
 * Centralized route path constants. Never hardcode a path string in a
 * component — import it from here so renaming a route is a one-line change.
 */
export const ROUTES = {
  dashboard: '/',
  learn: '/learn',
  lesson: (day: string = ':day') => `/learn/${day}`,
  quiz: (day: string = ':day') => `/learn/${day}/quiz`,
  interview: (day: string = ':day') => `/learn/${day}/interview`,
  challenge: (day: string = ':day') => `/learn/${day}/challenge`,
  roadmap: '/roadmap',
  projects: '/projects',
  notes: '/notes',
  bookmarks: '/bookmarks',
  resources: '/resources',
  progress: '/progress',
  achievements: '/achievements',
  settings: '/settings',
  developerTools: '/dev',
} as const;
