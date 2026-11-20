import { useId } from 'react';

/** DayGauge mark: a red→amber→green arc gauge with a needle — "where is your day?" */
export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FF6B6B" />
          <stop offset=".5" stopColor="#FFB547" />
          <stop offset="1" stopColor="#2EE6A6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#161A23" />
      <path d="M14 42a18 18 0 1 1 36 0" fill="none" stroke={`url(#g${id})`} strokeWidth="6" strokeLinecap="round" />
      <path d="M32 42l9-13" stroke="#EEF0F5" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="42" r="4" fill="#EEF0F5" />
    </svg>
  );
}

export function Logo({ size = 32, showText = true, className = '' }: { size?: number; showText?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span className="font-display text-lg font-extrabold tracking-tight text-ink-100">
          Day<span className="text-prime">Gauge</span>
        </span>
      )}
    </span>
  );
}
