const { test, expect, PAGES, open } = require('./fixtures');
const AxeBuilder = require('@axe-core/playwright').default;

for (const [w, label] of [[1440, 'desktop'], [375, 'mobile']]) {
  test(`axe (WCAG 2.1 A/AA + best-practice) has no violations on every page — ${label}`, async ({ page }) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width: w, height: 900 });
    const report = [];
    for (const slug of PAGES) {
      await page.emulateMedia({ reducedMotion: 'reduce' });      // deterministic: no mid-animation colours
      const url = slug === 'watch' ? '/watch.html?m=equinox' : slug === 'article' ? '/article.html?a=balance-wheel' : `/${slug}.html`;
      await open(page, url); await page.waitForTimeout(400);
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
      res.violations.forEach((v) => report.push(`${slug}: [${v.impact}] ${v.id} ×${v.nodes.length} — ${v.nodes[0].target.join(' ')} — ${v.help}`));
    }
    expect(report, report.join('\n')).toEqual([]);
  });
}

test('offline: if every CDN fails, the vendor/ copies load and the page still works', async ({ browser }) => {
  const ctx = await browser.newContext(); await ctx.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://127.0.0.1:4173/index.html');
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout: 40000 });
  const libs = await p.evaluate(() => window.CV_LIBS);
  expect(Object.values(libs).every((v) => v === 'local'), JSON.stringify(libs)).toBe(true);
  expect(await p.evaluate(() => !!document.querySelector('#featured').swiper && typeof gsap)).toBe('object');
  expect(errs).toEqual([]); await ctx.close();
});
