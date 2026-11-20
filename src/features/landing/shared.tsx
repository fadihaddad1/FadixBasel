import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Smooth-scroll to a landing section by id (sections carry scroll-mt for the sticky nav). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise when scrolled into view (once). */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink-100 sm:text-4xl md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-ink-400 sm:text-lg">{sub}</p>}
    </Reveal>
  );
}

export const NAV_LINKS = [
  { id: 'how', label: 'How it works' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'founder', label: 'Founder' },
] as const;
