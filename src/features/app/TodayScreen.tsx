import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronRight, Clock, Gauge, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import type { CheckIn, CheckInKey, ShieldBand } from '../../types/wellness';
import { useApp } from '../../state/AppState';
import { ChargeRing } from '../../components/ui/ChargeRing';
import { EmojiSlider } from '../../components/ui/EmojiSlider';
import { ZONE_META, chargeDrivers, isoDaysAgo, zoneFor } from '../../utils/recoveryEngine';
import { useIsDesktop } from './useMediaQuery';

const SLIDER_ORDER: CheckInKey[] = ['sleep', 'energy', 'soreness', 'stress'];

const PRESETS: { label: string; emoji: string; value: CheckIn }[] = [
  { label: 'Rough night', emoji: '😪', value: { sleep: 1, soreness: 4, energy: 2, stress: 4 } },
  { label: 'Normal', emoji: '🙂', value: { sleep: 3, soreness: 2, energy: 3, stress: 3 } },
  { label: 'Feeling great', emoji: '⚡', value: { sleep: 5, soreness: 1, energy: 5, stress: 1 } },
];

const COACH_PROMPTS = [
  'I slept 5 hours—should I still lift today?',
  'Give me a 20-min low-soreness routine',
  'Why is my Burnout Shield in the yellow?',
];

const SHIELD_COLOR: Record<ShieldBand, string> = {
  under: '#7C8CFF',
  sweet: ZONE_META.prime.color,
  caution: ZONE_META.steady.color,
  over: ZONE_META.recharge.color,
};

const sameCheckIn = (a: CheckIn, b: CheckIn) => a.sleep === b.sleep && a.energy === b.energy && a.soreness === b.soreness && a.stress === b.stress;

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, delay: 0.05 * i },
});

/* ------------------------------------------------------------------ */
/* Morning Check-In                                                    */
/* ------------------------------------------------------------------ */

