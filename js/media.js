/**
 * CHRONOVÉ — media registry.
 *
 * HOW TO ADD PHOTOS AND VIDEO (no code changes anywhere else):
 *   1. Paste a direct image/video URL between the quotes below.
 *   2. Reload. Every card, carousel, gallery and hero that uses that slot updates.
 *   3. Run `npm run verify:media` to check each URL returns HTTP 200 and the right content-type.
 *
 * Empty slots render a clearly labelled dark placeholder (generated in the browser, no files).
 * Any URL that fails to load also falls back to that placeholder, so a broken link never leaves a hole.
 *
 * Use only sources whose licence allows commercial use (Unsplash, Pexels, Pixabay) and record
 * each one in CREDITS.md. Recommended sizes are in SLOT_SPECS below and in MEDIA_BRIEF.md.
 */

/* ------------------------------------------------------------------ *
 * 1. WATCH IMAGES — six views per model (currently the generated illustrations in images/watches/;
 *    replace any path with a real photo URL whenever you have one)
 *    hero          product on dark stone, 4:5
 *    threeQuarter  3/4 angle, 4:5 (shown on card hover as the second angle)
 *    side          profile, 4:5
 *    caseback      sapphire caseback, 4:5
 *    dial          macro of the dial, 4:5
 *    wrist         wrist shot, 4:5
 * ------------------------------------------------------------------ */
export const WATCH_IMAGES = {
  'meridian':  { hero: 'images/watches/meridian-hero.jpg', threeQuarter: 'images/watches/meridian-threeQuarter.jpg', side: 'images/watches/meridian-side.jpg', caseback: 'images/watches/meridian-caseback.jpg', dial: 'images/watches/meridian-dial.jpg', wrist: 'images/watches/meridian-wrist.jpg' },
  'aperture':  { hero: 'images/watches/aperture-hero.jpg', threeQuarter: 'images/watches/aperture-threeQuarter.jpg', side: 'images/watches/aperture-side.jpg', caseback: 'images/watches/aperture-caseback.jpg', dial: 'images/watches/aperture-dial.jpg', wrist: 'images/watches/aperture-wrist.jpg' },
  'tidal-300': { hero: 'images/watches/tidal-300-hero.jpg', threeQuarter: 'images/watches/tidal-300-threeQuarter.jpg', side: 'images/watches/tidal-300-side.jpg', caseback: 'images/watches/tidal-300-caseback.jpg', dial: 'images/watches/tidal-300-dial.jpg', wrist: 'images/watches/tidal-300-wrist.jpg' },
  'equinox':   { hero: 'images/watches/equinox-hero.jpg', threeQuarter: 'images/watches/equinox-threeQuarter.jpg', side: 'images/watches/equinox-side.jpg', caseback: 'images/watches/equinox-caseback.jpg', dial: 'images/watches/equinox-dial.jpg', wrist: 'images/watches/equinox-wrist.jpg' },
  'axiom':     { hero: 'images/watches/axiom-hero.jpg', threeQuarter: 'images/watches/axiom-threeQuarter.jpg', side: 'images/watches/axiom-side.jpg', caseback: 'images/watches/axiom-caseback.jpg', dial: 'images/watches/axiom-dial.jpg', wrist: 'images/watches/axiom-wrist.jpg' },
  'regatta':   { hero: 'images/watches/regatta-hero.jpg', threeQuarter: 'images/watches/regatta-threeQuarter.jpg', side: 'images/watches/regatta-side.jpg', caseback: 'images/watches/regatta-caseback.jpg', dial: 'images/watches/regatta-dial.jpg', wrist: 'images/watches/regatta-wrist.jpg' },
  'solstice':  { hero: 'images/watches/solstice-hero.jpg', threeQuarter: 'images/watches/solstice-threeQuarter.jpg', side: 'images/watches/solstice-side.jpg', caseback: 'images/watches/solstice-caseback.jpg', dial: 'images/watches/solstice-dial.jpg', wrist: 'images/watches/solstice-wrist.jpg' },
  'lattice':   { hero: 'images/watches/lattice-hero.jpg', threeQuarter: 'images/watches/lattice-threeQuarter.jpg', side: 'images/watches/lattice-side.jpg', caseback: 'images/watches/lattice-caseback.jpg', dial: 'images/watches/lattice-dial.jpg', wrist: 'images/watches/lattice-wrist.jpg' },
  'perpetua':  { hero: 'images/watches/perpetua-hero.jpg', threeQuarter: 'images/watches/perpetua-threeQuarter.jpg', side: 'images/watches/perpetua-side.jpg', caseback: 'images/watches/perpetua-caseback.jpg', dial: 'images/watches/perpetua-dial.jpg', wrist: 'images/watches/perpetua-wrist.jpg' },
};

