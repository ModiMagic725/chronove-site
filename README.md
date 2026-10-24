# CHRONOVÉ

A static, no-build luxury-watch concept site: 15 pages, GSAP + ScrollTrigger + Lenis motion, three carousel libraries, and a PBR Three.js movement viewer.

## Run it
```bash
npm install                      # only needed for tests / tools
npm start                        # → http://localhost:4173  (zero-dependency static server)
```
Opening the HTML files directly from disk (`file://`) will not work, because the scripts are ES modules. Use any static host or `npm start`.

## Photos and video
`js/media.js` is the only place that lists images. The nine watches (six views each) currently use generated illustrations in `images/watches/` (made by `tools/watch-art.html`, re-run with `python3 tools/render-watch-images.py`). To use real photography, replace any path with a direct image URL, reload, then run `npm run verify:media` (checks URLs and local paths).
Scene, header and video slots are still empty and show a labelled dark placeholder. Sizes, shot list and generation prompts are in **`MEDIA_BRIEF.md`**; record licences of any third-party asset in **`CREDITS.md`**.
Unsplash URLs automatically get AVIF/WebP/srcset; Pexels URLs get width-resized JPEG; other hosts and local paths are used as-is.

## Structure
```
index.html … 404.html      15 pages (generated from tools/pages/*.html; edit those, then npm run build:pages)
css/style.css              tokens, type scale, 8-pt spacing, components
js/loader.js               pinned jsDelivr + SRI, 6 s timeout, automatic fallback to /vendor
js/main.js                 entry: UI → page DOM → motion
js/data.js                 MODELS (real per-model specs), articles, materials, timeline
js/media.js                URL slots, <picture> builder, placeholders
js/templates.js            HTML templates shared by browser and page generator
js/ui.js  motion.js  carousels.js  pages.js  engine3d.js
vendor/                    local copies of every library (CDN fallback)
tests/                     Playwright suite        test.js   static checks
tools/                     serve, build-pages, verify-media, sri, lighthouse, watch-art.html + render-watch-images.py
images/watches/            54 generated watch images (9 models × 6 views)
```
Edit copy in `tools/pages/*.html` or `js/data.js`. After editing data, media or templates run `npm run build:pages` (the browser also refreshes pre-built blocks at load if `media.js` changed). Set `SITE_URL=https://yourdomain npm run build:pages` before launch (canonical, Open Graph and sitemap currently use `https://chronove.example`).

## Libraries (pinned)
GSAP 3.12.5 + ScrollTrigger · Lenis 1.1.13 · SplitType 0.3.4 · Swiper 11.1.14 (Coverflow, Thumbs, Zoom) · Splide 4.1.4 · Owl Carousel 2.3.4 + jQuery 3.7.1 · AOS 2.3.4 (footer only) · Three.js r149.
After bumping a version, copy the file into `vendor/`, run `npm run sri`, paste the output into `js/loader.js`.

## Tests
```bash
npm install && npx playwright install chromium
npm test                # static checks, no browser
npm run test:e2e        # Playwright: console errors, overflow 320/375/768/1440, nav, carousels, motion, axe, engine, offline fallback
npm run lighthouse      # performance / accessibility / SEO on index and a watch page
```
`CDN_MODE=local npm run test:e2e` serves the pinned CDN URLs from `node_modules` (useful when offline).

## Notes
- Page transition is a lightweight custom wipe (not Barba) so every page keeps a clean lifecycle; ScrollTriggers are killed before leaving.
- Watch and article pages are rendered from `js/data.js` using `?m=<slug>` / `?a=<slug>`.
- Reduced motion: no Lenis, parallax, pins, split text, cursor, autoplay or video; content is simply visible.
- The Movement Engine is the only page using WebGL/canvas, with adaptive quality and a text fallback when WebGL is missing.
