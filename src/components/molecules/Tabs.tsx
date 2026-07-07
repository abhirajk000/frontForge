import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/utils/cn';

interface TabsContextValue {
  activeValue: string;
  setActiveValue: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Tabs>`);
  }
  return context;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

/** Root component. Follows the WAI-ARIA "Tabs" pattern (roving tabindex, arrow-key navigation). */
export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const baseId = useId();
  const activeValue = value ?? internalValue;

  const setActiveValue = useCallback(
    (next: string) => {
      setInternalValue(next);
      onValueChange?.(next);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({ activeValue, setActiveValue, baseId }),
    [activeValue, setActiveValue, baseId],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps {
  children: ReactNode;
  className?: string;
  'aria-label': string;
}

export function TabList({ children, className, ...props }: TabListProps) {
  return (
    // The tablist container itself is intentionally not part of the tab
    // sequence — per the WAI-ARIA APG "Tabs" pattern, only the active tab
    // is focusable (roving tabindex, implemented on <Tab> below).
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      role="tablist"
      className={cn('flex gap-1 border-b border-border', className)}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        const tabs = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
        );
        const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
        if (currentIndex === -1) return;
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
        tabs[nextIndex]?.focus();
        tabs[nextIndex]?.click();
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabProps {
  value: string;
  children: ReactNode;
}

export function Tab({ value, children }: TabProps) {
  const { activeValue, setActiveValue, baseId } = useTabsContext('Tab');
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveValue(value)}
      className={cn(
        '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'border-accent text-text'
          : 'border-transparent text-text-secondary hover:text-text',
      )}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeValue, baseId } = useTabsContext('TabPanel');
  if (activeValue !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={cn('pt-4 focus-visible:outline-none', className)}
    >
      {children}
    </div>
  );
}