/* ------------------------------------------------------------------ *
 * 2. VIDEO — hero loop, manufacture macro, plus posters (still frames)
 *    Posters are used while video loads, with reduced-motion and with data-saver.
 *    mp4Mobile should be under 3 MB (720p, ~10 s loop).
 * ------------------------------------------------------------------ */
export const VIDEO = {
  hero:        { poster: '', webm: '', mp4: '', mp4Mobile: '' },
  manufacture: { poster: '', webm: '', mp4: '', mp4Mobile: '' },
};

/* ------------------------------------------------------------------ *
 * 3. SCENES — everything that is not a single watch
 * ------------------------------------------------------------------ */
export const SCENES = {
  'collections':        '', // 16:9 header
  'manufacture':        '', // 16:9 header
  'movement':           '', // 16:9 header
  'configurator':       '', // 16:9 header
  'timekeeping':        '', // 16:9 header
  'complications':      '', // 16:9 header
  'materials':          '', // 16:9 header
  'heritage':           '', // 16:9 header
  'heritage-bench':     '', // 4:5 workshop bench
  'heritage-archive':   '', // 4:5 archive drawers
  'journal':            '', // 16:9 header
  'boutique':           '', // 16:9 header
  'contact':            '', // 16:9 header
  'manufacture-stage-1': '', 'manufacture-stage-2': '', 'manufacture-stage-3': '',
  'manufacture-stage-4': '', 'manufacture-stage-5': '', // 4:5 each
  'strap-calf': '', 'strap-bracelet': '', 'strap-rubber': '',
  'strap-alligator': '', 'strap-titanium': '', 'strap-textile': '', // 4:5 each
  'article-balance-wheel': '', 'article-finishing-a-bridge': '', 'article-titanium-vs-steel': '',
  'article-reading-a-dial': '', 'article-perpetual-calendar': '', 'article-sapphire-explained': '', // 3:2 each
};

/** Recommended pixel sizes per kind of slot (also written up in MEDIA_BRIEF.md). */
export const SLOT_SPECS = {
  watch:  { ratio: 4 / 5,  width: 1600, height: 2000 },
  header: { ratio: 16 / 9, width: 2400, height: 1350 },
  scene:  { ratio: 4 / 5,  width: 1600, height: 2000 },
  article:{ ratio: 3 / 2,  width: 1800, height: 1200 },
  poster: { ratio: 16 / 9, width: 1920, height: 1080 },
};

/* ================================================================== *
 * Helpers below. Nothing here needs editing.
 * ================================================================== */

/** Resolve "meridian.hero" / "scene:heritage" style keys to a URL string ('' when unset). */
export function urlFor(key) {
  if (key.startsWith('scene:')) return SCENES[key.slice(6)] || '';
  const [slug, view] = key.split('.');
  return (WATCH_IMAGES[slug] && WATCH_IMAGES[slug][view]) || '';
}

/** All slots that currently have no URL, for the README and the test-suite. */
export function emptySlots() {
  const out = [];
  Object.entries(WATCH_IMAGES).forEach(([s, v]) => Object.entries(v).forEach(([k, u]) => { if (!u) out.push(`${s}.${k}`); }));
  Object.entries(SCENES).forEach(([k, u]) => { if (!u) out.push('scene:' + k); });
  Object.entries(VIDEO).forEach(([g, v]) => Object.entries(v).forEach(([k, u]) => { if (!u) out.push(`video:${g}.${k}`); }));
  return out;
}

