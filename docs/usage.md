[← Package README](../README.md#documentation)

# Usage

*Guide.*

The three ways to drive the engine, the preset set, layered illustrations, configuration, the Lottie
tier and reduced motion, in one page. This text was the README's tour before 0.1.0.

## Three ways to animate

**1 · CSS-only (no JS)**: add a class; the base families ship as `@keyframes`:

```html
<svg class="ichm-spin">…</svg>   <!-- or .ichm-pulse .ichm-bounce .ichm-heartbeat … -->
```
Tune with CSS vars: `--ichm-duration`, `--ichm-easing`, `--ichm-iterations` (globally or per element), and `--ichm-glow-color` for the glow family (the icon's own colour when unset; set it to your accent to make the glow follow it).

**2 · Declarative JS**: `data-*` on the element; call `IchavaMotion.autoInit()` once to wire them (auto-init is opt-in):

```html
<svg data-ichava-motion="spin-bold"
     data-motion-trigger="hover"      <!-- load | hover | click | visible | loop -->
     data-motion-speed="1.5"
     data-motion-easing="spring"
     data-motion-delay="200"
     data-motion-direction="reverse"
     data-motion-iterations="3">…</svg>
```

**3 · Imperative**

```js
IchavaMotion.play(el, 'heartbeat', { speed: 1, easing: 'ease-in-out', delay: 0, iterations: 'infinite' });
IchavaMotion.animate(el, { keyframes: [{transform:'rotate(0)'},{transform:'rotate(360deg)'}], duration: 1400, easing: 'linear', iterations: 'infinite' });
```

`animate(el, source)` routes by content: a **preset id** → preset, an **our-schema JSON** → WAAPI, a
**bodymovin/Lottie JSON** → the Lottie tier (see below).

## Presets

40 families × 6 variants (`default`, `· Reverse`, `· Subtle`, `· Subtle · Reverse`, `· Bold`,
`· Bold · Reverse`) = **240**. Spin, Spin Y, Spin Tilt, Flip X/Y, Roll, Orbit, Pulse, Heartbeat, Breathe, Zoom
In/Out, Pop, Rubber Band, Jello, Tada, Bounce, Float, Hop, Slide ×4, Shake X/Y, Vibrate, Wobble, Wiggle,
Swing, Pendulum, Rock, Fade, Blink, Flash, Glow, Draw, plus the illustration families below.
`IchavaMotion.presetIds()` lists them; `dist/presets.json` is a shareable manifest
(id · label · base · direction · once · family · perChild · draw).

## Illustrations (layered SVGs)

For multi-layer SVGs (spot illustrations), these families animate the SVG's **child layers** with a
per-child stagger instead of moving the whole element:

- **Reveal / Cascade / Assemble**: each layer fades/rises/scales/slides in, staggered.
- **Parallax**: layers drift at a phase offset for depth.
- **Draw**: measures each child `path` (`getTotalLength()`) and animates its `stroke-dashoffset` to 0.

Mark the layers with `data-layer` (or use direct `<g>`/`<path>` children):

```html
<svg data-ichava-motion="reveal" data-motion-trigger="visible" data-motion-stagger="90">
  <g data-layer>…</g>
  <g data-layer>…</g>
</svg>
```

`data-motion-stagger` (ms) overrides the per-child delay; multicolor fills are never touched.

## Configure & extend

```js
IchavaMotion.config({
  defaults: { easing: 'ease-in-out', speed: 1, trigger: 'load' },
  lottie: 'off',          // 'off' | 'import' | 'full'
  reduceMotion: 'respect' // 'respect' | 'off'
});
IchavaMotion.register('my-preset', { keyframes: [...], base: 800, iterations: 1 });
IchavaMotion.registerEasing('snappy', 'cubic-bezier(.2,.8,.2,1)');
IchavaMotion.registerFamily({ id: 'twirl', label: 'Twirl', base: 1000, kf: (a) => [...] }); // grows the variant set
```
Custom `cubic-bezier(...)` / `steps(...)` easings are accepted verbatim.

`IchavaMotion` is one engine; `IchavaMotion.create()` makes another, with its own presets,
easings and config, so two embeds on one page can configure motion separately:

```js
const motion = IchavaMotion.create().config({ reduceMotion: 'respect' }).registerEasing('snap', 'cubic-bezier(.2,1.4,.4,1)');
motion.play(el, 'spin-subtle', { speed: 1.25 });
```

## Lottie (tiered and opt-in, so the core stays light)

- `config({ lottie: 'off' })`: **default**; ignores bodymovin JSON. Core payload only.
- `config({ lottie: 'import' })` + `<script src="dist/ichava-motion-lottie.js">`: maps **simple**
  single-layer bodymovin (transform/opacity keyframes) → our schema, played via WAAPI. No shapes/masks.
- `config({ lottie: 'full' })`: for arbitrary bodymovin, **lazy-loads `lottie-web`** on demand (fetched
  only when a complex file is passed; not in the core bundle).

## Accessibility

Honors `prefers-reduced-motion` (and a host `[data-reduce-motion]`) by not starting animations. Override
with `config({ reduceMotion: 'off' })`.

---

[← Docs index](../README.md#documentation)
