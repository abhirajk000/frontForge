import { z } from 'zod';

export const reflectionSchema = z.object({
  id: z.string(),
  metaId: z.string(),
  title: z.string(),
  description: z.string(),
  prompts: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      guidance: z.string().optional(),
      minWords: z.number().int().positive().optional(),
    }),
  ),
});

export type Reflection = z.infer<typeof reflectionSchema>;
