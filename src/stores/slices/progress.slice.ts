import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { storageAdapter } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { DAY_SECTION_KEYS, type DaySectionKey } from '@/constants/day-sections';

export interface QuizResult {
  score: number;
  passed: boolean;
  completedAt: string;
  totalQuestions: number;
  correctCount: number;
}

export interface SectionProgress {
  completed: boolean;
  completedAt: string | null;
}

export interface DayProgress {
  lastVisited: string | null;
  completedAt: string | null;
  sections: Record<DaySectionKey, SectionProgress>;
  quizScore: number | null;
  quizAttempts: number;
  interviewScore: number | null;
  xpEarned: number;
}

export interface ProgressState {
  completedLessons: string[];
  completedQuizzes: string[];
  completedChallenges: string[];
  quizResults: Record<string, QuizResult>;
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  days: Record<string, DayProgress>;
}

function createEmptySections(): Record<DaySectionKey, SectionProgress> {
  return Object.fromEntries(
    DAY_SECTION_KEYS.map((key) => [key, { completed: false, completedAt: null }]),
  ) as Record<DaySectionKey, SectionProgress>;
}

export function createEmptyDayProgress(): DayProgress {
  return {
    lastVisited: null,
    completedAt: null,
    sections: createEmptySections(),
    quizScore: null,
    quizAttempts: 0,
    interviewScore: null,
    xpEarned: 0,
  };
}

function ensureDay(state: ProgressState, dayId: string): DayProgress {
  if (!state.days[dayId]) {
    state.days[dayId] = createEmptyDayProgress();
  }
  return state.days[dayId];
}

