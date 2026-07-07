import {
  cloneElement,
  useId,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Portal } from '@/components/atoms/Portal';
import { useFloatingPosition } from '@/hooks/useFloatingPosition';

export interface TooltipProps {
  content: string;
  children: ReactElement<{
    onFocus?: () => void;
    onBlur?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    'aria-describedby'?: string;
  }>;
  placement?: 'top' | 'bottom-start';
}

const OPEN_DELAY_MS = 300;

/**
 * Hover/focus tooltip. Shows on both mouse hover and keyboard focus so it
 * never hides information from keyboard-only or screen-reader users.
 */
export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tooltipId = useId();

  const position = useFloatingPosition(triggerRef, panelRef, { placement, isOpen, offset: 8 });

  const open = () => {
    openTimeout.current = setTimeout(() => setIsOpen(true), OPEN_DELAY_MS);
  };
  const close = () => {
    clearTimeout(openTimeout.current);
    setIsOpen(false);
  };

  // Injecting event handlers into the trigger element via `cloneElement` is
  // the standard compound-component pattern for wrapping an arbitrary child
  // without an extra DOM node; it does not read `children`'s ref during
  // render (the wrapper `<span>` below owns `triggerRef` instead).
  // eslint-disable-next-line react-hooks/refs
  const trigger = cloneElement(children, {
    onFocus: open,
    onBlur: close,
    onMouseEnter: open,
    onMouseLeave: close,
    'aria-describedby': isOpen ? tooltipId : undefined,
  });

  return (
    <span
      ref={(node) => {
        triggerRef.current = node;
      }}
      className="inline-flex"
    >
      {trigger}
      <Portal>
        <AnimatePresence>
          {isOpen && position && (
            <motion.div
              ref={panelRef}
              id={tooltipId}
              role="tooltip"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              style={{ position: 'fixed', top: position.top, left: position.left }}
              className="z-50 max-w-xs rounded-md bg-text px-2.5 py-1.5 text-xs font-medium text-bg shadow-medium"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </span>
  );
}
