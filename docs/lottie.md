[← Package README](../README.md#documentation)

# Lottie

*How-to guide.*

Lottie support is a **separate entry point** and stays that way: the runtime is large, most callers
do not want it, and the core's zero-dependency promise is worth more than the convenience of an
implicit import.

## Using it

`@ichava/js-motion/lottie` is a classic script that sets `window.IchavaMotionLottie` (and
`module.exports` under CommonJS). It exposes one function, `toSpec(json)`, which turns a simple
single-layer bodymovin file into a motion spec; the engine plays that spec through WAAPI.

```js
import '@ichava/js-motion/lottie'
IchavaMotion.config({ lottie: 'import' })
IchavaMotion.animate(el, bodymovinJson)
```

For arbitrary Lottie, `lottie: 'full'` hands the JSON to a lottie-web you supply (`config({ lottiePlayer })`
or `window.lottie`). This library never fetches one: which build to ship (light, full, canvas, SVG) has real
size consequences and belongs to the application.

> **Warning: `'full'` can execute code from the animation file.** The full lottie-web build evaluates
> expression fields in Lottie JSON with `eval`, so Lottie from a user or a third party is code running in your
> page. Use `'import'` or `lottie_light` for untrusted input. `'full'` does nothing until you set
> `lottieFullAcknowledgeEvalRisk: true`, and the default is `'off'`.
>
> ```js
> IchavaMotion.config({ lottie: 'full', lottiePlayer: lottie, lottieFullAcknowledgeEvalRisk: true })
> ```

## Provenance of the adapter

`dist/ichava-motion-lottie.js` is **first-party, hand-written ES5** (4,189 bytes), not a build of lottie-web
and not generated from anything: it has no `src/` counterpart because there is no build step, so the file in
`dist/` is its source. It has been unchanged since the initial release commit, contains no `eval`,
`Function`, `innerHTML` or `__proto__`, and has no dependencies. Its checksum is pinned here and by
`tests/phase1.test.mjs`, so changing it means updating this line in the same commit:

```text
sha256  253c94aa07d0c32b0091364a6c04c781d1788e20e2fffe04dcb657746428a258  dist/ichava-motion-lottie.js
```

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
