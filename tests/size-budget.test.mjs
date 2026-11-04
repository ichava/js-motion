// M12 (V-B6). The minified <script> build, its size budget, and the SRI manifest.
//
// Measured 2026-11-04 with `npm run build`:
//   before this change  dist/ichava-motion.js      24,621 B   5,551 B gzip -9 (no minified build existed)
//   after               dist/ichava-motion.js      29,068 B   6,617 B gzip -9 (pause/stop, unwire/destroy, num())
//                       dist/ichava-motion.min.js  17,601 B   5,191 B gzip -9
// The budget is the minified size plus 10 %. Raising it is a decision: re-measure, and
// update both the numbers above and the constants below in the same commit.
// Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { gzipSync } from 'node:zlib';

const MIN_MEASURED = 17601;
const MIN_GZIP_MEASURED = 5191;
const BUDGET = Math.floor(MIN_MEASURED * 1.1);
const GZIP_BUDGET = Math.floor(MIN_GZIP_MEASURED * 1.1);

const dist = new URL('../dist/', import.meta.url);
const min = readFileSync(new URL('ichava-motion.min.js', dist));

test(`M12: dist/ichava-motion.min.js is within its budget (${BUDGET} B, ${GZIP_BUDGET} B gzip)`, () => {
  assert.ok(min.length <= BUDGET, `${min.length} B is over the ${BUDGET} B budget`);
  const gz = gzipSync(min, { level: 9 }).length;
  assert.ok(gz <= GZIP_BUDGET, `${gz} B gzip is over the ${GZIP_BUDGET} B budget`);
});

test('M12: the minified build is minified, and smaller than the unminified IIFE', () => {
  const full = readFileSync(new URL('ichava-motion.js', dist));
  assert.ok(min.length < full.length * 0.8, `${min.length} B is not much smaller than ${full.length} B`);
  assert.ok(!min.includes('/*'), 'block comments survived minification');
});

test('M12: the minified build is the same library under the same global', () => {
  const ctx = {};
  runInNewContext(min.toString('utf8'), ctx);
  const api = ctx.IchavaMotion;
  assert.equal(typeof api, 'object', 'no IchavaMotion global');
  for (const m of ['animate', 'play', 'playSpec', 'auto', 'unwire', 'destroy', 'pauseAll', 'resumeAll', 'stopAll', 'autoInit', 'catalog']) {
    assert.equal(typeof api[m], 'function', `${m} missing`);
  }
  assert.equal(api.presetIds().length, 240);
});

test('M12: dist/integrity.json holds the sha384 of every dist file, and each matches', () => {
  const manifest = JSON.parse(readFileSync(new URL('integrity.json', dist), 'utf8'));
  const files = readdirSync(dist, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name !== 'integrity.json' && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort();
  // Assert the size of what was inspected: an empty or half-built dist/ must not pass.
  assert.ok(files.length >= 11, `only ${files.length} files in dist/`);
  assert.deepEqual(Object.keys(manifest).sort(), files, 'integrity.json lists exactly the files in dist/');
  for (const name of files) {
    const fresh = 'sha384-' + createHash('sha384').update(readFileSync(new URL(name, dist))).digest('base64');
    assert.equal(manifest[name], fresh, `${name}: integrity.json is stale, run npm run build`);
  }
});
