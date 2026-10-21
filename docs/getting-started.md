[← Package README](../README.md#documentation)

# Getting started

*Tutorial.*

Animate an SVG in one line, then learn what the line is doing.

## The shortest thing that works

```html
<svg class="ichm ichm-spin" viewBox="0 0 24 24">…</svg>
```

Two classes: `ichm` marks the element as animatable, `ichm-<preset>` picks the animation. That is
the CSS-only tier and it needs no JavaScript at all.

## Auto-init is opt-in

The engine does **not** scan the document on load. Nothing animates because a script was included;
you ask for it:

```js
import { init } from '@ichava/js-motion'

init()
```

This is deliberate. A library that starts animating the page the moment it loads is impossible to
adopt incrementally and impossible to debug.

## Choosing a preset

240 presets across 40 families, each in up to six variants: default, Subtle, Bold, and a reverse of
each. `spin`, `spin-subtle`, `spin-bold-reverse` are all the same family at different intensities.

```js
import presets from '@ichava/js-motion/presets'

presets.presets.filter(p => p.family === 'spin')
```

The manifest's `count` field reads 242 rather than 240: it includes the engine's two sentinels,
`None` and `JSON · Custom`, which are picker options rather than animations.

## Respecting reduced motion

The engine checks `prefers-reduced-motion` and stands down when the user has asked for less. You do
not have to wire that up, and you should not override it.

## Where to go next

- [Presets](presets.md), the families, the variants, and how the manifest is shaped
- [Architecture](architecture.md), the three tiers and why they are separate
- [Lottie](lottie.md), the opt-in adapter
- [Release](release.md): how a version is cut

---

[← Docs index](../README.md#documentation)
