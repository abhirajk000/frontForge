import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Command } from 'lucide-react';
import { NAV_SECTIONS } from '@/config/nav';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { toggleSidebar, setCommandPaletteOpen } from '@/stores/slices/ui.slice';
import { cn } from '@/utils/cn';

/**
 * FrontForge primary navigation sidebar.
 *
 * Design principles:
 * - No text section labels — groups separated by minimal 1 px rules
 * - All colours via CSS variables → works in dark and light without extra logic
 * - Active item: subtle accent-tinted background + left rail
 * - Icons 17 px; items 33 px tall; width 216 px / 52 px collapsed
 */
export function Sidebar() {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector((state) => state.ui.isSidebarCollapsed);

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col md:flex',
        'border-r border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))]',
        'transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-standard)]',
        isCollapsed ? 'w-[52px]' : 'w-[216px]',
      )}
      aria-label="Primary Navigation"
    >
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex h-[52px] shrink-0 items-center gap-2.5 px-3',
          'border-b border-[rgb(var(--color-border))]',
        )}
      >
        {/* FF monogram */}
        <div className="size-7 shrink-0 flex items-center justify-center rounded-[7px] bg-[rgb(var(--color-accent))]">
          <span
            className="text-white text-[11px] font-bold tracking-widest"
            style={{ fontFamily: 'var(--font-display)' }}
            aria-hidden="true"
          >
            FF
          </span>
        </div>

        {!isCollapsed && (
          <div className="flex min-w-0 flex-1 items-center justify-between">
            <div className="min-w-0">
              <span
                className="block truncate text-[13.5px] font-semibold leading-tight text-[rgb(var(--color-text))]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                FrontForge
              </span>
              <span className="block text-[10px] tracking-wide text-[rgb(var(--color-text-tertiary))]">
                v2 · beta
              </span>
            </div>
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className={cn(
                'ml-2 flex size-6 shrink-0 items-center justify-center rounded-md',
                'text-[rgb(var(--color-text-tertiary))] transition-colors',
                'hover:bg-[rgb(var(--color-surface))] hover:text-[rgb(var(--color-text-secondary))]',
              )}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {isCollapsed && (
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className={cn(
              'absolute -right-3 top-[50px] z-10',
              'flex size-6 items-center justify-center rounded-full',
              'border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]',
              'text-[rgb(var(--color-text-tertiary))] shadow-sm transition-all',
              'hover:text-[rgb(var(--color-text-secondary))]',
            )}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="size-3" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 scrollbar-thin">
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={section.title ?? sectionIdx}>
            {/* Group divider — replaces text section labels */}
            {sectionIdx > 0 && (
              <div className="my-1.5 mx-1 h-px bg-[rgb(var(--color-border))]" />
            )}

            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    end={item.href === '/'}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex h-[33px] items-center gap-2.5 rounded-md px-2',
                        'text-[13px] font-medium',
                        'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
                        'outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-focus-ring))] focus-visible:ring-offset-1',
                        isActive ? 'sidebar-active' : 'sidebar-inactive',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Left accent rail */}
                        {isActive && (
                          <span
                            className="pointer-events-none absolute left-0 top-1/2 h-[52%] w-0.5 -translate-y-1/2 rounded-r-full bg-[rgb(var(--color-accent))]"
                            aria-hidden="true"
                          />
                        )}

                        <item.icon
                          className={cn(
                            'size-[17px] shrink-0 transition-colors',
                            isActive
                              ? 'text-[rgb(var(--color-accent))]'
                              : 'text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-text-secondary))]',
                          )}
                          aria-hidden="true"
                        />

                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Command Center ────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[rgb(var(--color-border))] px-2 py-2">
        <button
          type="button"
          onClick={() => dispatch(setCommandPaletteOpen(true))}
          title={isCollapsed ? 'Command Center (⌘K)' : undefined}
          className={cn(
            'group sidebar-inactive flex h-[33px] w-full items-center gap-2.5 rounded-md px-2',
            'text-[13px] font-medium',
            'transition-colors duration-[var(--duration-fast)]',
            'outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-focus-ring))] focus-visible:ring-offset-1',
          )}
        >
          <Command
            className="size-[17px] shrink-0 transition-colors group-hover:text-[rgb(var(--color-accent))]"
            aria-hidden="true"
          />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">Command</span>
              <kbd
                className={cn(
                  'rounded border border-[rgb(var(--color-border))]',
                  'bg-[rgb(var(--color-surface))] px-1.5 py-0.5',
                  'font-mono text-[10px] text-[rgb(var(--color-text-tertiary))]',
                )}
              >
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
