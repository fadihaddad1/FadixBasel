// Pure, client-side Daily Charge & Burnout Shield math. No side effects.
import type {
  CheckIn,
  DayRecord,
  Exercise,
  SessionType,
  ShieldBand,
  ShieldReading,
  WorkoutLog,
  WorkoutPlan,
  Zone,
} from '../types/wellness';

const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

/** Weights reflect how strongly each signal predicts how a session will feel. */
export const WEIGHTS = { sleep: 0.35, energy: 0.25, soreness: 0.2, stress: 0.2 } as const;

/** Raw 0–100 score from today's check-in alone. */
export function rawScore(c: CheckIn): number {
  const good = (v: number) => (v - 1) / 4; // 1..5 -> 0..1
  const bad = (v: number) => (5 - v) / 4; // inverted
  const s =
    WEIGHTS.sleep * good(c.sleep) +
    WEIGHTS.energy * good(c.energy) +
    WEIGHTS.soreness * bad(c.soreness) +
    WEIGHTS.stress * bad(c.stress);
  return Math.round(s * 100);
}

/** Mean raw score over the last `days` records (the personal baseline). */
export function rollingBaseline(history: DayRecord[], days = 14): number {
  const slice = history.slice(-days);
  if (!slice.length) return 60;
  return slice.reduce((a, d) => a + d.raw, 0) / slice.length;
}

/**
 * Personalized Daily Charge. 70% absolute (how good today is), 30% relative to
 * your own 14-day baseline — so a "normal for you" day lands near 60–70%, and a
 * day well above your usual reads higher than the raw number alone would.
 */
export function dailyCharge(c: CheckIn, history: DayRecord[]): number {
  const raw = rawScore(c);
  const baseline = rollingBaseline(history);
  const relative = clamp(65 + (raw - baseline) * 1.4);
  return Math.round(clamp(raw * 0.7 + relative * 0.3, 3, 99));
}

export function zoneFor(charge: number): Zone {
  if (charge >= 72) return 'prime';
  if (charge >= 52) return 'steady';
  return 'recharge';
}

export const ZONE_META: Record<
  Zone,
  { name: string; verdict: string; short: string; color: string; soft: string; emoji: string; blurb: string }
> = {
  prime: {
    name: 'Prime',
    verdict: 'Push Today',
    short: 'Green day',
    color: '#2EE6A6',
    soft: 'rgba(46,230,166,0.12)',
    emoji: '⚡',
    blurb: "You're well rested and fresh. Today is a great day to go for a heavier lift or a faster run.",
  },
  steady: {
    name: 'Steady',
    verdict: 'Pace Yourself',
    short: 'Amber day',
    color: '#FFB547',
    soft: 'rgba(255,181,71,0.12)',
    emoji: '🌤️',
    blurb: "You're okay, not your best. Train, but dial it back about 15% and skip personal records today.",
  },
  recharge: {
    name: 'Recharge',
    verdict: 'Active Recovery',
    short: 'Red day',
    color: '#FF6B6B',
    soft: 'rgba(255,107,107,0.12)',
    emoji: '🌙',
    blurb: 'Your body is asking for a break. A gentle 20-minute flow today keeps your streak and protects next week.',
  },
};

/** Explain which input is dragging the score down (or lifting it), in plain words. */
export function chargeDrivers(c: CheckIn): { label: string; impact: 'up' | 'down' }[] {
  const out: { label: string; impact: 'up' | 'down' }[] = [];
  if (c.sleep <= 2) out.push({ label: 'Short or rough sleep', impact: 'down' });
  if (c.sleep >= 4) out.push({ label: 'Solid sleep', impact: 'up' });
  if (c.soreness >= 4) out.push({ label: 'Sore muscles', impact: 'down' });
  if (c.energy >= 4) out.push({ label: 'High energy', impact: 'up' });
  if (c.energy <= 2) out.push({ label: 'Low energy', impact: 'down' });
  if (c.stress >= 4) out.push({ label: 'High stress', impact: 'down' });
  if (c.stress <= 2) out.push({ label: 'Calm mind', impact: 'up' });
  return out;
}

// ---------------- Burnout Shield (acute:chronic workload) ----------------

