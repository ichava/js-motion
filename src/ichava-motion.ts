// @ts-nocheck -- moved verbatim from ichava-motion.js; the types arrive in the next commit.
/*
 * Module scope, not an IIFE.
 *
 * This file was `(function (window, document) { ... })(window, document)`. That form reads
 * `window` at module scope, so `import`ing or `require`ing it under Node or during SSR
 * threw before a single line of the library ran -- and `dist/ichava-motion.js` was a
 * byte-identical hand copy of this file, so there was no build to fix it in. The `exports`
 * map advertised `require` support the package could not honour.
 *
 * Every DOM access inside the library is already inside a function body, so nothing here
 * touches the document until a caller asks it to. The two exceptions were the global
 * assignment and the auto-scan at the bottom; both are now guarded.
 */
'use strict';

  var VERSION = '1.0.0';

  /* ─── easings (label ↔ value; value is what WAAPI receives) ─────────────── */
  var EASINGS = {
    linear: 'linear', ease: 'ease', 'ease-in': 'ease-in', 'ease-out': 'ease-out', 'ease-in-out': 'ease-in-out',
    spring: 'cubic-bezier(.34,1.56,.64,1)', back: 'cubic-bezier(.68,-.55,.27,1.55)', 'steps(8)': 'steps(8)',
    'ease-in-quad': 'cubic-bezier(.55,.06,.68,.19)', 'ease-out-cubic': 'cubic-bezier(.22,.61,.36,1)'
  };
  function resolveEasing(e) {
    if (!e) return 'ease-in-out';
    if (EASINGS[e]) return EASINGS[e];
    // pass raw cubic-bezier()/steps()/named through if valid
    if (/^(linear|ease(-in|-out|-in-out)?|step-(start|end)|steps\([^)]+\)|cubic-bezier\(\s*-?\d*\.?\d+\s*(,\s*-?\d*\.?\d+\s*){3}\))$/.test(String(e).trim())) return e;
    return 'ease-in-out';
  }

  /* ─── family × variant preset generator (mirrors the app's MotionEngine) ── */
  var P = 'perspective(400px)';
  var VARIANTS = [
    { s: '', a: 1, d: 1, r: false }, { s: ' · Reverse', a: 1, d: 1, r: true },
    { s: ' · Subtle', a: 0.55, d: 1.15, r: false }, { s: ' · Subtle · Reverse', a: 0.55, d: 1.15, r: true },
    { s: ' · Bold', a: 1.7, d: 0.8, r: false }, { s: ' · Bold · Reverse', a: 1.7, d: 0.8, r: true }
  ];
  var FAMILIES = [
    { id: 'spin', label: 'Spin', base: 1400, kf: function () { return [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }]; } },
    { id: 'spin-y', label: 'Spin Y', base: 1600, kf: function () { return [{ transform: P + ' rotateY(0deg)' }, { transform: P + ' rotateY(360deg)' }]; } },
    { id: 'spin-z', label: 'Spin Z', base: 1600, kf: function () { return [{ transform: P + ' rotateZ(0deg) rotateX(20deg)' }, { transform: P + ' rotateZ(360deg) rotateX(20deg)' }]; } },
    { id: 'flip-x', label: 'Flip X', base: 1400, kf: function () { return [{ transform: P + ' rotateX(0deg)' }, { transform: P + ' rotateX(360deg)' }]; } },
    { id: 'flip-y', label: 'Flip Y', base: 1400, kf: function () { return [{ transform: P + ' rotateY(0deg)' }, { transform: P + ' rotateY(360deg)' }]; } },
    { id: 'roll', label: 'Roll', base: 1200, kf: function (a) { return [{ transform: 'translateX(' + (-24 * a) + '%) rotate(' + (-120 * a) + 'deg)', opacity: 0.4 }, { transform: 'translateX(0) rotate(0)', opacity: 1 }]; } },
    { id: 'orbit', label: 'Orbit', base: 2000, kf: function (a) { return [{ transform: 'rotate(0deg) translateX(' + (6 * a) + 'px) rotate(0deg)' }, { transform: 'rotate(360deg) translateX(' + (6 * a) + 'px) rotate(-360deg)' }]; } },
    { id: 'pulse', label: 'Pulse', base: 1200, kf: function (a) { return [{ opacity: 1 }, { opacity: Math.max(0.1, 1 - 0.65 * a) }, { opacity: 1 }]; } },
    { id: 'heartbeat', label: 'Heartbeat', base: 1000, kf: function (a) { return [{ transform: 'scale(1)' }, { transform: 'scale(' + (1 + 0.18 * a) + ')' }, { transform: 'scale(1)' }, { transform: 'scale(' + (1 + 0.12 * a) + ')' }, { transform: 'scale(1)' }]; } },
    { id: 'breathe', label: 'Breathe', base: 3000, kf: function (a) { return [{ transform: 'scale(1)' }, { transform: 'scale(' + (1 + 0.08 * a) + ')' }, { transform: 'scale(1)' }]; } },
    { id: 'zoom-in', label: 'Zoom In', base: 900, once: true, kf: function (a) { return [{ transform: 'scale(' + (1 - 0.4 * a) + ')', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }]; } },
    { id: 'zoom-out', label: 'Zoom Out', base: 900, once: true, kf: function (a) { return [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(' + (1 + 0.4 * a) + ')', opacity: 0 }]; } },
    { id: 'pop', label: 'Pop', base: 500, once: true, kf: function (a) { return [{ transform: 'scale(1)' }, { transform: 'scale(' + (1 + 0.25 * a) + ')' }, { transform: 'scale(1)' }]; } },
    { id: 'rubber-band', label: 'Rubber Band', base: 900, once: true, kf: function (a) { return [{ transform: 'scale(1,1)' }, { transform: 'scale(' + (1 + 0.25 * a) + ',' + (1 - 0.25 * a) + ')' }, { transform: 'scale(' + (1 - 0.15 * a) + ',' + (1 + 0.15 * a) + ')' }, { transform: 'scale(1,1)' }]; } },
    { id: 'jello', label: 'Jello', base: 900, once: true, kf: function (a) { return [{ transform: 'skewX(0) skewY(0)' }, { transform: 'skewX(' + (-12 * a) + 'deg) skewY(' + (-12 * a) + 'deg)' }, { transform: 'skewX(' + (6 * a) + 'deg) skewY(' + (6 * a) + 'deg)' }, { transform: 'skewX(0) skewY(0)' }]; } },
    { id: 'tada', label: 'Tada', base: 1000, once: true, kf: function (a) { return [{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(' + (1 - 0.1 * a) + ') rotate(' + (-3 * a) + 'deg)' }, { transform: 'scale(' + (1 + 0.1 * a) + ') rotate(' + (3 * a) + 'deg)' }, { transform: 'scale(1) rotate(0)' }]; } },
    { id: 'bounce', label: 'Bounce', base: 900, kf: function (a) { return [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-22 * a) + '%)' }, { transform: 'translateY(0)' }]; } },
    { id: 'float', label: 'Float', base: 2400, kf: function (a) { return [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-12 * a) + '%)' }, { transform: 'translateY(0)' }]; } },
    { id: 'hop', label: 'Hop', base: 800, kf: function (a) { return [{ transform: 'translateY(0) scaleY(1)' }, { transform: 'translateY(0) scaleY(0.86)' }, { transform: 'translateY(' + (-24 * a) + '%) scaleY(1.05)' }, { transform: 'translateY(0) scaleY(1)' }]; } },
    { id: 'slide-up', label: 'Slide Up', base: 900, once: true, kf: function (a) { return [{ transform: 'translateY(' + (30 * a) + '%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }]; } },
    { id: 'slide-down', label: 'Slide Down', base: 900, once: true, kf: function (a) { return [{ transform: 'translateY(' + (-30 * a) + '%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }]; } },
    { id: 'slide-left', label: 'Slide Left', base: 900, once: true, kf: function (a) { return [{ transform: 'translateX(' + (30 * a) + '%)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }]; } },
    { id: 'slide-right', label: 'Slide Right', base: 900, once: true, kf: function (a) { return [{ transform: 'translateX(' + (-30 * a) + '%)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }]; } },
    { id: 'shake-x', label: 'Shake X', base: 600, kf: function (a) { return [{ transform: 'translateX(0)' }, { transform: 'translateX(' + (-3 * a) + 'px)' }, { transform: 'translateX(' + (3 * a) + 'px)' }, { transform: 'translateX(0)' }]; } },
    { id: 'shake-y', label: 'Shake Y', base: 600, kf: function (a) { return [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-3 * a) + 'px)' }, { transform: 'translateY(' + (3 * a) + 'px)' }, { transform: 'translateY(0)' }]; } },
    { id: 'vibrate', label: 'Vibrate', base: 300, kf: function (a) { return [{ transform: 'translate(0,0)' }, { transform: 'translate(' + (-1.5 * a) + 'px,' + (1.5 * a) + 'px)' }, { transform: 'translate(' + (1.5 * a) + 'px,' + (-1.5 * a) + 'px)' }, { transform: 'translate(0,0)' }]; } },
    { id: 'wobble', label: 'Wobble', base: 1000, once: true, kf: function (a) { return [{ transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(' + (-12 * a) + '%) rotate(' + (-5 * a) + 'deg)' }, { transform: 'translateX(' + (8 * a) + '%) rotate(' + (3 * a) + 'deg)' }, { transform: 'translateX(0) rotate(0)' }]; } },
    { id: 'wiggle', label: 'Wiggle', base: 800, kf: function (a) { return [{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + (-11 * a) + 'deg)' }, { transform: 'rotate(' + (11 * a) + 'deg)' }, { transform: 'rotate(0deg)' }]; } },
    { id: 'swing', label: 'Swing', base: 1000, origin: 'top center', kf: function (a) { return [{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + (15 * a) + 'deg)' }, { transform: 'rotate(' + (-10 * a) + 'deg)' }, { transform: 'rotate(0deg)' }]; } },
    { id: 'pendulum', label: 'Pendulum', base: 1600, origin: 'top center', kf: function (a) { return [{ transform: 'rotate(' + (-20 * a) + 'deg)' }, { transform: 'rotate(' + (20 * a) + 'deg)' }, { transform: 'rotate(' + (-20 * a) + 'deg)' }]; } },
    { id: 'rock', label: 'Rock', base: 1200, origin: 'bottom center', kf: function (a) { return [{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + (-8 * a) + 'deg)' }, { transform: 'rotate(' + (8 * a) + 'deg)' }, { transform: 'rotate(0deg)' }]; } },
    { id: 'fade', label: 'Fade', base: 1400, kf: function (a) { return [{ opacity: Math.max(0, 1 - a) }, { opacity: 1 }]; } },
    { id: 'blink', label: 'Blink', base: 1000, kf: function () { return [{ opacity: 1 }, { opacity: 1 }, { opacity: 0 }, { opacity: 0 }, { opacity: 1 }]; } },
    { id: 'flash', label: 'Flash', base: 1000, once: true, kf: function () { return [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }]; } },
    { id: 'glow', label: 'Glow', base: 1600, kf: function (a) { return [{ filter: 'drop-shadow(0 0 0 currentColor)' }, { filter: 'drop-shadow(0 0 ' + (5 * a) + 'px currentColor)' }, { filter: 'drop-shadow(0 0 0 currentColor)' }]; } },
    { id: 'draw', label: 'Draw', base: 1400, once: true, domOnly: true, draw: true, stagger: 120, kf: function () { return [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }]; } },
    /* illustration families — animate the SVG's child layers, not just the root */
    { id: 'reveal', label: 'Reveal', base: 700, once: true, perChild: true, stagger: 90, kf: function (a) { return [{ opacity: 0, transform: 'translateY(' + (14 * a) + 'px)' }, { opacity: 1, transform: 'translateY(0)' }]; } },
    { id: 'cascade', label: 'Cascade', base: 700, once: true, perChild: true, stagger: 110, kf: function (a) { return [{ opacity: 0, transform: 'scale(' + (1 - 0.3 * a) + ')' }, { opacity: 1, transform: 'scale(1)' }]; } },
    { id: 'assemble', label: 'Assemble', base: 800, once: true, perChild: true, stagger: 90, kf: function (a) { return [{ opacity: 0, transform: 'translateX(' + (-18 * a) + 'px) rotate(' + (-8 * a) + 'deg)' }, { opacity: 1, transform: 'translateX(0) rotate(0)' }]; } },
    { id: 'parallax', label: 'Parallax', base: 2600, perChild: true, stagger: 160, kf: function (a) { return [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-7 * a) + 'px)' }, { transform: 'translateY(0)' }]; } }
  ];

  var PRESETS = {}; // id → { id, label, keyframes, base, direction, iterations, once, origin, domOnly }
  function slugVariant(s) { return s ? '-' + s.replace(/[·\s]+/g, '').toLowerCase() : ''; }
  function buildPresets() {
    PRESETS = {};
    for (var i = 0; i < FAMILIES.length; i++) {
      var f = FAMILIES[i];
      for (var j = 0; j < VARIANTS.length; j++) {
        var v = VARIANTS[j];
        var id = f.id + slugVariant(v.s);
        PRESETS[id] = {
          id: id, label: f.label + v.s, keyframes: f.kf(v.a), base: Math.round(f.base * v.d),
          direction: v.r ? 'reverse' : 'normal', iterations: f.once ? 1 : Infinity, once: !!f.once,
          origin: f.origin, domOnly: !!f.domOnly, draw: !!f.draw, perChild: !!f.perChild, stagger: f.stagger, family: f.id
        };
      }
    }
  }
  buildPresets();

  /* ─── config ─────────────────────────────────────────────────────────────── */
  var CONFIG = {
    defaults: { duration: null, easing: 'ease-in-out', delay: 0, iterations: null, direction: null, speed: 1, trigger: 'load' },
    lottie: 'off',        // 'off' | 'import' | 'full'
    lottiePlayer: null,   // a lottie-web instance you supply; never fetched for you
    reduceMotion: 'respect' // 'respect' | 'off'
  };
  /*
   * Keys that must never be copied, however they arrive.
   *
   * `hasOwnProperty` is not a defence against prototype pollution and reading it
   * as one is the usual mistake: `JSON.parse('{"__proto__":{"x":1}}')` produces an
   * OWN `__proto__` property, so the guard passes and `t[k] = s[k]` then writes
   * through to Object.prototype. Config reaches this function from JSON -- a
   * preset manifest, a data-* attribute, an API payload -- so the untrusted path
   * is the normal path. (`M4`.)
   *
   * A plain array, deliberately. The first fix here used an object literal --
   * `{ __proto__: 1, ... }` -- which does not create a `__proto__` KEY at all: it
   * sets that object's prototype, leaving the block list empty and the guard
   * inert. The test caught it. Same trap, one level up.
   */
  var BLOCKED_KEYS = ['__proto__', 'constructor', 'prototype'];

  function assign(t) {
    for (var i = 1; i < arguments.length; i++) {
      var s = arguments[i];
      if (!s) continue;
      for (var k in s) {
        if (!Object.prototype.hasOwnProperty.call(s, k)) continue;
        if (BLOCKED_KEYS.indexOf(k) !== -1) continue;
        if (t[k] && typeof t[k] === 'object' && typeof s[k] === 'object' && !Array.isArray(s[k])) assign(t[k], s[k]);
        else t[k] = s[k];
      }
    }
    return t;
  }

  function reduceMotion() {
    if (CONFIG.reduceMotion === 'off') return false;
    /*
     * Fail CLOSED: when the preference cannot be read, assume it is set.
     *
     * This returned false on error, which means "the user has not asked for less
     * motion" -- so the one case where we genuinely do not know was resolved by
     * animating anyway. For an accessibility preference the safe default is the
     * accommodating one; a missing animation is a cosmetic complaint, unwanted
     * motion can be a vestibular one. (`M8`.)
     */
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || document.documentElement.hasAttribute('data-reduce-motion');
    } catch (e) { return true; }
  }

  /* ─── player ─────────────────────────────────────────────────────────────── */
  function toEl(target) { return typeof target === 'string' ? document.querySelector(target) : target; }

  // Resolve WAAPI timing from a spec + opts (+ a per-child stagger delay).
  function timing(spec, opts, extraDelay) {
    var speed = opts.speed != null ? opts.speed : (CONFIG.defaults.speed || 1);
    var base = spec.duration != null ? spec.duration : spec.base;
    var duration = opts.duration != null ? opts.duration : Math.max(80, (base || 1000) / Math.max(0.1, speed));
    var iterations = opts.iterations != null ? opts.iterations : (spec.iterations != null ? spec.iterations : (CONFIG.defaults.iterations != null ? CONFIG.defaults.iterations : Infinity));
    if (iterations === 'infinite') iterations = Infinity;
    var dir = opts.direction || spec.direction || CONFIG.defaults.direction || 'normal';
    return {
      duration: duration,
      easing: resolveEasing(opts.easing || spec.easing || CONFIG.defaults.easing),
      delay: (opts.delay != null ? opts.delay : (CONFIG.defaults.delay || 0)) + (extraDelay || 0),
      direction: dir === 'reverse' ? 'reverse' : dir === 'alternate' ? 'alternate' : 'normal',
      iterations: iterations,
      fill: iterations === Infinity ? 'none' : 'forwards'
    };
  }

  function playSpec(el, spec, opts) {
    el = toEl(el); if (!el || !spec || !spec.keyframes || !spec.keyframes.length) return null;
    if (reduceMotion()) return null;
    opts = opts || {};
    if (spec.origin && el.style) el.style.transformOrigin = spec.origin;
    return el.animate(spec.keyframes, timing(spec, opts));
  }

  // The SVG's animatable layers (illustration groups / paths), for child-targeting.
  function childLayers(el) {
    var n = el.querySelectorAll('[data-layer]');
    if (n.length) return n;
    n = el.querySelectorAll(':scope > g, :scope > path');
    return n.length ? n : el.children;
  }

  // Staggered per-child animation — the illustration families (Reveal/Cascade/…).
  function playChildren(el, spec, opts) {
    opts = opts || {};
    var kids = childLayers(el);
    if (!kids || !kids.length) return playSpec(el, spec, opts);
    var stagger = opts.stagger != null ? opts.stagger : (spec.stagger != null ? spec.stagger : 90);
    var last = null;
    for (var i = 0; i < kids.length; i++) {
      if (spec.origin && kids[i].style) kids[i].style.transformOrigin = spec.origin;
      last = kids[i].animate(spec.keyframes, timing(spec, opts, i * stagger));
    }
    return last;
  }

  // Real "Draw": measure each child path and animate its stroke-dashoffset to 0.
  function drawPaths(el, spec, opts) {
    opts = opts || {};
    var paths = el.querySelectorAll('path, line, polyline, polygon, circle, rect');
    if (!paths.length) return playSpec(el, spec, opts);
    var stagger = opts.stagger != null ? opts.stagger : (spec.stagger != null ? spec.stagger : 120);
    var last = null, drawn = 0;
    for (var i = 0; i < paths.length; i++) {
      var p = paths[i], len = 0;
      try { len = p.getTotalLength ? p.getTotalLength() : 0; } catch (e) { len = 0; }
      if (!len) continue;
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
      last = p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], timing(spec, opts, drawn++ * stagger));
    }
    return last;
  }

  function play(el, presetId, opts) {
    var spec = PRESETS[presetId];
    if (!spec) { return null; }
    var node = toEl(el); if (!node) return null;
    if (reduceMotion()) return null;
    if (spec.draw) return drawPaths(node, spec, opts || {});
    if (spec.perChild) return playChildren(node, spec, opts || {});
    return playSpec(node, spec, opts);
  }

  // route by content: preset id | our JSON | bodymovin JSON (via Lottie tier)
  function animate(el, source, opts) {
    if (typeof source === 'string') return play(el, source, opts);
    if (source && source.layers && source.v && source.ip != null) return runLottie(el, source, opts);
    return playSpec(el, source, opts); // our JSON schema
  }

  function runLottie(el, json, opts) {
    if (CONFIG.lottie === 'import' && window.IchavaMotionLottie) {
      var spec = window.IchavaMotionLottie.toSpec(json);
      if (spec) return playSpec(el, spec, opts);
    }
    if (CONFIG.lottie === 'full') { return loadLottieWeb(toEl(el), json); }
    if (window.IchavaMotionLottie) { var s = window.IchavaMotionLottie.toSpec(json); if (s) return playSpec(el, s, opts); }
    return null; // lottie disabled
  }

  /*
   * The Lottie player is SUPPLIED, never fetched.
   *
   * This used to append a <script src="https://cdn.jsdelivr.net/..."> to the head
   * on first use. Three things were wrong with that, and the first is the one that
   * matters:
   *
   *  1. It cannot run under a strict CSP. Any policy with `script-src 'self'`
   *     blocks the injected tag, so the feature failed exactly where the library
   *     claims to be safest. Being CSP-safe by construction is the whole of D1 in
   *     PLAN.md, and a library that injects remote script cannot claim it.
   *  2. It silently introduced a third-party origin into the consumer's page, at
   *     an unpinned major version, with no SRI. A supply-chain change at that
   *     origin executes in their page with their privileges.
   *  3. It made the network a dependency of an animation call.
   *
   * So resolution is local only: an explicitly configured player, or a global the
   * consumer loaded themselves. When neither exists we say so once, clearly, and
   * do nothing -- an animation that does not play is a bug report; a page that
   * quietly fetches a CDN is an incident.
   */
  var lottieWarned = false;

  function resolveLottiePlayer() {
    if (CONFIG.lottiePlayer) return CONFIG.lottiePlayer;
    if (typeof window !== 'undefined' && window.lottie) return window.lottie;
    return null;
  }

  function loadLottieWeb(el, json) {
    if (!el) return null;

    var lottie = resolveLottiePlayer();

    if (!lottie) {
      if (!lottieWarned) {
        lottieWarned = true;
        // eslint-disable-next-line no-console
        console.warn(
          '[ichava-motion] lottie:"full" needs a lottie-web player, and this library ' +
          'will not fetch one. Load lottie-web yourself (npm, or a <script> you control) ' +
          'and either expose it as window.lottie or pass it in: ' +
          'IchavaMotion.config({ lottiePlayer: lottie }).'
        );
      }
      return null;
    }

    lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, animationData: json });
    return null;
  }

  /* ─── declarative auto-init (data-*) ─────────────────────────────────────── */
  function readOpts(el) {
    var d = el.dataset;
    var o = {};
    if (d.motionSpeed) o.speed = parseFloat(d.motionSpeed);
    if (d.motionEasing) o.easing = d.motionEasing;
    if (d.motionDelay) o.delay = parseFloat(d.motionDelay);
    if (d.motionDirection) o.direction = d.motionDirection;
    if (d.motionIterations) o.iterations = d.motionIterations === 'infinite' ? Infinity : parseFloat(d.motionIterations);
    if (d.motionStagger) o.stagger = parseFloat(d.motionStagger);
    return o;
  }
  var wired = new WeakSet();
  function wire(el) {
    if (wired.has(el)) return; wired.add(el);
    var id = el.getAttribute('data-ichava-motion');
    var trigger = el.getAttribute('data-motion-trigger') || CONFIG.defaults.trigger || 'load';
    var opts = readOpts(el);
    var current = null;
    function start(o) { if (current) current.cancel(); current = play(el, id, o || opts); return current; }
    if (trigger === 'load') { start(); }
    else if (trigger === 'loop') { start({ iterations: Infinity }); }
    else if (trigger === 'hover') {
      el.addEventListener('mouseenter', function () { start(); });
      el.addEventListener('mouseleave', function () { if (current) current.cancel(); });
    } else if (trigger === 'click') {
      el.addEventListener('click', function () { if (current && current.playState === 'running') current.cancel(); else start(); });
    } else if (trigger === 'visible') {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { start({ iterations: PRESETS[id] && PRESETS[id].once ? 1 : opts.iterations }); io.unobserve(el); } }); });
        io.observe(el);
      } else start();
    }
  }
  function auto(root) {
    (root || document).querySelectorAll('[data-ichava-motion]').forEach(wire);
  }

  /* ─── public API ─────────────────────────────────────────────────────────── */
  var IchavaMotion = {
    version: VERSION,
    config: function (o) { assign(CONFIG, o || {}); return this; },
    animate: animate,
    play: play,
    playSpec: playSpec,
    // Play a JSON def ({ keyframes, duration, easing, direction, iterations }). The
    // detail dialog's Motion tab exports exactly this shape. `{ trigger:'loop' }` loops.
    fromJSON: function (el, def, opts) { opts = opts || {}; if (opts.trigger === 'loop') opts.iterations = Infinity; return playSpec(el, def, opts); },
    auto: auto,
    presets: function () { return PRESETS; },
    presetIds: function () { return Object.keys(PRESETS); },
    easings: function () { return assign({}, EASINGS); },
    register: function (id, spec) { PRESETS[id] = assign({ id: id, keyframes: [], base: 1000, iterations: Infinity, direction: 'normal' }, spec); return this; },
    registerFamily: function (family) { FAMILIES.push(family); buildPresets(); return this; },
    registerVariant: function (variant) { VARIANTS.push(variant); buildPresets(); return this; },
    registerEasing: function (name, value) { EASINGS[name] = value; return this; }
  };



/*
 * The global is for the `<script>` build only, and is assigned defensively so importing
 * this module in Node does not throw.
 */
if (typeof globalThis !== 'undefined' && typeof globalThis.document !== 'undefined') {
  globalThis.IchavaMotion = IchavaMotion;
}

/*
 * Auto-scan is OPT-IN.
 *
 * It used to run on DOMContentLoaded unless `window.__ichavaMotionNoAuto` was set --
 * opt-out, so simply loading the script started animation the user never asked for. WCAG
 * 2.2.2 requires motion that starts automatically and lasts more than five seconds to be
 * pausable, stoppable or hideable, and the presets here loop indefinitely. Defaulting to
 * off means a page opts in deliberately, and `autoInit()` is there for the `<script>` tag
 * users who want the old behaviour:
 *
 *   <script src="ichava-motion.js"></script>
 *   <script>IchavaMotion.autoInit()</script>
 *
 * `prefersReduced()` is still honoured inside `auto()`, so even an explicit opt-in does
 * nothing for a user who asked for less motion.
 */
IchavaMotion.autoInit = function autoInit() {
  if (typeof document === 'undefined') return IchavaMotion;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { auto(); });
  } else {
    auto();
  }
  return IchavaMotion;
};

/*
 * Default export only, deliberately.
 *
 * Adding a named export alongside it makes Rollup emit a namespace object as the IIFE
 * global, so `IchavaMotion.animate` becomes `IchavaMotion.default.animate` and every
 * `<script>` consumer and published CDN URL breaks. A single default export lets the IIFE
 * assign the library itself, which is the contract those users already have.
 */
export default IchavaMotion;
