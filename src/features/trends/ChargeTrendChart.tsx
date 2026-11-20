import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ZONE_META, zoneFor } from '../../utils/recoveryEngine';

export interface ChargePoint {
  date: string;
  charge: number;
  isToday?: boolean;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(320);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const fmtShort = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** Hand-built SVG area chart of Daily Charge with zone-colored points and a dashed baseline. */
export function ChargeTrendChart({ points, baseline }: { points: ChargePoint[]; baseline: number }) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 200;
  const pad = { l: 30, r: 12, t: 14, b: 26 };
  const iw = Math.max(10, width - pad.l - pad.r);
  const ih = H - pad.t - pad.b;
  const n = points.length;

  const x = (i: number) => pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / 100) * ih;

  const { line, area } = useMemo(() => {
    if (!n) return { line: '', area: '' };
    // Smooth-ish monotone path via midpoint cubic curves.
    let d = `M ${x(0)} ${y(points[0].charge)}`;
    for (let i = 1; i < n; i++) {
      const x0 = x(i - 1);
      const x1 = x(i);
      const mx = (x0 + x1) / 2;
      d += ` C ${mx} ${y(points[i - 1].charge)}, ${mx} ${y(points[i].charge)}, ${x1} ${y(points[i].charge)}`;
    }
    const a = `${d} L ${x(n - 1)} ${pad.t + ih} L ${x(0)} ${pad.t + ih} Z`;
    return { line: d, area: a };
  }, [points, width]);

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = n <= 1 ? 0 : Math.round(((px - pad.l) / iw) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const labelEvery = n > 14 ? 7 : n > 7 ? 3 : 1;
  const hp = hover !== null ? points[hover] : null;
  const hx = hover !== null ? x(hover) : 0;
  const tooltipLeft = Math.min(Math.max(hx, 64), width - 64);
  const r = n > 14 ? 3.5 : 4.5;

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        width={width}
        height={H}
        className="block touch-pan-y"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Daily Charge trend chart"
      >
        <defs>
          <linearGradient id="dg-charge-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C8CFF" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#7C8CFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="dg-charge-line" x1="0" y1={y(100)} x2="0" y2={y(0)} gradientUnits="userSpaceOnUse">
            <stop offset="0.26" stopColor={ZONE_META.prime.color} />
            <stop offset="0.3" stopColor={ZONE_META.steady.color} />
            <stop offset="0.46" stopColor={ZONE_META.steady.color} />
            <stop offset="0.5" stopColor={ZONE_META.recharge.color} />
          </linearGradient>
        </defs>
        {/* zone guide lines */}
        {[0, 52, 72, 100].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={pad.l + iw} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.06)" />
            <text x={pad.l - 6} y={y(v)} fill="#8A93A6" fontSize="10" textAnchor="end" dominantBaseline="middle">
              {v}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#dg-charge-area)" />
        <motion.g
          key={n}
          initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <path d={line} fill="none" stroke="url(#dg-charge-line)" strokeWidth={2.5} strokeLinecap="round" />
        </motion.g>
        {/* baseline */}
        <line x1={pad.l} x2={pad.l + iw} y1={y(baseline)} y2={y(baseline)} stroke="#EEF0F5" strokeOpacity={0.5} strokeDasharray="5 5" />
        <rect x={pad.l + 4} y={y(baseline) - 19} width={92} height={15} rx={7} fill="#11141B" fillOpacity={0.85} />
        <text x={pad.l + 10} y={y(baseline) - 8} fill="#B4BBC9" fontSize="10">
          14-day avg {Math.round(baseline)}%
        </text>
        {hover !== null && <line x1={hx} x2={hx} y1={pad.t} y2={pad.t + ih} stroke="rgba(255,255,255,0.18)" />}
        {points.map((p, i) => {
          const c = ZONE_META[zoneFor(p.charge)].color;
          const active = hover === i;
          return (
            <g key={p.date}>
              {p.isToday && <circle cx={x(i)} cy={y(p.charge)} r={r + 6} fill={c} opacity={0.2} />}
              <circle cx={x(i)} cy={y(p.charge)} r={active ? r + 2 : r} fill={c} stroke="#11141B" strokeWidth={2} />
            </g>
          );
        })}
        {points.map((p, i) =>
          i % labelEvery === (n - 1) % labelEvery ? (
            <text key={`l-${p.date}`} x={x(i)} y={H - 8} fill="#8A93A6" fontSize="10" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
              {p.isToday ? 'Today' : fmtShort(p.date)}
            </text>
          ) : null,
        )}
      </svg>
      <AnimatePresence>
        {hp && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-ink-800/95 px-3 py-1.5 text-center shadow-card"
            style={{ left: tooltipLeft }}
          >
            <div className="text-[11px] text-ink-400">{hp.isToday ? 'Today' : fmtDate(hp.date)}</div>
            <div className="font-display text-sm font-bold" style={{ color: ZONE_META[zoneFor(hp.charge)].color }}>
              {hp.charge}% · {ZONE_META[zoneFor(hp.charge)].name}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
