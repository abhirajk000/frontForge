import type { ReactNode } from 'react';

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  children?: ReactNode;
}

/** Circular progress indicator used for the Dashboard's streak/level rings. */
export function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  label,
  children,
}: ProgressRingProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-bg-subtle"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="fill-none stroke-accent transition-[stroke-dashoffset] duration-[var(--duration-slow)] ease-[var(--ease-standard)]"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-text">
        {children}
      </div>
    </div>
  );
}
