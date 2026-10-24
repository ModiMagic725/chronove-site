const { test, expect, open } = require('./fixtures');

test('collections: filter, sort, favourite persists, compare table', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/collections.html');
  await expect(page.locator('#cards .pcard')).toHaveCount(9);
  await page.getByRole('button', { name: 'Sport', exact: true }).click();
  await expect(page.locator('#cards .pcard')).toHaveCount(2);
  await expect(page.locator('#result-count')).toContainText('2 watches in Sport');
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.selectOption('#sort', 'pd');
  await expect(page.locator('#cards .pcard').first()).toContainText('Solstice');
  const fav = page.locator('[data-fav="meridian"]'); await fav.click(); await expect(fav).toHaveAttribute('aria-pressed', 'true');
  await page.reload(); await open(page, '/collections.html'); await expect(page.locator('[data-fav="meridian"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-cmp="meridian"]').click(); await page.locator('[data-cmp="aperture"]').click();
  await expect(page.locator('#cmp-body table.spec')).toBeVisible();
  expect(await page.locator('#cmp-body thead th').count()).toBe(3);
  await expect(page.locator('#cmp-body')).toContainText('28,800 vph (4 Hz)');
  await expect(page.locator('#cmp-body')).toContainText('21,600 vph (3 Hz)');
});

test('collections: ?c= deep link applies the filter', async ({ page }) => {
  await open(page, '/collections.html?c=Skeleton');
  await expect(page.locator('#cards .pcard')).toHaveCount(2);
});

test('watch page: real per-model data (not formulas), sticky enquire bar, metadata', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/watch.html?m=solstice');
  await expect(page.locator('h1')).toHaveText('Solstice');
  await expect(page.locator('.spec')).toContainText('8.4 mm'); await expect(page.locator('.spec')).toContainText('38.5 mm'); await expect(page.locator('.spec')).toContainText('Limited to 99');
  await expect(page).toHaveTitle(/Solstice/);
  expect(await page.locator('meta[name=description]').getAttribute('content')).toContain('€18,900');
  await expect(page.locator('#enq-bar')).not.toHaveClass(/is-on/);
  await page.mouse.wheel(0, 1600); await page.waitForTimeout(1500);
  await expect(page.locator('#enq-bar')).toHaveClass(/is-on/);
  await open(page, '/watch.html?m=2'); await expect(page.locator('h1')).toHaveText('Tidal 300');
});

test('each of the 9 watches has distinct spec data', async ({ page }) => {
  await open(page, '/index.html');
  const rows = await page.evaluate(async () => { const d = await import('/js/data.js'); return d.MODELS.map((m) => [m.diameter, m.thickness, m.movement.powerReserve, m.waterResistance].join('/')); });
  expect(new Set(rows).size).toBe(9);
});

test('configurator: price updates and photo follows the chosen model', async ({ page }) => {
  await open(page, '/configurator.html?m=meridian');
  await expect(page.locator('#cfg-price')).toHaveText('€4,200');
  await page.getByRole('button', { name: /Steel bracelet/ }).click();
  await expect(page.locator('#cfg-price')).toHaveText('€5,100');
  await page.getByRole('button', { name: 'Perpetua', exact: true }).click();
  await expect(page.locator('#cfg-price')).toHaveText('€16,300');
  await expect(page.locator('#cfg-photo img').first()).toHaveAttribute('data-slot', 'perpetua.hero');
});

test('contact form validates and then confirms', async ({ page }) => {
  await open(page, '/contact.html?w=regatta');
  await expect(page.locator('#c-msg')).toHaveValue(/Regatta/);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('main form .status')).toContainText('Name is required');
  await expect(page.locator('#c-name')).toHaveAttribute('aria-invalid', 'true');
  await page.fill('#c-name', 'Ada'); await page.fill('#c-email', 'bad'); await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('main form .status')).toContainText('name@example.com');
  await page.fill('#c-email', 'ada@example.com'); await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('main form .status')).toContainText('demonstration');
});

test('timekeeping: 28,800 vph reads as 4 Hz and 8 beats a second; gear calculator is correct', async ({ page }) => {
  await open(page, '/timekeeping.html');
  await expect(page.locator('#bph-out')).toHaveText('28,800 beats per hour = 4 Hz = 8 beats per second');
  await expect(page.locator('#gear-out')).toContainText('6.00×');
});

test('complications: leap year, moon phase and stopwatch work', async ({ page }) => {
  await open(page, '/complications.html');
  await expect(page.locator('#ct')).toContainText('is a leap year');
  await page.fill('#cd', '2027-03-01'); await page.locator('#cd').dispatchEvent('change');
  await expect(page.locator('#ct')).toContainText('is not a leap year');
  await page.locator('#md').fill('15'); await expect(page.locator('#mt')).toContainText('Full moon');
  await page.click('#cgo'); await page.waitForTimeout(600); await page.click('#cgo');
  expect(await page.locator('#cs').textContent()).not.toBe('00:00.00');
});

test('media: empty slots render labelled placeholders; a broken URL falls back to the placeholder', async ({ page }) => {
  await open(page, '/collections.html');
  expect(await page.locator('#cards img[data-placeholder="1"]').count()).toBeGreaterThanOrEqual(9);   // one labelled placeholder per card (hover-angle image is only rendered when a URL exists)
  await page.evaluate(async () => {
    const { WATCH_IMAGES } = await import('/js/media.js'); const { RENDER } = await import('/js/templates.js');
    WATCH_IMAGES.meridian.hero = 'http://127.0.0.1:4173/definitely-missing.jpg';
    document.querySelector('#cards').innerHTML = RENDER['cards-all']();
  });
  await page.waitForFunction(() => document.querySelector('[data-slot="meridian.hero"]')?.dataset.failed === '1');
  expect(await page.locator('[data-slot="meridian.hero"]').first().getAttribute('src')).toContain('data:image/svg+xml');
});

test('media: Unsplash-style URLs get AVIF + WebP sources, srcset and a JPEG fallback', async ({ page }) => {
  await open(page, '/collections.html');
  const html = await page.evaluate(async () => { const m = await import('/js/media.js'); return m.picture({ key: 'x.y', alt: 'a' }) && (m.WATCH_IMAGES.meridian.hero = 'https://images.unsplash.com/photo-EXAMPLE?ixlib=rb-4.0', m.picture({ key: 'meridian.hero', alt: 'Meridian' })); });
  expect(html).toContain('type="image/avif"'); expect(html).toContain('type="image/webp"'); expect(html).toContain('srcset='); expect(html).toContain('fm=jpg'); expect(html).toContain('loading="lazy"');
});

test('media.js edits take effect without rebuilding (hot refresh of pre-built blocks)', async ({ page }) => {
  await open(page, '/collections.html');
  const same = await page.evaluate(async () => { const m = await import('/js/media.js'); return document.body.dataset.media === m.mediaHash(); });
  expect(same).toBe(true);   // baked hash matches → no re-render needed
});
