import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useApp } from '../../../state/AppState';
import { EASE } from '../shared';
import { HeroCheckIn } from './HeroCheckIn';

export function Hero() {
  const { setView, setTab, openTrial, openIntro } = useApp();
  return (
    <section className="relative px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:pb-24 lg:pt-20">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center lg:text-left"
        >
          <span className="chip border-spark/30 bg-spark/10 text-spark">
            <Sparkles size={12} /> Your daily readiness coach — no wearable needed
          </span>
          <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.04] text-ink-100 sm:text-6xl lg:text-7xl">
            Know When to Push.
            <br />
            <span className="text-gradient">Know When to Recover.</span>
          </h1>
          <p className="mt-5 font-display text-lg font-bold text-ink-300 sm:text-xl">No Smartwatch Required.</p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-400 sm:text-lg lg:mx-0">
            Answer four quick questions each morning. DayGauge turns them into your <span className="font-semibold text-ink-100">Daily Charge</span>{' '}
            and adjusts today's workout for you — harder when you're fresh, gentler when you're not.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <button
              type="button"
              data-testid="launch-app"
              onClick={() => {
                setView('app');
                setTab('today');
              }}
              className="btn-primary px-6 py-3.5 text-base"
            >
              Launch Interactive App <ArrowRight size={18} />
            </button>
            <button type="button" onClick={() => openTrial('yearly')} className="btn-ghost px-6 py-3.5 text-base">
              Start 7-Day Free Trial
            </button>
          </div>
          <button
            type="button"
            onClick={openIntro}
            className="group mt-5 inline-flex min-h-[44px] items-center gap-3 rounded-full pr-3 text-sm font-semibold text-ink-300 transition hover:text-ink-100"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] ring-1 ring-white/10 transition group-hover:bg-white/[0.14]">
              <Play size={15} className="ml-0.5 fill-current" />
            </span>
            Watch 30s Intro
          </button>
          <p className="mt-4 text-xs text-ink-400">Free forever plan · No credit card to try · Cancel anytime</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
          className="mx-auto w-full max-w-[520px]"
        >
          <HeroCheckIn />
          <p className="mt-4 text-center text-xs text-ink-400">↑ Drag the sliders — the score and workout update instantly.</p>
        </motion.div>
      </div>
    </section>
  );
}
