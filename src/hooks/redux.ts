import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from '@/stores/store';

/**
 * Typed wrappers around `useDispatch`/`useSelector`. Always import these
 * instead of the raw react-redux hooks so slice state/actions stay typed.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
