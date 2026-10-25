import * as L from '../lib/logo.mjs';
import { W } from '../lib/palet.mjs';
import { png, pdf, simpan } from '../lib/render.mjs';

// name, drawable, background used only for the preview sheet
export function varian() {
  return [
    ['mambetron-logo-utama-hitam', L.utama(), W.putih],
    ['mambetron-logo-utama-laut', L.utama({ ink: W.laut }), W.buih],
    ['mambetron-logo-utama-putih', L.utama({ varian: 'negative' }), W.laut],
    ['mambetron-logo-utama-stiker', L.utama({ varian: 'sticker' }), W.toska],
    ['mambetron-logo-horizontal', L.horizontal(), W.putih],
    ['mambetron-logo-horizontal-putih', L.horizontal({ ink: W.putih, sub: W.pasir, badge: { bg: W.toska } }), W.laut],
    ['mambetron-ikon', L.lencana(), W.putih],
    ['mambetron-ikon-toska', L.lencana({ bg: W.toska }), W.laut],
    ['mambetron-ikon-stempel-hitam', L.stempel(), W.putih],
    ['mambetron-ikon-stempel-putih', L.stempel({ ink: W.putih }), W.laut],
    ['mambetron-wordmark-hitam', L.wordmark(), W.putih],
    ['mambetron-wordmark-putih', L.wordmark({ ink: W.putih, sub: W.pasir }), W.laut],
  ];
}

export default async function ({ out }) {
  for (const [nama, d] of varian()) {
    const pad = d.box[2] * 0.02;
    const svg = L.svgDoc(d, { pad });
    simpan(out(`logo/svg/${nama}.svg`), svg);
    await png(svg, out(`logo/png/${nama}.png`), { width: 2000 });
    await png(svg, out(`logo/png/kecil/${nama}-500.png`), { width: 500 });
    const mmW = 100;
    const mmH = +((mmW * (d.box[3] + 2 * pad)) / (d.box[2] + 2 * pad)).toFixed(2);
    await pdf(svg, out(`logo/pdf/${nama}.pdf`), { mmW, mmH });
  }
}
