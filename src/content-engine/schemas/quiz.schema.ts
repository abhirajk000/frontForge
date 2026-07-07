import { z } from 'zod';

const baseQuestion = z.object({
  id: z.string(),
  prompt: z.string(),
  explanation: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()),
});

const singleChoiceQuestion = baseQuestion.extend({
  type: z.literal('single-choice'),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
  correctOptionId: z.string(),
});

const multipleChoiceQuestion = baseQuestion.extend({
  type: z.literal('multiple-choice'),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
  correctOptionIds: z.array(z.string()),
});

const trueFalseQuestion = baseQuestion.extend({
  type: z.literal('true-false'),
  correctAnswer: z.boolean(),
});

const fillBlankQuestion = baseQuestion.extend({
  type: z.literal('fill-blank'),
  blanks: z.array(
    z.object({
      id: z.string(),
      acceptedAnswers: z.array(z.string()),
    }),
  ),
});

const codeOutputQuestion = baseQuestion.extend({
  type: z.literal('code-output'),
  code: z.string(),
  language: z.string(),
  correctOutput: z.string(),
});

const codeCompletionQuestion = baseQuestion.extend({
  type: z.literal('code-completion'),
  code: z.string(),
  language: z.string(),
  blanks: z.array(
    z.object({
      id: z.string(),
      acceptedAnswers: z.array(z.string()),
    }),
  ),
});

const shortAnswerQuestion = baseQuestion.extend({
  type: z.literal('short-answer'),
  acceptedKeywords: z.array(z.string()).optional(),
  sampleAnswer: z.string(),
});

export const questionSchema = z.discriminatedUnion('type', [
  singleChoiceQuestion,
  multipleChoiceQuestion,
  trueFalseQuestion,
  fillBlankQuestion,
  codeOutputQuestion,
  codeCompletionQuestion,
  shortAnswerQuestion,
]);

export const quizSchema = z.object({
  id: z.string(),
  metaId: z.string(),
  title: z.string(),
  description: z.string(),
  passingScorePercent: z.number().int().min(0).max(100),
  retryAllowed: z.boolean(),
  showExplanations: z.boolean(),
  questions: z.array(questionSchema),
});

export type Quiz = z.infer<typeof quizSchema>;
