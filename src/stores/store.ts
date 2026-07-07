import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { themeReducer } from './slices/theme.slice';
import { uiReducer } from './slices/ui.slice';
import { settingsReducer } from './slices/settings.slice';
import { progressReducer } from './slices/progress.slice';
import { persistenceMiddleware } from './middleware/persistence.middleware';

/**
 * Root reducer. Cross-cutting slices live here; feature-owned slices
 * (progress, notes, bookmarks, quiz results, ...) inject themselves via
 * `features/<feature>/store` and get spread in as they land in later
 * milestones, keeping this file small and stable.
 */
const rootReducer = combineReducers({
  theme: themeReducer,
  ui: uiReducer,
  settings: settingsReducer,
  progress: progressReducer,
});

export function createStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(persistenceMiddleware),
  });
}

export const store = createStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
