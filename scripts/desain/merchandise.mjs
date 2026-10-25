// T-shirts and jacket: print-ready artwork at real size (mm) and flat mockups.
import * as L from '../lib/logo.mjs';
import { emblem } from '../lib/emblem.mjs';
import { W } from '../lib/palet.mjs';
import { text } from '../lib/huruf.mjs';
import { kaos, jaket } from '../lib/pakaian.mjs';
import { doc, rect } from '../lib/tata.mjs';
import { png, pdf, simpan } from '../lib/render.mjs';

// print artwork: name, drawable, width in mm, note
export function cetakan() {
  return [
    ['kaos-dada-lencana-warna', L.lencana(), 90],
    ['kaos-dada-stempel-hitam', L.stempel(), 90],
    ['kaos-dada-stempel-putih', L.stempel({ ink: W.putih }), 90],
    ['kaos-punggung-logo-hitam', L.utama(), 280],
    ['kaos-punggung-logo-putih', L.utama({ varian: 'negative' }), 280],
    ['kaos-suvenir-emblem', emblem(), 250],
    ['jaket-bordir-dada-putih', L.stempel({ ink: W.putih, ringWidth: 0.07 }), 80],
    ['jaket-punggung-logo-putih', L.utama({ varian: 'negative' }), 260],
    ['jaket-lengan-wordmark-putih', L.wordmark({ ink: W.putih, homestay: false }), 90],
  ];
}

const label = (str, x, y) => text(str, { x, y, size: 26, weight: 600, fill: W.laut, anchor: 'middle', tracking: 0.04 });

function pasang(d, { cx, y, w }) {
  return L.taruh(d, { x: cx, y, w, anchor: 'middle' }).svg;
}

export function mockupKaos({ warna, dada, punggung, judul }) {
  const W2 = 1800, H = 960;
  let s = rect(0, 0, W2, H, W.buih);
  const depan = kaos({ warna, sisi: 'depan' }) + (dada ? pasang(dada, { cx: 122, y: 160, w: 90 }) : '');
  const belakang = kaos({ warna, sisi: 'belakang' }) + (punggung ? pasang(punggung, { cx: 0, y: 120, w: 280 }) : '');
  s += `<g transform="translate(470 120) scale(1)">${depan}</g>`;
  s += `<g transform="translate(1330 120) scale(1)">${belakang}</g>`;
  s += label('Depan', 470, 910) + label('Belakang', 1330, 910);
  return doc(W2, H, s);
}

export function mockupSuvenir() {
  const W2 = 1800, H = 960;
  let s = rect(0, 0, W2, H, W.buih);
  for (const [cx, warna] of [[470, W.putih], [1330, W.hitam]]) {
    s += `<g transform="translate(${cx} 120)">${kaos({ warna, sisi: 'depan' })}${pasang(emblem(), { cx: 0, y: 175, w: 250 })}</g>`;
  }
  s += label('Kaos putih', 470, 910) + label('Kaos hitam', 1330, 910);
  return doc(W2, H, s);
}

export function mockupJaket() {
  const W2 = 1800, H = 960;
  let s = rect(0, 0, W2, H, W.buih);
  const warna = W.laut, rib = W.hitam;
  s += `<g transform="translate(470 140)">${jaket({ warna, rib, sisi: 'depan' })}${pasang(L.stempel({ ink: W.putih, ringWidth: 0.07 }), { cx: 128, y: 150, w: 80 })}</g>`;
  s += `<g transform="translate(1330 140)">${jaket({ warna, rib, sisi: 'belakang' })}${pasang(L.utama({ varian: 'negative' }), { cx: 0, y: 120, w: 260 })}</g>`;
  s += label('Depan', 470, 910) + label('Belakang', 1330, 910);
  return doc(W2, H, s);
}

export default async function ({ out }) {
  for (const [nama, d, mm] of cetakan()) {
    const svgPx = L.svgDoc(d);
    const mmH = +((mm * d.box[3]) / d.box[2]).toFixed(2);
    const svgMm = svgPx.replace(/width="[^"]+" height="[^"]+"/, `width="${mm}mm" height="${mmH}mm"`);
    simpan(out(`merchandise/cetak/${nama}-${mm / 10}cm.svg`), svgMm);
    await pdf(svgMm, out(`merchandise/cetak/${nama}-${mm / 10}cm.pdf`), { mmW: mm, mmH });
    await png(svgPx, out(`merchandise/cetak/${nama}-${mm / 10}cm-300dpi.png`), { width: Math.round((mm / 25.4) * 300) });
  }
  const mock = [
    ['kaos-seragam-putih', mockupKaos({ warna: W.putih, dada: L.lencana(), punggung: L.utama() })],
    ['kaos-seragam-laut', mockupKaos({ warna: W.laut, dada: L.stempel({ ink: W.putih }), punggung: L.utama({ varian: 'negative' }) })],
    ['kaos-suvenir', mockupSuvenir()],
    ['jaket', mockupJaket()],
  ];
  for (const [nama, svg] of mock) await png(svg, out(`merchandise/mockup/${nama}.png`), { width: 1800 });
}
