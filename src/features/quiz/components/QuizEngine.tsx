import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
  Target,
  Code2,
  Clock,
  SkipForward,
} from 'lucide-react';
import type { Quiz } from '@/content-engine/schemas/quiz.schema';
import { questionSchema } from '@/content-engine/schemas/quiz.schema';
import type { z } from 'zod';

type Question = z.infer<typeof questionSchema>;

export interface QuizEngineProps {
  quiz: Quiz;
  onComplete: (result: {
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  }) => void;
}

type Answers = Record<string, string | string[] | boolean>;

const TIMER_SECONDS = 30;

function isCorrect(question: Question, answer: Answers[string]): boolean {
  switch (question.type) {
    case 'single-choice':
      return answer === question.correctOptionId;
    case 'multiple-choice': {
      if (!Array.isArray(answer)) return false;
      const sorted = [...answer].sort();
      const expected = [...question.correctOptionIds].sort();
      return sorted.length === expected.length && sorted.every((v, i) => v === expected[i]);
    }
    case 'true-false':
      return answer === question.correctAnswer;
    case 'fill-blank': {
      if (typeof answer !== 'string') return false;
      return question.blanks.every((blank) => {
        const val = (JSON.parse(answer) as Record<string, string>)[blank.id];
        if (!val) return false;
        return blank.acceptedAnswers.some(
          (accepted) => accepted.toLowerCase() === val.trim().toLowerCase(),
        );
      });
    }
    case 'code-output':
      return typeof answer === 'string' && answer.trim() === question.correctOutput.trim();
    case 'code-completion': {
      if (typeof answer !== 'string') return false;
      const parsed = JSON.parse(answer) as Record<string, string>;
      return question.blanks.every((blank) =>
        blank.acceptedAnswers.some(
          (accepted) => accepted.toLowerCase() === (parsed[blank.id] ?? '').trim().toLowerCase(),
        ),
      );
    }
    case 'short-answer': {
      if (typeof answer !== 'string') return false;
      const text = answer.toLowerCase();
      if (!question.acceptedKeywords?.length) return text.length > 10;
      return question.acceptedKeywords.some((kw) => text.includes(kw.toLowerCase()));
    }
    default:
      return false;
  }
}

/* ─── Difficulty colours ─────────────────────────────────────────────────── */

const DIFF_STYLES = {
  easy:   { text: 'text-[rgb(var(--color-success-text))]', bg: 'bg-[rgb(var(--color-success)/0.12)]', dot: 'bg-[rgb(var(--color-success))]' },
  medium: { text: 'text-[rgb(var(--color-warning-text))]', bg: 'bg-[rgb(var(--color-warning)/0.12)]', dot: 'bg-[rgb(var(--color-warning))]' },
  hard:   { text: 'text-[rgb(var(--color-danger-text))]',  bg: 'bg-[rgb(var(--color-danger)/0.12)]',  dot: 'bg-[rgb(var(--color-danger))]'  },
} as const;

/* ─── Motion variants ────────────────────────────────────────────────────── */

const slideIn = {
  initial: { opacity: 0, x: 32, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
  exit: { opacity: 0, x: -32, scale: 0.97, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const } },
};

/* ─── TimerRing ──────────────────────────────────────────────────────────── */

function TimerRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const r             = 16;
  const circumference = 2 * Math.PI * r;
  const progress      = Math.max(0, timeLeft) / total;
  const dashOffset    = circumference * (1 - progress);

  const ringColor =
    timeLeft <= 5  ? 'rgb(var(--color-danger))'  :
    timeLeft <= 10 ? 'rgb(var(--color-warning))' :
                     'rgb(var(--color-accent))';

  const isUrgent = timeLeft <= 5;

  return (
    <div
      className={[
        'relative flex items-center justify-center rounded-full',
        isUrgent ? 'animate-pulse' : '',
      ].join(' ')}
      title={`${timeLeft}s remaining`}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90" aria-hidden="true">
        {/* Track */}
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgb(var(--color-border))" strokeWidth="2.5" />
        {/* Progress arc */}
        <circle
          cx="20" cy="20" r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.85s linear, stroke 0.3s ease' }}
        />
      </svg>
      <span
        className="absolute text-[10px] font-bold tabular-nums leading-none"
        style={{ color: ringColor }}
      >
        {timeLeft}
      </span>
    </div>
  );
}