function CheckInCard() {
  const { checkIn, setCheckInValue, setCheckIn, submitCheckIn, checkedInToday, history, charge, zone, userName } = useApp();
  const today = isoDaysAgo(0);
  const saved = history.find((d) => d.date === today);
  const dirty = checkedInToday && saved ? !sameCheckIn(saved.checkIn, checkIn) : false;
  const meta = ZONE_META[zone];

  return (
    <motion.section {...fadeUp(0)} className="card p-5 sm:p-6" aria-labelledby="checkin-title">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow">Morning Check-In · 10 seconds</div>
          <h2 id="checkin-title" className="mt-1.5 font-display text-xl font-extrabold text-ink-100 sm:text-2xl">
            How are you feeling, {userName}?
          </h2>
        </div>
        <div
          className="flex shrink-0 flex-col items-end rounded-2xl px-3 py-1.5 transition-colors duration-500"
          style={{ background: meta.soft }}
          aria-live="polite"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">Live</span>
          <span className="font-display text-lg font-extrabold leading-tight" style={{ color: meta.color }}>
            {charge}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Quick presets">
        {PRESETS.map((p) => {
          const active = sameCheckIn(p.value, checkIn);
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setCheckIn(p.value)}
              aria-pressed={active}
              className={`chip h-9 px-3.5 text-[13px] transition active:scale-[0.97] ${
                active ? 'border-white/30 bg-white/[0.12] text-ink-100' : 'hover:border-white/20 hover:text-ink-100'
              }`}
            >
              <span aria-hidden>{p.emoji}</span> {p.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4">
        {SLIDER_ORDER.map((k) => (
          <EmojiSlider key={k} k={k} value={checkIn[k]} onChange={(v) => setCheckInValue(k, v)} />
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <AnimatePresence initial={false}>
          {checkedInToday && (
            <motion.div
              key="checked"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-prime/25 bg-prime/10 px-3.5 py-2.5 text-sm font-semibold text-prime">
                <Check size={16} className="shrink-0" />
                <span>{dirty ? 'Answers changed — tap Update to save them.' : '✓ Checked in today — update anytime'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button type="button" data-testid="save-checkin" onClick={submitCheckIn} className="btn-primary w-full py-3.5 text-base">
          {checkedInToday ? (
            <>
              <Check size={18} /> Update Check-In
            </>
          ) : (
            <>
              Save Check-In <ArrowRight size={18} />
            </>
          )}
        </button>
        <p className="text-center text-xs text-ink-400">No smartwatch required — your answers adjust today's workout instantly.</p>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Charge ring + baseline + 7-day strip                                */
/* ------------------------------------------------------------------ */

function WeekStrip() {
  const { history, charge } = useApp();
  const today = isoDaysAgo(0);
  const days = useMemo(() => {
    const past = history.filter((d) => d.date !== today).slice(-6);
    return [...past.map((d) => ({ date: d.date, charge: d.charge, isToday: false })), { date: today, charge, isToday: true }];
  }, [history, charge, today]);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="eyebrow text-[10px]">Last 7 days</span>
        <span className="text-[11px] text-ink-400">Daily Charge</span>
      </div>
      <div className="flex h-24 items-end gap-1.5 sm:gap-2" role="list" aria-label="Daily Charge, last 7 days">
        {days.map((d) => {
          const meta = ZONE_META[zoneFor(d.charge)];
          const dayLetter = new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <div key={d.date} role="listitem" className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" aria-label={`${dayLetter}: ${d.charge}%`}>
              <span className={`text-[10px] font-semibold ${d.isToday ? 'text-ink-100' : 'text-ink-400'}`}>{d.charge}</span>
              <div className="relative w-full flex-1">
                <motion.div
                  className="absolute inset-x-0 bottom-0 rounded-lg"
                  style={{
                    background: d.isToday ? meta.color : `${meta.color}99`,
                    boxShadow: d.isToday ? `0 0 16px ${meta.color}66` : undefined,
                  }}
                  initial={false}
                  animate={{ height: `${Math.max(6, d.charge)}%` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                />
              </div>
              <span className={`text-[10px] font-semibold ${d.isToday ? 'text-ink-100' : 'text-ink-400'}`}>{d.isToday ? 'Today' : dayLetter}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChargeCard() {
  const { charge, zone, history } = useApp();
  const isDesktop = useIsDesktop();
  const meta = ZONE_META[zone];
  const today = isoDaysAgo(0);
  const baseline = useMemo(() => {
    const slice = history.filter((d) => d.date !== today).slice(-14);
    if (!slice.length) return charge;
    return Math.round(slice.reduce((a, d) => a + d.charge, 0) / slice.length);
  }, [history, today, charge]);
  const delta = charge - baseline;
  const up = delta >= 0;
  const chipColor = up ? ZONE_META.prime : ZONE_META.recharge;

  return (
    <motion.section {...fadeUp(1)} className="card relative overflow-hidden p-5 sm:p-6" aria-label="Daily Charge">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700"
        style={{ background: meta.soft.replace('0.12', '0.22') }}
      />
      <div className="relative flex flex-col items-center">
        <div className="eyebrow self-start">Your Daily Charge</div>
        <div className="mt-2">
          <ChargeRing value={charge} size={isDesktop ? 220 : 190} stroke={isDesktop ? 16 : 14} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
          <span className="text-sm text-ink-400">
            Your 14-day average: <span className="font-semibold text-ink-100">{baseline}%</span>
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={delta === 0 ? 'eq' : up ? 'up' : 'down'}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
              style={delta === 0 ? { background: 'rgba(255,255,255,0.06)', color: '#B4BBC9' } : { background: chipColor.soft, color: chipColor.color }}
            >
              {delta === 0 ? (
                'Right on your usual'
              ) : (
                <>
                  {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {up ? `+${delta}` : `${delta}`} vs your usual
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="mt-6 w-full border-t border-white/[0.06] pt-5">
          <WeekStrip />
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Verdict                                                             */
/* ------------------------------------------------------------------ */

function VerdictCard() {
  const { zone, checkIn } = useApp();
  const meta = ZONE_META[zone];
  const drivers = chargeDrivers(checkIn);
  return (
    <motion.section
      {...fadeUp(2)}
      className="card relative overflow-hidden p-5 transition-[box-shadow,border-color] duration-700 sm:p-6"
      style={{ borderColor: `${meta.color}33`, boxShadow: `0 0 50px -18px ${meta.color}88, 0 20px 40px -20px rgba(0,0,0,0.6)` }}
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-colors duration-700"
        style={{ background: meta.soft.replace('0.12', '0.35') }}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={zone}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: meta.soft }}>
              <span aria-hidden>{meta.emoji}</span>
            </div>
            <div className="min-w-0">
              <div className="eyebrow">Today's verdict · {meta.short}</div>
              <h3 className="font-display text-3xl font-extrabold leading-tight sm:text-[34px]" style={{ color: meta.color }}>
                {meta.verdict}
              </h3>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-300">{meta.blurb}</p>
        </motion.div>
      </AnimatePresence>

      <div className="relative mt-5">
        <div className="eyebrow mb-2 text-[10px]">What's driving it</div>
        {drivers.length ? (
          <ul className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {drivers.map((d) => {
                const c = d.impact === 'up' ? ZONE_META.prime : ZONE_META.recharge;
                return (
                  <motion.li
                    key={d.label}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
                    style={{ color: c.color, background: c.soft, borderColor: `${c.color}33` }}
                  >
                    {d.impact === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {d.label}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        ) : (
          <p className="text-sm text-ink-400">Nothing stands out — a balanced, middle-of-the-road morning.</p>
        )}
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Today's plan + Burnout Shield                                       */
/* ------------------------------------------------------------------ */

function PlanCard() {
  const { workout, shield, setTab } = useApp();
  const meta = ZONE_META[workout.zone];
  const preview = workout.exercises.slice(0, 3);
  const more = workout.exercises.length - preview.length;
  const shieldColor = SHIELD_COLOR[shield.band];

  return (
    <motion.section {...fadeUp(3)} className="card flex flex-col p-5 sm:p-6" aria-labelledby="plan-title">
      <div className="flex items-center justify-between gap-2">
        <div className="eyebrow">Today's Plan</div>
        <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ color: meta.color, background: meta.soft }}>
          {meta.emoji} {meta.name}
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={workout.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 id="plan-title" className="mt-2 font-display text-xl font-extrabold text-ink-100 sm:text-2xl">
            {workout.title}
          </h3>
          <p className="mt-1 text-sm text-ink-400">{workout.subtitle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip">
              <Clock size={12} /> {workout.minutes} min
            </span>
            <span className="chip">
              <Gauge size={12} /> {workout.intensityLabel}
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {preview.map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-lg" aria-hidden>
                  {e.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-100">{e.name}</div>
                  <div className="truncate text-xs text-ink-400">{e.load}</div>
                </div>
                <span className="shrink-0 text-xs font-semibold text-ink-300">
                  {e.sets} × {e.reps}
                </span>
              </li>
            ))}
          </ul>
          {more > 0 && <p className="mt-2 text-xs text-ink-400">+ {more} more in the full session</p>}
        </motion.div>
      </AnimatePresence>

      <button type="button" onClick={() => setTab('workout')} className="btn-primary mt-5 w-full">
        Open Workout <ArrowRight size={16} />
      </button>

      <button
        type="button"
        onClick={() => setTab('trends')}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 text-left transition hover:border-white/[0.12] hover:bg-white/[0.05]"
        aria-label={`Burnout Shield: ${shield.label}, ratio ${shield.ratio}. Open Trends.`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${shieldColor}1F`, color: shieldColor }}>
          <ShieldCheck size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">Burnout Shield</span>
          <span className="block truncate text-sm font-bold" style={{ color: shieldColor }}>
            {shield.label}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-display text-base font-extrabold text-ink-100">{shield.ratio.toFixed(2)}</span>
          <span className="block text-[10px] text-ink-400">load ratio</span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-ink-400" />
      </button>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* AI Coach                                                            */
/* ------------------------------------------------------------------ */

function CoachCard() {
  const { openCoach } = useApp();
  return (
    <motion.section
      {...fadeUp(4)}
      className="card relative flex flex-col overflow-hidden p-5 sm:p-6"
      aria-labelledby="coach-title"
    >
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-spark/20 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-spark to-prime text-ink-950">
          <Sparkles size={20} />
        </span>
        <div className="min-w-0">
          <h3 id="coach-title" className="font-display text-lg font-extrabold text-ink-100 sm:text-xl">
            Ask your AI Pocket Coach
          </h3>
          <p className="text-sm text-ink-400">Plain-English answers based on today's charge.</p>
        </div>
      </div>
      <div className="relative mt-4 flex flex-col gap-2">
        {COACH_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => openCoach(p)}
            className="group flex w-full items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-left text-sm font-medium text-ink-100 transition hover:border-spark/40 hover:bg-spark/10 active:scale-[0.99]"
          >
            <MessageCircle size={16} className="shrink-0 text-spark" />
            <span className="min-w-0 flex-1">{p}</span>
            <ArrowRight size={15} className="shrink-0 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-spark" />
          </button>
        ))}
      </div>
      <button type="button" onClick={() => openCoach()} className="btn-ghost relative mt-4 w-full sm:mt-auto sm:self-start lg:mt-4">
        <Sparkles size={15} className="text-spark" /> Ask something else
      </button>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export function TodayScreen() {
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
        <CheckInCard />
        <div className="flex min-w-0 flex-col gap-4 md:gap-5">
          <ChargeCard />
          <VerdictCard />
        </div>
      </div>
      <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
        <PlanCard />
        <CoachCard />
      </div>
    </div>
  );
}
