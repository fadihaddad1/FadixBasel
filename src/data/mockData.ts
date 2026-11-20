import type { CheckIn, DayRecord, Step, WorkoutLog } from '../types/wellness';
import { isoDaysAgo, rawScore } from '../utils/recoveryEngine';

// Deterministic pseudo-random so screenshots are stable.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rnd = seeded(42);
const step = (center: number, spread = 1.2): Step =>
  Math.min(5, Math.max(1, Math.round(center + (rnd() - 0.5) * 2 * spread))) as Step;

/** 27 past days of check-ins (today is not included). */
export const MOCK_HISTORY: DayRecord[] = Array.from({ length: 27 }, (_, i) => {
  const daysAgo = 27 - i;
  const c: CheckIn = { sleep: step(3.6), soreness: step(2.6), energy: step(3.4), stress: step(2.7) };
  const raw = rawScore(c);
  // Historical charge ≈ raw with mild smoothing; fine for a sparkline.
  return { date: isoDaysAgo(daysAgo), checkIn: c, raw, charge: Math.round(raw * 0.85 + 10) };
});

const TITLES = ['Lower Body Strength', 'Upper Body Push & Pull', 'Tempo Run', 'Full Body Circuit', 'Easy Run'];

/** ~4 sessions/week for 4 weeks, slightly ramping up recently (puts Shield near sweet/caution edge). */
export const MOCK_LOGS: WorkoutLog[] = (() => {
  const r = seeded(7);
  const out: WorkoutLog[] = [];
  for (let d = 27; d >= 1; d--) {
    const trainDay = [0, 2, 3, 5].includes(d % 7);
    if (!trainDay) continue;
    const recent = d < 7;
    out.push({
      date: isoDaysAgo(d),
      effort: Math.round(5 + r() * 2 + (recent ? 1 : 0)),
      minutes: Math.round(40 + r() * 15 + (recent ? 5 : 0)),
      title: TITLES[Math.floor(r() * TITLES.length)],
    });
  }
  return out;
})();

export const DEFAULT_CHECKIN: CheckIn = { sleep: 4, soreness: 2, energy: 4, stress: 2 };

export const USER = {
  firstName: 'Alex',
  streak: 12,
  goal: 'Get stronger without burning out',
};

export const SLIDER_COPY = {
  sleep: { label: 'Sleep Quality', emojis: ['😫', '😪', '😐', '🙂', '😴'], words: ['Awful', 'Rough', 'Okay', 'Good', 'Great'] },
  soreness: { label: 'Muscle Soreness', emojis: ['😌', '🙂', '😐', '😣', '🥵'], words: ['None', 'Light', 'Some', 'Sore', 'Very sore'] },
  energy: { label: 'Daily Energy', emojis: ['🪫', '😮‍💨', '😐', '😊', '⚡'], words: ['Drained', 'Low', 'Okay', 'Good', 'Buzzing'] },
  stress: { label: 'Stress Level', emojis: ['🧘', '🙂', '😐', '😬', '🤯'], words: ['Calm', 'Light', 'Some', 'High', 'Maxed'] },
} as const;
