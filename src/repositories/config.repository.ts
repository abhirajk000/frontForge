import { appConfigSchema, type AppConfig } from '@/content-engine/schemas/app-config.schema';
import {
  navigationSchema,
  type NavigationConfig,
} from '@/content-engine/schemas/navigation.schema';
import { dashboardSchema, type DashboardConfig } from '@/content-engine/schemas/dashboard.schema';
import {
  roadmapConfigSchema,
  type RoadmapConfig,
} from '@/content-engine/schemas/roadmap-config.schema';

function load<T>(
  raw: unknown,
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false } },
  name: string,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid config: ${name}`);
  }
  return result.data;
}

import appConfigRaw from '../../content/config/app-config.json';
import navigationRaw from '../../content/config/navigation.json';
import dashboardRaw from '../../content/config/dashboard.json';
import roadmapRaw from '../../content/config/roadmap.json';

export const appConfig = load(appConfigRaw, appConfigSchema, 'app-config');
export const navigationConfig = load(navigationRaw, navigationSchema, 'navigation');
export const dashboardConfig = load(dashboardRaw, dashboardSchema, 'dashboard');
export const roadmapConfig = load(roadmapRaw, roadmapConfigSchema, 'roadmap');

export type { AppConfig, NavigationConfig, DashboardConfig, RoadmapConfig };
