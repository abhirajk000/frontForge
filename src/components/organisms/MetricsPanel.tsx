import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Zap,
  Trophy,
  CalendarDays,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import type { Meta } from '@/content-engine/schemas/meta.schema';
import type { ProgressState } from '@/stores/slices/progress.slice';
import { useAppSelector } from '@/hooks/redux';
import { roadmapConfig } from '@/repositories/config.repository';
import { countCompletedDays } from '@/utils/day-progress';
import { ACHIEVEMENTS } from '@/constants/achievements';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface ReadinessScore {
  label: string;
  score: number;
  color: string;
  trackBg: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function computeReadiness(progress: ProgressState): ReadinessScore[] {
  const l = progress.completedLessons.length;
  const q = progress.completedQuizzes.length;
  const c = progress.completedChallenges.length;

  return [
    {
      label: 'React',
      score: Math.min(98, l * 5 + q * 3 + 5),
      color: '#3B82F6',
      trackBg: 'rgba(59,130,246,0.1)',
    },
    {
      label: 'JavaScript',
      score: Math.min(98, l * 6 + q * 3 + 12),
      color: '#F59E0B',
      trackBg: 'rgba(245,158,11,0.1)',
    },
    {
      label: 'TypeScript',
      score: Math.min(98, l * 3 + 3),
      color: '#6366F1',
      trackBg: 'rgba(99,102,241,0.1)',
    },
    {
      label: 'Machine Coding',
      score: Math.min(98, c * 9 + q * 2 + 2),
      color: '#8B5CF6',
      trackBg: 'rgba(139,92,246,0.1)',
    },
  ];
}

/* ─── ReadinessBar ───────────────────────────────────────────────────────── */

function ReadinessBar({ item, index }: { item: ReadinessScore; index: number }) {
  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-[rgb(var(--color-text-secondary))]">{item.label}</span>
        <span className="text-[12px] font-semibold tabular-nums" style={{ color: item.color }}>
          {item.score}%
        </span>
      </div>
      <div className="h-[5px] w-full overflow-hidden rounded-full" style={{ background: item.trackBg }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${item.score}%` }}
          transition={{ duration: 1.1, delay: index * 0.1 + 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="h-full rounded-full"
          style={{ background: item.color }}
        />
      </div>
    </div>
  );
}

/* ─── MetricsPanel ───────────────────────────────────────────────────────── */

interface MetricsPanelProps {
  meta?: Meta | null;
}

export function MetricsPanel({ meta }: MetricsPanelProps) {
  const progress = useAppSelector((s) => s.progress);
  const totalCurriculum = roadmapConfig.weeks.reduce((s, w) => s + w.days.length, 0);
  const completedDays = countCompletedDays(progress);
  const daysRemaining = totalCurriculum - completedDays;

  const readiness = computeReadiness(progress);

  /* Topics checklist from today's meta */
  const topics = [
    ...(meta?.topics?.react ?? []),
    ...(meta?.topics?.typescript ?? []),
  ].slice(0, 7);

  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (topic: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(topic) ? next.delete(topic) : next.add(topic);
      return next;
    });

  /* Latest unlocked achievement */
  const latestAchievement = ACHIEVEMENTS.filter((a) => a.unlocked(progress)).at(-1);

  return (
    <aside className="sticky top-[76px] space-y-4">
      {/* ── Interview Readiness ── */}
      <section className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5 shadow-[var(--shadow-low)]">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-section">Interview Readiness</p>
          <span className="text-[10px] font-medium text-[rgb(var(--color-text-tertiary))]">Live score</span>
        </div>
        <div className="space-y-4">
          {readiness.map((item, i) => (
            <ReadinessBar key={item.label} item={item} index={i} />
          ))}
        </div>
        <div className="mt-4 border-t border-[rgb(var(--color-border))] pt-3">
          <p className="text-[11px] text-[rgb(var(--color-text-tertiary))] leading-relaxed">
            Scores update as you complete lessons, quizzes, and challenges.
          </p>
        </div>
      </section>

      {/* ── Today You'll Master ── */}
      {topics.length > 0 && (
        <section className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5 shadow-[var(--shadow-low)]">
          <div className="mb-4 flex items-center justify-between">
            <p className="label-section">Today You'll Master</p>
            <span className="text-[10px] text-[rgb(var(--color-text-tertiary))]">
              {checked.size}/{topics.length}
            </span>
          </div>

          {/* Micro progress bar */}
          <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[rgb(var(--color-border))]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-purple))]"
              animate={{ width: `${(checked.size / topics.length) * 100}%` }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          <ul className="space-y-1.5">
            {topics.map((topic) => {
              const isDone = checked.has(topic);
              return (
                <li key={topic}>
                  <button
                    type="button"
                    onClick={() => toggle(topic)}
                    className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-all hover:bg-[rgb(var(--color-text)/0.04)]"
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-3.5 shrink-0 text-[rgb(var(--color-success))] transition-all" aria-hidden="true" />
                    ) : (
                      <Circle className="size-3.5 shrink-0 text-[rgb(var(--color-border-strong))] transition-all group-hover:text-[rgb(var(--color-text-tertiary))]" aria-hidden="true" />
                    )}
                    <span
                      className={[
                        'text-[12px] font-medium capitalize transition-all leading-tight',
                        isDone
                          ? 'text-[rgb(var(--color-text-tertiary))] line-through decoration-[rgb(var(--color-border-strong))]'
                          : 'text-[rgb(var(--color-text-secondary))]',
                      ].join(' ')}
                    >
                      {topic}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Stats ── */}
      <section className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5 shadow-[var(--shadow-low)]">
        <p className="label-section mb-4">Stats</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Daily Streak */}
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] p-3 text-center">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-danger)/0.1)]">
              <Flame className="size-3.5 text-[rgb(var(--color-danger))]" aria-hidden="true" />
            </span>
            <div className="min-w-0 w-full">
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className="text-[18px] font-bold leading-none text-[rgb(var(--color-danger-text))]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {progress.streak}
                </span>
                <span className="text-[10px] text-[rgb(var(--color-text-tertiary))]">days</span>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-[rgb(var(--color-text-tertiary))]">Daily Streak</p>
            </div>
          </div>

          {/* Total XP */}
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] p-3 text-center">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-warning)/0.1)]">
              <Zap className="size-3.5 text-[rgb(var(--color-warning))]" aria-hidden="true" />
            </span>
            <div className="min-w-0 w-full">
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className="text-[18px] font-bold leading-none text-[rgb(var(--color-warning-text))]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {progress.xp.toLocaleString()}
                </span>
                <span className="text-[10px] text-[rgb(var(--color-text-tertiary))]">xp</span>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-[rgb(var(--color-text-tertiary))]">Total XP</p>
            </div>
          </div>

          {/* Latest Achievement */}
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] p-3 text-center">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-purple)/0.1)]">
              <Trophy className="size-3.5 text-[rgb(var(--color-purple))]" aria-hidden="true" />
            </span>
            <div className="min-w-0 w-full">
              <p className="truncate text-[13px] font-semibold leading-tight text-[rgb(var(--color-purple-text))]">
                {latestAchievement?.title ?? 'None yet'}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-[rgb(var(--color-text-tertiary))]">Latest Achievement</p>
            </div>
          </div>

          {/* Days Remaining */}
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] p-3 text-center">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-accent)/0.1)]">
              <CalendarDays className="size-3.5 text-[rgb(var(--color-accent))]" aria-hidden="true" />
            </span>
            <div className="min-w-0 w-full">
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className="text-[18px] font-bold leading-none text-[rgb(var(--color-accent-text))]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {daysRemaining}
                </span>
                <span className="text-[10px] text-[rgb(var(--color-text-tertiary))]">left</span>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-[rgb(var(--color-text-tertiary))]">Days Remaining</p>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}
