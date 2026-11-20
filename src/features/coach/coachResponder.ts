// Local, rule-based "AI" Pocket Coach. No network calls — keyword matching over live app state.
import type { CheckIn, SessionType, ShieldReading, Zone } from '../../types/wellness';
import { ZONE_META } from '../../utils/recoveryEngine';

export interface CoachWorkoutCard {
  title: string;
  minutes: number;
  rows: { name: string; detail: string; emoji: string }[];
  /** What "Apply Workout Swap" does. */
  apply: { zone?: Zone; session?: SessionType };
}

export interface CoachReply {
  text: string;
  card?: CoachWorkoutCard;
}

export interface CoachContext {
  charge: number;
  zone: Zone;
  shield: ShieldReading;
  checkIn: CheckIn;
  userName: string;
  streak: number;
}

const SLEEP_WORDS = ['awful', 'rough', 'okay', 'good', 'great'];

const RECOVERY_CARD: CoachWorkoutCard = {
  title: '20-Min Mobility + Walk',
  minutes: 20,
  rows: [
    { name: 'Brisk outdoor walk', detail: '10 min · easy, nose-breathing', emoji: '🚶' },
    { name: 'Cat-cow + thoracic rotations', detail: '2 × 8 each · slow', emoji: '🐈' },
    { name: '90/90 hip switches', detail: '2 × 10 · gentle', emoji: '🦵' },
    { name: 'Glute bridge hold', detail: '2 × 30 sec', emoji: '🌉' },
    { name: 'Box breathing', detail: '3 min · 4-4-4-4', emoji: '🫁' },
  ],
  apply: { zone: 'recharge' },
};

const STEADY_LIFT_CARD: CoachWorkoutCard = {
  title: 'Lower Body — Dialed Back 15%',
  minutes: 40,
  rows: [
    { name: 'Back squat', detail: '3 × 6 · 85% of working weight', emoji: '🏋️' },
    { name: 'Romanian deadlift', detail: '3 × 8 · leave 3–4 reps in tank', emoji: '🦵' },
    { name: 'Walking lunges', detail: '3 × 10 / leg · moderate', emoji: '🚶' },
    { name: 'Calf raises', detail: '3 × 15 · pause at top', emoji: '🦶' },
  ],
  apply: { zone: 'steady' },
};

function hoursFrom(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(?:h\b|hr|hrs|hour|hours)/i);
  return m ? parseFloat(m[1]) : null;
}

const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Word-start match so "eat" doesn't fire on "great". */
const has = (t: string, words: string[]) => words.some((w) => new RegExp(`(^|[^a-z])${esc(w)}`).test(t));

export function coachGreeting(ctx: CoachContext): string {
  const meta = ZONE_META[ctx.zone];
  const lead =
    ctx.zone === 'prime'
      ? "you're fresh — a great day to push a little."
      : ctx.zone === 'steady'
        ? "you're okay, not your best — let's train smart and dial it back about 15%."
        : 'your body is asking for a break — recovery counts as winning today.';
  return `Hey ${ctx.userName} 👋 You're at ${ctx.charge}% Daily Charge (${meta.emoji} ${meta.verdict}), so ${lead} Your Burnout Shield reads "${ctx.shield.label}". Ask me anything about today's training, recovery, food or your streak.`;
}

