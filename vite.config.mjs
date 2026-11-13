import { defineConfig } from 'vite';

/**
 * Library build: one source, three formats.
 *
 * There was no JS build at all. `dist/ichava-motion.js` was a byte-identical hand copy of
 * `src/ichava-motion.js`, so the only artifact shipped was the IIFE, while `exports`
 * advertised `require` support the package could not honour and no ESM entry existed.
 *
 * The IIFE keeps the `IchavaMotion` global and the historical filename, so existing
 * `<script src="dist/ichava-motion.js">` tags and every CDN URL already published keep
 * working. ESM and CJS are new files rather than replacements for that reason.
 */
export default defineConfig({
  build: {
    outDir: 'dist',
    // The CSS tier is compiled separately by sass and lives in dist/; wiping the directory
    // here would delete it mid-build.
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: 'src/ichava-motion.ts',
      name: 'IchavaMotion',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) =>
        ({
          es: 'ichava-motion.mjs',
          cjs: 'ichava-motion.cjs',
          // Unchanged on purpose: published CDN URLs point at this exact path.
          iife: 'ichava-motion.js',
        })[format],
    },
    rollupOptions: {
      // Zero runtime dependencies is a product claim; nothing should be external.
      external: [],
      // 'default', so the IIFE global IS the library rather than a namespace object.
      output: { exports: 'default' },
    },
    minify: false,
  },
});
