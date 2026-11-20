# DayGauge Design System

> *Know When to Push. Know When to Recover. No Smartwatch Required.*
> Founded by **Fadi Haddad**.

DayGauge is for everyday people: gym-goers, runners, busy professionals, and beginners. The look should feel **warm, energetic, and calm**: Apple Fitness+ energy, Oura restraint, Linear crispness. Every number on screen comes with a plain-language sentence.

## 1. Voice & micro-copy

| Do | Don't |
|---|---|
| "Pace yourself — dial it back about 15%." | "Reduce training stimulus by 15% RPE-adjusted." |
| "Your body is asking for a break." | "HRV-derived readiness insufficient." |
| "Fitness Sweet Spot" | "ACWR 0.8–1.3" (only shown as a small secondary detail) |

- Second person, short sentences, no guilt. Recovery counts as winning.
- Use emoji sparingly as **affordances** (slider faces, zone badges), not decoration.
- Never use "Body Battery". The core metric is always **Daily Charge**.

## 2. Color tokens (`tailwind.config.js`)

| Token | Hex | Use |
|---|---|---|
| `ink-950` | `#0B0D12` | App background |
| `ink-900` | `#11141B` | Cards |
| `ink-800` | `#1C212C` | Raised surfaces, inputs |
| `ink-400` | `#8A93A6` | Secondary text |
| `ink-100` | `#EEF0F5` | Primary text |
| `prime` | `#2EE6A6` | **Prime / Green: "Push Today"**, primary CTAs |
| `steady` | `#FFB547` | **Steady / Amber: "Pace Yourself"** |
| `recharge` | `#FF6B6B` | **Recharge / Red: "Active Recovery"** |
| `spark` | `#7C8CFF` | AI Coach, info, links |
| `sun` | `#FF8A3D` | Warm accent in gradients |

Zone colors always come from `ZONE_META` in `src/utils/recoveryEngine.ts`. Do not hard-code them in features.

## 3. Typography

- **Display:** Plus Jakarta Sans 700/800, tracking -0.02em. Used for headlines and big numbers.
- **Body:** Inter 400–600.
- Scale: `text-xs` 12 · `sm` 14 · `base` 16 · `xl` 20 · `3xl` 30 · `5xl` 48 · `7xl` 72 (hero, desktop only).

## 4. Shape, depth, motion

- Radius: cards `rounded-3xl` (24px), buttons and chips `rounded-full`, inputs `rounded-2xl`.
- Cards: `.card` = ink-900 at 80%, 1px white/6% border, soft deep shadow, backdrop blur.
- Glow: the zone color at 35% opacity, blurred behind rings and active states.
- Motion (Framer Motion):
  - UI springs: `stiffness 320–500, damping 22–30`.
  - Ring and number springs: `stiffness 90, damping 18`.
  - Page transitions: 350ms `ease [0.22, 1, 0.36, 1]`, fade plus 12px rise.
  - Respect `prefers-reduced-motion` (globally reduced in `index.css`).

## 5. Core components

| Component | File | Notes |
|---|---|---|
| Logo / LogoMark | `components/brand/Logo.tsx` | Red→amber→green arc gauge with needle |
| FounderBadge | `components/brand/Founder.tsx` | "Founded by Fadi Haddad", required in intro, landing footer, founder story, app profile |
| ChargeRing | `components/ui/ChargeRing.tsx` | Animated 0–100 ring, zone glow, verdict pill |
| EmojiSlider | `components/ui/EmojiSlider.tsx` | 1–5 tactile slider with emoji face and word |
| Modal | `components/ui/Modal.tsx` | Bottom sheet on mobile, centered dialog on desktop |
| Toasts | `components/ui/Toasts.tsx` | Fire with `useApp().toast()` |
| Buttons | `.btn-primary`, `.btn-ghost`, `.btn-sm` | Pill, 0.97 press scale |
| Chips | `.chip` | Prompt chips, tags |

## 6. The metric model (plain-English)

- **Daily Charge (0–100%)**: 4 check-in inputs (sleep 35%, energy 25%, soreness 20%, stress 20%). 70% of the score is absolute; 30% compares today to your own 14-day average.
  - ≥72 **Prime**, 52–71 **Steady**, <52 **Recharge**.
- **Burnout Shield**: this week's training load (effort × minutes) compared to your 4-week weekly average.
  - <0.8 *Under-training* · 0.8–1.3 *Fitness Sweet Spot* · 1.3–1.5 *Ramping Fast* · >1.5 *Overdoing It / Injury Risk*.
- **Smart Workout Auto-Adjuster**: Prime adds a set and goes heavy. Steady cuts ~15% (one fewer set on big lifts, 85% load). Recharge swaps to a 20-minute mobility and walk flow.

## 7. Layout

- Mobile-first. Bottom tab bar under `md`, left sidebar at `md+`.
- 16px side gutters on mobile; max content width 1200px on the landing page.
- Minimum tap target 44px.
