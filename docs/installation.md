[← Package README](../README.md#documentation)

# Installation

*How-to guide.*

`@ichava/js-motion` is **not published to npm** (decision `Q4` in the ecosystem audit). Install it from
the repository, or vendor the built files.

## From the repository

```json
{
    "dependencies": {
        "@ichava/js-motion": "github:ichava/js-motion#v0.1.0"
    }
}
```

The package ships its `dist/` output, so no build step runs on install.

## From a script tag

The IIFE build assigns a global and needs nothing else:

```html
<link rel="stylesheet" href="/path/to/ichava-motion.css">
<script src="/path/to/ichava-motion.js"></script>
```

## What you get

| Entry | File | Use |
|---|---|---|
| `@ichava/js-motion` | `dist/ichava-motion.mjs` | ESM, the default for a bundler |
| `@ichava/js-motion` | `dist/ichava-motion.cjs` | CommonJS |
| `@ichava/js-motion/css` | `dist/ichava-motion.css` | the keyframes and `.ichm-*` classes |
| `@ichava/js-motion/scss` | `src/ichava-motion.scss` | the source, if you compile your own |
| `@ichava/js-motion/presets` | `dist/presets.json` | the preset manifest, for building a picker |
| `@ichava/js-motion/lottie` | the Lottie adapter | opt-in, see [lottie.md](lottie.md) |

**Zero runtime dependencies.** The Lottie adapter is the only thing that expects anything external,
and it is opt-in precisely so the core stays that way.

## Requirements

A browser with CSS animations and `matchMedia`. There is no framework requirement: the engine works
on any SVG in the DOM, whatever put it there.

---

[← Docs index](../README.md#documentation)
