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

## Releases and versioning

- **A version tag is pushed only for final code.** `vX.Y.Z` marks a release, nothing else. To try a
  release build first, push a pre-release tag, `vX.Y.Z-rc.N`, which uses up no release number. It runs
  the same release workflow and publishes as a GitHub pre-release. It needs no CHANGELOG section of
  its own: the workflow uses a `## [X.Y.Z-rc.N]` section when the commit has one, and a fixed
  test-build note otherwise.
- **A public tag is never moved, deleted or reused.** Once a tag has been fetched, moving it makes
  consumers of the same version disagree. Composer and npm git dependencies resolve the tag afresh, so
  new installs get the moved commit while every existing lockfile and cache keeps the old one (an npm
  registry version cannot be republished at all). For a Go module, the module proxy keeps the copy it
  first served and `sum.golang.org` records its checksum, so `go` fetches after the move fail
  verification. The next fix gets the next number.
- **A tag ruleset enforces this.** Applied once the v0.1.0 tags are pushed, it blocks deleting,
  updating and force-pushing `v*` tags on this repository. The v0.1.0 publication as a
  single commit was the one planned exception.
- **A bad release is retracted, not replaced.** Name it in the CHANGELOG and the GitHub release notes. This package is installed from git tags, not from the npm registry; if it is ever published there, `npm deprecate` the version too. Then ship the fix as the next
  version.

## Security

See [`SECURITY.md`](SECURITY.md).
