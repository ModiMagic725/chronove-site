/**
 * Check every URL in js/media.js:  npm run verify:media
 * A URL passes when it answers HTTP 200 with an image/* (or video/*) content-type.
 * Empty slots are listed as "unset" (they show a labelled placeholder). Exit code 1 if any URL fails.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { WATCH_IMAGES, VIDEO, SCENES } from '../js/media.js';
const ROOT = fileURLToPath(new URL('..', import.meta.url));

const items = [];
Object.entries(WATCH_IMAGES).forEach(([s, v]) => Object.entries(v).forEach(([k, u]) => items.push([`${s}.${k}`, u, 'image/'])));
Object.entries(SCENES).forEach(([k, u]) => items.push([`scene:${k}`, u, 'image/']));
Object.entries(VIDEO).forEach(([g, v]) => Object.entries(v).forEach(([k, u]) => items.push([`video:${g}.${k}`, u, k === 'poster' ? 'image/' : 'video/'])));

let fail = 0, ok = 0, unset = 0;
for (const [name, url, want] of items) {
  if (!url) { unset++; continue; }
  if (!/^https?:/.test(url)) { const ok2 = existsSync(ROOT + url); console.log(`${ok2 ? 'OK  ' : 'FAIL'} ${name.padEnd(34)} local file ${url}`); ok2 ? ok++ : fail++; continue; }
  try {
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (!r.ok || !r.headers.get('content-type')) r = await fetch(url, { headers: { range: 'bytes=0-0' }, redirect: 'follow' });
    const type = r.headers.get('content-type') || '';
    const good = (r.status === 200 || r.status === 206) && type.startsWith(want);
    console.log(`${good ? 'OK  ' : 'FAIL'} ${name.padEnd(34)} ${r.status} ${type}  ${url.slice(0, 70)}`);
    good ? ok++ : fail++;
  } catch (e) { console.log(`FAIL ${name.padEnd(34)} ${e.message}`); fail++; }
}
console.log(`\n${ok} ok, ${fail} failed, ${unset} unset (placeholders) of ${items.length} slots`);
process.exit(fail ? 1 : 0);