/* ─── ProgressRail ───────────────────────────────────────────────────────── */

function ProgressRail({
  current,
  total,
  answers,
  questions,
}: {
  current: number;
  total: number;
  answers: Answers;
  questions: Question[];
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex gap-1.5">
        {questions.map((q, i) => {
          const answered = answers[q.id] !== undefined;
          const isActive = i === current;
          return (
            <div
              key={q.id}
              className={[
                'h-1.5 flex-1 rounded-full transition-all duration-500',
                isActive
                  ? 'bg-[rgb(var(--color-accent))] shadow-[0_0_6px_rgb(var(--color-accent)/0.5)]'
                  : answered
                    ? 'bg-[rgb(var(--color-success)/0.7)]'
                    : i < current
                      ? 'bg-[rgb(var(--color-border-strong))]'
                      : 'bg-[rgb(var(--color-border))]',
              ].join(' ')}
            />
          );
        })}
      </div>
      <span className="text-[10px] text-[rgb(var(--color-text-tertiary))]">
        {current + 1} <span className="opacity-50">/ {total}</span>
      </span>
    </div>
  );
}

/* ─── QuizEngine ─────────────────────────────────────────────────────────── */

export function QuizEngine({ quiz, onComplete }: QuizEngineProps) {
  const [index, setIndex]             = useState(0);
  const [answers, setAnswers]         = useState<Answers>({});
  const [submitted, setSubmitted]     = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [direction, setDirection]     = useState<1 | -1>(1);
  const [timeLeft, setTimeLeft]       = useState(TIMER_SECONDS);
  const [attempt, setAttempt]         = useState(1);
  const timerRef                      = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = quiz.questions[index];
  const total    = quiz.questions.length;

  const scoreData = useMemo(() => {
    let correctCount = 0;
    for (const q of quiz.questions) {
      const a = answers[q.id];
      if (a !== undefined && isCorrect(q, a)) correctCount += 1;
    }
    const score = Math.round((correctCount / total) * 100);
    return { correctCount, score, passed: score >= quiz.passingScorePercent, totalQuestions: total };
  }, [answers, quiz.questions, quiz.passingScorePercent, total]);

  /* ── Timer management ───────────────────────────────────────────────── */

  // Stable ref so the timer callback can advance without stale closures
  const advanceRef = useRef<() => void>(() => {});
  advanceRef.current = () => {
    setDirection(1);
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setSubmitted(false);
    } else {
      setShowResults(true);
      onComplete(scoreData);
    }
  };

  // Start a fresh countdown every time the question changes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(TIMER_SECONDS);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pause timer when user submits an answer
  useEffect(() => {
    if (submitted && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [submitted]);

  // Auto-advance when timer hits zero (and question not yet submitted)
  useEffect(() => {
    if (timeLeft === 0 && !submitted && !showResults) {
      advanceRef.current();
    }
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Handlers ───────────────────────────────────────────────────────── */

  const setAnswer = useCallback((qId: string, value: Answers[string]) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const handleCheck = () => setSubmitted(true);

  const handleNext = () => {
    setDirection(1);
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setSubmitted(false);
    } else {
      setShowResults(true);
      onComplete(scoreData);
    }
  };

  const handleRetry = () => {
    setIndex(0);
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setAttempt((a) => a + 1);
  };

  const hasAnswer = answers[question?.id ?? ''] !== undefined;
  const correct =
    submitted && question && answers[question.id] !== undefined
      ? isCorrect(question, answers[question.id]!)
      : null;

  /* ── Results screen ─────────────────────────────────────────────────── */
  if (showResults) {
    return (
      <ResultsScreen
        scoreData={scoreData}
        quiz={quiz}
        answers={answers}
        onRetry={handleRetry}
        attempt={attempt}
      />
    );
  }

  if (!question) return null;

  const diff = DIFF_STYLES[(question.difficulty as keyof typeof DIFF_STYLES) ?? 'easy'] ?? DIFF_STYLES.easy;

  return (
    <div className="flex h-full flex-col gap-3">

      {/* ── Top strip: progress rail + attempt badge + timer ─────────────── */}
      <div className="shrink-0 flex items-center gap-3">
        <ProgressRail
          current={index}
          total={total}
          answers={answers}
          questions={quiz.questions}
        />

        {attempt > 1 && (
          <span className="shrink-0 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-2 py-0.5 text-[10px] font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">
            Attempt #{attempt}
          </span>
        )}

        <div className="shrink-0 flex items-center gap-1.5">
          <Clock className="size-3 text-[rgb(var(--color-text-tertiary))]" aria-hidden="true" />
          <TimerRing timeLeft={timeLeft} total={TIMER_SECONDS} />
        </div>
      </div>

      {/* ── Question card (fills remaining space) ────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            variants={slideIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 overflow-y-auto"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* Glow orb */}
            <div
              className={[
                'pointer-events-none fixed top-0 right-0 size-56 rounded-full blur-[80px] opacity-20 -z-10',
                correct === true  ? 'bg-[rgb(var(--color-success))]' :
                correct === false ? 'bg-[rgb(var(--color-danger))]'  :
                                    'bg-[rgb(var(--color-accent))]',
              ].join(' ')}
              aria-hidden="true"
            />

            <div
              className={[
                'relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-colors duration-500 h-full',
                correct === true
                  ? 'border-[rgb(var(--color-success)/0.4)] bg-gradient-to-br from-[rgb(var(--color-success)/0.07)] to-[rgb(var(--color-surface))]'
                  : correct === false
                    ? 'border-[rgb(var(--color-danger)/0.4)]  bg-gradient-to-br from-[rgb(var(--color-danger)/0.07)]  to-[rgb(var(--color-surface))]'
                    : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]',
              ].join(' ')}
            >
              {/* Top accent stripe */}
              <div
                className={[
                  'h-[3px] w-full shrink-0 transition-colors duration-500',
                  correct === true  ? 'bg-gradient-to-r from-[rgb(var(--color-success))] to-[rgb(var(--color-success)/0.3)]' :
                  correct === false ? 'bg-gradient-to-r from-[rgb(var(--color-danger))]  to-[rgb(var(--color-danger)/0.3)]'  :
                                      'bg-gradient-to-r from-[rgb(var(--color-accent))]  via-[rgb(var(--color-purple))] to-transparent',
                ].join(' ')}
              />

              <div className="p-5 sm:p-6 flex flex-col gap-4">
                {/* Question meta */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="label-section">Q{index + 1}</span>
                  <span className="text-[rgb(var(--color-text-tertiary))] text-[10px]">·</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${diff.bg} ${diff.text}`}
                  >
                    <span className={`size-1.5 rounded-full ${diff.dot}`} />
                    {question.difficulty}
                  </span>
                  <span className="text-[rgb(var(--color-text-tertiary))] text-[10px]">·</span>
                  <span className="label-section capitalize">{question.type.replace(/-/g, ' ')}</span>
                </div>

                {/* Prompt */}
                <p className="text-[16px] font-semibold leading-snug text-[rgb(var(--color-text))] sm:text-[17px]">
                  {question.prompt}
                </p>

                {/* Options / inputs */}
                <AnswerArea
                  question={question}
                  answer={answers[question.id]}
                  submitted={submitted}
                  onAnswer={(v) => setAnswer(question.id, v)}
                />

                {/* Feedback banner */}
                <AnimatePresence>
                  {submitted && quiz.showExplanations && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={[
                          'flex gap-3 rounded-xl p-3.5',
                          correct
                            ? 'bg-[rgb(var(--color-success)/0.1)] border border-[rgb(var(--color-success)/0.25)]'
                            : 'bg-[rgb(var(--color-danger)/0.1)]  border border-[rgb(var(--color-danger)/0.25)]',
                        ].join(' ')}
                      >
                        {correct
                          ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[rgb(var(--color-success))]" />
                          : <XCircle      className="mt-0.5 size-4 shrink-0 text-[rgb(var(--color-danger))]"  />
                        }
                        <p className="text-[12px] leading-relaxed text-[rgb(var(--color-text-secondary))]">
                          {question.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Action bar ───────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between gap-3 border-t border-[rgb(var(--color-border))] pt-3">
        {/* Skip button (only before submitting) */}
        {!submitted ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => advanceRef.current()}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium text-[rgb(var(--color-text-tertiary))] transition-colors hover:text-[rgb(var(--color-text-secondary))]"
          >
            <SkipForward className="size-3.5" />
            Skip
          </motion.button>
        ) : (
          <span />
        )}

        {!submitted ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleCheck}
            disabled={!hasAnswer}
            className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--color-accent))] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_20px_rgb(var(--color-accent)/0.3)] transition-all duration-200 hover:bg-[rgb(var(--color-accent-hover))] hover:shadow-[0_0_32px_rgb(var(--color-accent)/0.5)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <Target className="size-3.5" />
            Check Answer
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleNext}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-200',
              correct
                ? 'bg-[rgb(var(--color-success))] shadow-[0_0_20px_rgb(var(--color-success)/0.35)] hover:shadow-[0_0_32px_rgb(var(--color-success)/0.55)]'
                : 'bg-[rgb(var(--color-accent))]  shadow-[0_0_20px_rgb(var(--color-accent)/0.3)]  hover:shadow-[0_0_32px_rgb(var(--color-accent)/0.5)]',
            ].join(' ')}
          >
            {index < total - 1 ? (
              <>Next <ChevronRight className="size-4" /></>
            ) : (
              <>Finish <Sparkles className="size-4" /></>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ─── AnswerArea ─────────────────────────────────────────────────────────── */

function AnswerArea({
  question,
  answer,
  submitted,
  onAnswer,
}: {
  question: Question;
  answer: Answers[string] | undefined;
  submitted: boolean;
  onAnswer: (v: Answers[string]) => void;
}) {
  if (question.type === 'single-choice') {
    return (
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const selected = answer === opt.id;
          const isRight  = submitted && opt.id === question.correctOptionId;
          const isWrong  = submitted && selected && !isRight;

          return (
            <motion.button
              key={opt.id}
              type="button"
              disabled={submitted}
              onClick={() => onAnswer(opt.id)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
              whileHover={!submitted ? { x: 3 } : {}}
              whileTap={!submitted ? { scale: 0.98 } : {}}
              className={[
                'group relative w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all duration-200',
                isRight
                  ? 'border-[rgb(var(--color-success)/0.6)] bg-[rgb(var(--color-success)/0.12)] text-[rgb(var(--color-success-text))]'
                  : isWrong
                    ? 'border-[rgb(var(--color-danger)/0.6)]  bg-[rgb(var(--color-danger)/0.12)]  text-[rgb(var(--color-danger-text))]'
                    : selected
                      ? 'border-[rgb(var(--color-accent)/0.5)]  bg-[rgb(var(--color-accent)/0.1)]   text-[rgb(var(--color-text))]'
                      : 'border-[rgb(var(--color-border))]       bg-[rgb(var(--color-bg-subtle))]     text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface-raised))]',
                submitted ? 'cursor-default' : 'cursor-pointer',
              ].join(' ')}
            >
              <span
                className={[
                  'flex size-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase transition-colors',
                  isRight
                    ? 'bg-[rgb(var(--color-success))] text-white'
                    : isWrong
                      ? 'bg-[rgb(var(--color-danger))]  text-white'
                      : selected
                        ? 'bg-[rgb(var(--color-accent))]  text-white'
                        : 'bg-[rgb(var(--color-border))] text-[rgb(var(--color-text-tertiary))] group-hover:bg-[rgb(var(--color-border-strong))]',
                ].join(' ')}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-[13px] font-medium leading-snug">{opt.text}</span>
              {isRight && <CheckCircle2 className="size-4 shrink-0 text-[rgb(var(--color-success))]" />}
              {isWrong && <XCircle      className="size-4 shrink-0 text-[rgb(var(--color-danger))]"  />}
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (question.type === 'multiple-choice') {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-medium text-[rgb(var(--color-text-tertiary))]">Select all that apply</p>
        {question.options.map((opt, i) => {
          const selected     = Array.isArray(answer) ? answer.includes(opt.id) : false;
          const isCorrectOpt = submitted && question.correctOptionIds.includes(opt.id);
          const isWrong      = submitted && selected && !isCorrectOpt;

          return (
            <motion.button
              key={opt.id}
              type="button"
              disabled={submitted}
              onClick={() => {
                const current = Array.isArray(answer) ? answer : [];
                onAnswer(selected ? current.filter((id) => id !== opt.id) : [...current, opt.id]);
              }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
              whileHover={!submitted ? { x: 3 } : {}}
              whileTap={!submitted ? { scale: 0.98 } : {}}
              className={[
                'group w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all duration-200',
                isCorrectOpt
                  ? 'border-[rgb(var(--color-success)/0.6)] bg-[rgb(var(--color-success)/0.12)] text-[rgb(var(--color-success-text))]'
                  : isWrong
                    ? 'border-[rgb(var(--color-danger)/0.6)]  bg-[rgb(var(--color-danger)/0.12)]  text-[rgb(var(--color-danger-text))]'
                    : selected
                      ? 'border-[rgb(var(--color-accent)/0.5)]  bg-[rgb(var(--color-accent)/0.1)]   text-[rgb(var(--color-text))]'
                      : 'border-[rgb(var(--color-border))]       bg-[rgb(var(--color-bg-subtle))]     text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface-raised))]',
                submitted ? 'cursor-default' : 'cursor-pointer',
              ].join(' ')}
            >
              <span
                className={[
                  'flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all',
                  isCorrectOpt
                    ? 'border-[rgb(var(--color-success))] bg-[rgb(var(--color-success))]'
                    : isWrong
                      ? 'border-[rgb(var(--color-danger))]  bg-[rgb(var(--color-danger))]'
                      : selected
                        ? 'border-[rgb(var(--color-accent))]  bg-[rgb(var(--color-accent))]'
                        : 'border-[rgb(var(--color-border-strong))] bg-transparent group-hover:border-[rgb(var(--color-text-tertiary))]',
                ].join(' ')}
              >
                {(selected || isCorrectOpt) && (
                  <motion.svg
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                    className="size-3 text-white" viewBox="0 0 12 12" fill="none"
                  >
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                )}
              </span>
              <span className="flex-1 text-[13px] font-medium leading-snug">{opt.text}</span>
              {isCorrectOpt && <CheckCircle2 className="size-4 shrink-0 text-[rgb(var(--color-success))]" />}
              {isWrong      && <XCircle      className="size-4 shrink-0 text-[rgb(var(--color-danger))]"  />}
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (question.type === 'true-false') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {([true, false] as const).map((val) => {
          const selected = answer === val;
          const isRight  = submitted && val === question.correctAnswer;
          const isWrong  = submitted && selected && val !== question.correctAnswer;

          return (
            <motion.button
              key={String(val)}
              type="button"
              disabled={submitted}
              onClick={() => onAnswer(val)}
              whileHover={!submitted ? { scale: 1.02 } : {}}
              whileTap={!submitted ? { scale: 0.97 } : {}}
              className={[
                'flex flex-col items-center justify-center gap-2 rounded-2xl border py-5 font-semibold text-[14px] transition-all duration-200',
                isRight
                  ? 'border-[rgb(var(--color-success)/0.6)] bg-[rgb(var(--color-success)/0.12)] text-[rgb(var(--color-success-text))]'
                  : isWrong
                    ? 'border-[rgb(var(--color-danger)/0.6)]  bg-[rgb(var(--color-danger)/0.12)]  text-[rgb(var(--color-danger-text))]'
                    : selected
                      ? 'border-[rgb(var(--color-accent)/0.5)]  bg-[rgb(var(--color-accent)/0.1)]   text-[rgb(var(--color-text))]'
                      : 'border-[rgb(var(--color-border))]       bg-[rgb(var(--color-bg-subtle))]     text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text))]',
                submitted ? 'cursor-default' : 'cursor-pointer',
              ].join(' ')}
            >
              {isRight  ? <CheckCircle2 className="size-5" /> :
               isWrong  ? <XCircle      className="size-5" /> :
               val       ? <CheckCircle2 className="size-5 opacity-40" /> :
                           <XCircle      className="size-5 opacity-40" />}
              {val ? 'True' : 'False'}
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (question.type === 'fill-blank' || question.type === 'code-completion') {
    const currentMap = typeof answer === 'string'
      ? (JSON.parse(answer) as Record<string, string>)
      : {};

    return (
      <div className="space-y-3">
        {'code' in question && (
          <div className="relative overflow-hidden rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))]">
            <div className="flex items-center gap-2 border-b border-[rgb(var(--color-border))] px-4 py-1.5">
              <Code2 className="size-3 text-[rgb(var(--color-text-tertiary))]" />
              <span className="text-[10px] font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">TypeScript</span>
            </div>
            <pre className="overflow-x-auto p-4 text-[12px] font-mono leading-relaxed text-[rgb(var(--color-text))]">
              {question.code}
            </pre>
          </div>
        )}
        {question.blanks.map((blank) => (
          <div key={blank.id}>
            <label className="mb-1 block text-[11px] font-medium text-[rgb(var(--color-text-secondary))]">
              {blank.id}
            </label>
            <input
              type="text"
              placeholder="Type your answer…"
              value={currentMap[blank.id] ?? ''}
              className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-4 py-2.5 text-[13px] text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-tertiary))] outline-none transition-all focus:border-[rgb(var(--color-accent)/0.6)] focus:ring-2 focus:ring-[rgb(var(--color-accent)/0.15)] disabled:opacity-60"
              onChange={(e) => {
                onAnswer(JSON.stringify({ ...currentMap, [blank.id]: e.target.value }));
              }}
              disabled={submitted}
            />
          </div>
        ))}
      </div>
    );
  }

  if (question.type === 'code-output') {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))]">
          <div className="flex items-center gap-2 border-b border-[rgb(var(--color-border))] px-4 py-1.5">
            <Code2 className="size-3 text-[rgb(var(--color-text-tertiary))]" />
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">TypeScript</span>
          </div>
          <pre className="overflow-x-auto p-4 text-[12px] font-mono leading-relaxed text-[rgb(var(--color-text))]">
            {question.code}
          </pre>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-[rgb(var(--color-text-secondary))]">
            Expected output
          </label>
          <input
            type="text"
            placeholder="What will the console print?"
            value={typeof answer === 'string' ? answer : ''}
            className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-4 py-2.5 text-[13px] font-mono text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-tertiary))] outline-none transition-all focus:border-[rgb(var(--color-accent)/0.6)] focus:ring-2 focus:ring-[rgb(var(--color-accent)/0.15)] disabled:opacity-60"
            onChange={(e) => onAnswer(e.target.value)}
            disabled={submitted}
          />
        </div>
      </div>
    );
  }

  if (question.type === 'short-answer') {
    return (
      <div>
        <label className="mb-1 block text-[11px] font-medium text-[rgb(var(--color-text-secondary))]">
          Your answer
        </label>
        <textarea
          rows={4}
          placeholder="Write your answer in your own words…"
          value={typeof answer === 'string' ? answer : ''}
          className="w-full resize-none rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-4 py-2.5 text-[13px] text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-tertiary))] outline-none transition-all focus:border-[rgb(var(--color-accent)/0.6)] focus:ring-2 focus:ring-[rgb(var(--color-accent)/0.15)] disabled:opacity-60 leading-relaxed"
          onChange={(e) => onAnswer(e.target.value)}
          disabled={submitted}
        />
      </div>
    );
  }

  return null;
}

/* ─── ResultsScreen ──────────────────────────────────────────────────────── */

function ResultsScreen({
  scoreData,
  quiz,
  answers,
  onRetry,
  attempt,
}: {
  scoreData: { score: number; correctCount: number; totalQuestions: number; passed: boolean };
  quiz: Quiz;
  answers: Answers;
  onRetry: () => void;
  attempt: number;
}) {
  const { score, correctCount, totalQuestions, passed } = scoreData;

  const tier =
    score >= 90 ? { label: 'Excellent',   color: 'rgb(var(--color-success))',  glow: 'rgba(16,185,129,0.4)',  icon: Sparkles } :
    score >= 70 ? { label: 'Passed',       color: 'rgb(var(--color-accent))',   glow: 'rgba(59,130,246,0.4)',  icon: Trophy   } :
                  { label: 'Keep going',   color: 'rgb(var(--color-warning))',  glow: 'rgba(245,158,11,0.4)',  icon: Zap      };

  const TierIcon = tier.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="h-full overflow-y-auto space-y-4"
      style={{ scrollbarWidth: 'thin' }}
    >
      {/* Score hero */}
      <div className="relative overflow-hidden rounded-3xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at 50% 0%, ${tier.glow} 0%, transparent 65%)` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)` }}
          aria-hidden="true"
        />

        {attempt > 1 && (
          <div className="mb-3 flex justify-center">
            <span className="rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--color-text-tertiary))]">
              Attempt #{attempt}
            </span>
          </div>
        )}

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 16 }}
          className="relative mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border-2"
          style={{ borderColor: `${tier.color}40`, background: `${tier.color}18`, boxShadow: `0 0 30px ${tier.glow}` }}
        >
          <TierIcon className="size-7" style={{ color: tier.color }} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-[28px] font-bold text-[rgb(var(--color-text))] leading-none"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {score}%
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="mt-1 text-[13px] font-semibold"
          style={{ color: tier.color }}
        >
          {tier.label}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34 }}
          className="mt-1.5 text-[12px] text-[rgb(var(--color-text-secondary))]"
        >
          {correctCount} of {totalQuestions} correct
          {passed ? ' · Quiz passed!' : ` · Need ${quiz.passingScorePercent}% to pass`}
        </motion.p>

        {/* Stat chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-5 flex justify-center gap-2.5"
        >
          {[
            { label: 'Correct',   value: correctCount,                    color: 'rgb(var(--color-success))' },
            { label: 'Wrong',     value: totalQuestions - correctCount,   color: 'rgb(var(--color-danger))'  },
            { label: 'Score',     value: `${score}%`,                    color: tier.color                  },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-0.5 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-4 py-2.5"
            >
              <span className="text-[16px] font-bold leading-none" style={{ color: s.color }}>
                {s.value}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[rgb(var(--color-text-tertiary))]">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Retry */}
        {!passed && quiz.retryAllowed && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.48 }}
            type="button"
            onClick={onRetry}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-subtle))] px-5 py-2 text-[12px] font-medium text-[rgb(var(--color-text-secondary))] transition-all hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text))]"
          >
            <RotateCcw className="size-3.5" /> Try again
          </motion.button>
        )}
      </div>

      {/* Per-question review */}
      {quiz.showExplanations && (
        <div className="space-y-2">
          <p className="label-section flex items-center gap-2">
            <CheckCircle2 className="size-3" /> Answer Review
          </p>

          {quiz.questions.map((q, i) => {
            const a     = answers[q.id];
            const right = a !== undefined && isCorrect(q, a);

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 + 0.1 }}
                className={[
                  'rounded-xl border p-3.5',
                  right
                    ? 'border-[rgb(var(--color-success)/0.25)] bg-[rgb(var(--color-success)/0.06)]'
                    : 'border-[rgb(var(--color-danger)/0.25)]  bg-[rgb(var(--color-danger)/0.06)]',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  {right
                    ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[rgb(var(--color-success))]" />
                    : <XCircle      className="mt-0.5 size-4 shrink-0 text-[rgb(var(--color-danger))]"  />
                  }
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-[rgb(var(--color-text))] leading-snug">
                      <span className="label-section mr-2">Q{i + 1}</span>
                      {q.prompt}
                    </p>
                    {q.explanation && (
                      <p className="mt-1 text-[11px] text-[rgb(var(--color-text-secondary))] leading-relaxed">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
