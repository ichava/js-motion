// The keyframes of the eight families that gained react-icon-browser's richer versions
// (Sim's decision, option (b)): a settling frame for rubber-band, jello, tada, shake-x,
// shake-y, wobble and swing, and a glow whose colour is `--ichm-glow-color` with the
// icon's own colour as the fallback. Pinned at the base variant and at Bold (amplitude
// 1.7), so a change to the shape or to the amplitude maths fails here.
//
// Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import test from 'node:test';

const { default: IchavaMotion } = await import('../src/ichava-motion.ts');
const kf = (id) => IchavaMotion.presets()[id].keyframes;
const GLOW = 'var(--ichm-glow-color, currentColor)';

const EXPECTED = {
  'rubber-band': [{ transform: 'scale(1,1)' }, { transform: 'scale(1.25,0.75)' }, { transform: 'scale(0.85,1.15)' }, { transform: 'scale(1.05,0.95)' }, { transform: 'scale(1,1)' }],
  jello: [{ transform: 'skewX(0deg) skewY(0deg)' }, { transform: 'skewX(-12deg) skewY(-12deg)' }, { transform: 'skewX(6deg) skewY(6deg)' }, { transform: 'skewX(-3deg) skewY(-3deg)' }, { transform: 'skewX(0) skewY(0)' }],
  tada: [{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(0.9) rotate(-3deg)' }, { transform: 'scale(1.1) rotate(3deg)' }, { transform: 'scale(1.1) rotate(-3deg)' }, { transform: 'scale(1) rotate(0)' }],
  'shake-x': [{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(-2px)' }, { transform: 'translateX(0)' }],
  'shake-y': [{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(3px)' }, { transform: 'translateY(-2px)' }, { transform: 'translateY(0)' }],
  wobble: [{ transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(-12%) rotate(-5deg)' }, { transform: 'translateX(8%) rotate(3deg)' }, { transform: 'translateX(-4%) rotate(-2deg)' }, { transform: 'translateX(0) rotate(0)' }],
  swing: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(15deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0deg)' }],
  glow: [{ filter: `drop-shadow(0 0 0 ${GLOW})` }, { filter: `drop-shadow(0 0 5px ${GLOW})` }, { filter: `drop-shadow(0 0 0 ${GLOW})` }],
};

test('the eight families carry the richer keyframes', () => {
  for (const [id, expected] of Object.entries(EXPECTED)) assert.deepEqual(kf(id), expected, id);
});

test('the amplitude still scales them (Bold variant)', () => {
  assert.deepEqual(kf('swing-bold')[3], { transform: `rotate(${5 * 1.7}deg)` });
  assert.deepEqual(kf('wobble-bold')[3], { transform: `translateX(${-4 * 1.7}%) rotate(${-2 * 1.7}deg)` });
  assert.deepEqual(kf('glow-bold')[1], { filter: `drop-shadow(0 0 ${5 * 1.7}px ${GLOW})` });
});

test('the CSS tier glow uses the same colour fallback', async () => {
  const { readFileSync } = await import('node:fs');
  const css = readFileSync(new URL('../dist/ichava-motion.css', import.meta.url), 'utf8');
  const block = css.slice(css.indexOf('@keyframes ichm-glow'), css.indexOf('}', css.indexOf('50%', css.indexOf('@keyframes ichm-glow'))));
  assert.match(block, /drop-shadow\(0 0 5px var\(--ichm-glow-color, currentColor\)\)/);
});
