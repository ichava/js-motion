export type Direction = 'normal' | 'reverse' | 'alternate';
/** A single generated preset -- the shape every entry in `presets()` has. */
export interface MotionSpec {
    id: string;
    label: string;
    keyframes: Keyframe[];
    /** base duration (ms) at 1x speed */
    base: number;
    direction: Direction;
    /** Infinity for a looping preset, 1 for a one-shot family */
    iterations: number;
    once: boolean;
    /** transform-origin applied before animating (swing/pendulum/rock) */
    origin?: string;
    /** true only for families that need real inline SVG paths (Draw) */
    domOnly: boolean;
    /** real stroke-draw: animates each child path's stroke-dashoffset */
    draw: boolean;
    /** animates the element's child layers with a stagger, instead of the root */
    perChild: boolean;
    /** per-child delay (ms), for perChild/draw families */
    stagger?: number;
    /** the family id this preset variant was generated from */
    family: string;
}
export interface PlayOptions {
    /** logarithmic speed multiplier; 1 = base duration */
    speed?: number;
    /** overrides the computed duration entirely (ms) */
    duration?: number;
    /** a named easing (spring/back/...), a raw cubic-bezier()/steps()/linear/ease* value, or a name registered via registerEasing */
    easing?: string;
    delay?: number;
    /** Infinity to loop; overrides the preset's own iteration count */
    iterations?: number | 'infinite';
    direction?: Direction;
    /** per-child stagger override (ms), for perChild/draw families */
    stagger?: number;
}
export interface MotionConfigDefaults {
    duration?: number | null;
    easing?: string;
    delay?: number;
    iterations?: number | null;
    direction?: Direction | null;
    speed?: number;
    trigger?: 'load' | 'loop' | 'hover' | 'click' | 'visible';
}
export interface MotionConfig {
    defaults?: MotionConfigDefaults;
    /** 'off': ignore Lottie JSON. 'import': convert via the optional ./lottie adapter. 'full': hand off to a supplied lottie-web player. */
    lottie?: 'off' | 'import' | 'full';
    /** a lottie-web instance you provide; this library never fetches one itself */
    lottiePlayer?: unknown;
    /** 'respect' (default): honour prefers-reduced-motion and [data-reduce-motion]. 'off': ignore it. */
    reduceMotion?: 'respect' | 'off';
}
/** Bodymovin/Lottie JSON, detected by animate() via its layers/v/ip fields. */
export interface LottieJSON {
    v: string;
    ip: number;
    layers: unknown[];
    [key: string]: unknown;
}
export interface FamilySpec {
    id: string;
    label: string;
    base: number;
    kf: (amp: number) => Keyframe[];
    origin?: string;
    once?: boolean;
    domOnly?: boolean;
    perChild?: boolean;
    draw?: boolean;
    stagger?: number;
}
export interface VariantSpec {
    s: string;
    a: number;
    d: number;
    r: boolean;
}
/**
 * What `playSpec()`/`fromJSON()` actually read at runtime: `keyframes` plus
 * whichever timing hints are present. Every other `MotionSpec` field
 * (`id`/`label`/`once`/`domOnly`/`draw`/`perChild`/`family`) is ignored --
 * those only matter to `play()`'s id-based routing.
 */
export interface PlaySpec {
    keyframes: Keyframe[];
    /** takes precedence over `base` when both are present */
    duration?: number;
    base?: number;
    direction?: Direction;
    origin?: string;
}
export interface IchavaMotionApi {
    readonly version: string;
    /** Merge partial config over the current settings (prototype-pollution-safe). Returns `this` for chaining. */
    config(overrides: MotionConfig): IchavaMotionApi;
    /** Route by content: a registered preset id, our MotionSpec JSON, or bodymovin/Lottie JSON. */
    animate(el: Element | string, source: string | MotionSpec | LottieJSON, opts?: PlayOptions): Animation | null;
    /** Play a registered preset by id. Handles perChild/draw routing internally. Returns null if unregistered, reduced-motion, or the id has no keyframes. */
    play(el: Element | string, presetId: string, opts?: PlayOptions): Animation | null;
    /** Play a raw spec directly -- no id lookup, no perChild/draw routing (single-element only). */
    playSpec(el: Element | string, spec: PlaySpec, opts?: PlayOptions): Animation | null;
    /** Play a plain JSON definition ({keyframes, duration|base, easing, direction, iterations}). `{trigger:'loop'}` loops it. */
    fromJSON(el: Element | string, def: PlaySpec, opts?: PlayOptions & {
        trigger?: 'loop';
    }): Animation | null;
    /** Declaratively wire every `[data-ichava-motion]` element under `root` (default: document). */
    auto(root?: ParentNode): void;
    /** The full generated preset registry, keyed by id. */
    presets(): Record<string, MotionSpec>;
    presetIds(): string[];
    /** Named easing -> WAAPI value map (spring/back/steps(8)/...). */
    easings(): Record<string, string>;
    /** Register (or overwrite) one preset directly. Returns `this` for chaining. */
    register(id: string, spec: Partial<MotionSpec>): IchavaMotionApi;
    /** Add a family; regenerates the full preset registry against every existing variant. Returns `this` for chaining. */
    registerFamily(family: FamilySpec): IchavaMotionApi;
    /** Add a variant; regenerates the full preset registry against every existing family. Returns `this` for chaining. */
    registerVariant(variant: VariantSpec): IchavaMotionApi;
    /** Register a named easing (e.g. 'elastic' -> a cubic-bezier() value). */
    registerEasing(name: string, value: string): IchavaMotionApi;
    /**
     * Opt in to the declarative `[data-ichava-motion]` auto-scan on DOMContentLoaded.
     * Off by default (WCAG 2.2.2): merely loading the script must not start looping
     * animation. No-ops outside a DOM (SSR/Node). Returns `this` for chaining.
     */
    autoInit(): IchavaMotionApi;
}
/** The default instance: the module's default export and the `<script>` global. */
declare var IchavaMotion: IchavaMotionApi;
export default IchavaMotion;
