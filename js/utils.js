/** Small shared helpers. No dependencies. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** True when the visitor asked the OS for less motion. Read once; re-read via `reducedMotion()` for live checks. */
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Mouse-like pointer that can hover (gates the custom cursor, tilt and magnetic effects). */
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
/** Visitor asked the browser to save data (also true on some slow connections). */
export const saveData = () => !!(navigator.connection && (navigator.connection.saveData || /(^|-)2g$/.test(navigator.connection.effectiveType || '')));

export function debounce(fn, ms = 150) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/** Shared mutable state between modules (e.g. the Lenis instance owned by motion.js). */
export const state = { lenis: null, scrollLocked: 0 };

/**
 * Lock or unlock page scroll (menu, lightbox). Uses Lenis when present, otherwise plain overflow.
 * Calls are counted so nested overlays do not unlock each other.
 */
export function lockScroll(lock) {
  state.scrollLocked = Math.max(0, state.scrollLocked + (lock ? 1 : -1));
  const on = state.scrollLocked > 0;
  if (state.lenis) on ? state.lenis.stop() : state.lenis.start();
  document.documentElement.style.overflow = on ? 'hidden' : '';
}

/** Scroll to a target (element or y), using Lenis if running. */
export function scrollTo(target, opts = {}) {
  if (state.lenis) state.lenis.scrollTo(target, opts);
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

/** Trap Tab focus inside `root` until the returned function is called. */
export function trapFocus(root) {
  const sel = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    const f = $$(sel, root).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}

/** Resolves once the third-party libraries on this page have loaded (or failed). Safe to await anywhere. */
export const libsReady = () => window.CV_LIBS_READY || Promise.resolve();

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** localStorage that never throws (private mode, blocked storage). */
export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
};
