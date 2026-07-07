import { useMemo } from 'react';
import {
  getDayBundle,
  getMeta,
  hasDay,
  listMetas,
  normalizeDayParam,
  type DayBundle,
} from '@/repositories/content.repository';
import type { Meta } from '@/content-engine/schemas/meta.schema';

export function useDayCatalog(): Meta[] {
  return useMemo(() => listMetas(), []);
}

export function useDayBundle(dayParam: string): DayBundle | null {
  return useMemo(() => {
    const dayId = normalizeDayParam(dayParam);
    if (!hasDay(dayId)) return null;
    return getDayBundle(dayId);
  }, [dayParam]);
}

export function useDayMeta(dayParam: string): Meta | null {
  return useMemo(() => {
    const dayId = normalizeDayParam(dayParam);
    if (!hasDay(dayId)) return null;
    return getMeta(dayId);
  }, [dayParam]);
}
