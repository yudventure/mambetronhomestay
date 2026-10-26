// Homestay amenities: print artwork (mm) and mockups (px).
import * as L from '../lib/logo.mjs';
import * as A from '../lib/seni.mjs';
import { W } from '../lib/palet.mjs';
import { text, paragraph } from '../lib/huruf.mjs';
import { shade } from '../lib/pakaian.mjs';
import { maskot } from '../lib/maskot.mjs';
import { doc, rect, kontak, sisip, potong, bayangan } from '../lib/tata.mjs';
import { png, pdf, simpan } from '../lib/render.mjs';

const mm = (w, h, body) => doc(w, h, body, 'mm');
// embroidery and small prints use the lettering, the drawing is too fine below 30 mm
const satuWarna = (ink) => L.wordmark({ ink });

// ---------- print artwork ----------

export function bordirHanduk(ink = W.laut) {
  const d = satuWarna(ink);
  return L.svgDoc(d, { pad: 4 });
}

export function labelSabun() {
  const w = 200, h = 60;
  let s = A.pola({ w, h, tile: 22, bg: W.laut, swirl: W.biru, dot: W.pasir });
  s += rect(w / 2 - 32, 4, 64, h - 8, W.putih, 4);
  s += L.taruh(L.wordmark(), { x: w / 2, y: 11, w: 44, anchor: 'middle' }).svg;
  s += text('Sabun Mandi', { x: w / 2, y: 42, family: 'judul', weight: 700, size: 7.2, fill: W.laut, anchor: 'middle' });
  s += text('BATH SOAP', { x: w / 2, y: 49.5, size: 3.6, weight: 600, tracking: 0.2, fill: W.biruTua, anchor: 'middle' });
  return mm(w, h, s);
}

export const BOTOL = [
  ['sampo', 'Sampo', 'SHAMPOO', W.biru, W.putih, W.laut],
  ['sabun-cair', 'Sabun Cair', 'BODY WASH', W.senja, W.hitam, W.hitam],
  ['kondisioner', 'Kondisioner', 'CONDITIONER', W.pasir, W.laut, W.laut],
];
export function labelBotol([, nama, en, bg, fg, sub]) {
  const w = 60, h = 80;
  let s = rect(0, 0, w, h, bg);
  s += L.taruh(L.wordmark({ ink: fg, sub: fg }), { x: w / 2, y: 12, w: 44, anchor: 'middle' }).svg;
  s += text(nama, { x: w / 2, y: 42, family: 'judul', weight: 700, size: 9.5, fill: fg, anchor: 'middle', maxWidth: 52 });
  s += text(en, { x: w / 2, y: 49, size: 3.4, weight: 700, tracking: 0.24, fill: fg, anchor: 'middle' });
  s += A.ekor({ x: w / 2 - 8, y: 59, R: 2.6, len: 4.2, color: fg, width: 0.36 });
  s += text('Mambetron Homestay', { x: w / 2, y: 72, size: 3.2, weight: 600, fill: fg, anchor: 'middle', opacity: 0.85 });
  return mm(w, h, s);
}

export function gantunganKunci(sisi = 'depan', nomor = '01') {
  const d = 50;
  const kayu = '#D9A86C', bakar = '#5A3A1E';
  let s = `<circle cx="25" cy="25" r="25" fill="${kayu}"/>`;
  if (sisi === 'depan') s += `<circle cx="25" cy="26.5" r="14.5" fill="none" stroke="${bakar}" stroke-width="1.3"/>` + L.taruh(L.monogram({ bg: null, ink: bakar }), { x: 25, y: 14, w: 25, anchor: 'middle' }).svg;
  else {
    s += text('KAMAR', { x: 25, y: 22, size: 4.2, weight: 700, tracking: 0.28, fill: bakar, anchor: 'middle' });
    s += text(nomor, { x: 25, y: 39, family: 'judul', weight: 700, size: 16, fill: bakar, anchor: 'middle' });
  }
  s += `<circle cx="25" cy="5.5" r="2.4" fill="#FFFFFF"/>`;
  s += potong('M50 25A25 25 0 1 1 0 25A25 25 0 1 1 50 25ZM27.4 5.5A2.4 2.4 0 1 1 22.6 5.5A2.4 2.4 0 1 1 27.4 5.5Z');
  return mm(d, d, s);
}

