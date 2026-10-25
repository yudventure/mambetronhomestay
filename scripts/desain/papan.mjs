// Signage: harbour roll-up banner, X-banner, horizontal banner, homestay
// signboard, guest pickup sign. Print units are millimetres.
import * as L from '../lib/logo.mjs';
import * as A from '../lib/seni.mjs';
import { W } from '../lib/palet.mjs';
import { text, measure } from '../lib/huruf.mjs';
import { maskot } from '../lib/maskot.mjs';
import { doc, rect, qr, sisip, bayangan } from '../lib/tata.mjs';
import { png, pdf, simpan } from '../lib/render.mjs';

const mm = (w, h, body) => doc(w, h, body, 'mm');

function layananBlok(K, { x, y, w, size, warna = W.putih, sub = W.pasir, ikonBg = W.toska, kolom = 2, gapY }) {
  let s = '';
  const cw = w / kolom;
  const r = size * 1.25;
  K.layanan.forEach(([ik, id, en], i) => {
    const cx = x + (i % kolom) * cw, cy = y + Math.floor(i / kolom) * (gapY || size * 3.6);
    s += `<circle cx="${cx + r}" cy="${cy + r}" r="${r}" fill="${ikonBg}"/>`;
    s += A.ikon(ik, { x: cx + r * 0.42, y: cy + r * 0.42, size: r * 1.16, color: W.putih, stroke: 1.9 });
    s += text(id, { x: cx + r * 2 + size * 0.5, y: cy + r * 0.95, size, weight: 700, fill: warna, maxWidth: cw - r * 2 - size * 0.9 });
    s += text(en, { x: cx + r * 2 + size * 0.5, y: cy + r * 0.95 + size * 1.2, size: size * 0.78, weight: 500, fill: sub, maxWidth: cw - r * 2 - size * 0.9 });
  });
  return s;
}

function kartuKontak(K, { x, y, w, h, s }) {
  let o = rect(x, y, w, h, W.putih, s * 1.2);
  const q = h - s * 1.6;
  o += qr(K, { x: x + s * 0.8, y: y + s * 0.8, size: q, dark: W.laut });
  const tx = x + s * 1.6 + q;
  o += text('Pesan kamar', { x: tx, y: y + h * 0.28, size: s * 0.9, weight: 600, fill: W.toskaTua });
  o += A.ikon('chat', { x: tx, y: y + h * 0.36, size: s * 1.7, color: W.laut, stroke: 2 });
  o += text(K.whatsapp, { x: tx + s * 2.2, y: y + h * 0.36 + s * 1.3, size: s * 1.3, weight: 800, fill: W.laut, maxWidth: x + w - tx - s * 3 });
  o += A.ikon('kamera', { x: tx, y: y + h * 0.62, size: s * 1.7, color: W.laut, stroke: 2 });
  o += text(K.instagram, { x: tx + s * 2.2, y: y + h * 0.62 + s * 1.3, size: s * 1.1, weight: 700, fill: W.laut, maxWidth: x + w - tx - s * 3 });
  return o;
}

// Tall contact card: QR on top, details under it.
function kartuKontakTegak(K, { x, y, w, h, s }) {
  let o = rect(x, y, w, h, W.putih, s * 1.2);
  const q = w * 0.62;
  o += qr(K, { x: x + (w - q) / 2, y: y + s * 1.4, size: q, dark: W.laut });
  let ty = y + s * 1.4 + q + s * 2.2;
  o += text('Pesan kamar', { x: x + w / 2, y: ty, size: s * 0.95, weight: 600, fill: W.toskaTua, anchor: 'middle' });
  ty += s * 2.1;
  o += text(K.whatsapp, { x: x + w / 2, y: ty, size: s * 1.35, weight: 800, fill: W.laut, anchor: 'middle', maxWidth: w - s * 2 });
  ty += s * 1.8;
  o += text(K.instagram, { x: x + w / 2, y: ty, size: s * 1.05, weight: 700, fill: W.laut, anchor: 'middle', maxWidth: w - s * 2 });
  return o;
}

