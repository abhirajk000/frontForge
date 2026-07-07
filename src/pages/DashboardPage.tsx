import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Hammer,
  Bug,
  HelpCircle,
  MessageCircle,
  PenLine,
  CheckCircle2,
  Lock,
  Flame,
  Zap,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  TrendingUp,
  CalendarDays,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Sunset,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricsPanel } from '@/components/organisms/MetricsPanel';
import { useAppSelector } from '@/hooks/redux';
import { roadmapConfig } from '@/repositories/config.repository';
import { countCompletedDays, getContinueDayId, getDayStatus } from '@/utils/day-progress';
import { listDayIds, getMeta, hasDay } from '@/repositories/content.repository';
import type { Meta } from '@/content-engine/schemas/meta.schema';
import type { ProgressState } from '@/stores/slices/progress.slice';
import { ROUTES } from '@/constants/routes';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface JourneyStep {
  id: string;
  label: string;
  detail: string;
  duration: string;
  icon: LucideIcon;
  status: 'completed' | 'active' | 'upcoming' | 'locked';
  href: string;
}

interface WeekDay {
  day: number;
  dayId: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'completed' | 'today' | 'available' | 'locked';
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function getGreetingContext(): { greeting: string; Icon: LucideIcon } {
  const h = new Date().getHours();
  if (h < 5) return { greeting: 'Late night, Abhiraj', Icon: Moon };
  if (h < 12) return { greeting: 'Good morning, Abhiraj', Icon: Sunrise };
  if (h < 17) return { greeting: 'Good afternoon, Abhiraj', Icon: Sun };
  if (h < 21) return { greeting: 'Good evening, Abhiraj', Icon: Sunset };
  return { greeting: 'Good night, Abhiraj', Icon: Moon };
}

function getDateParts() {
  const now = new Date();
  return {
    day: now.getDate(),
    dayPadded: String(now.getDate()).padStart(2, '0'),
    month: now.toLocaleDateString('en-US', { month: 'long' }),
    monthShort: now.toLocaleDateString('en-US', { month: 'short' }),
    year: now.getFullYear(),
    weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
    shortWeekday: now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
  };
}

function formatTime(readingMins: number, buildHours: number): string {
  const total = readingMins + buildHours * 60;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`;
}

const DIFFICULTY = {
  beginner: {
    label: 'Beginner',
    color: 'text-[rgb(var(--color-success-text))]',
    bg: 'bg-[rgb(var(--color-success)/0.1)]',
    border: 'border-[rgb(var(--color-success)/0.25)]',
  },
  intermediate: {
    label: 'Intermediate',
    color: 'text-[rgb(var(--color-warning-text))]',
    bg: 'bg-[rgb(var(--color-warning)/0.1)]',
    border: 'border-[rgb(var(--color-warning)/0.25)]',
  },
  advanced: {
    label: 'Advanced',
    color: 'text-[rgb(var(--color-danger-text))]',
    bg: 'bg-[rgb(var(--color-danger)/0.1)]',
    border: 'border-[rgb(var(--color-danger)/0.25)]',
  },
} as const;

function buildJourneySteps(dayId: string, meta: Meta, progress: ProgressState): JourneyStep[] {
  const lessonDone = progress.completedLessons.includes(dayId);
  const buildDone = progress.completedChallenges.includes(dayId);
  const quizDone = progress.completedQuizzes.includes(dayId);

  const resolve = (index: number): JourneyStep['status'] => {
    const chain = [lessonDone, buildDone, buildDone, quizDone, quizDone, false];
    const done = [lessonDone, buildDone, buildDone, quizDone, false, false];
    if (done[index]) return 'completed';
    if (chain[index - 1] === true || index === 0) return 'active';
    if (chain[index - 1] === false) return 'locked';
    return 'upcoming';
  };

  return [
    {
      id: 'read',
      label: 'Read Lesson',
      detail: meta.title,
      duration: `${meta.readingTimeMinutes}m`,
      icon: BookOpen,
      status: lessonDone ? 'completed' : 'active',
      href: ROUTES.lesson(dayId),
    },
    {
      id: 'build',
      label: 'Build Project',
      detail: meta.mission,
      duration: `${meta.estimatedBuildHours}h`,
      icon: Hammer,
      status: lessonDone ? (buildDone ? 'completed' : 'active') : 'upcoming',
      href: ROUTES.challenge(dayId),
    },
    {
      id: 'debug',
      label: 'Debug & Refine',
      detail: 'Fix broken UI and edge cases',
      duration: '30m',
      icon: Bug,
      status: resolve(2),
      href: ROUTES.challenge(dayId),
    },
    {
      id: 'quiz',
      label: 'Take Quiz',
      detail: '10 questions · Core concepts',
      duration: '15m',
      icon: HelpCircle,
      status: buildDone ? (quizDone ? 'completed' : 'active') : 'locked',
      href: ROUTES.quiz(dayId),
    },
    {
      id: 'interview',
      label: 'Interview Prep',
      detail: '5 technical questions',
      duration: '20m',
      icon: MessageCircle,
      status: quizDone ? 'upcoming' : 'locked',
      href: ROUTES.interview(dayId),
    },
    {
      id: 'reflect',
      label: 'Reflection',
      detail: 'Consolidate your learnings',
      duration: '10m',
      icon: PenLine,
      status: 'locked',
      href: ROUTES.notes,
    },
  ];
}

function getNextStep(dayId: string, progress: ProgressState): string {
  const lessonDone = progress.completedLessons.includes(dayId);
  const buildDone = progress.completedChallenges.includes(dayId);
  const quizDone = progress.completedQuizzes.includes(dayId);
  if (!lessonDone) return 'Read Lesson';
  if (!buildDone) return 'Build';
  if (!quizDone) return 'Quiz';
  return 'Interview';
}

/* ─── Step Status Styles ─────────────────────────────────────────────────── */

const STEP_STYLES = {
  completed: {
    ring: 'border-[rgb(var(--color-success)/0.5)] bg-[rgb(var(--color-success)/0.12)]',
    icon: 'text-[rgb(var(--color-success))]',
    text: 'text-[rgb(var(--color-success-text))]',
    sub: 'text-[rgb(var(--color-success)/0.7)]',
    line: 'bg-[rgb(var(--color-success))]',
    badge: 'bg-[rgb(var(--color-success)/0.1)] text-[rgb(var(--color-success-text))]',
  },
  active: {
    ring: 'border-[rgb(var(--color-accent)/0.5)] bg-[rgb(var(--color-accent)/0.12)]',
    icon: 'text-[rgb(var(--color-accent))]',
    text: 'text-[rgb(var(--color-text))]',
    sub: 'text-[rgb(var(--color-text-secondary))]',
    line: 'bg-gradient-to-b from-[rgb(var(--color-success))] to-[rgb(var(--color-accent))]',
    badge: 'bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent-text))]',
  },
  upcoming: {
    ring: 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]',
    icon: 'text-[rgb(var(--color-text-tertiary))]',
    text: 'text-[rgb(var(--color-text-secondary))]',
    sub: 'text-[rgb(var(--color-text-tertiary))]',
    line: 'bg-[rgb(var(--color-border))]',
    badge: 'bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-tertiary))]',
  },
  locked: {
    ring: 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))]',
    icon: 'text-[rgb(var(--color-text-tertiary))]',
    text: 'text-[rgb(var(--color-text-tertiary))]',
    sub: 'text-[rgb(var(--color-text-tertiary))]',
    line: 'bg-[rgb(var(--color-border))]',
    badge: 'bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-tertiary))]',
  },
} as const;

/* ─── Fade-up animation variant ─────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

/* ─── HeroMissionHeader ──────────────────────────────────────────────────── */

function HeroMissionHeader({
  dayNum,
  totalDays,
}: {
  dayNum: number;
  totalDays: number;
}) {
  const date = getDateParts();
  const { greeting, Icon: TimeIcon } = getGreetingContext();

  return (
    <div className="relative flex flex-wrap items-start justify-between gap-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-warning/20 bg-gradient-to-br from-warning/15 to-warning/5 shadow-[var(--shadow-low)]">
          <TimeIcon className="size-[18px] text-warning" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p
            className="text-[clamp(1.125rem,2.8vw,1.5rem)] font-semibold leading-tight tracking-tight text-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {greeting}
          </p>
          <p className="mt-1 label-section text-text-tertiary">Today's Mission</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-subtle px-4 py-2">
          <span
            className="font-bold leading-none text-text"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}
          >
            {String(dayNum).padStart(2, '0')}
          </span>
          <span className="text-lg font-light text-border-strong">/</span>
          <span className="text-base font-medium text-text-tertiary">{totalDays}</span>
        </div>
        <p className="text-[11px] font-medium text-text-secondary">
          {date.weekday}, {date.day} {date.month}
        </p>
      </div>
    </div>
  );
}

/* ─── HeroCockpit ────────────────────────────────────────────────────────── */

function HeroCockpit({
  meta,
  dayId,
  dayNum,
  totalDays,
  progress,
}: {
  meta: Meta;
  dayId: string;
  dayNum: number;
  totalDays: number;
  progress: ProgressState;
}) {
  const lessonDone = progress.completedLessons.includes(dayId);
  const buildDone = progress.completedChallenges.includes(dayId);
  const quizDone = progress.completedQuizzes.includes(dayId);

  const stepsCompleted = [lessonDone, buildDone, quizDone].filter(Boolean).length;
  const dayPct = Math.round((stepsCompleted / 3) * 100);
  const dayXpEarned = (lessonDone ? 50 : 0) + (buildDone ? 150 : 0) + (quizDone ? 100 : 0);
  const dayXpRemaining = 300 - dayXpEarned;

  const diff = DIFFICULTY[meta.difficulty];
  const totalTime = formatTime(meta.readingTimeMinutes, meta.estimatedBuildHours);

  /* Show at most 5 React skill tags */
  const skills = [...(meta.topics?.react ?? []), ...(meta.tags ?? [])]
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 6);

  const heroContinueHref = lessonDone ? ROUTES.challenge(dayId) : ROUTES.lesson(dayId);

  return (
    <div className="dashboard-hero relative flex min-h-[42vh] flex-col justify-between overflow-hidden rounded-3xl border border-accent/20 bg-surface p-7 shadow-[var(--shadow-medium)] sm:p-10">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-accent/8 blur-[100px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-purple/6 blur-[70px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-10 bottom-0 size-48 rounded-full bg-success/5 blur-[60px]" aria-hidden="true" />

      {/* Dot grid */}
      <div className="dashboard-hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Left accent stripe */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-l-3xl bg-gradient-to-b from-accent via-purple to-transparent opacity-80" aria-hidden="true" />

      {/* Top row */}
      <div className="relative">
        <HeroMissionHeader dayNum={dayNum} totalDays={totalDays} />
      </div>

      {/* Mission title */}
      <div className="relative mt-6 flex-1">
        <h1
          className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight tracking-tight text-text"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            {meta.subtitle}
          </p>
        )}

        {/* Skill tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-border bg-accent-subtle px-2.5 py-0.5 text-[11px] font-medium capitalize text-accent-text"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="relative mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-5">
        <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
          <Clock className="size-3.5 text-text-tertiary" aria-hidden="true" />
          <span className="font-medium text-text">{totalTime}</span>
          <span>total</span>
        </div>

        <div className="h-3 w-px bg-border" aria-hidden="true" />

        <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
          <Zap className="size-3.5 text-warning" aria-hidden="true" />
          <span className="font-semibold text-warning-text">
            +{dayXpRemaining > 0 ? dayXpRemaining : 300} XP
          </span>
          <span>{dayXpRemaining > 0 ? 'to earn' : 'earned'}</span>
        </div>

        <div className="h-3 w-px bg-border" aria-hidden="true" />

        <span
          className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold ${diff.bg} ${diff.border} ${diff.color}`}
        >
          {diff.label}
        </span>

