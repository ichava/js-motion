[← Package README](../README.md#documentation)

# Architecture

*Explanation.*

## Three tiers, deliberately separate

| Tier | Needs | Handles |
|---|---|---|
| CSS-only | a stylesheet and two classes | the majority of presets, including every simple transform |
| JS engine | `init()`, or a direct call | per-child staggering, stroke drawing, anything `domOnly` |
| Lottie adapter | an explicit import and the Lottie runtime | vector animations authored elsewhere |

Each tier is usable without the ones above it. A page that only wants a spinning loader pays for a
stylesheet and nothing else.

## Why auto-init is opt-in

An animation library that scans the document on load is adopted all-or-nothing: you cannot try it on
one component, and when something animates unexpectedly there is no obvious culprit. `init()` is a
call you make, so the blast radius is a decision rather than a side effect.

## Why the presets are generated

240 entries across 40 families in six variants is not maintainable by hand, the CSS and the
manifest would drift, and a picker would offer animations that do not exist. `scripts/gen-presets.mjs`
emits both from one source, and CI asserts the manifest is reproducible from a clean run. If the
generator and the committed output disagree, the build fails rather than shipping a lie.

The same discipline caught a real defect: the build script once rewrote `dist/ichava-motion.css`
from 52 lines to 14, destroying the entire CSS-only tier, and exited 0 because of a trailing
`|| true`. The build-integrity assertion exists because of that.

## Why zero runtime dependencies

This runs inside an icon library that runs inside someone's application. Every dependency here is a
dependency they did not choose. The Lottie adapter is the one thing that needs an external runtime,
which is exactly why it is a separate entry point rather than an import in the core.

## Why it is framework-agnostic

The engine operates on SVG elements in the DOM. It does not know or care whether Vue, React, Blade
or a static file put them there, which is what lets the same package serve `ichava/icon-browser`'s Vue
SPA and `@ichava/react-icon-browser` without a wrapper for each.

---

[← Docs index](../README.md#documentation)
