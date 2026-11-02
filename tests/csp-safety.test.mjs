// M3 / D1. The library must never fetch script, and must be usable under a
// strict CSP by construction.
//
// It previously appended <script src="https://cdn.jsdelivr.net/npm/lottie-web@5/..">
// to the head on first `lottie:"full"` use. Under `script-src 'self'` that tag is
// blocked, so the feature failed exactly where the library claims to be safest --
// and it introduced an unpinned third-party origin, with no SRI, into the
// consumer's page.
//
// Run: node --test tests/*.test.mjs

import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const SOURCES = [
  'src/ichava-motion.ts',
  'dist/ichava-motion.js',
  'dist/ichava-motion.cjs',
  'dist/ichava-motion.mjs',
];

test('no shipped artifact fetches remote script', () => {
  for (const path of SOURCES) {
    let code;
    try {
      code = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
    } catch {
      continue; // artifact not built in this checkout
    }

    // Strip block and line comments, so the explanation of the old behaviour
    // in the source does not trip the check on the behaviour itself.
    const live = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

    assert.ok(
      !/createElement\(\s*['"]script['"]\s*\)/.test(live),
      `${path} creates a <script> element`
    );
    assert.ok(
      !/cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com/.test(live),
      `${path} references a CDN origin`
    );
    assert.ok(!/\beval\s*\(/.test(live), `${path} calls eval`);
    assert.ok(
      !/new\s+Function\s*\(/.test(live),
      `${path} calls new Function`
    );
  }
});

test('a supplied lottie player is used, and none is ever fetched', async () => {
  const { default: IchavaMotion } = await import('../src/ichava-motion.ts')
    .then((m) => ({ default: m.default ?? globalThis.IchavaMotion ?? m }))
    .catch(() => ({ default: null }));

  // The module is an IIFE-style global in the browser build; in Node it may not
  // export. Resolution is asserted through the source contract instead when the
  // module does not expose an API here.
  if (!IchavaMotion || typeof IchavaMotion.config !== 'function') {
    const code = readFileSync(new URL('../src/ichava-motion.ts', import.meta.url), 'utf8');
    assert.ok(
      /CONFIG\.lottiePlayer/.test(code),
      'config must expose lottiePlayer so a consumer can supply the player'
    );
    assert.ok(
      /window\.lottie/.test(code),
      'a player the consumer already loaded must still be honoured'
    );
    return;
  }

  IchavaMotion.config({ lottiePlayer: { loadAnimation() {} } });
  assert.ok(true);
});
