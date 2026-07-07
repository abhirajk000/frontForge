export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

/** Linear progress indicator, e.g. course completion, quiz score, XP-to-next-level. */
export function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-text-secondary">
          <span>{label}</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-bg-subtle"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-standard)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
