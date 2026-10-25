// Logo geometry built from the traced original (brand/logo/sumber).
// The logo is a kuskus head peeking over a horizontal line, with the word
// "mambetron" and HOMESTAY under it. The trace tells us where the line, the
// head and the lettering are, so each can be coloured on its own.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { text, measure } from './huruf.mjs';
import { W } from './palet.mjs';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../brand/logo/sumber/logo-traced.json');
const T = JSON.parse(fs.readFileSync(SRC));
let uid = 0;
const id = (p) => `${p}${++uid}`;

export const LIDAH = '#F0A0A0';
const union = (list) => list.reduce((b, c) => [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[2]), Math.max(b[3], c[3])]);
const isTeks = (c) => c.bbox[1] >= T.teksAtas - 0.5;
const ALL = T.contours.map((c) => c.d).join('');
const KEP = T.contours.filter((c) => !isTeks(c));
const TEKS = T.contours.filter(isTeks);
const KUSKUS = KEP.map((c) => c.d).join('');
const HURUF = TEKS.map((c) => c.d).join('');
const LIDAH_D = T.lidah != null ? T.contours[T.lidah].d : '';
const lidah = () => (LIDAH_D ? `<path d="${LIDAH_D}" fill="${LIDAH}"/>` : '');

const INK_BOX = union(T.contours.map((c) => c.bbox));
const HULL_BOX = [INK_BOX[0] - T.rim, INK_BOX[1] - T.rim, INK_BOX[2] + T.rim, INK_BOX[3] + T.rim];
const TEKS_BOX = union(TEKS.map((c) => c.bbox));
const [GX0, GY0, GX1, GY1] = T.garis;
const [MX0, MX1] = T.moncong;
const [KX0, KY0, KX1, KY1] = T.kepala;
const KCX = (KX0 + KX1) / 2;

// A drawable: { svg, box: [x, y, w, h] } in its own units.
const mk = (svg, b) => ({ svg, box: [b[0], b[1], b[2] - b[0], b[3] - b[1]] });

// Primary logo.
// positive  ink on light grounds
// negative  for dark grounds: line and words in paper colour, the head keeps
//           its ink with a paper rim so the face reads as designed
// sticker   ink logo on a paper plate with a rim, for photos and patterns
export function utama({ varian = 'positive', ink = W.hitam, paper = W.putih } = {}) {
  if (varian === 'positive') return mk(`<path d="${ALL}" fill="${ink}" fill-rule="evenodd"/>${lidah()}`, INK_BOX);
  if (varian === 'negative') {
    const cid = id('n');
    const clip = `<clipPath id="${cid}"><path d="M${INK_BOX[0] - 20} ${INK_BOX[1] - 20}H${INK_BOX[2] + 20}V${GY0}H${INK_BOX[0] - 20}ZM${MX0} ${GY0 - 1}H${MX1}V${T.teksAtas}H${MX0}Z"/></clipPath>`;
    return mk(`<defs>${clip}</defs><rect x="${GX0}" y="${GY0}" width="${GX1 - GX0}" height="${GY1 - GY0}" fill="${paper}"/>`
      + `<path d="${T.hullKepala}" fill="${paper}"/>`
      + `<g clip-path="url(#${cid})"><path d="${KUSKUS}" fill="${ink}" fill-rule="evenodd"/></g>`
      + `<path d="${HURUF}" fill="${paper}" fill-rule="evenodd"/>${lidah()}`, HULL_BOX);
  }
  return mk(`<path d="${T.hull}" fill="${paper}"/><path d="${ALL}" fill="${ink}" fill-rule="evenodd"/>${lidah()}`, HULL_BOX);
}

// Badge: the head peeking over the line, in a circle or a square.
// bg      colour behind the head (null keeps it transparent)
// plate   colour of the rim and of the panel under the line (null for one colour)
// ring    colour of an outer ring (defaults to bg so the circle stays whole on
//         white pages), ringWidth as a fraction of the radius
// bentuk  bulat (circle) or persegi (full-bleed square, for app icons)
export const BADGE = { cx: KCX, cy: GY0 - 88, r: 262 };
export function lencana({ bg = W.pasir, ink = W.hitam, plate = W.putih, ring, ringWidth = 0.06, gap = 0.04, bentuk = 'bulat', sisi = 450, atas = KY0 - 22 } = {}) {
  const { cx, cy, r } = BADGE;
  const cid = id('b');
  if (ring === undefined) ring = bg;
  const kepala = (x0, x1, y1) => (plate ? `<rect x="${x0}" y="${GY1 - 1}" width="${x1 - x0}" height="${y1 - GY1 + 1}" fill="${plate}"/><path d="${T.hullKepala}" fill="${plate}"/>` : '')
    + `<path d="${KUSKUS}" fill="${ink}" fill-rule="evenodd"/>${plate || bg ? lidah() : ''}`;
  if (bentuk === 'persegi') {
    const h = sisi / 2;
    const x0 = cx - h, y0 = atas, x1 = cx + h, y1 = y0 + sisi;
    let svg = `<defs><clipPath id="${cid}"><rect x="${x0}" y="${y0}" width="${sisi}" height="${sisi}"/></clipPath></defs>`;
    svg += `<rect x="${x0}" y="${y0}" width="${sisi}" height="${sisi}" fill="${bg}"/>`;
    svg += `<g clip-path="url(#${cid})">${kepala(x0, x1, y1)}</g>`;
    return mk(svg, [x0, y0, x1, y1]);
  }
  const rw = ring ? r * ringWidth : 0;
  const ri = ring ? r - rw - (ring !== bg ? r * gap : 0) : r;
  let svg = `<defs><clipPath id="${cid}"><circle cx="${cx}" cy="${cy}" r="${ri}"/></clipPath></defs>`;
  if (ring) svg += `<path d="M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0ZM${cx - r + rw} ${cy}a${r - rw} ${r - rw} 0 1 1 ${2 * (r - rw)} 0a${r - rw} ${r - rw} 0 1 1 ${-2 * (r - rw)} 0Z" fill="${ring}" fill-rule="evenodd"/>`;
  if (bg) svg += `<circle cx="${cx}" cy="${cy}" r="${ri}" fill="${bg}"/>`;
  svg += `<g clip-path="url(#${cid})">${kepala(cx - r, cx + r, cy + r)}</g>`;
  return mk(svg, [cx - r, cy - r, cx + r, cy + r]);
}

