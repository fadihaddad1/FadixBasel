# DayGauge

**Know When to Push. Know When to Recover. No Smartwatch Required.**
*Founded by Fadi Haddad.*

DayGauge turns a 10-second morning check-in (sleep, soreness, energy, stress) into a personal **Daily Charge** score (0–100%). It then adjusts today's workout to match, while a **Burnout Shield** watches how fast your training load is ramping.

This is a frontend-only clickable prototype: no backend, payments or live AI. Everything runs on local React state and mock data.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to dist/
```

Handy URL params:
- `?intro=0` skips the intro.
- `?view=app&tab=today|workout|trends|profile` opens a specific app screen.
- `?scene=1-4&paused=1` freezes the intro on a scene.

## Structure

| Path | What |
|---|---|
| `DESIGN_SYSTEM.md` | Brand, tokens, motion, voice |
| `src/utils/recoveryEngine.ts` | Daily Charge, Burnout Shield and workout auto-adjuster math (pure) |
| `src/state/AppState.tsx` | Shared app state |
| `src/features/intro` | 30-second voiced cinematic intro |
| `src/features/landing` | Landing page, pricing, Founder's Note |
| `src/features/app` | App shell, Today and Profile screens |
| `src/features/workout` | Smart workout auto-adjuster and effort logging |
| `src/features/trends` | Trends and Burnout Shield |
| `src/features/coach` | Simulated AI Pocket Coach |
| `src/features/trial` | 7-day free trial flow |
| `scripts/` | Playwright screenshots and click audit |
| `docs/progress-screenshots/` | Desktop 1440×900 and mobile 390×844 screenshots per phase |

Deployed to GitHub Pages by `.github/workflows/deploy.yml`.
