import { useEffect } from 'react';

/** Invokes `onEscape` when the Escape key is pressed while `isActive`. */
export function useEscapeKey(onEscape: () => void, isActive = true): void {
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onEscape();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, isActive]);
}
