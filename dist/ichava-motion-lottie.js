/*!
 * Ichava Motion — Lottie import adapter (opt-in tier).
 * Maps a SIMPLE single-layer bodymovin/Lottie JSON (transform + opacity tracks) into
 * the @ichava/motion schema, played via WAAPI. No shapes/masks/paths — route those to
 * the full tier (config({lottie:'full'})). Sets window.IchavaMotionLottie.
 *
 *   <script src="dist/ichava-motion.js"></script>
 *   <script src="dist/ichava-motion-lottie.js"></script>
 *   IchavaMotion.config({ lottie: 'import' });
 *   IchavaMotion.animate(el, bodymovinJson);
 */
(function (window) {
  'use strict';

  function num(v, d) { return typeof v === 'number' ? v : d; }

  // A bodymovin transform property is either static ({ a:0, k:val }) or keyframed
  // ({ a:1, k:[{ t:frame, s:[...], i, o }, ...] }). Return sorted keyframes as
  // { t (frames), v (value array), ease:'cubic-bezier(...)'|null }.
  function track(prop) {
    if (!prop) return null;
    if (prop.a === 0 || !Array.isArray(prop.k) || (prop.k.length && typeof prop.k[0] === 'number')) {
      return { static: true, v: Array.isArray(prop.k) ? prop.k : [prop.k] };
    }
    var frames = prop.k
      .filter(function (kf) { return kf && kf.s; })
      .map(function (kf) { return { t: num(kf.t, 0), v: kf.s, ease: bez(kf.o, kf.i) }; });
    return { static: false, frames: frames };
  }

  // bodymovin out/in tangents (o = out of the previous kf, i = into this one) →
  // a cubic-bezier() approximation (uses the x/y of the first dimension).
  function bez(o, i) {
    try {
      var ox = pick(o.x), oy = pick(o.y), ix = pick(i.x), iy = pick(i.y);
      return 'cubic-bezier(' + r(ox) + ',' + r(oy) + ',' + r(ix) + ',' + r(iy) + ')';
    } catch (e) { return null; }
  }
  function pick(v) { return Array.isArray(v) ? v[0] : v; }
  function r(n) { return Math.round(num(n, 0) * 1000) / 1000; }

  function frameToPct(t, ip, op) { return op > ip ? ((t - ip) / (op - ip)) * 100 : 0; }

  // Build WAAPI keyframes (offset 0..1 via percentage) merging position/rotation/scale/opacity.
  function toSpec(json) {
    if (!json || !Array.isArray(json.layers) || !json.layers.length) return null;
    var fr = num(json.fr, 30), ip = num(json.ip, 0), op = num(json.op, 60);
    var layer = json.layers[0];
    var ks = layer.ks || {};
    var pos = track(ks.p), rot = track(ks.r), scl = track(ks.s), op_ = track(ks.o);

    // collect all keyframe times across animated tracks
    var times = {};
    [pos, rot, scl, op_].forEach(function (tr) {
      if (tr && !tr.static) tr.frames.forEach(function (f) { times[f.t] = 1; });
    });
    var tlist = Object.keys(times).map(Number).sort(function (a, b) { return a - b; });
    if (!tlist.length) tlist = [ip, op]; // no animation → static endpoints

    function valAt(tr, t, fallback) {
      if (!tr) return fallback;
      if (tr.static) return tr.v;
      var fs = tr.frames;
      if (!fs.length) return fallback;
      if (t <= fs[0].t) return fs[0].v;
      for (var k = 0; k < fs.length; k++) if (fs[k].t === t) return fs[k].v;
      // last known before t
      var prev = fs[0].v;
      for (var m = 0; m < fs.length; m++) { if (fs[m].t <= t) prev = fs[m].v; }
      return prev;
    }

    var keyframes = tlist.map(function (t) {
      var p = valAt(pos, t, [0, 0]);
      var s = valAt(scl, t, [100, 100]);
      var rz = valAt(rot, t, [0]);
      var o = valAt(op_, t, [100]);
      var kf = {
        offset: Math.max(0, Math.min(1, frameToPct(t, ip, op) / 100)),
        transform: 'translate(' + r(p[0] || 0) + 'px,' + r(p[1] || 0) + 'px) rotate(' + r((Array.isArray(rz) ? rz[0] : rz) || 0) + 'deg) scale(' + r((s[0] || 100) / 100) + ',' + r((s[1] || s[0] || 100) / 100) + ')',
        opacity: r((Array.isArray(o) ? o[0] : o) / 100),
      };
      return kf;
    });

    return {
      id: 'lottie', label: layer.nm || 'Lottie',
      keyframes: keyframes,
      base: Math.round(((op - ip) / fr) * 1000),
      easing: 'linear',
      iterations: Infinity,
      direction: 'normal',
    };
  }

  window.IchavaMotionLottie = { toSpec: toSpec };
  if (typeof module !== 'undefined' && module.exports) module.exports = { toSpec: toSpec };
})(typeof window !== 'undefined' ? window : globalThis);
