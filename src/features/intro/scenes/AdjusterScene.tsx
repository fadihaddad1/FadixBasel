import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, Footprints, Gauge, ShieldCheck, Wind } from 'lucide-react';
import { ChargeRing } from '../../../components/ui/ChargeRing';
import { ZONE_META } from '../../../utils/recoveryEngine';
import type { Zone } from '../../../types/wellness';
import type { SceneProps } from './types';

interface Variant {
  zone: Zone;
  charge: number;
  label: string;
  headline: string;
  detail: string;
  rows: { name: string; spec: string }[];
  /** Burnout Shield needle position 0..1 across Under-training | Sweet Spot | Overdoing It. */
  needle: number;
  shield: string;
}

const VARIANTS: Variant[] = [
  {
    zone: 'prime',
    charge: 88,
    label: 'Green',
    headline: 'Heavy lifting unlocked',
    detail: 'Fresh legs today — we added a set. Go for it.',
    rows: [
      { name: 'Back Squat', spec: '5 × 5 · 100% · +1 set' },
      { name: 'Romanian Deadlift', spec: '4 × 8' },
      { name: 'Walking Lunges', spec: '3 × 12' },
    ],
    needle: 0.5,
    shield: 'Fitness Sweet Spot',
  },
  {
    zone: 'steady',
    charge: 64,
    label: 'Yellow',
    headline: 'Intensity dialed back 15%',
    detail: 'Still training — one fewer set, 85% load, no PRs.',
    rows: [
      { name: 'Back Squat', spec: '4 × 5 · 85%' },
      { name: 'Romanian Deadlift', spec: '3 × 8 · 85%' },
      { name: 'Walking Lunges', spec: '2 × 12' },
    ],
    needle: 0.64,
    shield: 'Sweet Spot · upper edge',
  },
  {
    zone: 'recharge',
    charge: 41,
    label: 'Red',
    headline: 'Swapped to 20-min recovery flow',
    detail: 'Your load is spiking. Recovery today protects next week.',
    rows: [
      { name: 'Mobility flow', spec: '8 min' },
      { name: 'Easy walk', spec: '10 min' },
      { name: 'Breathing reset', spec: '2 min' },
    ],
    needle: 0.88,
    shield: 'Overdoing It · injury risk',
  },
];

const ROW_ICONS = { prime: Dumbbell, steady: Dumbbell, recharge: Wind } as const;

// Shield bands, as fractions of the 180° arc.
const BANDS = [
  { from: 0, to: 0.33, color: '#7C8CFF', label: 'Under-training' },
  { from: 0.33, to: 0.72, color: ZONE_META.prime.color, label: 'Sweet Spot' },
  { from: 0.72, to: 1, color: ZONE_META.recharge.color, label: 'Overdoing It' },
];

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  // a = 0 → left, a = 1 → right, along the top half-circle.
  const p = (a: number) => {
    const ang = Math.PI * (1 - a);
    return [cx + r * Math.cos(ang), cy - r * Math.sin(ang)];
  };
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
}

