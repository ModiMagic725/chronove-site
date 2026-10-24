/**
 * Lighthouse (mobile preset, simulated throttling) on the home page and a watch page.
 *   npm run lighthouse            → uses the Chromium that Playwright installed
 * Prints category scores and exits 1 if any of performance / accessibility / SEO is below 90.
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from '@playwright/test';
import http from 'node:http';
import { spawn } from 'node:child_process';

const PORT = 4174;
const server = spawn('node', ['tools/serve.js', String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
const urls = [`http://localhost:${PORT}/index.html`, `http://localhost:${PORT}/watch.html?m=equinox`];
let failed = false;
for (const url of urls) {
  const { lhr } = await lighthouse(url, { port: chrome.port, output: 'json', onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'] });
  const s = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
  const m = lhr.audits;
  console.log(url, s, `LCP ${m['largest-contentful-paint'].displayValue}, TBT ${m['total-blocking-time'].displayValue}, CLS ${m['cumulative-layout-shift'].displayValue}`);
  if (s.performance < 90 || s.accessibility < 90 || s.seo < 90) failed = true;
}
await chrome.kill(); server.kill();
process.exit(failed ? 1 : 0);
