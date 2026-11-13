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
     data-motion-duration="900"
     data-motion-iterations="3">…</svg>
```

Every number (`speed`, `duration`, `delay`, `iterations`, `stagger`) is checked before it reaches the
Web Animations API. A value it would reject, such as `data-motion-duration="abc"` or `"-5"`, takes the
default and logs one `console.warn` naming the attribute, so one typo no longer stops the element from
wiring. Anything the API accepts still plays, a negative `delay` included.

`IchavaMotion.auto(root)` wires one subtree instead of the whole document. Pass `{ observe: true }` to wire
elements added under it later as well, which a list that re-renders needs:

```js
const motion = IchavaMotion.create();
motion.auto(heroEl, { observe: true });   // also wires tiles added after this call
// later, when heroEl goes away:
motion.unwire(heroEl);                    // or motion.destroy() to tear the whole engine down
```

`unwire(root)` removes the listeners from every wired element under `root` and cancels what they were
playing; a later `auto()` can wire them again. `destroy()` unwires the document, stops every animation,
and disconnects the observers, pause controls and reduced-motion listener the engine installed. Use a
`create()` instance when you destroy, so another embed on the page sharing the default engine keeps
its animations.

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
- `config({ lottie: 'full' })`: for arbitrary bodymovin, hands the JSON to a **lottie-web you supply**
  (`config({ lottiePlayer })` or `window.lottie`); this library never fetches one. It does nothing until you
  also set `lottieFullAcknowledgeEvalRisk: true`; read the warning below first.

> **Warning: `'full'` can execute code from the animation file.** The full lottie-web build evaluates
> expression fields in Lottie JSON with `eval`. Any Lottie file from a user, a third party or a URL you do
> not control is therefore code running in your page. For untrusted input use `'import'`, or supply
> `lottie_light`, which has no expression support. The default stays `'off'`, and `'full'` is inert until
> you opt in:
>
> ```js
> IchavaMotion.config({ lottie: 'full', lottiePlayer: lottie, lottieFullAcknowledgeEvalRisk: true });
> ```

### Controlling a running animation

`play()` returns the WAAPI `Animation` (or `null`). For a group family (`reveal`, `cascade`, `draw` and the
other per-child presets) it returns the last child's `Animation` with `cancel()`, `pause()`, `play()`,
`finish()` and `reverse()` applied to every child, and all of them in `animations` (typed as
`GroupAnimation`). Two more members act on the group as a whole:

- `seek(ms)` sets every child's `currentTime` to the same timeline time, so the stagger between them is
  kept: `handle.seek(0)` rewinds the whole group.
- `finished` resolves to the handle once every child has finished, not only the last one, and rejects
  if one is cancelled.

```js
const handle = IchavaMotion.play(svg, 'reveal', { iterations: 1 });
handle.seek(400);
await handle.finished; // every layer is in place
handle.reverse();      // and out again
```

An animated SVG child gets `transform-box: fill-box`, so a scale or a rotate turns around the layer's
own box rather than the SVG's origin. Cancelling puts back every inline style the animation set
(`transform-origin`, `transform-box`, and each `draw` path's `stroke-dasharray` and `stroke-dashoffset`),
so a cancelled preview is not left hidden or re-pivoted.

### Pausing and stopping everything

The engine keeps every animation it started until it finishes or is cancelled, including the ones the
declarative path started and never handed out:

```js
IchavaMotion.pauseAll();   // every live animation, paused where it is
IchavaMotion.resumeAll();  // carries on from there; a no-op under reduced motion
IchavaMotion.stopAll();    // cancels them; they cannot be resumed
```

Each returns the engine, so they chain. They act on one engine: an instance from `create()` has its own set.

## Accessibility

Honors `prefers-reduced-motion` (and a host `[data-reduce-motion]`) by not starting animations, and
reacts when the preference changes while the page is open: turning it on stops every running animation.
Override with `config({ reduceMotion: 'off' })`.

WCAG 2.2.2 asks that motion which loops for more than five seconds can be paused. The engine renders no
button; give it yours, and a click toggles `pauseAll()`/`resumeAll()` and keeps `aria-pressed` in step:

```html
<button type="button" id="pause-motion">Pause animations</button>
<script>IchavaMotion.autoInit({ pauseControl: '#pause-motion' })</script>
```

`auto(root, { pauseControl })` takes the same option, and `destroy()` detaches it.

---

[← Docs index](../README.md#documentation)
