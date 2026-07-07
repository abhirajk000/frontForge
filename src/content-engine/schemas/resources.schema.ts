import { z } from 'zod';

export const resourcesSchema = z.object({
  id: z.string(),
  metaId: z.string(),
  title: z.string(),
  description: z.string(),
  resources: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.string().url(),
      type: z.enum(['documentation', 'article', 'video', 'tool', 'reference']),
      description: z.string(),
      recommended: z.boolean().optional(),
    }),
  ),
});

export type Resources = z.infer<typeof resourcesSchema>;
