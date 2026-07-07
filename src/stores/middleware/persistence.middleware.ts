import type { Middleware } from '@reduxjs/toolkit';
import { storageAdapter } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import type { RootState } from '../store';

/**
 * Maps a slice key in the root state to the storage key it should be
 * persisted under. Adding a new persisted slice is a one-line addition
 * here — no component or feature code needs to know persistence exists.
 */
const PERSISTED_SLICES: Partial<Record<keyof RootState, string>> = {
  theme: STORAGE_KEYS.theme,
  settings: STORAGE_KEYS.settings,
  progress: STORAGE_KEYS.progress,
};

const DEBOUNCE_MS = 250;
const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();
const lastPersistedRef = new Map<string, unknown>();

function scheduleWrite(storageKey: string, value: unknown) {
  const existing = pendingWrites.get(storageKey);
  if (existing) clearTimeout(existing);

  const timeout = setTimeout(() => {
    storageAdapter.set(storageKey, value);
    pendingWrites.delete(storageKey);
  }, DEBOUNCE_MS);

  pendingWrites.set(storageKey, timeout);
}

/**
 * Redux middleware that debounce-persists allow-listed slices to the
 * {@link storageAdapter} after every dispatch. This is the single place
 * that bridges Redux state to disk — features stay persistence-agnostic.
 */
export const persistenceMiddleware: Middleware<object, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);
    const state = store.getState();

    for (const [sliceKey, storageKey] of Object.entries(PERSISTED_SLICES)) {
      if (!storageKey) continue;
      const sliceState = state[sliceKey as keyof RootState];
      // Redux Toolkit slices are immutable, so a reference check is enough
      // to skip persisting slices untouched by this action.
      if (lastPersistedRef.get(storageKey) === sliceState) continue;
      lastPersistedRef.set(storageKey, sliceState);
      scheduleWrite(storageKey, sliceState);
    }

    return result;
  };
