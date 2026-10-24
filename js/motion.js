/**
 * CHRONOVÉ — motion.
 *
 * Rules this file follows:
 *  - Animate transform and opacity (clip-path only for the image-reveal masks the brief asks for).
 *  - Everything heavy is created inside gsap.matchMedia(), so it is torn down automatically when the
 *    reduced-motion preference or the viewport changes.
 *  - With prefers-reduced-motion: no Lenis, no parallax, no pins, no split/reveal, no cursor effects, no
 *    page transitions, no autoplaying video. Content is simply visible.
 *  - ScrollTriggers are killed before navigating away.
 *  - One orchestrated moment per page (the intro). Section reveals are quiet.
 */
import { $, $$, reducedMotion, finePointer, saveData, state, scrollTo, debounce } from './utils.js';
import { VIDEO } from './media.js';

const g = () => window.gsap;
const ST = () => window.ScrollTrigger;

/* ====================================================================== *
 * Smooth scroll
 * ====================================================================== */
export function initLenis() {
  if (reducedMotion() || !window.Lenis || !g() || !ST()) return null;
  const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, anchors: false });
  state.lenis = lenis;
  lenis.on('scroll', ST().update);
  g().ticker.add((t) => lenis.raf(t * 1000));
  g().ticker.lagSmoothing(0);
  // In-page anchors
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = $(id);
    if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -72 }); }
  }));
  return lenis;
}

/* ====================================================================== *
 * Preloader, page transition in/out
 * ====================================================================== */
/** Resolves when the page content is visible and intro animations may start. */
export function enter() {
  const html = document.documentElement;
  const gs = g();
  return new Promise((resolve) => {
    if (!gs || reducedMotion()) { html.classList.remove('has-pre', 'pt-in'); return resolve(); }
    if (html.classList.contains('has-pre')) {
      const pre = $('.pre'), bar = $('.pre__bar i'), mark = $('.pre__mark');
      try { sessionStorage.setItem('cv-seen', '1'); } catch { /* ignore */ }
      gs.set(mark, { autoAlpha: 0, y: 12 });
      gs.timeline({ onComplete: () => { html.classList.remove('has-pre'); resolve(); } })
        .to(mark, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' })
        .to(bar, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' }, 0.05)
        .to(pre, { yPercent: -100, duration: 0.6, ease: 'power4.inOut' }, '+=0.05')
        .add(resolve, '-=0.3'); // let the intro start while the curtain is still lifting
      return;
    }
    if (html.classList.contains('pt-in')) {
      const pt = $('.pt');
      gs.timeline({ onComplete: () => { html.classList.remove('pt-in'); gs.set(pt, { clearProps: 'all' }); } })
        .set(pt, { yPercent: 0 })
        .to(pt, { yPercent: -101, duration: 0.7, ease: 'power4.inOut' }, 0.05)
        .add(resolve, 0.3);
      return;
    }
    resolve();
  });
}

/** Wipe the page out, then follow the link. Plain navigation if anything is unavailable. */
export function initTransitions() {
  const gs = g();
  if (!gs || reducedMotion()) return;
  const pt = $('.pt');
  const leave = (url) => {
    try { sessionStorage.setItem('cv-nav', '1'); } catch { /* ignore */ }
    ST()?.getAll().forEach((t) => t.kill());
    state.lenis?.stop();
    gs.set(pt, { yPercent: 101 });
    gs.to(pt, { yPercent: 0, duration: 0.55, ease: 'power4.inOut', onComplete: () => { location.href = url; } });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download') || a.getAttribute('href').startsWith('#') || a.getAttribute('href').startsWith('mailto:')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname)) return;
    if (u.pathname === location.pathname && u.search === location.search) return;
    e.preventDefault();
    leave(u.href);
  });
  // Back/forward cache restores are handled in ui.js (initBack): the page is reloaded, because the pagehide handler below tears the animations down.
  addEventListener('pagehide', () => ST()?.getAll().forEach((t) => t.kill()));
}

/* ====================================================================== *
 * Text: split reveal (lines → words), simple reveals, counters
 * ====================================================================== */
const splits = [];
export function initSplits(heroTitle) {
  const gs = g();
  if (!gs || !window.SplitType || reducedMotion()) return;
  const els = $$('[data-split]');
  // Splitting is the costly part, so headings are split only when they are about to scroll into view
  // (the hero title immediately). Until then they stay hidden, so there is no flash.
  const prepare = (el) => {
    const hero = el === heroTitle;
    const sp = new window.SplitType(el, { types: 'lines,words', tagName: 'span' });
    gs.set(sp.words, { yPercent: 115 });
    el.style.visibility = 'visible';
    const rec = { el, sp, done: false };
    splits.push(rec);
    const run = () => gs.to(sp.words, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.06, onComplete: () => { rec.done = true; } });
    if (hero) rec.run = run; else ST().create({ trigger: el, start: 'top 88%', once: true, onEnter: run });
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); prepare(e.target); } }), { rootMargin: '120% 0px' });
  els.forEach((el) => { el.style.visibility = 'hidden'; el === heroTitle ? prepare(el) : io.observe(el); });
  // Re-split when the width changes (line breaks move), keeping already-revealed headings visible.
  let w = innerWidth;
  addEventListener('resize', debounce(() => {
    if (innerWidth === w) return;
    w = innerWidth;
    splits.forEach((r) => { if (r.done) { r.sp.split({ types: 'lines,words', tagName: 'span' }); } });
    ST().refresh();
  }, 250));
}

