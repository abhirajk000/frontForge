import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import {
  Search,
  CornerDownLeft,
  SearchX,
  BookOpen,
  Zap,
  TrendingUp,
  Target,
  Settings2,
  Package,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '@/components/atoms/Portal';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setCommandPaletteOpen } from '@/stores/slices/ui.slice';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { NAV_SECTIONS } from '@/config/nav';
import { cn } from '@/utils/cn';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  category: string;
}

const MOCK_LESSONS: CommandItem[] = [
  { id: 'react-memo', label: 'React.memo', description: 'Prevent unnecessary re-renders', href: '/learn/day07', icon: Zap, category: 'Lesson' },
  { id: 'useeffect', label: 'useEffect', description: 'Side effects & lifecycle patterns', href: '/learn/day04', icon: BookOpen, category: 'Lesson' },
  { id: 'usememo', label: 'useMemo & useCallback', description: 'Memoization in depth', href: '/learn/day08', icon: Zap, category: 'Lesson' },
  { id: 'redux', label: 'Redux Toolkit', description: 'State management essentials', href: '/learn/day10', icon: Package, category: 'Lesson' },
  { id: 'custom-hooks', label: 'Custom Hooks', description: 'Reusable logic extraction', href: '/learn/day09', icon: BookOpen, category: 'Lesson' },
  { id: 'context-api', label: 'Context API', description: 'React context deep dive', href: '/learn/day06', icon: BookOpen, category: 'Lesson' },
  { id: 'typescript-react', label: 'TypeScript + React', description: 'Type-safe component patterns', href: '/learn/day05', icon: BookOpen, category: 'Lesson' },
  { id: 'error-boundaries', label: 'Error Boundaries', description: 'Graceful error handling', href: '/learn/day12', icon: BookOpen, category: 'Lesson' },
  { id: 'react-router', label: 'React Router v6', description: 'Client-side routing mastery', href: '/learn/day11', icon: TrendingUp, category: 'Lesson' },
];

const MOCK_ACTIONS: CommandItem[] = [
  { id: 'go-mission', label: 'Mission Control', description: 'Your command center', href: '/', icon: Target, category: 'Navigate' },
  { id: 'go-progress', label: 'View Progress', description: 'XP, streak, completion', href: '/progress', icon: TrendingUp, category: 'Navigate' },
  { id: 'go-achievements', label: 'Achievements', description: 'Unlock your badges', href: '/achievements', icon: Trophy, category: 'Navigate' },
  { id: 'go-settings', label: 'Settings', description: 'Preferences & account', href: '/settings', icon: Settings2, category: 'Navigate' },
];

type AllItem = CommandItem | { id: string; label: string; href: string; icon: LucideIcon; category: string; description?: string };

/**
 * Global ⌘K Raycast-style command center. Indexes navigation, lessons,
 * and quick actions. Glassmorphism panel with keyboard-first UX.
 */
