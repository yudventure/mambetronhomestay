// Logo geometry built from the traced original (brand/logo/sumber).
// The logo is one colour: a man resting in a hammock between two coconut
// palms on a small sand island, the word MAMBETRON under it and HOMESTAY
// under that. The trace tells us which contours belong to the drawing, the
// word and HOMESTAY, so each part can be used or coloured on its own.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { W } from './palet.mjs';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../brand/logo/sumber/logo-traced.json');
const T = JSON.parse(fs.readFileSync(SRC));
let uid = 0;
const id = (p) => `${p}${++uid}`;

const union = (list) => list.reduce((b, c) => [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[2]), Math.max(b[3], c[3])]);
const dalam = (c, b) => c.bbox[1] >= b[1] - 1 && c.bbox[3] <= b[3] + 1;
const ILU = T.contours.filter((c) => dalam(c, T.bagian.ilustrasi));
const KATA = T.contours.filter((c) => dalam(c, T.bagian.kata));
const HS = T.contours.filter((c) => dalam(c, T.bagian.homestay));
const d = (list) => list.map((c) => c.d).join('');
const ALL = d(T.contours);

const INK_BOX = union(T.contours.map((c) => c.bbox));
const HULL_BOX = [INK_BOX[0] - T.rim, INK_BOX[1] - T.rim, INK_BOX[2] + T.rim, INK_BOX[3] + T.rim];
const ILU_BOX = union(ILU.map((c) => c.bbox));
const KATA_BOX = union(KATA.map((c) => c.bbox));
const TEKS_BOX = union([...KATA, ...HS].map((c) => c.bbox));

// the first letter of MAMBETRON, for favicons and app icons
const M_BOX = KATA.filter((c) => c.depth === 0).sort((a, b) => a.bbox[0] - b.bbox[0])[0].bbox;
const M = KATA.filter((c) => c.bbox[0] >= M_BOX[0] - 1 && c.bbox[2] <= M_BOX[2] + 1);

// A drawable: { svg, box: [x, y, w, h] } in its own units.
const mk = (svg, b) => ({ svg, box: [b[0], b[1], b[2] - b[0], b[3] - b[1]] });
const isi = (list, fill) => `<path d="${d(list)}" fill="${fill}" fill-rule="evenodd"/>`;

// Primary logo.
// positive  ink on light grounds
// negative  everything in the paper colour, for dark grounds and photos
// sticker   ink logo on a paper plate with a rim, for busy grounds
export function utama({ varian = 'positive', ink = W.biru, paper = W.putih } = {}) {
  if (varian === 'positive') return mk(`<path d="${ALL}" fill="${ink}" fill-rule="evenodd"/>`, INK_BOX);
  if (varian === 'negative') return mk(`<path d="${ALL}" fill="${paper}" fill-rule="evenodd"/>`, INK_BOX);
  return mk(`<path d="${T.hull}" fill="${paper}"/><path d="${ALL}" fill="${ink}" fill-rule="evenodd"/>`, HULL_BOX);
}

// The drawing alone, without the lettering.
export function simbol({ ink = W.biru, plate = null } = {}) {
  const b = plate ? [ILU_BOX[0] - T.rim, ILU_BOX[1] - T.rim, ILU_BOX[2] + T.rim, ILU_BOX[3] + T.rim] : ILU_BOX;
  return mk((plate ? `<path d="${T.hullIlustrasi}" fill="${plate}"/>` : '') + isi(ILU, ink), b);
}

