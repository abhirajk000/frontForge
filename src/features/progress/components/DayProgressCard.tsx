import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Lock, Calendar } from 'lucide-react';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { ProgressBar } from '@/components/molecules/ProgressBar';
import { DAY_SECTIONS } from '@/constants/day-sections';
import type { DaySectionKey } from '@/constants/day-sections';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { toggleSection } from '@/stores/slices/progress.slice';
import { hasDay } from '@/repositories/content.repository';
import {
  formatProgressDate,
  formatProgressDateShort,
  getDayCompletionPercent,
  getDayStatus,
} from '@/utils/day-progress';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

export interface DayProgressCardProps {
  dayId: string;
  day: number;
  week: number;
  title: string;
  difficulty: string;
  defaultOpen?: boolean;
}

const STATUS_VARIANT = {
  locked: 'neutral',
  available: 'accent',
  'in-progress': 'warning',
  completed: 'success',
} as const;

export function DayProgressCard({
  dayId,
  day,
  week,
  title,
  difficulty,
  defaultOpen = false,
}: DayProgressCardProps) {
  const dispatch = useAppDispatch();
  const progress = useAppSelector((s) => s.progress);
  const dayProgress = progress.days[dayId];
  const [open, setOpen] = useState(defaultOpen);

  const available = hasDay(dayId);
  const status = getDayStatus(dayId, progress);
  const percent = dayProgress ? getDayCompletionPercent(dayProgress) : 0;

  const handleToggle = (section: DaySectionKey) => {
    if (!available) return;
    dispatch(toggleSection({ dayId, section }));
  };

  return (
    <Card className={cn(!available && 'opacity-60')}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 text-left"
        aria-expanded={open}
      >
        <span className="mt-0.5 text-text-tertiary">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              Day {day} · Week {week}
            </span>
            <Badge variant={STATUS_VARIANT[status]} className="capitalize">
              {!available && <Lock className="size-3" />}
              {!available ? 'Locked' : status.replace('-', ' ')}
            </Badge>
            <Badge variant="neutral" className="capitalize">
              {difficulty}
            </Badge>
          </div>

          <h3 className="mt-1 font-semibold text-text">{title}</h3>

          {dayProgress?.lastVisited && (
            <p className="mt-1 flex items-center gap-1 text-xs text-text-tertiary">
              <Calendar className="size-3" />
              Last visited {formatProgressDateShort(dayProgress.lastVisited)}
            </p>
          )}

          <ProgressBar className="mt-3" value={percent} max={100} label={`${percent}% complete`} />
        </div>
      </button>

      {open && (
        <div className="mt-4 border-t border-border pt-4">
          {!available ? (
            <p className="text-sm text-text-secondary">Content not available yet.</p>
          ) : (
            <>
              <ul className="space-y-2">
                {DAY_SECTIONS.map(({ key, label, icon: Icon, description }) => {
                  const section = dayProgress?.sections[key];
                  const checked = section?.completed ?? false;
                  const date = section?.completedAt ?? null;

                  return (
                    <li key={key}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 transition-colors',
                          checked
                            ? 'border-success/30 bg-success-subtle/30'
                            : 'border-border hover:bg-surface-hover',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggle(key)}
                          className="mt-1"
                        />
                        <Icon className="mt-0.5 size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium text-text">{label}</span>
                            <span className="text-xs text-text-tertiary">
                              {checked ? formatProgressDate(date) : description}
                            </span>
                          </div>
                          {key === 'quiz' && dayProgress?.quizScore != null && (
                            <p className="mt-0.5 text-xs text-text-secondary">
                              Score: {dayProgress.quizScore}%
                              {dayProgress.quizAttempts > 0 && ` · ${dayProgress.quizAttempts} attempt(s)`}
                            </p>
                          )}
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>

              {dayProgress?.completedAt && (
                <p className="mt-3 text-xs text-success">
                  Day completed {formatProgressDate(dayProgress.completedAt)}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={ROUTES.lesson(dayId)}
                  className="text-xs font-medium text-accent-text hover:underline"
                >
                  Open lesson
                </Link>
                <Link
                  to={ROUTES.quiz(dayId)}
                  className="text-xs font-medium text-text-secondary hover:text-text hover:underline"
                >
                  Quiz
                </Link>
                <Link
                  to={ROUTES.challenge(dayId)}
                  className="text-xs font-medium text-text-secondary hover:text-text hover:underline"
                >
                  Challenge
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
