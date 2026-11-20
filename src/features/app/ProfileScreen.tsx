import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Crown, Lock, Moon, PlayCircle, Ruler, Target, Volume2, type LucideIcon } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { useApp } from '../../state/AppState';
import { USER } from '../../data/mockData';
import { FounderBadge, FOUNDER_NAME } from '../../components/brand/Founder';
import { Logo } from '../../components/brand/Logo';

const APP_VERSION = '1.0.0';
const REMINDER_TIMES = ['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM'];

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, delay: 0.05 * i },
});

function Switch({ on, locked = false }: { on: boolean; locked?: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 ${
        on ? (locked ? 'bg-prime/50' : 'bg-prime') : 'bg-white/[0.12]'
      }`}
    >
      <motion.span
        className="grid h-6 w-6 place-items-center rounded-full bg-white shadow-md"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {locked && <Lock size={11} className="text-ink-700" />}
      </motion.span>
    </span>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  hint,
  on,
  onToggle,
  locked,
  testId,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
  locked?: boolean;
  testId?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      data-testid={testId}
      onClick={onToggle}
      className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/[0.04]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-ink-300">
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink-100">{label}</span>
        <span className="block text-xs text-ink-400">{hint}</span>
      </span>
      <Switch on={on} locked={locked} />
    </button>
  );
}

export function ProfileScreen() {
  const { userName, plan, openTrial, toast, streak, history, logs, openIntro, setView } = useApp();
  const [reminder, setReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('7:00 AM');
  const [voice, setVoice] = useState(false);
  const [metric, setMetric] = useState(true);
  const selectId = useId();

  const planCopy = {
    free: { name: 'Free', desc: 'Daily Charge, Morning Check-In and a basic plan.', cta: 'Start 7-day free trial' },
    trial: { name: 'Pro Trial', desc: 'All Pro features unlocked for 7 days. No charge until it ends.', cta: 'Manage trial' },
    pro: { name: 'Pro', desc: 'Smart workouts, Burnout Shield history and unlimited AI Coach.', cta: 'Manage subscription' },
  }[plan];

  const onPlanAction = () => {
    if (plan === 'free') openTrial();
    else
      toast({
        title: plan === 'trial' ? 'Trial: 7 days left' : 'Subscription is active',
        body: 'Billing management opens in the App Store or Google Play in the full release.',
        tone: 'info',
      });
  };

  const stats = [
    { label: 'Day streak', value: `${streak}🔥` },
    { label: 'Check-ins', value: String(history.length) },
    { label: 'Workouts logged', value: String(logs.length) },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Identity */}
      <motion.section {...fadeUp(0)} className="card relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-spark/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-spark to-prime font-display text-3xl font-extrabold text-ink-950 shadow-[0_10px_40px_-10px_rgba(124,140,255,0.7)]">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-extrabold text-ink-100">{userName}</h2>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-400">
                <Target size={15} className="mt-0.5 shrink-0 text-prime" />
                <span>{USER.goal}</span>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:ml-auto sm:w-[340px]">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/[0.04] px-3 py-2.5 text-center">
                <div className="font-display text-xl font-extrabold text-ink-100">{s.value}</div>
                <div className="text-[11px] text-ink-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
        {/* Plan */}
        <motion.section
          {...fadeUp(1)}
          className={`card relative flex flex-col overflow-hidden p-5 sm:p-6 ${plan === 'free' ? '' : 'border-spark/30'}`}
        >
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-prime/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="eyebrow">Your plan</div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                plan === 'free' ? 'bg-white/[0.06] text-ink-300' : 'bg-spark/15 text-spark'
              }`}
            >
              {plan !== 'free' && <Crown size={12} />} {planCopy.name}
            </span>
          </div>
          <h3 className="relative mt-2 font-display text-xl font-extrabold text-ink-100">
            {plan === 'free' ? 'Unlock DayGauge Pro' : `You're on ${planCopy.name}`}
          </h3>
          <p className="relative mt-1 text-sm text-ink-400">{planCopy.desc}</p>
          {plan === 'free' && (
            <ul className="relative mt-3 space-y-1.5 text-sm text-ink-300">
              <li>⚡ Smart Workout Auto-Adjuster</li>
              <li>🛡️ Burnout Shield with weekly history</li>
              <li>✨ Unlimited AI Pocket Coach</li>
            </ul>
          )}
          <button
            type="button"
            onClick={onPlanAction}
            className={`relative mt-5 w-full ${plan === 'free' ? 'btn-primary' : 'btn-ghost'} lg:mt-auto`}
          >
            {plan === 'free' && <Crown size={16} />} {planCopy.cta}
          </button>
        </motion.section>

        {/* Settings */}
        <motion.section {...fadeUp(2)} className="card p-3 sm:p-4">
          <div className="eyebrow px-3 pb-1 pt-2">Settings</div>
          <ToggleRow
            icon={Bell}
            label="Morning reminder"
            hint={reminder ? `We'll nudge you at ${reminderTime}` : 'Off — check in whenever you like'}
            on={reminder}
            testId="toggle-reminder"
            onToggle={() => {
              const next = !reminder;
              setReminder(next);
              toast({ title: next ? `Reminder on · ${reminderTime}` : 'Morning reminder off', tone: 'info' });
            }}
          />
          <Collapse show={reminder}>
            <label htmlFor={selectId} className="flex items-center gap-3 px-3 py-2">
              <span className="w-9 shrink-0" />
              <span className="flex-1 text-sm text-ink-300">Reminder time</span>
              <select
                id={selectId}
                value={reminderTime}
                disabled={!reminder}
                onChange={(e) => {
                  setReminderTime(e.target.value);
                  toast({ title: `Reminder set for ${e.target.value}`, body: 'Your 10-second check-in will be waiting.', tone: 'success' });
                }}
                className="h-10 rounded-2xl border border-white/[0.08] bg-ink-800 px-3 text-sm font-semibold text-ink-100 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {REMINDER_TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </Collapse>
          <ToggleRow
            icon={Volume2}
            label="Voice coach"
            hint={voice ? 'Spoken cues during workouts' : 'Text-only cues'}
            on={voice}
            testId="toggle-voice"
            onToggle={() => {
              const next = !voice;
              setVoice(next);
              toast({ title: next ? 'Voice coach on 🔊' : 'Voice coach off', body: next ? "You'll hear rest timers and form cues." : undefined, tone: 'info' });
            }}
          />
          <ToggleRow
            icon={Ruler}
            label="Metric units"
            hint={metric ? 'Kilograms · kilometers' : 'Pounds · miles'}
            on={metric}
            testId="toggle-metric"
            onToggle={() => {
              const next = !metric;
              setMetric(next);
              toast({ title: next ? 'Using kg & km' : 'Using lb & mi', tone: 'info' });
            }}
          />
          <ToggleRow
            icon={Moon}
            label="Dark mode"
            hint="Always on — easy on early-morning eyes"
            on
            locked
            testId="toggle-dark"
            onToggle={() =>
              toast({ title: 'Dark mode is locked on 🌙', body: 'DayGauge is designed for 6 AM check-ins. A light theme is on the roadmap.', tone: 'info' })
            }
          />
        </motion.section>
      </div>

      {/* Shortcuts */}
      <motion.section {...fadeUp(3)} className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={openIntro} className="btn-ghost w-full py-3.5">
          <PlayCircle size={17} /> Replay 30s Intro
        </button>
        <button type="button" onClick={() => setView('landing')} className="btn-ghost w-full py-3.5">
          <ArrowLeft size={17} /> Back to website
        </button>
      </motion.section>

      {/* About */}
      <motion.section {...fadeUp(4)} className="card relative overflow-hidden p-5 text-center sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-72 rounded-full bg-gradient-to-r from-recharge/15 via-steady/15 to-prime/15 blur-3xl" />
        <div className="relative flex flex-col items-center">
          <Logo size={40} />
          <p className="mt-4 max-w-md font-display text-lg font-bold leading-snug text-ink-100 sm:text-xl">
            Know When to Push. Know When to Recover.{' '}
            <span className="text-gradient">No Smartwatch Required.</span>
          </p>
          <p className="mt-2 max-w-md text-sm text-ink-400">
            A 10-second morning check-in becomes your Daily Charge and a workout that adapts to how you actually feel.
          </p>
          <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-2 rounded-3xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
            <FounderBadge className="text-sm" />
            <p className="text-xs text-ink-400">
              DayGauge was founded by <span className="font-semibold text-ink-100">{FOUNDER_NAME}</span> to help everyday people train smarter, not just harder.
            </p>
          </div>
          <p className="mt-5 text-[11px] text-ink-400">
            Version {APP_VERSION} · Not medical advice — listen to your body.
          </p>
        </div>
      </motion.section>
    </div>
  );
}

/** Collapses a row in/out with a height animation. */
function Collapse({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: show ? 'auto' : 0, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
      aria-hidden={!show}
    >
      {children}
    </motion.div>
  );
}
