// Round souvenir emblem: the hammock drawing over "Raja Ampat", ringed by
// curved lettering. Box 0..1000.
import { simbol } from './logo.mjs';
import { W } from './palet.mjs';
import { text, melingkar } from './huruf.mjs';

export function emblem({ atas = 'MAMBETRON HOMESTAY', bawah = 'PAPUA BARAT DAYA', papan = 'Raja Ampat', band = W.laut, huruf = W.pasir, tinta = W.biru, plate = W.buih } = {}) {
  const C = 500, RI = 352;
  let o = `<circle cx="${C}" cy="${C}" r="500" fill="${band}"/>`;
  o += `<circle cx="${C}" cy="${C}" r="${RI + 14}" fill="${huruf}"/>`;
  o += `<circle cx="${C}" cy="${C}" r="${RI}" fill="${plate}"/>`;
  o += melingkar(atas, { cx: C, cy: C, r: 408, posisi: 'atas', size: 58, weight: 800, tracking: 0.14, fill: huruf });
  o += melingkar(bawah, { cx: C, cy: C, r: 452, posisi: 'bawah', size: 44, weight: 700, tracking: 0.22, fill: huruf });
  for (const k of [-1, 1]) o += `<circle cx="${C + k * 430}" cy="${C}" r="11" fill="${huruf}"/>`;
  // the drawing sits in the upper part of the plate, the place name under it
  const g = simbol({ ink: tinta });
  const w = RI * 1.78;
  const s = w / g.box[2];
  const tx = C - w / 2 - g.box[0] * s;
  const ty = 196 - g.box[1] * s;
  o += `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(5)})">${g.svg}</g>`;
  o += text(papan, { x: C, y: 772, family: 'judul', weight: 900, size: 100, fill: band, anchor: 'middle' });
  return { svg: o, box: [0, 0, 1000, 1000] };
}
