import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, Play, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from '../../../components/brand/Logo';
import { useApp } from '../../../state/AppState';
import { EASE, NAV_LINKS, scrollToId } from '../shared';

export function Navbar() {
  const { openIntro, setView, setTab } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth >= 768 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const launch = () => {
    setOpen(false);
    setView('app');
    setTab('today');
  };
  const go = (id: string) => {
    setOpen(false);
    // let the menu collapse before measuring
    window.setTimeout(() => scrollToId(id), 10);
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
        scrolled || open ? 'border-white/[0.06] bg-ink-950/75' : 'border-transparent bg-ink-950/30'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6" aria-label="Main">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="DayGauge — back to top"
        >
          <Logo size={30} />
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => go(l.id)}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-300 transition hover:bg-white/[0.05] hover:text-ink-100"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={openIntro} className="btn-ghost btn-sm">
            <Play size={14} className="fill-current" /> Watch 30s Intro
          </button>
          <button type="button" onClick={launch} className="btn-primary btn-sm">
            Launch Interactive App <ArrowRight size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-ink-100 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-white/[0.06] md:hidden"
          >
            <div className="space-y-1 px-4 pb-5 pt-3">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => go(l.id)}
                  className="flex min-h-[44px] w-full items-center rounded-2xl px-3 text-left text-base font-medium text-ink-100 hover:bg-white/[0.05]"
                >
                  {l.label}
                </button>
              ))}
              <div className="grid gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openIntro();
                  }}
                  className="btn-ghost w-full"
                >
                  <Play size={16} className="fill-current" /> Watch 30s Intro
                </button>
                <button type="button" onClick={launch} className="btn-primary w-full">
                  Launch Interactive App <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
