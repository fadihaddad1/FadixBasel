import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../state/AppState';
import type { ShieldBand, Zone } from '../../types/wellness';
import { SHIELD_COPY, ZONE_META } from '../../utils/recoveryEngine';

const QUICK_MINUTES = [20, 30, 45, 60];
const DEFAULT_EFFORT: Record<Zone, number> = { prime: 7, steady: 5, recharge: 3 };

function effortInfo(v: number): { label: string; hint: string; color: string } {
  if (v <= 3) return { label: 'Easy', hint: 'Could chat the whole time.', color: ZONE_META.prime.color };
  if (v <= 6) return { label: 'Moderate', hint: 'Breathing harder, still in control.', color: ZONE_META.steady.color };
  if (v <= 8) return { label: 'Hard', hint: 'Only a few words at a time.', color: '#FF8A3D' };
  return { label: 'All-out', hint: 'Nothing left in the tank.', color: ZONE_META.recharge.color };
}

function bandFor(ratio: number): ShieldBand {
  if (ratio < 0.8) return 'under';
  if (ratio > 1.5) return 'over';
  if (ratio > 1.3) return 'caution';
  return 'sweet';
}

const BAND_COLOR: Record<ShieldBand, string> = {
  under: '#7C8CFF',
  sweet: ZONE_META.prime.color,
  caution: ZONE_META.steady.color,
  over: ZONE_META.recharge.color,
};

