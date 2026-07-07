import { z } from 'zod';

export const challengeSchema = z.object({
  id: z.string(),
  metaId: z.string(),
  title: z.string(),
  mission: z.string(),
  description: z.string(),
  estimatedMinutes: z.number().int().positive(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  requirements: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()),
  hints: z.array(z.string()),
  bonus: z
    .object({
      title: z.string(),
      description: z.string(),
      requirements: z.array(z.string()),
    })
    .optional(),
  debuggingScenarios: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      symptom: z.string(),
      cause: z.string(),
      fix: z.string(),
    }),
  ),
});

export type Challenge = z.infer<typeof challengeSchema>;