export function gantunganPintu(sisi = 'depan') {
  const w = 90, h = 230;
  const malam = sisi === 'depan';
  const bg = malam ? W.laut : W.pasir, fg = malam ? W.putih : W.laut, sub = malam ? W.pasir : W.biruTua;
  const hole = 'M45 18A16 16 0 1 1 45 50A16 16 0 1 1 45 18Z';
  const outline = `M6 0H84A6 6 0 0 1 90 6V224A6 6 0 0 1 84 230H6A6 6 0 0 1 0 224V6A6 6 0 0 1 6 0Z`;
  let s = rect(0, 0, w, h, bg, 6);
  if (malam) s += `<circle cx="70" cy="76" r="1.3" fill="${W.pasir}"/><circle cx="18" cy="96" r="1" fill="${W.pasir}"/><circle cx="76" cy="122" r="0.9" fill="${W.pasir}"/>`;
  s += L.taruh(maskot(malam ? 'tidur' : 'sapa', { stiker: malam }), { x: 45, y: 56, h: 60, anchor: 'middle' }).svg;
  s += text(malam ? 'Jangan' : 'Kamar siap', { x: 45, y: 128, family: 'judul', weight: 700, size: 12.5, fill: fg, anchor: 'middle' });
  s += text(malam ? 'diganggu' : 'dibersihkan', { x: 45, y: 142, family: 'judul', weight: 700, size: 12.5, fill: fg, anchor: 'middle' });
  s += text(malam ? 'DO NOT DISTURB' : 'PLEASE CLEAN MY ROOM', { x: 45, y: 154, size: 3.6, weight: 700, tracking: 0.18, fill: sub, anchor: 'middle', maxWidth: 74 });
  s += text(malam ? 'Kuskus juga butuh istirahat' : 'Terima kasih, kami rapikan segera', { x: 45, y: 166, size: 3.6, weight: 500, fill: fg, anchor: 'middle', opacity: 0.9, maxWidth: 76 });
  s += L.taruh(malam ? L.wordmark({ ink: W.putih, sub: W.pasir }) : L.wordmark({ ink: W.laut }), { x: 45, y: 188, w: 46, anchor: 'middle' }).svg;
  s += `<path d="${hole}" fill="#FFFFFF"/><path d="M45 50V64" stroke="#FFFFFF" stroke-width="0.6"/>`;
  s += potong(`${outline}${hole}M45 50V64`);
  return mm(w, h, s);
}

export function kartuSelamatDatang(K) {
  const w = 105, h = 148;
  let s = rect(0, 0, w, h, W.putih);
  s += rect(0, 0, w, 50, W.buih);
  s += `<g transform="translate(0 26)">${A.lanskap({ w, h: 24, horizon: 0.5, sun: null, seed: 3, glint: false })}</g>`;
  s += L.taruh(L.wordmark(), { x: 40, y: 9, w: 44, anchor: 'middle' }).svg;
  s += L.taruh(maskot('sapa', { stiker: true }), { x: 84, y: 13, h: 36, anchor: 'middle' }).svg;
  s += text('Selamat datang', { x: w / 2, y: 62, family: 'judul', weight: 700, size: 9, fill: W.laut, anchor: 'middle' });
  s += text('WELCOME TO MAMBETRON', { x: w / 2, y: 68.5, size: 2.9, weight: 700, tracking: 0.2, fill: W.biruTua, anchor: 'middle' });
  // wifi block
  s += rect(10, 74, 85, 22, W.buih, 3);
  s += A.ikon('wifi', { x: 14, y: 78, size: 8, color: W.laut, stroke: 2 });
  s += text('Nama jaringan', { x: 26, y: 80.5, size: 2.6, weight: 500, fill: W.biruTua });
  s += text(K.wifiNama, { x: 26, y: 84.6, size: 3.4, weight: 700, fill: W.hitam });
  s += text('Kata sandi', { x: 26, y: 89.5, size: 2.6, weight: 500, fill: W.biruTua });
  s += text(K.wifiSandi, { x: 26, y: 93.6, size: 3.4, weight: 700, fill: W.hitam });
  // three gentle requests
  s += text('Bantu kami menjaga pulau ini', { x: 10, y: 104, size: 3.3, weight: 700, fill: W.laut });
  const butir = [['air', 'Hemat air tawar, persediaannya terbatas'], ['sampah', 'Bawa pulang sampah plastik Anda'], ['karang', 'Jangan injak atau sentuh karang']];
  butir.forEach(([ik, t], i) => {
    s += A.ikon(ik, { x: 10, y: 107.5 + i * 7.4, size: 5, color: W.biruTua, stroke: 2 });
    s += text(t, { x: 17.5, y: 111.4 + i * 7.4, size: 2.9, weight: 500, fill: W.hitam });
  });
  s += rect(0, 133, w, 15, W.laut);
  s += kontak([['chat', K.whatsapp]], { x: 10, y: 142.3, size: 3.2, color: W.putih, iconColor: W.pasir });
  s += text(K.instagram, { x: w - 10, y: 142.3, size: 3.2, weight: 600, fill: W.pasir, anchor: 'end' });
  return mm(w, h, s);
}