export const sessionLoad = (l: WorkoutLog) => l.effort * l.minutes;

function daysBetween(a: string, b: string) {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86_400_000);
}

/**
 * Acute load = last 7 days. Chronic load = average weekly load over the last 28 days.
 * Ratio 0.8–1.3 is the "sweet spot" commonly cited in safe-progression research.
 */
export function burnoutShield(logs: WorkoutLog[], today: string): ShieldReading {
  const within = (n: number) => logs.filter((l) => {
    const d = daysBetween(today, l.date);
    return d >= 0 && d < n;
  });
  const acute = within(7).reduce((a, l) => a + sessionLoad(l), 0);
  const chronic = within(28).reduce((a, l) => a + sessionLoad(l), 0) / 4;
  const ratio = chronic > 0 ? +(acute / chronic).toFixed(2) : 1;
  let band: ShieldBand = 'sweet';
  if (ratio < 0.8) band = 'under';
  else if (ratio > 1.5) band = 'over';
  else if (ratio > 1.3) band = 'caution';
  return { ratio, band, acuteLoad: Math.round(acute), chronicLoad: Math.round(chronic), ...SHIELD_COPY[band] };
}

export const SHIELD_COPY: Record<ShieldBand, { label: string; advice: string }> = {
  under: {
    label: 'Under-training',
    advice: "You've done less than usual this week. Safe to add a session or a little more effort.",
  },
  sweet: {
    label: 'Fitness Sweet Spot',
    advice: "You're building fitness at a pace your body can absorb. Keep doing exactly this.",
  },
  caution: {
    label: 'Ramping Fast',
    advice: "This week is noticeably harder than your usual. Hold steady — don't add more yet.",
  },
  over: {
    label: 'Overdoing It',
    advice: 'Your recent load jumped way above normal — that is when injuries and burnout happen. Take an easy day.',
  },
};

/** Map ratio (0.4–2.0) to 0–1 for a gauge needle. */
export function shieldPosition(ratio: number) {
  return Math.min(1, Math.max(0, (ratio - 0.4) / 1.6));
}

// ---------------- Smart Workout Auto-Adjuster ----------------

export const BASE_SESSIONS: Record<SessionType, { title: string; minutes: number; exercises: Exercise[] }> = {
  legs: {
    title: 'Lower Body Strength',
    minutes: 50,
    exercises: [
      { id: 'sq', name: 'Back Squat', sets: 4, reps: '6', load: 'Working weight', restSec: 150, emoji: '🏋️' },
      { id: 'rdl', name: 'Romanian Deadlift', sets: 3, reps: '8', load: 'Working weight', restSec: 120, emoji: '🦵' },
      { id: 'lunge', name: 'Walking Lunges', sets: 3, reps: '10 / leg', load: 'Moderate dumbbells', restSec: 90, emoji: '🚶' },
      { id: 'calf', name: 'Calf Raises', sets: 3, reps: '15', load: 'Bodyweight + pause', restSec: 60, emoji: '🦶' },
    ],
  },
  upper: {
    title: 'Upper Body Push & Pull',
    minutes: 45,
    exercises: [
      { id: 'bench', name: 'Bench Press', sets: 4, reps: '6', load: 'Working weight', restSec: 150, emoji: '🏋️' },
      { id: 'row', name: 'Bent-Over Row', sets: 4, reps: '8', load: 'Working weight', restSec: 120, emoji: '💪' },
      { id: 'ohp', name: 'Overhead Press', sets: 3, reps: '8', load: 'Moderate', restSec: 90, emoji: '🙌' },
      { id: 'pull', name: 'Lat Pulldown', sets: 3, reps: '10', load: 'Moderate', restSec: 75, emoji: '🧗' },
    ],
  },
  run: {
    title: 'Tempo Run',
    minutes: 40,
    exercises: [
      { id: 'wu', name: 'Easy Warm-up Jog', sets: 1, reps: '10 min', load: 'Chatty pace', restSec: 0, emoji: '🏃' },
      { id: 'tempo', name: 'Tempo Intervals', sets: 3, reps: '6 min', load: 'Comfortably hard', restSec: 120, emoji: '🔥' },
      { id: 'strides', name: 'Strides', sets: 4, reps: '20 sec', load: 'Quick & relaxed', restSec: 60, emoji: '💨' },
      { id: 'cd', name: 'Cool-down Walk', sets: 1, reps: '5 min', load: 'Easy', restSec: 0, emoji: '🚶' },
    ],
  },
  full: {
    title: 'Full Body Circuit',
    minutes: 40,
    exercises: [
      { id: 'gob', name: 'Goblet Squat', sets: 3, reps: '10', load: 'Moderate', restSec: 60, emoji: '🏋️' },
      { id: 'push', name: 'Push-ups', sets: 3, reps: '12', load: 'Bodyweight', restSec: 60, emoji: '💪' },
      { id: 'kb', name: 'Kettlebell Swings', sets: 3, reps: '15', load: 'Moderate', restSec: 60, emoji: '🔔' },
      { id: 'plank', name: 'Plank', sets: 3, reps: '40 sec', load: 'Bodyweight', restSec: 45, emoji: '🧘' },
    ],
  },
};

