import { motion } from 'framer-motion';
import { AlarmClock, CalendarX, Dumbbell, HeartCrack, Watch, type LucideIcon } from 'lucide-react';
import { ZONE_META } from '../../../utils/recoveryEngine';
import { span } from '../introScript';
import type { SceneProps } from './types';

const RED = ZONE_META.recharge.color;
const AMBER = ZONE_META.steady.color;

const STEPS: { icon: LucideIcon; time: string; title: string; color: string; at: number }[] = [
  { icon: AlarmClock, time: '6:00 AM', title: 'Wake up tired', color: '#8A93A6', at: 0.04 },
  { icon: Dumbbell, time: '6:45 AM', title: 'Push too hard out of guilt', color: AMBER, at: 0.17 },
  { icon: HeartCrack, time: 'Day 3', title: 'Wrecked & burnt out', color: RED, at: 0.3 },
  { icon: CalendarX, time: 'Weeks 1–2', title: 'Quit for two weeks', color: RED, at: 0.43 },
];

const NOISE: { text: string; x: number; y: number; d: number }[] = [
  { text: 'HRV 43ms', x: -150, y: -46, d: 0 },
  { text: 'Strain 14.7', x: 140, y: -54, d: 0.4 },
  { text: 'VO₂ 47.2', x: -168, y: 30, d: 0.8 },
  { text: 'Stress 62?', x: 156, y: 26, d: 0.2 },
  { text: 'RHR 58', x: -92, y: 74, d: 0.6 },
  { text: 'Readiness 3.1σ', x: 96, y: 76, d: 1 },
  { text: 'Sleep score 71/84?', x: 0, y: 112, d: 0.3 },
];

export function HookScene({ t, wide }: SceneProps) {
  const line = span(t, 0.04, 0.5);
  const watchIn = span(t, 0.55, 0.62);
  const strike = span(t, 0.66, 0.76);

  return (
    <div className="flex flex-col items-center gap-6 px-1 md:gap-10">
      {/* Timeline of the trap */}
      <div className="relative w-full max-w-3xl">
        <div className="absolute left-[12.5%] right-[12.5%] top-6 h-[3px] rounded-full bg-white/[0.07] md:top-8">
          <div
            className="h-full rounded-full"
            style={{ width: `${line * 100}%`, background: `linear-gradient(90deg, #8A93A6, ${AMBER}, ${RED})`, boxShadow: `0 0 14px ${RED}88` }}
          />
        </div>
        <div className="relative grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => {
            const on = t >= s.at;
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex flex-col items-center text-center">
                <motion.div
                  className="grid h-12 w-12 place-items-center rounded-2xl border md:h-16 md:w-16 md:rounded-3xl"
                  initial={false}
                  animate={{
                    scale: on ? 1 : 0.7,
                    opacity: on ? 1 : 0.25,
                    borderColor: on ? `${s.color}66` : 'rgba(255,255,255,0.06)',
                    backgroundColor: on ? `${s.color}1f` : 'rgba(17,20,27,0.8)',
                    boxShadow: on ? `0 0 28px -6px ${s.color}` : '0 0 0 0 rgba(0,0,0,0)',
                    rotate: on && i === 0 ? [0, -12, 12, -8, 8, 0] : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22, rotate: { duration: 0.6 } }}
                >
                  <Icon className="h-5 w-5 md:h-7 md:w-7" style={{ color: on ? s.color : '#8A93A6' }} />
                </motion.div>
                <motion.div initial={false} animate={{ opacity: on ? 1 : 0.2, y: on ? 0 : 6 }} transition={{ duration: 0.4 }}>
                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400 md:mt-3 md:text-xs">{s.time}</div>
                  <div className="mt-0.5 text-[12px] font-semibold leading-tight text-ink-100 md:text-base">{s.title}</div>
                </motion.div>
              </div>
            );
          })}
        </div>
        {/* "repeat" loop arrow hint */}
        <motion.div
          className="mt-4 text-center text-xs font-semibold text-ink-400 md:text-sm"
          initial={false}
          animate={{ opacity: t > 0.48 ? 1 : 0 }}
        >
          …then the cycle starts all over again. <span style={{ color: RED }}>↻</span>
        </motion.div>
      </div>

      {/* The $400 watch alternative */}
      <motion.div
        className="relative grid w-full place-items-center"
        style={{ height: wide ? 210 : 190 }}
        initial={false}
        animate={{ opacity: watchIn, scale: 0.9 + watchIn * 0.1 }}
      >
        <div className="eyebrow absolute top-0">or…</div>
        {NOISE.map((n, i) => {
          const scale = wide ? 1.25 : 0.82;
          return (
            <motion.span
              key={n.text}
              className="chip absolute whitespace-nowrap font-mono text-[11px] md:text-xs"
              style={{ left: '50%', top: '55%' }}
              initial={false}
              animate={{
                x: [n.x * scale - 40, n.x * scale - 40 + (i % 2 ? 6 : -6), n.x * scale - 40],
                y: [n.y * scale - 12, n.y * scale - 12 - 8, n.y * scale - 12],
                opacity: watchIn > 0.5 ? 0.85 - strike * 0.55 : 0,
                rotate: (i % 3) * 4 - 4,
              }}
              transition={{ duration: 3 + n.d, repeat: Infinity, ease: 'easeInOut', opacity: { duration: 0.4 } }}
            >
              {n.text}
            </motion.span>
          );
        })}
        <div className="card relative mt-6 flex items-center gap-3 px-5 py-4 md:px-7 md:py-5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.06] md:h-14 md:w-14">
            <Watch className="h-6 w-6 text-ink-300 md:h-8 md:w-8" />
          </div>
          <div>
            <div className="relative inline-block font-display text-2xl font-extrabold text-ink-100 md:text-4xl">
              $400 watch
              <span
                className="absolute left-[-4%] h-[4px] origin-left rounded-full"
                style={{ top: 'calc(50% - 2px)', width: '108%', transform: `scaleX(${strike})`, background: RED, boxShadow: `0 0 12px ${RED}` }}
              />
            </div>
            <div className="text-xs text-ink-400 md:text-sm">…that just gives you confusing numbers</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
