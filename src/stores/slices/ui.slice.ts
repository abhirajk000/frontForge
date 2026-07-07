import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastVariant = 'success' | 'warning' | 'danger' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

export interface UiState {
  isSidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  isCommandPaletteOpen: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  isSidebarCollapsed: false,
  isMobileNavOpen: false,
  isCommandPaletteOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.isMobileNavOpen = action.payload;
    },
    setCommandPaletteOpen(state, action: PayloadAction<boolean>) {
      state.isCommandPaletteOpen = action.payload;
    },
    toastQueued(state, action: PayloadAction<Toast>) {
      state.toasts.push(action.payload);
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { toggleSidebar, setMobileNavOpen, setCommandPaletteOpen, toastQueued, toastDismissed } =
  uiSlice.actions;
export const uiReducer = uiSlice.reducer;
