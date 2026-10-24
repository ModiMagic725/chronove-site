/**
 * UI behaviour that does not depend on GSAP: header, menus, favourites, forms,
 * image fallbacks and media hot-refresh. Everything here works with JavaScript animation libraries absent.
 */
import { $, $$, lockScroll, trapFocus, scrollTo, store, debounce } from './utils.js';
import { render } from './templates.js';
import { mediaHash } from './media.js';

/* ---------- Images: replace a failed URL with the labelled placeholder ---------- */
export function initImageFallback() {
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const fb = img.dataset.fallback;
    if (!fb || img.dataset.failed) return;
    img.dataset.failed = '1';
    const pic = img.closest('picture');
    if (pic) $$('source', pic).forEach((s) => s.remove());
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = fb;
    img.dataset.placeholder = '1';
  }, true);
}

/* ---------- Media hot-refresh: pre-built blocks vs js/media.js ---------- */
/** If media.js changed since the HTML was generated, redraw every data-render block from the live config. */
export function hydrateMedia() {
  if (document.body.dataset.media === mediaHash()) return false;
  $$('[data-render]').forEach((el) => { try { el.innerHTML = render(el.dataset.render); } catch (err) { console.warn(err); } });
  return true;
}

/* ---------- Header: solid on scroll, hide on scroll down, progress line ---------- */
export function initHeader() {
  const hdr = $('[data-hdr]');
  if (!hdr) return;
  const bar = $('.hdr__progress', hdr);
  let lastY = window.scrollY, ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY, dy = y - lastY;
    hdr.classList.toggle('is-solid', y > 24);
    const menuOpen = $('#menu')?.classList.contains('is-open');
    if (!menuOpen) {
      if (dy > 6 && y > 240) hdr.classList.add('is-hidden');
      else if (dy < -6 || y < 120) hdr.classList.remove('is-hidden');
    }
    if (Math.abs(dy) > 6) lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  hdr.addEventListener('focusin', () => hdr.classList.remove('is-hidden'));
  update();
}

/* ---------- Desktop dropdowns ---------- */
export function initDropdowns() {
  const groups = $$('.nav-group');
  const closeAll = (except) => groups.forEach((g) => { const b = $('.nav-btn', g); if (b !== except) b.setAttribute('aria-expanded', 'false'); });
  groups.forEach((g) => {
    const b = $('.nav-btn', g);
    b.addEventListener('click', () => { const open = b.getAttribute('aria-expanded') === 'true'; closeAll(b); b.setAttribute('aria-expanded', String(!open)); });
    g.addEventListener('keydown', (e) => { if (e.key === 'Escape') { b.setAttribute('aria-expanded', 'false'); b.focus(); } });
    g.addEventListener('focusout', (e) => { if (!g.contains(e.relatedTarget)) b.setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav-group')) closeAll(); });
}

/* ---------- Mobile full-screen menu ---------- */
export function initMenu() {
  const btn = $('.burger'), menu = $('#menu');
  if (!btn || !menu) return;
  let release = null;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    lockScroll(open);
    if (open) { release = trapFocus(document.body); menu.dispatchEvent(new CustomEvent('cv:menu-open', { bubbles: true })); $('a', menu)?.focus(); }
    else { release?.(); release = null; }
    $('#main')?.toggleAttribute('inert', open);
    $('footer')?.toggleAttribute('inert', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { set(false); btn.focus(); } });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => { if (menu.classList.contains('is-open')) { menu.classList.remove('is-open'); } }));
  matchMedia('(min-width: 1000px)').addEventListener('change', (e) => { if (e.matches && menu.classList.contains('is-open')) set(false); });
}

/* ---------- Favourites ---------- */
const FAV_KEY = 'cv-fav';
const favs = new Set(store.get(FAV_KEY, []));
export function syncFavs(root = document) {
  $$('[data-fav]', root).forEach((b) => b.setAttribute('aria-pressed', String(favs.has(b.dataset.fav))));
}
export function initFavourites() {
  syncFavs();
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    const s = b.dataset.fav;
    favs.has(s) ? favs.delete(s) : favs.add(s);
    store.set(FAV_KEY, [...favs]);
    syncFavs();
    const name = b.getAttribute('aria-label').replace(/^(Add|Remove) /, '').replace(/ (to|from) favourites$/, '');
    b.setAttribute('aria-label', `${favs.has(s) ? 'Remove' : 'Add'} ${name} ${favs.has(s) ? 'from' : 'to'} favourites`);
  });
}

/* ---------- Product cards: the photo acts as the card link ----------
 * The photo sits above the card-wide link overlay so the favourite button stays clickable,
 * so clicks on the photo itself are forwarded to the real <a> (keeping page transitions and middle-click-free semantics). */
export function initCardLinks() {
  document.addEventListener('click', (e) => {
    const w = e.target.closest('.pcard .wimg');
    if (!w || e.target.closest('button, a')) return;
    w.closest('.pcard').querySelector('.pcard__link')?.click();
  });
}

/* ---------- Demo forms (newsletter, contact, configurator) ---------- */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export function validateForm(form) {
  const errors = [];
  $$('[required]', form).forEach((el) => {
    el.removeAttribute('aria-invalid');
    const v = el.value.trim(), label = el.dataset.label || el.name || 'This field';
    let msg = '';
    if (!v) msg = `${label} is required.`;
    else if (el.type === 'email' && !EMAIL.test(v)) msg = 'Enter an email address like name@example.com.';
    else if (el.dataset.min && v.length < Number(el.dataset.min)) msg = `${label} needs at least ${el.dataset.min} characters.`;
    if (msg) { el.setAttribute('aria-invalid', 'true'); errors.push([el, msg]); }
  });
  return errors;
}
export function initForms() {
  $$('form[data-demo-form]').forEach((form) => {
    const status = $('.status', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const errs = validateForm(form);
      if (errs.length) { status.className = 'status err'; status.textContent = errs.map((x) => x[1]).join(' '); errs[0][0].focus(); return; }
      status.className = 'status';
      status.textContent = 'Thank you. This is a demonstration, so nothing was sent or stored.';
      form.reset();
    });
  });
}

/* ---------- Back to top ---------- */
export function initBackToTop() {
  $$('[data-top]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); scrollTo(0, { duration: 1.2 }); }));
}

/** Wire everything that needs no animation library. */
/* ---------- Back navigation ---------- */
export function initBack() {
  // The browser's Back/Forward cache can hand us the page frozen mid-animation. The animation libraries were torn
  // down on pagehide (ScrollTriggers killed, pins undone), so the only reliable recovery is a clean reload.
  addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });
  // <a data-back> goes one step back when the previous page belongs to this site, otherwise it follows its own href.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-back]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    let internal = false;
    try { internal = !!document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1; } catch { /* keep the href */ }
    if (internal) { e.preventDefault(); history.back(); }
  });
}

export function initUI() {
  initBack();
  initImageFallback();
  hydrateMedia();
  initHeader(); initDropdowns(); initMenu(); initFavourites(); initCardLinks(); initForms(); initBackToTop();
}
