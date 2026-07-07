import { useEffect, type RefObject } from 'react';

/**
 * Invokes `onOutsideClick` when a pointer event fires outside every ref in
 * `refs`. Used by Dropdown/ContextMenu/CommandPalette to close on outside
 * click without each component re-implementing the listener.
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onOutsideClick: () => void,
  isActive = true,
): void {
  useEffect(() => {
    if (!isActive) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const isInside = refs.some((ref) => ref.current?.contains(target));
      if (!isInside) onOutsideClick();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [refs, onOutsideClick, isActive]);
}
