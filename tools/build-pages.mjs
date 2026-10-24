/**
 * Static page generator (dev tool, optional).
 *
 *   node tools/build-pages.mjs
 *
 * Reads page bodies from tools/pages/*.html, wraps them in the shared header / footer / head,
 * pre-renders product cards from js/data.js, and writes the 15 .html pages plus sitemap.xml
 * and robots.txt. The generated files are committed, so the deployed site has no build step.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { MODELS, ARTICLES, COLLECTIONS } from '../js/data.js';
import { ICON, render } from '../js/templates.js';
import { mediaHash } from '../js/media.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/** Replace with the real domain before launch. `.example` is a reserved TLD that never resolves. */
const SITE_URL = process.env.SITE_URL || 'https://chronove.example';
const DISCLAIMER = 'CHRONOVÉ is a fictional concept brand. Purchases, enquiries and service flows on this site are demonstrations only.';

/** Libraries each page needs (keys are defined in js/loader.js). */
const CORE = ['gsap', 'scrolltrigger', 'lenis', 'splittype', 'aos'];

/** slug → page definition */
const PAGES = [
  { slug: 'index', title: 'CHRONOVÉ — The architecture of time', desc: 'CHRONOVÉ is a concept watch maison. Explore nine watches, the five-layer Movement Engine and the workshop notes behind every second.', libs: [...CORE, 'swiper', 'splide'], nav: 'index' },
  { slug: 'collections', title: 'Collections — Nine watches in five families | CHRONOVÉ', desc: 'Browse the CHRONOVÉ collections: Classic, Sport, Skeleton, Complications and Limited Editions. Filter, sort and compare specifications side by side.', libs: CORE, nav: 'collections' },
  { slug: 'watch', title: 'Watch — CHRONOVÉ', desc: 'Specifications, photography and story for a CHRONOVÉ watch: case, calibre, power reserve, water resistance and straps.', libs: [...CORE, 'swiper'], nav: 'collections' },
  { slug: 'movement-engine', title: 'Movement Engine — An interactive 3D watch | CHRONOVÉ', desc: 'Drag, explode and inspect the five layers of a mechanical watch in real-time 3D: case, movement, bridge, dial and hands.', libs: [...CORE, 'three'], nav: 'craft' },
  { slug: 'configurator', title: 'Configurator — Choose your CHRONOVÉ', desc: 'Pick a model, strap, finish and engraving, see the price update live and send a demo enquiry to the maison.', libs: CORE, nav: 'configurator' },
  { slug: 'manufacture', title: 'Manufacture — Precision in five stages | CHRONOVÉ', desc: 'How a CHRONOVÉ would be made: component making, finishing, assembly, regulation and quality control, with macro film of the movement.', libs: CORE, nav: 'craft' },
  { slug: 'timekeeping', title: 'The Art of Timekeeping — Balance wheel and gear trains | CHRONOVÉ', desc: 'An animated explainer of the balance wheel, beat rates and gear ratios, with a calculator you can try.', libs: CORE, nav: 'craft' },
  { slug: 'complications', title: 'Complications — Chronograph, moon phase, calendar, GMT | CHRONOVÉ', desc: 'Interactive demonstrations of watch complications: a stopwatch, moon-phase calculator, second time zone and leap-year check.', libs: CORE, nav: 'craft' },
  { slug: 'materials', title: 'Materials Lab — Titanium, steel, ceramic, sapphire, gold | CHRONOVÉ', desc: 'Compare the metals and crystals used in CHRONOVÉ watches on hardness, lightness and shine.', libs: CORE, nav: 'craft' },
  { slug: 'heritage', title: 'Heritage — The maison timeline | CHRONOVÉ', desc: 'From a shared bench to a perpetual calendar: the invented history of the CHRONOVÉ maison, year by year.', libs: CORE, nav: 'maison' },
  { slug: 'journal', title: 'Journal — Workshop notes and collector voices | CHRONOVÉ', desc: 'Essays on horology, craftsmanship and design from the CHRONOVÉ bench, plus notes from collectors.', libs: [...CORE, 'jquery', 'owl'], nav: 'maison' },
  { slug: 'article', title: 'Journal article — CHRONOVÉ', desc: 'A CHRONOVÉ workshop essay on horology, engineering or design.', libs: CORE, nav: 'maison' },
  { slug: 'boutique-care', title: 'Boutiques and Care — Visit and service | CHRONOVÉ', desc: 'Find a CHRONOVÉ boutique in Geneva, Paris, London or Singapore, and read how servicing, warranty and care work.', libs: CORE, nav: 'boutique' },
  { slug: 'contact', title: 'Contact — Enquire about a CHRONOVÉ', desc: 'Send an enquiry to the CHRONOVÉ maison about a watch, press or care. This form is a demonstration and nothing is sent.', libs: CORE, nav: 'contact' },
  { slug: '404', title: 'Page not found — CHRONOVÉ', desc: 'This page could not be found. Return to the CHRONOVÉ collections or home page.', libs: CORE, nav: '', noindex: true },
];

