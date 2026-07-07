import type { StorageAdapter } from './storage-adapter';

/**
 * `localStorage`-backed implementation of {@link StorageAdapter}.
 * Fails soft: a full/blocked/unavailable storage (private browsing, quota
 * exceeded) never throws into the UI — it just no-ops and warns.
 */
class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | undefined {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? undefined : (JSON.parse(raw) as T);
    } catch (error) {
      console.warn(`[storage] Failed to read "${key}"`, error);
      return undefined;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[storage] Failed to write "${key}"`, error);
    }
  }

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[storage] Failed to remove "${key}"`, error);
    }
  }

  clear(prefix = 'frontforge:'): void {
    try {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      console.warn('[storage] Failed to clear storage', error);
    }
  }
}

/**
 * Singleton instance used across the app. Swapping the backing store later
 * (e.g. to IndexedDB or a remote API) means changing this one export.
 */
export const storageAdapter: StorageAdapter = new LocalStorageAdapter();
