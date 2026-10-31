# @ichava/js-motion

[![Tests](https://github.com/ichava/js-motion/actions/workflows/ci.yml/badge.svg)](https://github.com/ichava/js-motion/actions/workflows/ci.yml)
[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Two badges, not four: the package is not on npm (it installs from a git tag), so there is no
registry version to show, and the type check runs in the same CI workflow as the tests.

> A framework-agnostic, JSON-driven SVG and icon animation engine: zero runtime dependencies, Web Animations API with a CSS-only fallback, 240 presets across 40 families.

Version 0.1.0. Runs in any modern browser; the build tooling needs Node 24 or newer. <!-- x-release-please-version -->

## Install

`@ichava/js-motion` is not published to npm; npm publishing is not set up. Install it from the git tag:

```json
{
    "dependencies": {
        "@ichava/js-motion": "github:ichava/js-motion#v0.1.0"
    }
}
```

The tag ships the built `dist/`, so nothing builds on install. Without a bundler, copy the two built
files and load them with a `<link>` and a `<script>`; see [docs/installation.md](docs/installation.md).

## Quick start guide and usage

### Getting started

Nothing to configure. Load the stylesheet once, and the CSS-only tier works with no JavaScript:

```js
import IchavaMotion from '@ichava/js-motion';
import '@ichava/js-motion/css';
```

### Usage

A class runs a base family as CSS `@keyframes`:

```html
<svg class="ichm-spin" viewBox="0 0 24 24">…</svg>
```

`data-*` attributes describe an animation declaratively, and `IchavaMotion.autoInit()` wires them:

```html
<svg data-ichava-motion="spin-bold" data-motion-trigger="hover" data-motion-speed="1.5">…</svg>
```

Or play a preset from code:

```js
IchavaMotion.play(el, 'heartbeat', { speed: 1, easing: 'ease-in-out', iterations: 'infinite' });
```

The full walkthrough is in [docs/getting-started.md](docs/getting-started.md), the tour of every tier is
in [docs/usage.md](docs/usage.md), and everything else is under [Documentation](#documentation).

## <a name="documentation"></a>Documentation

### Guides

- [Installation](docs/installation.md) — the entry points and why this is not on npm
- [Getting started](docs/getting-started.md) — two classes, then what they do
- [Usage](docs/usage.md) — the three ways to animate, illustrations, configuration, Lottie and reduced motion
- [Architecture](docs/architecture.md) — the three tiers and why they are separate
- [Release](docs/release.md) — cutting a version

### Reference

- [Presets](docs/presets.md) — 240 across 40 families, and the manifest shape
- [Lottie](docs/lottie.md) — the opt-in adapter and when it earns its size

## Contributing & security

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## License

MIT. Copyright (c) Simtabi LLC. See [LICENSE](LICENSE).
