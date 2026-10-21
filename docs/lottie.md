[← Package README](../README.md#documentation)

# Lottie

*How-to guide.*

Lottie support is a **separate entry point** and stays that way: the runtime is large, most callers
do not want it, and the core's zero-dependency promise is worth more than the convenience of an
implicit import.

## Using it

```js
import { mountLottie } from '@ichava/js-motion/lottie'
```

The adapter looks for a Lottie runtime on `window.lottie`, or the bundled global
`window.IchavaMotionLottie` if you loaded the packaged build. It does not fetch one for you: which
Lottie build to ship: light, full, canvas, SVG: is a decision with real size consequences, and it
belongs to the application.

## When it is worth it

A Lottie file carries keyframe data authored in After Effects. That is the right tool for an
illustration with dozens of coordinated moving parts. It is the wrong tool for a spinner: a CSS
preset does that in bytes rather than kilobytes.

Reach for Lottie when the animation could not reasonably be expressed as a CSS keyframe, and for
nothing else.

## Behaviour

The adapter honours the same `prefers-reduced-motion` check as the rest of the engine, so a user who
has asked for less motion gets a static first frame rather than a loop.

---

[← Docs index](../README.md#documentation)
