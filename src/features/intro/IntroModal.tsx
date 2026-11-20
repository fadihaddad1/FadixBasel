import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { Music2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Logo, LogoMark } from '../../components/brand/Logo';
import { FounderBadge } from '../../components/brand/Founder';
import { useApp } from '../../state/AppState';
import { ZONE_META } from '../../utils/recoveryEngine';
import { AmbientPad } from './ambient';
import { Backdrop } from './Backdrop';
import { FitToBox } from './FitToBox';
import { KineticCaption } from './KineticCaption';
import { ProgressBar } from './ProgressBar';
import { SCENES, SCENE_COUNT, SCENE_MS, TOTAL_MS, formatClock } from './introScript';
import { useIntroClock } from './useIntroClock';
import { useMediaQuery } from './useMediaQuery';
import { useNarration } from './useNarration';
import { Waveform } from './Waveform';
import { AdjusterScene } from './scenes/AdjusterScene';
import { HookScene } from './scenes/HookScene';
import { SolutionScene } from './scenes/SolutionScene';
import { WalkthroughScene } from './scenes/WalkthroughScene';

/** Full-screen 30-second cinematic intro. Renders nothing while `introOpen` is false. */
export function IntroModal() {
  const { introOpen } = useApp();
  return <AnimatePresence>{introOpen && <IntroPlayer key="daygauge-intro" />}</AnimatePresence>;
}

/** ?scene=N (1–4) starts on that scene; ?paused=1 starts paused on a representative frame. */
function readStartParams(): { ms: number; paused: boolean } {
  try {
    const p = new URLSearchParams(window.location.search);
    const n = Number.parseInt(p.get('scene') ?? '', 10);
    const scene = n >= 1 && n <= SCENE_COUNT ? n - 1 : 0;
    const paused = p.get('paused') === '1';
    // A paused frame at the very start of a scene is mostly empty, so freeze at 80% instead.
    return { ms: scene * SCENE_MS + (paused ? SCENE_MS * 0.8 : 0), paused };
  } catch {
    return { ms: 0, paused: false };
  }
}

/** Below this local progress, entering/resuming a scene (re)starts its narration line. */
const NARRATE_BEFORE = 0.45;

function accentFor(scene: number, local: number): string {
  if (scene === 0) return ZONE_META.recharge.color;
  if (scene === 2) return local < 0.34 ? ZONE_META.prime.color : local < 0.67 ? ZONE_META.steady.color : ZONE_META.recharge.color;
  return ZONE_META.prime.color;
}

