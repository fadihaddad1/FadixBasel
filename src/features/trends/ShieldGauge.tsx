import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { shieldPosition } from '../../utils/recoveryEngine';
import type { ShieldBand } from '../../types/wellness';

/** Ratio ranges per band, matching burnoutShield() thresholds. Gauge spans 0.4–2.0. */
export const SHIELD_BANDS: { band: ShieldBand; from: number; to: number; color: string; name: string }[] = [
  { band: 'under', from: 0.4, to: 0.8, color: '#7C8CFF', name: 'Under-training' },
  { band: 'sweet', from: 0.8, to: 1.3, color: '#2EE6A6', name: 'Sweet Spot' },
  { band: 'caution', from: 1.3, to: 1.5, color: '#FFB547', name: 'Ramping Fast' },
  { band: 'over', from: 1.5, to: 2.0, color: '#FF6B6B', name: 'Overdoing It' },
];

export const bandColor = (b: ShieldBand) => SHIELD_BANDS.find((x) => x.band === b)?.color ?? '#2EE6A6';

const W = 300;
const H = 172;
const CX = W / 2;
const CY = 150;
const R = 118;
const STROKE = 20;

function point(t: number, r = R) {
  const a = Math.PI * (1 - t);
  return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) };
}

function arc(t0: number, t1: number) {
  const p0 = point(t0);
  const p1 = point(t1);
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${R} ${R} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

/** Semicircle Burnout Shield gauge with a spring-animated needle. */
export function ShieldGauge({ ratio, band }: { ratio: number; band: ShieldBand }) {
  const target = shieldPosition(ratio);
  const t = useSpring(0, { stiffness: 90, damping: 18 });
  useEffect(() => {
    t.set(target);
  }, [target, t]);
  const tipX = useTransform(t, (v) => point(v, R - 30).x);
  const tipY = useTransform(t, (v) => point(v, R - 30).y);
  const active = bandColor(band);
  const gap = 0.006;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[340px]" role="img" aria-label={`Burnout Shield needle at ratio ${ratio}`}>
      <defs>
        <filter id="dg-needle-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <path d={arc(0, 1)} stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE + 8} fill="none" strokeLinecap="round" />
      {SHIELD_BANDS.map((b, i) => {
        const t0 = shieldPosition(b.from) + (i === 0 ? 0 : gap);
        const t1 = shieldPosition(b.to) - (i === SHIELD_BANDS.length - 1 ? 0 : gap);
        const isActive = b.band === band;
        return (
          <path
            key={b.band}
            d={arc(t0, t1)}
            stroke={b.color}
            strokeOpacity={isActive ? 1 : 0.32}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap={i === 0 || i === SHIELD_BANDS.length - 1 ? 'round' : 'butt'}
            style={isActive ? { filter: `drop-shadow(0 0 8px ${b.color}99)` } : undefined}
          />
        );
      })}
      {/* tick labels */}
      {[0.8, 1.3, 1.5].map((r) => {
        const p = point(shieldPosition(r), R + 20);
        return (
          <text key={r} x={p.x} y={p.y} fill="#8A93A6" fontSize="10" textAnchor="middle" dominantBaseline="middle">
            {r.toFixed(1)}
          </text>
        );
      })}
      {/* needle */}
      <motion.line x1={CX} y1={CY} x2={tipX} y2={tipY} stroke={active} strokeWidth={7} strokeLinecap="round" filter="url(#dg-needle-glow)" opacity={0.6} />
      <motion.line x1={CX} y1={CY} x2={tipX} y2={tipY} stroke="#EEF0F5" strokeWidth={4} strokeLinecap="round" />
      <circle cx={CX} cy={CY} r={11} fill="#11141B" stroke={active} strokeWidth={4} />
      <circle cx={CX} cy={CY} r={3.5} fill="#EEF0F5" />
    </svg>
  );
}
