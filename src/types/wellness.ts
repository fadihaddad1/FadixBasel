// Shared DayGauge domain types. Every feature imports from here.

/** Each check-in input is a 1–5 step. */
export type Step = 1 | 2 | 3 | 4 | 5;

export interface CheckIn {
  /** 1 = awful sleep, 5 = slept great */
  sleep: Step;
  /** 1 = no soreness, 5 = very sore (higher is worse) */
  soreness: Step;
  /** 1 = drained, 5 = buzzing */
  energy: Step;
  /** 1 = calm, 5 = maxed out (higher is worse) */
  stress: Step;
}

export type CheckInKey = keyof CheckIn;

/** Prime = green "Push Today", Steady = amber "Pace Yourself", Recharge = red "Active Recovery". */
export type Zone = 'prime' | 'steady' | 'recharge';

export interface DayRecord {
  /** ISO date yyyy-mm-dd */
  date: string;
  checkIn: CheckIn;
  /** Raw 0–100 wellness score before personalization */
  raw: number;
  /** Personalized 0–100 Daily Charge */
  charge: number;
}

export interface WorkoutLog {
  date: string;
  /** Session RPE 1–10 */
  effort: number;
  minutes: number;
  title: string;
}

export type ShieldBand = 'under' | 'sweet' | 'caution' | 'over';

export interface ShieldReading {
  /** Acute:chronic workload ratio */
  ratio: number;
  band: ShieldBand;
  acuteLoad: number;
  chronicLoad: number;
  label: string;
  advice: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  /** Plain-language load cue, e.g. "Heavy — 2 reps left in the tank" */
  load: string;
  restSec: number;
  emoji: string;
}

export type SessionType = 'legs' | 'upper' | 'run' | 'full';

export interface WorkoutPlan {
  id: string;
  sessionType: SessionType;
  title: string;
  subtitle: string;
  zone: Zone;
  minutes: number;
  intensityLabel: string;
  /** -15 for steady etc. 0 = as written. */
  intensityDelta: number;
  exercises: Exercise[];
  coachNote: string;
}

export type AppTab = 'today' | 'workout' | 'trends' | 'profile';
export type View = 'landing' | 'app';
export type Plan = 'free' | 'trial' | 'pro';

export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone?: 'success' | 'info' | 'warn';
}