function IntroPlayer() {
  const { closeIntro, setView, setTab } = useApp();
  const [start] = useState(readStartParams);
  const clock = useIntroClock(TOTAL_MS, start.ms, !start.paused);
  const narration = useNarration(1.05);
  const wide = useMediaQuery('(min-width: 768px)');
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  const [voiceOn, setVoiceOn] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const padRef = useRef<AmbientPad | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const scene = Math.min(SCENE_COUNT - 1, Math.floor(clock.elapsed / SCENE_MS));
  const local = Math.min(1, (clock.elapsed - scene * SCENE_MS) / SCENE_MS);
  const script = SCENES[scene];
  const accent = accentFor(scene, local);
  const glow: [string, string] = scene === 2 ? [accent, script.glow[1]] : script.glow;

  // Latest values for handlers / effects that shouldn't re-subscribe each frame.
  const live = useRef({ playing: clock.playing, local, voiceOn, scene });
  live.current = { playing: clock.playing, local, voiceOn, scene };

  const say = useCallback(
    (i: number) => {
      narration.speak(SCENES[i].narration, `scene-${i}`);
    },
    [narration],
  );

  // Narrate on scene enter (cancel any line from the previous scene).
  useEffect(() => {
    const { playing, local: l, voiceOn: v } = live.current;
    if (v && !narration.blocked && playing && l < NARRATE_BEFORE) say(scene);
    else narration.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, narration.blocked]);

  // ---------- actions ----------
  const speakNow = useCallback(
    (i: number) => {
      // Called from a user gesture, so speech is allowed from here on.
      narration.unlock();
      say(i);
    },
    [narration, say],
  );

  const replay = useCallback(() => {
    clock.seek(0);
    clock.play();
    if (live.current.voiceOn) speakNow(0);
  }, [clock, speakNow]);

  const togglePlay = useCallback(() => {
    if (clock.playing) {
      clock.pause();
      narration.cancel();
      return;
    }
    if (clock.read() >= TOTAL_MS) {
      replay();
      return;
    }
    clock.play();
    const { voiceOn: v, local: l, scene: s } = live.current;
    if (v && l < NARRATE_BEFORE + 0.05) speakNow(s);
  }, [clock, narration, replay, speakNow]);

  const goTo = useCallback(
    (i: number) => {
      if (i >= SCENE_COUNT) {
        clock.seek(TOTAL_MS);
        return;
      }
      const target = Math.max(0, i);
      clock.seek(target * SCENE_MS);
      if (live.current.voiceOn && live.current.playing) speakNow(target);
    },
    [clock, speakNow],
  );

  const toggleVoice = useCallback(() => {
    if (voiceOn) {
      setVoiceOn(false);
      narration.cancel();
      return;
    }
    setVoiceOn(true);
    if (clock.playing || clock.read() >= TOTAL_MS) speakNow(live.current.scene);
    else narration.unlock();
  }, [voiceOn, clock, narration, speakNow]);

  const enableVoice = useCallback(() => {
    setVoiceOn(true);
    speakNow(live.current.scene);
    if (!clock.playing && clock.read() < TOTAL_MS) clock.play();
  }, [clock, speakNow]);

  const toggleSound = useCallback(() => {
    if (!padRef.current) padRef.current = new AmbientPad();
    if (soundOn) {
      padRef.current.stop();
      setSoundOn(false);
    } else {
      setSoundOn(padRef.current.start());
    }
  }, [soundOn]);

  const close = useCallback(() => {
    narration.cancel();
    padRef.current?.stop();
    closeIntro();
  }, [narration, closeIntro]);

  const launch = useCallback(() => {
    close();
    setView('app');
    setTab('today');
  }, [close, setView, setTab]);

  // ---------- lifecycle ----------
  useEffect(() => {
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    rootRef.current?.focus({ preventScroll: true });
    return () => {
      body.style.overflow = prev;
      padRef.current?.stop();
    };
  }, []);

  const keys = useRef({ togglePlay, goTo, close });
  keys.current = { togglePlay, goTo, close };
  useEffect(() => {
    const isSpace = (e: KeyboardEvent) => e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isSpace(e)) {
        e.preventDefault(); // also stops a focused button from "clicking"
        if (!e.repeat) keys.current.togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        keys.current.goTo(live.current.scene + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        keys.current.goTo(live.current.scene - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        keys.current.close();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (isSpace(e)) e.preventDefault();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Pointer parallax (desktop only).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  useEffect(() => {
    if (!finePointer) {
      px.set(0);
      py.set(0);
    }
  }, [finePointer, px, py]);

  const needsVoiceTap = voiceOn && narration.supported && narration.blocked;
  const waveLevel: 0 | 1 | 2 = narration.speaking ? 2 : soundOn && clock.playing ? 1 : 0;

  const sceneView = (() => {
    const props = { t: local, wide };
    switch (scene) {
      case 0:
        return <HookScene {...props} />;
      case 1:
        return <SolutionScene {...props} />;
      case 2:
        return <AdjusterScene {...props} />;
      default:
        return <WalkthroughScene {...props} onStart={close} onLaunch={launch} />;
    }
  })();

  const enableBadge = (
    <motion.button
      type="button"
      onClick={enableVoice}
      className="relative inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold text-ink-950 sm:text-sm"
      style={{ background: ZONE_META.prime.color, borderColor: ZONE_META.prime.color }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: [1, 1.06, 1] }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}
      aria-label="Enable voice narration"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-prime/40" aria-hidden />
      <span aria-hidden>🔊</span> Enable Voice
    </motion.button>
  );

  return (
    <motion.div
      ref={rootRef}
      data-testid="intro-modal"
      role="dialog"
      aria-modal="true"
      aria-label="DayGauge 30-second intro"
      tabIndex={-1}
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden text-ink-100 outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={(e) => {
        if (!finePointer) return;
        px.set((e.clientX / window.innerWidth) * 2 - 1);
        py.set((e.clientY / window.innerHeight) * 2 - 1);
      }}
    >
      <Backdrop px={px} py={py} colors={glow} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 pt-[max(14px,env(safe-area-inset-top))] md:px-8 md:pt-6">
        <span className="shrink-0">
          <span className="sm:hidden">
            <LogoMark size={32} />
          </span>
          <span className="hidden sm:inline-flex">
            <Logo size={32} />
          </span>
        </span>
        <div className="flex min-w-0 flex-1 justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {needsVoiceTap ? (
              <motion.div key="badge">{enableBadge}</motion.div>
            ) : (
              <motion.span
                key={`chip-${scene}`}
                className="chip hidden tabular-nums md:inline-flex"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
              >
                <span style={{ color: accent }}>●</span> {String(scene + 1).padStart(2, '0')} / 0{SCENE_COUNT} · {script.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button type="button" data-testid="intro-skip" onClick={close} className="btn-ghost btn-sm h-10 shrink-0 px-4">
          Skip Intro <span aria-hidden>→</span>
        </button>
      </header>

      {/* Stage */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pt-3 md:px-8 md:pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={scene}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, y: 28, scale: 0.97, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -18, scale: 0.98, filter: 'blur(8px)', transition: { duration: 0.22 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="eyebrow text-center text-[11px] md:text-xs">
              <span className="tabular-nums" style={{ color: accent }}>
                {String(scene + 1).padStart(2, '0')}
              </span>{' '}
              — {script.eyebrow}
            </div>
            <div className="min-h-0 flex-1 py-3 md:py-5">
              <FitToBox>{sceneView}</FitToBox>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Kinetic caption */}
      <section className="relative z-10 px-4 pb-2 md:px-8 md:pb-3" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={scene}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
            transition={{ duration: 0.3 }}
          >
            <KineticCaption text={script.caption} t={local} emphasis={script.emphasis} accent={accent} />
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Transport */}
      <footer className="relative z-10 px-4 pb-[max(12px,env(safe-area-inset-bottom))] md:px-8 md:pb-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 md:gap-3">
            <IconButton
              testId="intro-play-toggle"
              label={clock.playing ? 'Pause intro' : clock.ended ? 'Replay intro' : 'Play intro'}
              onClick={togglePlay}
              primary
            >
              {clock.playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
            </IconButton>
            <IconButton label="Replay from the start" onClick={replay}>
              <RotateCcw className="h-[18px] w-[18px]" />
            </IconButton>
            <div className="flex min-w-0 flex-1 items-center gap-3 pl-1">
              <Waveform level={waveLevel} color={accent} />
              <span className="hidden text-xs font-semibold text-ink-400 lg:inline">
                {narration.speaking ? 'Narrating…' : !narration.supported ? 'Voice unavailable' : voiceOn ? (clock.playing ? 'Voice on' : 'Paused') : 'Voice muted'}
              </span>
            </div>
            <IconButton
              testId="intro-voice-toggle"
              label={!narration.supported ? 'Voice narration is not supported in this browser' : voiceOn ? 'Mute voice' : 'Unmute voice'}
              onClick={toggleVoice}
              disabled={!narration.supported}
              pressed={voiceOn && narration.supported}
              text={wide ? (voiceOn && narration.supported ? 'Voice' : 'Muted') : undefined}
            >
              {voiceOn && narration.supported ? <Volume2 className="h-[18px] w-[18px]" /> : <VolumeX className="h-[18px] w-[18px]" />}
            </IconButton>
            {AmbientPad.supported() && (
              <IconButton
                label={soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on'}
                onClick={toggleSound}
                pressed={soundOn}
                text={wide ? 'Sound' : undefined}
              >
                <Music2 className="h-[18px] w-[18px]" />
              </IconButton>
            )}
          </div>

          <div className="mt-2">
            <ProgressBar elapsed={clock.elapsed} scene={scene} accent={accent} onSeek={clock.seek} />
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 md:mt-3">
            <FounderBadge />
            <div className="flex items-center gap-4 text-[11px] text-ink-400">
              <span className="hidden lg:inline">
                <Kbd>Space</Kbd> pause · <Kbd>←</Kbd>
                <Kbd>→</Kbd> scenes · <Kbd>Esc</Kbd> skip
              </span>
              <span className="tabular-nums">
                {formatClock(clock.elapsed)} / {formatClock(TOTAL_MS)}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  testId,
  primary = false,
  pressed,
  disabled = false,
  text,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  testId?: string;
  primary?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  text?: string;
}) {
  const base =
    'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold transition duration-200 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40';
  const tone = primary
    ? 'bg-ink-100 text-ink-950 hover:bg-white'
    : pressed
      ? 'border border-white/[0.14] bg-white/[0.12] text-ink-100 hover:bg-white/[0.16]'
      : 'border border-white/[0.08] bg-white/[0.04] text-ink-400 hover:bg-white/[0.08] hover:text-ink-100';
  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${tone} ${text ? 'px-4' : 'w-11'}`}
    >
      {children}
      {text && <span>{text}</span>}
    </button>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="mx-0.5 rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-sans text-[10px] text-ink-300">{children}</kbd>;
}
