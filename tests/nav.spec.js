const { test, expect, open } = require('./fixtures');

test('desktop: 5 grouped links + Enquire CTA, active page indicated', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/collections.html');
  await expect(page.locator('.nav-list > li')).toHaveCount(5);
  await expect(page.locator('.hdr__right .btn', { hasText: 'Enquire' })).toBeVisible();
  await expect(page.locator('.nav-link[aria-current=page]')).toHaveText('Collections');
  await open(page, '/manufacture.html');
  await expect(page.locator('.nav-btn.is-current')).toHaveText(/Craft/);
});

test('desktop: dropdown opens with keyboard and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/index.html');
  const btn = page.locator('.nav-btn', { hasText: 'Craft' });
  await btn.focus(); await page.keyboard.press('Enter');
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('link', { name: 'Movement Engine' }).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
});

test('mobile: hamburger opens a full-screen menu, traps focus, Escape closes, links work', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await open(page, '/index.html');
  await expect(page.locator('.hdr__nav')).toBeHidden();
  const burger = page.locator('.burger');
  await burger.click();
  await expect(burger).toHaveAttribute('aria-expanded', 'true');
  const menu = page.locator('#menu');
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox(); expect(box.width).toBeGreaterThanOrEqual(370); expect(box.height).toBeGreaterThanOrEqual(800);
  expect(await page.evaluate(() => document.querySelector('#main').hasAttribute('inert'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(burger).toHaveAttribute('aria-expanded', 'false');
  await burger.click();
  await menu.getByRole('link', { name: 'Journal' }).click();
  await page.waitForURL('**/journal.html');
});

test('header hides on scroll down and returns on scroll up', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/collections.html');
  await page.mouse.wheel(0, 900); await page.waitForTimeout(1200);
  await expect(page.locator('.hdr')).toHaveClass(/is-hidden/);
  await page.mouse.wheel(0, -500); await page.waitForTimeout(1200);
  await expect(page.locator('.hdr')).not.toHaveClass(/is-hidden/);
});

test('page transition: internal link wipes then navigates', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/index.html');
  await page.locator('.nav-link', { hasText: 'Configurator' }).click();
  await page.waitForURL('**/configurator.html', { timeout: 8000 });
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await page.waitForFunction(() => !document.documentElement.classList.contains('pt-in'), null, { timeout: 8000 });
});
