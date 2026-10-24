const { test, expect, open } = require('./fixtures');

test('motion on: Lenis runs, story is pinned, horizontal strip is pinned on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/index.html');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  expect(await page.locator('.pin-spacer').count()).toBeGreaterThanOrEqual(2);
  expect(await page.evaluate(() => window.ScrollTrigger.getAll().length)).toBeGreaterThan(10);
  await expect(page.locator('html')).not.toHaveClass(/motion-pending/);
});

test('hero headline is split into lines/words and ends visible', async ({ page }) => {
  await open(page, '/index.html'); await page.waitForTimeout(3500);
  expect(await page.locator('[data-hero-title] .word').count()).toBeGreaterThan(2);
  const y = await page.evaluate(() => getComputedStyle(document.querySelector('[data-hero-title] .word')).transform);
  expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(y);
  await expect(page.locator('[data-hero-cta]')).toBeVisible();
});

test('preloader shows only on first visit of a session', async ({ browser }) => {
  const ctx = await browser.newContext(); const p = await ctx.newPage();
  if (process.env.CDN_MODE) await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await p.goto('http://127.0.0.1:4173/index.html');
  const first = await p.evaluate(() => document.documentElement.classList.contains('has-pre'));
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout: 20000 });
  await p.reload();
  const second = await p.evaluate(() => document.documentElement.classList.contains('has-pre'));
  expect([first, second]).toEqual([true, false]); await ctx.close();
});

test('counters count up to their target', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/index.html');
  await page.locator('[data-count="28800"]').scrollIntoViewIfNeeded(); await page.waitForTimeout(3000);
  await expect(page.locator('[data-count="28800"]')).toHaveText('28,800');
});

test('reduced motion: no Lenis, no pins, no cursor, no split/hidden states, content visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/index.html');
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await expect(page.locator('html')).not.toHaveClass(/motion-pending|has-pre|has-cursor/);
  expect(await page.locator('.pin-spacer').count()).toBe(0);
  await expect(page.locator('.hscroll')).toHaveClass(/is-native/);
  await expect(page.locator('[data-story]')).toHaveClass(/no-pin/);
  await expect(page.locator('[data-hero-title]')).toBeVisible();
  await expect(page.locator('[data-count="28800"]')).toHaveText('28,800');
  expect(await page.evaluate(() => window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0)).toBe(0);
});

test('mobile: horizontal strip falls back to a native snap scroller', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await open(page, '/index.html');
  await expect(page.locator('.hscroll')).toHaveClass(/is-native/);
});

test('hero video: poster, muted, playsinline, preload=metadata, aria-hidden, pause control (when URLs are configured)', async ({ page }) => {
  await open(page, '/index.html');
  // Inspected synchronously, before the (deliberately missing) files 404 and the player removes itself.
  const got = await page.evaluate(async () => {
    const media = await import('/js/media.js'); const motion = await import('/js/motion.js');
    Object.assign(media.VIDEO.hero, { webm: '/none.webm', mp4: '/none.mp4', mp4Mobile: '/none-m.mp4' });
    motion.initVideos();
    const e = document.querySelector('[data-hero] video');
    return e && { muted: e.muted, inline: e.playsInline, pre: e.preload, loop: e.loop, hidden: e.getAttribute('aria-hidden'), poster: !!e.poster, sources: [...e.querySelectorAll('source')].map((s) => s.type), pause: !!document.querySelector('[data-hero] .car-pause') };
  });
  expect(got).toEqual({ muted: true, inline: true, pre: 'metadata', loop: true, hidden: 'true', poster: true, sources: ['video/webm', 'video/mp4'], pause: true });
});

test('hero video is NOT created for reduced-motion visitors (poster only)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '/index.html');
  await page.evaluate(async () => { const media = await import('/js/media.js'); const motion = await import('/js/motion.js'); media.VIDEO.hero.mp4 = 'http://127.0.0.1:4173/none.mp4'; motion.initVideos(); });
  await expect(page.locator('[data-hero] video')).toHaveCount(0);
  await expect(page.locator('[data-hero] img')).toHaveCount(1);
});