/** Navigation: 5 grouped links + Enquire CTA. */
const NAV = [
  { key: 'collections', label: 'Collections', href: 'collections.html' },
  { key: 'configurator', label: 'Configurator', href: 'configurator.html' },
  { key: 'craft', label: 'Craft', children: [
    ['Movement Engine', 'movement-engine.html'], ['Manufacture', 'manufacture.html'], ['Materials Lab', 'materials.html'],
    ['The Art of Timekeeping', 'timekeeping.html'], ['Complications', 'complications.html'] ] },
  { key: 'maison', label: 'Maison', children: [['Heritage', 'heritage.html'], ['Journal', 'journal.html']] },
  { key: 'boutique', label: 'Boutique and Care', href: 'boutique-care.html' },
];
const pageOf = (href) => href.replace('.html', '');

function navDesktop(current, slug) {
  return NAV.map((n) => {
    if (n.href) return `<li><a class="nav-link" href="${n.href}"${n.key === current ? ' aria-current="page"' : ''}>${n.label}</a></li>`;
    const id = `nav-${n.key}`;
    const here = n.key === current;
    return `<li class="nav-group"><button class="nav-btn${here ? ' is-current' : ''}" type="button" aria-expanded="false" aria-controls="${id}">${n.label}${ICON.chevron}</button>
        <div class="nav-menu" id="${id}">${n.children.map(([l, h]) => `<a href="${h}"${pageOf(h) === slug ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</div></li>`;
  }).join('\n        ');
}

function menuMobile(slug) {
  const link = (l, h) => `<a href="${h}"${pageOf(h) === slug ? ' aria-current="page"' : ''}><span>${l}</span></a>`;
  const groups = [
    ['Watches', [['Collections', 'collections.html'], ['Configurator', 'configurator.html']]],
    ['Craft', NAV[2].children],
    ['Maison', [...NAV[3].children, ['Boutique and Care', 'boutique-care.html']]],
  ];
  return groups.map(([label, items]) => `<div class="menu__group"><p class="menu__label">${label}</p>${items.map(([l, h]) => link(l, h)).join('')}</div>`).join('\n      ');
}

function footer() {
  const col = (title, items) => `<div data-aos="fade-up"><h2>${title}</h2><ul>${items.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`;
  return `<footer class="ftr">
  <div class="wrap">
    <div class="ftr__grid">
      <div class="ftr__brand"><a class="logo" href="index.html">CHRONOVÉ</a><p class="small" style="margin-top:16px;max-width:34ch">Watches built around the idea that every second has a structure.</p></div>
      ${col('Collections', [['All watches', 'collections.html'], ...COLLECTIONS.map((c) => [c, `collections.html?c=${encodeURIComponent(c)}`]), ['Configurator', 'configurator.html']])}
      ${col('Craft', NAV[2].children)}
      ${col('Maison', [...NAV[3].children, ['Boutique and Care', 'boutique-care.html'], ['Contact', 'contact.html']])}
      <div class="ftr__news" data-aos="fade-up"><h2>Workshop notes, monthly</h2>
        <p class="small">One short email about what is on the bench. No spam, and nothing is stored here.</p>
        <form data-demo-form novalidate><label class="sr" for="nl-email">Email address</label><input id="nl-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required data-label="Email"><button class="btn btn--sm" type="submit">Subscribe</button><p class="status" role="status" aria-live="polite"></p></form>
      </div>
    </div>
    <div class="ftr__legal"><span>© ${new Date().getFullYear()} CHRONOVÉ. ${DISCLAIMER}</span><a href="#top" data-top>Back to top</a></div>
  </div>
</footer>`;
}

/** Placeholders usable inside page fragments: {{name}} (see RENDER in js/templates.js). */
const EXTRA = {
  'icon-l': () => ICON.arrowL,
  'icon-r': () => ICON.arrowR,
  'filters': () => ['All', ...COLLECTIONS].map((c, i) => `<button class="chip" type="button" data-filter="${c}" aria-pressed="${i === 0}">${c}</button>`).join(''),
};
const fill = (html) => html.replace(/\{\{([\w:-]+)\}\}/g, (_, k) => (EXTRA[k] ? EXTRA[k]() : render(k)));

function head(p) {
  const url = `${SITE_URL}/${p.slug === 'index' ? '' : p.slug + '.html'}`;
  const fonts = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&display=swap';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${p.title}</title>
<meta name="description" content="${p.desc}">
${p.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#101318">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CHRONOVÉ">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="CHRONOVÉ — The architecture of time">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<script>
/* Boot: runs before first paint. Marks JS availability and promises motion so reveal targets can start hidden. */
(function (d) {
  var h = d.documentElement, rm = false, seen = false;
  h.classList.add('js');
  try { rm = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (!rm) h.classList.add('motion-pending');
  try {
    if (sessionStorage.getItem('cv-nav') === '1') { h.classList.add('pt-in'); sessionStorage.removeItem('cv-nav'); }
    else if (!sessionStorage.getItem('cv-seen') && !rm) { h.classList.add('has-pre'); }
  } catch (e) {}
  setTimeout(function () { h.classList.remove('motion-pending', 'pt-in', 'has-pre'); }, 6000); /* failsafe if scripts never arrive */
})(document);
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="${fonts}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="${fonts}"></noscript>
<script>window.CV = { page: ${JSON.stringify(p.slug)}, libs: ${JSON.stringify(p.libs)} };</script>
<script src="js/loader.js" defer></script>
${p.slug === 'index' ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'CHRONOVÉ', url: SITE_URL, description: 'Concept watch maison (fictional).' })}</script>` : ''}
</head>`;
}

function page(p) {
  const frag = fill(readFileSync(join(ROOT, 'tools/pages', p.slug + '.html'), 'utf8'));
  const html = `${head(p)}
<body data-page="${p.slug}" data-media="${mediaHash()}">
<a class="skip" href="#main">Skip to content</a>
<div class="pre" aria-hidden="true"><span class="pre__mark">CHRONOVÉ</span><span class="pre__bar"><i></i></span></div>
<div class="pt" aria-hidden="true"></div>

<header class="hdr" id="top" data-hdr>
  <div class="wrap hdr__in">
    <a class="logo" href="index.html" aria-label="CHRONOVÉ home">CHRONOVÉ</a>
    <nav class="hdr__nav" aria-label="Primary">
      <ul class="nav-list">
        ${navDesktop(p.nav, p.slug)}
      </ul>
    </nav>
    <div class="hdr__right">
      <a class="btn btn--sm magnetic" href="contact.html"${p.slug === 'contact' ? ' aria-current="page"' : ''}>Enquire</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><i></i><i></i></button>
    </div>
  </div>
  <div class="hdr__progress" aria-hidden="true"></div>
</header>
<nav class="menu" id="menu" aria-label="Mobile">
      ${menuMobile(p.slug)}
      <div class="menu__cta"><a class="btn btn--solid" href="contact.html">Enquire</a></div>
</nav>

<main id="main">
${frag}
</main>

${footer()}
<div class="cursor" aria-hidden="true"></div>
</body>
</html>
`;
  writeFileSync(join(ROOT, p.slug + '.html'), html);
}

PAGES.forEach(page);

// sitemap.xml + robots.txt
const today = new Date().toISOString().slice(0, 10);
const urls = [
  ...PAGES.filter((p) => !p.noindex).map((p) => (p.slug === 'index' ? '' : p.slug + '.html')),
  ...MODELS.map((m) => `watch.html?m=${m.slug}`),
  ...ARTICLES.map((a) => `article.html?a=${a.slug}`),
];
writeFileSync(join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${SITE_URL}/${u.replace(/&/g, '&amp;')}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n</urlset>\n');
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${PAGES.length} pages, sitemap with ${urls.length} URLs (SITE_URL=${SITE_URL}).`);
