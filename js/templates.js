/**
 * HTML templates shared by the browser and the static page generator (tools/build-pages.mjs).
 * Pure functions: data in, HTML string out. Because the generator also runs them,
 * product cards exist in the delivered HTML before any JavaScript runs.
 */
import { picture, urlFor } from './media.js';
import { CASE_MATERIALS, MODELS, ARTICLES, STRAPS, VOICES, FAMILIES, TIMELINE, BOUTIQUES, euro, bySlug } from './data.js';
import { VIDEO, placeholder } from './media.js';

export const ICON = {
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.7 3.7 4.5 7 4.5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.3 0 5.3 3.2 4.2 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  chevron: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * Product card: photo with second-angle crossfade, favourite, price, quick-compare.
 * @param {object} m  model record from data.js
 * @param {object} [o]
 * @param {boolean} [o.compare=true]  show the quick-compare button
 * @param {boolean} [o.eager]         eager-load the photo (LCP candidates only)
 * @param {string}  [o.sizes]
 */
export function card(m, { compare = true, eager = false, sizes = '(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 80vw' } = {}) {
  const spec = `${m.collection} · ${CASE_MATERIALS[m.caseMaterial].label} · ${m.diameter} mm`;
  return `<article class="pcard" data-slug="${m.slug}">
  <div class="wimg" data-tilt data-cursor data-cursor-label="Explore">
    ${picture({ key: m.slug + '.hero', alt: `${m.name} watch on dark stone`, sizes, eager, cls: 'main' })}
    ${urlFor(m.slug + '.threeQuarter') ? picture({ key: m.slug + '.threeQuarter', alt: '', sizes, cls: 'alt' }) : ''}
    ${m.edition ? `<span class="badge">Limited to ${m.edition}</span>` : ''}
    <button class="icon-btn fav" type="button" data-fav="${m.slug}" aria-pressed="false" aria-label="Add ${esc(m.name)} to favourites">${ICON.heart}</button>
  </div>
  <div class="pcard__meta">
    <h3 class="pcard__name"><a class="pcard__link" href="watch.html?m=${m.slug}">${esc(m.name)}</a></h3>
    <span class="pcard__price">${euro(m.price)}</span>
  </div>
  <p class="tag">${spec}</p>
  ${compare ? `<div class="pcard__actions"><button class="chip cmp" type="button" data-cmp="${m.slug}" aria-pressed="false">Quick compare</button></div>` : ''}
</article>`;
}

/** Journal card with a 3:2 cover. */
export function jcard(a) {
  return `<a class="jcard" data-category="${esc(a.category)}" href="article.html?a=${a.slug}" data-cursor data-cursor-label="Read">
  <div class="jcard__img">${picture({ key: 'scene:article-' + a.slug, alt: '', w: 900, h: 600, sizes: '(min-width: 900px) 33vw, 90vw' })}</div>
  <p class="tag">${esc(a.category)} · ${a.read} min read</p>
  <h3>${esc(a.title)}</h3>
  <p class="muted small">${esc(a.summary)}</p>
</a>`;
}

/** Strap / material tile for the Splide strip. */
export function strapSlide(s) {
  return `<div class="splide__slide"><a class="strap" href="collections.html" data-cursor data-cursor-label="View">
  <div class="wimg">${picture({ key: 'scene:strap-' + s.id, alt: `${s.name} strap detail`, sizes: '300px' })}</div>
  <h3>${esc(s.name)}</h3><p class="tag">${esc(s.note)}</p><p class="tag">Fits: ${esc(s.fits)}</p></a></div>`;
}

/** Slide for the Swiper coverflow (a card without the compare button). */
export function swiperSlide(m, i) {
  return `<div class="swiper-slide" role="group" aria-roledescription="slide">${card(m, { compare: false, eager: i < 3, sizes: '(min-width: 700px) 360px, 68vw' })}</div>`;
}

/** Panel in the horizontal-scroll strip: one per collection, photographed with its representative model. */
export function hscrollItem(f) {
  const n = MODELS.filter((m) => m.collection === f.name).length;
  const rep = bySlug(f.rep);
  return `<a class="hscroll__item family" href="collections.html?c=${encodeURIComponent(f.name)}" data-cursor data-cursor-label="Explore">
  <div class="wimg">${picture({ key: f.rep + '.hero', alt: `${rep.name}, from the ${f.name} collection`, sizes: '(min-width: 900px) 36vw, 280px' })}</div>
  <h3 class="family__name">${esc(f.name)}</h3>
  <p class="muted small">${esc(f.text)}</p>
  <p class="tag">${n} ${n === 1 ? 'watch' : 'watches'}</p>
</a>`;
}

/** Owl Carousel testimonial. */
export function voice(v) {
  return `<figure class="voice"><blockquote>“${esc(v.quote)}”</blockquote><figcaption><span class="small">${esc(v.name)}</span><br><span class="tag">${esc(v.role)}</span></figcaption></figure>`;
}


/** A full-bleed header photograph for a page, from the SCENES registry. */
export function scene(name, { eager = true } = {}) {
  return picture({ key: 'scene:' + name, alt: '', w: 2400, h: 1350, sizes: '100vw', eager });
}

/** Poster still for a video slot. Uses the poster URL when set, otherwise a labelled placeholder. */
function posterImg(url, label) {
  const src = url || placeholder(label, 2400, 1350);
  return `<img src="${src}" width="2400" height="1350" alt="" decoding="async" fetchpriority="high" data-slot="${label}"${url ? ` data-fallback="${placeholder(label, 2400, 1350)}"` : ' data-placeholder="1"'}>`;
}
/** Poster still for the hero. The <video> itself is attached at runtime by motion.js. */
export const heroMedia = () => posterImg(VIDEO.hero.poster, 'VIDEO.hero.poster');
/** Poster still for the manufacture film. */
export const manufactureMedia = () => posterImg(VIDEO.manufacture.poster, 'VIDEO.manufacture.poster');

/** The four stacked photographs of the pinned story (Equinox). */
export function storyFrame() {
  return ['hero', 'threeQuarter', 'dial', 'caseback']
    .map((v, i) => picture({ key: 'equinox.' + v, alt: i === 0 ? 'Equinox watch' : '', sizes: '(min-width: 900px) 40vw, 90vw', eager: i === 0, cls: 'st-img' }))
    .join('');
}

/**
 * Named render functions. The page generator uses them to pre-render blocks into the HTML,
 * and the browser uses the same ones to refresh a block if media.js has changed since the build.
 * Usage in a page fragment:  <div data-render="cards-all">{{cards-all}}</div>
 */
export const RENDER = {
  'cards-all':       () => MODELS.map((m) => card(m)).join('\n'),
  'slides-featured': () => MODELS.map((m, i) => swiperSlide(m, i)).join('\n'),
  'hscroll-items':   () => FAMILIES.map(hscrollItem).join('\n'),
  'strap-slides':    () => STRAPS.map(strapSlide).join('\n'),
  'jcards':          () => ARTICLES.map(jcard).join('\n'),
  'jcards-featured': () => ARTICLES.slice(0, 3).map(jcard).join('\n'),
  'voices':          () => VOICES.map(voice).join('\n'),
  'timeline':        () => TIMELINE.map((t) => `<div class="tl__item"><p class="tl__year">${esc(t.year)}</p><h3 style="margin:8px 0">${esc(t.title)}</h3><p class="muted prose">${esc(t.text)}</p></div>`).join('\n'),
  'boutiques':       () => BOUTIQUES.map((b) => `<div><h3>${esc(b.city)}</h3><p class="muted" style="margin-top:8px">${esc(b.address)}</p><p class="tag">${esc(b.hours)}</p></div>`).join('\n'),
  'manufacture-media': manufactureMedia,
  'hero-media':      heroMedia,
  'story-frame':     storyFrame,
};

/** Resolve a render key, including parameterised "scene:name". */
export function render(key) {
  if (key.startsWith('scene:')) return scene(key.slice(6));
  if (!RENDER[key]) throw new Error('Unknown render key ' + key);
  return RENDER[key]();
}
