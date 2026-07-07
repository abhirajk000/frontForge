import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  FileQuestion,
  BrainCircuit,
  AlertTriangle,
  Star,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { useDayBundle } from '@/hooks/useContent';
import { useAppDispatch } from '@/hooks/redux';
import { markInterviewComplete, touchDayVisited } from '@/stores/slices/progress.slice';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

const DIFF_STYLE: Record<string, string> = {
  easy: 'text-[rgb(16_185_129)] bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]',
  medium: 'text-[rgb(245_158_11)] bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]',
  hard: 'text-[rgb(239_68_68)] bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]',
  senior: 'text-[rgb(139_92_246)] bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)]',
};

/* ─── Not found ─────────────────────────────────────────────────────────────── */

function NotFound({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-20 pb-24 text-center md:px-8">
      <FileQuestion className="mx-auto mb-4 size-10 text-[rgb(var(--color-text-tertiary))]" aria-hidden="true" />
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

/* ─── QuestionCard ──────────────────────────────────────────────────────────── */

function QuestionCard({
  question,
  index,
}: {
  question: {
    id: string;
    question: string;
    difficulty: string;
    category: string;
    whatInterviewerTests: string;
    keyPoints: string[];
    sampleAnswer: string;
    followUps?: string[];
    redFlags?: string[];
  };
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const diffStyle = DIFF_STYLE[question.difficulty] ?? DIFF_STYLE.medium;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border transition-colors duration-150',
        open
          ? 'border-[rgb(var(--color-border-strong))] bg-[rgb(var(--color-surface-raised))]'
          : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]',
      )}
    >
      {/* Question header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-4 px-6 py-5 text-left transition-colors hover:bg-[rgb(var(--color-surface-raised))]"
      >
        <span
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] text-[11px] font-bold text-[rgb(var(--color-text-tertiary))]"
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[rgb(var(--color-text))] leading-snug">
            {question.question}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize',
                diffStyle,
              )}
            >
              {question.difficulty}
            </span>
            <span className="rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-2 py-0.5 text-[10px] font-medium capitalize text-[rgb(var(--color-text-tertiary))]">
              {question.category}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 size-4 shrink-0 text-[rgb(var(--color-text-tertiary))] transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-[rgb(var(--color-border))] px-6 py-5 space-y-6">

          {/* What the interviewer tests */}
          <div className="rounded-xl border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.05)] p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
              What the interviewer tests
            </p>
            <p className="text-[13px] text-[rgb(var(--color-text-secondary))]">{question.whatInterviewerTests}</p>
          </div>

          {/* Key points */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Star className="size-3.5 text-[rgb(245_158_11)]" aria-hidden="true" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
                Key Points
              </p>
            </div>
            <ul className="space-y-2">
              {question.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[rgb(var(--color-text-secondary))]">
                  <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--color-accent))]" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Sample answer */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="size-3.5 text-[rgb(var(--color-accent))]" aria-hidden="true" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
                Sample Answer
              </p>
            </div>
            <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-4 py-3">
              <p className="text-[13px] leading-relaxed text-[rgb(var(--color-text-secondary))]">{question.sampleAnswer}</p>
            </div>
          </div>

          {/* Follow-ups */}
          {question.followUps && question.followUps.length > 0 && (
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
                Follow-up Questions
              </p>
              <ul className="space-y-1.5">
                {question.followUps.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[rgb(var(--color-text-secondary))]">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--color-text-tertiary))]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Red flags */}
          {question.redFlags && question.redFlags.length > 0 && (
            <div className="rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="size-3.5 text-[rgb(var(--color-danger-text))]" aria-hidden="true" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-danger-text))]">
                  Red Flags — Avoid These
                </p>
              </div>
              <ul className="space-y-1.5">
                {question.redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[rgb(var(--color-text-secondary))]">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--color-danger-text))]" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── InterviewPage ─────────────────────────────────────────────────────────── */

export default function InterviewPage() {
  const { day = '' } = useParams<{ day: string }>();
  const bundle = useDayBundle(day);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!bundle) return;
    dispatch(touchDayVisited(bundle.dayId));
    const timer = window.setTimeout(() => {
      dispatch(markInterviewComplete(bundle.dayId));
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [bundle, dispatch]);

  if (!bundle) {
    return <NotFound title="Interview prep not found" description="This day has no interview content yet." />;
  }

  const { meta, interview } = bundle;

  const diffCounts = interview.questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-24 md:px-8 lg:px-12">

      {/* ── Breadcrumb nav ─────────────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-2 text-[12px]">
        <Link
          to={ROUTES.lesson(bundle.dayId)}
          className="flex items-center gap-1.5 text-[rgb(var(--color-text-tertiary))] transition-colors hover:text-[rgb(var(--color-text))]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Day {meta.day}
        </Link>
        <span className="text-[rgb(var(--color-border-strong))]">/</span>
        <span className="font-medium text-[rgb(var(--color-text-secondary))]">Interview Prep</span>
      </div>

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <BrainCircuit className="size-5 text-[rgb(var(--color-accent))]" aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
            Day {meta.day} · Interview Prep
          </p>
        </div>
        <h1
          className="text-3xl font-bold text-[rgb(var(--color-text))]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {interview.title}
        </h1>
        <p className="mt-2 text-[rgb(var(--color-text-secondary))]">{interview.description}</p>

        {/* Question count by difficulty */}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-1 text-[12px] text-[rgb(var(--color-text-secondary))]">
            {interview.questions.length} questions
          </span>
          {Object.entries(diffCounts).map(([diff, count]) => (
            <span
              key={diff}
              className={cn('rounded-full border px-3 py-1 text-[11px] font-medium capitalize', DIFF_STYLE[diff] ?? DIFF_STYLE.medium)}
            >
              {count} {diff}
            </span>
          ))}
        </div>
      </div>

      {/* Tip banner */}
      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.05)] px-5 py-4">
        <BrainCircuit className="mt-0.5 size-4 shrink-0 text-[rgb(var(--color-accent))]" aria-hidden="true" />
        <p className="text-[13px] text-[rgb(var(--color-text-secondary))]">
          Click each question to reveal the answer framework, key talking points, and common red flags interviewers watch for.
        </p>
      </div>

      {/* ── Question list ──────────────────────────────────────────── */}
      <div className="space-y-3">
        {interview.questions.map((q, i) => (
          <QuestionCard key={q.id} question={q} index={i} />
        ))}
      </div>
    </div>
  );
}
