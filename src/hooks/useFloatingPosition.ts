import { useLayoutEffect, useState, type RefObject } from 'react';

export interface FloatingPosition {
  top: number;
  left: number;
}

export type FloatingPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top';

interface UseFloatingPositionOptions {
  placement?: FloatingPlacement;
  offset?: number;
  isOpen: boolean;
}

/**
 * Lightweight, dependency-free positioning for Dropdown/Tooltip panels
 * anchored to a trigger element. Not a full collision-detection engine
 * (no `@floating-ui` in the approved stack) — it picks a placement and
 * flips vertically if there isn't enough viewport space, which covers
 * the vast majority of real layouts in this app.
 */
export function useFloatingPosition(
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  { placement = 'bottom-start', offset = 6, isOpen }: UseFloatingPositionOptions,
): FloatingPosition | null {
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect --
     This hook's entire purpose is to derive state from a post-layout DOM
     measurement (trigger/panel `getBoundingClientRect`), which is only
     available inside an effect — there is no way to compute it during
     render. This is the same pattern used internally by positioning
     libraries like Floating UI and Radix UI. */
  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    function computePosition() {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const panelHeight = panel?.getBoundingClientRect().height ?? 0;
      const panelWidth = panel?.getBoundingClientRect().width ?? 0;

      const fitsBelow =
        triggerRect.bottom + offset + panelHeight <= window.innerHeight;
      const wantsTop = placement.startsWith('top');
      const placeAbove = wantsTop || !fitsBelow;

      const top = placeAbove
        ? triggerRect.top - offset - panelHeight
        : triggerRect.bottom + offset;

      let left = triggerRect.left;
      if (placement === 'bottom-end') {
        left = triggerRect.right - panelWidth;
      } else if (placement === 'top') {
        left = triggerRect.left + triggerRect.width / 2 - panelWidth / 2;
      }

      left = Math.min(Math.max(left, 8), window.innerWidth - panelWidth - 8);

      setPosition({ top: Math.max(top, 8), left });
    }

    computePosition();
    window.addEventListener('resize', computePosition);
    window.addEventListener('scroll', computePosition, true);
    return () => {
      window.removeEventListener('resize', computePosition);
      window.removeEventListener('scroll', computePosition, true);
    };
  }, [isOpen, placement, offset, triggerRef, panelRef]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return position;
}
