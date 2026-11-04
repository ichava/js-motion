import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

/**
 * Entry points: import, require and <script> must all work.
 *
 * The package advertised `require` support in its `exports` map and had no CJS build; it
 * advertised a module entry and had no ESM build. The single shipped artifact was an IIFE
 * that read `window` at module scope, so `import`ing it under Node threw before any of the
 * library ran -- and because `dist/ichava-motion.js` was a byte-identical hand copy of the
 * source, there was no build step in which to notice.
 *
 * These assert the three loading paths against the built artifacts, so a broken or missing
 * build fails rather than being discovered by a consumer.
 */

const require = createRequire(import.meta.url);

test('ESM: import resolves without a DOM', async () => {
  const mod = await import('../dist/ichava-motion.mjs');
  const M = mod.default;
  assert.equal(typeof M, 'object', 'default export is not the library');
  assert.equal(typeof M.animate, 'function');
  assert.equal(typeof M.presets, 'function');
  // Default-only on purpose: a named export makes Rollup emit a namespace object as the
  // IIFE global, which would turn `IchavaMotion.animate` into
  // `IchavaMotion.default.animate` for every <script> and CDN consumer.
  assert.equal(mod.IchavaMotion, undefined);
});

test('CJS: require resolves without a DOM', () => {
  const M = require('../dist/ichava-motion.cjs');
  const lib = M.default ?? M;
  assert.equal(typeof lib.animate, 'function');
  assert.equal(typeof lib.presetIds, 'function');
});

test('the package exports map points at files that exist', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const targets = [
    pkg.exports['.'].import,
    pkg.exports['.'].require,
    pkg.exports['./css'],
    pkg.exports['./presets'],
    pkg.main,
    pkg.module,
    pkg.unpkg,
  ];
  for (const t of targets) {
    // An exports map that names a missing file is the defect this whole change fixes.
    assert.doesNotThrow(
      () => readFileSync(new URL('../' + t.replace(/^\.\//, ''), import.meta.url)),
      `${t} is declared in package.json but does not exist`,
    );
  }
});

test('the IIFE build assigns the global and is not an ES module', () => {
  const src = readFileSync(new URL('../dist/ichava-motion.js', import.meta.url), 'utf8');
  // The `<script>` path: it has to define the global the docs and CDN URLs promise.
  assert.match(src, /IchavaMotion/, 'IIFE does not reference the global name');
  assert.doesNotMatch(src, /^\s*export\s/m, 'IIFE contains ESM syntax and will not run in a <script>');
});

test('auto-init is opt-in, not opt-out', async () => {
  const { default: M } = await import('../dist/ichava-motion.mjs');
  // WCAG 2.2.2: looping motion must not start just because a script loaded. The old build
  // ran on DOMContentLoaded unless a global opt-out was set before it.
  assert.equal(typeof M.autoInit, 'function', 'no explicit opt-in is available');
  // Calling it without a DOM must be a no-op rather than a crash, so SSR is safe.
  assert.doesNotThrow(() => M.autoInit());
});