        {progress.streak > 0 && (
          <>
            <div className="h-3 w-px bg-border" aria-hidden="true" />
            <div className="flex items-center gap-1.5 text-[13px]">
              <Flame className="size-3.5 text-danger" aria-hidden="true" />
              <span className="font-semibold text-danger-text">{progress.streak}</span>
              <span className="text-text-secondary">day streak</span>
            </div>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="label-section text-text-tertiary">Day Progress</span>
          <span className="text-[12px] font-semibold text-text-secondary">{dayPct}%</span>
        </div>

        <div className="flex h-2.5 gap-1">
          {(['Read', 'Build', 'Quiz'] as const).map((label, i) => {
            const done = [lessonDone, buildDone, quizDone][i];
            const isNext = !done && [!lessonDone, lessonDone && !buildDone, buildDone && !quizDone][i];
            return (
              <div key={label} className="flex-1 overflow-hidden rounded-full bg-bg-subtle">
                <div
                  className={[
                    'h-full rounded-full transition-all duration-700',
                    done
                      ? 'w-full bg-gradient-to-r from-success to-success-text'
                      : isNext
                        ? 'w-1/2 animate-pulse bg-accent'
                        : 'w-0',
                  ].join(' ')}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-1.5 flex gap-1">
          {(['Read', 'Build', 'Quiz'] as const).map((label, i) => {
            const done = [lessonDone, buildDone, quizDone][i];
            return (
              <div key={label} className="flex-1 text-center">
                <span className={`text-[10px] font-medium ${done ? 'text-success-text' : 'text-text-tertiary'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTAs */}
      <div className="relative mt-7 flex flex-wrap items-center gap-3">
        <Link
          to={heroContinueHref}
          className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-accent px-6 py-3 text-[14px] font-semibold text-text-inverse shadow-[var(--shadow-low)] transition-all duration-200 hover:bg-accent-hover active:scale-[0.98]"
        >
          <Play className="size-4 fill-current" aria-hidden="true" />
          {lessonDone ? 'Continue Mission' : 'Start Mission'}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>

        <Link
          to={ROUTES.lesson(dayId)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-[14px] font-medium text-text-secondary shadow-[var(--shadow-low)] transition-all duration-200 hover:border-border-strong hover:bg-surface-hover hover:text-text active:scale-[0.98]"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          Continue Reading
        </Link>

        <span className="ml-auto hidden text-[11px] text-text-tertiary sm:block">
          {dayXpEarned > 0 ? `${dayXpEarned} XP earned today` : 'Complete steps to earn XP'}
        </span>
      </div>
    </div>
  );
}

/* ─── VerticalJourney ────────────────────────────────────────────────────── */

function VerticalJourney({ steps }: { steps: JourneyStep[] }) {
  return (
    <div>
      <p className="label-section mb-5 flex items-center gap-2">
        <TrendingUp className="size-3" aria-hidden="true" />
        Learning Journey
      </p>

      <div className="relative">
        {steps.map((step, i) => {
          const s = STEP_STYLES[step.status];
          const isLast = i === steps.length - 1;
          const StatusIcon =
            step.status === 'completed'
              ? CheckCircle2
              : step.status === 'locked'
                ? Lock
                : step.icon;

          return (
            <div key={step.id} className="relative flex gap-4">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-[17px] top-[36px] bottom-0 w-px">
                  <div
                    className={`h-full w-px ${s.line}`}
                    style={{
                      backgroundImage:
                        step.status === 'locked' || step.status === 'upcoming'
                          ? 'repeating-linear-gradient(to bottom, currentColor 0, currentColor 4px, transparent 4px, transparent 10px)'
                          : undefined,
                    }}
                  />
                </div>
              )}

              {/* Step circle */}
              <div className="relative z-10 shrink-0 mt-1">
                <div
                  className={`flex size-9 items-center justify-center rounded-full border-2 transition-all ${s.ring} ${step.status === 'active' ? 'ring-2 ring-[rgb(var(--color-accent)/0.25)] ring-offset-2 ring-offset-[rgb(var(--color-bg))]' : ''}`}
                >
                  <StatusIcon className={`size-4 ${s.icon}`} aria-hidden="true" />
                </div>
                {step.status === 'active' && (
                  <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-[rgb(var(--color-accent))]">
                    <span className="absolute inset-0 rounded-full bg-[rgb(var(--color-accent))] animate-ping opacity-60" />
                  </span>
                )}
              </div>

              {/* Step content */}
              <div className={`flex-1 pb-7 ${isLast ? 'pb-0' : ''}`}>
                {step.status === 'locked' ? (
                  <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] font-semibold ${s.text}`}>{step.label}</span>
                      <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${s.badge}`}>
                        {step.duration}
                      </span>
                    </div>
                    <p className={`mt-0.5 text-[11px] ${s.sub} line-clamp-1`}>{step.detail}</p>
                  </div>
                ) : (
                  <Link
                    to={step.href}
                    className={`group block rounded-xl border p-4 transition-all duration-150 ${
                      step.status === 'completed'
                        ? 'border-[rgb(var(--color-success)/0.2)] bg-[rgb(var(--color-success)/0.06)] hover:border-[rgb(var(--color-success)/0.4)] hover:bg-[rgb(var(--color-success)/0.1)]'
                        : step.status === 'active'
                          ? 'border-[rgb(var(--color-accent)/0.3)] bg-[rgb(var(--color-accent)/0.08)] hover:border-[rgb(var(--color-accent)/0.5)] hover:bg-[rgb(var(--color-accent)/0.12)]'
                          : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-border-strong))] hover:bg-[rgb(var(--color-surface-raised))]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-[13px] font-semibold ${s.text} leading-tight`}>
                        {step.label}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${s.badge}`}>
                          {step.duration}
                        </span>
                        <ChevronRight
                          className={`size-3.5 transition-transform group-hover:translate-x-0.5 ${s.icon}`}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    <p className={`mt-1 text-[11px] ${s.sub} line-clamp-1`}>{step.detail}</p>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── DayContextPanel ────────────────────────────────────────────────────── */

function DayContextPanel({ meta }: { meta: Meta }) {
  return (
    <div className="space-y-4">
      {meta.definitionOfDone.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-low)]">
          <p className="label-section mb-3">Definition of Done</p>
          <ul className="space-y-2">
            {meta.definitionOfDone.slice(0, 4).map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[12px] leading-snug text-text-secondary">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-text-tertiary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {meta.tomorrowPreview && (
        <section className="rounded-2xl border border-accent/20 bg-accent-subtle/40 p-5">
          <p className="label-section mb-2 flex items-center gap-2">
            <Sparkles className="size-3 text-accent-text" aria-hidden="true" />
            Tomorrow · Day {String(meta.tomorrowPreview.day).padStart(2, '0')}
          </p>
          <p className="text-[13px] font-semibold text-text">{meta.tomorrowPreview.title}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
            {meta.tomorrowPreview.summary}
          </p>
        </section>
      )}
    </div>
  );
}

/* ─── WeeklyTimeline ─────────────────────────────────────────────────────── */

function WeeklyTimeline({
  currentDayId,
  progress,
}: {
  currentDayId: string;
  progress: ProgressState;
}) {
  const totalWeeks = roadmapConfig.weeks.length;
  const currentWeekIdx = roadmapConfig.weeks.findIndex((w) =>
    w.days.some((d) => d.dayId === currentDayId),
  );
  const [weekOffset, setWeekOffset] = useState(Math.max(0, currentWeekIdx));
  const week = roadmapConfig.weeks[weekOffset];
  if (!week) return null;

  const days: WeekDay[] = week.days.map((d) => {
    let status: WeekDay['status'] = 'locked';
    if (d.dayId === currentDayId) status = 'today';
    else if (hasDay(d.dayId)) {
      const s = getDayStatus(d.dayId, progress);
      status = s === 'completed' ? 'completed' : 'available';
    }
    return { ...d, status };
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <p className="label-section flex items-center gap-2">
          <CalendarDays className="size-3" aria-hidden="true" />
          {week.title}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset((p) => Math.max(0, p - 1))}
            disabled={weekOffset === 0}
            className="flex size-7 items-center justify-center rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-tertiary))] transition-all hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text-secondary))] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous week"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          </button>
          <span className="text-[11px] text-[rgb(var(--color-text-tertiary))]">
            Week {weekOffset + 1} / {totalWeeks}
          </span>
          <button
            type="button"
            onClick={() => setWeekOffset((p) => Math.min(totalWeeks - 1, p + 1))}
            disabled={weekOffset === totalWeeks - 1}
            className="flex size-7 items-center justify-center rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-tertiary))] transition-all hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text-secondary))] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next week"
          >
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Day tiles */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const isToday = d.status === 'today';
          const isLocked = d.status === 'locked';
          const isCompleted = d.status === 'completed';
          const diff = DIFFICULTY[d.difficulty];

          const tile = (
            <div
              key={d.dayId}
              className={[
                'relative flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200',
                isToday
                  ? 'border-[rgb(var(--color-accent)/0.4)] bg-gradient-to-b from-[rgb(var(--color-accent)/0.12)] to-[rgb(var(--color-accent)/0.04)] shadow-[0_0_20px_rgb(var(--color-accent)/0.15)]'
                  : isCompleted
                    ? 'border-[rgb(var(--color-success)/0.25)] bg-[rgb(var(--color-success)/0.05)] hover:border-[rgb(var(--color-success)/0.4)]'
                    : isLocked
                      ? 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] opacity-50'
                      : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-border-strong))]',
              ].join(' ')}
            >
              {/* Status indicator */}
              <div
                className={[
                  'flex size-6 items-center justify-center rounded-full',
                  isCompleted
                    ? 'bg-[rgb(var(--color-success)/0.15)]'
                    : isToday
                      ? 'bg-[rgb(var(--color-accent)/0.15)]'
                      : 'bg-[rgb(var(--color-surface-raised))]',
                ].join(' ')}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-3.5 text-[rgb(var(--color-success))]" aria-hidden="true" />
                ) : isLocked ? (
                  <Lock className="size-3 text-[rgb(var(--color-text-tertiary))]" aria-hidden="true" />
                ) : isToday ? (
                  <span className="relative flex size-2 rounded-full bg-[rgb(var(--color-accent))]">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--color-accent))] opacity-60" />
                  </span>
                ) : (
                  <span className="size-1.5 rounded-full bg-[rgb(var(--color-text-tertiary))]" />
                )}
              </div>

              {/* Day number */}
              <span
                className={[
                  'text-[16px] font-bold leading-none',
                  isToday
                    ? 'text-[rgb(var(--color-accent-text))]'
                    : isCompleted
                      ? 'text-[rgb(var(--color-success-text))]'
                      : isLocked
                        ? 'text-[rgb(var(--color-text-tertiary))]'
                        : 'text-[rgb(var(--color-text-secondary))]',
                ].join(' ')}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {String(d.day).padStart(2, '0')}
              </span>

              {/* Title */}
              <span
                className={[
                  'text-center text-[9px] font-medium leading-tight line-clamp-2 px-0.5',
                  isToday
                    ? 'text-[rgb(var(--color-accent-text))]'
                    : isCompleted
                      ? 'text-[rgb(var(--color-success)/0.8)]'
                      : 'text-[rgb(var(--color-text-tertiary))]',
                ].join(' ')}
              >
                {d.title}
              </span>

              {/* Difficulty dot */}
              <span className={`text-[8px] font-semibold uppercase tracking-wide ${isLocked ? 'text-[rgb(var(--color-text-tertiary))]' : diff.color}`}>
                {d.difficulty.slice(0, 3)}
              </span>

              {/* TODAY badge */}
              {isToday && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[rgb(var(--color-accent))] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                  Today
                </span>
              )}
            </div>
          );

          if (isLocked || isToday) return tile;
          return (
            <Link
              key={d.dayId}
              to={hasDay(d.dayId) ? ROUTES.lesson(d.dayId) : '#'}
              className="block"
            >
              {tile}
            </Link>
          );
        })}
      </div>

      {/* Week goal */}
      <p className="mt-4 text-[12px] text-[rgb(var(--color-text-tertiary))] leading-relaxed">
        <span className="font-medium text-[rgb(var(--color-text-secondary))]">Week Goal: </span>
        {week.goal}
      </p>
    </div>
  );
}

