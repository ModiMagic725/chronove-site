# CHRONOVÉ — Media brief

Everything below is for **you** to generate or source the photography and film the site is built to show.
The site needs **no code changes**: paste each finished image/video URL into `js/media.js`
(`WATCH_IMAGES`, `SCENES`, `VIDEO`) and run `npm run verify:media`.

> I could not fetch real photographs from Unsplash, Pexels or Pixabay while building this (those hosts are not
> reachable from my sandbox), so I did not invent any URLs. Empty slots show a labelled dark placeholder.

## 1. Where to host
Any HTTPS URL that returns an `image/*` or `video/*` content-type works. Unsplash and Pexels URLs get automatic
AVIF/WebP/srcset variants (Unsplash) or width-resized JPEG (Pexels). For anything else, upload **pre-sized WebP or JPEG**
(1600 px wide recommended) to your own storage or a CDN.
Use only licences that allow commercial use, and record the photographer and licence URL in `CREDITS.md`.

## 2. Shot list (per watch) and exact sizes
| Slot key | View | Size (px) | Aspect | Notes |
|---|---|---|---|---|
| `hero` | Product on dark stone, dial facing camera, 12 o'clock up | 1600 × 2000 | 4:5 | Shown on cards, coverflow, gallery #1, configurator |
| `threeQuarter` | 3/4 angle, crown visible | 1600 × 2000 | 4:5 | Crossfades in on card hover |
| `side` | Profile showing case thickness and crown | 1600 × 2000 | 4:5 | |
| `caseback` | Sapphire caseback, movement visible | 1600 × 2000 | 4:5 | Also used in the pinned story (Equinox) |
| `dial` | Macro of the dial, shallow depth of field | 1600 × 2000 | 4:5 | Also used in the pinned story (Equinox) |
| `wrist` | On the wrist, dark clothing, soft rim light | 1600 × 2000 | 4:5 | |

Grading: low-key, cool-neutral shadows, a single warm highlight. The site adds a dark gradient and slight desaturation in CSS, so
**do not pre-darken** the files. Keep the watch away from the edges (cards crop with `object-fit: cover`).

Other slots in `SCENES`: page headers 2400 × 1350 (16:9); manufacture stages, heritage bench/archive, straps 1600 × 2000 (4:5);
journal covers 1800 × 1200 (3:2). Videos: see section 5.

## 3. Shared prompt parts
**Style block (append to every watch prompt):**
`photographed on a 100mm macro lens, f/8, softbox key light from upper left, narrow strip light for edge highlights, dark slate and black marble surface, low-key luxury product photography, true-to-life metal reflections, sharp focus on dial, subtle film grain, 4:5 vertical`

**Negative prompt (use everywhere):**
`cartoon, illustration, 3d render look, flat vector, CGI plastic, text, watermark, logo, brand names, lettering artefacts, distorted hands, extra fingers, warped dial, duplicated hands, asymmetrical lugs, melted indices, blurry, low resolution, oversaturated, fisheye`

Midjourney: add `--ar 4:5 --style raw --s 150 --no cartoon, illustration, text, watermark, distorted hands`.
Flux: use the style block and negative prompt as-is, guidance 3.5. Veo / Kling / Runway: use the video prompts in section 5.

## 4. The nine watches

