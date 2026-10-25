// Round souvenir emblem: kuskus peeking over a "Raja Ampat" sign in front of
// the islands, ringed by curved lettering. Box 0..1000.
import { KEPALA } from './logo.mjs';
import { W } from './palet.mjs';
import { text, melingkar } from './huruf.mjs';
import { lanskap } from './seni.mjs';

let n = 0;
export function emblem({ atas = 'MAMBETRON HOMESTAY', bawah = 'PAPUA BARAT DAYA', papan = 'Raja Ampat', band = W.laut, huruf = W.pasir, tinta = W.hitam, plate = W.putih } = {}) {
  const id = `em${++n}`;
  const C = 500, RI = 352;
  // head about 55 % of the inner circle wide, line a quarter below centre
  const s = (RI * 1.1) / KEPALA.lebar, edgeY = 584;
  const tx = C - KEPALA.cx * s, ty = edgeY - KEPALA.garisAtas * s;
  const toE = (x) => tx + x * s;
  const bawahGaris = ty + KEPALA.garisBawah * s;
  let o = `<circle cx="${C}" cy="${C}" r="500" fill="${band}"/>`;
  o += `<circle cx="${C}" cy="${C}" r="${RI + 14}" fill="${huruf}"/>`;
  o += melingkar(atas, { cx: C, cy: C, r: 408, posisi: 'atas', size: 58, weight: 800, tracking: 0.14, fill: huruf });
  o += melingkar(bawah, { cx: C, cy: C, r: 452, posisi: 'bawah', size: 44, weight: 700, tracking: 0.22, fill: huruf });
  for (const k of [-1, 1]) o += `<circle cx="${C + k * 430}" cy="${C}" r="11" fill="${huruf}"/>`;
  o += `<defs><clipPath id="${id}"><circle cx="${C}" cy="${C}" r="${RI}"/></clipPath>`
    + `<clipPath id="${id}k"><path d="M0 0H1000V${bawahGaris}H${toE(KEPALA.moncong[1] + 2)}V1000H${toE(KEPALA.moncong[0] - 2)}V${bawahGaris}H0Z"/></clipPath></defs>`;
  o += `<g clip-path="url(#${id})">`;
  o += `<g transform="translate(${C - RI} ${C - RI})">${lanskap({ w: 2 * RI, h: 2 * RI, horizon: 0.6, sunX: 0.74, seed: 9, glint: false })}</g>`;
  o += `<g transform="translate(${tx} ${ty}) scale(${s})"><path d="${KEPALA.hull}" fill="${plate}"/></g>`;
  o += `<rect x="0" y="${bawahGaris - 1}" width="1000" height="${1000 - bawahGaris}" fill="${plate}"/>`;
  o += `<g clip-path="url(#${id}k)"><g transform="translate(${tx} ${ty}) scale(${s})"><path d="${KEPALA.kuskus}" fill="${tinta}" fill-rule="evenodd"/>${KEPALA.lidah ? `<path d="${KEPALA.lidah}" fill="#F0A0A0"/>` : ''}</g></g>`;
  o += text(papan, { x: C, y: 745, family: 'fredoka', weight: 700, size: 92, fill: band, anchor: 'middle' });
  o += `</g>`;
  return { svg: o, box: [0, 0, 1000, 1000] };
}