export function initReveals() {
  const gs = g();
  if (!gs || !ST() || reducedMotion()) return;
  const els = $$('[data-reveal]').filter((e) => !e.closest('[data-hero]'));
  gs.set(els, { autoAlpha: 0, y: 28 });
  ST().batch(els, { start: 'top 90%', once: true, onEnter: (b) => gs.to(b, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }) });
  // Image masks
  $$('[data-clip]').forEach((el) => {
    const media = $('img', el);
    gs.set(el, { clipPath: 'inset(100% 0% 0% 0%)', visibility: 'visible' });
    if (media) gs.set(media, { scale: 1.3 });
    ST().create({ trigger: el, start: 'top 88%', once: true, onEnter: () => {
      gs.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut' });
      if (media) gs.to(media, { scale: 1, duration: 1.6, ease: 'power3.out' });
    } });
  });
}

export function initCounters() {
  const gs = g();
  if (!gs || !ST() || reducedMotion()) return;
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count), o = { v: 0 };
    el.textContent = '0';
    ST().create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gs.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en'); } }) });
  });
}

/* ====================================================================== *
 * Parallax
 * ====================================================================== */
export function initParallax(mm) {
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const gs = g();
    $$('[data-parallax]').forEach((box) => {
      const media = $$('img, video', box);
      if (!media.length) return;
      const hero = !!box.closest('[data-hero]');
      gs.set(media, { scale: 1.14 });
      gs.fromTo(media, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: box.parentElement, start: hero ? 'top top' : 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
}

/* ====================================================================== *
 * Hero intro (the one orchestrated moment)
 * ====================================================================== */
export function heroIntro() {
  const gs = g();
  const hero = $('[data-hero]');
  const title = $('[data-hero-title]');
  if (!gs || !hero || reducedMotion()) return;
  const rec = splits.find((s) => s.el === title);
  const sub = $('[data-hero-sub]'), cta = $('[data-hero-cta]'), clock = $('[data-hero-clock]'), media = $('.hero__media'), cue = $('.scrollcue');
  gs.set([sub, cta, clock, cue], { autoAlpha: 0, y: 24 });
  gs.set(media, { scale: 1.2, transformOrigin: '50% 60%' });
  const tl = gs.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(media, { scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
    .add(() => rec?.run?.(), 0.15)
    .to(sub, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.8)
    .to(cta, { autoAlpha: 1, y: 0, duration: 0.9 }, 1.0)
    .to(clock, { autoAlpha: 1, y: 0, duration: 0.9 }, 1.15)
    .to(cue, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.4);
}

/** Live clock on the hero. */
export function initClock() {
  const t = $('#clock');
  if (!t) return;
  const zone = $('#clock-zone');
  if (zone) zone.textContent = 'Local time · ' + Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tick = () => { t.textContent = new Date().toLocaleTimeString('en-GB'); };
  tick();
  setInterval(tick, 1000);
}

/* ====================================================================== *
 * Pinned storytelling: the watch turns and zooms between photographs as you scroll
 * ====================================================================== */
export function initStory(mm) {
  const sec = $('[data-story]');
  if (!sec) return;
  const frame = $('.story__frame', sec);
  const imgs = $$('img.st-img', frame);
  const chs = $$('[data-ch]', sec);
  const dots = $$('.story__prog i', sec);
  // Without motion (or without pin) the first photograph is shown and the chapters stack as text.
  imgs.forEach((im, i) => { im.style.opacity = i === 0 ? '1' : '0'; });
  const stack = () => { sec.classList.add('no-pin'); frame.classList.add('is-static'); chs.forEach((c) => { c.style.opacity = '1'; }); };
  mm.add('(prefers-reduced-motion: reduce)', stack);
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const gs = g();
    sec.classList.remove('no-pin'); frame.classList.remove('is-static');
    gs.set(chs, { autoAlpha: 0, y: 24 }); gs.set(chs[0], { autoAlpha: 1, y: 0 });
    gs.set(frame, { transformPerspective: 1100 });
    const n = imgs.length;
    const tl = gs.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + innerHeight * (n - 1) * 1.1, scrub: 0.6, pin: $('.story__stage', sec), anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => { const k = Math.min(n - 1, Math.round(self.progress * (n - 1))); dots.forEach((d, i) => d.classList.toggle('is-on', i <= k)); } },
    });
    dots[0]?.classList.add('is-on');
    for (let i = 1; i < n; i++) {
      const t = i - 1;
      tl.to(chs[i - 1], { autoAlpha: 0, y: -24, duration: 0.35 }, t + 0.55)
        .fromTo(chs[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.35 }, t + 0.7)
        .fromTo(imgs[i], { opacity: 0, scale: 1.22 }, { opacity: 1, scale: 1, duration: 0.6 }, t + 0.5)
        .to(imgs[i - 1], { scale: 1.08, duration: 1 }, t)
        .fromTo(frame, { rotationY: i % 2 ? 9 : -9 }, { rotationY: 0, duration: 0.6 }, t + 0.5)
        .to(frame, { rotationY: i % 2 ? -7 : 7, duration: 0.5 }, t + 0.05);
    }
    // keep the timeline length an integer so the last chapter holds
    tl.to({}, { duration: 0.3 });
    return () => { dots.forEach((d) => d.classList.remove('is-on')); };
  });
}