### Meridian — `meridian` (Classic)
- **Product on dark stone (`hero`)**: `a 38 mm luxury wristwatch, polished and brushed stainless steel case, porcelain-white dial (grained porcelain-white, applied steel indices), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, small seconds, standing upright on black slate, dial facing camera, 12 o'clock at top, hands at 10:10, {STYLE}`
- **3/4 angle (`threeQuarter`)**: `a 38 mm luxury wristwatch, polished and brushed stainless steel case, porcelain-white dial (grained porcelain-white, applied steel indices), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, small seconds, three-quarter view from the crown side, crown and lugs sharp, reflections along the bevel, {STYLE}`
- **Macro dial (`dial`)**: `extreme macro of the porcelain-white dial of a luxury watch, grained porcelain-white, applied steel indices, applied indices catching light, hands crisp, shallow depth of field, {STYLE}`
- **Wrist shot (`wrist`)**: `a 38 mm luxury wristwatch, polished and brushed stainless steel case, porcelain-white dial (grained porcelain-white, applied steel indices), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, small seconds, worn on a wrist, dark charcoal sleeve, soft window rim light, natural skin, relaxed hand with five correct fingers, {STYLE}`
- **Exploded movement (`caseback`)**: `exploded technical photograph of a mechanical watch movement for a 38 mm watch, plate, gear train, balance wheel, bridge with perlage, ruby jewels floating on black, symmetric layers, {STYLE}`

### Aperture — `aperture` (Skeleton)
- **Product on dark stone (`hero`)**: `a 39.5 mm luxury wristwatch, matte bead-blasted grey titanium case, midnight-black dial (open-worked, midnight-black chapter ring), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, standing upright on black slate, dial facing camera, 12 o'clock at top, hands at 10:10, {STYLE}`
- **3/4 angle (`threeQuarter`)**: `a 39.5 mm luxury wristwatch, matte bead-blasted grey titanium case, midnight-black dial (open-worked, midnight-black chapter ring), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, three-quarter view from the crown side, crown and lugs sharp, reflections along the bevel, {STYLE}`
- **Macro dial (`dial`)**: `extreme macro of the midnight-black dial of a luxury watch, open-worked, midnight-black chapter ring, applied indices catching light, hands crisp, shallow depth of field, {STYLE}`
- **Wrist shot (`wrist`)**: `a 39.5 mm luxury wristwatch, matte bead-blasted grey titanium case, midnight-black dial (open-worked, midnight-black chapter ring), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, worn on a wrist, dark charcoal sleeve, soft window rim light, natural skin, relaxed hand with five correct fingers, {STYLE}`
- **Exploded movement (`caseback`)**: `exploded technical photograph of a mechanical watch movement for a 39.5 mm watch, plate, gear train, balance wheel, bridge with perlage, ruby jewels floating on black, symmetric layers, {STYLE}`

### Tidal 300 — `tidal-300` (Sport)
- **Product on dark stone (`hero`)**: `a 42 mm luxury wristwatch, matte bead-blasted grey titanium case, deep navy sunburst dial (sunburst navy, lume-filled indices), black ventilated rubber strap, complications: hours, minutes, seconds, standing upright on black slate, dial facing camera, 12 o'clock at top, hands at 10:10, {STYLE}`
- **3/4 angle (`threeQuarter`)**: `a 42 mm luxury wristwatch, matte bead-blasted grey titanium case, deep navy sunburst dial (sunburst navy, lume-filled indices), black ventilated rubber strap, complications: hours, minutes, seconds, three-quarter view from the crown side, crown and lugs sharp, reflections along the bevel, {STYLE}`
- **Macro dial (`dial`)**: `extreme macro of the deep navy sunburst dial of a luxury watch, sunburst navy, lume-filled indices, applied indices catching light, hands crisp, shallow depth of field, {STYLE}`
- **Wrist shot (`wrist`)**: `a 42 mm luxury wristwatch, matte bead-blasted grey titanium case, deep navy sunburst dial (sunburst navy, lume-filled indices), black ventilated rubber strap, complications: hours, minutes, seconds, worn on a wrist, dark charcoal sleeve, soft window rim light, natural skin, relaxed hand with five correct fingers, {STYLE}`
- **Exploded movement (`caseback`)**: `exploded technical photograph of a mechanical watch movement for a 42 mm watch, plate, gear train, balance wheel, bridge with perlage, ruby jewels floating on black, symmetric layers, {STYLE}`

