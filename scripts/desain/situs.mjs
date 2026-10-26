// Brand assets for the booking website in website/: logos, mascot, sea
// illustrations, placeholder room pictures, favicons and fonts.
import fs from 'fs';
import path from 'path';
import * as L from '../lib/logo.mjs';
import * as A from '../lib/seni.mjs';
import { maskot, wajah, POSE, EKSPRESI } from '../lib/maskot.mjs';
import { W } from '../lib/palet.mjs';
import { doc } from '../lib/tata.mjs';
import { png, simpan } from '../lib/render.mjs';

export default async function ({ ROOT, out }) {
  const web = (p) => path.join(ROOT, 'website', p);
  const merek = (p) => web(path.join('public/merek', p));

  const logo = [
    ['logo-utama.svg', L.utama()],
    ['logo-putih.svg', L.utama({ varian: 'negative' })],
    ['logo-horizontal.svg', L.horizontal()],
    ['logo-horizontal-putih.svg', L.horizontal({ ink: W.putih, sub: W.pasir })],
    ['wordmark.svg', L.wordmark()],
    ['wordmark-putih.svg', L.wordmark({ ink: W.putih, sub: W.pasir })],
    ['simbol.svg', L.simbol()],
    ['simbol-putih.svg', L.simbol({ ink: W.putih })],
    ['ikon.svg', L.lencana()],
    ['monogram.svg', L.monogram()],
  ];
  for (const [nama, d] of logo) simpan(merek(nama), L.svgDoc(d, { pad: d.box[2] * 0.01 }));

  for (const k of Object.keys(POSE)) {
    simpan(merek(`mambe-${k}.svg`), L.svgDoc(maskot(k), { pad: 4 }));
    simpan(merek(`mambe-${k}-stiker.svg`), L.svgDoc(maskot(k, { stiker: true }), { pad: 14 }));
  }
  for (const k of Object.keys(EKSPRESI)) simpan(merek(`wajah-${k}.svg`), L.svgDoc(wajah(k, { stiker: true }), { pad: 14 }));

  // placeholder room pictures until the owner uploads photos
  const adegan = [
    ['kamar-1.svg', { seed: 5, sunX: 0.72, sky: W.buih }],
    ['kamar-2.svg', { seed: 31, sunX: 0.28, sky: '#FDF0D2', sun: W.senja }],
    ['kamar-3.svg', { seed: 47, sunX: 0.6, sky: '#DDF1EE' }],
  ];
  for (const [nama, o] of adegan) simpan(merek(nama), doc(1200, 800, A.lanskap({ w: 1200, h: 800, horizon: 0.62, ...o })));
  simpan(merek('pola.svg'), doc(600, 600, A.pola({ w: 600, h: 600, tile: 150, bg: W.laut, swirl: '#13566A', dot: '#1D6A7E' })));

  // social share image and app icons come from the brand web kit
  fs.mkdirSync(web('app'), { recursive: true });
  fs.copyFileSync(out('web/og-image.png'), merek('og.png'));
  fs.copyFileSync(out('web/favicon.ico'), web('app/favicon.ico'));
  fs.copyFileSync(out('web/favicon.svg'), web('app/icon.svg'));
  fs.copyFileSync(out('web/apple-touch-icon.png'), web('app/apple-icon.png'));
  fs.copyFileSync(out('web/icon-192.png'), merek('icon-192.png'));
  fs.copyFileSync(out('web/icon-512.png'), merek('icon-512.png'));

  fs.mkdirSync(web('app/fonts'), { recursive: true });
  for (const f of ['londrina-solid-400-latin.woff2', 'londrina-solid-900-latin.woff2', 'plus-jakarta-sans-latin.woff2', 'plus-jakarta-sans-italic-latin.woff2']) {
    fs.copyFileSync(out(`font/web/${f}`), web(`app/fonts/${f}`));
  }
  fs.copyFileSync(out('font/OFL-LondrinaSolid.txt'), web('app/fonts/OFL-LondrinaSolid.txt'));
  fs.copyFileSync(out('font/OFL-PlusJakartaSans.txt'), web('app/fonts/OFL-PlusJakartaSans.txt'));

  // small raster mascot for e-mail and chat previews
  await png(L.svgDoc(maskot('sapa', { stiker: true }), { pad: 14 }), merek('mambe-sapa.png'), { width: 600 });
}