/** A dark, clearly labelled placeholder as an SVG data URI. Generated, never a file. */
export function placeholder(label, w = 800, h = 1000) {
  const wide = w > h * 1.2;           // full-bleed backgrounds get a quiet corner label so copy on top stays readable
  const ring = wide ? '' :
    `<circle cx="${w / 2}" cy="${h * 0.42}" r="${Math.min(w, h) * 0.22}" fill="none" stroke="#C5A46D" stroke-opacity=".35" stroke-width="1.5"/>` +
    `<circle cx="${w / 2}" cy="${h * 0.42}" r="${Math.min(w, h) * 0.205}" fill="none" stroke="#C5A46D" stroke-opacity=".15"/>`;
  const fs = wide ? Math.max(14, w / 120) : Math.max(13, w / 46);
  const x = wide ? w - 24 : w / 2, y = wide ? h - 26 - fs * 1.4 : h * 0.8, anchor = wide ? 'end' : 'middle';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><radialGradient id="g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#303641"/><stop offset=".6" stop-color="#1b2028"/><stop offset="1" stop-color="#0d1014"/></radialGradient></defs>` +
    `<rect width="100%" height="100%" fill="url(#g)"/>${ring}` +
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Inter,Arial,sans-serif" font-size="${fs}" fill="#B9BEC5" fill-opacity=".62">Photo slot · ${label}</text>` +
    `<text x="${x}" y="${y + fs * 1.5}" text-anchor="${anchor}" font-family="Inter,Arial,sans-serif" font-size="${fs * 0.85}" fill="#B9BEC5" fill-opacity=".45">${w}×${h} · add a URL in js/media.js</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/**
 * Describe how to resize/convert a URL on the host that serves it.
 * Returns null for hosts we cannot transform (the plain URL is then used as-is).
 */
function transformer(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  if (u.hostname === 'images.unsplash.com') {
    return (w, fmt) => { const v = new URL(u); v.searchParams.set('w', w); v.searchParams.set('q', '75'); v.searchParams.set('fit', 'crop'); v.searchParams.set('fm', fmt); v.searchParams.delete('auto'); return v.toString(); };
  }
  if (u.hostname === 'images.pexels.com') {
    return (w, fmt) => { if (fmt !== 'jpg') return null; const v = new URL(u); v.searchParams.set('auto', 'compress'); v.searchParams.set('cs', 'tinysrgb'); v.searchParams.set('w', w); return v.toString(); };
  }
  return null;
}

/**
 * Build a <picture> for a media slot.
 * - AVIF + WebP sources and a JPEG fallback where the host can transform images (Unsplash).
 * - Width/height attributes and an aspect-ratio box, so nothing shifts when the image arrives.
 * - loading="lazy" unless `eager` (use eager for the one LCP image on a page).
 * - A failing URL is swapped for the placeholder by the global error handler in ui.js.
 *
 * @param {object} o
 * @param {string} o.key      slot key, e.g. "meridian.hero" or "scene:heritage"
 * @param {string} o.alt      alt text; pass '' only for purely decorative images
 * @param {number} [o.w=800]  intrinsic width used for width/height attributes
 * @param {number} [o.h=1000] intrinsic height
 * @param {string} [o.sizes]  sizes attribute
 * @param {boolean} [o.eager] load eagerly with high fetch priority
 * @param {string} [o.cls]    extra class names for the <img>
 */
export function picture({ key, alt, w = 800, h = 1000, sizes = '(min-width: 900px) 33vw, 90vw', eager = false, cls = '' }) {
  const url = urlFor(key);
  const label = key.replace('scene:', '');
  const ph = placeholder(label, w, h);
  const common = `width="${w}" height="${h}" alt="${escapeAttr(alt)}" decoding="async" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} data-slot="${label}" class="${cls}"`;
  if (!url) return `<img src="${ph}" ${common} data-placeholder="1">`;
  const t = transformer(url);
  if (!t) return `<img src="${url}" ${common} data-fallback="${ph}">`;
  const widths = [480, 800, 1200, 1600].filter((n) => n <= Math.max(w, 800) * 2);
  const set = (fmt) => widths.map((n) => { const s = t(n, fmt); return s ? `${s} ${n}w` : null; }).filter(Boolean).join(', ');
  const avif = set('avif'), webp = set('webp'), jpg = set('jpg');
  return `<picture>` +
    (avif ? `<source type="image/avif" srcset="${avif}" sizes="${sizes}">` : '') +
    (webp ? `<source type="image/webp" srcset="${webp}" sizes="${sizes}">` : '') +
    `<img src="${t(800, 'jpg') || url}" ${jpg ? `srcset="${jpg}" sizes="${sizes}"` : ''} ${common} data-fallback="${ph}"></picture>`;
}

/** Plain URL (or placeholder data URI) for places that need a string, e.g. a CSS background or lightbox. */
export function srcFor(key, w = 1600, h = 2000) {
  const url = urlFor(key);
  if (!url) return placeholder(key.replace('scene:', ''), w, h);
  const t = transformer(url);
  return (t && t(w, 'jpg')) || url;
}

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Short hash of every URL in this file. The page generator bakes it into each page; at load the browser
 * compares it with the live value and re-renders pre-built blocks only when they differ,
 * so editing this file takes effect without rebuilding anything.
 */
export function mediaHash() {
  const str = JSON.stringify([WATCH_IMAGES, VIDEO, SCENES]);
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
