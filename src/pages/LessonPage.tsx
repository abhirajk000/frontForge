import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Network,
  Code2,
  Pencil,
  Hammer,
  CheckSquare,
  ChevronRight,
  BookOpen,
  Clock,
  ArrowLeft,
  FileQuestion,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BlockRenderer } from '@/content-engine/blocks/BlockRenderer';
import type { LessonBlock } from '@/content-engine/schemas/lesson.schema';
import { useDayBundle } from '@/hooks/useContent';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { markLessonComplete, touchDayVisited } from '@/stores/slices/progress.slice';
import { MissionCompleteToast } from '@/components/organisms/MissionCompleteToast';
import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/molecules';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

interface Phase {
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  triggerType: LessonBlock['type'] | null;
}

const PHASES: Phase[] = [
  { id: 'why', label: 'Why This Matters', shortLabel: 'Why', icon: Lightbulb, triggerType: null },
  { id: 'concepts', label: 'Core Concepts', shortLabel: 'Concepts', icon: Network, triggerType: 'heading' },
  { id: 'example', label: 'Code Examples', shortLabel: 'Examples', icon: Code2, triggerType: 'code' },
  { id: 'exercise', label: 'Mini Exercise', shortLabel: 'Exercise', icon: Pencil, triggerType: 'checklist' },
  { id: 'build', label: 'Build Challenge', shortLabel: 'Build', icon: Hammer, triggerType: 'challenge' },
  { id: 'checkpoint', label: 'Checkpoint', shortLabel: 'Check', icon: CheckSquare, triggerType: 'quiz-reference' },
];

function buildPhaseMap(blocks: LessonBlock[]): number[] {
  const phaseMap: number[] = new Array(blocks.length).fill(0);
  let currentPhase = 0;
  const seen = new Set<string>();
  seen.add('null');

  for (let i = 0; i < blocks.length; i++) {
    const blockType = blocks[i]?.type;
    if (!blockType) continue;

    for (let p = 1; p < PHASES.length; p++) {
      const trigger = PHASES[p]?.triggerType;
      if (trigger && blockType === trigger && !seen.has(trigger)) {
        seen.add(trigger);
        currentPhase = p;
        break;
      }
    }
    phaseMap[i] = currentPhase;
  }

  return phaseMap;
}

