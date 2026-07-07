import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import type { Meta } from '@/content-engine/schemas/meta.schema';
import { ROUTES } from '@/constants/routes';
import { getDayStatus, type DayStatus } from '@/utils/day-progress';
import { useAppSelector } from '@/hooks/redux';
import { cn } from '@/utils/cn';

const STATUS_CONFIG: Record<
  DayStatus,
  { label: string; variant: 'neutral' | 'accent' | 'success' | 'warning'; icon: typeof PlayCircle }
> = {
  locked: { label: 'Coming soon', variant: 'neutral', icon: Lock },
  available: { label: 'Ready', variant: 'accent', icon: PlayCircle },
  'in-progress': { label: 'In progress', variant: 'warning', icon: PlayCircle },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
};

export interface DayCardProps {
  meta: Meta;
}

export function DayCard({ meta }: DayCardProps) {
  const progress = useAppSelector((s) => s.progress);
  const status = getDayStatus(meta.id, progress);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const isLocked = status === 'locked';

  return (
    <Card className={cn('flex flex-col gap-4', isLocked && 'opacity-70')}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
            Day {meta.day} · Week {meta.week}
          </p>
          <h3 className="text-base font-semibold text-text">{meta.title}</h3>
          {meta.subtitle && (
            <p className="text-sm text-text-secondary line-clamp-2">{meta.subtitle}</p>
          )}
        </div>
        <Badge variant={config.variant}>
          <StatusIcon className="size-3" aria-hidden="true" />
          {config.label}
        </Badge>
      </div>

      <p className="text-sm text-text-secondary line-clamp-2">{meta.mission}</p>

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">{meta.readingTimeMinutes} min</Badge>
        <Badge variant="neutral" className="capitalize">
          {meta.difficulty}
        </Badge>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {isLocked ? (
          <Button variant="secondary" size="sm" disabled>
            Coming soon
          </Button>
        ) : (
          <>
            <Link to={ROUTES.lesson(meta.id)}>
              <Button variant="primary" size="sm">
                {status === 'completed' ? 'Review lesson' : 'Start lesson'}
              </Button>
            </Link>
            <Link to={ROUTES.quiz(meta.id)}>
              <Button variant="ghost" size="sm">
                Quiz
              </Button>
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}
