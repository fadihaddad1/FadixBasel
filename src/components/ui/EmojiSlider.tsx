import { motion, AnimatePresence } from 'framer-motion';
import type { CheckInKey, Step } from '../../types/wellness';
import { SLIDER_COPY } from '../../data/mockData';

const GOOD_HIGH: Record<CheckInKey, boolean> = { sleep: true, energy: true, soreness: false, stress: false };

function colorFor(k: CheckInKey, v: number) {
  const goodness = GOOD_HIGH[k] ? (v - 1) / 4 : (5 - v) / 4;
  if (goodness >= 0.7) return '#2EE6A6';
  if (goodness >= 0.4) return '#FFB547';
  return '#FF6B6B';
}

/** Tactile 1–5 emoji slider used for the Morning Check-In. */
export function EmojiSlider({ k, value, onChange, compact = false }: { k: CheckInKey; value: Step; onChange: (v: Step) => void; compact?: boolean }) {
  const copy = SLIDER_COPY[k];
  const color = colorFor(k, value);
  const pct = ((value - 1) / 4) * 100;
  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-100">{copy.label}</span>
        <span className="flex items-center gap-1.5 text-sm" style={{ color }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className={compact ? 'text-lg' : 'text-xl'}
            >
              {copy.emojis[value - 1]}
            </motion.span>
          </AnimatePresence>
          <span className="w-16 text-right font-semibold">{copy.words[value - 1]}</span>
        </span>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-white/[0.07]" />
        <div
          className="pointer-events-none absolute left-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full transition-[width,background] duration-300"
          style={{ width: `calc(${pct}% + ${13 - pct * 0.26}px)`, background: color }}
        />
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          aria-label={copy.label}
          aria-valuetext={copy.words[value - 1]}
          onChange={(e) => onChange(Number(e.target.value) as Step)}
          className="dg-range relative"
          style={{ ['--thumb' as string]: color }}
        />
      </div>
    </div>
  );
}
