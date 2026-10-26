// Social media kit (Instagram, Facebook, WhatsApp). Sizes in pixels.
import * as L from '../lib/logo.mjs';
import * as A from '../lib/seni.mjs';
import { W } from '../lib/palet.mjs';
import { text, paragraph } from '../lib/huruf.mjs';
import { doc, rect, tombol, kontak, foto, bintang, klip } from '../lib/tata.mjs';
import { png, simpan } from '../lib/render.mjs';
import { maskot, wajah } from '../lib/maskot.mjs';

export function profil(bg = W.pasir) {
  const s = 1080;
  const ink = bg === W.biru || bg === W.laut ? W.putih : W.biru;
  return doc(s, s, rect(0, 0, s, s, bg) + L.taruh(L.lencana({ bg, ink, ring: bg, ringWidth: 0.04 }), { x: 0, y: 0, w: s }).svg);
}

export function postInfo(K) {
  const w = 1080, h = 1350;
  let s = rect(0, 0, w, h, W.buih);
  s += `<g transform="translate(0 ${h - 470})">${A.lanskap({ w, h: 470, horizon: 0.42, sunX: 0.82, seed: 21 })}</g>`;
  s += L.taruh(L.horizontal(), { x: 80, y: 80, h: 84 }).svg;
  s += text('KAMAR TEPI LAUT', { x: 80, y: 290, size: 26, weight: 600, tracking: 0.22, fill: W.biruTua });
  s += text('Liburan pelan', { x: 76, y: 395, family: 'judul', weight: 700, size: 104, fill: W.laut });
  s += text('di Raja Ampat', { x: 76, y: 505, family: 'judul', weight: 700, size: 104, fill: W.laut });
  s += paragraph('Tidur ditemani suara ombak, makan masakan rumah tiga kali sehari, lalu snorkeling di karang depan homestay.', { x: 80, y: 590, width: 860, size: 34, weight: 500, lineHeight: 1.45, fill: W.hitam }).svg;
  const t = tombol('Tanya kamar lewat WhatsApp', { x: 80, y: 760, size: 32 });
  s += t.svg;
  return doc(w, h, s);
}

export function postFoto(K) {
  const w = 1080, h = 1350;
  let s = foto('utama', { x: 0, y: 0, w, h: h - 230, seed: 8, horizon: 0.6 });
  s += rect(0, h - 230, w, 230, W.laut);
  s += L.taruh(L.horizontal({ ink: W.putih, sub: W.pasir }), { x: 70, y: h - 230 + 66, h: 98 }).svg;
  s += text(K.instagram, { x: w - 70, y: h - 230 + 108, size: 30, weight: 600, fill: W.putih, anchor: 'end' });
  s += text(K.lokasi.split(',')[0], { x: w - 70, y: h - 230 + 152, size: 26, weight: 500, fill: W.pasir, anchor: 'end' });
  return doc(w, h, s);
}

export function postUlasan(K) {
  const w = 1080, h = 1350;
  let s = A.pola({ w, h, tile: 180, bg: W.laut, swirl: '#13566A', dot: '#1D6A7E' });
  s += rect(90, 210, 900, 860, W.putih, 48);
  s += L.taruh(L.lencana({ bg: W.pasir }), { x: w / 2, y: 90, w: 230, anchor: 'middle' }).svg;
  s += bintang(5, { x: w / 2 - 158, y: 360, size: 52 });
  s += text('KATA TAMU KAMI', { x: w / 2, y: 480, size: 26, weight: 600, tracking: 0.22, fill: W.biruTua, anchor: 'middle' });
  const q = paragraph('Tulis kutipan ulasan tamu di sini. Cukup dua atau tiga baris yang paling berkesan.', { x: 170, y: 580, width: 740, size: 50, family: 'judul', weight: 500, lineHeight: 1.3, fill: W.laut });
  s += q.svg;
  s += text('Nama Tamu', { x: 170, y: 580 + q.height + 70, size: 34, weight: 700, fill: W.hitam });
  s += text('Asal negara atau kota', { x: 170, y: 580 + q.height + 118, size: 28, weight: 500, fill: W.biruTua });
  s += text(K.instagram, { x: w / 2, y: h - 120, size: 30, weight: 600, fill: W.pasir, anchor: 'middle' });
  return doc(w, h, s);
}

export function story(K) {
  const w = 1080, h = 1920;
  let s = foto('story', { x: 0, y: 0, w, h: 1150, seed: 31, horizon: 0.6, sunX: 0.3 });
  s += L.taruh(L.utama({ varian: 'sticker' }), { x: w / 2, y: 150, w: 460, anchor: 'middle' }).svg;
  s += rect(0, 1110, w, h - 1110, W.laut);
  s += A.ombak({ y: 1110, w, depth: 60, amp: 14, len: 180, fill: W.laut });
  s += text('MASIH ADA KAMAR?', { x: 90, y: 1290, size: 30, weight: 600, tracking: 0.22, fill: W.pasir });
  s += text('Kabari tanggal', { x: 86, y: 1400, family: 'judul', weight: 700, size: 100, fill: W.putih });
  s += text('kedatangan Anda', { x: 86, y: 1510, family: 'judul', weight: 700, size: 100, fill: W.putih });
  s += kontak([['chat', K.whatsapp], ['kamera', K.instagram]], { x: 90, y: 1640, size: 36, color: W.putih, iconColor: W.biru });
  return doc(w, h, s);
}

