// Agent 09 — Playwright visual QA. Usage: node scripts/screenshots.mjs <phase> [baseUrl]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { mkdirSync } from 'node:fs';

const phase = process.argv[2] || 'phase1';
const base = process.argv[3] || 'http://localhost:4173/';
const out = new URL(`../docs/progress-screenshots/${phase}/`, import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const SHOTS = {
  phase1: [
    ['intro-scene1', '?scene=1&paused=1', 1200],
    ['intro-scene2', '?scene=2&paused=1', 2500],
    ['intro-scene3', '?scene=3&paused=1', 2500],
    ['intro-scene4', '?scene=4&paused=1', 3500],
    ['landing', '?intro=0', 1500],
  ],
  phase2: [
    ['app-today', '?intro=0&view=app&tab=today', 1500],
    ['app-workout', '?intro=0&view=app&tab=workout', 1500],
  ],
  phase3: [
    ['app-trends', '?intro=0&view=app&tab=trends', 2000],
    ['app-profile', '?intro=0&view=app&tab=profile', 1200],
  ],
};

const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const browser = await chromium.launch();
const errors = [];
for (const [vpName, vp] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${vpName}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${vpName} console: ${m.text()}`));
  for (const [name, q, wait] of SHOTS[phase] || []) {
    await page.goto(base + q, { waitUntil: 'networkidle' });
    await page.waitForTimeout(wait);
    await page.screenshot({ path: `${out}${name}-${vpName}.png` });
    if (name === 'landing') await page.screenshot({ path: `${out}${name}-full-${vpName}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) errors.push(`${vpName} ${name}: horizontal overflow ${overflow}px`);
  }
  // Interactive overlays (phase 3)
  if (phase === 'phase3') {
    await page.goto(base + '?intro=0&view=app&tab=today', { waitUntil: 'networkidle' });
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /slept 5 hours/i.test(b.textContent || ''))?.click());
    await page.waitForTimeout(4500);
    await page.screenshot({ path: `${out}coach-drawer-${vpName}.png` });
    await page.goto(base + '?intro=0', { waitUntil: 'networkidle' });
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /free trial/i.test(b.textContent || ''))?.click());
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${out}trial-modal-${vpName}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log(errors.length ? 'ISSUES:\n' + errors.join('\n') : 'No errors / overflow detected');
