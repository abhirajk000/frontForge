import type { LucideIcon } from 'lucide-react';
import {
  Target,
  BookOpen,
  Hammer,
  BrainCircuit,
  Zap,
  TrendingUp,
  Trophy,
  FileText,
  Package,
  Settings2,
  Map,
  FolderGit2,
  StickyNote,
  Bookmark,
  Library,
  LineChart,
  Settings,
  Flame,
  ListChecks,
  LayoutDashboard,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  /* Mission Control nav */
  Target,
  BookOpen,
  Hammer,
  BrainCircuit,
  Zap,
  TrendingUp,
  Trophy,
  FileText,
  Package,
  Settings2,
  /* Legacy / content */
  Map,
  FolderGit2,
  StickyNote,
  Bookmark,
  Library,
  LineChart,
  Settings,
  Flame,
  ListChecks,
  LayoutDashboard,
};

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? BookOpen;
}
