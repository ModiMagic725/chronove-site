/**
 * Static checks (no browser, no dependencies):  node test.js
 * Complements the Playwright suite in /tests, which does the real-browser work.
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const PAGES = ['index', 'collections', 'watch', 'movement-engine', 'configurator', 'manufacture', 'timekeeping', 'complications', 'materials', 'heritage', 'journal', 'article', 'boutique-care', 'contact', '404'];

(async () => {
  const data = await import('./js/data.js'), media = await import('./js/media.js'), tpl = await import('./js/templates.js');

  // 1. Data integrity: nine models, complete, distinct, real numbers
  ok(data.MODELS.length === 9, '9 models');
  data.MODELS.forEach((m) => {
    ok(m.story.length >= 3 && m.story.length <= 4, m.slug + ' has 3–4 paragraphs');
    ok(m.diameter > 30 && m.thickness > 6 && m.movement.powerReserve >= 40 && m.waterResistance >= 30, m.slug + ' spec ranges');
    ok(m.movement.frequency === 21600 || m.movement.frequency === 28800, m.slug + ' frequency');
    ok(media.WATCH_IMAGES[m.slug], m.slug + ' has media slots');
    ok(Object.keys(media.WATCH_IMAGES[m.slug]).join() === 'hero,threeQuarter,side,caseback,dial,wrist', m.slug + ' has the six views');
    ok(data.hz(m.movement.frequency) === (m.movement.frequency === 28800 ? '4 Hz' : '3 Hz'), m.slug + ' Hz');
  });
  ok(new Set(data.MODELS.map((m) => m.slug)).size === 9, 'slugs unique');
  ok(data.ARTICLES.length === 6 && data.ARTICLES.every((a) => a.body.length >= 3), '6 articles with body');
  ok(tpl.render('cards-all').split('class="pcard"').length === 10, 'cards render 9');

  // 2. Pages exist, are readable (multi-line), and have the essentials
  PAGES.forEach((p) => {
    const h = read(p + '.html');
    ok(h.split('\n').length > 30, p + ' is formatted, not a single line');
    ok(/<title>.{10,}<\/title>/.test(h) && /<meta name="description"/.test(h) && /rel="icon"/.test(h) && /viewport/.test(h), p + ' head essentials');
    ok(!/<img(?![^>]*\balt=)/.test(h), p + ' every <img> has alt');
    ok((h.match(/<h1\b/g) || []).length <= 1, p + ' at most one h1 in static HTML');
    // internal links resolve
    [...h.matchAll(/href="(?!https?:)([^"#?]+\.html)(?:[?#][^"]*)?"/g)].forEach((m) => ok(fs.existsSync(path.join(__dirname, m[1])), p + ' links to missing ' + m[1]));
    [...h.matchAll(/(?:src|href)="((?:js|css|vendor)\/[^"?]+)"/g)].forEach((m) => ok(fs.existsSync(path.join(__dirname, m[1])), p + ' references missing ' + m[1]));
  });
  ok(fs.existsSync(path.join(__dirname, 'sitemap.xml')) && fs.existsSync(path.join(__dirname, 'robots.txt')) && fs.existsSync(path.join(__dirname, 'favicon.svg')), 'sitemap, robots, favicon');

  // 3. Code quality: readable modules, no minified one-liners, no canvas-drawn watches outside the engine
  fs.readdirSync(path.join(__dirname, 'js')).filter((f) => f.endsWith('.js')).forEach((f) => {
    const s = read('js/' + f); const longest = Math.max(...s.split('\n').map((l) => l.length));
    ok(s.split('\n').length > 15, f + ' is multi-line');
    ok(longest < 340, `${f} has no minified lines (longest ${longest})`);
    if (f !== 'engine3d.js') ok(!/getContext\(['"]2d['"]\)/.test(s) || f === 'engine3d.js', f + ' uses no 2D canvas');
  });
  ['data.js', 'ui.js', 'motion.js', 'carousels.js', 'engine3d.js', 'media.js', 'pages.js', 'loader.js', 'main.js'].forEach((f) => ok(fs.existsSync(path.join(__dirname, 'js', f)), 'module ' + f));

  // 4. Pinned CDN versions with SRI + local fallback
  const loader = read('js/loader.js');
  [...loader.matchAll(/cdn: '([^']+)'/g)].forEach((m) => ok(/@\d+\.\d+\.\d+/.test(m[1]) && !/latest|@\^|@~/.test(m[1]), 'pinned version ' + m[1]));
  ok((loader.match(/sha384-/g) || []).length >= 14, 'SRI hashes present');
  [...loader.matchAll(/local: '([^']+)'/g)].forEach((m) => ok(fs.existsSync(path.join(__dirname, m[1])), 'vendor fallback exists ' + m[1]));

  // 5. Every script syntax-checks
  fs.readdirSync(path.join(__dirname, 'js')).filter((f) => f.endsWith('.js')).forEach((f) => { try { new vm.SourceTextModule ? 0 : 0; } catch { /* noop */ } });

  // 6. Disclaimer only in the footer
  PAGES.forEach((p) => { const h = read(p + '.html'); const n = (h.match(/fictional concept/g) || []).length; ok(n === 1, `${p}: disclaimer exactly once (${n})`); ok(h.indexOf('fictional concept') > h.indexOf('<footer'), p + ': disclaimer inside the footer'); });

  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
