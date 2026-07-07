import { z } from 'zod';

const headingBlock = z.object({
  type: z.literal('heading'),
  id: z.string().optional(),
  level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string(),
});

const paragraphBlock = z.object({
  type: z.literal('paragraph'),
  content: z.string(),
});

const codeBlock = z.object({
  type: z.literal('code'),
  language: z.string(),
  code: z.string(),
  filename: z.string().optional(),
  showLineNumbers: z.boolean().optional(),
});

const tipBlock = z.object({
  type: z.literal('tip'),
  title: z.string().optional(),
  content: z.string(),
});

const warningBlock = z.object({
  type: z.literal('warning'),
  title: z.string().optional(),
  content: z.string(),
});

const noteBlock = z.object({
  type: z.literal('note'),
  title: z.string().optional(),
  content: z.string(),
});

const quoteBlock = z.object({
  type: z.literal('quote'),
  content: z.string(),
  attribution: z.string().optional(),
});

const calloutBlock = z.object({
  type: z.literal('callout'),
  variant: z.enum(['info', 'success', 'warning', 'danger']),
  title: z.string().optional(),
  content: z.string(),
});

const checklistBlock = z.object({
  type: z.literal('checklist'),
  title: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      checked: z.boolean().optional(),
    }),
  ),
});

const dividerBlock = z.object({
  type: z.literal('divider'),
});

const tableBlock = z.object({
  type: z.literal('table'),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

const accordionItem = z.object({
  id: z.string(),
  title: z.string(),
  blocks: z.array(z.lazy(() => blockSchema)),
});

const accordionBlock = z.object({
  type: z.literal('accordion'),
  items: z.array(accordionItem),
});

const tabItem = z.object({
  id: z.string(),
  label: z.string(),
  blocks: z.array(z.lazy(() => blockSchema)),
});

const tabsBlock = z.object({
  type: z.literal('tabs'),
  items: z.array(tabItem),
});

const quizReferenceBlock = z.object({
  type: z.literal('quiz-reference'),
  label: z.string().optional(),
});

const interviewReferenceBlock = z.object({
  type: z.literal('interview-reference'),
  label: z.string().optional(),
});

const reflectionBlock = z.object({
  type: z.literal('reflection'),
  label: z.string().optional(),
});

const challengeBlock = z.object({
  type: z.literal('challenge'),
  label: z.string().optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockSchema: z.ZodType<any> = z.discriminatedUnion('type', [
  headingBlock,
  paragraphBlock,
  codeBlock,
  tipBlock,
  warningBlock,
  noteBlock,
  quoteBlock,
  calloutBlock,
  checklistBlock,
  dividerBlock,
  tableBlock,
  accordionBlock,
  tabsBlock,
  quizReferenceBlock,
  interviewReferenceBlock,
  reflectionBlock,
  challengeBlock,
]);

export const lessonSchema = z.object({
  id: z.string(),
  metaId: z.string(),
  title: z.string(),
  summary: z.string(),
  blocks: z.array(blockSchema),
});

export type Lesson = z.infer<typeof lessonSchema>;
export type LessonBlock =
  | z.infer<typeof headingBlock>
  | z.infer<typeof paragraphBlock>
  | z.infer<typeof codeBlock>
  | z.infer<typeof tipBlock>
  | z.infer<typeof warningBlock>
  | z.infer<typeof noteBlock>
  | z.infer<typeof quoteBlock>
  | z.infer<typeof calloutBlock>
  | z.infer<typeof checklistBlock>
  | z.infer<typeof dividerBlock>
  | z.infer<typeof tableBlock>
  | z.infer<typeof accordionBlock>
  | z.infer<typeof tabsBlock>
  | z.infer<typeof quizReferenceBlock>
  | z.infer<typeof interviewReferenceBlock>
  | z.infer<typeof reflectionBlock>
  | z.infer<typeof challengeBlock>;
