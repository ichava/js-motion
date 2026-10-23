[← Package README](../README.md#documentation)

# Presets

*Reference.*

**240 presets across 40 families**, generated rather than hand-written. `dist/presets.json` is the
manifest; `npm run gen` rebuilds it and the CI asserts the result is reproducible, so the manifest
and the CSS cannot drift apart.

The manifest is the authority for that number, so re-measure it rather than quoting this page:

```bash
jq '{presets: (.presets|length), families: (.presets|map(.family)|unique|length), count}' dist/presets.json
```

```json
{ "presets": 240, "families": 40, "count": 242 }
```

`count` is 242 rather than 240 because of the two sentinels; see [Building a picker](#building-a-picker).

## The shape of an entry

```json
{
  "id": "spin-subtle",
  "label": "Spin · Subtle",
  "base": 1610,
  "direction": "normal",
  "once": false,
  "origin": null,
  "domOnly": false,
  "perChild": false,
  "draw": false,
  "family": "spin"
}
```

| Field | Meaning |
|---|---|
| `id` | the class suffix: `ichm-spin-subtle` |
| `family` | the base animation this is a variant of |
| `base` | duration in milliseconds |
| `direction` | CSS `animation-direction` |
| `once` | plays once rather than looping |
| `origin` | `transform-origin` override, when the animation needs one |
| `domOnly` | needs a real DOM element, not just CSS: excluded from the CSS-only tier |
| `perChild` | animates each child of the SVG, staggered |
| `draw` | stroke-drawing animation, needs path length measurement |

## Families and variants

Each family expands into up to six entries:

| Variant | Effect |
|---|---|
| default | the family's base timing |
| `-subtle` | slower, smaller amplitude |
| `-bold` | faster, larger amplitude |
| `-reverse`, `-subtlereverse`, `-boldreverse` | the same three, played backwards |

So `spin` yields `spin`, `spin-reverse`, `spin-subtle`, `spin-subtlereverse`, `spin-bold`,
`spin-boldreverse`. Not every family has all six; the manifest is the authority.

## Easings

Ten named easings ship: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `spring`, and four
more listed in `presets.easings`. They are applied per preset, not chosen at call time.

## Building a picker

The manifest is published as a subpath export precisely so a UI can enumerate it without parsing
CSS:

```js
import manifest from '@ichava/js-motion/presets'

const families = [...new Set(manifest.presets.map(p => p.family))]
```

Remember the two sentinels: `manifest.count` is 242 because it includes `None` and `JSON · Custom`,
which a picker should offer but which are not animations.

## Glow colour

The glow family's shadow is `var(--ichm-glow-color, currentColor)`, in the JS presets and the CSS tier alike: the icon's own colour unless a container sets `--ichm-glow-color`. To make it follow a brand accent:

```css
.my-app { --ichm-glow-color: var(--accent); }
```

## Listing the families and variants

`IchavaMotion.catalog()` returns the families and variants the registry is generated from, as typed copies (`MotionCatalog`). Every preset is one family in one variant, so a picker can group presets by family without keeping its own tables:

```js
const { families, variants } = IchavaMotion.catalog();
families.map((f) => f.label);          // 'Spin', 'Spin Y', ...
variants.map((v) => v.s || 'Default'); // ' · Reverse', ' · Subtle', ...
```

It follows `registerFamily()` and `registerVariant()` on the instance it is called on.

---

[← Docs index](../README.md#documentation)
