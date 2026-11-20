import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppTab, CheckIn, CheckInKey, DayRecord, Plan, SessionType, Step, Toast, View, WorkoutLog, WorkoutPlan, Zone } from '../types/wellness';
import { DEFAULT_CHECKIN, MOCK_HISTORY, MOCK_LOGS, USER } from '../data/mockData';
import { adjustWorkout, burnoutShield, dailyCharge, isoDaysAgo, rawScore, zoneFor } from '../utils/recoveryEngine';
import type { ShieldReading } from '../types/wellness';

interface AppState {
  // navigation
  view: View;
  setView: (v: View) => void;
  tab: AppTab;
  setTab: (t: AppTab) => void;

  // overlays
  introOpen: boolean;
  openIntro: () => void;
  closeIntro: () => void;
  trialOpen: boolean;
  openTrial: (billing?: 'monthly' | 'yearly') => void;
  closeTrial: () => void;
  trialBilling: 'monthly' | 'yearly';
  coachOpen: boolean;
  openCoach: (prompt?: string) => void;
  closeCoach: () => void;
  /** A prompt to auto-send when the coach opens (consumed by the drawer). */
  coachSeed: string | null;
  clearCoachSeed: () => void;
  logOpen: boolean;
  openLog: () => void;
  closeLog: () => void;

  // check-in
  checkIn: CheckIn;
  setCheckInValue: (k: CheckInKey, v: Step) => void;
  setCheckIn: (c: CheckIn) => void;
  checkedInToday: boolean;
  submitCheckIn: () => void;
  charge: number;
  zone: Zone;
  history: DayRecord[];

  // workout
  sessionType: SessionType;
  setSessionType: (s: SessionType) => void;
  /** Force a zone for the workout regardless of charge (e.g. coach "Apply swap"). null = auto. */
  zoneOverride: Zone | null;
  setZoneOverride: (z: Zone | null) => void;
  workout: WorkoutPlan;
  completedExercises: Set<string>;
  toggleExercise: (id: string) => void;
  logs: WorkoutLog[];
  logWorkout: (effort: number, minutes: number) => void;
  shield: ShieldReading;

  // account
  plan: Plan;
  startTrial: () => void;
  streak: number;
  userName: string;

  // toasts
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<AppState | null>(null);

const INTRO_SEEN_KEY = 'daygauge.introSeen';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [view, setView] = useState<View>(params?.get('view') === 'app' ? 'app' : 'landing');
  const [tab, setTab] = useState<AppTab>((params?.get('tab') as AppTab) || 'today');
  // Intro shows on every fresh entry unless ?intro=0 (used by screenshots) — spec: "first thing a visitor sees".
  const [introOpen, setIntroOpen] = useState(params?.get('intro') !== '0');
  const [trialOpen, setTrialOpen] = useState(false);
  const [trialBilling, setTrialBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachSeed, setCoachSeed] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);

  const [checkIn, setCheckIn] = useState<CheckIn>(DEFAULT_CHECKIN);
  const [checkedInToday, setCheckedIn] = useState(false);
  const [history, setHistory] = useState<DayRecord[]>(MOCK_HISTORY);

  const [sessionType, setSessionType] = useState<SessionType>('legs');
  const [zoneOverride, setZoneOverride] = useState<Zone | null>(null);
  const [completedExercises, setCompleted] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<WorkoutLog[]>(MOCK_LOGS);
  const [plan, setPlan] = useState<Plan>('free');
  const [streak, setStreak] = useState(USER.streak);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(1);

  const today = isoDaysAgo(0);
  const charge = useMemo(() => dailyCharge(checkIn, history), [checkIn, history]);
  const zone = zoneFor(charge);
  const workout = useMemo(
    () => adjustWorkout(sessionType, zoneOverride ?? zone, charge),
    [sessionType, zoneOverride, zone, charge],
  );
  const shield = useMemo(() => burnoutShield(logs, today), [logs, today]);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = toastId.current++;
    setToasts((ts) => [...ts, { ...t, id }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3800);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((ts) => ts.filter((x) => x.id !== id)), []);

  const value: AppState = {
    view,
    setView: (v) => {
      setView(v);
      window.scrollTo({ top: 0 });
    },
    tab,
    setTab: (t) => {
      setTab(t);
      window.scrollTo({ top: 0 });
    },
    introOpen,
    openIntro: () => setIntroOpen(true),
    closeIntro: () => {
      setIntroOpen(false);
      try {
        localStorage.setItem(INTRO_SEEN_KEY, '1');
      } catch {
        /* ignore */
      }
    },
    trialOpen,
    openTrial: (b) => {
      if (b) setTrialBilling(b);
      setTrialOpen(true);
    },
    closeTrial: () => setTrialOpen(false),
    trialBilling,
    coachOpen,
    openCoach: (p) => {
      if (p) setCoachSeed(p);
      setCoachOpen(true);
    },
    closeCoach: () => setCoachOpen(false),
    coachSeed,
    clearCoachSeed: () => setCoachSeed(null),
    logOpen,
    openLog: () => setLogOpen(true),
    closeLog: () => setLogOpen(false),

    checkIn,
    setCheckInValue: (k, v) => {
      setCheckIn((c) => ({ ...c, [k]: v }));
      setZoneOverride(null);
    },
    setCheckIn: (c) => {
      setCheckIn(c);
      setZoneOverride(null);
    },
    checkedInToday,
    submitCheckIn: () => {
      const rec: DayRecord = { date: today, checkIn, raw: rawScore(checkIn), charge };
      setHistory((h) => [...h.filter((d) => d.date !== today), rec]);
      if (!checkedInToday) setStreak((s) => s + 1);
      setCheckedIn(true);
      toast({ title: `Checked in · ${charge}% Daily Charge`, body: 'Your workout has been adjusted for today.', tone: 'success' });
    },
    charge,
    zone,
    history,

    sessionType,
    setSessionType: (s) => {
      setSessionType(s);
      setCompleted(new Set());
    },
    zoneOverride,
    setZoneOverride,
    workout,
    completedExercises,
    toggleExercise: (id) =>
      setCompleted((s) => {
        const n = new Set(s);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      }),
    logs,
    logWorkout: (effort, minutes) => {
      setLogs((l) => [...l, { date: today, effort, minutes, title: workout.title }]);
      toast({ title: 'Workout logged 💪', body: `${minutes} min at effort ${effort}/10 — Burnout Shield updated.`, tone: 'success' });
    },
    shield,

    plan,
    startTrial: () => {
      setPlan('trial');
      toast({ title: 'Your 7-day Pro trial is active 🎉', body: 'Smart workouts, Burnout Shield and AI Coach unlocked.', tone: 'success' });
    },
    streak,
    userName: USER.firstName,

    toasts,
    toast,
    dismissToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be inside AppStateProvider');
  return v;
}
