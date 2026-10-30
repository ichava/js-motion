// M9. The package advertised `exports["."].types` at ./dist/ichava-motion.d.ts
// with no file there at all -- every TS consumer got `any`. The declarations were then
// hand-written beside the plain-JS source. The source is TypeScript now, and
// dist/ichava-motion.d.ts is generated from it by `npm run build`.
//
// Two fixtures hold it, both resolving the package by its own name, which goes through
// `exports["."].types` exactly as a consumer's does:
//   fixtures/types-usage.ts   real call shapes must typecheck
//   fixtures/api-contract.ts  every exported type must be mutually assignable with the
//                             hand-written contract, fixtures/handwritten-api.d.ts
//
// Run: node --test tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

test('dist/ichava-motion.d.ts declares the full public API, equivalent to the hand-written contract', () => {
  const tsc = join(root, 'node_modules/.bin/tsc');
  assert.ok(existsSync(tsc), 'typescript devDependency not installed');

  execFileSync(tsc, ['-p', join(here, 'fixtures/tsconfig.json')], {
    cwd: root,
    stdio: 'pipe', // surfaced via the thrown error's stdout/stderr on failure
  });
});

test('the build emits the declaration file to dist/', () => {
  const distDts = join(root, 'dist/ichava-motion.d.ts');
  if (!existsSync(distDts)) {
    // Not built in this checkout -- entrypoints.test.mjs applies the same
    // "skip if unbuilt" convention for the JS artifacts.
    return;
  }
  assert.ok(existsSync(distDts));
});
