/**
 * @deprecated since 0.1.x; may be removed in 0.2.0. The engine source is
 * src/ichava-motion.ts and the published entry points are in dist/. This file keeps a
 * deep import of `@ichava/js-motion/src/ichava-motion.js`, from a bundler that does not
 * read the `exports` map, working: it forwards to the same build every supported import
 * gets, so it is the same instance. Import `@ichava/js-motion` instead.
 */
export { default } from '../dist/ichava-motion.mjs';
