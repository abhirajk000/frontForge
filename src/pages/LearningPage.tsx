import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  Circle,
  Clock,
  Zap,
  BookOpen,
  ChevronRight,
  Play,
} from 'lucide-react';
import { useAppSelector } from '@/hooks/redux';
import { roadmapConfig } from '@/repositories/config.repository';
import { hasDay } from '@/repositories/content.repository';
import { getDayStatus, countCompletedDays } from '@/utils/day-progress';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const DIFF = {
  beginner: { label: 'Beginner', color: 'text-[rgb(16_185_129)]', bg: 'bg-[rgba(16,185,129,0.08)]', border: 'border-[rgba(16,185,129,0.2)]' },
  intermediate: { label: 'Intermediate', color: 'text-[rgb(245_158_11)]', bg: 'bg-[rgba(245,158,11,0.08)]', border: 'border-[rgba(245,158,11,0.2)]' },
  advanced: { label: 'Advanced', color: 'text-[rgb(239_68_68)]', bg: 'bg-[rgba(239,68,68,0.08)]', border: 'border-[rgba(239,68,68,0.2)]' },
} as const;

export default function LearningPage() {
  const progress = useAppSelector((s) => s.progress);
  const totalDays = roadmapConfig.weeks.reduce((sum, w) => sum + w.days.length, 0);
  const completedDays = countCompletedDays(progress);
  const availableDays = roadmapConfig.weeks.flatMap((w) => w.days).filter((d) => hasDay(d.dayId)).length;
  const overallPct = Math.round((completedDays / totalDays) * 100);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pt-10 pb-24 md:px-8 lg:px-12 xl:px-16">

      {/* ── Page hero ─────────────────────────────────────────────── */}
      <div className="mb-12">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
          Learning Path
        </p>
        <h1
          className="text-4xl font-bold text-[rgb(var(--color-text))]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          24-Day Mastery Path
        </h1>
        <p className="mt-2 max-w-xl text-[rgb(var(--color-text-secondary))]">
          React · JavaScript · TypeScript · Interview Prep — one focused day at a time.
        </p>

        {/* Stats row */}
        <div className="mt-8 flex flex-wrap gap-8">
          {[
            { label: 'Completed', value: completedDays, suffix: `/ ${totalDays} days` },
            { label: 'Available', value: availableDays, suffix: 'days' },
            { label: 'Progress', value: `${overallPct}%`, suffix: 'done' },
          ].map(({ label, value, suffix }) => (
            <div key={label}>
              <p className="text-[11px] font-medium uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">{label}</p>
              <p className="mt-0.5 text-2xl font-bold text-[rgb(var(--color-text))]" style={{ fontFamily: 'var(--font-display)' }}>
                {value}
                <span className="ml-1.5 text-[13px] font-normal text-[rgb(var(--color-text-tertiary))]">{suffix}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Overall bar */}
        <div className="mt-5 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-[rgb(var(--color-border))]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-purple))] transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* ── Week sections ──────────────────────────────────────────── */}
      <div className="space-y-14">
        {roadmapConfig.weeks.map((week) => {
          const weekCompleted = week.days.filter(
            (d) => getDayStatus(d.dayId, progress) === 'completed',
          ).length;
          const weekPct = Math.round((weekCompleted / week.days.length) * 100);

          return (
            <section key={week.week}>
              {/* Week header */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--color-accent))]"
                    >
                      Week {week.week}
                    </span>
                    <span className="text-[11px] text-[rgb(var(--color-text-tertiary))]">
                      {weekCompleted}/{week.days.length} complete
                    </span>
                  </div>
                  <h2
                    className="mt-1 text-xl font-bold text-[rgb(var(--color-text))]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {week.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-[rgb(var(--color-text-secondary))]">{week.goal}</p>
                </div>
                {/* Week mini bar */}
                <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                  <span className="text-[11px] font-semibold text-[rgb(var(--color-text-tertiary))]">{weekPct}%</span>
                  <div className="h-1 w-24 overflow-hidden rounded-full bg-[rgb(var(--color-border))]">
                    <div
                      className="h-full rounded-full bg-[rgb(var(--color-accent))] transition-all duration-500"
                      style={{ width: `${weekPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Day cards grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {week.days.map((day) => {
                  const available = hasDay(day.dayId);
                  const status = getDayStatus(day.dayId, progress);
                  const diff = DIFF[day.difficulty as keyof typeof DIFF] ?? DIFF.beginner;
                  const isCompleted = status === 'completed';
                  const isLocked = !available;

                  return (
                    <Link
                      key={day.dayId}
                      to={available ? ROUTES.lesson(day.dayId) : '#'}
                      tabIndex={available ? undefined : -1}
                      className={cn(
                        'group relative flex flex-col rounded-2xl border p-5 transition-all duration-150',
                        isCompleted
                          ? 'border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.04)] hover:border-[rgba(16,185,129,0.4)]'
                          : available
                            ? 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent)/0.35)] hover:bg-[rgb(var(--color-surface-raised))]'
                            : 'cursor-default border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] opacity-45',
                      )}
                    >
                      {/* Top row */}
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
                          Day {day.day}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="size-4 text-[rgb(16_185_129)]" />
                        ) : isLocked ? (
                          <Lock className="size-4 text-[rgb(var(--color-text-tertiary))]" />
                        ) : status === 'in-progress' ? (
                          <Play className="size-4 text-[rgb(var(--color-accent))]" />
                        ) : (
                          <Circle className="size-4 text-[rgb(var(--color-text-tertiary))]" />
                        )}
                      </div>

                      {/* Title + mission */}
                      <h3 className="mb-1 text-[14px] font-semibold leading-snug text-[rgb(var(--color-text))] line-clamp-2">
                        {day.title}
                      </h3>
                      <p className="mb-4 flex-1 text-[12px] text-[rgb(var(--color-text-secondary))] line-clamp-2">
                        {day.mission}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                            diff.color, diff.bg, diff.border,
                          )}
                        >
                          {diff.label}
                        </span>
                        {available && !isCompleted && (
                          <span className="flex items-center gap-1 text-[11px] text-[rgb(var(--color-accent))] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                            Start
                            <ChevronRight className="size-3" />
                          </span>
                        )}
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[11px] text-[rgb(var(--color-accent))] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                            Review
                            <ChevronRight className="size-3" />
                          </span>
                        )}
                        {isLocked && (
                          <span className="flex items-center gap-1 text-[10px] text-[rgb(var(--color-text-tertiary))]">
                            <Clock className="size-3" />
                            Soon
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Footnote ───────────────────────────────────────────────── */}
      <div className="mt-14 flex items-center gap-2 text-[12px] text-[rgb(var(--color-text-tertiary))]">
        <BookOpen className="size-3.5" aria-hidden="true" />
        <span>{availableDays} of {totalDays} days have content. More unlocking weekly.</span>
        <Zap className="ml-auto size-3.5 text-[rgb(var(--color-warning))]" aria-hidden="true" />
        <span>{completedDays * 350} total XP earned</span>
      </div>
    </div>
  );
}
