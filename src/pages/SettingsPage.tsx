import { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Trash2,
  Code2,
  AlertTriangle,
  Palette,
  Cog,
  ChevronRight,
} from 'lucide-react';
import { Modal } from '@/components/organisms/Modal';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { setDeveloperMode, setReduceMotion } from '@/stores/slices/settings.slice';
import { storageAdapter } from '@/services/storage';
import { cn } from '@/utils/cn';
import type { ThemePreference } from '@/types/theme';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun; desc: string }[] = [
  { value: 'light', label: 'Light', icon: Sun, desc: 'Warm off-white' },
  { value: 'dark', label: 'Dark', icon: Moon, desc: 'Mission Control' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follow OS' },
];

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'developer', label: 'Developer', icon: Code2 },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
] as const;

type Section = (typeof SECTIONS)[number]['id'];

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-[rgb(var(--color-text))]">{label}</p>
        {description && (
          <p className="mt-0.5 text-[12px] text-[rgb(var(--color-text-secondary))]">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-200',
        checked
          ? 'border-[rgb(var(--color-accent)/0.5)] bg-[rgb(var(--color-accent))]'
          : 'border-[rgb(var(--color-border-strong))] bg-[rgb(var(--color-surface-hover))]',
      )}
    >
      <span
        className={cn(
          'inline-block size-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5.5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { preference, setPreference } = useTheme();
  const dispatch = useAppDispatch();
  const { isDeveloperModeEnabled, reduceMotion } = useAppSelector((s) => s.settings);
  const toast = useToast();
  const [activeSection, setActiveSection] = useState<Section>('appearance');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleClearProgress = () => {
    storageAdapter.clear('frontforge:');
    setIsConfirmOpen(false);
    toast({
      title: 'Local data cleared',
      description: 'Progress, notes and bookmarks have been removed from this device.',
      variant: 'success',
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pt-10 pb-24 md:px-8 lg:px-12">

      {/* ── Page hero ─────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
          Control Panel
        </p>
        <h1
          className="text-4xl font-bold text-[rgb(var(--color-text))]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Settings
        </h1>
        <p className="mt-2 text-[rgb(var(--color-text-secondary))]">
          Preferences for how FrontForge looks and behaves.
        </p>
      </div>

      <div className="flex gap-8 lg:gap-12">
        {/* ── Sidebar tabs ──────────────────────────────────────── */}
        <nav className="hidden shrink-0 flex-col gap-0.5 sm:flex" style={{ width: 160 }}>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                activeSection === id
                  ? 'sidebar-active'
                  : 'sidebar-inactive',
              )}
            >
              <Icon
                className={cn(
                  'size-4 shrink-0',
                  activeSection === id
                    ? 'text-[rgb(var(--color-accent))]'
                    : 'text-[rgb(var(--color-text-tertiary))]',
                )}
                aria-hidden="true"
              />
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile section selector */}
        <div className="mb-6 flex gap-1 sm:hidden">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
                activeSection === id
                  ? 'bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))]'
                  : 'text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Panel ─────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div>
              <div className="mb-6 flex items-center gap-2">
                <Palette className="size-4 text-[rgb(var(--color-accent))]" aria-hidden="true" />
                <h2 className="text-[15px] font-semibold text-[rgb(var(--color-text))]">Appearance</h2>
              </div>

              {/* Theme picker */}
              <div className="mb-1">
                <p className="mb-3 text-[13px] font-medium text-[rgb(var(--color-text-secondary))]">Theme</p>
                <div className="flex gap-3">
                  {THEME_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPreference(value)}
                      aria-pressed={preference === value}
                      className={cn(
                        'group flex flex-1 flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-all duration-150',
                        preference === value
                          ? 'border-[rgb(var(--color-accent)/0.4)] bg-[rgb(var(--color-accent)/0.08)] text-[rgb(var(--color-accent))]'
                          : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text))]',
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      <div className="text-center">
                        <p className="text-[13px] font-semibold">{label}</p>
                        <p className="text-[10px] opacity-70">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-[rgb(var(--color-border))]">
                <SettingRow
                  label="Reduce motion"
                  description="Minimize animations, in addition to your OS setting."
                >
                  <Toggle
                    checked={reduceMotion}
                    onChange={(v) => dispatch(setReduceMotion(v))}
                    label="Toggle reduce motion"
                  />
                </SettingRow>
              </div>
            </div>
          )}

          {/* Developer */}
          {activeSection === 'developer' && (
            <div>
              <div className="mb-6 flex items-center gap-2">
                <Code2 className="size-4 text-[rgb(var(--color-accent))]" aria-hidden="true" />
                <h2 className="text-[15px] font-semibold text-[rgb(var(--color-text))]">Developer</h2>
              </div>

              <SettingRow
                label="Developer mode"
                description="Reveal the Developer Tools panel for inspecting and validating content JSON."
              >
                <Toggle
                  checked={isDeveloperModeEnabled}
                  onChange={(v) => dispatch(setDeveloperMode(v))}
                  label="Toggle developer mode"
                />
              </SettingRow>

              {isDeveloperModeEnabled && (
                <a
                  href="/dev"
                  className="mt-2 flex items-center gap-2 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-3 text-[13px] text-[rgb(var(--color-text-secondary))] transition-colors hover:text-[rgb(var(--color-text))]"
                >
                  <Cog className="size-4" aria-hidden="true" />
                  Open Developer Tools
                  <ChevronRight className="ml-auto size-4" aria-hidden="true" />
                </a>
              )}
            </div>
          )}

          {/* Danger zone */}
          {activeSection === 'danger' && (
            <div>
              <div className="mb-6 flex items-center gap-2">
                <AlertTriangle className="size-4 text-[rgb(var(--color-danger))]" aria-hidden="true" />
                <h2 className="text-[15px] font-semibold text-[rgb(var(--color-text))]">Danger Zone</h2>
              </div>

              <div className="rounded-2xl border border-[rgb(var(--color-danger)/0.3)] bg-[rgb(var(--color-danger)/0.04)] p-6">
                <p className="mb-1 text-[14px] font-semibold text-[rgb(var(--color-text))]">
                  Clear all local data
                </p>
                <p className="mb-5 text-[13px] text-[rgb(var(--color-text-secondary))]">
                  Permanently removes all locally stored progress, notes and bookmarks.
                  This cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-[rgb(var(--color-danger)/0.4)] bg-[rgb(var(--color-danger)/0.08)] px-4 py-2.5 text-[13px] font-semibold text-[rgb(var(--color-danger-text))] transition-colors hover:bg-[rgb(var(--color-danger)/0.15)]"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Clear all local data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Clear all local data?"
        description="This permanently deletes your progress, notes and bookmarks from this device. This cannot be undone."
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsConfirmOpen(false)}
            className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2 text-[13px] font-medium text-[rgb(var(--color-text-secondary))] transition-colors hover:text-[rgb(var(--color-text))]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClearProgress}
            className="flex items-center gap-2 rounded-xl bg-[rgb(var(--color-danger))] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[rgb(var(--color-danger-text))]"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Clear data
          </button>
        </div>
      </Modal>
    </div>
  );
}
