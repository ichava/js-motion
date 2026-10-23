// The declarations generated from src/ichava-motion.ts must stay equivalent to the
// hand-written ones that shipped while the source was plain JS. Each line below fails to
// compile unless the two types are mutually assignable. Not run, only typechecked
// (see ../types.test.mjs).
import type * as Generated from '@ichava/js-motion';
import type GeneratedDefault from '@ichava/js-motion';
import type * as Hand from './handwritten-api.js';
import type HandDefault from './handwritten-api.js';

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

export const contract: [
  Same<Generated.Direction, Hand.Direction>,
  Same<Generated.MotionSpec, Hand.MotionSpec>,
  Same<Generated.PlayOptions, Hand.PlayOptions>,
  Same<Generated.MotionConfigDefaults, Hand.MotionConfigDefaults>,
  Same<Generated.MotionConfig, Hand.MotionConfig>,
  Same<Generated.LottieJSON, Hand.LottieJSON>,
  Same<Generated.FamilySpec, Hand.FamilySpec>,
  Same<Generated.VariantSpec, Hand.VariantSpec>,
  Same<Generated.PlaySpec, Hand.PlaySpec>,
  Same<Generated.IchavaMotionApi, Hand.IchavaMotionApi>,
  Same<typeof GeneratedDefault, typeof HandDefault>,
] = [true, true, true, true, true, true, true, true, true, true, true];
