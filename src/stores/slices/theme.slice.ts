import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemePreference } from '@/types/theme';
import { storageAdapter } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/storage-keys';

export interface ThemeState {
  preference: ThemePreference;
}

function readStoredThemePreference(): ThemePreference {
  const stored = storageAdapter.get<ThemePreference | ThemeState>(STORAGE_KEYS.theme);
  if (typeof stored === 'string') return stored;
  return stored?.preference ?? 'light';
}

const initialState: ThemeState = {
  preference: readStoredThemePreference(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.preference = action.payload;
    },
  },
});

export const { setThemePreference } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
