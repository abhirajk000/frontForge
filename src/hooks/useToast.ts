import { useCallback } from 'react';
import { useAppDispatch } from './redux';
import { toastQueued, type ToastVariant } from '@/stores/slices/ui.slice';

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

/** Imperative toast API. Any feature can call `toast({ title, variant })`. */
export function useToast() {
  const dispatch = useAppDispatch();

  return useCallback(
    ({ title, description, variant = 'info' }: ToastInput) => {
      dispatch(
        toastQueued({
          id: crypto.randomUUID(),
          title,
          description,
          variant,
        }),
      );
    },
    [dispatch],
  );
}
