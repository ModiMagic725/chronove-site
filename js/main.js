/**
 * CHRONOVÉ — entry point (ES module, imported by loader.js once the libraries have settled).
 *
 * Order matters:
 *   1. UI that needs no animation library (header, menus, favourites, forms, image fallback, media refresh)
 *   2. Page-specific DOM (cards, galleries, carousels, tools) so motion can see the final markup
 *   3. Motion (Lenis, ScrollTrigger, split text, pins, cursor, transitions)
 * A failure in one step is logged and never stops the next: the page degrades, it does not break.
 */
import { initUI } from './ui.js';
import { PAGES } from './pages.js';
import { initMotion } from './motion.js';

const page = (window.CV && window.CV.page) || document.body.dataset.page;
const guard = (label, fn) => { try { return fn(); } catch (err) { console.error(`[CHRONOVÉ] ${label} failed:`, err); } };

guard('ui', initUI);
const pending = guard('page ' + page, () => (PAGES[page] ? PAGES[page]() : null));
Promise.resolve(pending).catch((err) => console.error(`[CHRONOVÉ] page ${page} failed:`, err));

(window.CV_LIBS_READY || Promise.resolve())
  .then(() => initMotion())
  .catch((err) => { console.error('[CHRONOVÉ] motion failed:', err); document.documentElement.classList.remove('motion-pending', 'pt-in', 'has-pre'); })
  .finally(() => { document.documentElement.dataset.ready = '1'; });
