import { clsx, type ClassValue } from 'clsx';

/**
 * Thin wrapper around `clsx` for conditional className composition.
 * Centralized so we can swap in `tailwind-merge` later without touching
 * every component that composes classNames.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
