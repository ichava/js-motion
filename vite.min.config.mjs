import { defineConfig } from 'vite';

/**
 * The minified `<script>` build, dist/ichava-motion.min.js (M12).
 *
 * A second pass over the same entry, IIFE only, so the unminified IIFE, ESM and CJS that
 * published CDN URLs and every consumer already point at are untouched. Minified with
 * Vite's own minifier (Oxc in Vite 8): the design named esbuild, which is not a dependency
 * here, and adding one to produce what the bundler already does would be a second tool
 * for one job. No source map: the unminified IIFE beside it is the readable copy.
 *
 * Written out rather than `mergeConfig()`-ed from vite.config.mjs: mergeConfig concatenates
 * arrays, so `formats` became es, cjs, iife, iife -- four builds racing to one file name.
 */
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // the other build's files live here too
    sourcemap: false,
    minify: true,
    lib: {
      entry: 'src/ichava-motion.ts',
      name: 'IchavaMotion',
      formats: ['iife'],
      fileName: () => 'ichava-motion.min.js',
    },
    rollupOptions: {
      external: [],
      output: { exports: 'default' },
    },
  },
});
