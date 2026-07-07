import type { LucideIcon } from 'lucide-react';
import { navigationConfig } from '@/repositories/config.repository';
import { resolveIcon } from '@/utils/icons';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/** Sidebar/nav structure loaded from content/config/navigation.json. */
export const NAV_SECTIONS: NavSection[] = navigationConfig.sections.map((section) => ({
  title: section.title,
  items: section.items.map((item) => ({
    label: item.label,
    href: item.href,
    icon: resolveIcon(item.icon),
  })),
}));
