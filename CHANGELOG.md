# Changelog

All notable changes to `@ichava/js-motion` (published as `@ichava/motion` before 0.1.0's re-base) follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-10-23

Versioning re-based to 0.1.0. This release contains everything previously tagged v0.1.0 through v0.1.2 (2026-08-31 to 2026-09-22) plus the changes below. Those tags and their GitHub releases were removed; every commit they pointed at is on `main`, and their sections are kept under *Archived pre-reset history*.

### Changed

- **`dist/` rebuilt with Vite 8.3.5.** The bundler now writes `// src/ichava-motion.js` where it wrote `//#region` markers. Only comment lines change in `ichava-motion.{js,mjs,cjs}`, but the build-output guard compares bytes.
- **CI runs on Node 22 and 24.** The Node 20 lane could no longer install: npm 10 fails with `Cannot read properties of null (reading 'edgesOut')`. The shipped library is browser code with no runtime dependencies, so this only affects the dev toolchain.
- **Breaking: the package is `@ichava/js-motion`**, following the repository rename from `ichava/motion`. Imports change from `@ichava/motion` (and its `/css`, `/scss`, `/presets`, `/lottie` subpaths) to `@ichava/js-motion`. The pre-reset tags v0.1.0 to v0.1.2 shipped the old name; they are removed in the re-base, so a consumer moves to `#v0.1.0` and the new name together. The `dist/ichava-motion.*` file names and the `.ichm-*` classes are unchanged.

## [Archived pre-reset history]

> Versioning was re-based to 0.1.0 on 2026-10-23. The tags and GitHub releases below were removed;
> every commit they pointed at is on `main`. Sections reproduced verbatim, one heading level down.

### [0.1.2] - 2026-09-22

#### Added

- **`actionlint` runs on every pull request.** Nothing validated the workflow files at all:
  `release.yml` triggers only on `push: tags`, so a broken workflow was first observed as a
  release that refused to start — after the decision to release had been made.

  A YAML parse is not a substitute, and that is the sharp part. `yaml.safe_load` accepts a
  duplicate key and silently keeps the last one, so a double-applied patch that left
  `continue-on-error:` twice on a single step validated clean and would have failed only at tag
  time. `actionlint` rejects what Actions rejects.

  Checked against the defect rather than assumed: injecting that duplicate key, a typo'd step
  key, and an `if:` referencing a property that does not exist are all caught, while
  `yaml.safe_load` still parses the first of them without complaint.

#### Changed

- **Dead links to the deleted `ichava/documentation` repository removed.** That repository no
  longer exists, so every cross-reference to it resolved to a 404. The reporting channels in
  `SECURITY.md` were already stated inline and are unchanged; the Code of Conduct now cites the
  Contributor Covenant directly. Historical mentions in this changelog are left as written.

#### Fixed

- **A failed SBOM download no longer takes the whole release down.** `release.yml` generates the
  SBOM before it publishes, and the Syft installer fetches its checksums from GitHub's
  release-asset CDN. On 2026-09-21 that answered `504` for about twenty minutes, failing the job
  four times *before* the publish step — so the tag existed with no release behind it, which is
  the drift the release table exists to catch, produced by the release machinery itself.

  Two changes. The step now retries once after 45 seconds, which covers a single transient `504`
  — the common case. And a second failure no longer fails the job: the release publishes without
  the asset and emits a `::warning::` naming the re-run.

  **The two failure states are not equally bad, and that asymmetry is the whole design.** A
  release missing an attachment is repaired by re-running this workflow, which re-attaches it. A
  tag with no release persists silently until a person notices. Preferring the recoverable one
  is worth the loss of "every release always carries an SBOM" as an absolute.

  `fail_on_unmatched_files: false` is now stated on the publish step. It is already the action's
  default, but the point of this change is that a missing SBOM must not fail the publish, so it
  should not rest on a default a future reader has to know.

### [0.1.1] - 2026-09-16

#### Added

- `release.yml`, and third-party GitHub Actions pinned to the commit SHA of their latest
  release. `typescript` moved to `7.0.2`; nothing here compiles TypeScript today — there is no
  `tsconfig.json` and no `tsc` in any script — so that bump is inert until the rewrite lands.

#### Security

- **The library no longer fetches script.** `lottie: "full"` appended a
  `<script src="https://cdn.jsdelivr.net/npm/lottie-web@5/...">` to the document head on
  first use. Under any strict CSP (`script-src 'self'`) that tag is blocked, so the feature
  failed precisely where the library claims to be safest -- and it introduced an unpinned
  third-party origin, with no SRI, into the consumer's page.

  The player is now supplied, never resolved over the network: pass one with
  `IchavaMotion.config({ lottiePlayer: lottie })`, or expose it as `window.lottie`. When
  neither exists the call warns once and does nothing. `M3`.

- **Config merging can no longer reach `Object.prototype`.** `assign()` guarded with
  `hasOwnProperty`, which is not a defence: `JSON.parse('{"__proto__":{...}}')` produces an
  OWN `__proto__` property, so the guard passed and the write went through to the
  prototype. Config reaches that function from JSON -- a preset manifest, a `data-*`
  attribute, an API payload -- so the untrusted path was the normal path. `M4`.
- **An unreadable motion preference is treated as "reduce".** `reduceMotion()` returned
  `false` on error, meaning "the user has not asked for less motion", so the one genuinely
  unknown case was resolved by animating anyway. For an accessibility preference the safe
  default is the accommodating one. `M8`.

#### Added

- `config.lottiePlayer`, for supplying a lottie-web instance explicitly.
- `tests/csp-safety.test.mjs`, which asserts no shipped artifact creates a `<script>`
  element, references a CDN origin, or calls `eval`/`new Function` -- checked against
  `dist/` as well as `src/`, since the stale build is what a consumer would actually get.

### [0.1.0] - 2026-08-31

First open-source release. A framework-agnostic SVG animation engine for the Ichava icon ecosystem:
**240 presets across 40 families**, zero runtime dependencies, usable from CSS alone.

**Not published to npm** (decision `Q4`). Install from the repository; see
[docs/installation.md](docs/installation.md).

#### Added

- Three tiers, each usable without the ones above it: a CSS-only tier needing nothing but a
  stylesheet and two classes, a JS engine for staggering and stroke drawing, and an opt-in Lottie
  adapter.
- 240 generated presets across 40 families, each in up to six variants (default, Subtle, Bold, and
  a reverse of each), with 10 named easings. `dist/presets.json` is published as a subpath export so
  a picker can enumerate them without parsing CSS.
- ESM, CommonJS and IIFE builds, plus subpath exports for the compiled CSS, the SCSS source, the
  preset manifest and the Lottie adapter.
- `prefers-reduced-motion` is honoured throughout, including by the Lottie adapter.

#### Notes on the version number

This release is `0.1.0`, not the `1.0.0` the package metadata previously carried. The whole
ecosystem restarts from a single `0.1.0`; earlier tags never existed on this repository.

#### Fixed before release

- **Auto-init is opt-in.** The engine no longer scans the document on load. A library that starts
  animating the page the moment it is included cannot be adopted incrementally.
- **The build no longer destroys the stylesheet.** `npm run build` took
  `dist/ichava-motion.css` from 52 lines with 20 `@keyframes` to 14 lines with none, wiping the
  entire CSS-only tier, and exited 0 because of a trailing `|| true`. CI now asserts the keyframes
  and `.ichm-*` classes survive a build.
- **The SCSS is the source of the shipped CSS**, rather than the two drifting apart.
- The preset manifest is asserted reproducible from `npm run gen`, so the manifest and the
  stylesheet cannot disagree about what exists.
- `master` renamed to `main`, without which the CI workflow's branch filters never matched.

#### Known

`dist/presets.json` reports `count: 242` while listing 240 presets. That is deliberate: the
generator adds the engine's two sentinels, `None` and `JSON · Custom`, which a picker should offer
but which are not animations.
