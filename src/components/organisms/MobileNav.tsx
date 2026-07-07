import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAV_SECTIONS } from '@/config/nav';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setMobileNavOpen } from '@/stores/slices/ui.slice';
import { cn } from '@/utils/cn';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

export function MobileNav() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isMobileNavOpen);
  useLockBodyScroll(isOpen);

  const close = () => dispatch(setMobileNavOpen(false));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-bg-subtle md:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2 }}
            aria-label="Mobile navigation"
          >
            <div className="flex h-[60px] items-center justify-between px-4">
              <span className="text-sm font-semibold tracking-tight text-text">FrontForge</span>
              <button
                type="button"
                onClick={close}
                className="flex size-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-hover"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
              {NAV_SECTIONS.map((section, index) => (
                <div key={section.title ?? index}>
                  {section.title && (
                    <h2 className="mb-1.5 px-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                      {section.title}
                    </h2>
                  )}
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <NavLink
                          to={item.href}
                          end={item.href === '/'}
                          onClick={close}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-accent-subtle text-accent-text'
                                : 'text-text-secondary hover:bg-surface-hover hover:text-text',
                            )
                          }
                        >
                          <item.icon className="size-4 shrink-0" aria-hidden="true" />
                          <span>{item.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
