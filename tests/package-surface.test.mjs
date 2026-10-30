// The deep-import shims src/ichava-motion.js and src/ichava-motion.d.ts were removed.
// These pin the published surface so neither can come back unnoticed: the exports map
// names only the built entry points (plus the Sass source, which is its own entry), and
// the packed tarball carries no JavaScript or declaration file under src/.
// Run: node --test tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

/** Every string target in an exports map, however deeply nested by condition. */
function targets(node) {
  if (typeof node === 'string') return [node];
  return Object.values(node).flatMap(targets);
}

test('the exports map exposes only dist/ entry points, apart from the Sass source', () => {
  const all = Object.entries(pkg.exports).flatMap(([key, value]) =>
    targets(value).map((target) => [key, target]),
  );
  assert.ok(all.length >= 8, `only ${all.length} export targets inspected`);

  const outsideDist = all.filter(([, target]) => !target.startsWith('./dist/'));
  assert.deepEqual(outsideDist, [['./scss', './src/ichava-motion.scss']]);
});

test('package.json names no src/ JavaScript or declaration entry', () => {
  const fields = [pkg.main, pkg.module, pkg.unpkg, pkg.jsdelivr, pkg.types, pkg.typings, ...pkg.files];
  for (const value of fields.filter(Boolean)) {
    assert.doesNotMatch(value, /^(\.\/)?src\/.*\.(m?js|cjs|d\.ts)$/, `${value} ships a src/ entry`);
  }
});

test('the packed tarball ships no src/ichava-motion.js or .d.ts', () => {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const files = JSON.parse(out)[0].files.map((f) => f.path);
  assert.ok(files.includes('package.json'), 'npm pack listed no files');
  assert.ok(files.includes('src/ichava-motion.scss'), 'the Sass entry is no longer packed');

  const shims = files.filter((f) => /^src\/.*\.(m?js|cjs|d\.ts)$/.test(f));
  assert.deepEqual(shims, [], `src/ JavaScript would ship: ${shims.join(', ')}`);
});
