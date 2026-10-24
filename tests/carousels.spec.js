const { test, expect, open } = require('./fixtures');

test('home: Swiper coverflow initialises with progress bar, keyboard + a11y, autoplay, pause button', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/index.html');
  const info = await page.evaluate(() => { const s = document.querySelector('#featured').swiper; return { effect: s.params.effect, kb: s.params.keyboard.enabled, a11y: s.params.a11y.enabled, auto: !!s.params.autoplay, pag: s.params.pagination.type, slides: s.slides.length }; });
  expect(info).toEqual({ effect: 'coverflow', kb: true, a11y: true, auto: true, pag: 'progressbar', slides: 9 });
  await page.locator('#featured').scrollIntoViewIfNeeded();
  const pause = page.locator('#feat-pause');
  await expect(pause).toBeVisible();
  await pause.click(); await expect(pause).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.querySelector('#featured').swiper.autoplay.running)).toBe(false);
});

test('home: Swiper moves with the keyboard and next button', async ({ page }) => {
  await open(page, '/index.html');
  const idx = () => page.evaluate(() => document.querySelector('#featured').swiper.activeIndex);
  await page.locator('#featured').scrollIntoViewIfNeeded();
  await expect(page.locator('#feat-pause')).toBeVisible();
  await page.locator('#feat-pause').click();
  const a = await idx(); await page.locator('#feat-next').click(); await page.waitForTimeout(900);
  expect(await idx()).toBe(a + 1);
});

test('home: Splide strap strip initialises with free drag + snap', async ({ page }) => {
  await open(page, '/index.html');
  await page.locator('#straps').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#straps').classList.contains('is-initialized'), null, { timeout: 15000 });
  const o = await page.evaluate(() => { const s = document.querySelector('#straps'); return { init: s.classList.contains('is-initialized'), drag: s.splide?.options.drag, snap: s.splide?.options.snap, n: s.querySelectorAll('.splide__slide').length }; });
  expect(o).toEqual({ init: true, drag: 'free', snap: true, n: 6 });
});

test('journal: Owl Carousel initialises (jQuery 3) with labelled controls and keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/journal.html');
  await expect(page.locator('#voices')).toHaveClass(/owl-loaded/);
  expect(await page.evaluate(() => window.jQuery.fn.jquery)).toMatch(/^3\./);
  await expect(page.locator('#voices .owl-next')).toHaveAttribute('aria-label', 'Next voice');
  const before = await page.locator('#voices .owl-item.active').first().textContent();
  await page.locator('#voices').focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1000);
  expect(await page.locator('#voices .owl-item.active').first().textContent()).not.toBe(before);
});

test('watch: main + thumbs Swiper stay in sync; lightbox opens with Zoom and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/watch.html?m=aperture');
  await expect(page.locator('.gallery .main .swiper-slide')).toHaveCount(6);
  await page.locator('.gallery .thumbs .swiper-slide').nth(3).click(); await page.waitForTimeout(900);
  expect(await page.evaluate(() => document.querySelector('.gallery .main').swiper.activeIndex)).toBe(3);
  await expect(page.locator('.gallery .thumbs .swiper-slide-thumb-active')).toHaveCount(1);
  await page.locator('.gallery .main .swiper-slide-active .zoomable').click();
  await expect(page.locator('.lb.is-open')).toBeVisible();
  expect(await page.evaluate(() => document.querySelector('.lb .swiper').swiper.params.zoom.maxRatio)).toBe(4);
  await expect(page.locator('.lb .swiper-zoom-container')).toHaveCount(6);
  await page.keyboard.press('Escape'); await expect(page.locator('.lb.is-open')).toHaveCount(0);
});

test('reduced motion: autoplay is off and pause buttons are hidden', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '/index.html');
  await page.locator('#featured').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#featured').swiper, null, { timeout: 15000 });
  expect(await page.evaluate(() => !!document.querySelector('#featured').swiper.autoplay?.running)).toBe(false);
  await expect(page.locator('#feat-pause')).toBeHidden();
});