/* ====================================================================== *
 * Horizontal-scroll collection
 * ====================================================================== */
export function initHScroll(mm) {
  const sec = $('[data-hscroll]');
  if (!sec) return;
  const pin = $('[data-hpin]', sec), track = $('[data-htrack]', sec), bar = $('.hscroll__bar i', sec);
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const gs = g();
    sec.classList.remove('is-native');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft) * 1);
    gs.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => { if (bar) bar.style.transform = `scaleX(${self.progress})`; } } });
  });
  // Narrow screens and reduced motion: a native, snap-scrolling strip.
  mm.add('(max-width: 899px), (prefers-reduced-motion: reduce)', () => { sec.classList.add('is-native'); if (bar) bar.parentElement.style.display = 'none'; return () => { if (bar) bar.parentElement.style.display = ''; }; });
}

export function initTimelineLine(mm) {
  const tl = $('#tl'); if (!tl) return;
  const line = $('.tl__line', tl);
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    g().fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 60%', scrub: true } });
  });
  mm.add('(prefers-reduced-motion: reduce)', () => { g().set(line, { scaleY: 1 }); });
}

/* ====================================================================== *
 * Pointer effects (fine pointers only): cursor, magnetic buttons, tilt
 * ====================================================================== */
export function initPointerFX() {
  const gs = g();
  if (!gs || reducedMotion() || !finePointer()) return;
  const cur = $('.cursor');
  const html = document.documentElement;
  if (cur) {
    html.classList.add('has-cursor');
    const xTo = gs.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gs.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
    addEventListener('pointermove', (e) => { cur.classList.add('is-on'); xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest?.('[data-cursor]');
      if (t) { cur.textContent = t.dataset.cursorLabel || 'Explore'; cur.classList.add('is-big'); }
    });
    document.addEventListener('pointerout', (e) => {
      const t = e.target.closest?.('[data-cursor]');
      if (t && !t.contains(e.relatedTarget)) { cur.classList.remove('is-big'); cur.textContent = ''; }
    });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
  }
  // Magnetic buttons
  document.addEventListener('pointermove', (e) => {
    const m = e.target.closest?.('.magnetic');
    if (!m) return;
    const r = m.getBoundingClientRect();
    gs.to(m, { x: (e.clientX - (r.left + r.width / 2)) * 0.25, y: (e.clientY - (r.top + r.height / 2)) * 0.35, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
  });
  document.addEventListener('pointerout', (e) => {
    const m = e.target.closest?.('.magnetic');
    if (m && !m.contains(e.relatedTarget)) gs.to(m, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
  });
  // Subtle tilt on watch photographs
  document.addEventListener('pointermove', (e) => {
    const t = e.target.closest?.('[data-tilt]');
    if (!t) return;
    const r = t.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    gs.to(t, { rotationY: px * 6, rotationX: -py * 6, transformPerspective: 900, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest?.('[data-tilt]');
    if (t && !t.contains(e.relatedTarget)) gs.to(t, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
  });
}

/* ====================================================================== *
 * Mobile menu links, list refresh
 * ====================================================================== */
export function initMenuMotion() {
  const menu = $('#menu');
  if (!menu || !g() || reducedMotion()) return;
  menu.addEventListener('cv:menu-open', () => {
    g().fromTo($$('a > span', menu), { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'power4.out', stagger: 0.045, delay: 0.1 });
    g().fromTo($$('.menu__label, .menu__cta', menu), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay: 0.3 });
  });
}
/** Cards re-rendered by filters fade up (no ScrollTrigger needed). */
export function initListMotion() {
  document.addEventListener('cv:list-updated', (e) => {
    if (!g() || reducedMotion()) return;
    g().from($$('.pcard, .jcard', e.target), { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.04, ease: 'power3.out', clearProps: 'all' });
    ST()?.refresh();
  });
}

/* ====================================================================== *
 * Video (hero loop, manufacture macro)
 * ====================================================================== */
/**
 * Adds a muted looping <video> over the poster for any section with media from VIDEO[name].
 * Skipped for reduced-motion and data-saver visitors (poster only). Paused when off-screen or by the viewer.
 */
export function initVideos() {
  const targets = [['[data-hero] .hero__media', 'hero', '[data-hero]'], ['[data-video-sec] .media-fill', 'manufacture', '[data-video-sec]']];
  targets.forEach(([boxSel, key, secSel]) => {
    const box = $(boxSel), sec = $(secSel), cfg = VIDEO[key];
    if (!box || !sec || !cfg) return;
    const mobile = innerWidth < 760;
    const mp4 = (mobile && cfg.mp4Mobile) || cfg.mp4;
    if (!mp4 && !cfg.webm) return;                       // no video configured → poster only
    if (reducedMotion() || saveData()) return;           // poster only, no download
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata'; v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
    if (box.querySelector('img')) v.poster = box.querySelector('img').src;
    if (cfg.webm && !mobile) v.insertAdjacentHTML('beforeend', `<source src="${cfg.webm}" type="video/webm">`);
    if (mp4) v.insertAdjacentHTML('beforeend', `<source src="${mp4}" type="video/mp4">`);
    box.append(v);
    v.addEventListener('playing', () => v.classList.add('is-playing'));
    // <source> errors do not bubble: drop the video only if the last candidate fails (so a bad WebM still falls through to MP4).
    const lastSrc = v.querySelector('source:last-of-type');
    (lastSrc || v).addEventListener('error', () => v.remove());
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'car-pause'; btn.textContent = 'Pause video'; btn.setAttribute('aria-pressed', 'false');
    btn.style.cssText = 'position:absolute;left:var(--gutter);bottom:16px;z-index:3;background:rgba(16,19,24,.6);color:var(--porcelain)';
    sec.append(btn);
    let manual = false;
    btn.addEventListener('click', () => { manual = !manual; btn.setAttribute('aria-pressed', String(manual)); btn.textContent = manual ? 'Play video' : 'Pause video'; manual ? v.pause() : v.play().catch(() => {}); });
    new IntersectionObserver(([e]) => { if (manual) return; e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.15 }).observe(sec);
  });
}

/* ====================================================================== *
 * AOS (small secondary elements only: footer columns)
 * ====================================================================== */
export function initAOS() {
  if (window.AOS) window.AOS.init({ once: true, duration: 700, easing: 'ease-out-cubic', offset: 40, disable: () => reducedMotion() });
}

/* ====================================================================== *
 * Orchestrator
 * ====================================================================== */
export async function initMotion() {
  const gs = g();
  const html = document.documentElement;
  if (!gs || !ST() || reducedMotion()) {
    html.classList.remove('motion-pending', 'has-pre', 'pt-in');
    initAOS();
    // Still wire non-animated pieces
    initClock(); initVideos();
    $$('[data-count]').forEach((el) => { el.textContent = Number(el.dataset.count).toLocaleString('en'); });
    initStory({ add: (q, fn) => { if (q.includes('reduce)') && !q.includes('no-preference')) fn(); } });
    initHScroll({ add: (q, fn) => { if (q.includes('max-width')) fn(); } });
    return;
  }
  gs.registerPlugin(ST());
  initLenis();
  const mm = gs.matchMedia();
  const title = $('[data-hero-title]');
  const ready = Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 700))]);
  await ready;
  initSplits(title);
  initReveals();
  initCounters();
  initParallax(mm);
  initStory(mm);
  initHScroll(mm);
  initTimelineLine(mm);
  initPointerFX();
  initMenuMotion();
  initListMotion();
  initTransitions();
  initClock();
  initVideos();
  initAOS();
  html.classList.remove('motion-pending');   // initial hidden states are now applied by GSAP itself
  await enter();
  heroIntro();
  // Layout settles as images arrive: refresh trigger positions once everything has loaded.
  addEventListener('load', () => ST().refresh());
}
