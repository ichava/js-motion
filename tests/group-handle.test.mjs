// M-12/M-13 (motion plan 2026-07-30): a group handle can seek and reverse every child, exposes one
// `finished` for the whole group, and animated SVG children transform around their own box.
// Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import test from 'node:test';

globalThis.window = { matchMedia: () => ({ matches: false }) };
globalThis.document = { documentElement: { hasAttribute: () => false }, querySelector: () => null };
const { default: IchavaMotion } = await import('../src/ichava-motion.ts');

/** A WAAPI-shaped fake with a settable currentTime, reverse(), and a finished promise. */
function fakeAnimation() {
  let settle;
  const onCancel = [];
  const a = {
    calls: [],
    currentTime: 0,
    playState: 'running',
    finished: new Promise((resolve) => { settle = resolve; }),
    addEventListener: (type, fn) => { if (type === 'cancel') onCancel.push(fn); },
    cancel() { a.calls.push('cancel'); onCancel.forEach((f) => f()); },
    pause() { a.calls.push('pause'); },
    play() { a.calls.push('play'); },
    finish() { a.calls.push('finish'); },
    reverse() { a.calls.push('reverse'); },
    settle: () => settle(a),
  };
  return a;
}
function fakeNode(extra = {}) {
  const made = [];
  return { style: {}, made, animate: () => { const a = fakeAnimation(); made.push(a); return a; }, ...extra };
}
function group(n, extra = {}) {
  const kids = Array.from({ length: n }, () => fakeNode(extra));
  const root = fakeNode({ querySelectorAll: (sel) => (sel === '[data-layer]' ? kids : []) });
  return { kids, handle: IchavaMotion.play(root, 'reveal') };
}

test('M-12: seek() moves every child of a group to the same timeline time', () => {
  const { kids, handle } = group(3);
  handle.seek(250);
  for (const k of kids) assert.equal(k.made[0].currentTime, 250);
});

test('M-12: reverse() reverses every child of a group, once each', () => {
  const { kids, handle } = group(3);
  handle.reverse();
  for (const k of kids) assert.deepEqual(k.made[0].calls, ['reverse']);
});

test('M-13: finished resolves to the group handle only when every child has finished', async () => {
  const { kids, handle } = group(3);
  let done = false;
  const p = handle.finished.then((h) => { done = true; return h; });
  kids[0].made[0].settle();
  kids[2].made[0].settle();
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(done, false, 'one child still running');
  kids[1].made[0].settle();
  assert.equal(await p, handle);
});

test('M-13: an animated SVG child transforms around its own box, and gets its style back on cancel', () => {
  const kids = [fakeNode({ ownerSVGElement: {} }), fakeNode({ ownerSVGElement: {} })];
  kids[0].style.transformBox = 'view-box';
  const root = fakeNode({ querySelectorAll: (sel) => (sel === '[data-layer]' ? kids : []) });
  const handle = IchavaMotion.play(root, 'reveal');
  for (const k of kids) assert.equal(k.style.transformBox, 'fill-box');
  handle.cancel();
  assert.equal(kids[0].style.transformBox, 'view-box', 'the author value is back');
  assert.ok(!kids[1].style.transformBox, 'nothing left behind');
});

test('M-13: a child that is not an SVG element keeps its transform-box', () => {
  const { kids } = group(2);
  for (const k of kids) assert.equal(k.style.transformBox, undefined);
});

test('cancelling a draw over several paths restores every path, not only the last', () => {
  const paths = [0, 1, 2].map(() => fakeNode({ getTotalLength: () => 50 }));
  paths.forEach((p, i) => { p.style.strokeDasharray = `${i} 1`; });
  const root = fakeNode({ querySelectorAll: () => paths });
  IchavaMotion.play(root, 'draw').cancel();
  paths.forEach((p, i) => {
    assert.equal(p.style.strokeDasharray, `${i} 1`);
    assert.ok(!p.style.strokeDashoffset);
  });
});