function seedAllDays(days: Record<string, DayProgress>): Record<string, DayProgress> {
  const result = { ...days };
  for (let i = 1; i <= 24; i++) {
    const dayId = `day${String(i).padStart(2, '0')}`;
    if (!result[dayId]) {
      result[dayId] = createEmptyDayProgress();
    }
  }
  return result;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function touchStreak(state: ProgressState) {
  const today = todayKey();
  if (state.lastActiveDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (state.lastActiveDate === yesterdayKey) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }
  state.lastActiveDate = today;
}

function isDayFullyComplete(day: DayProgress): boolean {
  return DAY_SECTION_KEYS.every((key) => day.sections[key].completed);
}

function markSectionInternal(
  state: ProgressState,
  dayId: string,
  section: DaySectionKey,
  completed: boolean,
  at?: string,
) {
  const day = ensureDay(state, dayId);
  const now = at ?? new Date().toISOString();
  const entry = day.sections[section];
  if (!entry) return;

  if (completed && !entry.completed) {
    entry.completed = true;
    entry.completedAt = now;
  } else if (!completed) {
    entry.completed = false;
    entry.completedAt = null;
  }

  day.lastVisited = now;

  if (isDayFullyComplete(day) && !day.completedAt) {
    day.completedAt = now;
  } else if (!isDayFullyComplete(day)) {
    day.completedAt = null;
  }
}

function applySectionComplete(
  state: ProgressState,
  dayId: string,
  section: DaySectionKey,
  options?: { interviewScore?: number },
) {
  const day = ensureDay(state, dayId);
  const wasComplete = day.sections[section].completed;
  markSectionInternal(state, dayId, section, true);

  if (options?.interviewScore !== undefined) {
    day.interviewScore = options.interviewScore;
  }

  if (!wasComplete) {
    if (section === 'reading' && !state.completedLessons.includes(dayId)) {
      state.completedLessons.push(dayId);
      state.xp += 50;
      day.xpEarned += 50;
    }
    if (section === 'quiz' && !state.completedQuizzes.includes(dayId)) {
      state.completedQuizzes.push(dayId);
      state.xp += 100;
      day.xpEarned += 100;
    }
    if (section === 'challenge' && !state.completedChallenges.includes(dayId)) {
      state.completedChallenges.push(dayId);
      state.xp += 150;
      day.xpEarned += 150;
      markSectionInternal(state, dayId, 'build', true);
    }
  }

  touchStreak(state);
}

function migrateLegacy(state: ProgressState): ProgressState {
  for (const dayId of state.completedLessons) {
    markSectionInternal(state, dayId, 'reading', true);
    markSectionInternal(state, dayId, 'summary', true);
  }
  for (const dayId of state.completedQuizzes) {
    markSectionInternal(state, dayId, 'quiz', true);
    const result = state.quizResults[dayId];
    if (result) {
      const day = ensureDay(state, dayId);
      day.quizScore = result.score;
      day.quizAttempts = Math.max(day.quizAttempts, 1);
    }
  }
  for (const dayId of state.completedChallenges) {
    markSectionInternal(state, dayId, 'challenge', true);
    markSectionInternal(state, dayId, 'build', true);
  }
  return state;
}

const defaultState: ProgressState = {
  completedLessons: [],
  completedQuizzes: [],
  completedChallenges: [],
  quizResults: {},
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  days: seedAllDays({}),
};

function normalizeDayProgress(raw?: Partial<DayProgress>): DayProgress {
  const base = createEmptyDayProgress();
  if (!raw) return base;

  const sections = { ...base.sections };
  for (const key of DAY_SECTION_KEYS) {
    if (raw.sections?.[key]) {
      sections[key] = {
        completed: raw.sections[key].completed ?? false,
        completedAt: raw.sections[key].completedAt ?? null,
      };
    }
  }

  return {
    ...base,
    ...raw,
    sections,
    quizScore: raw.quizScore ?? null,
    quizAttempts: raw.quizAttempts ?? 0,
    interviewScore: raw.interviewScore ?? null,
    xpEarned: raw.xpEarned ?? 0,
  };
}

function normalizeProgress(stored: Partial<ProgressState>): ProgressState {
  const days = seedAllDays({});
  if (stored.days) {
    for (const [dayId, dayData] of Object.entries(stored.days)) {
      days[dayId] = normalizeDayProgress(dayData);
    }
  }

  return {
    completedLessons: stored.completedLessons ?? [],
    completedQuizzes: stored.completedQuizzes ?? [],
    completedChallenges: stored.completedChallenges ?? [],
    quizResults: stored.quizResults ?? {},
    xp: stored.xp ?? 0,
    streak: stored.streak ?? 0,
    lastActiveDate: stored.lastActiveDate ?? null,
    days,
  };
}

function loadInitialState(): ProgressState {
  const stored = storageAdapter.get<Partial<ProgressState>>(STORAGE_KEYS.progress);
  if (!stored) return defaultState;

  return migrateLegacy(normalizeProgress(stored));
}

const initialState: ProgressState = loadInitialState();

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    touchDayVisited(state, action: PayloadAction<string>) {
      const day = ensureDay(state, action.payload);
      day.lastVisited = new Date().toISOString();
      touchStreak(state);
    },
    toggleSection(
      state,
      action: PayloadAction<{ dayId: string; section: DaySectionKey }>,
    ) {
      const { dayId, section } = action.payload;
      const day = ensureDay(state, dayId);
      const next = !day.sections[section].completed;
      markSectionInternal(state, dayId, section, next);

      if (section === 'reading' && next && !state.completedLessons.includes(dayId)) {
        state.completedLessons.push(dayId);
        state.xp += 50;
        day.xpEarned += 50;
      } else if (section === 'reading' && !next) {
        state.completedLessons = state.completedLessons.filter((id) => id !== dayId);
      }

      if (section === 'quiz' && next && !state.completedQuizzes.includes(dayId)) {
        state.completedQuizzes.push(dayId);
        state.xp += 100;
        day.xpEarned += 100;
      } else if (section === 'quiz' && !next) {
        state.completedQuizzes = state.completedQuizzes.filter((id) => id !== dayId);
      }

      if (section === 'challenge' && next && !state.completedChallenges.includes(dayId)) {
        state.completedChallenges.push(dayId);
        state.xp += 150;
        day.xpEarned += 150;
      } else if (section === 'challenge' && !next) {
        state.completedChallenges = state.completedChallenges.filter((id) => id !== dayId);
      }

      touchStreak(state);
    },
    markSectionComplete(
      state,
      action: PayloadAction<{
        dayId: string;
        section: DaySectionKey;
        interviewScore?: number;
      }>,
    ) {
      const { dayId, section, interviewScore } = action.payload;
      applySectionComplete(state, dayId, section, { interviewScore });
    },
    markLessonComplete(state, action: PayloadAction<string>) {
      const dayId = action.payload;
      applySectionComplete(state, dayId, 'reading');
      markSectionInternal(state, dayId, 'summary', true);
    },
    markQuizComplete(state, action: PayloadAction<{ dayId: string; result: QuizResult }>) {
      const { dayId, result } = action.payload;
      const day = ensureDay(state, dayId);
      state.quizResults[dayId] = result;
      day.quizScore = result.score;
      day.quizAttempts += 1;

      if (result.passed) {
        applySectionComplete(state, dayId, 'quiz');
      } else {
        touchStreak(state);
      }
    },
    markChallengeComplete(state, action: PayloadAction<string>) {
      applySectionComplete(state, action.payload, 'challenge');
    },
    markInterviewComplete(state, action: PayloadAction<string>) {
      applySectionComplete(state, action.payload, 'interview', { interviewScore: 100 });
    },
    resetProgress() {
      return defaultState;
    },
  },
});

export const {
  touchDayVisited,
  toggleSection,
  markSectionComplete,
  markLessonComplete,
  markQuizComplete,
  markChallengeComplete,
  markInterviewComplete,
  resetProgress,
} = progressSlice.actions;

export const progressReducer = progressSlice.reducer;
