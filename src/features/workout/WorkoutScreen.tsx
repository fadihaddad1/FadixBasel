import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Clock,
  Eye,
  Flame,
  Gauge,
  Lock,
  MessageCircle,
  Repeat,
  RotateCcw,
  Sparkles,
  Timer,
  TrendingDown,
  TrendingUp,
  Wand2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ChargeRing } from '../../components/ui/ChargeRing';
import { useApp } from '../../state/AppState';
import type { Exercise, SessionType, WorkoutPlan, Zone } from '../../types/wellness';
import { BASE_SESSIONS, ZONE_META } from '../../utils/recoveryEngine';

const SESSIONS: { id: SessionType; label: string; emoji: string }[] = [
  { id: 'legs', label: 'Legs', emoji: '🦵' },
  { id: 'upper', label: 'Upper', emoji: '💪' },
  { id: 'run', label: 'Run', emoji: '🏃' },
  { id: 'full', label: 'Full Body', emoji: '🔥' },
];

/** Friendly, lower-effort alternatives for the per-exercise "Swap" action (mock). */
const ALTERNATIVES: Record<string, string> = {
  sq: 'Goblet Squat — same pattern, much kinder on your back',
  rdl: 'Single-leg Glute Bridge — hamstrings without the heavy bar',
  lunge: 'Split Squat (static) — steadier, easier balance',
  calf: 'Seated Calf Raise — same muscles, no balance needed',
  bench: 'Dumbbell Floor Press — shorter range, easier on shoulders',
  row: 'Chest-Supported Row — no lower-back strain',
  ohp: 'Landmine Press — friendlier angle for your shoulders',
  pull: 'Band Pull-Aparts — light and great for posture',
  wu: 'Brisk Walk — 10 minutes, just get warm',
  tempo: 'Steady Easy Run — same time, conversational pace',
  strides: 'Relaxed Pickups — 15 sec, no sprinting',
  cd: 'Gentle Stretch — 5 minutes on the floor',
  gob: 'Box Squat to Bench — sit back, stand up, easy',
  push: 'Incline Push-ups — hands on a bench or counter',
  kb: 'Hip Hinge Drill — no weight, nail the movement',
  plank: 'Dead Bug — core work lying on your back',
  walk: 'Easy Bike Spin — 10 minutes, light resistance',
  cat: "Child's Pose Breathing — 2 minutes, totally passive",
  hip: 'Seated Figure-4 Stretch — gentle hip opener',
  glute: 'Lying Knee Hugs — 30 seconds, just breathe',
  breath: 'Legs Up the Wall — 3 minutes of calm',
};

const SIM_OPTIONS: { value: Zone | null; label: (charge: number) => string; testId?: string }[] = [
  { value: null, label: (c) => `Auto (${c}%)` },
  { value: 'prime', label: () => 'Green' },
  { value: 'steady', label: () => 'Amber' },
  { value: 'recharge', label: () => 'Red', testId: 'zone-sim-recharge' },
];

const spring = { type: 'spring' as const, stiffness: 420, damping: 28 };

