import { createContext } from 'react';

/**
 * Shared between `Dropdown` and `ContextMenu` so `DropdownItem`/
 * `DropdownSeparator` work identically inside either menu surface.
 */
export const MenuContext = createContext<{ close: () => void } | null>(null);
