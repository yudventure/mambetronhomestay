// Builds every brand file under brand/.
//   node scripts/build.mjs              build everything
//   node scripts/build.mjs logo sosial  build only the named groups
// Contact details come from brand/data/kontak.json, overridden by
// kontak.lokal.json at the repo root (ignored by git, for the real phone number).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tutup } from './lib/render.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kontak = JSON.parse(fs.readFileSync(path.join(ROOT, 'brand/data/kontak.json')));
const lokal = path.join(ROOT, 'kontak.lokal.json');
if (fs.existsSync(lokal)) Object.assign(kontak, JSON.parse(fs.readFileSync(lokal)));

const GROUPS = ['logo', 'maskot', 'web', 'sosial', 'merchandise', 'amenities', 'papan', 'panduan', 'pdf'];
const want = process.argv.slice(2);
const ctx = { ROOT, K: kontak, out: (p) => path.join(ROOT, 'brand', p) };

for (const g of GROUPS) {
  if (want.length && !want.includes(g)) continue;
  const t = Date.now();
  const mod = await import(`./desain/${g}.mjs`);
  await mod.default(ctx);
  console.log(`${g} selesai dalam ${((Date.now() - t) / 1000).toFixed(1)} dtk`);
}
await tutup();
