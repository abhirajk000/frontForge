import { z } from 'zod';

const interviewQuestion = z.object({
  id: z.string(),
  question: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'senior']),
  category: z.enum(['javascript', 'typescript', 'react', 'architecture', 'scenario']),
  whatInterviewerTests: z.string(),
  keyPoints: z.array(z.string()),
  sampleAnswer: z.string(),
  followUps: z.array(z.string()).optional(),
  redFlags: z.array(z.string()).optional(),
});

export const interviewSchema = z.object({
  id: z.string(),
  metaId: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.array(interviewQuestion),
});

export type Interview = z.infer<typeof interviewSchema>;
