import { ArrowRight, Play } from 'lucide-react';
import { LogoMark } from '../../../components/brand/Logo';
import { useApp } from '../../../state/AppState';
import { Reveal } from '../shared';

export function FinalCta() {
  const { setView, setTab, openTrial, openIntro } = useApp();
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28">
      <Reveal className="mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-prime/[0.16] via-ink-900 to-spark/[0.16] px-6 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-prime/25 blur-3xl" />
          <div className="relative">
            <LogoMark size={52} className="mx-auto" />
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-extrabold leading-tight text-ink-100 sm:text-5xl">
              Tomorrow morning, take 10 seconds for yourself.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink-300 sm:text-lg">
              Find out whether it's a day to push or a day to recover — no watch, no guilt.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
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
              <button type="button" onClick={openIntro} className="btn px-4 py-3.5 text-base text-ink-300 hover:text-ink-100">
                <Play size={16} className="fill-current" /> Watch 30s Intro
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
