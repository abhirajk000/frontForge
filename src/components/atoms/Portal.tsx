import { createPortal } from 'react-dom';
import type { PropsWithChildren } from 'react';

/**
 * Renders children into `document.body` instead of the current DOM
 * position. Used by Modal, Dropdown, ContextMenu and Tooltip so they
 * escape any parent `overflow: hidden`/`z-index` stacking contexts.
 */
export function Portal({ children }: PropsWithChildren) {
  return createPortal(children, document.body);
}