export const RECOVERY_FLOW: Exercise[] = [
  { id: 'walk', name: 'Brisk Outdoor Walk', sets: 1, reps: '10 min', load: 'Easy, nose-breathing', restSec: 0, emoji: '🚶' },
  { id: 'cat', name: 'Cat-Cow + Thoracic Rotations', sets: 2, reps: '8 each', load: 'Slow & gentle', restSec: 15, emoji: '🐈' },
  { id: 'hip', name: "90/90 Hip Switches", sets: 2, reps: '10', load: 'Gentle', restSec: 15, emoji: '🦵' },
  { id: 'glute', name: 'Glute Bridge Hold', sets: 2, reps: '30 sec', load: 'Bodyweight', restSec: 15, emoji: '🌉' },
  { id: 'breath', name: 'Box Breathing', sets: 1, reps: '3 min', load: '4-4-4-4 count', restSec: 0, emoji: '🫁' },
];

/** Adapt a base session to today's zone. Pure. */
export function adjustWorkout(type: SessionType, zone: Zone, charge: number): WorkoutPlan {
  const base = BASE_SESSIONS[type];
  if (zone === 'recharge') {
    return {
      id: `${type}-recharge`,
      sessionType: type,
      title: '20-Min Mobility + Walk',
      subtitle: `Swapped from ${base.title} — your body needs recovery today`,
      zone,
      minutes: 20,
      intensityLabel: 'Easy · RPE 3',
      intensityDelta: -100,
      exercises: RECOVERY_FLOW,
      coachNote: `At ${charge}% charge, a hard ${base.title.toLowerCase()} session would cost more than it builds. Move gently, keep your streak, and come back stronger tomorrow.`,
    };
  }
  if (zone === 'steady') {
    return {
      id: `${type}-steady`,
      sessionType: type,
      title: base.title,
      subtitle: 'Dialed back 15% — quality reps, no personal records',
      zone,
      minutes: Math.round(base.minutes * 0.85),
      intensityLabel: 'Moderate · RPE 6',
      intensityDelta: -15,
      exercises: base.exercises.map((e) => ({
        ...e,
        sets: Math.max(1, e.sets - (e.sets >= 4 ? 1 : 0)),
        load: e.load === 'Working weight' ? '85% of working weight' : e.load,
      })),
      coachNote: `${charge}% is a solid "show up" day. Fewer sets, lighter loads, leave 3–4 reps in the tank on everything.`,
    };
  }
  return {
    id: `${type}-prime`,
    sessionType: type,
    title: base.title,
    subtitle: "Full send — you're fresh enough to push",
    zone,
    minutes: base.minutes + 5,
    intensityLabel: 'Hard · RPE 8',
    intensityDelta: 5,
    exercises: base.exercises.map((e, i) => ({
      ...e,
      sets: i === 0 ? e.sets + 1 : e.sets,
      load: e.load === 'Working weight' ? 'Heavy — 2 reps left in tank' : e.load,
    })),
    coachNote: `${charge}% charge — this is the day to chase a little progress. Add weight on your first lift if it moves well.`,
  };
}

// ---------------- Mock history helpers ----------------

export function isoDaysAgo(n: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