// ---------- mockups ----------

function handukDatar(x, y, w, h, warna, ink) {
  const band = shade(warna, warna === W.putih ? -0.08 : -0.2);
  let s = rect(x, y, w, h, warna, 10);
  for (let i = 0; i < w; i += 6) s += `<path d="M${x + i} ${y + h - 120}V${y + h - 84}" stroke="${shade(band, -0.08)}" stroke-width="2"/>`;
  s += rect(x, y + h - 120, w, 36, band, 0, ' opacity="0.9"');
  for (let i = 4; i < w; i += 6) s += `<path d="M${x + i} ${y + h - 18}v12M${x + i} ${y + 6}v12" stroke="${shade(warna, -0.1)}" stroke-width="2"/>`;
  s += L.taruh(satuWarna(ink), { x: x + w / 2, y: y + h - 200, w: w * 0.52, anchor: 'middle' }).svg;
  return bayangan(s);
}

export function mockHanduk() {
  let s = rect(0, 0, 1200, 900, W.buih);
  s += handukDatar(140, 90, 420, 720, W.putih, W.laut);
  s += handukDatar(640, 90, 420, 720, W.laut, W.putih);
  return doc(1200, 900, s);
}

export function mockSabun() {
  let s = rect(0, 0, 1200, 900, W.buih);
  const sabun = (x, y, rot) => {
    const bw = 640, bh = 400;
    let b = rect(-bw / 2, -bh / 2, bw, bh, '#F3EEDF', 100);
    b += `<g clip-path="url(#sabunklip)">${sisip(labelSabun(), -bw * 1.0, -96, bw * 2, 192)}</g>`;
    b = `<defs><clipPath id="sabunklip"><rect x="${-bw / 2}" y="${-bh / 2}" width="${bw}" height="${bh}" rx="100"/></clipPath></defs>` + b;
    return `<g transform="translate(${x} ${y}) rotate(${rot})">${bayangan(b)}</g>`;
  };
  s += sabun(600, 470, -6);
  return doc(1200, 900, s);
}

export function mockBotol() {
  let s = rect(0, 0, 1200, 900, W.buih);
  BOTOL.forEach((b, i) => {
    const cx = 300 + i * 300;
    const amber = '#8A4B1F';
    let g = `<rect x="${cx - 18}" y="150" width="36" height="70" rx="6" fill="#1E1E1E"/><path d="M${cx - 10} 170h-60v14h60Z" fill="#1E1E1E"/>`;
    g += `<rect x="${cx - 30}" y="215" width="60" height="40" rx="8" fill="#2A2A2A"/>`;
    g += `<path d="M${cx - 34} 255H${cx + 34}Q${cx + 110} 275 ${cx + 110} 330V760Q${cx + 110} 790 ${cx + 80} 790H${cx - 80}Q${cx - 110} 790 ${cx - 110} 760V330Q${cx - 110} 275 ${cx - 34} 255Z" fill="${amber}"/>`;
    g += `<path d="M${cx - 88} 340V740" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="10" stroke-linecap="round"/>`;
    g += sisip(labelBotol(b), cx - 90, 400, 180);
    s += bayangan(g);
  });
  return doc(1200, 900, s);
}