// Badge: the drawing inside a circle, or a full-bleed square for app icons.
// bg      colour inside the circle (null keeps it transparent)
// plate   colour of a rim around the drawing, for busy or dark grounds
// ring    colour of an outer ring (defaults to bg so the circle stays whole
//         on white pages), ringWidth as a fraction of the radius
// bentuk  bulat (circle) or persegi (square)
const CX = (ILU_BOX[0] + ILU_BOX[2]) / 2;
const CY = (ILU_BOX[1] + ILU_BOX[3]) / 2;
const R = (ILU_BOX[2] - ILU_BOX[0]) * 0.52;
export function lencana({ bg = W.buih, ink = W.biru, plate = null, ring, ringWidth = 0.05, gap = 0.04, bentuk = 'bulat', sisi } = {}) {
  const cid = id('b');
  if (ring === undefined) ring = bg;
  // the drawing spans most of the inner width, the circle trims the palm
  // tips and the ends of the island a little
  const gambar = (lebar, cx, cy) => {
    const g = simbol({ ink, plate });
    const s = lebar / g.box[2];
    const tx = cx - (g.box[0] + g.box[2] / 2) * s;
    const ty = cy - (g.box[1] + g.box[3] / 2) * s;
    return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(5)})">${g.svg}</g>`;
  };
  if (bentuk === 'persegi') {
    const sz = sisi ?? 2 * R;
    const x0 = CX - sz / 2, y0 = CY - sz / 2;
    let svg = `<defs><clipPath id="${cid}"><rect x="${x0}" y="${y0}" width="${sz}" height="${sz}"/></clipPath></defs>`;
    if (bg) svg += `<rect x="${x0}" y="${y0}" width="${sz}" height="${sz}" fill="${bg}"/>`;
    svg += `<g clip-path="url(#${cid})">${gambar(sz * 0.9, CX, CY)}</g>`;
    return mk(svg, [x0, y0, x0 + sz, y0 + sz]);
  }
  const rw = ring ? R * ringWidth : 0;
  const ri = ring ? R - rw - (ring !== bg ? R * gap : 0) : R;
  let svg = `<defs><clipPath id="${cid}"><circle cx="${CX}" cy="${CY}" r="${ri}"/></clipPath></defs>`;
  if (ring) svg += `<path d="M${CX - R} ${CY}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0ZM${CX - R + rw} ${CY}a${R - rw} ${R - rw} 0 1 1 ${2 * (R - rw)} 0a${R - rw} ${R - rw} 0 1 1 ${-2 * (R - rw)} 0Z" fill="${ring}" fill-rule="evenodd"/>`;
  if (bg) svg += `<circle cx="${CX}" cy="${CY}" r="${ri}" fill="${bg}"/>`;
  svg += `<g clip-path="url(#${cid})">${gambar(ri * 2 * 0.94, CX, CY + ri * 0.03)}</g>`;
  return mk(svg, [CX - R, CY - R, CX + R, CY + R]);
}

// One-colour stamp: ring and drawing, nothing else. For embroidery,
// engraving, rubber stamps and single-ink printing.
export function stempel({ ink = W.biru, ringWidth = 0.05, gap = 0.05 } = {}) {
  return lencana({ bg: null, plate: null, ring: ink, ink, ringWidth, gap });
}

// Monogram: the M of MAMBETRON on a tile, for favicons and app icons where
// the drawing would be too fine to read.
export function monogram({ bg = W.biru, ink = W.putih, bentuk = 'persegi', sudut = 0.22, isi: penuh = 0.56 } = {}) {
  const [x0, y0, x1, y1] = M_BOX;
  const mw = x1 - x0, mh = y1 - y0;
  const sz = Math.max(mw, mh) / penuh;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const bx = cx - sz / 2, by = cy - sz / 2;
  let svg = '';
  if (bg) {
    svg += bentuk === 'bulat'
      ? `<circle cx="${cx}" cy="${cy}" r="${sz / 2}" fill="${bg}"/>`
      : `<rect x="${bx}" y="${by}" width="${sz}" height="${sz}" rx="${sz * sudut}" fill="${bg}"/>`;
  }
  svg += isi(M, ink);
  return mk(svg, [bx, by, bx + sz, by + sz]);
}

// The man in the hammock alone, without the palms and the island.
// tebal thickens every line by that many logo units so the drawing still
// reads when it is shrunk to a browser tab.
const HB = T.kotakHammock;
export function hammock({ ink = W.biru, tebal = 0 } = {}) {
  const garis = tebal ? ` stroke="${ink}" stroke-width="${tebal}" stroke-linejoin="round"` : '';
  const p = tebal / 2;
  return mk(`<path d="${T.hammock}" fill="${ink}" fill-rule="evenodd"${garis}/>`, [HB[0] - p, HB[1] - p, HB[2] + p, HB[3] + p]);
}

