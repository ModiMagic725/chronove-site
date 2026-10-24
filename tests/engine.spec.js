const { test, expect, open } = require('./fixtures');
// Software GL compiles the PBR shaders on the main thread, so give it room and run these one at a time.
test.describe.configure({ mode: 'serial', timeout: 180000 });

test('engine: WebGL scene renders non-empty pixels, layers can be picked and exploded', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1100, height: 800 });
  await open(page, '/movement-engine.html');
  await page.waitForFunction(() => window.__engine, null, { timeout: 90000 });
  await page.locator('#engine-stage').scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
  const stats = await page.evaluate(() => window.__engine.stats);
  expect(stats.calls).toBeGreaterThan(50); expect(stats.triangles).toBeGreaterThan(50000);
  const painted = await page.evaluate(() => window.__engine.sampleLit());
  expect(painted, 'canvas should contain lit pixels').toBeGreaterThan(300);
  await page.getByRole('button', { name: 'Bridge' }).click();
  await expect(page.locator('#info h3')).toHaveText('Bridge');
  await expect(page.locator('#ex')).toHaveValue('100');
  await page.locator('#reset').click(); await expect(page.locator('#ex')).toHaveValue('0');
});

test('engine: text fallback when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a); }; });
  await open(page, '/movement-engine.html');
  await expect(page.getByText('needs WebGL')).toBeVisible();
  await page.getByRole('button', { name: 'Dial' }).click();
  await expect(page.locator('#info h3')).toHaveText('Dial');
});

test('engine uses PBR: physical materials, environment map, shadow map enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '/movement-engine.html');
  await page.waitForFunction(() => window.__engine);
  const src = await page.evaluate(async () => (await fetch('/js/engine3d.js')).text());
  for (const k of ['MeshPhysicalMaterial', 'PMREMGenerator', 'scene.environment', 'transmission', 'PCFSoftShadowMap', 'LatheGeometry', 'roughnessMap', 'ACESFilmicToneMapping']) expect(src, k).toContain(k);
});