// Portrait standing banner. Layout in units where the width is 800.
export function bannerBerdiri(K, { tinggiMm, lebarMm }) {
  const w = 800, h = (800 * tinggiMm) / lebarMm;
  const k = 800 / lebarMm;
  const langit = 700;
  let s = `<g>${A.lanskap({ w, h: langit + 80, horizon: 0.83, sunX: 0.82, seed: 13, susunan: [[0.06, 0.12, 0.2, 0], [0.94, 0.14, 0.24, 0], [0.18, 0.08, 0.13, 1], [0.84, 0.09, 0.16, 1]] })}</g>`;
  s += rect(0, langit + 60, w, h - langit - 60, W.laut);
  s += L.taruh(L.utama({ varian: 'sticker' }), { x: w / 2, y: 70, w: 690, h: 520, anchor: 'middle' }).svg;
  let y = langit + 170;
  s += text('SELAMAT DATANG DI RAJA AMPAT', { x: w / 2, y, size: 25, weight: 700, tracking: 0.16, fill: W.pasir, anchor: 'middle' });
  y += 122;
  s += text('Pelukan hangat', { x: w / 2, y, family: 'fredoka', weight: 700, size: 92, fill: W.putih, anchor: 'middle' });
  y += 100;
  s += text('dari Raja Ampat', { x: w / 2, y, family: 'fredoka', weight: 700, size: 92, fill: W.putih, anchor: 'middle' });
  y += 62;
  s += text(K.sloganEn, { x: w / 2, y, size: 30, weight: 500, fill: W.pasir, anchor: 'middle' });
  // flexible gap, contact card anchored above the stand area
  const bawah = 170 * k;
  const kartuH = 210;
  const kartuY = h - bawah - kartuH - 60;
  const layY = Math.min(y + 90, kartuY - 340);
  s += layananBlok(K, { x: 70, y: layY + Math.max(0, (kartuY - 340 - layY) / 2), w: 680, size: 27, gapY: 130 });
  s += kartuKontak(K, { x: 60, y: kartuY, w: 680, h: kartuH, s: 22 });
  // stand cassette hides roughly the last 15 cm, keep it decorative only
  s += A.pola({ x: 0, y: h - bawah, w, h: bawah, tile: 90, bg: W.laut, swirl: '#13566A', dot: '#1D6A7E' });
  return doc(w, h, s).replace(/width="[^"]+" height="[^"]+"/, `width="${lebarMm}mm" height="${tinggiMm}mm"`);
}

export function spanduk(K) {
  const w = 3000, h = 1000;
  let s = `<g>${A.lanskap({ w, h, horizon: 0.84, sun: null, seed: 17, susunan: [[0.03, 0.06, 0.2, 0], [0.98, 0.05, 0.16, 0]] })}</g>`;
  s += L.taruh(L.utama({ varian: 'sticker' }), { x: 70, y: 90, w: 1020, h: 720 }).svg;
  s += text('SELAMAT DATANG DI RAJA AMPAT', { x: 1180, y: 190, size: 46, weight: 700, tracking: 0.16, fill: W.toskaTua });
  s += text('Pelukan hangat', { x: 1170, y: 340, family: 'fredoka', weight: 700, size: 150, fill: W.laut });
  s += text('dari Raja Ampat', { x: 1170, y: 490, family: 'fredoka', weight: 700, size: 150, fill: W.laut });
  s += layananBlok(K, { x: 1180, y: 570, w: 1060, size: 40, warna: W.laut, sub: W.toskaTua, ikonBg: W.toskaTua, gapY: 120 });
  s += kartuKontakTegak(K, { x: 2340, y: 100, w: 560, h: 720, s: 36 });
  return mm(w, h, s);
}

export function papanNama(K) {
  const w = 1200, h = 800;
  let s = rect(0, 0, w, h, W.laut);
  s += A.pola({ w, h, tile: 150, bg: null, swirl: '#104A5B', dot: '#155468' });
  s += text('SELAMAT DATANG  ·  WELCOME', { x: w / 2, y: 112, size: 34, weight: 700, tracking: 0.2, fill: W.pasir, anchor: 'middle' });
  s += L.taruh(L.utama({ varian: 'negative' }), { x: w / 2, y: 160, w: 920, h: 500, anchor: 'middle' }).svg;
  s += text('RAJA AMPAT', { x: w / 2, y: 740, size: 40, weight: 800, tracking: 0.3, fill: W.pasir, anchor: 'middle' });
  return mm(w, h, s);
}