function LessonFlowBar({
  activePhase,
  reachedPhase,
  onSelect,
}: {
  activePhase: number;
  reachedPhase: number;
  onSelect: (i: number) => void;
}) {
  return (
    <nav
      aria-label="Lesson phases"
      className="mb-8 overflow-x-auto rounded-xl border border-border bg-surface shadow-[var(--shadow-low)]"
    >
      <ol className="flex min-w-max items-stretch">
        {PHASES.map((phase, i) => {
          const isActive = i === activePhase;
          const isReached = i <= reachedPhase;
          const isPast = i < activePhase;

          return (
            <li key={phase.id} className="flex items-center">
              <button
                type="button"
                onClick={() => isReached && onSelect(i)}
                disabled={!isReached}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-[12px] font-medium transition-all',
                  'disabled:cursor-not-allowed',
                  isActive && 'bg-accent-subtle text-accent-text',
                  !isActive && isPast && 'text-success-text hover:bg-surface-hover',
                  !isActive && isReached && !isPast && 'text-text-secondary hover:bg-surface-hover',
                  !isReached && 'text-text-tertiary',
                )}
              >
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold transition-all',
                    isActive && 'border-accent/40 bg-accent-subtle text-accent-text',
                    isPast && 'border-success/40 bg-success-subtle text-success-text',
                    !isActive && !isPast && 'border-border text-text-tertiary',
                  )}
                >
                  {isPast ? '✓' : i + 1}
                </span>
                <phase.icon className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{phase.shortLabel}</span>
              </button>

              {i < PHASES.length - 1 && (
                <span className="flex h-full w-6 shrink-0 items-center justify-center" aria-hidden="true">
                  <ChevronRight
                    className={cn(
                      'size-3',
                      i < reachedPhase ? 'text-border-strong' : 'text-border',
                    )}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function PhaseHeader({ phase }: { phase: Phase }) {
  return (
    <div className="my-10 first:mt-0">
      <div className="flex items-center gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent-subtle">
          <phase.icon className="size-3.5 text-accent" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-accent-text">
            Phase {PHASES.indexOf(phase) + 1}
          </p>
          <h2
            className="text-[15px] font-semibold text-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {phase.label}
          </h2>
        </div>
      </div>
      <div className="mt-3 h-px bg-gradient-to-r from-accent/30 to-transparent" />
    </div>
  );
}

const DIFFICULTY_COLOR = {
  beginner: 'text-success-text bg-success-subtle border-success/25',
  intermediate: 'text-warning-text bg-warning-subtle border-warning/25',
  advanced: 'text-danger-text bg-danger-subtle border-danger/25',
} as const;

const ACTION_LINK =
  'inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-text-secondary shadow-[var(--shadow-low)] transition-all hover:border-border-strong hover:bg-surface-hover hover:text-text';

export default function LessonPage() {
  const { day = '' } = useParams<{ day: string }>();
  const bundle = useDayBundle(day);
  const dispatch = useAppDispatch();
  const completed = useAppSelector((s) => s.progress.completedLessons ?? []);

  const [activePhase, setActivePhase] = useState(0);
  const [reachedPhase, setReachedPhase] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const phaseRefs = useRef<(HTMLElement | null)[]>([]);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!bundle) return;
    dispatch(touchDayVisited(bundle.dayId));

    if (!completed.includes(bundle.dayId)) {
      const timer = window.setTimeout(() => {
        dispatch(markLessonComplete(bundle.dayId));
        setShowComplete(true);
      }, 3000);
      return () => window.clearTimeout(timer);
    }
  }, [bundle, completed, dispatch]);

  useEffect(() => {
    if (!articleRef.current) return;
    const headings = articleRef.current.querySelectorAll('[data-phase]');
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const phaseIdx = Number((entry.target as HTMLElement).dataset.phase ?? 0);
            setActivePhase(phaseIdx);
            setReachedPhase((prev) => Math.max(prev, phaseIdx));
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [bundle]);

  const scrollToPhase = (phaseIdx: number) => {
    phaseRefs.current[phaseIdx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!bundle) {
    return (
      <div className="mx-auto w-full max-w-[85%] px-5 pt-20 pb-24 md:px-10 lg:px-14 xl:px-16">
        <EmptyState
          icon={FileQuestion}
          title="Lesson not found"
          description="This day has no content yet. Check the learning path for available days."
          action={
            <Link to={ROUTES.learn}>
              <Button variant="primary" size="sm">
                Learning Path
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const { meta, lesson } = bundle;
  const dayId = bundle.dayId;
  const phaseMap = buildPhaseMap(lesson.blocks);

  const groupedBlocks: Array<{ phaseIdx: number; blocks: LessonBlock[] }> = [];
  let currentGroup: { phaseIdx: number; blocks: LessonBlock[] } | null = null;

  for (let i = 0; i < lesson.blocks.length; i++) {
    const p = phaseMap[i] ?? 0;
    if (!currentGroup || currentGroup.phaseIdx !== p) {
      if (currentGroup) groupedBlocks.push(currentGroup);
      currentGroup = { phaseIdx: p, blocks: [] };
    }
    const block = lesson.blocks[i];
    if (block) currentGroup.blocks.push(block);
  }
  if (currentGroup) groupedBlocks.push(currentGroup);

  return (
    <div className="mx-auto w-full max-w-[85%] px-5 pt-8 pb-24 md:px-10 lg:px-14 xl:px-16">
      {showComplete && (
        <MissionCompleteToast
          xp={50}
          label="Lesson Complete"
          onDismiss={() => setShowComplete(false)}
        />
      )}

      <div className="mb-6 flex items-center gap-2 text-[12px] text-text-tertiary">
        <Link
          to={ROUTES.learn}
          className="flex items-center gap-1.5 transition-colors hover:text-text-secondary"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Learning Path
        </Link>
        <span aria-hidden="true" className="text-border-strong">
          /
        </span>
        <span className="text-text-secondary">Day {meta.day}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="mb-8"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-accent/30 bg-accent-subtle px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent-text">
            Week {meta.week}
          </span>
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize',
              DIFFICULTY_COLOR[meta.difficulty],
            )}
          >
            {meta.difficulty}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
            <Clock className="size-3" aria-hidden="true" />
            {meta.readingTimeMinutes} min read
          </span>
        </div>

        <h1
          className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold leading-tight tracking-tight text-text"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {lesson.title}
        </h1>

        {lesson.summary && (
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            {lesson.summary}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <Link to={ROUTES.quiz(dayId)} className={ACTION_LINK}>
            <BookOpen className="size-3.5" aria-hidden="true" />
            Quiz
          </Link>
          <Link
            to={ROUTES.challenge(dayId)}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-subtle px-3.5 py-2 text-[12px] font-medium text-accent-text transition-all hover:border-accent/50 hover:bg-accent-subtle/80"
          >
            <Hammer className="size-3.5" aria-hidden="true" />
            Build Challenge
          </Link>
          <Link to={ROUTES.interview(dayId)} className={ACTION_LINK}>
            Interview Prep
          </Link>
        </div>
      </motion.div>

      <LessonFlowBar
        activePhase={activePhase}
        reachedPhase={reachedPhase}
        onSelect={scrollToPhase}
      />

      <article ref={articleRef} className="min-w-0 space-y-0">
        {groupedBlocks.map(({ phaseIdx, blocks }) => {
          const phase = PHASES[phaseIdx];
          if (!phase) return null;

          return (
            <div key={`phase-${phaseIdx}`}>
              <span
                ref={(el) => {
                  phaseRefs.current[phaseIdx] = el;
                }}
                data-phase={phaseIdx}
                className="pointer-events-none sr-only"
                aria-hidden="true"
              />
              <PhaseHeader phase={phase} />
              <BlockRenderer blocks={blocks} dayId={dayId} />
            </div>
          );
        })}
      </article>
    </div>
  );
}