function ShieldMeter({ v, wide }: { v: Variant; wide: boolean }) {
  const w = 240;
  const cx = w / 2;
  const cy = 120;
  const r = 96;
  const color = v.needle < 0.33 ? '#7C8CFF' : v.needle < 0.72 ? ZONE_META.prime.color : ZONE_META.recharge.color;
  return (
    <div className="card flex flex-col items-center p-3 md:p-6" style={{ width: wide ? 330 : '100%' }}>
      <div className="eyebrow flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" /> Burnout Shield
      </div>
      <svg viewBox={`0 0 ${w} 136`} className={`mt-2 w-full ${wide ? 'max-w-[260px]' : 'max-w-[190px]'}`}>
        {BANDS.map((b) => (
          <path
            key={b.label}
            d={arcPath(cx, cy, r, b.from + 0.008, b.to - 0.008)}
            stroke={b.color}
            strokeOpacity={0.85}
            strokeWidth={14}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        <motion.g
          initial={false}
          animate={{ rotate: -90 + v.needle * 180 }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        >
          {/* Invisible disc centres the group's bbox on the pivot so it rotates around (cx, cy). */}
          <circle cx={cx} cy={cy} r={r - 20} fill="transparent" />
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + 20} stroke="#EEF0F5" strokeWidth={5} strokeLinecap="round" />
        </motion.g>
        <circle cx={cx} cy={cy} r={9} fill="#EEF0F5" />
        <circle cx={cx} cy={cy} r={4} fill="#0B0D12" />
      </svg>
      <div className="mt-1 grid w-full grid-cols-3 text-center text-[10px] font-semibold uppercase tracking-[0.04em] text-ink-400 md:text-[11px]">
        {BANDS.map((b) => (
          <span key={b.label} style={{ color: (v.needle >= b.from && v.needle < b.to) || (b.to === 1 && v.needle >= 1) ? b.color : undefined }}>
            {b.label}
          </span>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={v.shield}
          className="mt-3 text-sm font-bold"
          style={{ color }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {v.shield}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function AdjusterScene({ t, wide }: SceneProps) {
  const idx = t < 0.34 ? 0 : t < 0.67 ? 1 : 2;
  const v = VARIANTS[idx];
  const meta = ZONE_META[v.zone];
  const RowIcon = ROW_ICONS[v.zone];

  const card = (
    <motion.div
      className="card relative w-full overflow-hidden p-4 md:p-6"
      initial={false}
      animate={{ borderColor: `${meta.color}55`, boxShadow: `0 30px 80px -30px ${meta.color}88` }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: wide ? 520 : 420 }}
    >
      <motion.div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
        initial={false}
        animate={{ backgroundColor: `${meta.color}33` }}
        transition={{ duration: 0.6 }}
      />
      {/* Zone switcher pills */}
      <div className="relative flex gap-1.5 rounded-full bg-white/[0.04] p-1">
        {VARIANTS.map((x, i) => (
          <div key={x.zone} className="relative flex-1 rounded-full px-2 py-1.5 text-center text-xs font-bold md:text-sm">
            {i === idx && (
              <motion.div
                layoutId="intro-zone-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: ZONE_META[x.zone].soft.replace('0.12', '0.22') }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative" style={{ color: i === idx ? ZONE_META[x.zone].color : '#8A93A6' }}>
              {ZONE_META[x.zone].emoji} {x.label} {x.charge}%
            </span>
          </div>
        ))}
      </div>

      <div className="relative mt-4 flex items-center gap-4 md:mt-5 md:gap-5">
        <div className="shrink-0">
          <ChargeRing value={v.charge} zone={v.zone} size={wide ? 128 : 104} stroke={wide ? 11 : 9} showVerdict={false} label="Charge" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: meta.color }}>
            {meta.emoji} {meta.verdict}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={v.zone}
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <div className="mt-1 font-display text-lg font-extrabold leading-tight text-ink-100 md:text-2xl">{v.headline}</div>
              <div className="mt-1 text-xs text-ink-400 md:text-sm">{v.detail}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative mt-4 space-y-2 md:mt-5">
        {v.rows.map((row, i) => (
          <div key={i} className="flex h-10 items-center gap-3 overflow-hidden rounded-2xl bg-white/[0.04] px-3 md:h-11">
            <RowIcon className="h-4 w-4 shrink-0" style={{ color: meta.color }} />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`${v.zone}-${i}`}
                className="flex min-w-0 flex-1 items-center justify-between gap-2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32, delay: i * 0.06 }}
              >
                <span className="truncate text-sm font-semibold text-ink-100">{row.name}</span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-300">{row.spec}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
      </div>
      <div className="relative mt-3 flex items-center gap-1.5 text-[11px] text-ink-400 md:text-xs">
        {v.zone === 'recharge' ? <Footprints className="h-3.5 w-3.5" /> : <Gauge className="h-3.5 w-3.5" />}
        Auto-adjusted from this morning's Daily Charge
      </div>
    </motion.div>
  );

  return wide ? (
    <div className="mx-auto flex max-w-4xl items-center justify-center gap-8">
      {card}
      <ShieldMeter v={v} wide={wide} />
    </div>
  ) : (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3">
      {card}
      <ShieldMeter v={v} wide={wide} />
    </div>
  );
}
