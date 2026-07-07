import { useState } from 'react';
import { Lock, Trophy, CheckCircle2, Sparkles } from 'lucide-react';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { useAppSelector } from '@/hooks/redux';
import { resolveIcon } from '@/utils/icons';
import { cn } from '@/utils/cn';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'learning', label: 'Learning' },
  { id: 'streak', label: 'Streak' },
  { id: 'xp', label: 'XP' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

function getCategory(id: string): CategoryId {
  if (id.startsWith('streak')) return 'streak';
  if (id.startsWith('xp')) return 'xp';
  return 'learning';
}

export default function AchievementsPage() {
  const progress = useAppSelector((s) => s.progress);
  const [filter, setFilter] = useState<CategoryId>('all');

  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked(progress));
  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;
  const unlockPct = Math.round((unlockedCount / totalCount) * 100);

  const filtered =
    filter === 'all'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter((a) => getCategory(a.id) === filter);

  return (
    <div className="mx-auto w-full max-w-[min(100%,1440px)] space-y-10 px-4 pt-8 pb-20 sm:px-5 md:px-6 lg:px-8 xl:px-10">

      {/* ── Page hero ─────────────────────────────────────────────── */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
          Milestones
        </p>
        <h1
          className="text-4xl font-bold text-[rgb(var(--color-text))]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Achievements
        </h1>
        <p className="mt-2 max-w-xl text-[rgb(var(--color-text-secondary))]">
          Unlock badges as you learn, build, and stay consistent. Every milestone counts toward interview readiness.
        </p>
      </div>

      {/* ── Stats + progress ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Unlocked', value: unlockedCount, suffix: `/ ${totalCount}`, accent: true },
          { label: 'Locked', value: totalCount - unlockedCount, suffix: 'remaining', accent: false },
          { label: 'Completion', value: `${unlockPct}%`, suffix: 'earned', accent: true },
        ].map(({ label, value, suffix, accent }) => (
          <div
            key={label}
            className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5"
          >
            <p className="text-[11px] font-medium uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
              {label}
            </p>
            <p
              className={cn(
                'mt-1 text-3xl font-bold',
                accent ? 'text-[rgb(var(--color-accent))]' : 'text-[rgb(var(--color-text))]',
              )}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {value}
              <span className="ml-1.5 text-[14px] font-normal text-[rgb(var(--color-text-tertiary))]">
                {suffix}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-[rgb(245_158_11)]" aria-hidden="true" />
            <span className="text-[14px] font-semibold text-[rgb(var(--color-text))]">
              Trophy Progress
            </span>
          </div>
          <span
            className="text-2xl font-bold text-[rgb(var(--color-accent))]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {unlockPct}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgb(var(--color-border))]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[rgb(245_158_11)] to-[rgb(var(--color-accent))] transition-all duration-700"
            style={{ width: `${unlockPct}%` }}
          />
        </div>
      </div>

      {/* ── Category filter ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors',
              filter === cat.id
                ? 'border-[rgb(var(--color-accent)/0.4)] bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))]'
                : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text))]',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Achievement grid ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((achievement) => {
          const isUnlocked = achievement.unlocked(progress);
          const Icon = resolveIcon(achievement.icon);

          return (
            <div
              key={achievement.id}
              className={cn(
                'group relative flex flex-col rounded-2xl border p-5 transition-all duration-150',
                isUnlocked
                  ? 'border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.04)] hover:border-[rgba(245,158,11,0.5)]'
                  : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] opacity-70 hover:opacity-90',
              )}
            >
              {isUnlocked && (
                <Sparkles
                  className="absolute right-4 top-4 size-4 text-[rgb(245_158_11)] opacity-60"
                  aria-hidden="true"
                />
              )}

              <div className="mb-4 flex items-start gap-4">
                <div
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-xl border transition-colors',
                    isUnlocked
                      ? 'border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.12)] text-[rgb(245_158_11)]'
                      : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-tertiary))]',
                  )}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className={cn(
                      'text-[15px] font-semibold leading-snug',
                      isUnlocked
                        ? 'text-[rgb(var(--color-text))]'
                        : 'text-[rgb(var(--color-text-secondary))]',
                    )}
                  >
                    {achievement.title}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-[rgb(var(--color-text-secondary))]">
                    {achievement.description}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex items-center gap-2 pt-2">
                {isUnlocked ? (
                  <>
                    <CheckCircle2 className="size-3.5 text-[rgb(16_185_129)]" aria-hidden="true" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(16_185_129)]">
                      Unlocked
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="size-3.5 text-[rgb(var(--color-text-tertiary))]" aria-hidden="true" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--color-text-tertiary))]">
                      Locked
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-[13px] text-[rgb(var(--color-text-tertiary))]">
          No achievements in this category yet.
        </p>
      )}
    </div>
  );
}
