import { motion } from 'framer-motion';
import { span } from './introScript';

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Caption revealed word by word in sync with scene progress `t` (0..1). Unrevealed words are
 * ghosted (not unmounted) so the line never reflows while it plays.
 */
export function KineticCaption({ text, t, emphasis, accent }: { text: string; t: number; emphasis: string[]; accent: string }) {
  // "—" glues two words; split it so each side reveals on its own.
  const words = text.replace(/—/g, '— ').split(/\s+/).filter(Boolean);
  const progress = span(t, 0.03, 0.72);
  const shown = Math.ceil(progress * words.length);
  const emph = new Set(emphasis.map(norm));

  return (
    <p
      className="mx-auto max-w-4xl text-balance text-center font-display text-[17px] font-bold leading-snug text-ink-100 sm:text-2xl md:text-[30px] md:leading-[1.25]"
      aria-label={text}
    >
      {words.map((w, i) => {
        const on = i < shown;
        const current = on && i === shown - 1 && progress < 1;
        const isEmph = emph.has(norm(w));
        return (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block whitespace-pre"
            initial={false}
            animate={{
              opacity: on ? 1 : 0.14,
              y: on ? 0 : 6,
              filter: on ? 'blur(0px)' : 'blur(3px)',
              scale: current ? 1.06 : 1,
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            style={{
              color: isEmph && on ? accent : undefined,
              textShadow: isEmph && on ? `0 0 24px ${accent}66` : undefined,
            }}
          >
            {w.endsWith('—') ? w : `${w} `}
          </motion.span>
        );
      })}
    </p>
  );
}