export function papanJemput(K) {
  const w = 420, h = 297;
  let s = rect(0, 0, w, h, W.putih);
  s += rect(0, 0, w, 64, W.laut);
  s += L.taruh(L.horizontal({ ink: W.putih, sub: W.pasir, badge: { bg: W.toska } }), { x: 22, y: 14, h: 36 }).svg;
  s += text('SELAMAT DATANG  ·  WELCOME', { x: w - 22, y: 37, size: 8.5, weight: 700, tracking: 0.16, fill: W.pasir, anchor: 'end' });
  s += text('Tulis nama tamu di sini dengan spidol papan tulis', { x: w / 2, y: 92, size: 7, weight: 500, fill: '#9AB3B8', anchor: 'middle' });
  s += L.taruh(maskot('sapa'), { x: w - 24, y: h - 108, h: 96, anchor: 'end' }).svg;
  s += text(K.instagram, { x: 22, y: h - 16, size: 8, weight: 600, fill: W.laut });
  return mm(w, h, s);
}

// ---------- mockups ----------

function adegan(w, h, { horizon = 0.55, seed = 19 } = {}) {
  let s = A.lanskap({ w, h, horizon, sunX: 0.86, sunY: 0.2, sunR: 56, seed, sky: W.buih,
    susunan: [[0.06, 0.06, 0.1, 0], [0.27, 0.04, 0.06, 0], [0.66, 0.05, 0.08, 0], [0.93, 0.05, 0.09, 0], [0.16, 0.05, 0.1, 1], [0.8, 0.045, 0.09, 1]] });
  return s;
}

function lantaiDermaga(w, y, h) {
  let s = rect(0, y, w, h, '#B98B5A');
  for (let i = 0; i < 8; i++) s += rect(0, y + (i * h) / 8, w, 2, '#A27748');
  return s;
}

export function mockBanner(K) {
  const W2 = 1600, H = 1100;
  let s = adegan(W2, H, { horizon: 0.5 });
  s += lantaiDermaga(W2, 860, 240);
  // roll-up 80x200 cm at 0.38 px per mm
  const k = 0.38;
  const rx = 520, ry = 860 - 2000 * k;
  const ru = bannerBerdiri(K, { lebarMm: 800, tinggiMm: 2000 });
  let g = rect(rx - 6, ry - 6, 800 * k + 12, 8, '#9AA3A7', 4);
  g += sisip(ru, rx, ry, 800 * k, 2000 * k);
  g += rect(rx - 20, 852, 800 * k + 40, 26, '#5D6A70', 8);
  s += bayangan(g, { dy: 6, blur: 8, opacity: 0.25 });
  // X-banner 60x160 cm
  const xb = bannerBerdiri(K, { lebarMm: 600, tinggiMm: 1600 });
  const xx = 960, xy = 860 - 1600 * k - 20;
  let x2 = `<path d="M${xx + 300 * k} ${xy + 800 * k}L${xx - 30} 880M${xx + 300 * k} ${xy + 800 * k}L${xx + 600 * k + 30} 880" stroke="#3A3F42" stroke-width="5"/>`;
  x2 += sisip(xb, xx, xy, 600 * k, 1600 * k);
  x2 += `<path d="M${xx + 300 * k} ${xy + 800 * k}L${xx} ${xy}M${xx + 300 * k} ${xy + 800 * k}L${xx + 600 * k} ${xy}" stroke="#3A3F42" stroke-width="4" opacity="0"/>`;
  s += bayangan(x2, { dy: 6, blur: 8, opacity: 0.25 });
  s += text('Roll-up 80 × 200 cm', { x: rx + 400 * k, y: 1040, size: 26, weight: 600, fill: W.putih, anchor: 'middle' });
  s += text('X-banner 60 × 160 cm', { x: xx + 300 * k, y: 1040, size: 26, weight: 600, fill: W.putih, anchor: 'middle' });
  return doc(W2, H, s);
}

