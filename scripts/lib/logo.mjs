// Logo geometry built from the traced original (brand/logo/sumber).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { text, measure } from './huruf.mjs';
import { W } from './palet.mjs';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../brand/logo/sumber/logo-traced.json');
const T = JSON.parse(fs.readFileSync(SRC));
let uid = 0;
const id = (p) => `${p}${++uid}`;

const ALL = T.contours.map((c) => c.d).join('');
const union = (list) => list.reduce((b, c) => [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[2]), Math.max(b[3], c[3])]);
const INK_BOX = union(T.contours.map((c) => c.bbox));
const HULL_BOX = [INK_BOX[0] - T.rim, INK_BOX[1] - T.rim, INK_BOX[2] + T.rim, INK_BOX[3] + T.rim];

// A drawable: { svg, box: [x, y, w, h] } in its own units.
const mk = (svg, b) => ({ svg, box: [b[0], b[1], b[2] - b[0], b[3] - b[1]] });

// Primary logo.
// positive  ink on light grounds
// negative  one colour (usually white) for dark grounds, eyes and sign stay readable
// sticker   ink logo on a paper-coloured plate with rim, works on photos and patterns
export function utama({ varian = 'positive', ink = W.hitam, paper = W.putih } = {}) {
  if (varian === 'positive') return mk(`<path d="${ALL}" fill="${ink}" fill-rule="evenodd"/>`, INK_BOX);
  if (varian === 'negative') return mk(`<path d="${T.hull}${ALL}" fill="${paper}" fill-rule="evenodd"/>`, HULL_BOX);
  return mk(`<path d="${T.hull}" fill="${paper}"/><path d="${ALL}" fill="${ink}" fill-rule="evenodd"/>`, HULL_BOX);
}

// Contours of the kuskus only (the sign lettering sits lower than y 400).
const KUSKUS = T.contours.filter((c) => c.bbox[1] < 400).map((c) => c.d).join('');

// Badge: the kuskus peeking over the edge of its sign, in a circle or square.
// bg      colour behind the head (null keeps it transparent)
// plate   colour of the rim and sign under the head (null for one-colour use)
// ring    colour of an outer ring (defaults to bg so the circle stays whole
//         on white pages), ringWidth as a fraction of the radius
// bentuk  bulat (circle) or persegi (full-bleed square, for app icons)
export const BADGE = { cx: 570, cy: 205, r: 320 };
export function lencana({ bg = W.pasir, ink = W.hitam, plate = W.putih, ring, ringWidth = 0.06, gap = 0.04, bentuk = 'bulat', sisi = 485, atas = -28 } = {}) {
  const { cx, cy } = BADGE;
  const r = BADGE.r;
  const cid = id('b');
  if (ring === undefined) ring = bg;
  if (bentuk === 'persegi') {
    // square crop, sign panel along the bottom; below the sign edge only the
    // snout and the right paw stay, the arm and tail are covered by the panel
    // sisi is the side of the square, atas its top edge, in logo units
    const h = sisi / 2;
    const x0 = 565 - h, y0 = atas, x1 = 565 + h, y1 = y0 + 2 * h;
    const edge = 350;
    let svg = `<defs><clipPath id="${cid}"><rect x="${x0}" y="${y0}" width="${2 * h}" height="${2 * h}"/></clipPath>`
      + `<clipPath id="${cid}k"><path d="M${x0} ${y0}H${x1}V${y1}H430V${edge}H${x0}Z"/></clipPath></defs>`;
    svg += `<rect x="${x0}" y="${y0}" width="${2 * h}" height="${2 * h}" fill="${bg}"/>`;
    svg += `<g clip-path="url(#${cid})">`;
    if (plate) svg += `<path d="${T.hull}" fill="${plate}"/><rect x="${x0}" y="${edge - 6}" width="${2 * h}" height="${y1 - edge + 6}" fill="${plate}"/>`;
    svg += `<g clip-path="url(#${cid}k)"><path d="${KUSKUS}" fill="${ink}" fill-rule="evenodd"/></g></g>`;
    return mk(svg, [x0, y0, x1, y1]);
  }
  const rw = ring ? r * ringWidth : 0;
  const ri = ring ? r - rw - (ring !== bg ? r * gap : 0) : r;
  let svg = `<defs><clipPath id="${cid}"><circle cx="${cx}" cy="${cy}" r="${ri}"/></clipPath></defs>`;
  if (ring) svg += `<path d="M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0ZM${cx - r + rw} ${cy}a${r - rw} ${r - rw} 0 1 1 ${2 * (r - rw)} 0a${r - rw} ${r - rw} 0 1 1 ${-2 * (r - rw)} 0Z" fill="${ring}" fill-rule="evenodd"/>`;
  if (bg) svg += `<circle cx="${cx}" cy="${cy}" r="${ri}" fill="${bg}"/>`;
  svg += `<g clip-path="url(#${cid})">`;
  if (plate) svg += `<path d="${T.hull}" fill="${plate}"/>`;
  svg += `<path d="${KUSKUS}" fill="${ink}" fill-rule="evenodd"/></g>`;
  return mk(svg, [cx - r, cy - r, cx + r, cy + r]);
}

