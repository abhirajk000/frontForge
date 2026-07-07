import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Portal } from '@/components/atoms/Portal';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { MenuContext } from './menu-context';

export interface ContextMenuProps {
  children: ReactNode;
  menu: ReactNode;
}

const MENU_ESTIMATED_WIDTH = 200;
const MENU_ESTIMATED_HEIGHT = 160;

/**
 * Right-click menu. Wraps arbitrary content, opens `menu` (composed from
 * `DropdownItem`/`DropdownSeparator`) at the cursor position on
 * right-click, clamped so it never renders off-screen.
 */
export function ContextMenu({ children, menu }: ContextMenuProps) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = coords !== null;
  const close = () => setCoords(null);

  useClickOutside([panelRef], close, isOpen);
  useEscapeKey(close, isOpen);

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    const x = Math.min(event.clientX, window.innerWidth - MENU_ESTIMATED_WIDTH - 8);
    const y = Math.min(event.clientY, window.innerHeight - MENU_ESTIMATED_HEIGHT - 8);
    setCoords({ x: Math.max(x, 8), y: Math.max(y, 8) });
  };

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
      <Portal>
        <AnimatePresence>
          {isOpen && coords && (
            <motion.div
              ref={panelRef}
              role="menu"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              style={{ position: 'fixed', top: coords.y, left: coords.x }}
              className="z-50 min-w-[180px] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-medium"
            >
              <MenuContext.Provider value={{ close }}>{menu}</MenuContext.Provider>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}
