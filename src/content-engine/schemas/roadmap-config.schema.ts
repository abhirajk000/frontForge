import { z } from 'zod';

export const roadmapConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  weeks: z.array(
    z.object({
      week: z.number().int().positive(),
      title: z.string(),
      goal: z.string(),
      days: z.array(
        z.object({
          day: z.number().int().positive(),
          dayId: z.string(),
          title: z.string(),
          mission: z.string(),
          difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
        }),
      ),
    }),
  ),
});

export type RoadmapConfig = z.infer<typeof roadmapConfigSchema>;
