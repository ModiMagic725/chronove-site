/**
 * All carousels. Each one: touch/drag, keyboard, visible focus, pause control where it autoplays,
 * reduced-motion aware, lazy images.
 *
 *   Swiper v11  → home "Featured" (Coverflow), watch gallery (main + thumbs), lightbox (Zoom, pinch)
 *   Splide v4   → home "Shop by strap and material" (free drag, snap, momentum)
 *   Owl 2       → journal "Collectors’ voices" (needs jQuery 3)
 */
import { $, $$, reducedMotion, lockScroll, trapFocus } from './utils.js';
import { ICON } from './templates.js';

/* ---------- Pause / play helper ---------- */
function wirePause(button, { pause, play }) {
  if (!button) return;
  let paused = false;
  const set = (p) => { paused = p; button.setAttribute('aria-pressed', String(p)); button.textContent = p ? 'Play' : 'Pause'; p ? pause() : play(); };
  button.addEventListener('click', () => set(!paused));
  return set;
}

/* ---------- Home: Swiper Coverflow ---------- */
export function initFeatured() {
  const el = $('#featured');
  if (!el || !window.Swiper) return null;
  const rm = reducedMotion();
  const sw = new window.Swiper(el, {
    effect: rm ? 'slide' : 'coverflow',
    coverflowEffect: { rotate: 22, stretch: 0, depth: 110, modifier: 1, slideShadows: false },
    centeredSlides: true,
    slidesPerView: 'auto',
    spaceBetween: rm ? 20 : 48,
    initialSlide: 3,
    grabCursor: true,
    speed: 700,
    keyboard: { enabled: true, onlyInViewport: true },
    a11y: { enabled: true, prevSlideMessage: 'Previous watch', nextSlideMessage: 'Next watch', slideLabelMessage: 'Watch {{index}} of {{slidesLength}}' },
    pagination: { el: '#feat-progress', type: 'progressbar' },
    navigation: { prevEl: '#feat-prev', nextEl: '#feat-next' },
    autoplay: rm ? false : { delay: 3600, disableOnInteraction: false, pauseOnMouseEnter: true },
    watchSlidesProgress: true,
  });
  // The slides contain links, so the container itself is not a tab stop; arrow keys work inside it.
  const set = wirePause($('#feat-pause'), { pause: () => sw.autoplay?.stop(), play: () => sw.autoplay?.start() });
  if (rm) { $('#feat-pause')?.setAttribute('hidden', ''); }
  // Respect keyboard users: stop autoplay as soon as focus enters the carousel.
  el.addEventListener('focusin', () => { if (sw.autoplay?.running) set?.(true); });
  // Only autoplay while on screen.
  if (!rm) new IntersectionObserver(([e]) => { if (!sw.autoplay || $('#feat-pause')?.getAttribute('aria-pressed') === 'true') return; e.isIntersecting ? sw.autoplay.start() : sw.autoplay.stop(); }).observe(el);
  return sw;
}

/* ---------- Home: Splide strap strip ---------- */
export function initStraps() {
  const el = $('#straps');
  if (!el || !window.Splide) return null;
  const sp = new window.Splide(el, {
    type: 'slide', autoWidth: true, gap: 24, arrows: false, pagination: false, trimSpace: true,
    drag: 'free', snap: true, flickPower: 380, flickMaxPages: 3, keyboard: 'focused', focus: 0,
    i18n: { slide: 'Strap %s of %s', carousel: 'Straps and materials' }, lazyLoad: false,
  });
  sp.mount();
  el.splide = sp;   // handy for tests and debugging
  el.classList.add('is-ready');
  return sp;
}

/* ---------- Journal: Owl Carousel ---------- */
export function initVoices() {
  const el = $('#voices');
  const $j = window.jQuery;
  if (!el || !$j || !$j.fn.owlCarousel) return null;
  const rm = reducedMotion();
  const owl = $j(el).owlCarousel({
    items: 1, margin: 24, loop: true, nav: true, dots: true, navText: ['‹', '›'],
    autoplay: !rm, autoplayTimeout: 6000, autoplayHoverPause: true, smartSpeed: rm ? 0 : 700,
    mouseDrag: true, touchDrag: true, pullDrag: true, lazyLoad: false,
    responsive: { 0: { items: 1 }, 760: { items: 2 }, 1100: { items: 3 } },
  });
  // Owl has no built-in accessibility, so add the missing names and keyboard support.
  // Owl marks its buttons role="presentation", which hides them from assistive tech; remove it and add names.
  $j('.owl-prev, .owl-next, .owl-dot', el).removeAttr('role');
  $j('.owl-prev', el).attr('aria-label', 'Previous voice');
  $j('.owl-next', el).attr('aria-label', 'Next voice');
  $j('.owl-dot', el).each(function (i) { $j(this).attr('aria-label', `Go to voice ${i + 1}`); });
  $j('.owl-item.cloned', el).attr('aria-hidden', 'true');
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { owl.trigger('prev.owl.carousel'); e.preventDefault(); }
    if (e.key === 'ArrowRight') { owl.trigger('next.owl.carousel'); e.preventDefault(); }
  });
  el.addEventListener('focusin', () => owl.trigger('stop.owl.autoplay'));
  const set = wirePause($('#voices-pause'), { pause: () => owl.trigger('stop.owl.autoplay'), play: () => owl.trigger('play.owl.autoplay', [6000]) });
  if (rm) { $('#voices-pause')?.setAttribute('hidden', ''); }
  return owl;
}

