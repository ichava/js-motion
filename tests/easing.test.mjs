// Easing resolution: which values pass through to WAAPI, and that deciding it takes
// linear time. The pattern used `-?\d*\.?\d+` for each cubic-bezier() number, which can
// split a run of digits many ways, so a long crafted value (from a data-motion-easing
// attribute or a JSON preset) took quadratic time to reject. CodeQL js/polynomial-redos.
//
// Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import test from 'node:test';

// playSpec() reaches WAAPI through el.animate(keyframes, timing); a stand-in element
// returns the timing, so the resolved easing can be read without a browser.
globalThis.window = { matchMedia: () => ({ matches: false }) };
globalThis.document = { documentElement: { hasAttribute: () => false }, querySelector: () => null };
const { default: IchavaMotion } = await import('../src/ichava-motion.ts');
const el = { style: {}, animate: (_kf, timing) => timing };
const resolve = (easing) => IchavaMotion.playSpec(el, { keyframes: [{ opacity: 0 }, { opacity: 1 }], base: 1000 }, { easing }).easing;

test('named and valid raw easings pass through, anything else falls back', () => {
  const kept = [
    'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end', 'steps(4, end)',
    'cubic-bezier(.34,1.56,.64,1)', 'cubic-bezier(0, 0, 1, 1)', 'cubic-bezier( -0.5 , 2 , .25 , 10.75 )',
    'cubic-bezier(10,20,30,40)',
  ];
  for (const e of kept) assert.equal(resolve(e), e, e);
  assert.equal(resolve('spring'), 'cubic-bezier(.34,1.56,.64,1)');
  const rejected = [
    'cubic-bezier(1.,2,3,4)', 'cubic-bezier(1,2,3)', 'cubic-bezier(a,b,c,d)', 'cubic-bezier(1,2,3,4,5)',
    'cubic-bezier(--1,2,3,4)', 'url(x)', 'ease-in-outx', '',
  ];
  for (const e of rejected) assert.equal(resolve(e), 'ease-in-out', e);
});

test('rejecting a long crafted value takes linear time', () => {
  for (const evil of ['cubic-bezier(' + '9'.repeat(40_000) + 'x', '9'.repeat(40_000) + 'x', 'cubic-bezier(1,' + '9'.repeat(40_000) + 'x']) {
    const start = performance.now();
    assert.equal(resolve(evil), 'ease-in-out');
    const ms = performance.now() - start;
    assert.ok(ms < 250, `took ${ms.toFixed(0)}ms`);
  }
});
