import { useEffect, useState } from 'react';

/** Reactive `matchMedia` hook. Defaults to `false` where `window` is unavailable. */
export function useMediaQuery(query: string): boolean {
  const get = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState<boolean>(get);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Tailwind `md` breakpoint (768px): sidebar layout at and above, bottom tab bar below. */
export const useIsDesktop = () => useMediaQuery('(min-width: 768px)');