export function mockSpanduk(K) {
  const W2 = 1600, H = 900;
  let s = adegan(W2, H, { horizon: 0.52, seed: 23 });
  s += lantaiDermaga(W2, 760, 140);
  const k = 0.42; // px per mm, spanduk 3000 x 1000
  const x = (W2 - 3000 * k) / 2, y = 250;
  s += rect(x - 30, y - 40, 14, 560, '#7A5A3A') + rect(x + 3000 * k + 16, y - 40, 14, 560, '#7A5A3A');
  s += bayangan(sisip(spanduk(K), x, y, 3000 * k, 1000 * k), { dy: 6, blur: 8, opacity: 0.25 });
  for (const [px, py] of [[x, y + 10], [x, y + 1000 * k - 10], [x + 3000 * k, y + 10], [x + 3000 * k, y + 1000 * k - 10]]) {
    s += `<circle cx="${px + (px === x ? 12 : -12)}" cy="${py}" r="6" fill="#C9CED1" stroke="#7D868A" stroke-width="2"/>`;
    s += `<path d="M${px + (px === x ? 12 : -12)} ${py}L${px === x ? x - 23 : x + 3000 * k + 23} ${py - 6}" stroke="#E8E0CC" stroke-width="3"/>`;
  }
  s += text('Spanduk 300 × 100 cm', { x: W2 / 2, y: 850, size: 26, weight: 600, fill: W.putih, anchor: 'middle' });
  return doc(W2, H, s);
}

export function mockPapanNama(K) {
  const W2 = 1600, H = 1000;
  let s = adegan(W2, H, { horizon: 0.5, seed: 29 });
  s += `<path d="M0 760Q400 700 800 730T1600 720V1000H0Z" fill="#F2E3C1"/>`;
  const k = 0.62;
  const x = (W2 - 1200 * k) / 2, y = 140;
  const tiang = '#6B4A2B';
  s += rect(x + 120, y + 60, 34, 700, tiang, 4) + rect(x + 1200 * k - 154, y + 60, 34, 700, tiang, 4);
  s += bayangan(sisip(papanNama(K), x, y, 1200 * k, 800 * k), { dy: 10, blur: 12, opacity: 0.3 });
  s += text('Papan nama 120 × 80 cm', { x: W2 / 2, y: 960, size: 26, weight: 600, fill: W.laut, anchor: 'middle' });
  return doc(W2, H, s);
}

export function mockJemput(K) {
  const W2 = 1400, H = 900;
  let s = rect(0, 0, W2, H, W.buih);
  const k = 2.2;
  const x = (W2 - 420 * k) / 2, y = 110;
  let p = sisip(papanJemput(K), x, y, 420 * k, 297 * k);
  p += text('Nama Tamu', { x: W2 / 2, y: y + 420, family: 'fredoka', weight: 500, size: 120, fill: '#1F4FA8', anchor: 'middle' });
  s += `<g transform="rotate(-2 ${W2 / 2} ${H / 2})">${bayangan(p)}</g>`;
  return doc(W2, H, s);
}

export default async function ({ out, K }) {
  const cetak = [
    ['roll-up-banner-80x200cm', bannerBerdiri(K, { lebarMm: 800, tinggiMm: 2000 }), 800, 2000],
    ['x-banner-60x160cm', bannerBerdiri(K, { lebarMm: 600, tinggiMm: 1600 }), 600, 1600],
    ['spanduk-300x100cm', spanduk(K), 3000, 1000],
    ['papan-nama-120x80cm', papanNama(K), 1200, 800],
    ['papan-jemput-a3', papanJemput(K), 420, 297],
  ];
  for (const [nama, svg, mmW, mmH] of cetak) {
    simpan(out(`papan-dan-banner/cetak/${nama}.svg`), svg);
    await pdf(svg, out(`papan-dan-banner/cetak/${nama}.pdf`), { mmW, mmH });
    await png(svg, out(`papan-dan-banner/cetak/pratinjau/${nama}.png`), { width: mmW >= mmH ? 2400 : Math.round((2400 * mmW) / mmH) });
  }
  const mock = [
    ['banner-pelabuhan', mockBanner(K)], ['spanduk-pelabuhan', mockSpanduk(K)], ['papan-nama', mockPapanNama(K)], ['papan-jemput', mockJemput(K)],
  ];
  for (const [nama, svg] of mock) await png(svg, out(`papan-dan-banner/mockup/${nama}.png`), { width: 1600 });
}
