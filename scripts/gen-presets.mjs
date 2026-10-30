// Emits dist/presets.json — a shareable manifest of the generated preset set
// (id · label · base · direction · once · family). Keyframes live in the engine
// (ichava-motion.js); this manifest is for building preset pickers / tooling and
// is the single source the app can import for labels/metadata. Run: npm run gen.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FAMILIES = [
  ['spin', 'Spin', 1400], ['spin-y', 'Spin Y', 1600], ['spin-z', 'Spin Z', 1600],
  ['flip-x', 'Flip X', 1400], ['flip-y', 'Flip Y', 1400], ['roll', 'Roll', 1200], ['orbit', 'Orbit', 2000],
  ['pulse', 'Pulse', 1200], ['heartbeat', 'Heartbeat', 1000], ['breathe', 'Breathe', 3000],
  ['zoom-in', 'Zoom In', 900, true], ['zoom-out', 'Zoom Out', 900, true], ['pop', 'Pop', 500, true],
  ['rubber-band', 'Rubber Band', 900, true], ['jello', 'Jello', 900, true], ['tada', 'Tada', 1000, true],
  ['bounce', 'Bounce', 900], ['float', 'Float', 2400], ['hop', 'Hop', 800],
  ['slide-up', 'Slide Up', 900, true], ['slide-down', 'Slide Down', 900, true], ['slide-left', 'Slide Left', 900, true], ['slide-right', 'Slide Right', 900, true],
  ['shake-x', 'Shake X', 600], ['shake-y', 'Shake Y', 600], ['vibrate', 'Vibrate', 300], ['wobble', 'Wobble', 1000, true],
  ['wiggle', 'Wiggle', 800], ['swing', 'Swing', 1000, false, 'top center'], ['pendulum', 'Pendulum', 1600, false, 'top center'], ['rock', 'Rock', 1200, false, 'bottom center'],
  ['fade', 'Fade', 1400], ['blink', 'Blink', 1000], ['flash', 'Flash', 1000, true], ['glow', 'Glow', 1600],
  // [id, label, base, once, origin, domOnly, perChild, draw]
  ['draw', 'Draw', 1400, true, undefined, true, false, true],
  ['reveal', 'Reveal', 700, true, undefined, false, true],
  ['cascade', 'Cascade', 700, true, undefined, false, true],
  ['assemble', 'Assemble', 800, true, undefined, false, true],
  ['parallax', 'Parallax', 2600, false, undefined, false, true],
];
const VARIANTS = [
  ['', 1, false], [' · Reverse', 1, true], [' · Subtle', 1.15, false], [' · Subtle · Reverse', 1.15, true], [' · Bold', 0.8, false], [' · Bold · Reverse', 0.8, true],
];
const slug = (s) => (s ? '-' + s.replace(/[·\s]+/g, '').toLowerCase() : '');

const presets = [];
for (const [id, label, base, once = false, origin, domOnly = false, perChild = false, draw = false] of FAMILIES) {
  for (const [suffix, durMul, reverse] of VARIANTS) {
    presets.push({
      id: id + slug(suffix),
      label: label + suffix,
      base: Math.round(base * durMul),
      direction: reverse ? 'reverse' : 'normal',
      once,
      origin: origin ?? null,
      domOnly,
      perChild,
      draw,
      family: id,
    });
  }
}

const out = {
  version: '1.0.0',
  // count is the length of `presets`, nothing else (release 0.1.0 finding M-15). The two
  // picker sentinels, None and JSON · Custom, are not animations and are listed apart.
  count: presets.length,
  sentinels: ['None', 'JSON · Custom'],
  easings: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'spring', 'back', 'steps(8)', 'ease-in-quad', 'ease-out-cubic'],
  variants: VARIANTS.map(([s]) => s || 'default'),
  presets,
};

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'presets.json');
writeFileSync(dist, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${presets.length} presets → dist/presets.json`);
