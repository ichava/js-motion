// Exercises the published declarations (dist/ichava-motion.d.ts, through the package name)
// against real call shapes. Not run as
// a program -- only typechecked (see ../types.test.mjs). If this file stops
// compiling, either the .d.ts drifted from the real API or a caller pattern
// this package promises to support no longer typechecks.
import IchavaMotion, {
  type MotionSpec,
  type PlayOptions,
  type MotionConfig,
  type LottieJSON,
  type FamilySpec,
  type VariantSpec,
  type IchavaMotionApi,
} from '@ichava/js-motion';

const el = document.querySelector('.icon')!;

const cfg: MotionConfig = { defaults: { speed: 1, trigger: 'load' }, reduceMotion: 'respect' };
IchavaMotion.config(cfg).config({ lottie: 'off' });

const opts: PlayOptions = { speed: 1.5, easing: 'cubic-bezier(.34,1.56,.64,1)', delay: 0, iterations: Infinity };
IchavaMotion.play(el, 'spin', opts);
IchavaMotion.play('.icon', 'spin', opts);
IchavaMotion.animate(el, 'spin', opts);

const lottieJson: LottieJSON = { v: '5.7.0', ip: 0, layers: [] };
IchavaMotion.animate(el, lottieJson, opts);

const spec: MotionSpec = IchavaMotion.presets()['spin']!;
IchavaMotion.playSpec(el, spec, opts);
IchavaMotion.fromJSON(el, { keyframes: spec.keyframes, base: 1000 }, { trigger: 'loop' });

export const ids: string[] = IchavaMotion.presetIds();
export const easings: Record<string, string> = IchavaMotion.easings();

IchavaMotion.auto();
IchavaMotion.auto(document.body);

const family: FamilySpec = { id: 'custom', label: 'Custom', base: 1000, kf: () => [{ opacity: 0 }, { opacity: 1 }] };
const variant: VariantSpec = { s: '', a: 1, d: 1, r: false };
const api: IchavaMotionApi = IchavaMotion.registerFamily(family).registerVariant(variant).registerEasing('elastic', 'cubic-bezier(.5,-0.5,.1,1.5)');
api.autoInit();

IchavaMotion.register('custom-id', { keyframes: [{ opacity: 0 }, { opacity: 1 }], base: 500 });
