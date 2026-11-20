import { motion } from 'framer-motion';
import { Check, Timer, TrendingUp, WatchIcon } from 'lucide-react';
import { ChargeRing } from '../../../components/ui/ChargeRing';
import { EmojiSlider } from '../../../components/ui/EmojiSlider';
import { rawScore, ZONE_META, zoneFor } from '../../../utils/recoveryEngine';
import type { CheckIn, CheckInKey, Step } from '../../../types/wellness';
import { span } from '../introScript';
import type { SceneProps } from './types';

const ORDER: CheckInKey[] = ['sleep', 'soreness', 'energy', 'stress'];
const FROM: CheckIn = { sleep: 2, soreness: 4, energy: 2, stress: 4 };
const TO: CheckIn = { sleep: 5, soreness: 2, energy: 4, stress: 1 };
const BASELINE = 71; // the demo user's 14-day average

const noop = () => undefined;
/** Make the demo sliders non-interactive and unfocusable (React 18 has no `inert` prop). */
const inertRef = (el: HTMLDivElement | null) => el?.setAttribute('inert', '');

function valuesAt(t: number): CheckIn {
  const out = { ...FROM };
  ORDER.forEach((k, i) => {
    const p = span(t, 0.08 + i * 0.15, 0.2 + i * 0.15);
    out[k] = Math.round(FROM[k] + (TO[k] - FROM[k]) * p) as Step;
  });
  return out;
}

export function SolutionScene({ t, wide }: SceneProps) {
  const values = valuesAt(t);
  const charge = t < 0.05 ? 0 : rawScore(values);
  const zone = zoneFor(charge);
  const meta = ZONE_META[zone];
  const seconds = Math.min(10, Math.floor(span(t, 0.06, 0.74) * 10));
  const done = t >= 0.74;
  const activeIdx = ORDER.findIndex((_, i) => t >= 0.08 + i * 0.15 && t < 0.2 + i * 0.15);

  const sliders = (
    <div ref={inertRef} className="card w-full space-y-3 p-4 md:space-y-4 md:p-6" aria-hidden>
      <div className="flex items-center justify-between">
        <div className="eyebrow">Morning Check-In</div>
        <motion.span
          className="chip tabular-nums"
          initial={false}
          animate={{ borderColor: done ? `${ZONE_META.prime.color}88` : 'rgba(255,255,255,0.08)' }}
          style={{ color: done ? ZONE_META.prime.color : undefined }}
        >
          {done ? <Check className="h-3.5 w-3.5" /> : <Timer className="h-3.5 w-3.5" />}
          {done ? 'Done in 10s' : `0:${String(seconds).padStart(2, '0')}`}
        </motion.span>
      </div>
      {ORDER.map((k, i) => (
        <motion.div
          key={k}
          className="rounded-2xl px-2 py-0.5 md:px-3 md:py-1"
          initial={false}
          animate={{
            backgroundColor: activeIdx === i ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0)',
            scale: activeIdx === i ? 1.02 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          <EmojiSlider k={k} value={values[k]} onChange={noop} compact={!wide} />
        </motion.div>
      ))}
    </div>
  );

  const ring = (
    <div className="flex flex-col items-center gap-3 md:gap-5">
      <ChargeRing value={charge} size={wide ? 250 : 168} stroke={wide ? 18 : 13} />
      <div className="flex flex-wrap justify-center gap-2">
        <span className="chip">
          <WatchIcon className="h-3.5 w-3.5" /> No wearable needed
        </span>
        <motion.span
          className="chip"
          initial={false}
          animate={{ opacity: done ? 1 : 0.35 }}
          style={{ color: done ? meta.color : undefined }}
        >
          <TrendingUp className="h-3.5 w-3.5" /> {charge >= BASELINE ? '+' : ''}
          {charge - BASELINE}% vs your baseline
        </motion.span>
      </div>
    </div>
  );

  return wide ? (
    <div className="mx-auto grid max-w-4xl grid-cols-[1.1fr_1fr] items-center gap-10">
      {sliders}
      {ring}
    </div>
  ) : (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4">
      {ring}
      {sliders}
    </div>
  );
}