export function postTips(K) {
  const w = 1080, h = 1350;
  let s = rect(0, 0, w, h, W.pasir);
  s += `<g transform="translate(0 ${h - 420})">${A.lanskap({ w, h: 420, horizon: 0.5, sun: null, seed: 33, sky: W.pasir, far: W.biru, near: W.laut })}</g>`;
  s += L.taruh(L.horizontal(), { x: 80, y: 80, h: 84 }).svg;
  s += text('TIPS DARI MAMBE', { x: 80, y: 290, size: 26, weight: 600, tracking: 0.22, fill: W.biruTua });
  s += text('Snorkeling yang', { x: 76, y: 390, family: 'judul', weight: 700, size: 92, fill: W.laut });
  s += text('ramah karang', { x: 76, y: 490, family: 'judul', weight: 700, size: 92, fill: W.laut });
  const tips = [['karang', 'Jangan injak atau pegang karang'], ['bintang', 'Pakai tabir surya yang aman untuk laut'], ['sampah', 'Bawa pulang sampah plastik Anda']];
  tips.forEach(([ik, t], i) => {
    const y = 560 + i * 92;
    s += `<circle cx="${112}" cy="${y + 28}" r="32" fill="${W.laut}"/>` + A.ikon(ik, { x: 92, y: y + 8, size: 40, color: W.putih, stroke: 1.9 });
    s += text(t, { x: 170, y: y + 40, size: 34, weight: 600, fill: W.hitam, maxWidth: 560 });
  });
  s += L.taruh(maskot('snorkel'), { x: w - 60, y: h - 560, h: 540, anchor: 'end' }).svg;
  return doc(w, h, s);
}

export function storyMaskot(K) {
  const w = 1080, h = 1920;
  let s = A.pola({ w, h, tile: 200, bg: W.laut, swirl: '#13566A', dot: '#1D6A7E' });
  s += L.taruh(L.horizontal({ ink: W.putih, sub: W.pasir }), { x: w / 2, y: 120, h: 90, anchor: 'middle' }).svg;
  s += text('SELAMAT PAGI DARI RAJA AMPAT', { x: w / 2, y: 330, size: 30, weight: 600, tracking: 0.22, fill: W.pasir, anchor: 'middle' });
  s += text('Kopi dulu,', { x: w / 2, y: 450, family: 'judul', weight: 700, size: 110, fill: W.putih, anchor: 'middle' });
  s += text('laut kemudian', { x: w / 2, y: 570, family: 'judul', weight: 700, size: 110, fill: W.putih, anchor: 'middle' });
  s += L.taruh(maskot('santai', { stiker: true }), { x: w / 2, y: 700, h: 900, anchor: 'middle' }).svg;
  s += text(K.instagram, { x: w / 2, y: 1760, size: 32, weight: 600, fill: W.pasir, anchor: 'middle' });
  return doc(w, h, s);
}

export const SOROTAN = [
  ['kamar', 'Kamar'], ['makan', 'Makan'], ['snorkel', 'Snorkel'], ['perahu', 'Jemput'], ['lokasi', 'Lokasi'], ['bintang', 'Ulasan'],
];
export function sorotan(nama) {
  const w = 1080, h = 1920;
  return doc(w, h, rect(0, 0, w, h, W.laut) + `<circle cx="${w / 2}" cy="${h / 2}" r="380" fill="${W.biru}"/>` + A.ikon(nama, { x: w / 2 - 210, y: h / 2 - 210, size: 420, color: W.putih, stroke: 1.6 }));
}

export function sampulFb(K) {
  const w = 1640, h = 624;
  let s = foto('sampul', { x: 0, y: 0, w, h, seed: 41, horizon: 0.74, sun: null,
    susunan: [[0.05, 0.08, 0.2, 0], [0.13, 0.05, 0.12, 0], [0.62, 0.05, 0.08, 0], [0.74, 0.04, 0.06, 0], [0.97, 0.09, 0.22, 0], [0.1, 0.09, 0.26, 1], [0.92, 0.07, 0.18, 1]] });
  s += L.taruh(L.utama({ varian: 'sticker' }), { x: 170, y: 70, w: 680, h: 420 }).svg;
  s += text('Pelukan hangat', { x: 900, y: 205, family: 'judul', weight: 700, size: 76, fill: W.laut });
  s += text('dari Raja Ampat', { x: 900, y: 290, family: 'judul', weight: 700, size: 76, fill: W.laut });
  s += text(K.instagram, { x: 904, y: 350, size: 30, weight: 600, fill: W.hitam });
  return doc(w, h, s);
}

export function semua(K) {
  return [
    ['foto-profil-pasir', profil(W.pasir)],
    ['foto-profil-biru', profil(W.biru)],
    ['post-info', postInfo(K)],
    ['post-foto', postFoto(K)],
    ['post-ulasan', postUlasan(K)],
    ['story', story(K)],
    ['post-tips-maskot', postTips(K)],
    ['story-maskot', storyMaskot(K)],
    ['sampul-facebook', sampulFb(K)],
    ...SOROTAN.map(([k, label]) => [`sorotan/sorotan-${label.toLowerCase()}`, sorotan(k)]),
  ];
}

export default async function ({ out, K }) {
  for (const [nama, svg] of semua(K)) {
    simpan(out(`sosial-media/svg/${nama}.svg`), svg);
    await png(svg, out(`sosial-media/${nama}.png`));
  }
}