/* ─── FloatingProgress ───────────────────────────────────────────────────── */

function FloatingProgress({
  dayId,
  dayNum,
  progress,
}: {
  dayId: string;
  dayNum: number;
  progress: ProgressState;
}) {
  const [dismissed, setDismissed] = useState(false);

  const lessonDone = progress.completedLessons.includes(dayId);
  const buildDone = progress.completedChallenges.includes(dayId);
  const quizDone = progress.completedQuizzes.includes(dayId);
  const stepsCompleted = [lessonDone, buildDone, quizDone].filter(Boolean).length;
  const pct = Math.round((stepsCompleted / 3) * 100);
  const nextStep = getNextStep(dayId, progress);
  const continueTo = lessonDone ? ROUTES.challenge(dayId) : ROUTES.lesson(dayId);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-accent/25 bg-surface/95 px-4 py-3 shadow-[var(--shadow-high)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-accent/10 blur-2xl" aria-hidden="true" />

            <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-accent/20 bg-accent-subtle">
              <span className="text-[9px] font-medium uppercase tracking-wider text-text-tertiary">Day</span>
              <span
                className="text-[15px] font-bold leading-none text-accent-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {String(dayNum).padStart(2, '0')}
              </span>
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[13px] font-semibold text-text">{pct}% Complete</span>
              </div>
              <div className="mb-1.5 h-1 w-32 overflow-hidden rounded-full bg-bg-subtle">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-purple transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] text-text-tertiary">
                Next:{' '}
                <Link
                  to={continueTo}
                  className="font-medium text-accent-text transition-colors hover:text-accent-hover"
                >
                  {nextStep}
                </Link>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-secondary"
              aria-label="Dismiss progress widget"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── DashboardPage ──────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const progress = useAppSelector((s) => s.progress);
  const allDayIds = listDayIds();
  const totalCurriculum = roadmapConfig.weeks.reduce((sum, w) => sum + w.days.length, 0);
  const completedDays = countCompletedDays(progress);
  const currentDayId = getContinueDayId(progress) ?? allDayIds[0];

  let meta: Meta | null = null;
  try {
    meta = currentDayId ? getMeta(currentDayId) : null;
  } catch {
    meta = null;
  }

  const journeySteps = meta && currentDayId ? buildJourneySteps(currentDayId, meta, progress) : [];
  const dayNum = meta?.day ?? 1;

  return (
    <>
      <div className="mx-auto w-full max-w-[min(100%,1440px)] space-y-10 px-4 pt-8 pb-20 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        {/* ── Hero Cockpit ── */}
        {meta && currentDayId ? (
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
            <HeroCockpit
              meta={meta}
              dayId={currentDayId}
              dayNum={dayNum}
              totalDays={totalCurriculum}
              progress={progress}
            />
          </motion.div>
        ) : (
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
            <div className="relative overflow-hidden rounded-3xl border border-success/30 bg-surface p-10 text-center shadow-[var(--shadow-medium)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(var(--color-success)/0.12),transparent_60%)]" aria-hidden="true" />
              <CheckCircle2 className="relative mx-auto mb-4 size-12 text-success" aria-hidden="true" />
              <h1
                className="relative text-4xl font-bold text-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Course Complete
              </h1>
              <p className="relative mt-3 text-text-secondary">
                All {completedDays} days finished. You're interview-ready.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Two-column: Journey + Timeline ── */}
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Vertical journey */}
          {journeySteps.length > 0 && (
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
              <div className="space-y-8">
                <VerticalJourney steps={journeySteps} />
                {meta && <DayContextPanel meta={meta} />}
              </div>
            </motion.div>
          )}

          {/* Right column: MetricsPanel */}
          {meta && (
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
              <MetricsPanel meta={meta} />
            </motion.div>
          )}
        </div>

        {/* ── Weekly Timeline ── */}
        {currentDayId && (
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show">
            <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6 shadow-[var(--shadow-low)]">
              <WeeklyTimeline currentDayId={currentDayId} progress={progress} />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Floating Progress ── */}
      {currentDayId && (
        <FloatingProgress
          dayId={currentDayId}
          dayNum={dayNum}
          progress={progress}
        />
      )}
    </>
  );
}