export function LogEffortModal() {
  const { logOpen, closeLog, logWorkout, setTab, workout, shield } = useApp();
  const [effort, setEffort] = useState(DEFAULT_EFFORT[workout.zone]);
  const [minutes, setMinutes] = useState(workout.minutes);

  // Reset to sensible defaults for today's plan whenever the sheet opens.
  useEffect(() => {
    if (logOpen) {
      setEffort(DEFAULT_EFFORT[workout.zone]);
      setMinutes(workout.minutes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logOpen]);

  const info = effortInfo(effort);
  const load = effort * minutes;
  const projectedAcute = shield.acuteLoad + load;
  const projectedRatio = shield.chronicLoad > 0 ? +(projectedAcute / shield.chronicLoad).toFixed(2) : 1;
  const projectedBand = bandFor(projectedRatio);
  const bandColor = BAND_COLOR[projectedBand];
  const fillPct = ((effort - 1) / 9) * 100;

  const stepMinutes = (d: number) => setMinutes((m) => Math.min(240, Math.max(5, m + d)));

  const save = () => {
    logWorkout(effort, minutes);
    closeLog();
    setTab('trends');
  };

  return (
    <Modal open={logOpen} onClose={closeLog} title="How hard was that?">
      <div className="pr-8">
        <div className="eyebrow">Log effort · {workout.title}</div>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-ink-100">How hard was that?</h2>
        <p className="mt-1 text-sm text-ink-300">Rate the whole session, not your hardest set.</p>
      </div>

      {/* Effort */}
      <div className="mt-6 rounded-3xl bg-ink-800/70 p-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={info.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <div className="font-display text-lg font-bold" style={{ color: info.color }}>
                  {info.label}
                </div>
                <div className="text-xs text-ink-400">{info.hint}</div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={effort}
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="font-display text-5xl font-extrabold tabular-nums leading-none"
              style={{ color: info.color }}
            >
              {effort}
            </motion.span>
            <span className="text-sm font-semibold text-ink-400">/10</span>
          </div>
        </div>

        <div className="relative mt-4">
          <div
            className="pointer-events-none absolute left-0 right-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full opacity-30"
            style={{
              background: `linear-gradient(90deg, ${ZONE_META.prime.color}, ${ZONE_META.steady.color}, ${ZONE_META.recharge.color})`,
            }}
          />
          <div
            className="pointer-events-none absolute left-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full"
            style={{
              width: `calc(${fillPct}% + ${13 - (fillPct / 100) * 26}px)`,
              background: `linear-gradient(90deg, ${ZONE_META.prime.color}, ${ZONE_META.steady.color}, ${ZONE_META.recharge.color})`,
              backgroundSize: `${fillPct > 0 ? (100 / fillPct) * 100 : 100}% 100%`,
            }}
          />
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={effort}
            onChange={(e) => setEffort(Number(e.target.value))}
            aria-label="Effort from 1 to 10"
            aria-valuetext={`${effort} out of 10, ${info.label}`}
            className="dg-range relative"
            style={{ ['--thumb' as string]: info.color }}
          />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[11px] font-medium">
          {[
            { l: 'Easy', r: '1–3', v: 2, on: effort <= 3 },
            { l: 'Moderate', r: '4–6', v: 5, on: effort >= 4 && effort <= 6 },
            { l: 'Hard', r: '7–8', v: 7, on: effort >= 7 && effort <= 8 },
            { l: 'All-out', r: '9–10', v: 10, on: effort >= 9 },
          ].map((b) => (
            <button
              key={b.l}
              onClick={() => setEffort(b.v)}
              className={`min-h-[44px] rounded-xl px-1 py-1 transition-colors ${b.on ? 'bg-white/[0.08] text-ink-100' : 'text-ink-400 hover:text-ink-300'}`}
            >
              <div>{b.l}</div>
              <div className="text-[10px] opacity-70">{b.r}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Minutes */}
      <div className="mt-4 rounded-3xl bg-ink-800/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-ink-100">Minutes</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => stepMinutes(-5)}
              aria-label="5 fewer minutes"
              disabled={minutes <= 5}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.06] text-ink-100 transition active:scale-95 hover:bg-white/[0.12] disabled:opacity-40"
            >
              <Minus size={18} />
            </button>
            <div className="w-16 text-center font-display text-2xl font-extrabold tabular-nums text-ink-100" aria-live="polite">
              {minutes}
            </div>
            <button
              onClick={() => stepMinutes(5)}
              aria-label="5 more minutes"
              disabled={minutes >= 240}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.06] text-ink-100 transition active:scale-95 hover:bg-white/[0.12] disabled:opacity-40"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_MINUTES.map((m) => (
            <button
              key={m}
              onClick={() => setMinutes(m)}
              className={`min-h-[36px] rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                minutes === m ? 'border-prime/50 bg-prime-soft text-prime' : 'border-white/[0.08] bg-white/[0.04] text-ink-300 hover:text-ink-100'
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="mt-4 rounded-3xl border border-white/[0.06] p-4">
        <div className="text-sm text-ink-300">
          Session load = effort × minutes ={' '}
          <span className="font-display text-base font-extrabold tabular-nums text-ink-100">
            {effort} × {minutes} = {load}
          </span>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: `${bandColor}22`, color: bandColor }}>
            <ShieldCheck size={16} />
          </div>
          <div className="min-w-0 text-sm">
            <div className="font-semibold text-ink-100">
              Burnout Shield after this: <span style={{ color: bandColor }}>{SHIELD_COPY[projectedBand].label}</span>
            </div>
            <div className="text-ink-300">
              {projectedBand === 'over' || projectedBand === 'caution'
                ? 'This pushes your week above your usual. Plan an easier day next.'
                : projectedBand === 'sweet'
                  ? 'Right in the zone your body can absorb. Nice.'
                  : "Still lighter than usual — there's room for more this week."}
            </div>
            <div className="mt-1 text-xs tabular-nums text-ink-400">
              Ratio {shield.ratio.toFixed(2)} → {projectedRatio.toFixed(2)} ({projectedAcute.toLocaleString()} this week vs{' '}
              {shield.chronicLoad.toLocaleString()} usual)
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button className="btn-ghost" onClick={closeLog}>
          Cancel
        </button>
        <button data-testid="log-effort-save" className="btn-primary" onClick={save}>
          Save workout
        </button>
      </div>
    </Modal>
  );
}
