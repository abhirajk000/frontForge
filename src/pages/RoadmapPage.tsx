import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  Circle,
  Play,
  ChevronRight,
  BrainCircuit,
  Target,
  Code2,
  Layers,
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

const WEEK_ICONS = [Target, Code2, BrainCircuit, Layers];

export default function RoadmapPage() {
  const progress = useAppSelector((s) => s.progress);
  const totalDays = roadmapConfig.weeks.reduce((sum, w) => sum + w.days.length, 0);
  const completedDays = countCompletedDays(progress);
  const allDays = roadmapConfig.weeks.flatMap((w) => w.days);
  const completedQuizzes = progress.completedQuizzes.length;
  const completedChallenges = progress.completedChallenges.length;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pt-10 pb-24 md:px-8 lg:px-12 xl:px-16">

      {/* ── Page hero ─────────────────────────────────────────────── */}
      <div className="mb-12">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
          Interview Roadmap
        </p>
        <h1
          className="text-4xl font-bold text-[rgb(var(--color-text))]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {roadmapConfig.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[rgb(var(--color-text-secondary))]">
          {roadmapConfig.description}
        </p>

        {/* Skill readiness indicators */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'React', score: Math.min(100, Math.round((completedDays / totalDays) * 140)), color: 'from-[rgb(59_130_246)] to-[rgb(99_102_241)]' },
            { label: 'JavaScript', score: Math.min(100, Math.round((completedDays / totalDays) * 120)), color: 'from-[rgb(245_158_11)] to-[rgb(234_179_8)]' },
            { label: 'TypeScript', score: Math.min(100, Math.round((completedDays / totalDays) * 100)), color: 'from-[rgb(139_92_246)] to-[rgb(109_40_217)]' },
            { label: 'System Design', score: Math.min(100, Math.round((completedChallenges / Math.max(1, allDays.length)) * 100)), color: 'from-[rgb(16_185_129)] to-[rgb(5_150_105)]' },
          ].map(({ label, score, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4"
            >
              <p className="text-[11px] font-medium uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
                {label}
              </p>
              <p
                className="mt-1 text-2xl font-bold text-[rgb(var(--color-text))]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {score}%
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[rgb(var(--color-border))]">
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', color)}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Journey stats ─────────────────────────────────────────── */}
      <div className="mb-12 flex flex-wrap items-center gap-6 border-t border-b border-[rgb(var(--color-border))] py-5">
        {[
          { label: 'Days completed', value: completedDays, total: totalDays },
          { label: 'Quizzes passed', value: completedQuizzes, total: totalDays },
          { label: 'Challenges done', value: completedChallenges, total: totalDays },
        ].map(({ label, value, total }) => (
          <div key={label} className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-[rgb(var(--color-text))]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {value}
            </span>
            <span className="text-[13px] text-[rgb(var(--color-text-tertiary))]">/ {total} {label}</span>
          </div>
        ))}
      </div>

      {/* ── Week phases ────────────────────────────────────────────── */}
      <div className="space-y-16">
        {roadmapConfig.weeks.map((week, wIdx) => {
          const WeekIcon = WEEK_ICONS[wIdx] ?? Target;
          const weekCompleted = week.days.filter(
            (d) => getDayStatus(d.dayId, progress) === 'completed',
          ).length;
          const weekPct = Math.round((weekCompleted / week.days.length) * 100);

          return (
            <section key={week.week}>
              {/* Phase header */}
              <div className="mb-6 flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                  <WeekIcon className="size-5 text-[rgb(var(--color-accent))]" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--color-accent))]">
                      Phase {week.week}
                    </span>
                    <div className="flex-1 h-px bg-[rgb(var(--color-border))]" />
                    <span className="text-[11px] text-[rgb(var(--color-text-tertiary))]">
                      {weekCompleted}/{week.days.length} · {weekPct}%
                    </span>
                  </div>
                  <h2
                    className="mt-1 text-xl font-bold text-[rgb(var(--color-text))]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {week.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-[rgb(var(--color-text-secondary))]">
                    {week.goal}
                  </p>
                </div>
              </div>

              {/* Day cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {week.days.map((day) => {
                  const available = hasDay(day.dayId);
                  const status = getDayStatus(day.dayId, progress);
                  const diff = DIFF[day.difficulty as keyof typeof DIFF] ?? DIFF.beginner;
                  const isCompleted = status === 'completed';

                  return (
                    <Link
                      key={day.dayId}
                      to={available ? ROUTES.lesson(day.dayId) : '#'}
                      tabIndex={available ? undefined : -1}
                      className={cn(
                        'group relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-150',
                        isCompleted
                          ? 'border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.03)]'
                          : available
                            ? 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent)/0.35)] hover:bg-[rgb(var(--color-surface-raised))]'
                            : 'cursor-default border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] opacity-40',
                      )}
                    >
                      {/* Status dot */}
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="size-5 text-[rgb(16_185_129)]" />
                        ) : !available ? (
                          <Lock className="size-5 text-[rgb(var(--color-text-tertiary))]" />
                        ) : status === 'in-progress' ? (
                          <Play className="size-5 text-[rgb(var(--color-accent))]" />
                        ) : (
                          <Circle className="size-5 text-[rgb(var(--color-text-tertiary))]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
                            Day {day.day}
                          </span>
                          <span
                            className={cn(
                              'rounded-full border px-1.5 py-px text-[9px] font-medium',
                              diff.color, diff.bg, diff.border,
                            )}
                          >
                            {diff.label}
                          </span>
                        </div>
                        <h3 className="mt-1 text-[14px] font-semibold text-[rgb(var(--color-text))] line-clamp-1">
                          {day.title}
                        </h3>
                        <p className="mt-0.5 text-[12px] text-[rgb(var(--color-text-secondary))] line-clamp-2">
                          {day.mission}
                        </p>
                      </div>

                      {available && (
                        <ChevronRight className="mt-1 size-4 shrink-0 text-[rgb(var(--color-text-tertiary))] opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
