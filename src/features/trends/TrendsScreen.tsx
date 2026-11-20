import { AnimatePresence, motion } from 'framer-motion';
import { Activity, BedDouble, ChevronDown, Dumbbell, Flame, MessageCircle, Moon, Plus, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useApp } from '../../state/AppState';
import { isoDaysAgo, rollingBaseline, sessionLoad, ZONE_META, zoneFor } from '../../utils/recoveryEngine';
import type { DayRecord, WorkoutLog } from '../../types/wellness';
import { ChargeTrendChart, type ChargePoint } from './ChargeTrendChart';
import { bandColor, SHIELD_BANDS, ShieldGauge } from './ShieldGauge';

const RANGES = [7, 14, 28] as const;
type Range = (typeof RANGES)[number];

const daysAgo = (iso: string, today: string) =>
  Math.round((new Date(`${today}T12:00:00`).getTime() - new Date(`${iso}T12:00:00`).getTime()) / 86_400_000);
const fmt = (n: number) => n.toLocaleString('en-US');
const fmtDay = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

const rise = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 },
});

function Card({ children, className = '', i = 0 }: { children: ReactNode; className?: string; i?: number }) {
  return (
    <motion.section {...rise(i)} className={`card p-5 sm:p-6 ${className}`}>
      {children}
    </motion.section>
  );
}

function effortTone(effort: number) {
  if (effort <= 4) return { label: 'Easy', color: '#7C8CFF' };
  if (effort <= 6) return { label: 'Moderate', color: ZONE_META.prime.color };
  if (effort <= 8) return { label: 'Hard', color: ZONE_META.steady.color };
  return { label: 'All-out', color: ZONE_META.recharge.color };
}

/** Simple, plain-language insights computed from mock history + logs. */
function buildInsights(history: DayRecord[], logs: WorkoutLog[]) {
  const trainDates = new Set(logs.map((l) => l.date));
  // Sleep reported the morning after a training day vs after a rest day.
  const nextDay = (iso: string) => {
    const d = new Date(`${iso}T12:00:00`);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  };
  const afterTrain = history.filter((h) => trainDates.has(nextDay(h.date)));
  const afterRest = history.filter((h) => !trainDates.has(nextDay(h.date)));
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const sTrain = avg(afterTrain.map((h) => h.checkIn.sleep));
  const sRest = avg(afterRest.map((h) => h.checkIn.sleep));
  const sleepDiff = Math.round(((sTrain - sRest) / Math.max(1, sRest)) * 100);

  const good = history.filter((h) => h.checkIn.sleep >= 4);
  const poor = history.filter((h) => h.checkIn.sleep <= 3);
  const chargeGap = Math.round(avg(good.map((h) => h.charge)) - avg(poor.map((h) => h.charge)));

  const stressHigh = history.filter((h) => h.checkIn.stress >= 4);
  const stressLow = history.filter((h) => h.checkIn.stress <= 2);
  const stressGap = Math.round(avg(stressLow.map((h) => h.charge)) - avg(stressHigh.map((h) => h.charge)));

  return [
    {
      icon: BedDouble,
      color: '#7C8CFF',
      title: sleepDiff >= 0 ? 'You sleep better on training days' : 'Hard days are costing you sleep',
      body:
        sleepDiff >= 0
          ? `Your sleep score is about ${Math.max(3, sleepDiff)}% higher the night after you train. Movement is helping you wind down.`
          : `Your sleep dips about ${Math.abs(sleepDiff)}% after training. Try finishing hard sessions 3+ hours before bed.`,
    },
    {
      icon: Moon,
      color: ZONE_META.prime.color,
      title: 'Your best days follow 7h+ sleep',
      body: `When you rate your sleep "Good" or better, your Daily Charge runs about ${Math.max(6, chargeGap)} points higher. Sleep is your biggest lever.`,
    },
    {
      icon: Flame,
      color: ZONE_META.steady.color,
      title: 'Stress drains you more than soreness',
      body: `Calm days score about ${Math.max(5, stressGap)} points above stressful ones. A 10-minute walk after work is a cheap fix.`,
    },
  ];
}

