import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileQuestion, ListChecks, Zap, HelpCircle } from 'lucide-react';
import { QuizEngine } from '@/features/quiz/components/QuizEngine';
import { useDayBundle } from '@/hooks/useContent';
import { useAppDispatch } from '@/hooks/redux';
import { markQuizComplete, touchDayVisited } from '@/stores/slices/progress.slice';
import { ROUTES } from '@/constants/routes';

const DIFFICULTY_STYLES = {
  beginner:     { color: 'text-[rgb(var(--color-success-text))]',  bg: 'bg-[rgb(var(--color-success)/0.1)]',  border: 'border-[rgb(var(--color-success)/0.25)]' },
  intermediate: { color: 'text-[rgb(var(--color-warning-text))]',  bg: 'bg-[rgb(var(--color-warning)/0.1)]',  border: 'border-[rgb(var(--color-warning)/0.25)]' },
  advanced:     { color: 'text-[rgb(var(--color-danger-text))]',   bg: 'bg-[rgb(var(--color-danger)/0.1)]',   border: 'border-[rgb(var(--color-danger)/0.25)]'  },
} as const;

function NotFound({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-20 pb-24 text-center md:px-8">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
        <FileQuestion className="size-7 text-[rgb(var(--color-text-tertiary))]" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">{title}</h2>
      <p className="mt-2 text-[13px] text-[rgb(var(--color-text-secondary))]">{description}</p>
      <Link
        to={ROUTES.learn}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--color-accent))] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all hover:bg-[rgb(var(--color-accent-hover))]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Learning Path
      </Link>
    </div>
  );
}

export default function QuizPage() {
  const { day = '' } = useParams<{ day: string }>();
  const bundle       = useDayBundle(day);
  const dispatch     = useAppDispatch();

  useEffect(() => {
    if (bundle) dispatch(touchDayVisited(bundle.dayId));
  }, [bundle, dispatch]);

  // Prevent page scroll while quiz is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!bundle) {
    return <NotFound title="Quiz not found" description="This day has no quiz content yet." />;
  }

  const { meta, quiz } = bundle;
  const diff = DIFFICULTY_STYLES[meta.difficulty as keyof typeof DIFFICULTY_STYLES] ?? DIFFICULTY_STYLES.beginner;

  return (
    <div className="fixed inset-0 bottom-[88px] flex flex-col overflow-hidden bg-[rgb(var(--color-bg))] px-4 sm:px-6 lg:px-8">

      {/* ── Compact header ───────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[rgb(var(--color-border))] pb-3 pt-4">
        {/* Breadcrumb */}
        <div className="mb-2 flex items-center gap-2 text-[11px]">
          <Link
            to={ROUTES.lesson(bundle.dayId)}
            className="flex items-center gap-1 text-[rgb(var(--color-text-tertiary))] transition-colors hover:text-[rgb(var(--color-text))]"
          >
            <ArrowLeft className="size-3" aria-hidden="true" />
            Day {meta.day}
          </Link>
          <span className="text-[rgb(var(--color-border-strong))]">/</span>
          <span className="font-medium text-[rgb(var(--color-text-secondary))]">Quiz</span>
        </div>

        {/* Title row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-accent)/0.12)] border border-[rgb(var(--color-accent)/0.25)]">
              <ListChecks className="size-4 text-[rgb(var(--color-accent-text))]" />
            </div>
            <h1
              className="truncate text-[15px] font-bold text-[rgb(var(--color-text))]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {quiz.title}
            </h1>
          </div>

          {/* Meta pills */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${diff.bg} ${diff.border} ${diff.color}`}>
              {meta.difficulty}
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-2.5 py-0.5 text-[11px] text-[rgb(var(--color-text-secondary))]">
              <HelpCircle className="size-3 text-[rgb(var(--color-text-tertiary))]" />
              {quiz.questions.length}q
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-2.5 py-0.5 text-[11px] text-[rgb(var(--color-text-secondary))]">
              <Zap className="size-3 text-[rgb(var(--color-text-tertiary))]" />
              Pass {quiz.passingScorePercent}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Quiz engine (fills all remaining space) ───────────────────────── */}
      <div className="flex-1 min-h-0 pt-3 pb-2">
        <QuizEngine
          quiz={quiz}
          onComplete={(result) => {
            dispatch(
              markQuizComplete({
                dayId: bundle.dayId,
                result: { ...result, completedAt: new Date().toISOString() },
              }),
            );
          }}
        />
      </div>
    </div>
  );
}