/* ---------- Watch page: main + thumbs gallery ---------- */
/**
 * @param {Array<{src:string, full:string, alt:string, caption:string}>} views
 * @returns the main Swiper
 */
export function initGallery(views) {
  const main = $('.gallery .main'), thumbs = $('.gallery .thumbs');
  if (!main || !thumbs || !window.Swiper) return null;
  const rm = reducedMotion();
  const ts = new window.Swiper(thumbs, { slidesPerView: 5, spaceBetween: 8, watchSlidesProgress: true, freeMode: true, a11y: { enabled: false } });
  const ms = new window.Swiper(main, {
    speed: rm ? 0 : 600, spaceBetween: 12, grabCursor: true, keyboard: { enabled: true, onlyInViewport: true },
    a11y: { enabled: true, prevSlideMessage: 'Previous photo', nextSlideMessage: 'Next photo', slideLabelMessage: 'Photo {{index}} of {{slidesLength}}' },
    navigation: { prevEl: '.gallery .g-prev', nextEl: '.gallery .g-next' },
    pagination: { el: '.gallery .g-count', type: 'fraction' },
    thumbs: { swiper: ts },
  });
  $$('.zoomable', main).forEach((b, i) => b.addEventListener('click', () => openLightbox(views, i, b)));
  return ms;
}

/* ---------- Lightbox (Swiper Zoom: pinch, double-tap, wheel) ---------- */
let lb = null;
export function openLightbox(items, start = 0, opener = null) {
  if (!window.Swiper) return;
  if (!lb) {
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    document.body.append(lb);
  }
  lb.innerHTML = `<div class="lb__bar"><span class="small muted" id="lb-count"></span><button class="car-btn" type="button" data-lb-close aria-label="Close viewer">${ICON.close}</button></div>
    <div class="swiper"><div class="swiper-wrapper">${items.map((it) => `<div class="swiper-slide"><div class="swiper-zoom-container"><img src="${it.full}" alt="${it.alt.replace(/"/g, '&quot;')}"></div></div>`).join('')}</div>
    <button class="car-btn swiper-button-prev lb-prev" type="button" aria-label="Previous photo" style="position:absolute;left:16px;top:50%;z-index:5">${ICON.arrowL}</button>
    <button class="car-btn swiper-button-next lb-next" type="button" aria-label="Next photo" style="position:absolute;right:16px;top:50%;z-index:5">${ICON.arrowR}</button></div>
    <p class="lb__cap" id="lb-cap" aria-live="polite"></p>`;
  // Swiper's own arrow glyphs are replaced by our SVG icons.
  $$('.swiper-button-prev, .swiper-button-next', lb).forEach((b) => b.classList.add('lb-btn'));
  lb.classList.add('is-open');
  lockScroll(true);
  const release = trapFocus(lb);
  const sw = new window.Swiper($('.swiper', lb), {
    initialSlide: start, zoom: { maxRatio: 4, minRatio: 1 }, keyboard: { enabled: true }, spaceBetween: 24,
    navigation: { prevEl: '.lb-prev', nextEl: '.lb-next' }, a11y: { enabled: true },
  });
  const upd = () => { $('#lb-count', lb).textContent = `${sw.activeIndex + 1} / ${items.length}`; $('#lb-cap', lb).textContent = items[sw.activeIndex].caption + ' · Pinch or double-tap to zoom'; };
  sw.on('slideChange', upd); upd();
  const close = () => {
    sw.destroy(true, true); lb.classList.remove('is-open'); lb.innerHTML = '';
    document.removeEventListener('keydown', onKey); release(); lockScroll(false); opener?.focus();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  $('[data-lb-close]', lb).addEventListener('click', close);
  $('[data-lb-close]', lb).focus();
}
