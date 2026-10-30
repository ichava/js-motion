// dist/presets.json: `count` is the number of presets in the manifest, and the manifest
// lists exactly the presets the engine registers (release 0.1.0 finding M-15, audit M20).
// Until then `count` read 242 against 240 entries, because two picker sentinels were
// added to the number but not to the array. Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(readFileSync(new URL('../dist/presets.json', import.meta.url), 'utf8'));
const { default: IchavaMotion } = await import('../src/ichava-motion.ts');

test('the manifest was actually read', () => {
  assert.ok(Array.isArray(manifest.presets) && manifest.presets.length >= 200, 'dist/presets.json has too few presets');
});

test('count equals the number of presets listed', () => {
  assert.equal(manifest.count, manifest.presets.length);
});

test('the manifest lists exactly the presets the engine registers', () => {
  assert.deepEqual(manifest.presets.map((p) => p.id).sort(), [...IchavaMotion.presetIds()].sort());
});

test('the picker sentinels are listed apart, not as presets', () => {
  assert.deepEqual(manifest.sentinels, ['None', 'JSON · Custom']);
  for (const label of manifest.sentinels) assert.ok(!manifest.presets.some((p) => p.label === label));
});