### Equinox — `equinox` (Complications)
- **Product on dark stone (`hero`)**: `a 40 mm luxury wristwatch, warm champagne-gold alloy case, midnight-black dial (midnight enamel with gold moon-phase aperture), dark brown vegetable-tanned calf leather strap, complications: annual calendar, moon phase, day and month apertures, standing upright on black slate, dial facing camera, 12 o'clock at top, hands at 10:10, {STYLE}`
- **3/4 angle (`threeQuarter`)**: `a 40 mm luxury wristwatch, warm champagne-gold alloy case, midnight-black dial (midnight enamel with gold moon-phase aperture), dark brown vegetable-tanned calf leather strap, complications: annual calendar, moon phase, day and month apertures, three-quarter view from the crown side, crown and lugs sharp, reflections along the bevel, {STYLE}`
- **Macro dial (`dial`)**: `extreme macro of the midnight-black dial of a luxury watch, midnight enamel with gold moon-phase aperture, applied indices catching light, hands crisp, shallow depth of field, {STYLE}`
- **Wrist shot (`wrist`)**: `a 40 mm luxury wristwatch, warm champagne-gold alloy case, midnight-black dial (midnight enamel with gold moon-phase aperture), dark brown vegetable-tanned calf leather strap, complications: annual calendar, moon phase, day and month apertures, worn on a wrist, dark charcoal sleeve, soft window rim light, natural skin, relaxed hand with five correct fingers, {STYLE}`
- **Exploded movement (`caseback`)**: `exploded technical photograph of a mechanical watch movement for a 40 mm watch, plate, gear train, balance wheel, bridge with perlage, ruby jewels floating on black, symmetric layers, {STYLE}`

### Axiom — `axiom` (Classic)
- **Product on dark stone (`hero`)**: `a 39 mm luxury wristwatch, polished and brushed stainless steel case, brushed graphite dial (brushed graphite, printed railway minute track), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, seconds, standing upright on black slate, dial facing camera, 12 o'clock at top, hands at 10:10, {STYLE}`
- **3/4 angle (`threeQuarter`)**: `a 39 mm luxury wristwatch, polished and brushed stainless steel case, brushed graphite dial (brushed graphite, printed railway minute track), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, seconds, three-quarter view from the crown side, crown and lugs sharp, reflections along the bevel, {STYLE}`
- **Macro dial (`dial`)**: `extreme macro of the brushed graphite dial of a luxury watch, brushed graphite, printed railway minute track, applied indices catching light, hands crisp, shallow depth of field, {STYLE}`
- **Wrist shot (`wrist`)**: `a 39 mm luxury wristwatch, polished and brushed stainless steel case, brushed graphite dial (brushed graphite, printed railway minute track), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, seconds, worn on a wrist, dark charcoal sleeve, soft window rim light, natural skin, relaxed hand with five correct fingers, {STYLE}`
- **Exploded movement (`caseback`)**: `exploded technical photograph of a mechanical watch movement for a 39 mm watch, plate, gear train, balance wheel, bridge with perlage, ruby jewels floating on black, symmetric layers, {STYLE}`

### Regatta — `regatta` (Sport)
- **Product on dark stone (`hero`)**: `a 41 mm luxury wristwatch, polished and brushed stainless steel case, deep navy sunburst dial (matte navy with coloured countdown sector), black ventilated rubber strap, complications: five-minute regatta countdown, date, standing upright on black slate, dial facing camera, 12 o'clock at top, hands at 10:10, {STYLE}`
- **3/4 angle (`threeQuarter`)**: `a 41 mm luxury wristwatch, polished and brushed stainless steel case, deep navy sunburst dial (matte navy with coloured countdown sector), black ventilated rubber strap, complications: five-minute regatta countdown, date, three-quarter view from the crown side, crown and lugs sharp, reflections along the bevel, {STYLE}`
- **Macro dial (`dial`)**: `extreme macro of the deep navy sunburst dial of a luxury watch, matte navy with coloured countdown sector, applied indices catching light, hands crisp, shallow depth of field, {STYLE}`
- **Wrist shot (`wrist`)**: `a 41 mm luxury wristwatch, polished and brushed stainless steel case, deep navy sunburst dial (matte navy with coloured countdown sector), black ventilated rubber strap, complications: five-minute regatta countdown, date, worn on a wrist, dark charcoal sleeve, soft window rim light, natural skin, relaxed hand with five correct fingers, {STYLE}`
- **Exploded movement (`caseback`)**: `exploded technical photograph of a mechanical watch movement for a 41 mm watch, plate, gear train, balance wheel, bridge with perlage, ruby jewels floating on black, symmetric layers, {STYLE}`

