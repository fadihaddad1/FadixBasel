import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../../state/AppState';
import { EASE, Reveal, SectionHeading } from '../shared';

type Billing = 'monthly' | 'yearly';

const FREE = ['Daily 10-second check-in', 'Daily Charge score', '7-day history'];
const PRO = ['Everything in Free', 'Smart workout auto-adjuster', 'Burnout Shield', 'AI Pocket Coach', 'Unlimited history & trends'];

const FAQ = [
  {
    q: 'Do I really not need a smartwatch?',
    a: 'Really. DayGauge reads how you feel from four quick sliders. Research shows how you rate your own sleep, soreness and stress tracks readiness surprisingly well — and you always have your phone.',
  },
  {
    q: 'What happens after the 7-day free trial?',
    a: "You pick: keep Pro on the plan you chose, or drop back to the Free Forever plan. We'll remind you before the trial ends, and you can cancel in one tap.",
  },
  {
    q: "I'm a total beginner. Is this for me?",
    a: 'Yes — it was built for everyday people. Every number comes with a plain-English sentence, and the workouts scale down as easily as they scale up.',
  },
  {
    q: 'Is my check-in data private?',
    a: 'Your check-ins are yours. We never sell your data, and you can export or delete it whenever you like.',
  },
];

export function Pricing() {
  const { openTrial, setView, setTab } = useApp();
  const [billing, setBilling] = useState<Billing>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const yearly = billing === 'yearly';

  return (
    <section id="pricing" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Go Pro when you're ready."
          sub="Less than one drop-in class a month — and it shows up for you every single morning."
        />

        <Reveal className="mt-10 flex justify-center">
          <div role="radiogroup" aria-label="Billing period" className="relative inline-flex rounded-full border border-white/[0.08] bg-white/[0.04] p-1">
            {(['monthly', 'yearly'] as const).map((b) => {
              const active = billing === b;
              return (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setBilling(b)}
                  className={`relative z-10 flex min-h-[40px] items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors ${
                    active ? 'text-ink-950' : 'text-ink-300 hover:text-ink-100'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="billing-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-ink-100"
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    />
                  )}
                  {b === 'monthly' ? 'Monthly' : 'Yearly'}
                  {b === 'yearly' && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-prime text-ink-950' : 'bg-prime/15 text-prime'}`}>
                      -34%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          {/* Free */}
          <Reveal className="card flex flex-col p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-ink-100">Free Forever</h3>
            <p className="mt-1 text-sm text-ink-400">Build the 10-second habit.</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="font-display text-5xl font-extrabold text-ink-100">$0</span>
              <span className="mb-1.5 text-sm text-ink-400">/ forever</span>
            </div>
            <p className="mt-1 h-5 text-xs text-ink-400">No card needed.</p>
            <ul className="mt-6 flex-1 space-y-3">
              {FREE.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-ink-300">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.08] text-ink-100">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setView('app');
                setTab('today');
              }}
              className="btn-ghost mt-8 w-full py-3.5"
            >
              Start Free
            </button>
          </Reveal>

          {/* Pro */}
          <Reveal delay={0.08} className="relative">
            <div aria-hidden className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-prime/60 via-steady/30 to-spark/50 opacity-70 blur-[1px]" />
            <div className="card relative flex h-full flex-col bg-ink-900 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-xl font-bold text-ink-100">DayGauge Pro</h3>
                <span className="chip border-prime/30 bg-prime/10 font-bold text-prime">
                  <Sparkles size={12} /> Most popular
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-400">Train smarter, not just harder.</p>
              <div className="mt-6 flex items-end gap-2">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={billing}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="font-display text-5xl font-extrabold text-ink-100"
                  >
                    {yearly ? '$79' : '$9.99'}
                  </motion.span>
                </AnimatePresence>
                <span className="mb-1.5 text-sm text-ink-400">{yearly ? '/ year' : '/ month'}</span>
                {yearly && (
                  <span className="mb-2 rounded-full bg-prime px-2 py-0.5 text-[11px] font-bold text-ink-950">Save 34%</span>
                )}
              </div>
              <p className="mt-1 h-5 text-xs text-ink-400">
                {yearly ? 'Just $6.58/mo, billed yearly.' : 'Billed monthly. Switch to yearly to save 34%.'}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {PRO.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-ink-100">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-prime text-ink-950">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => openTrial(billing)} className="btn-primary mt-8 w-full py-3.5">
                Start 7-Day Free Trial
              </button>
              <p className="mt-3 text-center text-xs text-ink-400">Cancel anytime during the trial — no charge.</p>
            </div>
          </Reveal>
        </div>

        {/* FAQ */}
        <Reveal className="mx-auto mt-16 max-w-2xl">
          <h3 className="text-center font-display text-2xl font-bold text-ink-100">Questions, answered</h3>
          <div className="mt-6 space-y-3">
            {FAQ.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`faq-${i}`}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-ink-100">{f.q}</span>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 text-ink-400">
                      <ChevronDown size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`faq-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-ink-400">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
