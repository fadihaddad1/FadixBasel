import { motion } from 'framer-motion';
import { ArrowRight, Bot, Dumbbell, Rocket, Sunrise, type LucideIcon } from 'lucide-react';
import { ZONE_META } from '../../../utils/recoveryEngine';
import { span } from '../introScript';
import type { SceneProps } from './types';

interface Props extends SceneProps {
  onStart: () => void;
  onLaunch: () => void;
}

const STEPS: { icon: LucideIcon; title: string; color: string; at: number }[] = [
  { icon: Sunrise, title: 'Tap Morning Check-In', color: ZONE_META.steady.color, at: 0.04 },
  { icon: Dumbbell, title: 'Get Your Adjusted Workout', color: ZONE_META.prime.color, at: 0.26 },
  { icon: Bot, title: 'Ask Your AI Pocket Coach', color: '#7C8CFF', at: 0.48 },
];

const COACH_REPLY = 'Easy 20-min jog today — save the intervals for Thursday.';

function Preview({ i, t, on }: { i: number; t: number; on: boolean }) {
  if (i === 0) {
    const tap = on && t > 0.1 && t < 0.24;
    return (
      <div className="relative mt-3 flex h-12 items-center justify-center">
        <motion.div
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-ink-950"
          style={{ background: ZONE_META.steady.color }}
          animate={{ scale: tap ? [1, 0.92, 1] : 1 }}
          transition={{ duration: 0.4 }}
        >
          <Sunrise className="h-4 w-4" /> Check in · 10s
        </motion.div>
        {tap && (
          <motion.span
            className="absolute h-12 w-12 rounded-full border-2"
            style={{ borderColor: ZONE_META.steady.color }}
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
    );
  }
  if (i === 1) {
    return (
      <div className="mt-3 flex h-12 items-center gap-2 rounded-2xl bg-white/[0.05] px-3">
        <Dumbbell className="h-4 w-4" style={{ color: ZONE_META.steady.color }} />
        <span className="truncate text-sm font-semibold text-ink-100">Legs · Back Squat 4×5</span>
        <span className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ color: ZONE_META.steady.color, background: ZONE_META.steady.soft }}>
          −15%
        </span>
      </div>
    );
  }
  const typed = Math.round(span(t, 0.54, 0.7) * COACH_REPLY.length);
  return (
    <div className="mt-3 flex h-12 flex-col justify-center gap-1">
      <div className="ml-auto max-w-[85%] truncate rounded-2xl rounded-br-md bg-white/[0.08] px-2.5 py-0.5 text-[11px] text-ink-100">Should I run today?</div>
      <div className="max-w-[95%] truncate rounded-2xl rounded-bl-md px-2.5 py-0.5 text-[11px] text-ink-100" style={{ background: 'rgba(124,140,255,0.16)' }}>
        {on ? COACH_REPLY.slice(0, Math.max(1, typed)) : '…'}
        {on && typed < COACH_REPLY.length && <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-spark align-middle" />}
      </div>
    </div>
  );
}

export function WalkthroughScene({ t, wide, onStart, onLaunch }: Props) {
  const active = STEPS.reduce((acc, s, i) => (t >= s.at ? i : acc), -1);
  const allLit = t >= 0.7;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 md:gap-9">
      <div className={`grid w-full gap-3 ${wide ? 'grid-cols-3 gap-5' : 'max-w-sm grid-cols-1'}`}>
        {STEPS.map((s, i) => {
          const on = i <= active;
          const spotlight = i === active && !allLit;
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              className="card relative p-4 md:p-5"
              initial={false}
              animate={{
                opacity: on ? 1 : 0.35,
                scale: spotlight ? 1.04 : 1,
                borderColor: on ? `${s.color}66` : 'rgba(255,255,255,0.06)',
                boxShadow: spotlight ? `0 0 0 1px ${s.color}55, 0 24px 60px -18px ${s.color}aa` : '0 20px 40px -20px rgba(0,0,0,0.6)',
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
                  initial={false}
                  animate={{ backgroundColor: on ? `${s.color}26` : 'rgba(255,255,255,0.05)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: on ? s.color : '#8A93A6' }} />
                </motion.div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: on ? s.color : '#8A93A6' }}>
                    Step {i + 1}
                  </div>
                  <div className="truncate font-display text-base font-extrabold text-ink-100 md:text-lg">{s.title}</div>
                </div>
              </div>
              <Preview i={i} t={t} on={on} />
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 320, damping: 26 }}
      >
        <motion.button
          type="button"
          data-testid="intro-cta"
          onClick={onStart}
          className="btn-primary w-full max-w-sm px-8 py-4 text-base sm:w-auto md:text-lg"
          animate={
            allLit
              ? { boxShadow: ['0 8px 30px -8px rgba(46,230,166,0.6)', '0 8px 50px -4px rgba(46,230,166,0.95)', '0 8px 30px -8px rgba(46,230,166,0.6)'] }
              : undefined
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          Start Exploring DayGauge <ArrowRight className="h-5 w-5" />
        </motion.button>
        <button type="button" onClick={onLaunch} className="btn-ghost w-full max-w-sm px-6 py-4 text-base sm:w-auto">
          <Rocket className="h-4 w-4" /> Launch the App
        </button>
      </motion.div>
    </div>
  );
}
