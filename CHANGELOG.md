# Changelog

All notable changes to `@ichava/js-motion` (published as `@ichava/motion` before 0.1.0's re-base) follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.1] - 2026-10-23

### Added

- **`IchavaMotion.catalog()`** (React UI architecture, step 4.3): the families and variants the preset registry is generated from, as typed copies (`MotionCatalog`), so react-icon-browser's motion picker can list them instead of keeping duplicated tables. It follows `registerFamily()`/`registerVariant()` per instance, and changing the copy does not change the engine. `tests/catalog.test.mjs` failed first.
- **`IchavaMotion.create()`**, an independent engine (React UI architecture, step 4.2). Each instance has its own preset registry, easings, families, variants and config, starting from the built-in set; registering or configuring one never reaches the default instance or another, so two embeds on one page can differ. The default export is itself one such instance, built once, so its API and behaviour are unchanged, and it stays the only export, which keeps the IIFE global intact. `tests/instances.test.mjs` failed first. The API contract fixture now accepts additions to the API object while still failing on a removed method.
- **The shared tsconfig is checked against the kernel.** `npm run check:config-drift` compares `tsconfig.base.json` and `scripts/check-config-drift.mjs` byte for byte with `config/` on `ichava/js-ui-kernel`'s `main`, and fails on a difference, a non-200 answer or an empty body. A CI job runs it, then plants a one-byte change and requires it to fail. `scripts/` is export-ignored, so the script does not ship.
- **Releases are prepared by release-please.** A *Release Please* workflow reads the Conventional Commit log, keeps one release pull request open that bumps `package.json`, `.release-please-manifest.json` and the README's version line, and tags the release when that pull request merges; the tag starts `release.yml` as before. On 0.x a breaking change bumps the minor and everything else bumps the patch. Release notes stay hand-written: release-please is set to `skip-changelog`, and the workflow closes this `[Unreleased]` section under the new version on the release branch, failing if it is empty. It runs on `workflow_dispatch`, a weekly schedule, and the merge of a release pull request, so the repository still has no `push` trigger other than tags. The pull request and the tag are made with a per-run Refresh Bot token, because ones made with `GITHUB_TOKEN` start no workflows.

### Changed

- **The engine source is TypeScript, and the declarations are generated** (React UI architecture, step 4.1). `src/ichava-motion.js` became `src/ichava-motion.ts` under the shared strict base, and `dist/ichava-motion.d.ts` is emitted from it by `npm run build` instead of being copied from a hand-written file. The emitted JavaScript is byte-identical to the previous build apart from the source-path comment and the source maps, so the ESM, CJS and IIFE files, their names, the `IchavaMotion` global and the default-only export are unchanged. The hand-written declarations are kept as `tests/fixtures/handwritten-api.d.ts`, and a new fixture, `api-contract.ts`, fails unless every exported type of the generated file is mutually assignable with them; both fixtures resolve the package by its own name, as a consumer does. CI typechecks the source and checks the build reproduces the committed declarations. The package's shipped `src/` now holds `ichava-motion.ts` in place of `ichava-motion.js` and `ichava-motion.d.ts`; neither was reachable through `exports`.
- **CI spends less and still watches `main`** (A6-gaps G19; this repository is public, so the policy is advice here, applied for consistency). Every CI job has a `timeout-minutes` (only two did, so a hung job could bill six hours). Draft pull requests run nothing; the run starts when one is marked ready. A weekly scheduled run (Monday 10:00 UTC) re-checks `main`, which matters now that no lock file is committed: a dependency release that breaks `main` no longer stays invisible until an unrelated pull request. Dependabot groups minor and patch updates into one pull request per ecosystem per week.
- **The declaration-file fixture typechecks under the shared strict base** (React UI architecture, step 0.5). `tsconfig.base.json` is a byte-identical copy of `ichava/js-ui-kernel`'s `config/tsconfig.base.json`, and `tests/fixtures/tsconfig.json` extends it, keeping `skipLibCheck: false` so the hand-written `ichava-motion.d.ts` is still checked. The stricter flags (`noUncheckedIndexedAccess`, `noUnusedLocals` among them) now apply to the fixture; two of its locals became exports so they count as used. The base is not shipped (`files` lists only `dist`, `src`, `README.md` and `LICENSE`) and is export-ignored.

### Deprecated

- **`src/ichava-motion.js` and `src/ichava-motion.d.ts`**, the paths the plain-JS source and its hand-written declarations shipped at. They are now shims that forward to `dist/` (the same instance every supported import gets), so a bundler that ignores `exports` and deep-imports the old path keeps working. Import `@ichava/js-motion` instead. They may be removed in 0.2.0. `tests/deep-import.test.mjs` checks the JS shim is the published instance, and `tests/types.test.mjs` compiles the declaration shim against `dist/`.

### Fixed

- **A long crafted easing is rejected in linear time** (CodeQL `js/polynomial-redos`, open on `main` as alerts 1 to 3). Each `cubic-bezier()` number was matched with `-?\d*\.?\d+`, which can split a digit run many ways, so a 40,000-digit value from a `data-motion-easing` attribute or a JSON preset took about 760 ms to reject. The number is now `\d+(\.\d+)?` or `\.\d+`: the same values pass (checked against 200,000 random candidates) and the same value is rejected in under a millisecond. `tests/easing.test.mjs` pins both, and its timing case failed first.

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