// One-colour stamp: ring + head and line, nothing else. For embroidery,
// engraving, rubber stamps and single-ink printing.
export function stempel({ ink = W.hitam, ringWidth = 0.06, gap = 0.05 } = {}) {
  return lencana({ bg: null, plate: null, ring: ink, ink, ringWidth, gap });
}

// Wordmark.
// stacked   the traced lettering of the logo, mambetron over HOMESTAY
// inline    mambetron in Fredoka Bold with HOMESTAY left aligned, for lockups
export function wordmark({ ink = W.hitam, sub = null, gaya = 'stacked', homestay = true } = {}) {
  if (gaya === 'stacked') {
    const kata = TEKS.filter((c) => c.bbox[3] < TEKS_BOX[1] + (TEKS_BOX[3] - TEKS_BOX[1]) * 0.7);
    const hs = TEKS.filter((c) => !kata.includes(c));
    const svg = `<path d="${kata.map((c) => c.d).join('')}" fill="${ink}" fill-rule="evenodd"/>`
      + (homestay ? `<path d="${hs.map((c) => c.d).join('')}" fill="${sub || ink}" fill-rule="evenodd"/>` : '');
    return mk(svg, homestay ? TEKS_BOX : union(kata.map((c) => c.bbox)));
  }
  const size = 100;
  const tr = -0.01;
  const mW = measure('mambetron', { family: 'fredoka', weight: 700, size, tracking: tr });
  // box from the ascender top (0) to the baseline of the last line
  let svg = text('mambetron', { x: 0, y: 74, family: 'fredoka', weight: 700, size, tracking: tr, fill: ink });
  let bottom = 74;
  if (homestay) {
    const hs = 31;
    const hy = 74 + 28 + hs * 0.745;
    svg += text('HOMESTAY', { x: 3, y: hy, family: 'jakarta', weight: 600, size: hs, tracking: 0.36, fill: sub || ink });
    bottom = hy;
  }
  return mk(svg, [-1, 0, mW + 1, bottom]);
}

// Horizontal lockup: badge + wordmark.
export function horizontal({ ink = W.hitam, sub = null, badge = {} } = {}) {
  const b = lencana(badge);
  const wm = wordmark({ ink, sub, gaya: 'inline' });
  const bh = 168;
  const gap = 32;
  const p = taruh(b, { x: 0, y: 0, h: bh });
  const wy = (bh - wm.box[3]) / 2;
  const svg = p.svg + `<g transform="translate(${bh + gap} ${wy})">${wm.svg}</g>`;
  return mk(svg, [0, 0, bh + gap + wm.box[2], bh]);
}

// Place a drawable at x,y. With w or h it scales to that size; with both it
// fits inside the w × h box and centres vertically in it.
export function taruh(d, { x = 0, y = 0, w, h, anchor = 'start' } = {}) {
  const s = w && h ? Math.min(w / d.box[2], h / d.box[3]) : w ? w / d.box[2] : h / d.box[3];
  const ww = d.box[2] * s, hh = d.box[3] * s;
  const x0 = anchor === 'middle' ? x - ww / 2 : anchor === 'end' ? x - ww : x;
  const y0 = w && h ? y + (h - hh) / 2 : y;
  return {
    svg: `<g transform="translate(${x0.toFixed(3)} ${y0.toFixed(3)}) scale(${s.toFixed(5)}) translate(${-d.box[0]} ${-d.box[1]})">${d.svg}</g>`,
    w: ww, h: hh, x: x0, y: y0,
  };
}

export function svgDoc(d, { pad = 0, bg = null, unit = '', scale = 1 } = {}) {
  const [x, y, w, h] = d.box;
  const vb = [x - pad, y - pad, w + 2 * pad, h + 2 * pad];
  const back = bg ? `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map((v) => +v.toFixed(2)).join(' ')}" width="${+(vb[2] * scale).toFixed(2)}${unit}" height="${+(vb[3] * scale).toFixed(2)}${unit}">${back}${d.svg}</svg>`;
}

export { T as TRACED, INK_BOX, HULL_BOX };

// Raw head pieces for custom compositions (emblems), in logo units.
// garisAtas/garisBawah are the top and bottom of the line, moncong the
// columns of the snout that hangs below it, cx the head's centre.
export const KEPALA = {
  kuskus: KUSKUS, hull: T.hullKepala, lidah: LIDAH_D, garisAtas: GY0, garisBawah: GY1,
  moncong: [MX0, MX1], cx: KCX, lebar: KX1 - KX0, atas: KY0, bawah: KY1,
};
