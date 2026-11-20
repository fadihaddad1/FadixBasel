import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Clock, Send, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useApp } from '../../state/AppState';
import { ZONE_META } from '../../utils/recoveryEngine';
import { coachGreeting, coachReply, type CoachContext, type CoachWorkoutCard } from './coachResponder';

interface Msg {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  /** assistant only: still revealing word-by-word */
  streaming?: boolean;
  card?: CoachWorkoutCard;
  cardState?: 'open' | 'applied' | 'dismissed';
}

const PROMPTS = [
  'I slept 5 hours—should I still lift today?',
  'Give me a 20-min low-soreness routine',
  'Why is my Burnout Shield in the yellow?',
  'What should I eat before training?',
  'How do I keep my streak on a rest day?',
];

function useIsDesktop() {
  const q = '(min-width: 768px)';
  const [d, setD] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const h = () => setD(m.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);
  return d;
}

function CoachOrb({ size = 40 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-spark via-prime to-sun opacity-60 blur-md" />
      <div className="relative grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-spark via-[#5bc4d9] to-prime text-ink-950">
        <Sparkles size={size * 0.45} strokeWidth={2.4} />
      </div>
    </div>
  );
}

/** Reveals text word-by-word, then calls onDone. */
function StreamText({ text, onTick, onDone }: { text: string; onTick: () => void; onDone: () => void }) {
  const words = useRef(text.split(/(\s+)/));
  const [n, setN] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;
  const tick = useRef(onTick);
  tick.current = onTick;
  useEffect(() => {
    const id = window.setInterval(() => {
      setN((c) => {
        const next = c + 2; // word + whitespace token
        if (next >= words.current.length) {
          window.clearInterval(id);
          window.setTimeout(() => done.current(), 0);
          return words.current.length;
        }
        return next;
      });
      tick.current();
    }, 38);
    return () => window.clearInterval(id);
  }, []);
  return (
    <>
      {words.current.slice(0, n).join('')}
      <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-spark/80" />
    </>
  );
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2">
      <CoachOrb size={28} />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/[0.06] bg-ink-800 px-4 py-3" aria-label="Coach is typing">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-ink-300"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}

