// The deprecated deep-import path src/ichava-motion.js (shipped while the source was
// plain JS) still works for a bundler that ignores `exports`, and is the same instance
// as the published entry point. Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

test('src/ichava-motion.js forwards to the published build', async (t) => {
  if (!existsSync(new URL('../dist/ichava-motion.mjs', import.meta.url))) return t.skip('not built');
  const [{ default: deep }, { default: published }] = await Promise.all([
    import('../src/ichava-motion.js'),
    import('../dist/ichava-motion.mjs'),
  ]);
  assert.equal(deep, published);
  assert.equal(typeof deep.play, 'function');
});
