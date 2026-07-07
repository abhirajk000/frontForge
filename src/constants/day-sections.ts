import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Hammer,
  Bug,
  ListChecks,
  MessagesSquare,
  PenLine,
  FileText,
  Swords,
} from 'lucide-react';

export const DAY_SECTION_KEYS = [
  'reading',
  'build',
  'debug',
  'quiz',
  'interview',
  'reflection',
  'summary',
  'challenge',
] as const;

export type DaySectionKey = (typeof DAY_SECTION_KEYS)[number];

export interface DaySectionDef {
  key: DaySectionKey;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const DAY_SECTIONS: DaySectionDef[] = [
  { key: 'reading', label: 'Reading', icon: BookOpen, description: 'Lesson read' },
  { key: 'build', label: 'Build', icon: Hammer, description: 'Project built' },
  { key: 'debug', label: 'Debug', icon: Bug, description: 'Debugging scenarios' },
  { key: 'quiz', label: 'Quiz', icon: ListChecks, description: 'Quiz passed' },
  { key: 'interview', label: 'Interview', icon: MessagesSquare, description: 'Interview prep' },
  { key: 'reflection', label: 'Reflection', icon: PenLine, description: 'Reflection prompts' },
  { key: 'summary', label: 'Summary', icon: FileText, description: 'Day summary reviewed' },
  { key: 'challenge', label: 'Challenge', icon: Swords, description: 'Challenge complete' },
];