function WorkoutCardView({ card, state, onApply, onDismiss }: { card: CoachWorkoutCard; state: Msg['cardState']; onApply: () => void; onDismiss: () => void }) {
  const z = card.apply.zone ?? 'steady';
  const color = ZONE_META[z].color;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="mt-2 overflow-hidden rounded-2xl border bg-ink-900"
      style={{ borderColor: `${color}40` }}
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color }}>
            Suggested swap
          </div>
          <div className="truncate font-display text-[15px] font-bold text-ink-100">{card.title}</div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color, background: `${color}1F` }}>
          <Clock size={12} /> {card.minutes} min
        </span>
      </div>
      <ul className="mt-2 space-y-0.5 px-4">
        {card.rows.map((r) => (
          <li key={r.name} className="flex items-center gap-2.5 py-1.5 text-sm">
            <span className="w-5 text-center">{r.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-ink-100">{r.name}</span>
              <span className="block truncate text-[11px] text-ink-400">{r.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-white/[0.06] p-3">
        {state === 'applied' ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-prime">
            <Check size={16} /> Applied to today's workout
          </div>
        ) : state === 'dismissed' ? (
          <div className="text-xs text-ink-400">No worries — your plan stays as is.</div>
        ) : (
          <div className="flex gap-2">
            <button className="btn-primary btn-sm min-h-[40px] flex-1" onClick={onApply}>
              Apply Workout Swap <ArrowRight size={14} />
            </button>
            <button className="btn-ghost btn-sm min-h-[40px]" onClick={onDismiss}>
              Not now
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function CoachDrawer() {
  const app = useApp();
  const { coachOpen, closeCoach, coachSeed, clearCoachSeed, charge, zone, shield, checkIn, userName, streak } = app;
  const isDesktop = useIsDesktop();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const idRef = useRef(1);
  const timers = useRef<number[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ctxRef = useRef<CoachContext>({ charge, zone, shield, checkIn, userName, streak });
  ctxRef.current = { charge, zone, shield, checkIn, userName, streak };

  const busy = typing || messages.some((m) => m.streaming);

  const scrollToEnd = useCallback((smooth = true) => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: idRef.current++, role: 'user', text }]);
    setInput('');
    setTyping(true);
    const delay = 900 + Math.round(Math.random() * 700);
    const t = window.setTimeout(() => {
      const reply = coachReply(text, ctxRef.current);
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: idRef.current++, role: 'assistant', text: reply.text, streaming: true, card: reply.card, cardState: reply.card ? 'open' : undefined },
      ]);
    }, delay);
    timers.current.push(t);
  }, []);

  // Auto-send a seeded prompt once when the drawer opens.
  useEffect(() => {
    if (coachOpen && coachSeed) {
      send(coachSeed);
      clearCoachSeed();
    }
  }, [coachOpen, coachSeed, send, clearCoachSeed]);

  // Esc to close.
  useEffect(() => {
    if (!coachOpen) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && closeCoach();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [coachOpen, closeCoach]);

  // Focus input on open (desktop only, avoids popping the keyboard on mobile).
  useEffect(() => {
    if (coachOpen && isDesktop) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 250);
      return () => window.clearTimeout(t);
    }
  }, [coachOpen, isDesktop]);

  // Auto-scroll on new content / open.
  useEffect(() => {
    if (coachOpen) scrollToEnd();
  }, [messages.length, typing, coachOpen, scrollToEnd]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!coachOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [coachOpen]);

  const finishStream = (id: number) => {
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, streaming: false } : x)));
    window.setTimeout(() => scrollToEnd(), 60);
  };

  const setCardState = (id: number, s: Msg['cardState']) => setMessages((m) => m.map((x) => (x.id === id ? { ...x, cardState: s } : x)));

  const applySwap = (msg: Msg) => {
    if (!msg.card) return;
    const { zone: z, session } = msg.card.apply;
    if (session) app.setSessionType(session);
    if (z) app.setZoneOverride(z);
    setCardState(msg.id, 'applied');
    app.setView('app');
    app.setTab('workout');
    closeCoach();
    app.toast({ title: 'Workout swapped ✓', body: `${msg.card.title} is now today's plan.`, tone: 'success' });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!busy) send(input);
  };

  const meta = ZONE_META[zone];
  const greeting = coachGreeting({ charge, zone, shield, checkIn, userName, streak });

  const panelMotion = isDesktop
    ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };

  return (
    <AnimatePresence>
      {coachOpen && (
        <motion.div key="coach" className="fixed inset-0 z-[75]" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeCoach}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            data-testid="coach-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="AI Pocket Coach"
            {...panelMotion}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="absolute inset-x-0 bottom-0 top-0 flex flex-col overflow-hidden border-white/[0.08] bg-ink-950 md:left-auto md:w-[420px] md:border-l md:shadow-[-30px_0_60px_-20px_rgba(0,0,0,0.7)]"
          >
            <div className="pointer-events-none absolute -top-32 right-0 h-64 w-64 rounded-full bg-spark/20 blur-3xl" />
            {/* Header */}
            <header className="relative flex items-center gap-3 border-b border-white/[0.06] px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))]">
              <CoachOrb />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <h2 className="font-display text-base font-bold text-ink-100">AI Pocket Coach</h2>
                  <span className="rounded-full border border-spark/30 bg-spark/10 px-2 py-0.5 text-[10px] font-semibold text-spark">Simulated preview</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                  {charge}% Daily Charge · {meta.verdict}
                </div>
              </div>
              <button onClick={closeCoach} aria-label="Close coach" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[0.06] text-ink-300 hover:bg-white/[0.12]">
                <X size={18} />
              </button>
            </header>

            {/* Messages */}
            <div ref={listRef} className="relative flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5">
              <div className="flex items-end gap-2">
                <CoachOrb size={28} />
                <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/[0.06] bg-ink-800 px-4 py-3 text-sm leading-relaxed text-ink-100">
                  {greeting}
                </div>
              </div>

              {messages.map((m) =>
                m.role === 'user' ? (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-spark px-4 py-2.5 text-sm font-medium leading-relaxed text-ink-950">{m.text}</div>
                  </motion.div>
                ) : (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
                    <div className="mt-auto">
                      <CoachOrb size={28} />
                    </div>
                    <div className="min-w-0 max-w-[88%] flex-1">
                      <div className="rounded-2xl rounded-bl-md border border-white/[0.06] bg-ink-800 px-4 py-3 text-sm leading-relaxed text-ink-100">
                        {m.streaming ? <StreamText text={m.text} onTick={() => scrollToEnd(false)} onDone={() => finishStream(m.id)} /> : m.text}
                      </div>
                      {m.card && !m.streaming && (
                        <WorkoutCardView card={m.card} state={m.cardState} onApply={() => applySwap(m)} onDismiss={() => setCardState(m.id, 'dismissed')} />
                      )}
                    </div>
                  </motion.div>
                ),
              )}

              <AnimatePresence>
                {typing && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <TypingDots />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Composer */}
            <div className="relative border-t border-white/[0.06] bg-ink-950/95 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    disabled={busy}
                    onClick={() => send(p)}
                    className="chip min-h-[36px] shrink-0 whitespace-nowrap transition hover:border-spark/40 hover:text-ink-100 disabled:opacity-40"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <form onSubmit={onSubmit} className="flex items-center gap-2 px-4">
                <input
                  ref={inputRef}
                  data-testid="coach-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your coach anything…"
                  aria-label="Message the coach"
                  className="min-h-[46px] min-w-0 flex-1 rounded-2xl border border-white/[0.08] bg-ink-800 px-4 text-[16px] text-ink-100 placeholder:text-ink-400 focus:border-spark/50 focus:outline-none sm:text-sm"
                />
                <button
                  type="submit"
                  data-testid="coach-send"
                  aria-label="Send"
                  disabled={busy || !input.trim()}
                  className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-spark text-ink-950 transition hover:brightness-110 active:scale-95 disabled:opacity-40"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="mt-2 px-4 text-center text-[10px] text-ink-400">Simulated coach running on your device — not medical advice.</p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
