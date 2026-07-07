import type { ProgressState } from '@/stores/slices/progress.slice';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: (progress: ProgressState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson.',
    icon: 'BookOpen',
    unlocked: (p) => p.completedLessons.length >= 1,
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Pass your first quiz.',
    icon: 'ListChecks',
    unlocked: (p) => p.completedQuizzes.length >= 1,
  },
  {
    id: 'builder',
    title: 'Builder',
    description: 'Complete your first challenge.',
    icon: 'Zap',
    unlocked: (p) => p.completedChallenges.length >= 1,
  },
  {
    id: 'streak-3',
    title: 'On Fire',
    description: 'Maintain a 3-day learning streak.',
    icon: 'Flame',
    unlocked: (p) => p.streak >= 3,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak.',
    icon: 'Flame',
    unlocked: (p) => p.streak >= 7,
  },
  {
    id: 'xp-500',
    title: 'Rising Star',
    description: 'Earn 500 XP.',
    icon: 'Trophy',
    unlocked: (p) => p.xp >= 500,
  },
  {
    id: 'xp-1000',
    title: 'Dedicated Learner',
    description: 'Earn 1,000 XP.',
    icon: 'Trophy',
    unlocked: (p) => p.xp >= 1000,
  },
  {
    id: 'week1-complete',
    title: 'Week 1 Graduate',
    description: 'Complete all available Week 1 days.',
    icon: 'Map',
    unlocked: (p) =>
      ['day01', 'day02', 'day03', 'day04', 'day05', 'day06', 'day07'].every(
        (id) =>
          p.completedLessons.includes(id) &&
          p.completedQuizzes.includes(id) &&
          p.completedChallenges.includes(id),
      ),
  },
];
