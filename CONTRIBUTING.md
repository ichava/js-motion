# Contributing

## Before you start

The presets are **generated**. `dist/presets.json` and the keyframes in the stylesheet both come
from `scripts/gen-presets.mjs`, and CI asserts the committed output is reproducible from a clean
run. Hand-editing either one fails the build.

To add or change an animation, change the generator and run:

```bash
npm run gen
npm run build
npm test
```

## What the build must not do

`npm run build` once rewrote `dist/ichava-motion.css` from 52 lines to 14, destroying the entire
CSS-only tier, and exited 0 because of a trailing `|| true`. CI now asserts the stylesheet still
carries its keyframes and `.ichm-*` classes. If that check fails, the build broke; do not adjust
the check.

## Conventions

- Conventional Commits. Subject 72 characters or fewer, imperative mood. The body explains why.
- No AI attribution anywhere: not in commits, PR titles or bodies, code comments or docs.
- No em-dashes in shipped docs or code comments. The ecosystem is at zero and stays there.
- **Zero runtime dependencies.** The Lottie adapter is a separate entry point precisely so the core
  keeps that promise. A pull request that adds a dependency to the core needs to argue for it.

## Semver

Versioned against the preset contract, not the internals. Removing a preset id or changing what one
does is breaking. While the version is 0.x a breaking change bumps the minor and everything else,
adding a family included, bumps the patch. The commit type decides it (`feat!:` or a
`BREAKING CHANGE:` footer for breaking), because release-please reads it to prepare the release; see
[docs/release.md](docs/release.md).

## Security

See [`SECURITY.md`](SECURITY.md).
