import { useCallback, useEffect, useRef, useState } from 'react';

export interface IntroClock {
  /** Elapsed ms, 0..total. The single source of truth for every animation in the intro. */
  elapsed: number;
  playing: boolean;
  ended: boolean;
  play: () => void;
  pause: () => void;
  seek: (ms: number) => void;
  /** Read the latest elapsed value without waiting for a render (for event handlers). */
  read: () => number;
}

/**
 * A requestAnimationFrame-driven clock. Frame deltas are clamped so a backgrounded
 * tab doesn't leap forward when it becomes visible again. Stops (doesn't loop) at `total`.
 */
export function useIntroClock(total: number, initialMs = 0, autoPlay = true): IntroClock {
  const start = Math.max(0, Math.min(total, initialMs));
  const [elapsed, setElapsed] = useState(start);
  const [playing, setPlaying] = useState(autoPlay && start < total);
  const elapsedRef = useRef(start);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      const dt = last === null ? 0 : Math.min(now - last, 100);
      last = now;
      const next = Math.min(total, elapsedRef.current + dt);
      elapsedRef.current = next;
      setElapsed(next);
      if (next >= total) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, total]);

  const seek = useCallback(
    (ms: number) => {
      const v = Math.max(0, Math.min(total, ms));
      elapsedRef.current = v;
      setElapsed(v);
    },
    [total],
  );

  const play = useCallback(() => {
    if (elapsedRef.current >= total) seek(0);
    setPlaying(true);
  }, [seek, total]);

  const pause = useCallback(() => setPlaying(false), []);
  const read = useCallback(() => elapsedRef.current, []);

  return { elapsed, playing, ended: elapsed >= total, play, pause, seek, read };
}
