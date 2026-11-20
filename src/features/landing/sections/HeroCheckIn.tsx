import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Dumbbell, Gauge } from 'lucide-react';
import { ChargeRing } from '../../../components/ui/ChargeRing';
import { EmojiSlider } from '../../../components/ui/EmojiSlider';
import { useApp } from '../../../state/AppState';
import type { CheckIn, CheckInKey } from '../../../types/wellness';
import { ZONE_META } from '../../../utils/recoveryEngine';
import { EASE } from '../shared';

const KEYS: CheckInKey[] = ['sleep', 'energy', 'soreness', 'stress'];

const PRESETS: { label: string; value: CheckIn }[] = [
  { label: '😴 Rough night', value: { sleep: 1, energy: 2, soreness: 4, stress: 4 } },
  { label: '🙂 Normal day', value: { sleep: 4, energy: 3, soreness: 2, stress: 3 } },
  { label: '⚡ Feeling great', value: { sleep: 5, energy: 5, soreness: 1, stress: 1 } },
];

const same = (a: CheckIn, b: CheckIn) => KEYS.every((k) => a[k] === b[k]);

/** Live, fully interactive Morning Check-In demo bound to global state. */
export function HeroCheckIn() {
  const { checkIn, setCheckInValue, setCheckIn, charge, zone, workout } = useApp();
  const meta = ZONE_META[zone];

  return (
    <div data-testid="hero-checkin" className="relative">
      {/* zone glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[2.5rem] opacity-60 blur-3xl transition-colors duration-700"
        style={{ background: meta.soft }}
      />
      <div className="card relative p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Try it live</p>
            <h3 className="mt-1 font-display text-xl font-bold text-ink-100">Morning Check-In</h3>
          </div>
          <span className="chip shrink-0">
            <Clock size={12} /> ~10 sec
          </span>
        </div>

        <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {PRESETS.map((p) => {
            const active = same(checkIn, p.value);
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setCheckIn(p.value)}
                aria-pressed={active}
                className={`chip min-h-[36px] shrink-0 whitespace-nowrap transition ${
                  active ? 'border-white/25 bg-white/[0.12] text-ink-100' : 'hover:bg-white/[0.08] hover:text-ink-100'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid items-center gap-5 sm:grid-cols-[1fr_auto]">
          <div className="space-y-2.5">
            {KEYS.map((k) => (
              <EmojiSlider key={k} k={k} value={checkIn[k]} onChange={(v) => setCheckInValue(k, v)} compact />
            ))}
          </div>
          <div className="flex justify-center sm:order-none">
            <ChargeRing value={charge} size={168} stroke={13} />
          </div>
        </div>

        <motion.p
          key={zone}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-4 rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={{ background: meta.soft, color: meta.color }}
        >
          <span className="font-semibold">{meta.verdict}.</span> <span className="text-ink-300">{meta.blurb}</span>
        </motion.p>

        {/* Today's workout preview */}
        <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-850/80">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: EASE }}
              className="p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">Today's Workout</p>
                  <h4 className="mt-1 truncate font-display text-lg font-bold text-ink-100">{workout.title}</h4>
                  <p className="mt-0.5 text-xs leading-snug text-ink-400">{workout.subtitle}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ color: meta.color, background: meta.soft }}
                >
                  {meta.emoji} {meta.name}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-300">
                <span className="chip">
                  <Clock size={12} /> {workout.minutes} min
                </span>
                <span className="chip">
                  <Gauge size={12} /> {workout.intensityLabel}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {workout.exercises.slice(0, 3).map((e) => (
                  <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-2 text-sm">
                    <span className="text-base" aria-hidden>
                      {e.emoji}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-ink-100">{e.name}</span>
                    <span className="shrink-0 text-xs text-ink-400">
                      {e.sets} × {e.reps}
                    </span>
                  </li>
                ))}
              </ul>
              {workout.exercises.length > 3 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
                  <Dumbbell size={12} /> +{workout.exercises.length - 3} more in the app
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
