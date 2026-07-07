import {
  cloneElement,
  useContext,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Portal } from '@/components/atoms/Portal';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFloatingPosition, type FloatingPlacement } from '@/hooks/useFloatingPosition';
import { cn } from '@/utils/cn';
import { MenuContext } from './menu-context';

export interface DropdownProps {
  trigger: ReactElement<{
    onClick?: () => void;
    'aria-haspopup'?: boolean;
    'aria-expanded'?: boolean;
  }>;
  children: ReactNode;
  placement?: FloatingPlacement;
  align?: 'start' | 'end';
}

/**
 * Generic menu primitive shared by every "click to reveal a list of
 * actions" surface in the app (user menu, per-item actions, filters).
 * `ContextMenu` reuses the same panel styling/keyboard behavior.
 */
export function Dropdown({ trigger, children, placement, align = 'start' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const resolvedPlacement = placement ?? (align === 'end' ? 'bottom-end' : 'bottom-start');
  const position = useFloatingPosition(triggerRef, panelRef, {
    placement: resolvedPlacement,
    isOpen,
  });

  const close = () => setIsOpen(false);
  useClickOutside([triggerRef, panelRef], close, isOpen);
  useEscapeKey(close, isOpen);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'),
    );
    const currentIndex = items.findIndex((item) => item === document.activeElement);

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (currentIndex + delta + items.length) % items.length;
      items[nextIndex]?.focus();
    }
  };

  // See Tooltip.tsx for why cloning the trigger to inject handlers is safe
  // here: the ref used for positioning lives on the wrapping <span>, not on
  // `trigger` itself.
  const triggerElement = cloneElement(trigger, {
    onClick: () => setIsOpen((previous) => !previous),
    'aria-haspopup': true,
    'aria-expanded': isOpen,
  });

  return (
    <>
      <span
        ref={(node) => {
          triggerRef.current = node;
        }}
        className="inline-flex"
      >
        {triggerElement}
      </span>
      <Portal>
        <AnimatePresence>
          {isOpen && position && (
            <motion.div
              ref={panelRef}
              role="menu"
              initial={{ opacity: 0, scale: 0.97, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -4 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              style={{ position: 'fixed', top: position.top, left: position.left }}
              onKeyDown={handleMenuKeyDown}
              className="z-50 min-w-[180px] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-medium"
            >
              <MenuContext.Provider value={{ close }}>{children}</MenuContext.Provider>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

export function DropdownItem({ children, onSelect, destructive, disabled, icon }: DropdownItemProps) {
  const context = useContext(MenuContext);

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onSelect();
        context?.close();
      }}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
        'disabled:pointer-events-none disabled:opacity-40',
        destructive
          ? 'text-danger hover:bg-danger-subtle'
          : 'text-text hover:bg-surface-hover',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}
