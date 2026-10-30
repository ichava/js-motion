// The tilted spin is `spin-tilt` (release 0.1.0 finding M-16, audit M25). It shipped as
// `spin-z`, which misdescribed it: `spin` already rotates about Z, and this family adds a
// rotateX(20deg) tilt. The rename carries no forwarding alias, so the old id must appear
// nowhere the package ships or documents. CHANGELOG.md is left out on purpose: it records
// the rename. Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const DIRS = ['src', 'dist', 'docs', 'demo', 'scripts'];
const OLD = /spin-z\b|Spin Z\b/i;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = DIRS.flatMap((d) => walk(join(root, d)));

test('the sweep read the tree it claims to', () => {
  // src, dist (bundles, maps, CSS, declarations, presets.json), docs, demo, scripts.
  assert.ok(files.length >= 20, `only ${files.length} files under ${DIRS.join(', ')}`);
  assert.ok(files.some((f) => f.endsWith(join('dist', 'presets.json'))), 'dist/presets.json not inspected');
});

test('the old id appears nowhere in src, dist, docs, demo or scripts', () => {
  const hits = files.filter((f) => OLD.test(readFileSync(f, 'utf8'))).map((f) => f.slice(root.length));
  assert.deepEqual(hits, []);
});

test('the engine registers the spin-tilt family and not spin-z', async () => {
  const { default: IchavaMotion } = await import('../src/ichava-motion.ts');
  const ids = IchavaMotion.presetIds();
  for (const id of ['spin-tilt', 'spin-tilt-reverse', 'spin-tilt-subtle', 'spin-tilt-subtlereverse', 'spin-tilt-bold', 'spin-tilt-boldreverse']) {
    assert.ok(ids.includes(id), `${id} missing from presetIds()`);
  }
  assert.ok(!ids.some((id) => id.startsWith('spin-z')), 'a spin-z id is still registered');
});

test('the manifest lists the spin-tilt family under its own name', () => {
  const manifest = JSON.parse(readFileSync(join(root, 'dist', 'presets.json'), 'utf8'));
  const family = manifest.presets.filter((p) => p.family === 'spin-tilt');
  assert.equal(family.length, 6);
  assert.equal(family.find((p) => p.id === 'spin-tilt').label, 'Spin Tilt');
});
