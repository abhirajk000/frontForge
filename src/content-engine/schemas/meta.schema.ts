import { z } from 'zod';

export const metaSchema = z.object({
  id: z.string(),
  version: z.string(),
  day: z.number().int().positive(),
  week: z.number().int().positive(),
  track: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  mission: z.string(),
  readingTimeMinutes: z.number().int().positive(),
  estimatedBuildHours: z.number().positive(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.array(z.string()),
  topics: z.object({
    javascript: z.array(z.string()),
    typescript: z.array(z.string()),
    react: z.array(z.string()),
  }),
  prerequisites: z.array(z.string()),
  expectedOutcome: z.array(z.string()),
  definitionOfDone: z.array(z.string()),
  tomorrowPreview: z
    .object({
      day: z.number().int().positive(),
      title: z.string(),
      summary: z.string(),
    })
    .optional(),
});

export type Meta = z.infer<typeof metaSchema>;
