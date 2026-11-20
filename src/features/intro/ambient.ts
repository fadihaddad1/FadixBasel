type AudioCtor = typeof AudioContext;

function getAudioCtor(): AudioCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
}

/**
 * A very quiet ambient pad: two detuned oscillators (plus a soft fifth) through a low-pass
 * filter, with a slow LFO breathing on the gain. Created only from a user click.
 */
export class AmbientPad {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private nodes: AudioScheduledSourceNode[] = [];

  static supported(): boolean {
    return typeof getAudioCtor() === 'function';
  }

  get running() {
    return this.ctx !== null;
  }

  start(volume = 0.045): boolean {
    if (this.ctx) return true;
    try {
      const Ctor = getAudioCtor();
      if (!Ctor) return false;
      const ctx = new Ctor();
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(volume, now + 2.2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 520;
      filter.Q.value = 0.7;

      // Breathing gain: base 0.75 ± 0.25 at ~0.12 Hz.
      const breath = ctx.createGain();
      breath.gain.value = 0.75;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.25;
      lfo.connect(lfoDepth).connect(breath.gain);

      // Slow filter sweep for movement.
      const sweep = ctx.createOscillator();
      sweep.frequency.value = 0.05;
      const sweepDepth = ctx.createGain();
      sweepDepth.gain.value = 160;
      sweep.connect(sweepDepth).connect(filter.frequency);

      const voices: [OscillatorType, number, number][] = [
        ['sine', 110, 0.5], // A2
        ['triangle', 110.6, 0.35], // detuned A2
        ['sine', 164.81, 0.18], // E3 — soft fifth
        ['sine', 55, 0.3], // sub
      ];
      for (const [type, freq, level] of voices) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = level;
        o.connect(g).connect(filter);
        o.start(now);
        this.nodes.push(o);
      }
      filter.connect(breath).connect(master).connect(ctx.destination);
      lfo.start(now);
      sweep.start(now);
      this.nodes.push(lfo, sweep);

      void ctx.resume?.().catch(() => undefined);
      this.ctx = ctx;
      this.master = master;
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  stop(): void {
    const ctx = this.ctx;
    const master = this.master;
    const nodes = this.nodes;
    this.ctx = null;
    this.master = null;
    this.nodes = [];
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      master?.gain.cancelScheduledValues(now);
      master?.gain.setValueAtTime(master.gain.value, now);
      master?.gain.linearRampToValueAtTime(0, now + 0.35);
      window.setTimeout(() => {
        nodes.forEach((n) => {
          try {
            n.stop();
          } catch {
            /* already stopped */
          }
        });
        void ctx.close().catch(() => undefined);
      }, 400);
    } catch {
      void ctx.close().catch(() => undefined);
    }
  }
}
