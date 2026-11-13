// Node smoke test for the Lottie import adapter (no browser needed).
// Run: node tests/lottie.test.mjs
import { createRequire } from 'node:module';
import assert from 'node:assert';
const require = createRequire(import.meta.url);
require('../dist/ichava-motion-lottie.js'); // side effect: sets globalThis.IchavaMotionLottie
const { toSpec } = globalThis.IchavaMotionLottie;

// minimal single-layer bodymovin: 30fps, 0..60 frames (2s), rotation 0→360
const json = {
  v: '5.9.0', fr: 30, ip: 0, op: 60,
  layers: [{
    nm: 'icon', ks: {
      o: { a: 0, k: 100 },
      p: { a: 0, k: [0, 0] },
      s: { a: 0, k: [100, 100] },
      r: { a: 1, k: [
        { t: 0, s: [0], o: { x: [0.4], y: [0] }, i: { x: [0.6], y: [1] } },
        { t: 60, s: [360] },
      ] },
    },
  }],
};

const spec = toSpec(json);
assert(spec, 'toSpec returned a spec');
assert.strictEqual(spec.base, 2000, 'duration = (op-ip)/fr*1000 = 2000ms');
assert(spec.keyframes.length >= 2, 'has keyframes');
assert(/rotate\(0deg\)/.test(spec.keyframes[0].transform), 'first keyframe rotate(0)');
assert(/rotate\(360deg\)/.test(spec.keyframes[spec.keyframes.length - 1].transform), 'last keyframe rotate(360)');
assert.strictEqual(spec.keyframes[0].offset, 0, 'first offset 0');
assert.strictEqual(spec.keyframes[spec.keyframes.length - 1].offset, 1, 'last offset 1');

// non-lottie JSON → null
assert.strictEqual(toSpec({ foo: 1 }), null, 'non-bodymovin → null');

console.log('lottie adapter: all assertions passed (' + spec.keyframes.length + ' keyframes, base ' + spec.base + 'ms)');
