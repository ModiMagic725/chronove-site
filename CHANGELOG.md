# Changelog — 2.0.1

**Fixed — Back button:** returning to a page with the browser's Back button (or a swipe-back on mobile) could leave it half-working. The browser restored the page from its back/forward cache, but `motion.js` had already torn down every ScrollTrigger on `pagehide`, so pins, reveals and the page height were broken. `ui.js` (`initBack`) now reloads the page cleanly when it is restored from that cache.
**Added — visible Back link** on the watch page and the article page (`a[data-back]`): one step back in history when the previous page is on this site, otherwise it goes to Collections / Journal.
**Fixed — missing watch images:** every one of the 54 watch slots (9 models × 6 views) was empty, so only placeholders showed. `images/watches/` now holds 54 images, wired into `js/media.js`. They are illustrations rendered from the data in `js/data.js` (case metal, dial, strap and complications per model), not photographs. Re-generate with `python3 tools/render-watch-images.py` (renderer: `tools/watch-art.html`) or replace any path in `js/media.js` with a real photo URL.
**Tools:** `npm run verify:media` now also checks local file paths. Pages were rebuilt with `npm run build:pages`.

# Changelog — 2.0.0

**Media:** removed every canvas-drawn watch; all watch imagery now comes from URL slots in `js/media.js` (6 views per model, hero/manufacture video + posters), with AVIF/WebP/srcset for supported hosts, aspect-ratio boxes, lazy loading, labelled placeholders and failure fallback. `MEDIA_BRIEF.md` has shot list and prompts.
**Motion:** Lenis + ScrollTrigger, preloader (first visit only), page wipe transitions, split-text reveals, parallax, pinned scroll story, horizontal-scroll collections, clip-path image reveals, counters, magnetic buttons, custom cursor, card tilt + second-angle crossfade, AOS for the footer only. Full reduced-motion support.
**Carousels:** Swiper coverflow (home), Splide strap strip (home), Owl Carousel + jQuery 3 (journal), Swiper main + thumbs gallery and Zoom lightbox (watch).
**Navigation:** 5 grouped links, Enquire CTA, full-screen mobile menu, active state, hide-on-scroll, progress line, richer footer with newsletter demo, disclaimer once.
**Content:** real per-model specs in `data.js`, 3–4 paragraphs per watch and per page, six journal essays, per-page art direction, new Configurator/Materials/Complications/Timekeeping tools (SVG, no canvas).
**3D:** Movement Engine rewritten with PBR materials, studio environment map, bevelled lathe case, brushed roughness, transmissive sapphire, soft shadows, adaptive quality, WebGL fallback. Fixes the original `base is not defined` crash.
**Code:** readable, commented ES modules; pinned CDN versions + SRI + local `vendor/` fallback; page generator; sitemap, robots, favicon, OG/Twitter meta.
**Tests:** 895 static checks and a 61-test Playwright suite (console errors, overflow at 4 widths, nav, carousels, motion, axe, engine, offline fallback); Lighthouse runner.
**Fixed during testing:** preloader covering later pages, unclickable favourite button, video removed on one bad source, wrong Hz maths (vph/3600), reduced-motion autoplay leak, burger clipping, and more (see AUDIT.md).
