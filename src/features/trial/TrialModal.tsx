import { motion } from 'framer-motion';
import { Bell, Check, CreditCard, Crown, Loader2, MessageCircle, ShieldCheck, Sparkles, Wand2, Infinity as InfinityIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../state/AppState';

type Billing = 'monthly' | 'yearly';
type Stage = 'form' | 'loading' | 'success';

const PRICES: Record<Billing, { price: string; per: string; note: string }> = {
  monthly: { price: '$9.99', per: '/mo', note: 'billed monthly from day 7' },
  yearly: { price: '$79', per: '/yr', note: 'just $6.58/mo, billed yearly from day 7' },
};

const FEATURES = [
  { icon: Wand2, title: 'Smart workout auto-adjuster', body: 'Your plan reshapes itself to your Daily Charge every morning.' },
  { icon: ShieldCheck, title: 'Burnout Shield', body: 'Know when you are ramping too fast — before it turns into an injury.' },
  { icon: MessageCircle, title: 'AI Pocket Coach', body: 'Ask anything, get one-tap workout swaps.' },
  { icon: InfinityIcon, title: 'Unlimited history', body: 'Every check-in and workout, forever.' },
];

const TIMELINE = [
  { icon: Sparkles, when: 'Today', what: 'Full Pro access unlocks', color: '#2EE6A6' },
  { icon: Bell, when: 'Day 5', what: "We'll remind you before it ends", color: '#FFB547' },
  { icon: CreditCard, when: 'Day 7', what: 'Billing starts — cancel anytime', color: '#7C8CFF' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2 + (i % 3) * 0.2;
        const dist = 90 + ((i * 37) % 70);
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 30,
          rot: (i * 47) % 360,
          color: ['#2EE6A6', '#FFB547', '#FF6B6B', '#7C8CFF', '#FF8A3D'][i % 5],
          w: i % 2 ? 6 : 9,
          h: i % 2 ? 10 : 5,
          delay: (i % 6) * 0.02,
        };
      }),
    [],
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-12 h-0 w-0">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-[2px]"
          style={{ width: p.w, height: p.h, background: p.color, left: -p.w / 2, top: -p.h / 2 }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 120], opacity: [0, 1, 0], rotate: p.rot + 180, scale: 1 }}
          transition={{ duration: 1.6, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

export function TrialModal() {
  const { trialOpen, closeTrial, trialBilling, startTrial, plan, setView, setTab, userName } = useApp();
  const [billing, setBilling] = useState<Billing>(trialBilling);
  const [stage, setStage] = useState<Stage>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false });
  const timer = useRef<number | null>(null);

  // Reset each time the modal opens.
  useEffect(() => {
    if (trialOpen) {
      setBilling(trialBilling);
      setStage('form');
      setTouched({ name: false, email: false });
      setName((n) => n || userName);
    }
  }, [trialOpen, trialBilling, userName]);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const nameErr = name.trim().length < 2 ? 'Please enter your name.' : '';
  const emailErr = !email.trim() ? 'Please enter your email.' : !EMAIL_RE.test(email.trim()) ? "That email doesn't look quite right." : '';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (nameErr || emailErr || stage !== 'form') return;
    setStage('loading');
    timer.current = window.setTimeout(() => setStage('success'), 1200);
  };

  const goToApp = () => {
    if (plan === 'free') startTrial();
    closeTrial();
    setView('app');
    setTab('today');
  };

  const onClose = () => {
    if (timer.current) window.clearTimeout(timer.current);
    // If they finished signing up but closed instead of tapping the CTA, still activate.
    if (stage === 'success' && plan === 'free') startTrial();
    if (stage === 'loading') setStage('form');
    closeTrial();
  };

  const alreadyPro = (plan === 'trial' || plan === 'pro') && stage !== 'success';
  const p = PRICES[billing];

  return (
    <Modal open={trialOpen} onClose={onClose} title="Start your DayGauge Pro trial" maxWidth="max-w-lg">
      <div data-testid="trial-modal" className="relative">
        {alreadyPro ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-prime/15 text-prime shadow-[0_0_40px_-6px_rgba(46,230,166,0.6)]">
              <Crown size={28} />
            </div>
            <h2 className="mt-4 font-display text-2xl font-extrabold">You're on Pro ✓</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink-400">
              {plan === 'trial' ? 'Your 7-day free trial is active. ' : ''}Smart workouts, Burnout Shield and the AI Pocket Coach are all unlocked.
            </p>
            <button className="btn-primary mt-6 w-full sm:w-auto" onClick={goToApp}>
              Go to my app
            </button>
          </div>
        ) : stage === 'success' ? (
          <div className="relative py-6 text-center">
            <Confetti />
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-prime text-ink-950 shadow-[0_0_50px_-6px_rgba(46,230,166,0.8)]"
            >
              <Check size={38} strokeWidth={3} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="mt-5 font-display text-2xl font-extrabold">You're in, {name.trim().split(' ')[0] || 'friend'}! 🎉</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-400">
                Your 7-day DayGauge Pro trial is ready. We'll remind you on day 5 — no surprises.
              </p>
              <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left text-sm">
                {FEATURES.map((f) => (
                  <li key={f.title} className="flex items-center gap-2 text-ink-100">
                    <Check size={15} className="text-prime" /> {f.title}
                  </li>
                ))}
              </ul>
              <button className="btn-primary mt-6 w-full" onClick={goToApp}>
                Go to my app
              </button>
            </motion.div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="pr-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-prime/20 to-spark/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-prime">
                <Crown size={12} /> DayGauge Pro
              </span>
              <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-[28px]">Start your 7-day free trial</h2>
              <p className="mt-1 text-sm text-ink-400">Know when to push, know when to recover — with every Pro tool unlocked.</p>
            </div>

            {/* Billing toggle */}
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5" role="radiogroup" aria-label="Billing period">
              {(['monthly', 'yearly'] as const).map((b) => {
                const on = billing === b;
                return (
                  <button
                    type="button"
                    key={b}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setBilling(b)}
                    className={`relative min-h-[60px] rounded-xl px-3 py-2 text-left transition-colors ${on ? 'text-ink-950' : 'text-ink-300 hover:text-ink-100'}`}
                  >
                    {on && <motion.span layoutId="trial-billing" className="absolute inset-0 rounded-xl bg-ink-100" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                    <span className="relative block text-xs font-semibold">{b === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                    <span className="relative block font-display text-base font-bold">
                      {PRICES[b].price}
                      <span className="text-xs font-semibold opacity-70">{PRICES[b].per}</span>
                    </span>
                    {b === 'yearly' && (
                      <span className="absolute right-2 top-2 rounded-full bg-prime px-2 py-0.5 text-[10px] font-bold text-ink-950">Save 34%</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-ink-400">
              $0 today · then {p.price}
              {p.per} · {p.note}
            </p>

            {/* Features */}
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-prime" style={{ background: 'rgba(46,230,166,0.12)' }}>
                    <f.icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-sm font-semibold text-ink-100">
                      {f.title} <Check size={13} className="text-prime" />
                    </div>
                    <div className="text-xs leading-snug text-ink-400">{f.body}</div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Timeline */}
            <ol className="relative mt-6 grid grid-cols-3 gap-2">
              <div className="absolute left-[16%] right-[16%] top-4 h-0.5 bg-gradient-to-r from-prime via-steady to-spark opacity-50" />
              {TIMELINE.map((t) => (
                <li key={t.when} className="relative flex flex-col items-center text-center">
                  <span className="grid h-8 w-8 place-items-center rounded-full border-2 bg-ink-900" style={{ borderColor: t.color, color: t.color }}>
                    <t.icon size={14} />
                  </span>
                  <span className="mt-2 text-xs font-bold text-ink-100">{t.when}</span>
                  <span className="mt-0.5 text-[11px] leading-snug text-ink-400">{t.what}</span>
                </li>
              ))}
            </ol>

            {/* Form */}
            <div className="mt-6 space-y-3">
              <Field
                label="Your name"
                value={name}
                onChange={setName}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                error={touched.name ? nameErr : ''}
                autoComplete="name"
                placeholder="Alex Rivera"
              />
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                error={touched.email ? emailErr : ''}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <button data-testid="trial-start" type="submit" className="btn-primary mt-5 w-full py-3.5 text-base" disabled={stage === 'loading'}>
              {stage === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Setting up your trial…
                </>
              ) : (
                'Start Free Trial'
              )}
            </button>
            <p className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-center text-xs text-ink-400">
              🔒 Prototype — no card required, no real payment.
            </p>
          </form>
        )}
      </div>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  const id = `trial-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`min-h-[48px] w-full rounded-2xl border bg-ink-800 px-4 text-[16px] text-ink-100 placeholder:text-ink-400 focus:outline-none sm:text-sm ${
          error ? 'border-recharge/70 focus:border-recharge' : 'border-white/[0.08] focus:border-prime/60'
        }`}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs text-recharge">
          {error}
        </p>
      )}
    </div>
  );
}
