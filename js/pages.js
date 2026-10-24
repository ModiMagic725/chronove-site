/**
 * Per-page behaviour. Each function builds or enhances the DOM for one page and runs BEFORE
 * motion.js, so that reveals, splits and counters can see the final markup.
 */
import { $, $$, esc, reducedMotion, store, libsReady } from './utils.js';
import { MODELS, ARTICLES, MATERIALS, CONFIG, COLLECTIONS, bySlug, byId, euro, hz, specRows } from './data.js';
import { picture, srcFor } from './media.js';
import { card, jcard, ICON } from './templates.js';
import { syncFavs } from './ui.js';
import { initGallery, initFeatured, initStraps, initVoices } from './carousels.js';

const param = (k) => new URLSearchParams(location.search).get(k);
const announce = (el) => el.dispatchEvent(new CustomEvent('cv:list-updated', { bubbles: true }));

/* ====================================================================== *
 * HOME
 * ====================================================================== */
/** Run `fn` when `el` is within ~400px of the viewport, or after 4 s of idle time, whichever is first. */
function whenNear(el, fn) {
  if (!el) return;
  let done = false;
  const go = () => { if (!done) { done = true; io.disconnect(); libsReady().then(() => { fn(); window.ScrollTrigger?.refresh(); }); } };
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) go(); }, { rootMargin: '400px 0px' });
  io.observe(el);
  setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(go) : go()), 4000);
}
export function index() { whenNear($('#featured'), initFeatured); whenNear($('#straps'), initStraps); }

/* ====================================================================== *
 * COLLECTIONS: filter, sort, quick compare
 * ====================================================================== */
