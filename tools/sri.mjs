/**
 * Recompute SRI hashes for the files in /vendor and print the HASH block for js/loader.js.
 * Use after bumping a library version: copy the new file from npm into /vendor, run `npm run sri`,
 * paste the output into the HASH map in js/loader.js.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'vendor');
for (const f of readdirSync(dir)) console.log(`    '@${f}': 'sha384-${createHash('sha384').update(readFileSync(join(dir, f))).digest('base64')}',`);
