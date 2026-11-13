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

`dist/ichava-motion.min.js` is the same build minified, under the same `IchavaMotion` global.

### Self-hosting with Subresource Integrity

`dist/integrity.json` holds the `sha384` of every file in `dist/`, written by the build and checked in
CI against a fresh hash. Copy the value for the file you serve into its tag:

```sh
node -p "require('./node_modules/@ichava/js-motion/dist/integrity.json')['ichava-motion.min.js']"
```

```html
<link rel="stylesheet" href="/vendor/ichava-motion.css"
      integrity="sha384-…value for ichava-motion.css…" crossorigin="anonymous">
<script src="/vendor/ichava-motion.min.js"
        integrity="sha384-…value for ichava-motion.min.js…" crossorigin="anonymous"></script>
```

The value changes with every release, so read it from the `integrity.json` of the tag you installed,
never from this page.

## What you get

| Entry | File | Use |
|---|---|---|
| `@ichava/js-motion` | `dist/ichava-motion.mjs` | ESM, the default for a bundler |
| `@ichava/js-motion` | `dist/ichava-motion.cjs` | CommonJS |
| `@ichava/js-motion/css` | `dist/ichava-motion.css` | the keyframes and `.ichm-*` classes |
| `@ichava/js-motion/scss` | `src/ichava-motion.scss` | the source, if you compile your own |
| `@ichava/js-motion/presets` | `dist/presets.json` | the preset manifest, for building a picker |
| `@ichava/js-motion/lottie` | the Lottie adapter | opt-in, see [lottie.md](lottie.md) |
| `@ichava/js-motion/dist/ichava-motion.min.js` | the minified IIFE | a `<script>` tag you host |
| `@ichava/js-motion/dist/integrity.json` | `sha384` of every `dist/` file | Subresource Integrity |

**Zero runtime dependencies.** The Lottie adapter is the only thing that expects anything external,
and it is opt-in precisely so the core stays that way.

## Requirements

A browser with CSS animations and `matchMedia`. There is no framework requirement: the engine works
on any SVG in the DOM, whatever put it there.

---

[← Docs index](../README.md#documentation)
