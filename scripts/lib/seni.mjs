// Supporting graphics: Raja Ampat karst islands, sea, tail swirl, line icons.
import { W } from './palet.mjs';

export function acak(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const f = (n) => +n.toFixed(2);

// Mushroom-shaped karst islet: notched at the waterline, steep walls,
// dome of forest on top.
export function pulau({ x, y, w, h, seed = 3, fill = W.laut, bumps = 7, lean = 0 }) {
  const r = acak(seed);
  const bw = w * (0.3 + r() * 0.06);
  const shL = y - h * (0.26 + r() * 0.06), shR = y - h * (0.26 + r() * 0.06);
  const wallL = y - h * (0.6 + r() * 0.08), wallR = y - h * (0.6 + r() * 0.08);
  const L = x - w / 2, R = x + w / 2;
  const top = y - h;
  let d = `M${f(x - bw)} ${f(y)}`;
  d += `C${f(x - bw - w * 0.01)} ${f(y - h * 0.16)} ${f(L + w * 0.02)} ${f(shL + h * 0.06)} ${f(L)} ${f(shL)}`;
  d += `C${f(L - w * 0.03)} ${f(shL - h * 0.12)} ${f(L - w * 0.01)} ${f(wallL + h * 0.1)} ${f(L + w * 0.03)} ${f(wallL)}`;
  // dome: superellipse from left wall top to right wall top, with small bumps
  const cx = x + lean * w, cy = (wallL + wallR) / 2;
  const a = w / 2 - w * 0.03, b = cy - top;
  const pts = [];
  for (let i = 0; i <= bumps; i++) {
    const t = Math.PI - (Math.PI * i) / bumps;
    const c = Math.cos(t), sn = Math.sin(t);
    const px = cx + a * Math.sign(c) * Math.pow(Math.abs(c), 0.8);
    const py = cy - b * Math.pow(sn, 0.7) * (0.94 + r() * 0.08);
    pts.push([i === 0 ? L + w * 0.03 : i === bumps ? R - w * 0.03 : px, i === 0 ? wallL : i === bumps ? wallR : py]);
  }
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const dx = mx - cx, dy = my - cy;
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.hypot(x1 - x0, y1 - y0) * (0.14 + r() * 0.14);
    d += `Q${f(mx + (dx / len) * k)} ${f(my + (dy / len) * k)} ${f(x1)} ${f(y1)}`;
  }
  d += `C${f(R + w * 0.01)} ${f(wallR + h * 0.1)} ${f(R + w * 0.03)} ${f(shR - h * 0.12)} ${f(R)} ${f(shR)}`;
  d += `C${f(R - w * 0.02)} ${f(shR + h * 0.06)} ${f(x + bw + w * 0.01)} ${f(y - h * 0.16)} ${f(x + bw)} ${f(y)}Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

// Gentle wave band filling everything below the crest line.
export function ombak({ x = 0, y, w, depth, amp = 6, len = 60, fill = W.biru, phase = 0 }) {
  let d = `M${f(x)} ${f(y + depth)}L${f(x)} ${f(y)}`;
  const n = Math.ceil(w / len) + 1;
  for (let i = 0; i < n; i++) {
    const x0 = x + i * len - phase;
    d += `Q${f(x0 + len / 4)} ${f(y - amp)} ${f(x0 + len / 2)} ${f(y)}T${f(x0 + len)} ${f(y)}`;
  }
  d += `L${f(x + w + len)} ${f(y + depth)}Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

// Rounded short strokes for light on water.
export function kilau({ x, y, w, n = 6, seed = 7, color = W.putih, thick = 3, opacity = 0.5 }) {
  const r = acak(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const lx = x + r() * w, ly = y + i * thick * 3.2;
    const lw = w * (0.05 + r() * 0.1);
    s += `<rect x="${f(lx)}" y="${f(ly)}" width="${f(lw)}" height="${thick}" rx="${thick / 2}" fill="${color}" opacity="${opacity}"/>`;
  }
  return s;
}

// Raja Ampat seascape: sun, karst islets, layered sea, clipped to w×h.
let lid = 0;
export function lanskap({ w, h, sky = W.buih, sun = W.pasir, far = W.biru, near = W.laut, sea1 = W.biru, sea2 = W.laut, seed = 11, sunX = 0.7, horizon = 0.64, islands = true, glint = true, susunan = null, sunY = 0.26, sunR = null }) {
  const r = acak(seed);
  const hy = h * horizon;
  const id = `lsk${++lid}`;
  const u = Math.min(w * 1.6, h * 2.6);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">`;
  s += `<rect width="${w}" height="${h}" fill="${sky}"/>`;
  if (sun) s += `<circle cx="${f(w * sunX)}" cy="${f(hy - h * sunY)}" r="${f(sunR || u * 0.075)}" fill="${sun}"/>`;
  if (islands) {
    // [x, width, height, layer] as fractions; sizes follow u so islets keep
    // their shape in tall and wide frames alike
    const plan = susunan || [
      [0.08, 0.1, 0.17, 0], [0.19, 0.06, 0.11, 0], [0.62, 0.07, 0.12, 0], [0.9, 0.11, 0.2, 0], [0.79, 0.05, 0.09, 0],
      [0.3, 0.11, 0.25, 1], [0.41, 0.05, 0.12, 1], [0.72, 0.08, 0.17, 1],
    ];
    for (const [px, pw, ph, layer] of plan.filter((p) => !p[3]).concat(plan.filter((p) => p[3]))) {
      s += pulau({ x: w * px, y: hy + h * (layer ? 0.035 : 0.005), w: u * pw, h: u * ph * (layer ? 0.42 : 0.5), seed: Math.floor(r() * 1000), fill: layer ? near : far, lean: (r() - 0.5) * 0.1 });
    }
  }
  s += ombak({ y: hy, w, depth: h - hy, amp: h * 0.008, len: w / 10, fill: sea1 });
  s += ombak({ y: hy + h * 0.045, w, depth: h - hy, amp: h * 0.01, len: w / 8, fill: sea2, phase: w / 23 });
  if (glint) s += kilau({ x: w * 0.08, y: hy + h * 0.1, w: w * 0.84, n: 3, seed, thick: Math.max(1, h * 0.007), opacity: 0.35 });
  return s + '</g>';
}

// Wave that ends in a curl, taken from the kuskus tail in the logo.
// The curl sits at the right end of a lead-in of length len.
export function ekorOmbak({ x, y, R, len = 3, turns = 1.35, dir = 1 }) {
  const cx = x + len * R * dir, cy = y - R;
  let d = `M${f(x)} ${f(y)}C${f(x + len * R * 0.35 * dir)} ${f(y + R * 0.18)} ${f(x + len * R * 0.6 * dir)} ${f(y)} ${f(cx)} ${f(y)}`;
  const n = 60;
  const t0 = Math.PI / 2;
  const tmax = turns * 2 * Math.PI;
  for (let i = 1; i <= n; i++) {
    const t = (i / n) * tmax;
    const rad = R * (1 - 0.62 * (t / tmax));
    const ang = t0 - t * dir;
    d += `L${f(cx + rad * Math.cos(ang) * dir * dir)} ${f(cy + rad * Math.sin(ang))}`;
  }
  return d;
}
export function ekor({ x, y, R, len = 3, turns = 1.35, dir = 1, color = W.biru, width = 0.3 }) {
  return `<path d="${ekorOmbak({ x, y, R, len, turns, dir })}" fill="none" stroke="${color}" stroke-width="${f(R * width)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// Repeating brand pattern on a square tile.
export function polaTile(size, { swirl = W.biru, dot = W.pasir, opacity = 1 } = {}) {
  const s = size;
  const R = s * 0.085;
  return `<g opacity="${opacity}">`
    + ekor({ x: s * 0.06, y: s * 0.36, R, len: 3.4, color: swirl })
    + ekor({ x: s * 0.56, y: s * 0.86, R, len: 3.4, color: swirl })
    + `<circle cx="${f(s * 0.84)}" cy="${f(s * 0.3)}" r="${f(s * 0.022)}" fill="${dot}"/>`
    + `<circle cx="${f(s * 0.34)}" cy="${f(s * 0.8)}" r="${f(s * 0.022)}" fill="${dot}"/>`
    + `</g>`;
}
let pid = 0;
export function pola({ x = 0, y = 0, w, h, tile = 120, bg = W.laut, swirl = W.biru, dot = W.pasir, opacity = 1 }) {
  const id = `pola${++pid}`;
  return `<defs><pattern id="${id}" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse" x="${x}" y="${y}">${polaTile(tile, { swirl, dot, opacity })}</pattern></defs>`
    + (bg ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/>` : '')
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;
}

// 24×24 line icons, drawn with round strokes.
export const IKON = {
  kamar: 'M3 19v-6.5A2.5 2.5 0 0 1 5.5 10h13a2.5 2.5 0 0 1 2.5 2.5V19M3 16h18M6 10V7.5A1.5 1.5 0 0 1 7.5 6h3A1.5 1.5 0 0 1 12 7.5V10M12 10V7.5A1.5 1.5 0 0 1 13.5 6h3A1.5 1.5 0 0 1 18 7.5V10',
  makan: 'M3.5 12h17a8.5 8.5 0 0 1-17 0ZM9 8.5c-.8-1 .8-2 0-3.5M12 8.5c-.8-1 .8-2 0-3.5M15 8.5c-.8-1 .8-2 0-3.5M7 20.5h10',
  snorkel: 'M3 9.5A2.5 2.5 0 0 1 5.5 7h10A2.5 2.5 0 0 1 18 9.5v2a3.5 3.5 0 0 1-3.5 3.5h-1.2l-1.3-1.6h-1L9.7 15H8.5A3.5 3.5 0 0 1 5 11.5M21 3.5V14a5 5 0 0 1-5 5h-3',
  perahu: 'M2.5 14.5h19l-2.6 4.2a1.5 1.5 0 0 1-1.3.8H6.6a1.5 1.5 0 0 1-1.3-.8ZM7 14.5V10h7l2.5 4.5M10 10V6.5',
  lokasi: 'M12 21.5s7-6.4 7-12a7 7 0 0 0-14 0c0 5.6 7 12 7 12ZM12 12a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z',
  bintang: 'M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z',
  wifi: 'M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.6 15.5a5 5 0 0 1 6.8 0M12 19.2h.01',
  chat: 'M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.6-4.3A8.5 8.5 0 1 1 20.5 11.5ZM9 10.5c0 2.5 2 4.5 4.5 4.5l1.3-1.3-1.8-1-1 .8a3 3 0 0 1-1.5-1.5l.8-1-1-1.8Z',
  kamera: 'M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17.2 6.8h.01',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z',
  air: 'M12 3s6.5 7 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3ZM9 14.5a3 3 0 0 0 3 3',
  sampah: 'M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5',
  karang: 'M12 21v-6M12 15c-3 0-4.5-2-4.5-5M7.5 10V6M7.5 10c-2 0-3-1.5-3-3.5M12 15c3 0 4.5-2 4.5-5M16.5 10V5M16.5 10c2 0 3-1.5 3-3.5M12 15V9M8 21h8',
  daun: 'M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l7-7',
  jam: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2',
  bulan: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z',
  sapu: 'M14 3l-3.5 9M7 12.5h7.5l2.5 8.5H4.5Z M9 21l1-5M13 21l-.5-5',
};
export function ikon(nama, { x = 0, y = 0, size = 24, color = W.hitam, stroke = 1.8 } = {}) {
  const s = size / 24;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><path d="${IKON[nama]}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