// One-colour stamp: ring + kuskus, nothing else. For embroidery, engraving,
// rubber stamps and single-ink printing.
export function stempel({ ink = W.hitam, ringWidth = 0.06, gap = 0.05 } = {}) {
  return lencana({ bg: null, plate: null, ring: ink, ink, ringWidth, gap });
}

// Wordmark set in the brand typefaces (the original wordmark is Fredoka Bold).
// stacked   HOMESTAY centred under the name, as in the primary logo
// inline    HOMESTAY left aligned, for horizontal lockups
export function wordmark({ ink = W.hitam, sub = null, gaya = 'stacked', homestay = true } = {}) {
  const size = 100;
  const tr = -0.02;
  const mW = measure('Mambetron', { family: 'fredoka', weight: 700, size, tracking: tr });
  const stacked = gaya === 'stacked';
  const hs = stacked ? 35.4 : 33;
  const ht = stacked ? 0.27 : 0.34;
  const x0 = stacked ? -mW / 2 : 0;
  let svg = text('Mambetron', { x: x0, y: 70, family: 'fredoka', weight: 700, size, tracking: tr, fill: ink });
  let bottom = 70;
  if (homestay) {
    const hy = stacked ? 70 + 32 + hs * 0.745 : 70 + 26 + hs * 0.745;
    svg += text('HOMESTAY', { x: stacked ? 0 : 3, y: hy, family: 'jakarta', weight: 600, size: hs, tracking: ht, anchor: stacked ? 'middle' : 'start', fill: sub || ink });
    bottom = hy;
  }
  // box from cap top (y 0) to the baseline of the last line
  return mk(svg, [x0 - 1, 0, x0 + mW + 1, bottom]);
}

// Horizontal lockup: badge + wordmark.
export function horizontal({ ink = W.hitam, sub = null, badge = {} } = {}) {
  const b = lencana(badge);
  const wm = wordmark({ ink, sub, gaya: 'inline' });
  const bh = 168;
  const gap = 34;
  const p = taruh(b, { x: 0, y: 0, h: bh });
  const wy = (bh - wm.box[3]) / 2;
  const svg = p.svg + `<g transform="translate(${bh + gap} ${wy})">${wm.svg}</g>`;
  return mk(svg, [0, 0, bh + gap + wm.box[2], bh]);
}

// Place a drawable so its box fits the given width (or height) at x,y.
export function taruh(d, { x = 0, y = 0, w, h, anchor = 'start' } = {}) {
  const s = w ? w / d.box[2] : h / d.box[3];
  const ww = d.box[2] * s;
  const x0 = anchor === 'middle' ? x - ww / 2 : anchor === 'end' ? x - ww : x;
  return {
    svg: `<g transform="translate(${x0.toFixed(3)} ${y.toFixed(3)}) scale(${s.toFixed(5)}) translate(${-d.box[0]} ${-d.box[1]})">${d.svg}</g>`,
    w: ww, h: d.box[3] * s, x: x0, y,
  };
}

export function svgDoc(d, { pad = 0, bg = null, unit = '', scale = 1 } = {}) {
  const [x, y, w, h] = d.box;
  const vb = [x - pad, y - pad, w + 2 * pad, h + 2 * pad];
  const back = bg ? `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map((v) => +v.toFixed(2)).join(' ')}" width="${+(vb[2] * scale).toFixed(2)}${unit}" height="${+(vb[3] * scale).toFixed(2)}${unit}">${back}${d.svg}</svg>`;
}

export { T as TRACED, INK_BOX, HULL_BOX };

// Raw kuskus pieces for custom compositions (emblems), in logo units.
export const KEPALA = { kuskus: KUSKUS, hull: T.hull, edge: 350 };
