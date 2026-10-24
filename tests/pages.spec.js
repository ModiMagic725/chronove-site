const { test, expect, PAGES, open } = require('./fixtures');

for (const slug of PAGES) {
  test(`${slug}: loads with no console errors, has one h1, title, description`, async ({ tracked: page }) => {
    if (slug === 'movement-engine') test.setTimeout(180000);
    // Engine renders on demand under reduced motion; software GL cannot animate it in CI.
    if (slug === 'movement-engine') await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, `/${slug}.html`);
    await page.waitForTimeout(800);
    expect(page.errors, page.errors.join('\n')).toEqual([]);
    await expect(page.locator('h1')).toHaveCount(1);
    expect((await page.title()).length).toBeGreaterThan(10);
    if (slug !== '404') expect(await page.locator('meta[name=description]').getAttribute('content')).toBeTruthy();
    await expect(page.locator('link[rel=icon]')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
  });
}

test('pages have canonical + Open Graph tags (except 404)', async ({ page }) => {
  for (const slug of PAGES.filter((p) => p !== '404')) {
    await page.goto(`/${slug}.html`);
    for (const sel of ['link[rel=canonical]', 'meta[property="og:title"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]']) {
      await expect(page.locator(sel), `${slug} ${sel}`).toHaveCount(1);
    }
  }
});

test('sitemap.xml and robots.txt are served', async ({ request }) => {
  const s = await request.get('/sitemap.xml'); expect(s.status()).toBe(200); expect(await s.text()).toContain('<urlset');
  const r = await request.get('/robots.txt'); expect(r.status()).toBe(200); expect(await r.text()).toContain('Sitemap:');
});

test('unknown watch and article ids show a helpful state, not a blank page', async ({ page }) => {
  await open(page, '/watch.html?m=nope'); await expect(page.getByText('could not find that watch')).toBeVisible();
  await open(page, '/article.html?a=nope'); await expect(page.getByText('Essay not found')).toBeVisible();
});

test('disclaimer appears exactly once, in the footer', async ({ page }) => {
  for (const slug of ['index', 'collections', 'watch', 'contact']) {
    await page.goto(`/${slug}.html`);
    expect(await page.getByText('fictional concept', { exact: false }).count(), slug).toBe(1);
    await expect(page.locator('footer').getByText('fictional concept')).toHaveCount(1);
  }
});
