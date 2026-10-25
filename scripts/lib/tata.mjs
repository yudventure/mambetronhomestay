// Layout helpers shared by the print and social designs.
import { createRequire } from 'module';
import { W } from './palet.mjs';
import { text, measure } from './huruf.mjs';
import { ikon, lanskap } from './seni.mjs';
const require = createRequire(import.meta.url);
const QRCode = require('qrcode');

export const doc = (w, h, body, unit = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}${unit}" height="${h}${unit}">${body}</svg>`;

export const rect = (x, y, w, h, fill, rx = 0, extra = '') =>
  `<rect x="${+x.toFixed(2)}" y="${+y.toFixed(2)}" width="${+w.toFixed(2)}" height="${+h.toFixed(2)}"${rx ? ` rx="${rx}"` : ''} fill="${fill}"${extra}/>`;

// Pill button with centred label.
export function tombol(label, { x, y, size, fill = W.senja, color = W.hitam, padX = 1.3, h = 2.5, anchor = 'start', weight = 700, family = 'jakarta' }) {
  const tw = measure(label, { family, weight, size });
  const w = tw + size * padX * 2;
  const hh = size * h;
  const x0 = anchor === 'middle' ? x - w / 2 : x;
  return {
    svg: rect(x0, y, w, hh, fill, hh / 2) + text(label, { x: x0 + w / 2, y: y + hh / 2 + size * 0.36, size, weight, family, fill: color, anchor: 'middle' }),
    w, h: hh,
  };
}

// Icon + text rows for contact details. items: [[icon, text], ...]
export function kontak(items, { x, y, size, color = W.hitam, iconColor = color, gap = 1.9, weight = 600, layout = 'kolom', spacing = 1.4 }) {
  let s = '';
  let cx = x, cy = y;
  for (const [nama, isi] of items) {
    s += ikon(nama, { x: cx, y: cy - size * 0.98, size: size * 1.3, color: iconColor, stroke: 2 });
    s += text(isi, { x: cx + size * gap, y: cy, size, weight, fill: color });
    if (layout === 'kolom') cy += size * 2 * spacing;
    else cx += size * gap + measure(isi, { size, weight }) + size * 2.2;
  }
  return s;
}

// QR code from K.qr, or a clearly marked empty box when no link is set yet.
export function qr(K, { x, y, size, dark = W.hitam, light = W.putih, label = 'PINDAI' }) {
  if (!K.qr) {
    const s = size;
    return rect(x, y, s, s, light, s * 0.06)
      + `<rect x="${x + s * 0.06}" y="${y + s * 0.06}" width="${s * 0.88}" height="${s * 0.88}" rx="${s * 0.04}" fill="none" stroke="${dark}" stroke-width="${s * 0.014}"/>`
      + text('KODE QR', { x: x + s / 2, y: y + s * 0.5, size: s * 0.11, weight: 700, fill: dark, anchor: 'middle', tracking: 0.08 })
      + text('isi kontak.lokal.json', { x: x + s / 2, y: y + s * 0.64, size: s * 0.065, weight: 500, fill: dark, anchor: 'middle' });
  }
  const q = QRCode.create(K.qr, { errorCorrectionLevel: 'M' });
  const n = q.modules.size;
  const quiet = 2;
  const m = size / (n + quiet * 2);
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (q.modules.get(r, c)) d += `M${(x + (c + quiet) * m).toFixed(3)} ${(y + (r + quiet) * m).toFixed(3)}h${m.toFixed(3)}v${m.toFixed(3)}h${(-m).toFixed(3)}Z`;
  }
  return rect(x, y, size, size, light, size * 0.04) + `<path d="${d}" fill="${dark}"/>`;
}

// Five-point stars row.
export function bintang(n, { x, y, size, fill = W.senja }) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const cx = x + i * size * 1.25 + size / 2, cy = y + size / 2;
    const pts = [];
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      const r = k % 2 ? size * 0.22 : size * 0.5;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    s += `<path d="M${pts.join('L')}Z" fill="${fill}" stroke="${fill}" stroke-width="${size * 0.08}" stroke-linejoin="round"/>`;
  }
  return s;
}

let gid = 0;
export function klip(x, y, w, h, body, rx = 0) {
  const id = `k${++gid}`;
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/></clipPath></defs><g clip-path="url(#${id})">${body}</g>`;
}

// Photo slot. Shows the seascape illustration until a real photo is placed
// in the SVG group with id "foto-…".
export function foto(nama, { x, y, w, h, rx = 0, ...opsi }) {
  return klip(x, y, w, h, `<g id="foto-${nama}" transform="translate(${x} ${y})">${lanskap({ w, h, seed: 5, horizon: 0.62, sunX: 0.72, ...opsi })}</g>`, rx);
}

// Embed a finished SVG document inside another at x, y with width w.
export function sisip(svg, x, y, w, h) {
  const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const hh = h || (w * vb[3]) / vb[2];
  return svg.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/, '<svg').replace(/width="[^"]+" height="[^"]+"/, `x="${x}" y="${y}" width="${w}" height="${+hh.toFixed(2)}"`);
}

// Die line for cut shapes: magenta hairline, not printed.
export const potong = (d) => `<g id="garis-potong"><path d="${d}" fill="none" stroke="#EC008C" stroke-width="0.25"/></g>`;

// Soft drop shadow filter for mockups.
let fid = 0;
export function bayangan(body, { dx = 0, dy = 10, blur = 14, opacity = 0.18 } = {}) {
  const id = `sh${++fid}`;
  return `<defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur}" flood-color="#0B3B4A" flood-opacity="${opacity}"/></filter></defs><g filter="url(#${id})">${body}</g>`;
}
