import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileQuestion,
  Swords,
  Zap,
  Bug,
  Trophy,
} from 'lucide-react';
import { useDayBundle } from '@/hooks/useContent';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { markChallengeComplete, touchDayVisited } from '@/stores/slices/progress.slice';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

/* ─── Inline expandable ────────────────────────────────────────────────────── */

function Expandable({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[rgb(var(--color-surface-raised))]"
      >
        <span className="text-[14px] font-medium text-[rgb(var(--color-text))]">{title}</span>
        <ChevronDown
          className={cn(
            'size-4 text-[rgb(var(--color-text-tertiary))] transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="border-t border-[rgb(var(--color-border))] px-5 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

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

/* ─── ChallengePage ─────────────────────────────────────────────────────────── */

export default function ChallengePage() {
  const { day = '' } = useParams<{ day: string }>();
  const bundle = useDayBundle(day);
  const dispatch = useAppDispatch();
  const completed = useAppSelector((s) => s.progress.completedChallenges);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (bundle) dispatch(touchDayVisited(bundle.dayId));
  }, [bundle, dispatch]);

  if (!bundle) {
    return <NotFound title="Challenge not found" description="This day has no challenge content yet." />;
  }

  const { meta, challenge } = bundle;
  const isComplete = completed.includes(bundle.dayId);
  const allCriteriaChecked =
    challenge.acceptanceCriteria.length > 0 &&
    challenge.acceptanceCriteria.every((_, i) => checkedItems.has(`ac-${i}`));

  const toggleCriterion = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pt-8 pb-24 md:px-8 lg:px-12">

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
        <span className="font-medium text-[rgb(var(--color-text-secondary))]">Challenge</span>
      </div>

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
            Day {meta.day} · Build Challenge
          </p>
          <h1
            className="text-3xl font-bold text-[rgb(var(--color-text))]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {challenge.title}
          </h1>
          <p className="mt-2 text-[rgb(var(--color-text-secondary))]">{challenge.description}</p>

          {/* Meta badges */}
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-1 text-[12px] text-[rgb(var(--color-text-secondary))]">
              <Clock className="size-3.5" aria-hidden="true" />
              {challenge.estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-1 text-[12px] capitalize text-[rgb(var(--color-text-secondary))]">
              <Zap className="size-3.5" aria-hidden="true" />
              {challenge.difficulty}
            </span>
          </div>
        </div>

        {/* Complete CTA */}
        <div className="shrink-0">
          {isComplete ? (
            <div className="flex items-center gap-2 rounded-xl border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)] px-5 py-2.5 text-[14px] font-semibold text-[rgb(16_185_129)]">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Completed
            </div>
          ) : (
            <button
              type="button"
              disabled={!allCriteriaChecked}
              onClick={() => dispatch(markChallengeComplete(bundle.dayId))}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold transition-all duration-150',
                allCriteriaChecked
                  ? 'bg-[rgb(var(--color-accent))] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:bg-[rgb(var(--color-accent-hover))]'
                  : 'cursor-not-allowed border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-tertiary))] opacity-50',
              )}
            >
              <Swords className="size-4" aria-hidden="true" />
              {allCriteriaChecked ? 'Mark Complete' : `Check all criteria (${checkedItems.size}/${challenge.acceptanceCriteria.length})`}
            </button>
          )}
        </div>
      </div>

      {/* ── Mission brief ──────────────────────────────────────────── */}
      <div className="mb-8 rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.05)] p-6">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
          Mission Brief
        </p>
        <p className="text-[15px] leading-relaxed text-[rgb(var(--color-text))]">{challenge.mission}</p>
      </div>

      {/* ── Requirements + Criteria ────────────────────────────────── */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Requirements */}
        <div>
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
            Requirements
          </h2>
          <ul className="space-y-2">
            {challenge.requirements.map((req, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-3"
              >
                <Swords className="mt-0.5 size-4 shrink-0 text-[rgb(var(--color-accent))]" aria-hidden="true" />
                <span className="text-[13px] text-[rgb(var(--color-text-secondary))]">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Acceptance Criteria */}
        <div>
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
            Acceptance Criteria
          </h2>
          <ul className="space-y-2">
            {challenge.acceptanceCriteria.map((item, i) => {
              const id = `ac-${i}`;
              const checked = checkedItems.has(id);
              return (
                <li key={id}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-150',
                      checked
                        ? 'border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.06)]'
                        : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-border-strong))]',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCriterion(id)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150',
                        checked
                          ? 'border-[rgb(16_185_129)] bg-[rgb(16_185_129)]'
                          : 'border-[rgb(var(--color-border-strong))]',
                      )}
                    >
                      {checked && <Check className="size-3 text-white" aria-hidden="true" />}
                    </div>
                    <span
                      className={cn(
                        'text-[13px] leading-relaxed',
                        checked
                          ? 'text-[rgb(var(--color-text-tertiary))] line-through'
                          : 'text-[rgb(var(--color-text-secondary))]',
                      )}
                    >
                      {item}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── Hints ─────────────────────────────────────────────────── */}
      {challenge.hints.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
            Hints
          </h2>
          <div className="space-y-2">
            {challenge.hints.map((hint, i) => (
              <Expandable key={i} title={`Hint ${i + 1}`}>
                <p className="text-[13px] text-[rgb(var(--color-text-secondary))]">{hint}</p>
              </Expandable>
            ))}
          </div>
        </div>
      )}

      {/* ── Bonus ─────────────────────────────────────────────────── */}
      {challenge.bonus && (
        <div className="mb-8 rounded-2xl border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.05)] p-6">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="size-4 text-[rgb(245_158_11)]" aria-hidden="true" />
            <h3 className="text-[15px] font-semibold text-[rgb(var(--color-text))]">{challenge.bonus.title}</h3>
          </div>
          <p className="mb-4 text-[13px] text-[rgb(var(--color-text-secondary))]">{challenge.bonus.description}</p>
          <ul className="space-y-1.5">
            {challenge.bonus.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[rgb(var(--color-text-secondary))]">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(245_158_11)]" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Debugging Scenarios ────────────────────────────────────── */}
      {challenge.debuggingScenarios.length > 0 && (
        <div>
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))]">
            Debugging Scenarios
          </h2>
          <div className="space-y-2">
            {challenge.debuggingScenarios.map((scenario) => (
              <Expandable key={scenario.id} title={scenario.title}>
                <div className="space-y-3">
                  {[
                    { label: 'Symptom', value: scenario.symptom, color: 'text-[rgb(var(--color-warning-text))]' },
                    { label: 'Cause', value: scenario.cause, color: 'text-[rgb(var(--color-danger-text))]' },
                    { label: 'Fix', value: scenario.fix, color: 'text-[rgb(16_185_129)]' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Bug className={cn('mt-0.5 size-4 shrink-0', color)} aria-hidden="true" />
                      <div>
                        <span className={cn('text-[11px] font-semibold uppercase tracking-widest', color)}>{label}</span>
                        <p className="mt-0.5 text-[13px] text-[rgb(var(--color-text-secondary))]">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Expandable>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
