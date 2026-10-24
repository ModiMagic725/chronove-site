const { test, expect, PAGES, open } = require('./fixtures');
for (const w of [320, 375, 768, 1440]) {
  test(`no horizontal overflow at ${w}px on all pages`, async ({ page }) => {
    test.setTimeout(300000);
    await page.setViewportSize({ width: w, height: 900 });
    const bad = [];
    for (const slug of PAGES) {
      if (slug === 'movement-engine') await page.emulateMedia({ reducedMotion: 'reduce' }); else await page.emulateMedia({ reducedMotion: 'no-preference' });
      const url = slug === 'watch' ? '/watch.html?m=lattice' : slug === 'article' ? '/article.html?a=sapphire-explained' : `/${slug}.html`;
      await open(page, url);
      await page.waitForTimeout(500);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (over > 0) bad.push(`${slug}: +${over}px`);
    }
    expect(bad).toEqual([]);
  });
}
test('every image has width/height (no layout shift) and alt attribute', async ({ page }) => {
  for (const slug of ['index', 'collections', 'watch']) {
    await open(page, `/${slug}.html`);
    const bad = await page.$$eval('img', (imgs) => imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height') || i.getAttribute('alt') === null).map((i) => i.outerHTML.slice(0, 90)));
    expect(bad, slug).toEqual([]);
  }
});
test('below-the-fold images are lazy', async ({ page }) => {
  await open(page, '/collections.html');
  const lazy = await page.$$eval('#cards img', (imgs) => imgs.filter((i) => i.loading === 'lazy').length);
  expect(lazy).toBeGreaterThanOrEqual(5);   // first four cards are eager (LCP), the rest lazy
});
