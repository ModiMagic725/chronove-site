/**
 * Shared test fixture. Collects console/page errors per page and (optionally) serves CDN URLs locally.
 *   CDN_MODE=local    → jsDelivr URLs are answered from node_modules (identical npm files)
 *   CDN_MODE=offline  → every third-party request fails (tests the vendor/ fallback)
 *   (unset)           → real network
 */
const base = require('@playwright/test');
const fs = require('fs'), path = require('path');
const NM = path.join(__dirname, '..', 'node_modules');

function cdnFile(u) {
  const m = u.match(/^https:\/\/cdn\.jsdelivr\.net\/npm\/((?:@[^/]+\/)?[^@/]+)@[^/]+\/(.+)$/);
  return m ? path.join(NM, m[1], m[2]) : null;
}
const IGNORED = /ERR_BLOCKED_BY_CLIENT|ERR_INTERNET_DISCONNECTED|ERR_NAME_NOT_RESOLVED|ERR_FAILED|fonts\.g|Failed to load resource: net::ERR/;

exports.test = base.test.extend({
  context: async ({ context }, use) => {
    const mode = process.env.CDN_MODE;
    if (mode) {
      await context.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) => {
        const f = mode === 'local' ? cdnFile(route.request().url()) : null;
        if (f && fs.existsSync(f)) return route.fulfill({ status: 200, contentType: f.endsWith('.css') ? 'text/css' : 'text/javascript', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(f) });
        return route.abort('blockedbyclient');
      });
    }
    await use(context);
  },
  /** page with `errors` array of real console errors / uncaught exceptions */
  tracked: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !IGNORED.test(m.text())) errors.push('console: ' + m.text()); });
    page.errors = errors;
    await use(page);
  },
});
exports.expect = base.expect;
exports.PAGES = ['index', 'collections', 'watch', 'movement-engine', 'configurator', 'manufacture', 'timekeeping', 'complications', 'materials', 'heritage', 'journal', 'article', 'boutique-care', 'contact', '404'];
/** Navigate and wait until main.js reports ready. */
exports.open = async (page, url) => {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout: 20000 });
};
