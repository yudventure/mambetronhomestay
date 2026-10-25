// Mascot files: poses, faces, WhatsApp sticker pack, mascot sheet.
import fs from 'fs';
import { execFileSync } from 'child_process';
import { maskot, wajah, POSE, EKSPRESI } from '../lib/maskot.mjs';
import { taruh, svgDoc } from '../lib/logo.mjs';
import { W } from '../lib/palet.mjs';
import { text } from '../lib/huruf.mjs';
import { doc, rect } from '../lib/tata.mjs';
import { png, simpan } from '../lib/render.mjs';

export const NAMA = 'Mambe';

// 512 × 512 sticker: character with a white rim, centred, transparent ground.
function stiker(d) {
  const [x, y, w, h] = d.box;
  const s = 460 / Math.max(w, h);
  const ox = (512 - w * s) / 2 - x * s, oy = (512 - h * s) / 2 - y * s;
  return doc(512, 512, `<g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${s.toFixed(4)})">${d.svg}</g>`);
}

export function lembar() {
  const w = 2400, h = 1300;
  let s = rect(0, 0, w, h, W.buih);
  s += text(`${NAMA}, maskot Mambetron Homestay`, { x: 80, y: 110, family: 'fredoka', weight: 700, size: 64, fill: W.laut });
  s += text('Digambar dari kuskus Waigeo, kuskus berbintik yang hanya ada di Raja Ampat. Enam pose dan enam ekspresi.', { x: 80, y: 160, size: 28, weight: 500, fill: W.toskaTua });
  Object.entries(POSE).forEach(([k, v], i) => {
    const x = 80 + i * 380;
    s += rect(x, 210, 340, 480, W.putih, 28);
    s += taruh(maskot(k), { x: x + 170, y: 240, w: 300, anchor: 'middle' }).svg;
    s += text(v.nama, { x: x + 170, y: 620, family: 'fredoka', weight: 600, size: 34, fill: W.laut, anchor: 'middle' });
    s += text(v.untuk, { x: x + 170, y: 656, size: 18, weight: 500, fill: W.toskaTua, anchor: 'middle', maxWidth: 300 });
  });
  Object.entries(EKSPRESI).forEach(([k, v], i) => {
    const x = 80 + i * 380;
    s += rect(x, 740, 340, 440, W.laut, 28);
    s += taruh(wajah(k, { stiker: true }), { x: x + 170, y: 790, w: 290, anchor: 'middle' }).svg;
    s += text(v, { x: x + 170, y: 1110, family: 'fredoka', weight: 600, size: 34, fill: W.pasir, anchor: 'middle' });
  });
  return doc(w, h, s);
}

export default async function ({ out }) {
  const semua = [
    ...Object.keys(POSE).map((k) => [`pose/${NAMA.toLowerCase()}-${k}`, maskot(k), maskot(k, { stiker: true })]),
    ...Object.keys(EKSPRESI).map((k) => [`wajah/${NAMA.toLowerCase()}-${k}`, wajah(k), wajah(k, { stiker: true })]),
  ];
  for (const [nama, d, ds] of semua) {
    const svg = svgDoc(d, { pad: 8 });
    simpan(out(`maskot/${nama}.svg`), svg);
    await png(svg, out(`maskot/${nama}.png`), { height: 1600 });
    const st = stiker(ds);
    const base = nama.split('/')[1];
    simpan(out(`maskot/stiker-whatsapp/svg/${base}.svg`), st);
    await png(st, out(`maskot/stiker-whatsapp/${base}.png`), { width: 512 });
    execFileSync('convert', [out(`maskot/stiker-whatsapp/${base}.png`), '-quality', '90', '-define', 'webp:lossless=false', out(`maskot/stiker-whatsapp/${base}.webp`)]);
  }
  // tray icon for the sticker pack
  await png(stiker(wajah('senang', { stiker: true })), out('maskot/stiker-whatsapp/ikon-paket-96.png'), { width: 96 });
  const lem = lembar();
  simpan(out('maskot/lembar-maskot.svg'), lem);
  await png(lem, out('maskot/lembar-maskot.png'), { width: 2400 });
  // size check, WhatsApp wants each sticker under 100 KB
  for (const f of fs.readdirSync(out('maskot/stiker-whatsapp')).filter((n) => n.endsWith('.webp'))) {
    const kb = fs.statSync(out(`maskot/stiker-whatsapp/${f}`)).size / 1024;
    if (kb > 100) console.warn(`stiker ${f} ${kb.toFixed(0)} KB, lebih dari 100 KB`);
  }
}
