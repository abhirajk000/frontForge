import { z } from 'zod';

export const dashboardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  widgets: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['stat', 'action', 'progress', 'streak']),
      label: z.string(),
      description: z.string().optional(),
      href: z.string().optional(),
      icon: z.string().optional(),
    }),
  ),
  quickActions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      href: z.string(),
      icon: z.string(),
    }),
  ),
});

export type DashboardConfig = z.infer<typeof dashboardSchema>;
