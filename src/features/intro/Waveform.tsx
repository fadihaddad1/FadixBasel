import { motion } from 'framer-motion';

const BARS = 24;
// Deterministic pseudo-random peaks so the shape looks organic but never re-randomizes.
const PEAKS = Array.from({ length: BARS }, (_, i) => {
  const a = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  const envelope = 0.55 + 0.45 * Math.sin((i / (BARS - 1)) * Math.PI);
  return 0.35 + a * 0.65 * envelope;
});

/**
 * Audio waveform visualizer. `level` 2 = narrating (lively), 1 = ambient pad only (gentle),
 * 0 = muted/paused (flat and dim).
 */
export function Waveform({ level, color = '#2EE6A6' }: { level: 0 | 1 | 2; color?: string }) {
  return (
    <div className="flex h-7 items-center gap-[3px]" aria-hidden>
      {PEAKS.map((peak, i) => {
        const hi = level === 2 ? peak : peak * 0.4;
        return (
          <motion.span
            key={i}
            className="block h-full w-[3px] origin-center rounded-full"
            style={{ background: color }}
            initial={false}
            animate={
              level === 0
                ? { scaleY: 0.12, opacity: 0.3 }
                : { scaleY: [0.15, hi, hi * 0.45, hi * 0.85, 0.15], opacity: level === 2 ? 0.95 : 0.6 }
            }
            transition={
              level === 0
                ? { duration: 0.35 }
                : {
                    scaleY: { duration: (level === 2 ? 0.8 : 2.2) + (i % 5) * 0.11, repeat: Infinity, ease: 'easeInOut', delay: (i % 7) * 0.06 },
                    opacity: { duration: 0.3 },
                  }
            }
          />
        );
      })}
    </div>
  );
}
