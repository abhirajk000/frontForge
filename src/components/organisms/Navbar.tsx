import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Settings2, Menu, Wrench } from 'lucide-react';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/organisms/Dropdown';
import { useAppDispatch } from '@/hooks/redux';
import { setCommandPaletteOpen, setMobileNavOpen } from '@/stores/slices/ui.slice';
import { ROUTES } from '@/constants/routes';
import { NAV_SECTIONS } from '@/config/nav';

/** Derive a human-readable page title from the current pathname. */
function usePageTitle(): string {
  const { pathname } = useLocation();
  const allItems = NAV_SECTIONS.flatMap((s) => s.items);
  const match = allItems.find((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
  );
  return match?.label ?? 'FrontForge';
}

export function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const pageTitle = usePageTitle();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b border-[rgb(31_41_55)] bg-[rgb(9_9_11)]/80 px-5 backdrop-blur-md sm:px-6">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={() => dispatch(setMobileNavOpen(true))}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[rgb(75_85_99)] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgb(156_163_175)] md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="size-4" aria-hidden="true" />
      </button>

      {/* Page title */}
      <span
        className="hidden text-[13px] font-semibold tracking-tight text-[rgb(249_250_251)] md:block"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {pageTitle}
      </span>

      {/* Search trigger */}
      <button
        type="button"
        onClick={() => dispatch(setCommandPaletteOpen(true))}
        className="flex h-8 w-full max-w-[280px] items-center gap-2 rounded-lg border border-[rgb(31_41_55)] bg-[rgb(17_24_39)] px-3 text-[13px] text-[rgb(75_85_99)] transition-all hover:border-[rgb(55_65_81)] hover:text-[rgb(156_163_175)] sm:w-52 lg:w-72"
        aria-label="Open command center"
      >
        <Search className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate text-left">Search anything...</span>
        <kbd className="hidden shrink-0 rounded border border-[rgb(31_41_55)] bg-[rgb(9_9_11)] px-1.5 py-0.5 font-mono text-[10px] leading-none text-[rgb(75_85_99)] sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1.5">
        <Dropdown
          align="end"
          trigger={
            <button
              type="button"
              aria-label="More options"
              className="flex size-8 items-center justify-center rounded-lg text-[rgb(75_85_99)] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgb(156_163_175)]"
            >
              <Settings2 className="size-4" aria-hidden="true" />
            </button>
          }
        >
          <DropdownItem
            icon={<Settings2 className="size-4" aria-hidden="true" />}
            onSelect={() => navigate(ROUTES.settings)}
          >
            Settings
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem
            icon={<Wrench className="size-4" aria-hidden="true" />}
            onSelect={() => navigate(ROUTES.developerTools)}
          >
            Developer Tools
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