function fmtRest(sec: number) {
  if (sec <= 0) return 'No rest';
  if (sec < 60) return `${sec}s rest`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}:${String(s).padStart(2, '0')} rest` : `${m} min rest`;
}

function deltaChip(w: WorkoutPlan): { text: string; Icon: typeof TrendingDown } {
  if (w.zone === 'recharge') return { text: 'Swapped to recovery', Icon: Repeat };
  if (w.zone === 'steady') return { text: `${w.intensityDelta}% intensity`, Icon: TrendingDown };
  return { text: '+1 set on main lift', Icon: TrendingUp };
}

interface ExerciseDiff {
  id: string;
  emoji: string;
  name: string;
  changes: string[];
}

function diffPlan(w: WorkoutPlan, base: { exercises: Exercise[] }): ExerciseDiff[] {
  const out: ExerciseDiff[] = [];
  for (const e of w.exercises) {
    const b = base.exercises.find((x) => x.id === e.id);
    if (!b) continue;
    const changes: string[] = [];
    if (b.sets !== e.sets) changes.push(`${b.sets} → ${e.sets} sets`);
    if (b.load !== e.load) changes.push(`${b.load} → ${e.load}`);
    if (b.reps !== e.reps) changes.push(`${b.reps} → ${e.reps} reps`);
    if (changes.length) out.push({ id: e.id, emoji: e.emoji, name: e.name, changes });
  }
  return out;
}

export function WorkoutScreen() {
  const {
    charge,
    zone,
    workout,
    sessionType,
    setSessionType,
    zoneOverride,
    setZoneOverride,
    completedExercises,
    toggleExercise,
    openLog,
    plan,
    openTrial,
    openCoach,
    toast,
  } = useApp();

  const [swapOpen, setSwapOpen] = useState<string | null>(null);
  const meta = ZONE_META[workout.zone];
  const base = BASE_SESSIONS[sessionType];
  const diffs = useMemo(() => diffPlan(workout, base), [workout, base]);
  const isSwapped = workout.zone === 'recharge';
  const minutesChanged = workout.minutes !== base.minutes;

  const total = workout.exercises.length;
  const done = workout.exercises.filter((e) => completedExercises.has(e.id)).length;
  const allDone = total > 0 && done === total;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const delta = deltaChip(workout);

  const handleQuickSwap = (e: Exercise) => {
    const alt = ALTERNATIVES[e.id];
    toast({
      title: `Swap idea for ${e.name}`,
      body: alt ? `Try ${alt}.` : 'Pick any lighter movement for the same muscles — it still counts.',
      tone: 'info',
    });
    setSwapOpen(null);
  };

  return (
    <div data-testid="workout-screen" className="mx-auto w-full max-w-3xl space-y-5 pb-4">
      {/* Free-plan soft lock */}
      {plan === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 rounded-3xl border border-spark/25 bg-spark-soft p-4 sm:flex-row sm:items-center"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-spark/20 text-spark">
              <Lock size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink-100">Auto-adjust is a Pro feature — you're previewing it free</div>
              <div className="text-xs text-ink-300">Everything here works. Unlock it for good with a free week of Pro.</div>
            </div>
          </div>
          <button className="btn btn-sm shrink-0 bg-spark text-ink-950 hover:brightness-110" onClick={() => openTrial()}>
            <Sparkles size={14} /> Start 7-Day Free Trial
          </button>
        </motion.div>
      )}

      {/* Header card */}
      <section className="card relative overflow-hidden p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl transition-colors duration-700"
          style={{ background: meta.soft.replace('0.12', '0.22') }}
        />
        <div className="relative flex items-start gap-4 sm:gap-6">
          <div className="shrink-0">
            <ChargeRing value={charge} size={96} stroke={9} zone={workout.zone} label="Charge" showVerdict={false} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="eyebrow">Today's Workout</div>
            <div
              className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors duration-500"
              style={{ color: meta.color, background: meta.soft }}
            >
              {meta.emoji} {meta.verdict}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="mt-2 font-display text-xl font-extrabold leading-tight text-ink-100 sm:text-3xl">{workout.title}</h1>
                <p className="mt-1 text-sm text-ink-300">{workout.subtitle}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="chip">
            <Clock size={13} /> {workout.minutes} min
          </span>
          <span className="chip">
            <Gauge size={13} /> {workout.intensityLabel}
          </span>
          <span className="chip font-semibold" style={{ color: meta.color, borderColor: `${meta.color}40`, background: meta.soft }}>
            <delta.Icon size={13} /> {delta.text}
          </span>
        </div>
      </section>

      {/* Session picker */}
      <section aria-label="Session type">
        <div className="mb-2 eyebrow">What are you training?</div>
        <div role="tablist" className="grid grid-cols-4 gap-1 rounded-full border border-white/[0.06] bg-ink-900/80 p-1">
          {SESSIONS.map((s) => {
            const active = s.id === sessionType;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={active}
                onClick={() => setSessionType(s.id)}
                className={`relative min-h-[44px] rounded-full px-1 text-xs font-semibold transition-colors sm:text-sm ${
                  active ? 'text-ink-950' : 'text-ink-300 hover:text-ink-100'
                }`}
              >
                {active && (
                  <motion.span layoutId="session-pill" className="absolute inset-0 rounded-full bg-ink-100" transition={spring} />
                )}
                <span className="relative inline-flex items-center justify-center gap-1 whitespace-nowrap">
                  <span aria-hidden className="hidden sm:inline">
                    {s.emoji}
                  </span>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Auto-adjust explainer + simulator */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-ink-100">
            <Wand2 size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-ink-100">Auto-adjust</h2>
            <p className="mt-0.5 text-sm text-ink-300">
              Your plan reshapes itself to your Daily Charge. Green adds a set and goes heavy, amber dials it back about 15%, and red
              swaps to a gentle recovery flow. Tap a day below to preview.
            </p>
          </div>
        </div>
        <div role="radiogroup" aria-label="Preview a zone" className="mt-4 grid grid-cols-4 gap-1 rounded-full bg-ink-800 p-1">
          {SIM_OPTIONS.map((o) => {
            const active = zoneOverride === o.value;
            const color = o.value ? ZONE_META[o.value].color : ZONE_META[zone].color;
            return (
              <button
                key={o.value ?? 'auto'}
                role="radio"
                aria-checked={active}
                data-testid={o.testId}
                onClick={() => setZoneOverride(o.value)}
                className={`relative min-h-[44px] rounded-full px-1 text-xs font-semibold transition-colors sm:text-sm ${
                  active ? 'text-ink-950' : 'text-ink-300 hover:text-ink-100'
                }`}
              >
                {active && (
                  <motion.span layoutId="zone-sim-pill" className="absolute inset-0 rounded-full" style={{ background: color }} transition={spring} />
                )}
                <span className="relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  {o.value && <span className="h-2 w-2 rounded-full" style={{ background: active ? '#0B0D12' : color }} />}
                  {o.label(charge)}
                </span>
              </button>
            );
          })}
        </div>
        <AnimatePresence initial={false}>
          {zoneOverride && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="mt-3 flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center"
                style={{ borderColor: `${ZONE_META[zoneOverride].color}40`, background: ZONE_META[zoneOverride].soft }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-ink-100">
                  <Eye size={16} className="shrink-0" style={{ color: ZONE_META[zoneOverride].color }} />
                  <span>
                    <strong>Previewing</strong> a {ZONE_META[zoneOverride].short.toLowerCase()} plan. Your real charge is {charge}% (
                    {ZONE_META[zone].name}).
                  </span>
                </div>
                <button className="btn-ghost btn-sm shrink-0" onClick={() => setZoneOverride(null)}>
                  <RotateCcw size={14} /> Back to my real plan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Before / after diff */}
      <AnimatePresence mode="popLayout" initial={false}>
        {isSwapped ? (
          <motion.section
            key={`swap-${workout.id}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="card p-5"
          >
            <div className="eyebrow">What changed</div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 rounded-2xl bg-ink-800 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wider text-ink-400">Planned</div>
                <div className="truncate font-semibold text-ink-300 line-through decoration-ink-400/60">{base.title}</div>
                <div className="text-xs text-ink-400">{base.minutes} min</div>
              </div>
              <div className="grid place-items-center text-ink-400">
                <ArrowRight size={18} className="rotate-90 sm:rotate-0" />
              </div>
              <div className="min-w-0 flex-1 rounded-2xl px-4 py-3" style={{ background: meta.soft }}>
                <div className="text-[11px] uppercase tracking-wider" style={{ color: meta.color }}>
                  Swapped
                </div>
                <div className="truncate font-semibold text-ink-100">{workout.title}</div>
                <div className="text-xs text-ink-300">{workout.minutes} min · easy effort</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-300">
              Swapped: {base.title} → {workout.title}. Recovery counts as winning — your streak stays alive.
            </p>
          </motion.section>
        ) : diffs.length > 0 || minutesChanged ? (
          <motion.section
            key={`diff-${workout.id}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="eyebrow">What changed vs. your usual plan</div>
              {minutesChanged && (
                <span className="chip shrink-0">
                  {base.minutes} → {workout.minutes} min
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-2">
              {diffs.map((d) => (
                <li key={d.id} className="flex items-start gap-3 rounded-2xl bg-ink-800/70 px-3 py-2.5">
                  <span aria-hidden className="text-lg leading-6">
                    {d.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-100">{d.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {d.changes.map((c) => (
                        <span
                          key={c}
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ color: meta.color, background: meta.soft }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {/* Progress */}
      <section className="card relative overflow-hidden p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-ink-100">
            {allDone ? 'Session complete!' : 'Progress'}
          </div>
          <div className="text-sm tabular-nums text-ink-300">
            {done}/{total} done
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink-800" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${meta.color}, ${ZONE_META.prime.color})` }}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          />
        </div>
        <AnimatePresence>
          {allDone && (
            <motion.div
              key="celebrate"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative mt-4 flex flex-col items-center gap-3 rounded-2xl bg-prime-soft px-4 py-5 text-center">
                <Burst />
                <motion.div
                  className="text-4xl"
                  initial={{ scale: 0.4, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 14 }}
                >
                  🎉
                </motion.div>
                <div>
                  <div className="font-display text-lg font-extrabold text-ink-100">Nice work — every exercise done!</div>
                  <div className="text-sm text-ink-300">Log how hard it felt so your Burnout Shield stays accurate.</div>
                </div>
                <button className="btn-primary relative" onClick={openLog}>
                  <Flame size={16} /> Log Workout Effort
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Exercise list */}
      <section aria-label="Exercises">
        <ul className="space-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {workout.exercises.map((e, i) => {
              const isDone = completedExercises.has(e.id);
              const open = swapOpen === e.id;
              return (
                <motion.li
                  key={`${workout.id}-${e.id}`}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { ...spring, delay: i * 0.04 } }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                  className={`card p-4 transition-colors ${isDone ? 'border-prime/25 bg-ink-900/50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleExercise(e.id)}
                      aria-pressed={isDone}
                      aria-label={isDone ? `Mark ${e.name} not done` : `Mark ${e.name} done`}
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                        isDone ? 'border-prime bg-prime text-ink-950' : 'border-white/15 text-transparent hover:border-white/35'
                      }`}
                    >
                      <AnimatePresence>
                        {isDone && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring}>
                            <Check size={20} strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <div aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink-800 text-xl">
                      {e.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate font-semibold transition-colors ${
                          isDone ? 'text-ink-400 line-through decoration-prime/70 decoration-2' : 'text-ink-100'
                        }`}
                      >
                        {e.name}
                      </div>
                      <div className="mt-0.5 text-sm tabular-nums text-ink-300">
                        {e.sets} × {e.reps}
                      </div>
                    </div>
                    <button
                      onClick={() => setSwapOpen(open ? null : e.id)}
                      aria-expanded={open}
                      className="btn-ghost btn-sm min-h-[44px] shrink-0"
                    >
                      <Repeat size={14} /> <span className="hidden sm:inline">Swap</span>
                      <span className="sr-only sm:hidden">Swap</span>
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 pl-0 sm:pl-[104px]">
                    <span className="chip">
                      <Gauge size={12} /> {e.load}
                    </span>
                    <span className="chip">
                      <Timer size={12} /> {fmtRest(e.restSec)}
                    </span>
                  </div>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <button
                            onClick={() => handleQuickSwap(e)}
                            className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-ink-800 px-3 py-2 text-left text-sm text-ink-100 hover:bg-ink-700"
                          >
                            <Repeat size={15} className="shrink-0 text-prime" />
                            <span className="min-w-0">Try {ALTERNATIVES[e.id]?.split(' — ')[0] ?? 'a lighter variation'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setSwapOpen(null);
                              openCoach(`Swap ${e.name} for something easier`);
                            }}
                            className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-spark-soft px-3 py-2 text-left text-sm text-ink-100 hover:bg-spark/20"
                          >
                            <MessageCircle size={15} className="shrink-0 text-spark" />
                            <span className="min-w-0">Ask AI Coach for an easier option</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </section>

      {/* Coach note */}
      <section className="card p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-spark-soft text-spark">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-ink-100">Coach note</div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={workout.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-1 text-sm text-ink-300"
              >
                {workout.coachNote}
              </motion.p>
            </AnimatePresence>
            <button
              className="btn-sm btn mt-3 border border-spark/30 bg-spark-soft text-spark hover:bg-spark/20"
              onClick={() =>
                openCoach(
                  `I'm doing ${workout.title} today (${workout.minutes} min, ${workout.intensityLabel}) at ${charge}% Daily Charge. Can you explain this plan and how to get the most out of it?`,
                )
              }
            >
              <MessageCircle size={14} /> Ask AI Coach about this plan
            </button>
          </div>
        </div>
      </section>

      {/* Sticky primary CTA */}
      <div className="sticky bottom-24 z-20 md:bottom-6">
        <button data-testid="log-effort-btn" className="btn-primary w-full py-4 text-base" onClick={openLog}>
          <Flame size={18} /> Log Workout Effort
        </button>
      </div>
    </div>
  );
}

/** Small confetti-like burst for the "all done" state. */
function Burst() {
  const colors = [ZONE_META.prime.color, ZONE_META.steady.color, ZONE_META.recharge.color, '#7C8CFF', '#FF8A3D'];
  const pieces = Array.from({ length: 22 }, (_, i) => {
    const angle = (i / 22) * Math.PI * 2;
    const dist = 70 + (i % 4) * 22;
    return { i, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.7, color: colors[i % colors.length], rot: (i % 2 ? 1 : -1) * 180 };
  });
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-10">
      {pieces.map((p) => (
        <motion.span
          key={p.i}
          className="absolute block h-2 w-1.5 rounded-sm"
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.6, rotate: 0 }}
          animate={{ x: p.x, y: p.y + 30, opacity: 0, scale: 1, rotate: p.rot }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: (p.i % 3) * 0.04 }}
        />
      ))}
    </div>
  );
}
