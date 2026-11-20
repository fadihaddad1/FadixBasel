import { useCallback, useEffect, useRef, useState } from 'react';

type WithActivation = Navigator & { userActivation?: { hasBeenActive: boolean } };

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') return null;
    return window.speechSynthesis ?? null;
  } catch {
    return null;
  }
}

/** true / false when the browser can tell us; null when it can't (older Safari/Firefox). */
function hasBeenActive(): boolean | null {
  try {
    const ua = (navigator as WithActivation).userActivation;
    return ua ? ua.hasBeenActive : null;
  } catch {
    return null;
  }
}

const PREFERRED = [/google us english/i, /samantha/i, /aria/i, /jenny/i, /natural/i, /google uk english female/i, /daniel/i];

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  if (!english.length) return null;
  for (const re of PREFERRED) {
    const hit = english.find((v) => re.test(v.name));
    if (hit) return hit;
  }
  return english.find((v) => /en[-_]US/i.test(v.lang)) ?? english[0];
}

export interface Narration {
  supported: boolean;
  /** Speech exists but the browser hasn't allowed it yet (needs a user gesture). */
  blocked: boolean;
  /** An utterance is actually being spoken right now. */
  speaking: boolean;
  speak: (text: string, key: string) => void;
  cancel: () => void;
  /** Call from inside a user gesture: marks speech as allowed. */
  unlock: () => void;
}

/**
 * Thin, defensive wrapper around window.speechSynthesis. Never throws, even where the API
 * doesn't exist. Detects autoplay blocking via navigator.userActivation, the `not-allowed`
 * error, or an utterance that silently never starts.
 */
export function useNarration(rate = 1.05): Narration {
  const synth = getSynth();
  const supported = synth !== null;
  const [blocked, setBlocked] = useState(() => supported && hasBeenActive() === false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastRef = useRef<{ key: string; at: number } | null>(null);
  const watchdog = useRef<number | undefined>(undefined);

  // Load voices (Chrome fills the list asynchronously).
  useEffect(() => {
    if (!synth) return;
    const load = () => {
      try {
        voiceRef.current = pickVoice(synth.getVoices());
      } catch {
        /* ignore */
      }
    };
    load();
    try {
      synth.addEventListener?.('voiceschanged', load);
    } catch {
      /* ignore */
    }
    return () => {
      try {
        synth.removeEventListener?.('voiceschanged', load);
      } catch {
        /* ignore */
      }
    };
  }, [synth]);

  // Any gesture anywhere grants sticky activation — lift the block for future scenes.
  useEffect(() => {
    if (!blocked) return;
    const onGesture = () => setBlocked(false);
    window.addEventListener('pointerdown', onGesture, true);
    window.addEventListener('keydown', onGesture, true);
    return () => {
      window.removeEventListener('pointerdown', onGesture, true);
      window.removeEventListener('keydown', onGesture, true);
    };
  }, [blocked]);

  const cancel = useCallback(() => {
    window.clearTimeout(watchdog.current);
    utterRef.current = null;
    lastRef.current = null;
    setSpeaking(false);
    try {
      synth?.cancel();
    } catch {
      /* ignore */
    }
  }, [synth]);

  const speak = useCallback(
    (text: string, key: string) => {
      if (!synth) return;
      const now = performance.now();
      // De-dupe: the same line requested twice in quick succession (handler + effect).
      if (lastRef.current && lastRef.current.key === key && now - lastRef.current.at < 400) return;
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const voice = voiceRef.current ?? pickVoice(synth.getVoices());
        if (voice) u.voice = voice;
        u.lang = voice?.lang ?? 'en-US';
        u.rate = rate;
        u.pitch = 1;
        u.volume = 1;
        let started = false;
        u.onstart = () => {
          started = true;
          if (utterRef.current === u) setSpeaking(true);
        };
        u.onend = () => {
          if (utterRef.current === u) {
            utterRef.current = null;
            setSpeaking(false);
          }
        };
        u.onerror = (e) => {
          if (utterRef.current === u) {
            utterRef.current = null;
            setSpeaking(false);
          }
          if (e.error === 'not-allowed') setBlocked(true);
        };
        utterRef.current = u; // keep a reference so Chrome doesn't GC it mid-sentence
        lastRef.current = { key, at: now };
        synth.speak(u);
        if (synth.paused) synth.resume();
        window.clearTimeout(watchdog.current);
        watchdog.current = window.setTimeout(() => {
          if (utterRef.current === u && !started && !synth.speaking) {
            utterRef.current = null;
            setBlocked(true);
          }
        }, 1800);
      } catch {
        setSpeaking(false);
      }
    },
    [synth, rate],
  );

  const unlock = useCallback(() => setBlocked(false), []);

  // Never leave the browser talking after the intro goes away.
  useEffect(
    () => () => {
      window.clearTimeout(watchdog.current);
      try {
        synth?.cancel();
      } catch {
        /* ignore */
      }
    },
    [synth],
  );

  return { supported, blocked, speaking, speak, cancel, unlock };
}
