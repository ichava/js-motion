[← Package README](../README.md#documentation)

# Release

*Reference.*

## Where this package is

`v0.1.0`, re-based on 2026-10-23 with every other package in the ecosystem. The pre-reset tags
`v0.1.0` to `v0.1.2` (2026-08-31 to 2026-09-22, published as `@ichava/motion`) were removed; their
commits are on `main` and their notes are kept in `CHANGELOG.md` under *Archived pre-reset history*.
The first tag under the `@ichava/js-motion` name is the re-based `v0.1.0`.

**Not published to npm.** Consumers install from the repository; see
[installation](installation.md).

## Cutting a release

Releases are prepared by [release-please](https://github.com/googleapis/release-please) from the
Conventional Commit log, and published by `release.yml` when the tag lands.

1. **Write the notes as you go.** Every pull request that changes behaviour adds to the one
   `## [Unreleased]` section of `CHANGELOG.md`. release-please does not write the changelog
   (`skip-changelog` in `release-please-config.json`); the hand-written section is the release body.

2. **Open the release pull request.** Run *Release Please* from the Actions tab (it also runs every
   Monday). It opens, or refreshes, one pull request that bumps `package.json`, the manifest
   (`.release-please-manifest.json`) and the version line in the README, and it closes
   `## [Unreleased]` as `## [X.Y.Z] - date` on that branch. It fails if `[Unreleased]` is empty: write
   the notes on `main` first, then run it again.

3. **Check the release pull request like any other.** CI runs on it, because it is opened with the
   Refresh Bot token rather than `GITHUB_TOKEN`. Before merging, confirm generated output is current:

   ```bash
   npm run gen && git diff --exit-code dist/presets.json
   npm run build
   npm test
   ```

   CI asserts both, including that `dist/ichava-motion.css` still carries its keyframes and `.ichm-*`
   classes, because the build script once emptied it and exited 0.

4. **Merge it.** Merging runs *Release Please* again, which tags `vX.Y.Z` and creates the GitHub
   release. The tag starts `release.yml`, which replaces the release body with the version's
   `CHANGELOG.md` section and attaches the SBOM.

Do not edit the release pull request by hand: release-please rebuilds its branch whenever the release
changes, and drops anything it did not write. Change the notes on `main` instead.

## Versioning

SemVer on 0.x, decided by the commit type:

| Commit | Bump while 0.x |
|---|---|
| `feat!:`, `fix!:`, or a `BREAKING CHANGE:` footer | minor (`0.1.x` to `0.2.0`) |
| `feat:`, `fix:`, `perf:` | patch |
| `docs:`, `ci:`, `chore:`, `test:`, `refactor:` | none on its own |

Breaking is judged against the **preset contract** rather than the internals: removing a preset id
or changing what one does is breaking; adding a family or retiming an existing preset within its
variant band is not. js-motion is versioned on its own, outside the lockstep minor the coupled ichava
packages share.

To force a version, add a `Release-As: X.Y.Z` footer to a commit that reaches `main` through a pull
request; it applies to the next release only.

---

[← Docs index](../README.md#documentation)
