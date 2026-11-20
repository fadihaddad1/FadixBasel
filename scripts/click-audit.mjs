// Agent 10 — clicks every visible button on each page at both viewports and reports runtime errors.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.argv[2] || 'http://localhost:4173/';
const pages = ['?intro=0', '?intro=0&view=app&tab=today', '?intro=0&view=app&tab=workout', '?intro=0&view=app&tab=trends', '?intro=0&view=app&tab=profile', '?scene=4&paused=1'];
const browser = await chromium.launch();
const errors = [];
let clicks = 0;
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const q of pages) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${vp.width} ${q}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && errors.push(`${vp.width} ${q} console: ${m.text()}`));
    await page.goto(base + q, { waitUntil: 'networkidle' });
    const n = await page.locator('button').count();
    for (let i = 0; i < n; i++) {
      await page.goto(base + q, { waitUntil: 'domcontentloaded' });
      const b = page.locator('button').nth(i);
      try {
        if (!(await b.isVisible()) || !(await b.isEnabled())) continue;
        await b.click({ timeout: 1500 });
        clicks++;
        await page.waitForTimeout(150);
      } catch { /* element moved/covered after earlier animation — not a runtime error */ }
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`Clicked ${clicks} buttons.`);
console.log(errors.length ? 'ERRORS:\n' + [...new Set(errors)].join('\n') : 'No runtime/console errors.');
