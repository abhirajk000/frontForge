import { z } from 'zod';

export const navigationSchema = z.object({
  id: z.string(),
  sections: z.array(
    z.object({
      title: z.string().optional(),
      items: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          href: z.string(),
          icon: z.string(),
        }),
      ),
    }),
  ),
});

export type NavigationConfig = z.infer<typeof navigationSchema>;
