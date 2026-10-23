// catalog(): the families and variants the preset registry is generated from, typed, so a
// picker (react-icon-browser's motion menu) can list them without keeping its own copy
// of the tables. Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import test from 'node:test';

const { default: IchavaMotion } = await import('../src/ichava-motion.ts');

test('catalog() lists every family and variant the registry is built from', () => {
  const { families, variants } = IchavaMotion.catalog();
  assert.equal(families.length, 40);
  assert.equal(variants.length, 6);
  assert.equal(IchavaMotion.presetIds().length, families.length * variants.length);
  for (const f of families) assert.equal(IchavaMotion.presets()[f.id].family, f.id);
  assert.deepEqual(variants[0], { s: '', a: 1, d: 1, r: false });
});

test('it is a copy: changing it does not change the engine', () => {
  const c = IchavaMotion.catalog();
  c.families.length = 0;
  c.variants[0].a = 99;
  assert.equal(IchavaMotion.catalog().families.length, 40);
  assert.equal(IchavaMotion.catalog().variants[0].a, 1);
});

test('it follows registration, per instance', () => {
  const m = IchavaMotion.create().registerFamily({ id: 'blip', label: 'Blip', base: 500, kf: () => [{ opacity: 0 }, { opacity: 1 }] });
  assert.ok(m.catalog().families.some((f) => f.id === 'blip'));
  assert.ok(!IchavaMotion.catalog().families.some((f) => f.id === 'blip'));
});
