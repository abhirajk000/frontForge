import { metaSchema, type Meta } from '@/content-engine/schemas/meta.schema';
import { lessonSchema, type Lesson } from '@/content-engine/schemas/lesson.schema';
import { quizSchema, type Quiz } from '@/content-engine/schemas/quiz.schema';
import { challengeSchema, type Challenge } from '@/content-engine/schemas/challenge.schema';
import { interviewSchema, type Interview } from '@/content-engine/schemas/interview.schema';
import { reflectionSchema, type Reflection } from '@/content-engine/schemas/reflection.schema';
import { resourcesSchema, type Resources } from '@/content-engine/schemas/resources.schema';

export type DayContentType =
  | 'meta'
  | 'lesson'
  | 'quiz'
  | 'challenge'
  | 'interview'
  | 'reflection'
  | 'resources';

export interface DayBundle {
  dayId: string;
  meta: Meta;
  lesson: Lesson;
  quiz: Quiz;
  challenge: Challenge;
  interview: Interview;
  reflection: Reflection;
  resources: Resources;
}

const metaModules = import.meta.glob('../../content/day*/meta.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const lessonModules = import.meta.glob('../../content/day*/lesson.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const quizModules = import.meta.glob('../../content/day*/quiz.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const challengeModules = import.meta.glob('../../content/day*/challenge.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const interviewModules = import.meta.glob('../../content/day*/interview.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const reflectionModules = import.meta.glob('../../content/day*/reflection.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const resourcesModules = import.meta.glob('../../content/day*/resources.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

function extractDayId(path: string): string {
  const match = path.match(/day\d+/);
  return match?.[0] ?? path;
}

function parseModule<T>(
  raw: unknown,
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false } },
  path: string,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid content at ${path}`);
  }
  return result.data;
}

const dayIds = [
  ...new Set(Object.keys(metaModules).map(extractDayId)),
].sort((a, b) => {
  const na = Number.parseInt(a.replace('day', ''), 10);
  const nb = Number.parseInt(b.replace('day', ''), 10);
  return na - nb;
});

const metaCache = new Map<string, Meta>();
const bundleCache = new Map<string, DayBundle>();

function getModulePath(dayId: string, file: string): string {
  return `../../content/${dayId}/${file}`;
}

export function listDayIds(): string[] {
  return dayIds;
}

export function listMetas(): Meta[] {
  return dayIds.map((id) => getMeta(id));
}

export function getMeta(dayId: string): Meta {
  const cached = metaCache.get(dayId);
  if (cached) return cached;

  const path = getModulePath(dayId, 'meta.json');
  const raw = metaModules[path];
  if (!raw) {
    throw new Error(`Missing meta for ${dayId}`);
  }
  const meta = parseModule(raw, metaSchema, path);
  metaCache.set(dayId, meta);
  return meta;
}

export function hasDay(dayId: string): boolean {
  return dayIds.includes(dayId);
}

export function getDayBundle(dayId: string): DayBundle {
  const cached = bundleCache.get(dayId);
  if (cached) return cached;

  const bundle: DayBundle = {
    dayId,
    meta: getMeta(dayId),
    lesson: parseModule(
      lessonModules[getModulePath(dayId, 'lesson.json')],
      lessonSchema,
      getModulePath(dayId, 'lesson.json'),
    ),
    quiz: parseModule(
      quizModules[getModulePath(dayId, 'quiz.json')],
      quizSchema,
      getModulePath(dayId, 'quiz.json'),
    ),
    challenge: parseModule(
      challengeModules[getModulePath(dayId, 'challenge.json')],
      challengeSchema,
      getModulePath(dayId, 'challenge.json'),
    ),
    interview: parseModule(
      interviewModules[getModulePath(dayId, 'interview.json')],
      interviewSchema,
      getModulePath(dayId, 'interview.json'),
    ),
    reflection: parseModule(
      reflectionModules[getModulePath(dayId, 'reflection.json')],
      reflectionSchema,
      getModulePath(dayId, 'reflection.json'),
    ),
    resources: parseModule(
      resourcesModules[getModulePath(dayId, 'resources.json')],
      resourcesSchema,
      getModulePath(dayId, 'resources.json'),
    ),
  };

  bundleCache.set(dayId, bundle);
  return bundle;
}

export function normalizeDayParam(param: string): string {
  const trimmed = param.trim().toLowerCase();
  if (trimmed.startsWith('day')) return trimmed;
  const num = Number.parseInt(trimmed, 10);
  if (!Number.isNaN(num)) return `day${String(num).padStart(2, '0')}`;
  return trimmed;
}
