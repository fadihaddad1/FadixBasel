/** Consistent "Founded by Fadi Haddad" attribution used across intro, landing, and app. */
export function FounderBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs text-ink-400 ${className}`}>
      <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-spark to-prime text-[9px] font-bold text-ink-950">
        FH
      </span>
      Founded by <span className="font-semibold text-ink-100">Fadi Haddad</span>
    </span>
  );
}

export const FOUNDER_NAME = 'Fadi Haddad';
