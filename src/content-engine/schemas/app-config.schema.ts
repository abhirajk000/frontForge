import { z } from 'zod';

export const appConfigSchema = z.object({
  id: z.string(),
  version: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  track: z.string(),
  totalDays: z.number().int().positive(),
  weeks: z.number().int().positive(),
});

export type AppConfig = z.infer<typeof appConfigSchema>;
