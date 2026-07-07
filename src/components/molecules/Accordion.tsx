import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface AccordionContextValue {
  openValues: Set<string>;
  toggle: (value: string) => void;
  baseId: string;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('<AccordionItem> must be rendered inside <Accordion>');
  return context;
}

export interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultOpen?: string[];
  children: ReactNode;
  className?: string;
}

/** Collapsible content groups, per the WAI-ARIA "Accordion" pattern. */
export function Accordion({ type = 'single', defaultOpen = [], children, className }: AccordionProps) {
  const [openValues, setOpenValues] = useState<Set<string>>(new Set(defaultOpen));
  const baseId = useId();

  const toggle = useCallback(
    (value: string) => {
      setOpenValues((previous) => {
        const next = new Set(type === 'single' ? [] : previous);
        if (previous.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        return next;
      });
    },
    [type],
  );

  const contextValue = useMemo(
    () => ({ openValues, toggle, baseId }),
    [openValues, toggle, baseId],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn('divide-y divide-border rounded-lg border border-border', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps {
  value: string;
  title: ReactNode;
  children: ReactNode;
}

export function AccordionItem({ value, title, children }: AccordionItemProps) {
  const { openValues, toggle, baseId } = useAccordionContext();
  const isOpen = openValues.has(value);
  const triggerId = `${baseId}-trigger-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <div>
      <h3>
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => toggle(value)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-text transition-colors hover:bg-surface-hover"
        >
          {title}
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-text-tertiary transition-transform duration-[var(--duration-base)]',
              isOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-sm text-text-secondary">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
