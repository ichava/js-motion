// Phase 1: M1 (draw cancel restores strokes), M2 (one handle per group), M5/M-11
// (transform-origin restored on cancel), S11 (Lottie 'full' needs an explicit opt-in),
// S12 (the Lottie adapter's provenance is pinned).
// Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

globalThis.window = { matchMedia: () => ({ matches: false }) };
globalThis.document = { documentElement: { hasAttribute: () => false }, querySelector: () => null };
const { default: IchavaMotion } = await import('../src/ichava-motion.ts');

/** A WAAPI-shaped fake: records calls, and fires 'cancel' listeners on cancel(). */
function fakeAnimation() {
  const listeners = { cancel: [] };
  const a = {
    calls: [],
    playState: 'running',
    addEventListener: (type, fn) => (listeners[type] ||= []).push(fn),
    cancel() { a.calls.push('cancel'); a.playState = 'idle'; (listeners.cancel || []).forEach((f) => f()); },
    pause() { a.calls.push('pause'); },
    play() { a.calls.push('play'); },
    finish() { a.calls.push('finish'); },
  };
  return a;
}
function fakeNode(extra = {}) {
  const made = [];
  const n = { style: {}, made, animate: () => { const a = fakeAnimation(); made.push(a); return a; }, ...extra };
  return n;
}
function fakePath(len) {
  return fakeNode({ getTotalLength: () => len });
}

test('M1: cancelling a draw animation restores each stroke', () => {
  const p = fakePath(100);
  p.style.strokeDasharray = '4 2';
  const root = fakeNode({ querySelectorAll: () => [p] });
  const handle = IchavaMotion.play(root, 'draw');
  assert.equal(p.style.strokeDashoffset, '100', 'hidden while drawing');
  handle.cancel();
  assert.equal(p.style.strokeDasharray, '4 2', 'author dasharray restored');
  assert.ok(!p.style.strokeDashoffset, 'dashoffset cleared');
});

test('M2: a group animation returns one handle that controls every child', () => {
  const kids = [fakeNode(), fakeNode(), fakeNode()];
  const root = fakeNode({ querySelectorAll: (sel) => (sel === '[data-layer]' ? kids : []) });
  const handle = IchavaMotion.play(root, 'reveal');
  assert.equal(handle.animations.length, 3);
  for (const m of ['pause', 'play', 'finish', 'cancel']) handle[m]();
  for (const k of kids) assert.deepEqual(k.made[0].calls, ['pause', 'play', 'finish', 'cancel']);
});

test('M2: a single-element play still returns the plain animation', () => {
  const el = fakeNode();
  const handle = IchavaMotion.play(el, 'spin');
  assert.equal(handle, el.made[0]);
});

test('M5: transform-origin is restored when the animation is cancelled', () => {
  const el = fakeNode();
  el.style.transformOrigin = '10px 10px';
  const handle = IchavaMotion.playSpec(el, { keyframes: [{ opacity: 0 }, { opacity: 1 }], origin: 'top center' });
  assert.equal(el.style.transformOrigin, 'top center');
  handle.cancel();
  assert.equal(el.style.transformOrigin, '10px 10px');
});

test("S11: lottie 'full' needs the explicit opt-in naming the risk", () => {
  const loaded = [];
  const player = { loadAnimation: (o) => loaded.push(o) };
  const m = IchavaMotion.create().config({ lottie: 'full', lottiePlayer: player });
  const json = { v: '5', ip: 0, op: 1, layers: [] };
  const warn = console.warn; const warns = []; console.warn = (s) => warns.push(String(s));
  try {
    m.animate(fakeNode(), json);
    assert.equal(loaded.length, 0, 'refused without the flag');
    assert.match(warns.join(), /lottieFullAcknowledgeEvalRisk/);
    m.config({ lottieFullAcknowledgeEvalRisk: true }).animate(fakeNode(), json);
    assert.equal(loaded.length, 1, 'allowed once acknowledged');
  } finally { console.warn = warn; }
});

test('S12: the Lottie adapter is first-party source, pinned by checksum, with no eval surface', () => {
  const buf = readFileSync(new URL('../dist/ichava-motion-lottie.js', import.meta.url));
  const src = buf.toString('utf8');
  assert.doesNotMatch(src, /\beval\b|new Function|\bFunction\(|innerHTML|__proto__/);
  const sum = createHash('sha256').update(buf).digest('hex');
  const doc = readFileSync(new URL('../docs/lottie.md', import.meta.url), 'utf8');
  assert.ok(doc.includes(sum), `docs/lottie.md must record the adapter's sha256 (${sum})`);
});
