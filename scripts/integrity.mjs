// Writes dist/integrity.json: the sha384 Subresource Integrity value of every file in
// dist/, keyed by file name (M12). Runs last in `npm run build`, after every other file
// is written. integrity.json does not list itself. tests/size-budget.test.mjs recomputes
// every hash, so a stale file fails CI rather than a self-hoster's page.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url);
const OUT = 'integrity.json';

const files = readdirSync(dist, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name !== OUT && !e.name.startsWith('.'))
  .map((e) => e.name)
  .sort();
if (files.length < 10) throw new Error(`integrity: only ${files.length} files in dist/; refusing to write a partial list`);

const out = {};
for (const name of files) {
  out[name] = 'sha384-' + createHash('sha384').update(readFileSync(new URL(name, dist))).digest('base64');
}
writeFileSync(new URL(OUT, dist), JSON.stringify(out, null, 2) + '\n');
console.log(`integrity: ${files.length} files hashed into dist/${OUT}`);
