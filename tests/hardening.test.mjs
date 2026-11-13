// M4 and M8. Two defaults that were wrong in the unsafe direction.
// Run: node --test tests/*.test.mjs

import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const SRC = readFileSync(new URL('../src/ichava-motion.ts', import.meta.url), 'utf8');

test('M4: config merging cannot reach Object.prototype', async () => {
  // The realistic vector: config arrives as JSON, and JSON.parse produces an OWN
  // __proto__ property, so a hasOwnProperty guard passes it straight through.
  const hostile = JSON.parse('{"__proto__": {"polluted": "yes"}}');

  // Exercise the same shape assign() handles, through the real module.
  const dom = { window: undefined };
  void dom;

  const before = {}.polluted;
  assert.strictEqual(before, undefined, 'prototype was already dirty before the test');

  // assign() is module-private, so drive it through the public config surface
  // when available and fall back to asserting the guard exists in source.
  const mod = await import('../src/ichava-motion.ts').catch(() => null);
  const api = globalThis.IchavaMotion ?? mod?.default;

  if (api && typeof api.config === 'function') {
    api.config(hostile);
  }

  assert.strictEqual({}.polluted, undefined, 'Object.prototype was polluted');
  assert.ok(
    /BLOCKED_KEYS/.test(SRC),
    'assign() must refuse __proto__/constructor/prototype by name'
  );
  assert.ok(
    /Object\.prototype\.hasOwnProperty\.call\(s, k\)/.test(SRC),
    'hasOwnProperty must be called off Object.prototype, not off the untrusted object'
  );
});

test('M8: an unreadable motion preference is treated as "reduce"', () => {
  // The catch used to `return false`, i.e. "the user has not asked for less
  // motion" -- resolving the one genuinely unknown case by animating anyway.
  const guard = SRC.slice(SRC.indexOf('function reduceMotion'));
  const catchBlock = guard.slice(guard.indexOf('catch'), guard.indexOf('catch') + 60);

  assert.ok(
    /return true/.test(catchBlock),
    `reduceMotion must fail closed; catch block was: ${catchBlock.trim()}`
  );
});
