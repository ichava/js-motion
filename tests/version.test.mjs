// V-B7: the engine reports the package's version, not a number of its own.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

globalThis.window = { matchMedia: () => ({ matches: false }) };
globalThis.document = { documentElement: { hasAttribute: () => false }, querySelector: () => null };
const { default: IchavaMotion } = await import('../src/ichava-motion.ts');
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('IchavaMotion.version is package.json version', () => {
  assert.equal(IchavaMotion.version, pkg.version);
});

test('every built entry point carries the same version', () => {
  for (const f of ['ichava-motion.js', 'ichava-motion.mjs', 'ichava-motion.cjs', 'ichava-motion.min.js']) {
    const src = readFileSync(new URL(`../dist/${f}`, import.meta.url), 'utf8');
    assert.ok(['"', "'", '`'].some((q) => src.includes(`${q}${pkg.version}${q}`)), `${f} does not carry ${pkg.version}`);
    assert.ok(!/["'`]1\.0\.0["'`]/.test(src), `${f} still says 1.0.0`);
  }
});
