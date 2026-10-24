# AUDIT

Honest record of what was checked, how, and what was **not**. Environment: headless Chromium 141 (Playwright 1.56) with software WebGL, in a sandbox that could reach only the npm registry (no CDNs, Google Fonts, Unsplash, Pexels or Pixabay).

## Original site (before)
| Finding | How found |
|---|---|
| `movement-engine.html` throws `ReferenceError: base is not defined`; the 3D engine never ran | Loaded in real Chromium. The old jsdom tests (46 passing) could not catch it. |
| All 9 watches were the same canvas circle in different colours; the gallery was `toDataURL` screenshots of that canvas | Read `core.js`, screenshots |
| `specs()` produced diameter/power reserve by formula | Read `core.js` |
| 7 flat nav links, no hamburger, no active state, 15-link footer | Screenshots at 375/768/1440 |

## Verified in this build (commands and results)
| Check | Command | Result |
|---|---|---|
| Static checks (data integrity, links, formatting, pinned CDN versions + SRI, vendor files, disclaimer once) | `node test.js` | 895 passed, 0 failed |
| Console errors, all 15 pages, desktop + mobile | `npx playwright test tests/pages.spec.js` and crawl | 0 errors (Google Fonts request is blocked in the sandbox and was ignored) |
| Horizontal overflow at 320/375/768/1440 on all pages | `tests/layout.spec.js` | passing |
| Axe (WCAG 2.1 A/AA + best-practice), 15 pages × desktop + mobile | `tests/a11y.spec.js` | 0 violations desktop and mobile (re-run after the last refactor) |
| CDN failure → `/vendor` fallback; page still works | `tests/a11y.spec.js` (offline test) | passes; all libraries report `local` |
| Nav: 5 grouped links + CTA, active state, dropdown keyboard, mobile full-screen menu with focus trap, hide-on-scroll, page transition | `tests/nav.spec.js` | passing |
| Carousels: Swiper coverflow (progress bar, keyboard, a11y, autoplay, pause), Splide free-drag + snap, Owl (jQuery 3), gallery + thumbs sync, lightbox with Zoom | `tests/carousels.spec.js` | passing |
| Motion on/off: Lenis, pins, split text, counters, preloader once per session, reduced-motion disables all | `tests/motion.spec.js` | passing |
| Hero video markup: poster, muted, playsinline, preload=metadata, aria-hidden, pause button; not created for reduced motion | `tests/motion.spec.js` (inspected synchronously with test URLs) | passing |
| WebGL engine renders lit pixels (119 draw calls, ~124k triangles), layer pick and explode work, text fallback without WebGL | `tests/engine.spec.js` | passing when run serially |
| Lighthouse (mobile, simulated throttling) | `npm run lighthouse` | Accessibility 96 / 100, Best practices 96, SEO 100. **Performance 52 (home), 81 (watch): below the 90 target.** |

### Bugs found by the tests and fixed
Preloader curtain covering every page after the first · favourite button unclickable (overlay) · a failing WebM would delete the whole video · "8 Hz" shown for a 4 Hz calibre (vph/3600 instead of /7200) · wrong beat-rate and escape-wheel arithmetic in copy · 2D-canvas colour mismatches · header burger clipped on 375 px · placeholder text overlapping hero copy · lugs extruded into the case and floating crystal in the 3D model · a syntax error from my own edit.

## Not verified / known gaps
- **Performance target missed.** Home 52, watch 81. Causes measured: hero text is the LCP (revealed by animation after preloader + libraries), main-thread time in GSAP/ScrollTrigger setup, and 65 KB of inlined placeholder images. The hero placeholder is a low-entropy gradient, which Chrome never counts as LCP, so numbers with real photos will differ. Ideas not yet done: make hero text visible before the intro, drop the preloader, defer ScrollTrigger setup further, ship fewer libraries on the home page.
- **Real CDN delivery and SRI hashes against the live CDN** were not tested (hashes computed from npm files; a mismatch falls back to `vendor/`).
- **Google Fonts** not loaded in the sandbox, so screenshots show fallback serif.
- **Real photos and video**: none included (see README, `MEDIA_BRIEF.md`). Image/video behaviour was tested with placeholders and synthetic URLs only. No licence-verified URLs exist because no image host was reachable.
- **Real-GPU frame rate** not measured (software GL only). Adaptive quality exists but is untested on devices.
- **Barba.js** not used; a custom wipe is used instead.
- Open Graph image `og.png` is a brand card, not a photo. `SITE_URL` is a placeholder (`chronove.example`).
- Watch/article pages are client-rendered from data (`?m=slug`), which is weaker for SEO than 9 static pages.

## Final test run
The full 61-test Playwright suite was run, then failures were fixed and the affected specs re-run: carousels, features, engine, layout (all 4 widths), a11y (desktop + mobile), pages, nav and motion all pass in their last runs. The suite was **not** re-run as one single pass after the final two small fixes (reduced-motion autoplay, engine start deferral); each was verified by re-running the affected specs. Engine tests must run serially (software GL in this sandbox), which `tests/engine.spec.js` configures.
Before/after screenshots are in `screenshots/` (the "before" movement-engine page is the crash state of the original).
