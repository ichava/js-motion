// IchavaMotion.create() returns an independent engine: its own preset registry, easings
// and config. Registering on one never reaches another or the default instance, which
// is what lets two embeds on one page configure motion separately.
//
// Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import test from 'node:test';

globalThis.window = { matchMedia: () => ({ matches: false }) };
globalThis.document = { documentElement: { hasAttribute: () => false }, querySelector: () => null };
const { default: IchavaMotion } = await import('../src/ichava-motion.ts');
const el = () => ({ style: {}, animate: (_kf, timing) => timing });

test('create() returns a fresh engine with the full API and the full preset set', () => {
  const m = IchavaMotion.create();
  assert.notEqual(m, IchavaMotion);
  for (const k of Object.keys(IchavaMotion)) assert.equal(typeof m[k], typeof IchavaMotion[k], k);
  assert.deepEqual(m.presetIds(), IchavaMotion.presetIds());
});

test('registering on an instance reaches neither the default nor another instance', () => {
  const a = IchavaMotion.create();
  const b = IchavaMotion.create();
  // registerFamily rebuilds the generated registry, so register a single preset after it.
  a.registerFamily({ id: 'blip', label: 'Blip', base: 500, kf: () => [{ opacity: 0 }, { opacity: 1 }] });
  a.register('only-a', { keyframes: [{ opacity: 0 }, { opacity: 1 }] }).registerEasing('snap', 'cubic-bezier(.2,1.4,.4,1)');
  assert.ok(a.presetIds().includes('only-a'));
  assert.ok(a.presetIds().includes('blip-bold'));
  for (const other of [b, IchavaMotion]) {
    assert.ok(!other.presetIds().includes('only-a'));
    assert.ok(!other.presetIds().includes('blip'));
    assert.equal(other.easings().snap, undefined);
  }
});

test('config is per instance', () => {
  const a = IchavaMotion.create().config({ defaults: { easing: 'linear' } });
  const b = IchavaMotion.create();
  const spec = { keyframes: [{ opacity: 0 }, { opacity: 1 }], base: 1000 };
  assert.equal(a.playSpec(el(), spec).easing, 'linear');
  assert.equal(b.playSpec(el(), spec).easing, 'ease-in-out');
  assert.equal(IchavaMotion.playSpec(el(), spec).easing, 'ease-in-out');
});

test('chaining returns the instance it was called on', () => {
  const a = IchavaMotion.create();
  assert.equal(a.config({}), a);
  assert.equal(a.registerEasing('x', 'linear'), a);
  assert.notEqual(a.create(), a);
});
