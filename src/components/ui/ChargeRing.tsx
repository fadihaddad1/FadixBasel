import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ZONE_META, zoneFor } from '../../utils/recoveryEngine';
import type { Zone } from '../../types/wellness';

interface Props {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  zone?: Zone; // defaults to zoneFor(value)
  label?: string; // under the number
  showVerdict?: boolean;
}

/** Animated Daily Charge progress ring with spring-eased number and zone glow. */
export function ChargeRing({ value, size = 220, stroke = 16, zone, label = 'Daily Charge', showVerdict = true }: Props) {
  const z = zone ?? zoneFor(value);
  const meta = ZONE_META[z];
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const spring = useSpring(value, { stiffness: 90, damping: 18 });
  const dash = useTransform(spring, (v) => c - (Math.max(0, Math.min(100, v)) / 100) * c);
  const [display, setDisplay] = useState(Math.round(value));
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  useEffect(() => spring.on('change', (v) => setDisplay(Math.round(v))), [spring]);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-[12%] rounded-full blur-2xl transition-colors duration-700 animate-pulseRing"
        style={{ background: meta.soft.replace('0.12', '0.35') }}
      />
      <svg width={size} height={size} className="relative -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={meta.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          style={{ strokeDashoffset: dash, filter: `drop-shadow(0 0 10px ${meta.color}88)`, transition: 'stroke 0.6s' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display font-extrabold leading-none text-ink-100" style={{ fontSize: size * 0.26 }}>
            {display}
            <span className="text-ink-400" style={{ fontSize: size * 0.11 }}>%</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">{label}</div>
          {showVerdict && (
            <div
              className="mx-auto mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors duration-500"
              style={{ color: meta.color, background: meta.soft }}
            >
              {meta.emoji} {meta.verdict}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