### Solstice — `solstice` (Limited Editions)
- **Product on dark stone (`hero`)**: `a 38.5 mm luxury wristwatch, warm champagne-gold alloy case, porcelain-white dial (grand-feu enamel, hand-painted roman numerals), hand-stitched dark brown calf leather strap, complications: hours, minutes, small seconds, standing upright on black slate, dial facing camera, 12 o'clock at top, hands at 10:10, {STYLE}`
- **3/4 angle (`threeQuarter`)**: `a 38.5 mm luxury wristwatch, warm champagne-gold alloy case, porcelain-white dial (grand-feu enamel, hand-painted roman numerals), hand-stitched dark brown calf leather strap, complications: hours, minutes, small seconds, three-quarter view from the crown side, crown and lugs sharp, reflections along the bevel, {STYLE}`
- **Macro dial (`dial`)**: `extreme macro of the porcelain-white dial of a luxury watch, grand-feu enamel, hand-painted roman numerals, applied indices catching light, hands crisp, shallow depth of field, {STYLE}`
- **Wrist shot (`wrist`)**: `a 38.5 mm luxury wristwatch, warm champagne-gold alloy case, porcelain-white dial (grand-feu enamel, hand-painted roman numerals), hand-stitched dark brown calf leather strap, complications: hours, minutes, small seconds, worn on a wrist, dark charcoal sleeve, soft window rim light, natural skin, relaxed hand with five correct fingers, {STYLE}`
- **Exploded movement (`caseback`)**: `exploded technical photograph of a mechanical watch movement for a 38.5 mm watch, plate, gear train, balance wheel, bridge with perlage, ruby jewels floating on black, symmetric layers, {STYLE}`

### Lattice — `lattice` (Skeleton)
- **Product on dark stone (`hero`)**: `a 40 mm luxury wristwatch, warm champagne-gold alloy case, brushed graphite dial (graphite-toned open lattice with gold-coloured bridges), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, standing upright on black slate, dial facing camera, 12 o'clock at top, hands at 10:10, {STYLE}`
- **3/4 angle (`threeQuarter`)**: `a 40 mm luxury wristwatch, warm champagne-gold alloy case, brushed graphite dial (graphite-toned open lattice with gold-coloured bridges), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, three-quarter view from the crown side, crown and lugs sharp, reflections along the bevel, {STYLE}`
- **Macro dial (`dial`)**: `extreme macro of the brushed graphite dial of a luxury watch, graphite-toned open lattice with gold-coloured bridges, applied indices catching light, hands crisp, shallow depth of field, {STYLE}`
- **Wrist shot (`wrist`)**: `a 40 mm luxury wristwatch, warm champagne-gold alloy case, brushed graphite dial (graphite-toned open lattice with gold-coloured bridges), dark brown vegetable-tanned calf leather strap, complications: hours, minutes, worn on a wrist, dark charcoal sleeve, soft window rim light, natural skin, relaxed hand with five correct fingers, {STYLE}`
- **Exploded movement (`caseback`)**: `exploded technical photograph of a mechanical watch movement for a 40 mm watch, plate, gear train, balance wheel, bridge with perlage, ruby jewels floating on black, symmetric layers, {STYLE}`

