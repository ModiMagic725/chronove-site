// Run:  npm i && npx playwright install chromium && npm run test:e2e
// CDN_MODE=local serves the pinned CDN URLs from node_modules (for offline / sandboxed machines).
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4173', launchOptions: { args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] } },
  webServer: { command: 'node tools/serve.js 4173', url: 'http://127.0.0.1:4173/index.html', reuseExistingServer: true },
});
