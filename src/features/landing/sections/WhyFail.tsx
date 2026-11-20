import { motion } from 'framer-motion';
import { Check, Flame, HeartHandshake, Smartphone, TrendingDown, Watch, X, type LucideIcon } from 'lucide-react';
import { EASE, SectionHeading } from '../shared';

interface Row {
  old: { icon: LucideIcon; title: string; body: string };
  next: { icon: LucideIcon; title: string; body: string };
}

const ROWS: Row[] = [
  {
    old: { icon: Flame, title: 'Guilt-driven plans', body: 'The plan says "leg day" whether you slept 8 hours or 4. Miss it and you feel like you failed.' },
    next: { icon: HeartHandshake, title: 'Plans that meet you where you are', body: 'Rough night? Your workout quietly gets lighter. Great sleep? It nudges you to push.' },
  },
  {
    old: { icon: Watch, title: 'A $400 watch on your wrist', body: 'Lots of graphs, little guidance — and one more device to charge every night.' },
    next: { icon: Smartphone, title: 'A 10-second check-in', body: "Four sliders on the phone you already own. You're the best sensor for how you feel." },
  },
  {
    old: { icon: TrendingDown, title: 'All-or-nothing streaks', body: "One skipped day breaks the chain, and most people never pick it back up." },
    next: { icon: Check, title: 'Recovery counts', body: 'A 20-minute mobility flow keeps your streak alive. Resting smart is part of the plan.' },
  },
];

export function WhyFail() {
  return (
    <section className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="The real problem"
          title={
            <>
              Why <span className="text-recharge">80%</span> of fitness apps fail
            </>
          }
          sub="It isn't laziness. Most apps ignore how you actually feel today — so you either overdo it and burn out, or fall behind and quit."
        />

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-5">
          {ROWS.map((r, i) => (
            <div key={r.old.title} className="grid gap-3 md:grid-cols-2 md:gap-5">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: EASE, delay: i * 0.05 }}
                className="card relative flex gap-4 p-5 sm:p-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-recharge/10 text-recharge">
                  <r.old.icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                    <X size={12} className="text-recharge" /> Typical app
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-ink-100">{r.old.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-400">{r.old.body}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.1 + i * 0.05 }}
                className="card card-hover relative flex gap-4 border-prime/20 p-5 sm:p-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-prime/10 text-prime">
                  <r.next.icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-prime">
                    <Check size={12} /> DayGauge
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-ink-100">{r.next.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-300">{r.next.body}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