### Perpetua — `perpetua` (Complications)
- **Product on dark stone (`hero`)**: `a 39.5 mm luxury wristwatch, polished and brushed stainless steel case, midnight-black dial (midnight lacquer, silver-toned sub-dials), dark brown vegetable-tanned calf leather strap, complications: perpetual calendar, moon phase, leap-year indicator, standing upright on black slate, dial facing camera, 12 o'clock at top, hands at 10:10, {STYLE}`
- **3/4 angle (`threeQuarter`)**: `a 39.5 mm luxury wristwatch, polished and brushed stainless steel case, midnight-black dial (midnight lacquer, silver-toned sub-dials), dark brown vegetable-tanned calf leather strap, complications: perpetual calendar, moon phase, leap-year indicator, three-quarter view from the crown side, crown and lugs sharp, reflections along the bevel, {STYLE}`
- **Macro dial (`dial`)**: `extreme macro of the midnight-black dial of a luxury watch, midnight lacquer, silver-toned sub-dials, applied indices catching light, hands crisp, shallow depth of field, {STYLE}`
- **Wrist shot (`wrist`)**: `a 39.5 mm luxury wristwatch, polished and brushed stainless steel case, midnight-black dial (midnight lacquer, silver-toned sub-dials), dark brown vegetable-tanned calf leather strap, complications: perpetual calendar, moon phase, leap-year indicator, worn on a wrist, dark charcoal sleeve, soft window rim light, natural skin, relaxed hand with five correct fingers, {STYLE}`
- **Exploded movement (`caseback`)**: `exploded technical photograph of a mechanical watch movement for a 39.5 mm watch, plate, gear train, balance wheel, bridge with perlage, ruby jewels floating on black, symmetric layers, {STYLE}`

(Replace `{STYLE}` with the style block from section 3.)

## 5. Hero and manufacture videos
Deliver each as **WebM (VP9) + MP4 (H.264)**, plus a **mobile MP4 under 3 MB** (720p, 8–10 s, no audio). Export a 1920 × 1080 **poster** still
from frame 1 (this is shown while loading, for reduced-motion and for data-saver visitors). Loop must be seamless.

| Slot | Length | Desktop size | Mobile size | Target bitrate |
|---|---|---|---|---|
| `VIDEO.hero` | 8–12 s loop | 1920 × 1080, ≤ 6 MB | 1280 × 720, < 3 MB | 1.5–2 Mbps |
| `VIDEO.manufacture` | 8–12 s loop | 1920 × 1080, ≤ 6 MB | 1280 × 720, < 3 MB | 1.5–2 Mbps |

**Video 1 — Slow macro push-in on the rotating seconds hand** (hero)
`slow dolly push-in, extreme macro on the sweeping seconds hand of a luxury watch with a midnight dial, hand sweeping smoothly clockwise, shallow depth of field, champagne-gold highlights, black background, 24fps cinematic, 10 seconds, seamless loop, no camera shake`

**Video 2 — Light sweep across the sapphire crystal** (manufacture)
`locked-off macro of a domed sapphire crystal over a watch dial, a single soft strip of light slowly sweeping left to right across the glass, revealing the dial beneath, deep black surroundings, subtle dust-free reflections, 10 seconds, smooth, cinematic`

**Video 3 — Slow orbit around a watch on black marble** (alternate hero)
`slow 180-degree orbit around a luxury wristwatch standing on polished black marble, hands ticking, soft key light and thin rim light, reflective marble surface, dark moody studio, 12 seconds, cinematic, stable tripod-like motion`

**Negative prompt (all three):** `cartoon, illustration, 3d render look, flat vector, CGI plastic, text, watermark, logo, brand names, lettering artefacts, distorted hands, extra fingers, warped dial, duplicated hands, asymmetrical lugs, melted indices, blurry, low resolution, oversaturated, fisheye, jump cuts, morphing dial, extra hands, hands moving backwards, flicker`

## 6. After you add media
1. `npm run verify:media` — every URL must print `OK`.
2. Open the site: the placeholder labels disappear automatically.
3. Add one line per asset to `CREDITS.md`.
4. Optional: `npm run build:pages` refreshes the pre-rendered HTML (the browser also refreshes it on load if `js/media.js` changed).