export function mockKunci() {
  let s = rect(0, 0, 1200, 900, W.buih);
  const tag = (cx, sisi, rot) => {
    const g = sisip(gantunganKunci(sisi), -150, -150, 300);
    const ring = `<circle cx="0" cy="-178" r="44" fill="none" stroke="#A7AFB3" stroke-width="9"/>`;
    const kunci = sisi === 'depan' ? `<g transform="translate(0 -230) rotate(-35)"><rect x="-8" y="-150" width="16" height="120" rx="4" fill="#B9A06A"/><circle cx="0" cy="-170" r="34" fill="none" stroke="#B9A06A" stroke-width="14"/><path d="M8 -60h16v10h-16zM8 -80h22v10h-22z" fill="#B9A06A"/></g>` : '';
    return `<g transform="translate(${cx} 520) rotate(${rot})">${bayangan(kunci + ring + g.replace(/<g id="garis-potong">.*?<\/g>/, ''))}</g>`;
  };
  s += tag(380, 'depan', -8) + tag(820, 'belakang', 6);
  return doc(1200, 900, s);
}

export function mockPintu() {
  let s = rect(0, 0, 1200, 900, W.buih);
  const strip = (svg) => svg.replace(/<g id="garis-potong">.*?<\/g>/, '');
  s += `<g transform="translate(250 70) rotate(-3)">${bayangan(sisip(strip(gantunganPintu('depan')), 0, 0, 300))}</g>`;
  s += `<g transform="translate(660 80) rotate(3)">${bayangan(sisip(strip(gantunganPintu('belakang')), 0, 0, 300))}</g>`;
  return doc(1200, 900, s);
}

export function mockKartu(K) {
  let s = rect(0, 0, 1200, 900, W.buih);
  s += `<g transform="translate(370 40) rotate(-2)">${bayangan(sisip(kartuSelamatDatang(K), 0, 0, 460))}</g>`;
  return doc(1200, 900, s);
}

export function mockSandal() {
  let s = rect(0, 0, 1200, 900, W.buih);
  const sol = 'M0 -300C70 -300 112 -250 112 -170C112 -90 92 -30 92 40C92 120 120 180 110 240C100 300 60 330 0 330C-60 330 -100 300 -110 240C-120 180 -92 120 -92 40C-92 -30 -112 -90 -112 -170C-112 -250 -70 -300 0 -300Z';
  const satu = (cx, flip) => {
    let g = `<path d="${sol}" fill="#2B2B2B" transform="translate(0 8)"/><path d="${sol}" fill="${W.putih}"/>`;
    g += L.taruh(L.monogram(), { x: 0, y: 150, w: 92, anchor: 'middle' }).svg;
    g += `<path d="M-118 -110Q0 -40 118 -110L112 -40Q0 10 -112 -40Z" fill="${W.biru}"/>`;
    return `<g transform="translate(${cx} 460) scale(${flip} 1) rotate(${flip * -4})">${bayangan(g)}</g>`;
  };
  s += satu(470, 1) + satu(730, -1);
  return doc(1200, 900, s);
}

export default async function ({ out, K }) {
  const cetak = [
    ['bordir-handuk-laut', bordirHanduk(W.laut), 160],
    ['bordir-handuk-putih', bordirHanduk(W.putih), 160],
    ['label-sabun-200x60mm', labelSabun()],
    ...BOTOL.map((b) => [`label-botol-${b[0]}-60x80mm`, labelBotol(b)]),
    ['gantungan-kunci-depan-50mm', gantunganKunci('depan')],
    ['gantungan-kunci-belakang-50mm', gantunganKunci('belakang')],
    ['gantungan-pintu-depan-90x230mm', gantunganPintu('depan')],
    ['gantungan-pintu-belakang-90x230mm', gantunganPintu('belakang')],
    ['kartu-selamat-datang-a6', kartuSelamatDatang(K)],
  ];
  for (const [nama, svg0, lebar] of cetak) {
    let svg = svg0;
    const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    let mmW = vb[2], mmH = vb[3];
    if (lebar) { mmW = lebar; mmH = +((lebar * vb[3]) / vb[2]).toFixed(2); svg = svg.replace(/width="[^"]+" height="[^"]+"/, `width="${mmW}mm" height="${mmH}mm"`); }
    simpan(out(`amenities/cetak/${nama}.svg`), svg);
    await pdf(svg, out(`amenities/cetak/${nama}.pdf`), { mmW, mmH });
  }
  const mock = [
    ['handuk', mockHanduk()], ['sabun', mockSabun()], ['botol', mockBotol()], ['gantungan-kunci', mockKunci()],
    ['gantungan-pintu', mockPintu()], ['kartu-selamat-datang', mockKartu(K)], ['sandal', mockSandal()],
  ];
  for (const [nama, svg] of mock) await png(svg, out(`amenities/mockup/${nama}.png`), { width: 1200 });
}