// Favicon and app icon: the man in the hammock on a tile. lebar is the
// drawing's width as a share of the tile, above 1 the hammock ends run off
// the edges so the man can be bigger at tiny sizes.
export function favikon({ bg = W.biru, ink = W.putih, tebal = 0, lebar = 0.86, sudut = 0.22, turun = 0.04 } = {}) {
  const g = hammock({ ink, tebal });
  const sz = g.box[2] / lebar;
  const cx = g.box[0] + g.box[2] / 2, cy = g.box[1] + g.box[3] / 2 - sz * turun;
  const bx = cx - sz / 2, by = cy - sz / 2;
  const cid = id('f');
  const tile = `<rect x="${bx}" y="${by}" width="${sz}" height="${sz}" rx="${sz * sudut}"/>`;
  let svg = `<defs><clipPath id="${cid}">${tile}</clipPath></defs>`;
  if (bg) svg += tile.replace('/>', ` fill="${bg}"/>`);
  svg += `<g clip-path="url(#${cid})">${g.svg}</g>`;
  return mk(svg, [bx, by, bx + sz, by + sz]);
}

// Wordmark: the traced MAMBETRON with HOMESTAY under it.
// sub       colour of HOMESTAY (defaults to ink)
// homestay  false drops HOMESTAY
// gaya      kept for older callers, both styles use the traced lettering
export function wordmark({ ink = W.biru, sub = null, homestay = true } = {}) {
  const svg = isi(KATA, ink) + (homestay ? isi(HS, sub || ink) : '');
  return mk(svg, homestay ? TEKS_BOX : KATA_BOX);
}

// Horizontal lockup: the drawing beside the wordmark. bulat puts the
// drawing in the round badge instead, badge passes options to that badge.
export function horizontal({ ink = W.biru, sub = null, badge = null, bulat = false } = {}) {
  const g = bulat || badge ? lencana({ ink, ...(badge || {}) }) : simbol({ ink });
  const wm = wordmark({ ink, sub });
  const bh = 200;
  const p = taruh(g, { x: 0, y: 0, h: bh });
  const gap = bh * 0.14;
  const ws = (bh * 0.74) / wm.box[3];
  const wy = (bh - wm.box[3] * ws) / 2;
  const svg = p.svg + `<g transform="translate(${(p.w + gap).toFixed(2)} ${wy.toFixed(2)}) scale(${ws.toFixed(5)}) translate(${-wm.box[0]} ${-wm.box[1]})">${wm.svg}</g>`;
  return mk(svg, [0, 0, p.w + gap + wm.box[2] * ws, bh]);
}

// Place a drawable at x,y. With w or h it scales to that size; with both it
// fits inside the w × h box and centres vertically in it.
export function taruh(dw, { x = 0, y = 0, w, h, anchor = 'start' } = {}) {
  const s = w && h ? Math.min(w / dw.box[2], h / dw.box[3]) : w ? w / dw.box[2] : h / dw.box[3];
  const ww = dw.box[2] * s, hh = dw.box[3] * s;
  const x0 = anchor === 'middle' ? x - ww / 2 : anchor === 'end' ? x - ww : x;
  const y0 = w && h ? y + (h - hh) / 2 : y;
  return {
    svg: `<g transform="translate(${x0.toFixed(3)} ${y0.toFixed(3)}) scale(${s.toFixed(5)}) translate(${-dw.box[0]} ${-dw.box[1]})">${dw.svg}</g>`,
    w: ww, h: hh, x: x0, y: y0,
  };
}

export function svgDoc(dw, { pad = 0, bg = null, unit = '', scale = 1 } = {}) {
  const [x, y, w, h] = dw.box;
  const vb = [x - pad, y - pad, w + 2 * pad, h + 2 * pad];
  const back = bg ? `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map((v) => +v.toFixed(2)).join(' ')}" width="${+(vb[2] * scale).toFixed(2)}${unit}" height="${+(vb[3] * scale).toFixed(2)}${unit}">${back}${dw.svg}</svg>`;
}

export { T as TRACED, INK_BOX, HULL_BOX, ILU_BOX };