export function CommandPalette() {
  const isOpen = useAppSelector((state) => state.ui.isCommandPaletteOpen);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }

  const close = () => dispatch(setCommandPaletteOpen(false));

  useEscapeKey(close, isOpen);
  useFocusTrap(panelRef, isOpen);
  useLockBodyScroll(isOpen);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dispatch(setCommandPaletteOpen(true));
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [dispatch]);

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  const navItems: CommandItem[] = useMemo(
    () =>
      NAV_SECTIONS.flatMap((s) =>
        s.items.map((item) => ({
          id: item.href,
          label: item.label,
          href: item.href,
          icon: item.icon,
          category: 'Navigation',
        })),
      ),
    [],
  );

  const allItems: AllItem[] = useMemo(
    () => [...navItems, ...MOCK_LESSONS, ...MOCK_ACTIONS],
    [navItems],
  );

  const fuse = useMemo(
    () =>
      new Fuse(allItems, {
        keys: ['label', 'description', 'category'],
        threshold: 0.38,
        includeScore: true,
      }),
    [allItems],
  );

  const results: AllItem[] = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : allItems;

  /* Group results by category when not searching */
  const grouped = useMemo(() => {
    if (query.trim()) return null;
    const map = new Map<string, AllItem[]>();
    for (const item of results) {
      const cat = item.category ?? 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return map;
  }, [results, query]);

  /* Flat index for keyboard nav */
  const flatResults = results;

  const handleSelect = (item: AllItem) => {
    navigate(item.href);
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatResults[activeIndex]) {
      e.preventDefault();
      handleSelect(flatResults[activeIndex]);
    }
  };

  const renderItem = (item: AllItem, index: number) => {
    const isActive = index === activeIndex;
    return (
      <li
        key={item.id}
        id={`cmd-item-${item.id}`}
        role="option"
        aria-selected={isActive}
      >
        <button
          type="button"
          onClick={() => handleSelect(item)}
          onMouseEnter={() => setActiveIndex(index)}
          className={cn(
            'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
            isActive
              ? 'bg-[rgba(59,130,246,0.12)] text-[rgb(249_250_251)]'
              : 'text-[rgb(156_163_175)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgb(249_250_251)]',
          )}
        >
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors',
              isActive
                ? 'border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.15)] text-[rgb(147_197_253)]'
                : 'border-[rgb(31_41_55)] bg-[rgb(17_24_39)] text-[rgb(75_85_99)] group-hover:text-[rgb(156_163_175)]',
            )}
          >
            <item.icon className="size-3.5" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium leading-tight">
              {item.label}
            </span>
            {item.description && (
              <span className="block truncate text-[11px] text-[rgb(75_85_99)] leading-snug mt-0.5">
                {item.description}
              </span>
            )}
          </span>

          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              isActive
                ? 'bg-[rgba(59,130,246,0.2)] text-[rgb(147_197_253)]'
                : 'bg-[rgb(17_24_39)] text-[rgb(75_85_99)]',
            )}
          >
            {item.category}
          </span>
        </button>
      </li>
    );
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[14vh]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="fixed inset-0 bg-[rgb(0_0_0)]/70 backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Command center"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-2xl border border-[rgb(31_41_55)] bg-[rgb(13_13_17)]/95 shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(59,130,246,0.06)] backdrop-blur-2xl"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-[rgb(31_41_55)] px-4 py-1">
                <Search className="size-4 shrink-0 text-[rgb(75_85_99)]" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="command-results"
                  aria-activedescendant={
                    flatResults[activeIndex]
                      ? `cmd-item-${flatResults[activeIndex].id}`
                      : undefined
                  }
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search lessons, actions, navigate..."
                  className="h-12 flex-1 bg-transparent text-[14px] text-[rgb(249_250_251)] placeholder:text-[rgb(75_85_99)] focus:outline-none"
                />
                <kbd className="shrink-0 rounded border border-[rgb(31_41_55)] bg-[rgb(17_24_39)] px-1.5 py-0.5 font-mono text-[10px] text-[rgb(75_85_99)]">
                  Esc
                </kbd>
              </div>

              {/* Results */}
              <ul
                id="command-results"
                role="listbox"
                className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin"
              >
                {flatResults.length === 0 ? (
                  <li className="flex flex-col items-center gap-3 py-12 text-center">
                    <SearchX className="size-8 text-[rgb(31_41_55)]" aria-hidden="true" />
                    <span className="text-[13px] text-[rgb(75_85_99)]">
                      No results for &ldquo;{query}&rdquo;
                    </span>
                  </li>
                ) : grouped ? (
                  /* Grouped view (no query) */
                  Array.from(grouped.entries()).map(([category, items]) => {
                    const first = items[0];
                    if (!first) return null;
                    const startIdx = flatResults.findIndex((r) => r.id === first.id);
                    return (
                      <li key={category}>
                        <p className="label-section px-3 pb-1 pt-2">{category}</p>
                        <ul>
                          {items.map((item, i) => renderItem(item, startIdx + i))}
                        </ul>
                      </li>
                    );
                  })
                ) : (
                  /* Flat search results */
                  flatResults.map((item, i) => renderItem(item, i))
                )}
              </ul>

              {/* Footer */}
              <div className="flex items-center gap-5 border-t border-[rgb(31_41_55)] px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] text-[rgb(75_85_99)]">
                  <span className="flex gap-0.5">
                    <kbd className="rounded border border-[rgb(31_41_55)] bg-[rgb(17_24_39)] px-1 py-0.5 font-mono text-[9px]">↑</kbd>
                    <kbd className="rounded border border-[rgb(31_41_55)] bg-[rgb(17_24_39)] px-1 py-0.5 font-mono text-[9px]">↓</kbd>
                  </span>
                  Navigate
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-[rgb(75_85_99)]">
                  <kbd className="rounded border border-[rgb(31_41_55)] bg-[rgb(17_24_39)] px-1 py-0.5 font-mono text-[9px]">
                    <CornerDownLeft className="inline size-2.5" aria-hidden="true" />
                  </kbd>
                  Open
                </span>
                <span className="ml-auto text-[11px] text-[rgb(75_85_99)]">
                  {flatResults.length} result{flatResults.length !== 1 ? 's' : ''}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
