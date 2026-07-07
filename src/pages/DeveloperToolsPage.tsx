import { Link } from 'react-router-dom';
import { Wrench, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/molecules';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { useAppSelector } from '@/hooks/redux';
import { ROUTES } from '@/constants/routes';
import { listDayIds, getMeta } from '@/repositories/content.repository';
import { roadmapConfig } from '@/repositories/config.repository';

export default function DeveloperToolsPage() {
  const isDeveloperModeEnabled = useAppSelector(
    (state) => state.settings.isDeveloperModeEnabled,
  );

  if (!isDeveloperModeEnabled) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <EmptyState
          icon={Wrench}
          title="Developer mode is off"
          description="Enable Developer mode in Settings to access this panel."
        />
        <Link
          to={ROUTES.settings}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Go to Settings
        </Link>
      </div>
    );
  }

  const loadedDays = listDayIds();
  const allRoadmapDays = roadmapConfig.weeks.flatMap((w) => w.days);
  const missingDays = allRoadmapDays.filter((d) => !loadedDays.includes(d.dayId));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Developer Tools"
        description="Inspect the content pipeline — loaded days, missing curriculum, and validation status."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-text-tertiary">Loaded days</p>
          <p className="mt-1 text-2xl font-semibold text-text">{loadedDays.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-tertiary">Curriculum total</p>
          <p className="mt-1 text-2xl font-semibold text-text">{allRoadmapDays.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-tertiary">Missing days</p>
          <p className="mt-1 text-2xl font-semibold text-text">{missingDays.length}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="mb-3 font-semibold text-text">Loaded content</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Run <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-xs">npm run validate:content</code> to validate all JSON against Zod schemas.
        </p>
        <ul className="space-y-2">
          {loadedDays.map((dayId) => {
            const meta = getMeta(dayId);
            return (
              <li
                key={dayId}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="font-medium text-text">
                  {dayId} — {meta.title}
                </span>
                <Badge variant="success">
                  <CheckCircle2 className="size-3" />
                  7 files
                </Badge>
              </li>
            );
          })}
        </ul>
      </Card>

      {missingDays.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-text">Missing from content/</h2>
          <ul className="space-y-2">
            {missingDays.map((day) => (
              <li
                key={day.dayId}
                className="flex items-center justify-between rounded-md border border-dashed border-border px-3 py-2 text-sm"
              >
                <span className="text-text-secondary">
                  {day.dayId} — Day {day.day}: {day.title}
                </span>
                <Badge variant="neutral">
                  <XCircle className="size-3" />
                  Missing
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
