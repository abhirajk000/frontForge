import { useState } from 'react';
import { Flame, Zap, CheckCircle2, BookOpen, Trophy, Clock } from 'lucide-react';
import { DayProgressCard } from '@/features/progress/components/DayProgressCard';
import { useAppSelector } from '@/hooks/redux';
import { listDayIds } from '@/repositories/content.repository';
import { roadmapConfig } from '@/repositories/config.repository';
import { countCompletedDays, countCompletedSections } from '@/utils/day-progress';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { DAY_SECTIONS } from '@/constants/day-sections';
import { cn } from '@/utils/cn';

const WEEK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: '1', label: 'Week 1' },
  { id: '2', label: 'Week 2' },
  { id: '3', label: 'Week 3' },
  { id: '4', label: 'Week 4' },
] as const;

export default function ProgressPage() {
  const progress = useAppSelector((s) => s.progress);
  const [weekFilter, setWeekFilter] = useState<string>('all');

  const totalCurriculum = roadmapConfig.weeks.reduce((sum, w) => sum + w.days.length, 0);
  const completedDays = countCompletedDays(progress);
  const availableDays = listDayIds().length;
  const overallPct = Math.round((completedDays / totalCurriculum) * 100);

  const filteredWeeks = roadmapConfig.weeks.filter(
    (week) => weekFilter === 'all' || String(week.week) === weekFilter,
  );

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked(progress)).length;

  const continueDayId = filteredWeeks
    .flatMap((w) => w.days)
    .find((d) => {
      const day = progress.days?.[d.dayId];
      return day?.sections?.reading?.completed === false;
    })?.dayId;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pt-10 pb-24 md:px-8 lg:px-12 xl:px-16">

      {/* ── Page hero ─────────────────────────────────────────────── */}
      <div className="mb-12">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
          Mission Log
        </p>
        <h1
          className="text-4xl font-bold text-[rgb(var(--color-text))]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Your Progress
        </h1>
        <p className="mt-2 text-[rgb(var(--color-text-secondary))]">
          Every lesson, quiz, and challenge — tracked in one place.
        </p>
      </div>

      {/* ── Big stat numbers ───────────────────────────────────────── */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Zap, label: 'Total XP', value: (progress.xp ?? 0).toLocaleString(), suffix: 'pts', color: 'text-[rgb(245_158_11)]' },
          { icon: Flame, label: 'Day Streak', value: progress.streak ?? 0, suffix: 'days', color: 'text-[rgb(239_68_68)]' },
          { icon: CheckCircle2, label: 'Days Done', value: `${completedDays}/${totalCurriculum}`, suffix: '', color: 'text-[rgb(16_185_129)]' },
          { icon: BookOpen, label: 'Quizzes', value: progress.completedQuizzes?.length ?? 0, suffix: 'passed', color: 'text-[rgb(var(--color-accent))]' },
        ].map(({ icon: Icon, label, value, suffix, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <Icon className={cn('size-4', color)} aria-hidden="true" />
              <p className="text-[11px] font-medium uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
                {label}
              </p>
            </div>
            <p
              className="text-3xl font-bold text-[rgb(var(--color-text))]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {value}
              {suffix && (
                <span className="ml-1.5 text-[14px] font-normal text-[rgb(var(--color-text-tertiary))]">
                  {suffix}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* ── Overall progress bar ───────────────────────────────────── */}
      <div className="mb-10 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-[rgb(var(--color-text))]">
              Course Completion
            </p>
            <p className="mt-0.5 text-[13px] text-[rgb(var(--color-text-secondary))]">
              {completedDays} of {totalCurriculum} days fully complete · {availableDays} with content
            </p>
          </div>
          <span
            className="text-3xl font-bold text-[rgb(var(--color-accent))]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {overallPct}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgb(var(--color-border))]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-purple))] transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* ── Section breakdown ─────────────────────────────────────── */}
      <div className="mb-10">
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
          Section Breakdown
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DAY_SECTIONS.map(({ key, label, icon: Icon }) => {
            const count = countCompletedSections(progress, key);
            const pct = Math.round((count / totalCurriculum) * 100);
            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-3"
              >
                <Icon className="size-4 shrink-0 text-[rgb(var(--color-text-tertiary))]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[rgb(var(--color-text-secondary))]">{label}</span>
                    <span className="text-[12px] font-semibold text-[rgb(var(--color-text))]">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[rgb(var(--color-border))]">
                    <div
                      className="h-full rounded-full bg-[rgb(var(--color-accent))] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Week filter ────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap gap-2">
        {WEEK_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setWeekFilter(f.id)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors',
              weekFilter === f.id
                ? 'border-[rgb(var(--color-accent)/0.4)] bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))]'
                : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text))]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Day-by-day log ─────────────────────────────────────────── */}
      <div className="space-y-10">
        {filteredWeeks.map((week) => (
          <section key={week.week}>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--color-accent))]">
                Week {week.week}
              </span>
              <div className="flex-1 h-px bg-[rgb(var(--color-border))]" />
              <span className="text-[11px] text-[rgb(var(--color-text-tertiary))]">{week.title}</span>
            </div>

            <div className="space-y-2">
              {week.days.map((day) => (
                <DayProgressCard
                  key={day.dayId}
                  dayId={day.dayId}
                  day={day.day}
                  week={week.week}
                  title={day.title}
                  difficulty={day.difficulty}
                  defaultOpen={day.dayId === continueDayId}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── Footer stats ───────────────────────────────────────────── */}
      <div className="mt-12 flex flex-wrap gap-6 border-t border-[rgb(var(--color-border))] pt-6">
        {[
          { icon: Trophy, label: 'Achievements', value: unlockedCount, color: 'text-[rgb(245_158_11)]' },
          { icon: Clock, label: 'Days remaining', value: Math.max(0, totalCurriculum - completedDays), color: 'text-[rgb(var(--color-text-tertiary))]' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className={cn('size-4', color)} aria-hidden="true" />
            <span className="text-[13px] text-[rgb(var(--color-text-secondary))]">
              <span className="font-semibold text-[rgb(var(--color-text))]">{value}</span>
              {' '}{label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
