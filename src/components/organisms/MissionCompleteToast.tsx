import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '@/components/atoms/Portal';
import { CheckCircle2, X } from 'lucide-react';

interface MissionCompleteToastProps {
  xp: number;
  label?: string;
  onDismiss: () => void;
}

interface LogLine {
  id: string;
  cmd: string;
  result: string;
  ms: string;
  status: 'ok' | 'pending';
}

const PIPELINE: LogLine[] = [
  { id: 'lesson', cmd: 'lesson.mark_complete()', result: 'recorded', ms: '12ms', status: 'ok' },
  { id: 'xp', cmd: 'xp.record(+50)', result: 'balance updated', ms: '8ms', status: 'ok' },
  { id: 'streak', cmd: 'streak.increment()', result: 'streak active', ms: '3ms', status: 'ok' },
];

/**
 * GitHub CI-style mission complete overlay.
 * Each pipeline step appears with a staggered delay, the progress bar fills,
 * then the XP reward is shown. Auto-dismisses after 4.5 s.
 */
export function MissionCompleteToast({ xp, label = 'Lesson Complete', onDismiss }: MissionCompleteToastProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    PIPELINE.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 280 + i * 320));
    });

    timers.push(setTimeout(() => setShowResult(true), 280 + PIPELINE.length * 320 + 200));
    timers.push(setTimeout(onDismiss, 4500));

    return () => timers.forEach(clearTimeout);
  }, [onDismiss]);

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[rgb(0_0_0)]/60 backdrop-blur-sm"
            onClick={onDismiss}
            aria-hidden="true"
          />

          {/* Terminal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[rgb(31_41_55)] bg-[rgb(9_9_11)] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
            role="status"
            aria-live="polite"
            aria-label="Mission complete"
          >
            {/* Terminal header bar */}
            <div className="flex items-center gap-3 border-b border-[rgb(22_31_48)] bg-[rgb(13_13_17)] px-4 py-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="size-3 rounded-full bg-[rgb(239_68_68)]/50" />
                <span className="size-3 rounded-full bg-[rgb(245_158_11)]/50" />
                <span className="size-3 rounded-full bg-[rgb(16_185_129)]/50" />
              </div>
              <span className="flex-1 text-center font-mono text-[11px] text-[rgb(55_65_81)]">
                frontforge — mission-runner
              </span>
              <button
                type="button"
                onClick={onDismiss}
                className="flex size-5 items-center justify-center rounded text-[rgb(55_65_81)] hover:text-[rgb(156_163_175)]"
                aria-label="Dismiss"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Terminal body */}
            <div className="p-5 font-mono text-[12px]">
              {/* Prompt line */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[rgb(16_185_129)]">●</span>
                <span className="font-semibold text-[rgb(249_250_251)]">MISSION COMPLETE</span>
                <span className="ml-auto rounded-sm border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[rgb(16_185_129)]">
                  Passed
                </span>
              </div>

              {/* Divider */}
              <div className="mb-4 h-px bg-[rgb(22_31_48)]" />

              {/* Pipeline steps */}
              <div className="space-y-2">
                {PIPELINE.map((line, i) => (
                  <AnimatePresence key={line.id}>
                    {visibleLines > i && (
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="flex items-baseline gap-2"
                      >
                        <CheckCircle2 className="mt-px size-3 shrink-0 text-[rgb(16_185_129)]" aria-hidden="true" />
                        <span className="text-[rgb(16_185_129)]">✓</span>
                        <span className="text-[rgb(147_197_253)]">{line.cmd}</span>
                        <span className="ml-auto shrink-0 text-[rgb(55_65_81)]">[{line.ms}]</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              {/* Progress fill bar */}
              {visibleLines > 0 && (
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] text-[rgb(55_65_81)]">
                    <span>pipeline</span>
                    <span>{Math.round((visibleLines / PIPELINE.length) * 100)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(22_31_48)]">
                    <motion.div
                      className="h-full rounded-full bg-[rgb(16_185_129)]"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(visibleLines / PIPELINE.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                </div>
              )}

              {/* Result */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="mt-6 border-t border-[rgb(22_31_48)] pt-5 text-center"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span
                        className="text-[2.25rem] font-extrabold leading-none text-[rgb(16_185_129)]"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        +{xp}
                      </span>
                      <div className="text-left">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[rgb(52_211_153)]">XP</p>
                        <p className="text-[11px] text-[rgb(75_85_99)]">{label}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-[rgb(55_65_81)]">
                      Keep shipping. Next mission unlocked.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom progress strip */}
            <div className="h-0.5 w-full bg-[rgb(22_31_48)]">
              <motion.div
                className="h-full bg-[rgb(16_185_129)]"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4.5, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}
