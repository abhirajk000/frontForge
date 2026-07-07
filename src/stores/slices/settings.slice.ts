import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { storageAdapter } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/storage-keys';

export interface SettingsState {
  isDeveloperModeEnabled: boolean;
  reduceMotion: boolean;
}

const defaultState: SettingsState = {
  isDeveloperModeEnabled: false,
  reduceMotion: false,
};

const initialState: SettingsState = {
  ...defaultState,
  ...storageAdapter.get<Partial<SettingsState>>(STORAGE_KEYS.settings),
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDeveloperMode(state, action: PayloadAction<boolean>) {
      state.isDeveloperModeEnabled = action.payload;
    },
    setReduceMotion(state, action: PayloadAction<boolean>) {
      state.reduceMotion = action.payload;
    },
  },
});

export const { setDeveloperMode, setReduceMotion } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
