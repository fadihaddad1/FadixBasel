import { motion } from 'framer-motion';
import { Bot, MessageCircle, ShieldCheck, SlidersHorizontal, Wand2 } from 'lucide-react';
import { useApp } from '../../../state/AppState';
import { SHIELD_COPY } from '../../../utils/recoveryEngine';
import { EASE, Reveal, SectionHeading } from '../shared';

const STEPS = [
  {
    icon: SlidersHorizontal,
    color: '#2EE6A6',
    title: 'Check in',
    body: 'Slide four faces: sleep, energy, soreness, stress. Ten seconds, no watch, no typing.',
  },
  {
    icon: Wand2,
    color: '#FFB547',
    title: 'Get your adjusted workout',
    body: 'Your Daily Charge sets the dial. Push on green days, trim 15% on amber, swap to a recovery flow on red.',
  },
  {
    icon: Bot,
    color: '#7C8CFF',
    title: 'Ask your AI Pocket Coach',
    body: '"Should I still run today?" Get a straight, friendly answer that knows your recent days.',
  },
];

const BANDS = [
  { key: 'under' as const, color: '#7C8CFF', emoji: '🐢', plain: 'You can safely do a bit more.' },
  { key: 'sweet' as const, color: '#2EE6A6', emoji: '🎯', plain: 'Building fitness at a pace your body can absorb.' },
  { key: 'over' as const, color: '#FF6B6B', emoji: '🚨', plain: 'Load jumped fast — this is when injuries happen.' },
];

export function HowItWorks() {
  const { openCoach } = useApp();
  return (
    <section id="how" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps. Every morning."
          sub="DayGauge does the thinking so you can just show up and train the right amount."
        />

        <div className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3 md:gap-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.1 }}
              className="card card-hover relative overflow-hidden p-6"
            >
              <span className="absolute right-5 top-4 font-display text-6xl font-extrabold text-white/[0.04]" aria-hidden>
                {i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: `${s.color}1F`, color: s.color }}>
                <s.icon size={22} />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">Step {i + 1}</p>
              <h3 className="mt-1 font-display text-xl font-bold text-ink-100">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-[1.4fr_1fr] md:gap-5">
          <Reveal className="card p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-prime/10 text-prime">
                <ShieldCheck size={20} />
              </span>
              <div>
                <p className="eyebrow">Pro feature</p>
                <h3 className="font-display text-xl font-bold text-ink-100">Burnout Shield</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-400">
              It compares how hard you trained this week to your usual month — then tells you, in plain words, where you stand.
            </p>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-gradient-to-r from-spark via-prime to-recharge opacity-80" aria-hidden />
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {BANDS.map((b) => (
                <li key={b.key} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold" style={{ color: b.color }}>
                    <span aria-hidden>{b.emoji}</span> {SHIELD_COPY[b.key].label}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{b.plain}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="card flex flex-col justify-between gap-6 bg-gradient-to-br from-spark/[0.12] to-transparent p-6 sm:p-7">
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-spark/15 text-spark">
                <MessageCircle size={20} />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-ink-100">Not sure what to do today?</h3>
              <div className="mt-4 rounded-3xl rounded-tl-md bg-ink-800 px-4 py-3 text-sm text-ink-100">
                "I slept 5 hours — should I still lift today?"
              </div>
            </div>
            <button
              type="button"
              onClick={() => openCoach('I slept 5 hours—should I still lift today?')}
              className="btn w-full bg-spark text-ink-950 hover:brightness-110"
            >
              <Bot size={16} /> Try asking the coach
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