export function TrendsScreen() {
  const { shield, logs, history, charge, openLog, openCoach } = useApp();
  const [range, setRange] = useState<Range>(28);
  const [explainOpen, setExplainOpen] = useState(false);
  const today = isoDaysAgo(0);

  // ---- Daily Charge series ----
  const allPoints: ChargePoint[] = useMemo(() => {
    const past = history.filter((d) => d.date !== today).map((d) => ({ date: d.date, charge: d.charge }));
    return [...past, { date: today, charge, isToday: true }];
  }, [history, charge, today]);
  const points = allPoints.slice(-range);
  const baseline = useMemo(() => {
    const past = history.filter((d) => d.date !== today).slice(-14);
    return past.length ? past.reduce((a, d) => a + d.charge, 0) / past.length : rollingBaseline(history);
  }, [history, today]);
  const rangeAvg = Math.round(points.reduce((a, p) => a + p.charge, 0) / Math.max(1, points.length));
  const delta = charge - Math.round(baseline);

  // ---- Weekly load (last 4 weeks, 7-day buckets ending today) ----
  const weeks = useMemo(() => {
    const b = [0, 0, 0, 0];
    const c = [0, 0, 0, 0];
    for (const l of logs) {
      const d = daysAgo(l.date, today);
      if (d < 0 || d >= 28) continue;
      const w = Math.floor(d / 7);
      b[w] += sessionLoad(l);
      c[w] += 1;
    }
    const labels = ['This week', 'Last week', '2 wks ago', '3 wks ago'];
    return b.map((load, i) => ({ load, sessions: c[i], label: labels[i], current: i === 0 })).reverse();
  }, [logs, today]);
  const maxLoad = Math.max(1, ...weeks.map((w) => w.load), shield.chronicLoad);
  const shieldC = bandColor(shield.band);

  // ---- Recent sessions ----
  const recent = useMemo(() => [...logs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, 5), [logs]);
  const insights = useMemo(() => buildInsights(history, logs), [history, logs]);

  return (
    <div data-testid="trends-screen" className="mx-auto w-full min-w-0 max-w-5xl space-y-4 pb-6 sm:space-y-5">
      <motion.header {...rise(0)} className="pt-1">
        <div className="eyebrow">Your progress</div>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-100 sm:text-3xl">Trends & Burnout Shield</h1>
        <p className="mt-1 text-sm text-ink-400">See how your Daily Charge moves, and whether your training pace is safe.</p>
      </motion.header>

      {/* ---------- Burnout Shield hero ---------- */}
      <Card i={1} className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl" style={{ background: `${shieldC}26` }} />
        <div className="relative grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 self-start md:self-center">
              <ShieldCheck size={18} style={{ color: shieldC }} />
              <span className="eyebrow">Burnout Shield</span>
            </div>
            <div className="mt-3 w-full flex justify-center">
              <ShieldGauge ratio={shield.ratio} band={shield.band} />
            </div>
            <div className="-mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-ink-400">
              {SHIELD_BANDS.map((b) => (
                <span key={b.band} className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
                  {b.name}
                </span>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <motion.div key={shield.band} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-extrabold sm:text-4xl" style={{ color: shieldC }}>
              {shield.label}
            </motion.div>
            <p className="mt-2 text-base leading-relaxed text-ink-100">{shield.advice}</p>
            <p className="mt-3 text-xs text-ink-400">
              ratio {shield.ratio.toFixed(2)} · this week {fmt(shield.acuteLoad)} vs usual {fmt(shield.chronicLoad)} load
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={openLog}>
                <Plus size={16} /> Log a workout
              </button>
              <button className="btn-ghost" onClick={() => openCoach('Why is my Burnout Shield here?')}>
                <MessageCircle size={16} className="text-spark" /> Why is my Shield here?
              </button>
            </div>
            <button
              className="mt-4 flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-spark hover:brightness-125"
              onClick={() => setExplainOpen((o) => !o)}
              aria-expanded={explainOpen}
            >
              How is this calculated?
              <ChevronDown size={16} className={`transition-transform ${explainOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {explainOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm leading-relaxed text-ink-300">
                    <p>
                      <strong className="text-ink-100">1. Every workout gets a load score:</strong> how hard it felt (1–10) × how many minutes it lasted. A
                      45-minute session at effort 6 = 270.
                    </p>
                    <p>
                      <strong className="text-ink-100">2. We add up this week</strong> (the last 7 days) and compare it to your usual week — the average
                      of the last 4 weeks.
                    </p>
                    <p>
                      <strong className="text-ink-100">3. The needle shows the difference.</strong> Around the same as usual (0.8–1.3×) is the Sweet Spot,
                      where your body adapts. Jumping far above your usual (over 1.5×) is when injuries and burnout tend to show up.
                    </p>
                    <p className="text-xs text-ink-400">No smartwatch needed — it only uses the workouts you log.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      {/* ---------- Daily Charge trend ---------- */}
      <Card i={2}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-prime" />
              <h2 className="font-display text-lg font-bold">Daily Charge trend</h2>
            </div>
            <p className="mt-1 text-sm text-ink-400">
              {range}-day average <span className="font-semibold text-ink-100">{rangeAvg}%</span> · today is{' '}
              <span className="font-semibold" style={{ color: ZONE_META[zoneFor(charge)].color }}>
                {delta === 0 ? 'right on' : `${Math.abs(delta)} pts ${delta > 0 ? 'above' : 'below'}`}
              </span>{' '}
              your usual
            </p>
          </div>
          <div role="tablist" aria-label="Chart range" className="flex rounded-full border border-white/[0.08] bg-white/[0.04] p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={`relative min-h-[36px] rounded-full px-3.5 text-xs font-semibold transition-colors ${range === r ? 'text-ink-950' : 'text-ink-300 hover:text-ink-100'}`}
              >
                {range === r && <motion.span layoutId="trend-range" className="absolute inset-0 rounded-full bg-ink-100" transition={{ type: 'spring', stiffness: 420, damping: 30 }} />}
                <span className="relative">{r}d</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <ChargeTrendChart points={points} baseline={baseline} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-400">
          {(['prime', 'steady', 'recharge'] as const).map((z) => (
            <span key={z} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: ZONE_META[z].color }} />
              {ZONE_META[z].name} · {ZONE_META[z].verdict}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-dashed border-ink-300" /> 14-day baseline
          </span>
        </div>
      </Card>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        {/* ---------- Weekly load ---------- */}
        <Card i={3}>
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-steady" />
            <h2 className="font-display text-lg font-bold">Weekly training load</h2>
          </div>
          <p className="mt-1 text-sm text-ink-400">Effort × minutes, added up per week. The dashed line is your usual week ({fmt(shield.chronicLoad)}).</p>
          <div className="relative mt-6 h-40">
            <div
              className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-ink-300/60"
              style={{ bottom: `${(shield.chronicLoad / maxLoad) * 82}%` }}
            >
            </div>
            <div className="flex h-full items-end gap-3">
              {weeks.map((w, i) => (
                <div key={w.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                  <div className={`mb-1 text-xs font-semibold ${w.current ? 'text-ink-100' : 'text-ink-400'}`}>{fmt(w.load)}</div>
                  <motion.div
                    className="w-full max-w-[64px] rounded-b-md rounded-t-xl"
                    style={{
                      background: w.current ? `linear-gradient(180deg, ${shieldC}, ${shieldC}88)` : 'rgba(255,255,255,0.1)',
                      boxShadow: w.current ? `0 0 24px -4px ${shieldC}88` : undefined,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(w.load / maxLoad) * 82}%` }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.1 + i * 0.06 }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-3">
            {weeks.map((w) => (
              <div key={w.label} className="min-w-0 flex-1 text-center">
                <div className={`truncate text-[11px] ${w.current ? 'font-semibold text-ink-100' : 'text-ink-400'}`}>{w.label}</div>
                <div className="text-[10px] text-ink-400">{w.sessions} sessions</div>
              </div>
            ))}
          </div>
        </Card>

        {/* ---------- Recent sessions ---------- */}
        <Card i={4}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Dumbbell size={18} className="text-prime" />
              <h2 className="font-display text-lg font-bold">Recent sessions</h2>
            </div>
            <button className="btn-ghost btn-sm" onClick={openLog}>
              <Plus size={14} /> Log
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="mt-6 text-sm text-ink-400">No workouts yet. Log your first one to start your Burnout Shield.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/[0.06]">
              {recent.map((l, i) => {
                const t = effortTone(l.effort);
                return (
                  <li key={`${l.date}-${i}`} className="flex items-center gap-3 py-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[0.05] text-ink-300">
                      <Dumbbell size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-100">{l.title}</div>
                      <div className="text-xs text-ink-400">
                        {l.date === today ? 'Today' : fmtDay(l.date)} · {l.minutes} min
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ color: t.color, background: `${t.color}1F` }}>
                      {t.label} · {l.effort}/10
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* ---------- Insights ---------- */}
      <motion.section {...rise(5)}>
        <div className="mb-3 flex items-center gap-2 px-1">
          <Sparkles size={16} className="text-spark" />
          <h2 className="font-display text-lg font-bold">What your data says</h2>
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {insights.map((ins) => (
            <div key={ins.title} className="card card-hover p-5">
              <div className="grid h-10 w-10 place-items-center rounded-2xl" style={{ background: `${ins.color}1F`, color: ins.color }}>
                <ins.icon size={19} />
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-ink-100">{ins.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">{ins.body}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
