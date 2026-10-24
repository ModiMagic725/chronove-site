/**
 * CHRONOVÉ — library loader (classic script, no build step).
 *
 * Each library is requested from jsDelivr at a pinned version with a Subresource Integrity hash.
 * If the CDN is blocked, slow (> 6 s), or the hash does not match, the identical file in /vendor
 * is loaded instead. Once everything has settled, js/main.js (an ES module) is imported.
 *
 * Per-page library lists come from window.CV.libs, written into each page by tools/build-pages.mjs.
 * The SRI hashes were computed from the npm package files; run `npm run sri` after bumping a version.
 */
(function () {
  'use strict';
  var CDN = 'https://cdn.jsdelivr.net/npm/';
  var TIMEOUT = 6000;

  /** key → { cdn path, local path, SRI, kind, global (for already-loaded checks) } */
  var LIBS = {
    gsap:          { cdn: 'gsap@3.12.5/dist/gsap.min.js',                    local: 'vendor/gsap.min.js',            sri: '@gsap.min.js',            global: 'gsap' },
    scrolltrigger: { cdn: 'gsap@3.12.5/dist/ScrollTrigger.min.js',           local: 'vendor/ScrollTrigger.min.js',   sri: '@ScrollTrigger.min.js',   global: 'ScrollTrigger', after: 'gsap' },
    lenis:         { cdn: 'lenis@1.1.13/dist/lenis.min.js',                  local: 'vendor/lenis.min.js',           sri: '@lenis.min.js',           global: 'Lenis' },
    splittype:     { cdn: 'split-type@0.3.4/umd/index.min.js',               local: 'vendor/split-type.min.js',      sri: '@split-type.min.js',      global: 'SplitType' },
    aos:           { cdn: 'aos@2.3.4/dist/aos.js',                           local: 'vendor/aos.js',                 sri: '@aos.js',                 global: 'AOS', css: { cdn: 'aos@2.3.4/dist/aos.css', local: 'vendor/aos.css', sri: '@aos.css' } },
    swiper:        { cdn: 'swiper@11.1.14/swiper-bundle.min.js',             local: 'vendor/swiper-bundle.min.js',   sri: '@swiper-bundle.min.js',   global: 'Swiper', css: { cdn: 'swiper@11.1.14/swiper-bundle.min.css', local: 'vendor/swiper-bundle.min.css', sri: '@swiper-bundle.min.css' } },
    splide:        { cdn: '@splidejs/splide@4.1.4/dist/js/splide.min.js',    local: 'vendor/splide.min.js',          sri: '@splide.min.js',          global: 'Splide', css: { cdn: '@splidejs/splide@4.1.4/dist/css/splide-core.min.css', local: 'vendor/splide-core.min.css', sri: '@splide-core.min.css' } },
    jquery:        { cdn: 'jquery@3.7.1/dist/jquery.min.js',                 local: 'vendor/jquery.min.js',          sri: '@jquery.min.js',          global: 'jQuery' },
    owl:           { cdn: 'owl.carousel@2.3.4/dist/owl.carousel.min.js',     local: 'vendor/owl.carousel.min.js',    sri: '@owl.carousel.min.js',    global: 'jQuery', after: 'jquery', css: { cdn: 'owl.carousel@2.3.4/dist/assets/owl.carousel.min.css', local: 'vendor/owl.carousel.min.css', sri: '@owl.carousel.min.css' } },
    three:         { cdn: 'three@0.149.0/build/three.min.js',                local: 'vendor/three.min.js',           sri: '@three.min.js',           global: 'THREE' },
  };
  var HASH = {
    '@ScrollTrigger.min.js': 'sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d',
    '@aos.css': 'sha384-/rJKQnzOkEo+daG0jMjU1IwwY9unxt1NBw3Ef2fmOJ3PW/TfAg2KXVoWwMZQZtw9',
    '@aos.js': 'sha384-n1AULnKdMJlK1oQCLNDL9qZsDgXtH6jRYFCpBtWFc+a9Yve0KSoMn575rk755NJZ',
    '@gsap.min.js': 'sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt',
    '@jquery.min.js': 'sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs',
    '@lenis.min.js': 'sha384-B2WBjDzEjJpYvhmi2UyEn7rektqkf5suS6sNoyyrf0EBAwBHdkiXxIlU0V5Ru2ed',
    '@owl.carousel.min.css': 'sha384-kcNNzf7wI8//ZkNUaDd5JwxLoFaBgkj9Z4O4NwtuX9Lkmsz0HoITOxJsGkYxDuyG',
    '@owl.carousel.min.js': 'sha384-l/y5WJTphApmSlx76Ev6k4G3zxu/+19CVvn9OTKI7gs4Yu5Hm8mjpdtdr5oyhnNo',
    '@splide-core.min.css': 'sha384-UUMoBPww5zPuXpRJLHFTN+9x39lTnFOA9kj9q4HOVqv+aZH6G7jZwnXkrE5c18lX',
    '@splide.min.js': 'sha384-RbYB5yr9jD1p+2OHlV3KzOBLAY48CbFsJ87bXEFYINGgOlQJNE4cEjTUf+Q2fygb',
    '@split-type.min.js': 'sha384-wQImCCD/id1jPTwSloatzKlEpnEAQ5aH8H2Ud27FnNcJ1lf2+hB75ctoWnWxyD8X',
    '@swiper-bundle.min.css': 'sha384-IFb872aCXZQb6BKRUHmGn0YHKnFl4ylZjkgVRRyMTEQ5bjo/H6xFUiLJm6opOO66',
    '@swiper-bundle.min.js': 'sha384-JiF4eFN9V3I2Fry7TzFM3XKdq0P3abiVxpOeHjGz4cwvas+uNg6pFWVmuD6MKXqG',
    '@three.min.js': 'sha384-RRHfJ6w1mTlKUBMYT/hvnRiOzEB/vyRV3DrQOseb6oYfvaZSfdd0byS4bHps0k2R'
  };

  /** Which source each library ended up coming from, for diagnostics and tests. */
  var report = (window.CV_LIBS = {});

  function tag(kind, url, sri) {
    return new Promise(function (resolve, reject) {
      var el, done = false, t;
      function finish(ok) { if (done) return; done = true; clearTimeout(t); ok ? resolve() : (el.remove(), reject(new Error(url))); }
      if (kind === 'js') { el = document.createElement('script'); el.src = url; el.async = false; }
      else { el = document.createElement('link'); el.rel = 'stylesheet'; el.href = url; }
      if (sri) { el.integrity = sri; el.crossOrigin = 'anonymous'; }
      el.onload = function () { finish(true); };
      el.onerror = function () { finish(false); };
      t = setTimeout(function () { finish(false); }, TIMEOUT);
      (kind === 'js' ? document.head : document.head).appendChild(el);
    });
  }

  /** Try CDN (with SRI), fall back to the local copy. */
  function fetchAsset(kind, cdn, local, hashKey, label) {
    return tag(kind, CDN + cdn, HASH[hashKey]).then(
      function () { report[label] = 'cdn'; },
      function () { return tag(kind, local).then(function () { report[label] = 'local'; }, function () { report[label] = 'failed'; }); }
    );
  }

  var loaded = {};
  function load(key) {
    if (loaded[key]) return loaded[key];
    var L = LIBS[key];
    var run = function () {
      var jobs = [fetchAsset('js', L.cdn, L.local, L.sri, key)];
      if (L.css) jobs.push(fetchAsset('css', L.css.cdn, L.css.local, L.css.sri, key + '.css'));
      return Promise.all(jobs);
    };
    return (loaded[key] = L.after ? load(L.after).then(run) : run());
  }

  var want = (window.CV && window.CV.libs) || [];
  /** Resolves when every library has either loaded or definitively failed. Never rejects. */
  window.CV_LIBS_READY = Promise.all(want.map(function (k) { return load(k).catch(function () {}); }));
  // main.js starts straight away: it renders page content first and waits for CV_LIBS_READY before enhancing it.
  import('./main.js').catch(function (e) {
    console.error('CHRONOVÉ failed to start:', e);
    document.documentElement.classList.remove('motion-pending', 'pt-in', 'has-pre');
  });
})();
