/**
 * Storage Adapter contract.
 *
 * Every persistence concern in the app (theme, progress, notes, bookmarks)
 * goes through an implementation of this interface instead of touching
 * `localStorage` directly. This is what lets us swap the backing store
 * (localStorage today, IndexedDB for large datasets, a REST API once a
 * backend exists) without changing a single feature/component.
 */
export interface StorageAdapter {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(prefix?: string): void;
}
