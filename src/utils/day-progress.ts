import { hasDay, listDayIds } from '@/repositories/content.repository';
import { DAY_SECTION_KEYS, type DaySectionKey } from '@/constants/day-sections';
import type { DayProgress, ProgressState } from '@/stores/slices/progress.slice';

export type DayStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export function getDayCompletionPercent(day: DayProgress): number {
  const done = DAY_SECTION_KEYS.filter((key) => day.sections?.[key]?.completed).length;
  return Math.round((done / DAY_SECTION_KEYS.length) * 100);
}

export function isDayFullyComplete(day: DayProgress): boolean {
  return DAY_SECTION_KEYS.every((key) => day.sections?.[key]?.completed);
}

export function getDayStatus(dayId: string, progress: ProgressState): DayStatus {
  if (!hasDay(dayId)) return 'locked';

  const day = progress.days?.[dayId];
  if (!day?.sections) return 'available';

  if (isDayFullyComplete(day)) return 'completed';

  const anyDone = DAY_SECTION_KEYS.some((key) => day.sections[key]?.completed);
  if (anyDone) return 'in-progress';

  return 'available';
}

export function getContinueDayId(progress: ProgressState): string | null {
  for (const dayId of listDayIds()) {
    if (getDayStatus(dayId, progress) !== 'completed') return dayId;
  }
  return listDayIds()[0] ?? null;
}

export function countCompletedDays(progress: ProgressState): number {
  return listDayIds().filter((id) => getDayStatus(id, progress) === 'completed').length;
}

export function countCompletedSections(progress: ProgressState, key: DaySectionKey): number {
  return listDayIds().filter((id) => progress.days?.[id]?.sections?.[key]?.completed).length;
}

export function formatProgressDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatProgressDateShort(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}
