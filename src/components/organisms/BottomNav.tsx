import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Target, BookOpen, BrainCircuit, TrendingUp, Command } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setCommandPaletteOpen } from '@/stores/slices/ui.slice';
import { cn } from '@/utils/cn';

const PRIMARY_NAV = [
  { label: 'Mission', href: '/', icon: Target, end: true },
  { label: 'Learn', href: '/learn', icon: BookOpen, end: false },
  { label: 'Interview', href: '/roadmap', icon: BrainCircuit, end: false },
  { label: 'Progress', href: '/progress', icon: TrendingUp, end: false },
] as const;

const SHOW_FOR_MS = 10_000;

function isQuizRoute(pathname: string): boolean {
  return /\/learn\/[^/]+\/quiz\/?$/.test(pathname);
}

/**
 * Floating bottom navigation pill.
 * Shows for 10 s on each page load, then hides until the next navigation.
 * Hidden entirely on quiz pages.
 */
export function BottomNav() {
  const dispatch = useAppDispatch();
  const reduceMotion = useAppSelector((s) => s.settings.reduceMotion);
  const { pathname } = useLocation();

  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onQuizPage = isQuizRoute(pathname);

  useEffect(() => {
    if (onQuizPage) return;

    setVisible(true);

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), SHOW_FOR_MS);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname, onQuizPage]);

  if (onQuizPage) return null;

  return (
    <div
      className={cn(
        'fixed bottom-5 left-1/2 z-40 -translate-x-1/2',
        !reduceMotion && 'transition-all duration-300 ease-out',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-6 opacity-0',
      )}
      aria-label="Primary navigation"
      aria-hidden={!visible}
    >
      <nav
        className={cn(
          'flex items-end gap-px rounded-[18px] px-1.5 py-1.5',
          'border border-[rgb(var(--color-border))]',
          'bg-[rgb(var(--color-bg)/0.82)] backdrop-blur-2xl',
          'shadow-[0_12px_48px_-8px_rgb(0_0_0/0.5),0_0_0_1px_rgb(255_255_255/0.04)]',
        )}
      >
        {PRIMARY_NAV.map(({ label, href, icon: Icon, end }) => (
          <NavLink
            key={href}
            to={href}
            end={end}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-[3px] rounded-[12px] px-4 py-2 min-w-[54px]',
                'text-[10px] font-medium tracking-wide',
                'transition-all duration-150',
                isActive
                  ? 'bg-[rgb(var(--color-accent)/0.11)] text-[rgb(var(--color-accent))]'
                  : 'text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface)/0.5)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'size-[19px] transition-all duration-150',
                    isActive && 'drop-shadow-[0_0_7px_rgb(59_130_246/0.65)]',
                  )}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="mx-1 self-stretch py-1.5">
          <div className="h-full w-px bg-[rgb(var(--color-border))]" />
        </div>

        <button
          type="button"
          onClick={() => dispatch(setCommandPaletteOpen(true))}
          className={cn(
            'flex flex-col items-center gap-[3px] rounded-[12px] px-4 py-2 min-w-[54px]',
            'text-[10px] font-medium tracking-wide',
            'text-[rgb(var(--color-text-tertiary))]',
            'transition-all duration-150',
            'hover:bg-[rgb(var(--color-accent)/0.09)] hover:text-[rgb(var(--color-accent))]',
          )}
          aria-label="Open command center (⌘K)"
        >
          <Command className="size-[19px]" aria-hidden="true" />
          <span>⌘K</span>
        </button>
      </nav>
    </div>
  );
}
