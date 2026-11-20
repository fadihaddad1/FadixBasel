import { ZONE_META } from '../../utils/recoveryEngine';

/** Length of one scene in ms. The whole intro is SCENE_COUNT × SCENE_MS = 30s. */
export const SCENE_MS = 7500;
export const SCENE_COUNT = 4;
export const TOTAL_MS = SCENE_MS * SCENE_COUNT;

export interface SceneScript {
  /** Short label used on the progress bar. */
  label: string;
  /** Eyebrow shown above the scene visual. */
  eyebrow: string;
  /** On-screen kinetic caption (revealed word by word). */
  caption: string;
  /** Spoken narration — shorter than the caption so it fits inside 7.5s. */
  narration: string;
  /** Words (lower-cased, punctuation stripped) that get the accent treatment. */
  emphasis: string[];
  /** Ambient accent colour pair for the background glows. */
  glow: [string, string];
}

export const SCENES: SceneScript[] = [
  {
    label: 'The Hook',
    eyebrow: 'The everyday workout trap',
    caption:
      'You wake up tired, push way too hard out of guilt, wreck your body, and quit for two weeks—or buy a $400 watch that just gives you confusing numbers.',
    narration:
      'You wake up tired, push way too hard out of guilt, and quit for two weeks. Or buy a four-hundred-dollar watch that just confuses you.',
    emphasis: ['tired', 'guilt', 'quit', '400', 'confusing'],
    glow: [ZONE_META.recharge.color, '#FF8A3D'],
  },
  {
    label: '10-Second Check-In',
    eyebrow: 'The 10-second solution',
    caption: '10 seconds every morning. Zero expensive wearables. Personalized to YOUR baseline.',
    narration: 'Ten seconds every morning. Zero expensive wearables. Your Daily Charge, personalized to your baseline.',
    emphasis: ['10', 'seconds', 'zero', 'your', 'baseline'],
    glow: [ZONE_META.prime.color, '#7C8CFF'],
  },
  {
    label: 'Auto-Adjuster',
    eyebrow: 'Smart Workout Auto-Adjuster · Burnout Shield',
    caption:
      'Green? Go heavy. Yellow? We dial it back 15%. Red? A 20-minute recovery flow—while your Burnout Shield keeps you in the sweet spot.',
    narration:
      'Green? Go heavy. Yellow? We dial it back fifteen percent. Red? A twenty-minute recovery flow. Burnout Shield keeps you safe.',
    emphasis: ['green', 'yellow', 'red', 'burnout', 'shield', 'sweet', 'spot'],
    glow: [ZONE_META.steady.color, ZONE_META.prime.color],
  },
  {
    label: 'Get Started',
    eyebrow: 'Your first morning, in 3 taps',
    caption: 'Check in. Get your adjusted workout. Ask your AI Pocket Coach anything. Know when to push—and when to recover.',
    narration:
      'Tap your morning check-in, get your adjusted workout, and ask your AI Pocket Coach. Know when to push, and when to recover.',
    emphasis: ['check', 'adjusted', 'coach', 'push', 'recover'],
    glow: ['#7C8CFF', ZONE_META.prime.color],
  },
];

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Map t from [a, b] to [0, 1], clamped. */
export const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

export function formatClock(ms: number) {
  const s = Math.floor(ms / 1000);
  return `0:${String(s).padStart(2, '0')}`;
}
