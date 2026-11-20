import { motion, useSpring, useTransform, type MotionValue } from 'framer-motion';

interface Props {
  /** Pointer position, each in -1..1 (0 when parallax is off). */
  px: MotionValue<number>;
  py: MotionValue<number>;
  colors: [string, string];
}

function useLayer(v: MotionValue<number>, depth: number) {
  const s = useSpring(v, { stiffness: 60, damping: 20, mass: 0.6 });
  return useTransform(s, (n) => n * depth);
}

/** Ambient cinematic backdrop: drifting zone-coloured glows, dot grid and vignette, with pointer parallax. */
export function Backdrop({ px, py, colors }: Props) {
  const x1 = useLayer(px, -36);
  const y1 = useLayer(py, -28);
  const x2 = useLayer(px, 52);
  const y2 = useLayer(py, 40);
  const x3 = useLayer(px, -14);
  const y3 = useLayer(py, -10);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-ink-950" />
      <motion.div className="absolute -left-[15%] -top-[20%] h-[70vmax] w-[70vmax]" style={{ x: x1, y: y1 }}>
        <motion.div
          className="h-full w-full rounded-full opacity-[0.22] blur-[110px]"
          initial={false}
          animate={{ backgroundColor: colors[0], scale: [1, 1.08, 1] }}
          transition={{ backgroundColor: { duration: 1.2 }, scale: { duration: 9, repeat: Infinity, ease: 'easeInOut' } }}
        />
      </motion.div>
      <motion.div className="absolute -bottom-[25%] -right-[15%] h-[65vmax] w-[65vmax]" style={{ x: x2, y: y2 }}>
        <motion.div
          className="h-full w-full rounded-full opacity-[0.16] blur-[120px]"
          initial={false}
          animate={{ backgroundColor: colors[1], scale: [1.05, 0.95, 1.05] }}
          transition={{ backgroundColor: { duration: 1.2 }, scale: { duration: 11, repeat: Infinity, ease: 'easeInOut' } }}
        />
      </motion.div>
      <motion.div className="absolute left-1/2 top-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2" style={{ x: x3, y: y3 }}>
        <div className="h-full w-full rounded-full bg-spark opacity-[0.07] blur-[100px]" />
      </motion.div>
      {/* Dot grid, drifting with the parallax for depth */}
      <motion.div
        className="absolute -inset-10 opacity-[0.35]"
        style={{
          x: x3,
          y: y3,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 30%, transparent 75%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,6,9,0.85)_100%)]" />
    </div>
  );
}