export function coachReply(input: string, ctx: CoachContext): CoachReply {
  const t = input.toLowerCase();
  const meta = ZONE_META[ctx.zone];
  const sleepWord = SLEEP_WORDS[ctx.checkIn.sleep - 1];

  // ---- Sleep ----
  if (has(t, ['sleep', 'slept', 'tired', 'insomnia', 'nap'])) {
    const hrs = hoursFrom(t);
    const short = (hrs !== null && hrs < 6.5) || (hrs === null && ctx.checkIn.sleep <= 2);
    if (short) {
      return {
        text: `${hrs !== null ? `${hrs} hours is` : 'A rough night is'} on the short side, and short sleep hits strength and coordination first. You can still train — just not heavy. With your Daily Charge at ${ctx.charge}%, I'd skip max-effort sets today: keep the movements, drop the load about 15%, and stop each set with 3–4 reps left. If you feel worse after the warm-up, switch to the mobility flow instead. Here's a dialed-back version you can swap in with one tap:`,
        card: ctx.zone === 'recharge' ? RECOVERY_CARD : STEADY_LIFT_CARD,
      };
    }
    return {
      text: `You rated last night's sleep "${sleepWord}", which is a big part of why you're at ${ctx.charge}%. Sleep drives 35% of your Daily Charge. ${
        ctx.zone === 'prime' ? 'You slept well enough to lift as planned — go for it.' : 'Aim for 7+ hours tonight; your best days usually follow one.'
      } Tip: a consistent wake-up time does more than an early bedtime.`,
    };
  }

  // ---- Sore / routine / mobility ----
  if (has(t, ['sore', 'routine', 'mobility', 'stretch', '20-min', '20 min', 'low-soreness', 'stiff', 'recovery'])) {
    return {
      text: `Here's a 20-minute, low-soreness flow. It gets blood moving through tight muscles without adding any real fatigue — perfect at ${ctx.charge}% charge. It also keeps your ${ctx.streak}-day streak alive. Want me to put it in your Workout tab?`,
      card: RECOVERY_CARD,
    };
  }

  // ---- Shield / burnout ----
  if (has(t, ['shield', 'burnout', 'yellow', 'amber', 'overtrain', 'injury', 'load'])) {
    const s = ctx.shield;
    const pct = Math.round((s.ratio - 1) * 100);
    const compare =
      pct > 0 ? `about ${pct}% more than your usual week` : pct < 0 ? `about ${Math.abs(pct)}% less than your usual week` : 'right on your usual week';
    const yellowNote = t.includes('yellow') && s.band !== 'caution' ? ` (Good news: it's not actually in the yellow right now.)` : '';
    const advice =
      s.band === 'over'
        ? "Today, take an easy day — your body needs to catch up. I'd swap in the mobility flow:"
        : s.band === 'caution'
          ? "Hold steady — don't add extra sessions this week. If you train today, keep it moderate:"
          : s.band === 'under'
            ? "You have room to add a session or push a bit harder — your body can handle it."
            : "Keep doing exactly what you're doing — this is how fitness builds without burnout.";
    return {
      text: `Your Burnout Shield is at "${s.label}"${yellowNote}. This week you've done ${s.acuteLoad.toLocaleString('en-US')} load points vs a usual ${s.chronicLoad.toLocaleString('en-US')} — ${compare} (ratio ${s.ratio.toFixed(2)}). Load = how hard each workout felt × its minutes. ${advice}`,
      card: s.band === 'over' ? RECOVERY_CARD : s.band === 'caution' ? STEADY_LIFT_CARD : undefined,
    };
  }

  // ---- Food ----
  if (has(t, ['eat', 'food', 'meal', 'snack', 'protein', 'carb', 'breakfast', 'nutrition', 'hungry', 'drink', 'coffee'])) {
    return {
      text: `Keep it simple: 60–90 minutes before training, have some easy carbs plus a little protein — a banana with Greek yogurt, oatmeal with berries, or toast with peanut butter. If you only have 20 minutes, a banana alone works. Sip 300–500 ml of water. ${
        ctx.zone === 'recharge' ? "On a low-charge day like today, don't skip food — under-fueling makes recovery slower." : 'Coffee 30–45 minutes before is fine if it agrees with you.'
      } Afterwards, aim for 20–40 g of protein within a couple of hours.`,
    };
  }

  // ---- Streak / rest ----
  if (has(t, ['streak', 'rest day', 'rest', 'day off', 'skip'])) {
    return {
      text: `Rest days count! Your ${ctx.streak}-day streak stays alive as long as you check in and do any movement — even a 20-minute walk and stretch. Recovery is part of training, not a break from it. Here's a quick flow that counts toward your streak:`,
      card: RECOVERY_CARD,
    };
  }

  // ---- Swap / easier ----
  if (has(t, ['swap', 'easier', 'lighter', 'change', 'replace', 'switch', 'shorter'])) {
    const card = ctx.zone === 'steady' || ctx.zone === 'prime' ? STEADY_LIFT_CARD : RECOVERY_CARD;
    return {
      text: `No problem — easier is often smarter. At ${ctx.charge}% charge, here's a version that still gets the work in without digging a hole for tomorrow. Tap Apply and I'll update your Workout tab.`,
      card,
    };
  }

  // ---- Lift / train today ----
  if (has(t, ['lift', 'train', 'workout', 'gym', 'run', 'push', 'heavy', 'personal record'])) {
    if (ctx.zone === 'prime') {
      return {
        text: `Yes — at ${ctx.charge}% you're in ${meta.name} territory. Warm up well, then go for a little more weight on your first lift if it moves smoothly. Keep 1–2 reps in the tank on the last set.`,
      };
    }
    return {
      text: `At ${ctx.charge}% (${meta.verdict}), ${ctx.zone === 'steady' ? 'train, but trim about 15% off the volume and load' : 'swap the hard session for gentle movement'}. You'll get more out of next week by not overreaching today.`,
      card: ctx.zone === 'steady' ? STEADY_LIFT_CARD : RECOVERY_CARD,
    };
  }

  // ---- Default ----
  return {
    text: `Good question. Here's what I see today: ${ctx.charge}% Daily Charge (${meta.verdict}), sleep rated "${sleepWord}", and a Burnout Shield at "${ctx.shield.label}". ${meta.blurb} Ask me about sleep, soreness, food, your Shield, or swapping today's workout.`,
  };
}
