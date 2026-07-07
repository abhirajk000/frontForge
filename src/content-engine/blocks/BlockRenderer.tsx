import { Link } from 'react-router-dom';
import type { LessonBlock } from '@/content-engine/schemas/lesson.schema';
import { Accordion, AccordionItem } from '@/components/molecules/Accordion';
import { Tabs, TabList, Tab, TabPanel } from '@/components/molecules/Tabs';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import {
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Copy,
  ArrowRight,
  HelpCircle,
  Hammer,
  MessageCircle,
  PenLine,
  Lightbulb,
} from 'lucide-react';
import { useState } from 'react';

const HEADING_STYLES = {
  2: 'mt-10 mb-4 first:mt-0',
  3: 'mt-7 mb-3',
  4: 'mt-5 mb-2',
} as const;

function BlockHeading({ block }: { block: Extract<LessonBlock, { type: 'heading' }> }) {
  if (block.level === 2) {
    return (
      <div className={HEADING_STYLES[2]}>
        <div className="flex items-center gap-3">
          <span className="h-5 w-0.5 shrink-0 rounded-r-full bg-accent" aria-hidden="true" />
          <h2
            id={block.id}
            className="text-[1.0625rem] font-bold tracking-tight text-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {block.text}
          </h2>
        </div>
        <div className="ml-[11px] mt-2.5 h-px bg-border" />
      </div>
    );
  }
  if (block.level === 3) {
    return (
      <h3
        id={block.id}
        className={cn(HEADING_STYLES[3], 'text-[15px] font-semibold text-text')}
      >
        {block.text}
      </h3>
    );
  }
  return (
    <h4
      id={block.id}
      className={cn(
        HEADING_STYLES[4],
        'text-[13px] font-semibold uppercase tracking-wide text-text-tertiary',
      )}
    >
      {block.text}
    </h4>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-text-tertiary transition-all hover:bg-surface-hover hover:text-text-secondary"
      aria-label="Copy code"
    >
      <Copy className="size-3" aria-hidden="true" />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function BlockCode({ block }: { block: Extract<LessonBlock, { type: 'code' }> }) {
  return (
    <div className="lesson-code-block my-5 overflow-hidden rounded-xl border border-border bg-bg-subtle shadow-[var(--shadow-low)]">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-danger/40" />
          <span className="size-2.5 rounded-full bg-warning/40" />
          <span className="size-2.5 rounded-full bg-success/40" />
        </div>
        {block.filename ? (
          <span className="flex-1 truncate font-mono text-[11px] text-text-secondary">
            {block.filename}
          </span>
        ) : (
          <span className="flex-1 font-mono text-[11px] text-text-tertiary">{block.language}</span>
        )}
        <CopyButton code={block.code} />
      </div>

      <pre className="overflow-x-auto p-5 text-[12.5px] leading-[1.75]">
        <code className={`language-${block.language} font-mono text-text`}>{block.code}</code>
      </pre>
    </div>
  );
}

type CalloutVariant = 'info' | 'success' | 'warning' | 'danger';

const CALLOUT_CONFIG: Record<
  CalloutVariant,
  { icon: typeof Info; iconClass: string; bg: string; border: string; title: string }
> = {
  info: {
    icon: Info,
    iconClass: 'text-accent',
    bg: 'bg-info-subtle',
    border: 'border-accent/20',
    title: 'Note',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-success',
    bg: 'bg-success-subtle',
    border: 'border-success/20',
    title: 'Tip',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-warning',
    bg: 'bg-warning-subtle',
    border: 'border-warning/20',
    title: 'Warning',
  },
  danger: {
    icon: AlertCircle,
    iconClass: 'text-danger',
    bg: 'bg-danger-subtle',
    border: 'border-danger/20',
    title: 'Danger',
  },
};

function Callout({
  variant,
  title,
  content,
}: {
  variant: CalloutVariant;
  title?: string;
  content: string;
}) {
  const cfg = CALLOUT_CONFIG[variant];
  const Icon = cfg.icon;
  return (
    <div className={cn('my-4 flex gap-3 rounded-xl border p-4', cfg.bg, cfg.border)}>
      <Icon className={cn('mt-0.5 size-4 shrink-0', cfg.iconClass)} aria-hidden="true" />
      <div className="min-w-0">
        {title && (
          <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
            {title ?? cfg.title}
          </p>
        )}
        <p className="text-[13px] leading-relaxed text-text-secondary">{content}</p>
      </div>
    </div>
  );
}

function BlockChecklist({
  block,
}: {
  block: Extract<LessonBlock, { type: 'checklist' }>;
}) {
  return (
    <div className="my-5 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-low)]">
      {block.title && (
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="size-3.5 text-warning" aria-hidden="true" />
          <h4 className="text-[13px] font-semibold text-text">{block.title}</h4>
        </div>
      )}
      <ul className="space-y-2.5">
        {block.items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold transition-colors',
                item.checked
                  ? 'border-success/50 bg-success-subtle text-success-text'
                  : 'border-border bg-bg-subtle text-text-tertiary',
              )}
              aria-hidden="true"
            >
              {item.checked ? '✓' : ''}
            </span>
            <span
              className={cn(
                'text-[13px] leading-snug',
                item.checked ? 'text-text-tertiary line-through' : 'text-text-secondary',
              )}
            >
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuizReference({ dayId, label }: { dayId?: string; label?: string }) {
  if (!dayId) return null;
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-accent/25 bg-accent-subtle p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <HelpCircle className="size-4 text-accent" aria-hidden="true" />
            <p className="text-[13px] font-semibold text-text">Knowledge Checkpoint</p>
          </div>
          <p className="text-[12px] text-text-secondary">
            {label ?? 'Test your understanding with 10 focused questions.'}
          </p>
        </div>
        <Link
          to={ROUTES.quiz(dayId)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[12px] font-semibold text-text-inverse shadow-[var(--shadow-low)] transition-all hover:bg-accent-hover"
        >
          Start Quiz
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function ChallengeReference({ dayId, label }: { dayId?: string; label?: string }) {
  if (!dayId) return null;
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-purple/25 bg-purple-subtle p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Hammer className="size-4 text-purple" aria-hidden="true" />
            <p className="text-[13px] font-semibold text-text">Build Challenge</p>
          </div>
          <p className="text-[12px] text-text-secondary">
            {label ?? "Apply everything you've learned. Ship something real."}
          </p>
        </div>
        <Link
          to={ROUTES.challenge(dayId)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-purple px-4 py-2 text-[12px] font-semibold text-text-inverse shadow-[var(--shadow-low)] transition-all hover:bg-purple-hover"
        >
          Open Challenge
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function InterviewReference({ dayId, label }: { dayId?: string; label?: string }) {
  if (!dayId) return null;
  return (
    <div className="my-6 rounded-xl border border-success/20 bg-success-subtle p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <MessageCircle className="size-4 text-success" aria-hidden="true" />
            <p className="text-[13px] font-semibold text-text">Interview Prep</p>
          </div>
          <p className="text-[12px] text-text-secondary">
            {label ?? 'Practice the technical questions interviewers actually ask.'}
          </p>
        </div>
        <Link
          to={ROUTES.interview(dayId)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-success/30 bg-surface px-4 py-2 text-[12px] font-semibold text-success-text transition-all hover:bg-surface-hover"
        >
          Interview Prep
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function ReflectionBlock({ label }: { label?: string }) {
  return (
    <div className="my-6 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-low)]">
      <div className="mb-3 flex items-center gap-2">
        <PenLine className="size-4 text-text-tertiary" aria-hidden="true" />
        <p className="text-[13px] font-semibold text-text">Reflection</p>
      </div>
      <p className="text-[12px] text-text-secondary">
        {label ?? 'What surprised you today? What clicked? Write it down.'}
      </p>
    </div>
  );
}

export interface BlockRendererProps {
  blocks: LessonBlock[];
  dayId?: string;
}

export function BlockRenderer({ blocks, dayId }: BlockRendererProps) {
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => (
        <BlockNode key={`${block.type}-${index}`} block={block} dayId={dayId} />
      ))}
    </div>
  );
}

function BlockNode({ block, dayId }: { block: LessonBlock; dayId?: string }) {
  switch (block.type) {
    case 'heading':
      return <BlockHeading block={block} />;

    case 'paragraph':
      return <p className="text-[14px] leading-[1.8] text-text-secondary">{block.content}</p>;

    case 'code':
      return <BlockCode block={block} />;

    case 'tip':
      return <Callout variant="success" title={block.title ?? 'Tip'} content={block.content} />;

    case 'warning':
      return <Callout variant="warning" title={block.title ?? 'Warning'} content={block.content} />;

    case 'note':
      return <Callout variant="info" title={block.title ?? 'Note'} content={block.content} />;

    case 'quote':
      return (
        <blockquote className="my-5 border-l-2 border-accent pl-5 italic">
          <p className="text-[14px] leading-relaxed text-text-secondary">{block.content}</p>
          {block.attribution && (
            <footer className="mt-2 text-[12px] not-italic text-text-tertiary">
              — {block.attribution}
            </footer>
          )}
        </blockquote>
      );

    case 'callout': {
      const v: CalloutVariant = block.variant;
      return <Callout variant={v} title={block.title} content={block.content} />;
    }

    case 'checklist':
      return <BlockChecklist block={block} />;

    case 'divider':
      return <hr className="my-8 border-0 border-t border-border" />;

    case 'table':
      return (
        <div className="my-5 overflow-x-auto rounded-xl border border-border shadow-[var(--shadow-low)]">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-border bg-bg-subtle">
              <tr>
                {block.headers.map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold text-text">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-surface">
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-border hover:bg-surface-hover">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2.5 text-text-secondary">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'accordion':
      return (
        <div className="my-5">
          <Accordion>
            {block.items.map((item) => (
              <AccordionItem key={item.id} value={item.id} title={item.title}>
                <BlockRenderer blocks={item.blocks} dayId={dayId} />
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );

    case 'tabs':
      return (
        <div className="my-5">
          <Tabs defaultValue={block.items[0]?.id ?? 'tab-0'}>
            <TabList aria-label="Lesson sections">
              {block.items.map((item) => (
                <Tab key={item.id} value={item.id}>
                  {item.label}
                </Tab>
              ))}
            </TabList>
            {block.items.map((item) => (
              <TabPanel key={item.id} value={item.id}>
                <BlockRenderer blocks={item.blocks} dayId={dayId} />
              </TabPanel>
            ))}
          </Tabs>
        </div>
      );

    case 'quiz-reference':
      return <QuizReference dayId={dayId} label={block.label} />;

    case 'interview-reference':
      return <InterviewReference dayId={dayId} label={block.label} />;

    case 'challenge':
      return <ChallengeReference dayId={dayId} label={block.label} />;

    case 'reflection':
      return <ReflectionBlock label={block.label} />;

    default:
      return null;
  }
}