export function collections() {
  const list = $('#cards'), sortEl = $('#sort'), count = $('#result-count');
  const cmp = new Set(store.get('cv-cmp', []));
  let cat = COLLECTIONS.includes(param('c')) ? param('c') : 'All';

  // Tray (floating shortcut to the comparison)
  const tray = document.createElement('div');
  tray.className = 'tray'; tray.setAttribute('role', 'region'); tray.setAttribute('aria-label', 'Comparison');
  tray.innerHTML = '<span class="small" id="tray-n"></span><a class="btn btn--sm btn--solid" href="#compare">Compare now</a>';
  document.body.append(tray);

  function renderList() {
    const s = sortEl.value;
    const items = MODELS.filter((m) => cat === 'All' || m.collection === cat)
      .sort((a, b) => (s === 'pa' ? a.price - b.price : s === 'pd' ? b.price - a.price : a.name.localeCompare(b.name)));
    list.innerHTML = items.map((m, i) => card(m, { eager: i < 4 })).join('');
    count.textContent = `${items.length} ${items.length === 1 ? 'watch' : 'watches'}${cat === 'All' ? '' : ' in ' + cat}`;
    $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
    syncFavs(list); syncCmp(); announce(list);
  }
  function syncCmp() {
    $$('[data-cmp]').forEach((b) => b.setAttribute('aria-pressed', String(cmp.has(b.dataset.cmp))));
    $('#cmp-status').textContent = `${cmp.size} of 4 selected`;
    $('#tray-n').textContent = `${cmp.size} selected`;
    tray.classList.toggle('is-on', cmp.size > 0);
    store.set('cv-cmp', [...cmp]);
    renderTable();
  }
  function renderTable() {
    const body = $('#cmp-body');
    const ms = [...cmp].map(bySlug).filter(Boolean);
    if (ms.length < 2) { body.innerHTML = '<p class="muted">Choose “Quick compare” on two or more watches to see them side by side.</p>'; return; }
    const rows = ms.map(specRows);
    body.innerHTML = `<table class="spec">
      <thead>
      <tr>
      <th scope="col">
      <span class="sr">Specification</span>
      </th>${ms.map((m) => `<th scope="col">${esc(m.name)} <button class="chip" type="button" data-cmp-x="${m.slug}" aria-label="Remove ${esc(m.name)} from comparison">Remove</button>
      </th>`).join('')}</tr>
      </thead>
      <tbody>${rows[0].map((r, k) => `<tr>
      <th scope="row">${r[0]}</th>${rows.map((x) => `<td>${esc(x[k][1])}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;
  }

  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-filter]');
    if (f) { cat = f.dataset.filter; const u = new URL(location.href); cat === 'All' ? u.searchParams.delete('c') : u.searchParams.set('c', cat); history.replaceState(null, '', u); renderList(); return; }
    const c = e.target.closest('[data-cmp]');
    if (c) {
      const s = c.dataset.cmp;
      if (cmp.has(s)) cmp.delete(s);
      else if (cmp.size >= 4) { $('#cmp-status').textContent = 'Maximum of 4. Remove one first.'; return; }
      else cmp.add(s);
      syncCmp(); return;
    }
    const x = e.target.closest('[data-cmp-x]');
    if (x) { cmp.delete(x.dataset.cmpX); syncCmp(); }
  });
  $('#cmp-clear').addEventListener('click', () => { cmp.clear(); syncCmp(); });
  sortEl.addEventListener('change', renderList);
  renderList();
}

/* ====================================================================== *
 * WATCH DETAIL
 * ====================================================================== */
const VIEWS = [
  ['hero', 'On dark stone'], ['threeQuarter', 'Three-quarter angle'], ['side', 'Side profile'],
  ['caseback', 'Sapphire caseback'], ['dial', 'Dial, macro'], ['wrist', 'On the wrist'],
];

export function watch() {
  const root = $('#watch-root');
  const key = param('m');
  const m = (key && (bySlug(key) || (/^\d+$/.test(key) ? byId(key) : null))) || (key ? null : MODELS[0]);
  if (!m) {
    document.title = 'Watch not found — CHRONOVÉ';
    root.innerHTML = `<div class="wrap" style="padding-block:120px">
      <h1 style="font-size:var(--t-2xl)">We could not find that watch</h1>
      <p class="lead" style="margin:24px 0 32px">The link may be mistyped. Every model is in the collections.</p>
      <a class="btn btn--solid" href="collections.html">Browse collections</a>
      </div>`;
    return;
  }
  // Metadata for sharing and the tab title
  document.title = `${m.name} — ${m.collection} watch | CHRONOVÉ`;
  const desc = `${m.name}: ${m.tagline} ${m.diameter} mm ${m.caseMaterial === 'gold' ? 'champagne gold' : m.caseMaterial}, calibre ${m.movement.calibre}, ${m.movement.powerReserve} h power reserve, from ${euro(m.price)}.`;
  $('meta[name="description"]').content = desc;
  $('meta[property="og:title"]').content = document.title;
  $('meta[property="og:description"]').content = desc;
  $('meta[property="og:url"]').content = location.origin === 'null' ? '' : `${location.origin}${location.pathname}?m=${m.slug}`;

  const views = VIEWS.map(([k, label]) => ({
    key: `${m.slug}.${k}`, label,
    alt: `${m.name} — ${label.toLowerCase()}`,
    full: srcFor(`${m.slug}.${k}`, 2000, 2500),
    caption: `${m.name} · ${label}`,
  }));
  const prev = MODELS[(m.id + MODELS.length - 1) % MODELS.length], next = MODELS[(m.id + 1) % MODELS.length];
  const related = [...MODELS.filter((x) => x.id !== m.id && x.collection === m.collection), ...MODELS.filter((x) => x.id !== m.id && x.collection !== m.collection)].slice(0, 3);

  root.innerHTML = `
  <div class="wrap"><a class="back-link" href="collections.html" data-back aria-label="Back to the previous page">${ICON.arrowL}<span>Back</span></a></div>
  <div class="wrap wp__grid">
    <div class="gallery">
      <div class="swiper main" aria-label="${esc(m.name)} photographs" style="position:relative">
        <div class="swiper-wrapper">${views.map((v, i) => `<div class="swiper-slide">
          <button class="zoomable" type="button" data-cursor data-cursor-label="Zoom" aria-label="Open larger view: ${esc(v.label)}" style="display:block;width:100%;height:100%;padding:0;border:0;background:none">${picture({ key: v.key, alt: v.alt, w: 1600, h: 2000, sizes: '(min-width: 1000px) 55vw, 100vw', eager: i === 0 })}</button>
          </div>`).join('')}</div>
        <div style="position:absolute;left:12px;bottom:12px;z-index:4;display:flex;gap:8px;align-items:center">
          <button class="car-btn g-prev" type="button" aria-label="Previous photo" style="background:rgba(16,19,24,.7)">${ICON.arrowL}</button>
          <button class="car-btn g-next" type="button" aria-label="Next photo" style="background:rgba(16,19,24,.7)">${ICON.arrowR}</button>
          </div>
        <div class="g-count small mono" style="position:absolute;right:16px;bottom:22px;z-index:4;width:auto;left:auto"></div>
      </div>
      <div class="swiper thumbs" aria-label="Choose a photograph">
        <div class="swiper-wrapper">${views.map((v, i) => `<div class="swiper-slide">
        <button type="button" aria-label="Show photo ${i + 1}: ${esc(v.label)}">${picture({ key: v.key, alt: '', w: 200, h: 250, sizes: '100px' })}</button>
        </div>`).join('')}</div>
        </div>
    </div>
    <div class="wp__info" id="wp-info">
      <p class="tag"><a href="collections.html?c=${encodeURIComponent(m.collection)}">${m.collection}</a>${m.edition ? ` · Limited to ${m.edition}` : ''}</p>
      <h1 style="font-size:var(--t-2xl);margin-top:8px" data-split>${esc(m.name)}</h1>
      <p class="lead" style="margin-top:16px">${esc(m.tagline)}</p>
      <p class="wp__price">${euro(m.price)}</p>
      <div class="facts"><div><b>${m.diameter} mm</b><span>Case diameter</span></div><div><b>${m.movement.powerReserve} h</b><span>Power reserve</span></div><div><b>${m.waterResistance} m</b><span>Water resistance</span></div></div>
      <div class="row">
        <a class="btn btn--solid magnetic" href="contact.html?w=${m.slug}">Enquire</a>
        <a class="btn magnetic" href="configurator.html?m=${m.slug}">Configure</a>
        <button class="chip" type="button" data-fav="${m.slug}" aria-pressed="false" aria-label="Add ${esc(m.name)} to favourites">Favourite</button>
        </div>
      <p class="small muted" style="margin-top:24px">Calibre ${m.movement.calibre} · ${m.movement.type} · ${hz(m.movement.frequency)}</p>
      <div class="row" style="margin-top:24px"><a class="chip" href="watch.html?m=${prev.slug}">Previous: ${esc(prev.name)}</a><a class="chip" href="watch.html?m=${next.slug}">Next: ${esc(next.name)}</a></div>
    </div>
  </div>
  <div class="sec"><div class="wrap split">
    <div class="c-5"><h2 data-split>The story</h2></div>
    <div class="c-7 prose">${m.story.map((p) => `<p data-reveal>${esc(p)}</p>`).join('')}</div>
  </div></div>
  <div class="sec on-light" id="specs"><div class="wrap split">
    <div class="c-4"><h2 data-split>Specifications</h2></div>
    <div class="c-8"><table class="spec"><tbody>${specRows(m).map(([a, b]) => `<tr><th scope="row">${a}</th><td>${esc(b)}</td></tr>`).join('')}</tbody></table></div>
  </div></div>
  <div class="sec"><div class="wrap"><div class="head"><h2 data-split>Related watches</h2><a class="btn btn--sm" href="collections.html">All collections</a></div>
    <div class="grid-cards">${related.map((r) => card(r, { compare: false })).join('')}</div></div></div>
  <div class="enq-bar" id="enq-bar" role="region" aria-label="Enquire about ${esc(m.name)}">
    <div class="enq-bar__in">
    <p>
    <span class="enq-bar__name">${esc(m.name)}</span>
    <span class="enq-bar__price">${euro(m.price)}</span>
    </p>
    <div class="row">
    <a class="btn btn--sm btn--solid" href="contact.html?w=${m.slug}">Enquire</a>
    <a class="btn btn--sm" href="configurator.html?m=${m.slug}">Configure</a>
    </div>
    </div>
    </div>`;

  libsReady().then(() => initGallery(views));   // content is already on screen; Swiper upgrades it
  syncFavs(root);

  // Sticky enquire bar appears once the main info block has scrolled out of view.
  const bar = $('#enq-bar'), info = $('#wp-info');
  new IntersectionObserver(([e]) => bar.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.bottom < 0)).observe(info);
}

/* ====================================================================== *
 * MOVEMENT ENGINE (UI only; the 3D scene lives in engine3d.js)
 * ====================================================================== */
export const ENGINE_PARTS = [
  ['Case', 'A bevelled steel case with a gold bezel, lugs and crown. It protects the movement and sets the watch’s proportions.'],
  ['Movement', 'The geartrain and balance wheel that divide time into regular beats. The balance swings here slowed down so you can follow it.'],
  ['Bridge', 'The bridge holds the wheels in precise alignment. Its edges are bevelled and its surface finished with fine circular graining.'],
  ['Dial', 'The face: a sunburst-finished disc with applied gold hour markers and a printed minute track for instant legibility.'],
  ['Crystal and hands', 'A domed sapphire crystal over the hour, minute and seconds hands, which follow your device’s clock.'],
];

export async function movementEngine() {
  const stage = $('#engine-stage'), canvas = $('#engine-canvas');
  const chips = $('#parts'), info = $('#info'), slider = $('#ex');
  let target = 0, sel = -1, engine = null;

  const pick = (i) => {
    sel = i;
    $$('.chip', chips).forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    info.innerHTML = `<p class="tag">Layer ${i + 1} of 5</p><h3>${ENGINE_PARTS[i][0]}</h3><p class="muted">${ENGINE_PARTS[i][1]}</p>`;
    engine?.setSelected(i);
    if (target < 0.5) set(1);
  };
  const set = (v) => { target = v; slider.value = Math.round(v * 100); engine?.setExplode(v); };
  const reset = () => { sel = -1; engine?.setSelected(-1); set(0); $$('.chip', chips).forEach((b) => b.setAttribute('aria-pressed', 'false')); info.innerHTML = '<p class="muted">Select a layer, or slide to separate the assembly.</p>'; };

  ENGINE_PARTS.forEach((p, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = p[0]; b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', () => pick(i)); chips.append(b); });
  slider.addEventListener('input', () => { target = slider.value / 100; engine?.setExplode(target); });
  $('#toggle').addEventListener('click', () => set(target > 0.5 ? 0 : 1));
  $('#reset').addEventListener('click', reset);

  await libsReady();
  // Let the page finish its own start-up (motion, ready flag) before the heavy shader compile blocks the main thread.
  await new Promise((done) => { const t0 = Date.now(); (function wait() { if (document.documentElement.dataset.ready === '1' || Date.now() - t0 > 3000) done(); else setTimeout(wait, 40); })(); });
  try {
    const mod = await import('./engine3d.js');
    engine = mod.createEngine(canvas, { onPick: pick, onCaption: (t) => { $('#engine-cap').textContent = t; }, reduced: reducedMotion() });
  } catch (err) { console.warn('3D engine failed to start', err); }
  if (!engine) {
    stage.innerHTML = '<div class="fallback-note" style="position:absolute;inset:0;display:grid;place-content:center;text-align:center;padding:24px">The 3D view needs WebGL, which this browser or device cannot provide. The five layers are still described below: choose one to read about it.</div>';
    $('#engine-note').textContent = '';
  }
}

/* ====================================================================== *
 * CONFIGURATOR
 * ====================================================================== */
export function configurator() {
  const start = bySlug(param('m')) || MODELS[0];
  const st = { model: start.slug, strap: 0, finish: 0, engraving: 0 };
  const groups = {
    model: MODELS.map((m) => [m.name, 0, m.slug]),
    strap: CONFIG.strap, finish: CONFIG.finish, engraving: CONFIG.engraving,
  };
  Object.entries(groups).forEach(([k, opts]) => {
    const host = $('#o-' + k);
    opts.forEach((o, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.dataset.k = k; b.dataset.i = k === 'model' ? o[2] : i;
      b.textContent = o[0] + (k !== 'model' && o[1] ? ` (+${euro(o[1])})` : '');
      host.append(b);
    });
  });
  const upd = () => {
    const m = bySlug(st.model);
    $$('#o-model .chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.i === st.model)));
    ['strap', 'finish', 'engraving'].forEach((k) => $$('#o-' + k + ' .chip').forEach((b, i) => b.setAttribute('aria-pressed', String(st[k] === i))));
    const total = m.price + CONFIG.strap[st.strap][1] + CONFIG.finish[st.finish][1] + CONFIG.engraving[st.engraving][1];
    $('#cfg-summary').textContent = `${m.name} · ${CONFIG.strap[st.strap][0]} · ${CONFIG.finish[st.finish][0]} · ${CONFIG.engraving[st.engraving][0]}`;
    $('#cfg-price').textContent = euro(total);
    $('#cfg-caption').textContent = `${m.name}, ${m.collection}. The photograph shows the standard watch; strap, finish and engraving are added at the bench.`;
    const ph = $('#cfg-photo');
    if (ph.dataset.slug !== m.slug) { ph.dataset.slug = m.slug; ph.innerHTML = picture({ key: m.slug + '.hero', alt: `${m.name} watch`, sizes: '(min-width: 900px) 45vw, 100vw', eager: true }); }
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('#o-model .chip, #o-strap .chip, #o-finish .chip, #o-engraving .chip');
    if (b) { st[b.dataset.k] = b.dataset.k === 'model' ? b.dataset.i : Number(b.dataset.i); upd(); }
  });
  $('#cfg-reset').addEventListener('click', () => { Object.assign(st, { model: start.slug, strap: 0, finish: 0, engraving: 0 }); upd(); });
  upd();
}

/* ====================================================================== *
 * TIMEKEEPING: balance wheel (SVG) + gear calculator
 * ====================================================================== */
export function timekeeping() {
  const host = $('#bw-diagram');
  const spiral = (() => { let d = ''; for (let i = 0; i <= 160; i++) { const t = i / 160 * Math.PI * 2 * 5, r = 8 + t * 3.2; d += (i ? 'L' : 'M') + (r * Math.cos(t)).toFixed(1) + ' ' + (r * Math.sin(t)).toFixed(1); } return d; })();
  host.innerHTML = `<svg viewBox="-120 -120 240 240" aria-hidden="true" focusable="false">
    <circle r="112" fill="none" stroke="var(--line-strong)" stroke-dasharray="1 5"/>
    <g id="bw-wheel">
      <circle r="92" fill="none" stroke="var(--fg)" stroke-width="7"/>
      <circle r="92" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 9"/>
      <path d="M-92 0H92M0 -92V92" stroke="var(--fg)" stroke-width="4"/>
      <path d="${spiral}" fill="none" stroke="var(--accent)" stroke-width="1.6"/>
      <circle r="9" fill="var(--accent)"/>
      <circle cx="0" cy="-92" r="6" fill="var(--accent)"/>
    </g>
    <path d="M0 -122 L6 -108 L-6 -108Z" fill="var(--fg)"/></svg>`;
  const wheel = $('#bw-wheel'), sel = $('#bph'), out = $('#bph-out');
  let tween = null;
  const set = () => {
    const vph = Number(sel.value), bps = vph / 3600;          // beats per second; one oscillation = two beats
    out.textContent = `${vph.toLocaleString('en')} beats per hour = ${bps / 2} Hz = ${bps} beats per second`;
    if (!window.gsap || reducedMotion()) return;
    tween?.kill();
    window.gsap.set(wheel, { rotation: -110, svgOrigin: '0 0' });
    // one beat = one half-swing; shown at 1/8 speed so it can be followed
    tween = window.gsap.to(wheel, { rotation: 110, svgOrigin: '0 0', duration: (1 / bps) * 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  };
  sel.addEventListener('change', set); libsReady().then(set);
  const calc = () => {
    const a = +$('#ga').value, b = +$('#gb').value;
    $('#gear-out').textContent = a > 0 && b > 0 ? `The driven wheel turns ${(a / b).toFixed(2)}× for every turn of the driver (ratio 1 : ${(a / b).toFixed(2)}).` : 'Enter positive tooth counts.';
  };
  $('#ga').addEventListener('input', calc); $('#gb').addEventListener('input', calc); calc();
}

/* ====================================================================== *
 * COMPLICATIONS
 * ====================================================================== */
export function complications() {
  // Chronograph
  const cs = $('#cs'), go = $('#cgo');
  let t0 = 0, run = false, acc = 0, timer = 0;
  const fmt = (ms) => { const s = ms / 1000; return String(Math.floor(s / 60)).padStart(2, '0') + ':' + (s % 60).toFixed(2).padStart(5, '0'); };
  go.addEventListener('click', () => {
    if (run) { acc += performance.now() - t0; run = false; clearInterval(timer); go.textContent = 'Start'; cs.textContent = fmt(acc); }
    else { t0 = performance.now(); run = true; go.textContent = 'Stop'; timer = setInterval(() => { cs.textContent = fmt(acc + performance.now() - t0); }, 50); }
  });
  $('#crs').addEventListener('click', () => { run = false; clearInterval(timer); acc = 0; cs.textContent = '00:00.00'; go.textContent = 'Start'; });

  // Moon phase (SVG)
  const md = $('#md'), moon = $('#moon');
  const phase = () => {
    const d = +md.value, p = d / 29.53, r = 90, c = 100, k = Math.cos(p * 2 * Math.PI);
    const half = `M${c} ${c - r}A${r} ${r} 0 0 ${p < 0.5 ? 1 : 0} ${c} ${c + r}Z`;
    moon.innerHTML = `<circle cx="${c}" cy="${c}" r="${r}" fill="#222831" stroke="var(--line-strong)"/><path d="${half}" fill="#C5A46D"/><ellipse cx="${c}" cy="${c}" rx="${Math.abs(k) * r}" ry="${r}" fill="${k > 0 ? '#222831' : '#C5A46D'}"/>`;
    $('#mt').textContent = `Day ${d} · ${d < 2 || d > 27 ? 'New moon' : d < 14 ? 'Waxing' : d < 17 ? 'Full moon' : 'Waning'}`;
  };
  md.addEventListener('input', phase); phase();

  // GMT
  const zones = [['UTC', 'UTC'], ['New York', 'America/New_York'], ['London', 'Europe/London'], ['Geneva', 'Europe/Zurich'], ['Kolkata', 'Asia/Kolkata'], ['Singapore', 'Asia/Singapore'], ['Tokyo', 'Asia/Tokyo']];
  const gz = $('#gz');
  zones.forEach(([n, z]) => gz.add(new Option(n, z)));
  gz.value = 'Europe/Zurich';
  const gmt = () => { const n = new Date(); $('#gt').innerHTML = `Local ${n.toLocaleTimeString('en-GB')}<br>${gz.selectedOptions[0].text} ${n.toLocaleTimeString('en-GB', { timeZone: gz.value })}`; };
  gz.addEventListener('change', gmt); gmt(); setInterval(gmt, 1000);

  // Leap year
  const cd = $('#cd');
  const leap = () => {
    const d = new Date(cd.value + 'T12:00:00');
    if (isNaN(d)) { $('#ct').textContent = 'Choose a date.'; return; }
    const y = d.getFullYear(), L = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    $('#ct').textContent = `${d.toLocaleDateString('en-GB', { weekday: 'long' })}. ${y} ${L ? 'is a leap year: a perpetual calendar adds 29 February.' : 'is not a leap year.'}`;
  };
  cd.addEventListener('change', leap); leap();
}

/* ====================================================================== *
 * MATERIALS
 * ====================================================================== */
export function materials() {
  const chips = $('#mat-chips'), panel = $('#mat-panel');
  MATERIALS.forEach((m, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = m.name; b.addEventListener('click', () => show(i)); chips.append(b); });
  function show(i) {
    const m = MATERIALS[i];
    $$('.chip', chips).forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    panel.innerHTML = `<div class="swatch" style="background:repeating-linear-gradient(100deg, rgba(255,255,255,.07) 0 2px, rgba(0,0,0,.07) 2px 4px), linear-gradient(115deg, ${m.tone} 0%, #ffffffaa 38%, ${m.tone} 55%, #00000066 100%)"></div>
      <h3 style="margin:24px 0 8px;font-size:var(--t-xl)">${m.name}</h3><p class="prose muted">${m.text}</p>
      <div style="margin-top:24px">${[['Hardness', m.hardness], ['Lightness', m.lightness], ['Shine', m.shine]].map(([n, v]) => `<p class="small">${n}</p><div class="bar" role="img" aria-label="${n}: ${v} out of 100"><i style="transform:scaleX(${v / 100});width:100%"></i></div>`).join('')}</div>
      <p class="small muted">Comparative ratings from the bench, not laboratory measurements.</p>`;
  }
  show(0);
}

/* ====================================================================== *
 * JOURNAL + ARTICLE
 * ====================================================================== */
export function journal() {
  const host = $('#jfilters'), list = $('#jlist');
  ['All', ...new Set(ARTICLES.map((a) => a.category))].forEach((c, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = c; b.setAttribute('aria-pressed', String(i === 0));
    b.addEventListener('click', () => {
      $$('.chip', host).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('.jcard', list).forEach((j) => { j.hidden = !(c === 'All' || j.dataset.category === c); });
      announce(list);
    });
    host.append(b);
  });
  libsReady().then(initVoices);
}

export function article() {
  const root = $('#article-root');
  const key = param('a');
  const a = ARTICLES.find((x) => x.slug === key) || (/^\d+$/.test(key || '') ? ARTICLES[+key] : null) || (key ? null : ARTICLES[0]);
  if (!a) {
    document.title = 'Essay not found — CHRONOVÉ';
    root.innerHTML = `<section class="phero"><div class="wrap phero__body"><h1>Essay not found</h1><p class="lead">The link may be mistyped.</p><p style="margin-top:24px"><a class="btn btn--solid" href="journal.html">Back to the journal</a></p></div></section>`;
    return;
  }
  document.title = `${a.title} — CHRONOVÉ Journal`;
  $('meta[name="description"]').content = a.summary;
  $('meta[property="og:title"]').content = document.title;
  const more = ARTICLES.filter((x) => x.id !== a.id).slice(0, 3);
  root.innerHTML = `
  <section class="phero"><div class="media-fill grade" aria-hidden="true" data-parallax>${picture({ key: 'scene:article-' + a.slug, alt: '', w: 1800, h: 1200, sizes: '100vw', eager: true })}</div>
    <div class="wrap phero__body">
      <a class="back-link" href="journal.html" data-back aria-label="Back to the previous page">${ICON.arrowL}<span>Back</span></a>
      <p class="tag" style="color:var(--steel)">${esc(a.category)} · ${a.read} min read</p><h1 data-split style="margin-top:8px">${esc(a.title)}</h1><p class="lead" data-reveal>${esc(a.summary)}</p></div></section>
  <section class="sec on-light"><div class="wrap"><article class="article">${a.body.map((p) => `<p data-reveal>${esc(p)}</p>`).join('')}
    <p class="note" data-reveal>An essay from the CHRONOVÉ workshop. Figures are explanatory, not certified data.</p></article></div></section>
  <section class="sec"><div class="wrap"><div class="head"><h2 data-split>Keep reading</h2><a class="btn btn--sm" href="journal.html">All essays</a></div><div class="grid-cards">${more.map(jcard).join('')}</div></div></section>`;
}

/* ====================================================================== *
 * CONTACT
 * ====================================================================== */
export function contact() {
  const w = bySlug(param('w'));
  if (w) $('#c-msg').value = `I would like to know more about the ${w.name}. `;
}

/** Dispatcher used by main.js */
export const PAGES = { index, collections, watch, 'movement-engine': movementEngine, configurator, timekeeping, complications, materials, journal, article, contact };
