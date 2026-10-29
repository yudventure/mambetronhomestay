// Brand assets for the booking website in website/: logos, sea
// illustrations, placeholder room pictures, favicons and fonts. The site
// shows the Mambetron logo, never the cuscus mascot.
import fs from 'fs';
import path from 'path';
import * as L from '../lib/logo.mjs';
import * as A from '../lib/seni.mjs';
import { adegan as pemandangan } from '../lib/adegan.mjs';
import { W } from '../lib/palet.mjs';
import { doc } from '../lib/tata.mjs';
import { simpan } from '../lib/render.mjs';

export default async function ({ ROOT, out }) {
  const web = (p) => path.join(ROOT, 'website', p);
  const merek = (p) => web(path.join('public/merek', p));

  const logo = [
    ['logo-utama.svg', L.utama()],
    ['logo-putih.svg', L.utama({ varian: 'negative' })],
    ['logo-horizontal.svg', L.horizontal()],
    ['logo-horizontal-putih.svg', L.horizontal({ ink: W.putih, sub: W.putih })],
    ['wordmark.svg', L.wordmark()],
    ['wordmark-putih.svg', L.wordmark({ ink: W.putih, sub: W.putih })],
    ['simbol.svg', L.simbol()],
    ['simbol-putih.svg', L.simbol({ ink: W.putih })],
    ['ikon.svg', L.lencana()],
    ['monogram.svg', L.monogram()],
  ];
  for (const [nama, d] of logo) simpan(merek(nama), L.svgDoc(d, { pad: d.box[2] * 0.01 }));

  // placeholder room pictures until the owner uploads photos
  const adegan = [
    ['kamar-1.svg', { seed: 5, sunX: 0.72, sky: W.buih, sun: '#FFFFFF' }],
    ['kamar-2.svg', { seed: 31, sunX: 0.28, sky: '#BFE8F0', sun: '#FFFFFF' }],
    ['kamar-3.svg', { seed: 47, sunX: 0.6, sky: '#D6F0F4', sun: '#8FDCE8' }],
  ];
  for (const [nama, o] of adegan) simpan(merek(nama), doc(1200, 800, A.lanskap({ w: 1200, h: 800, horizon: 0.62, ...o })));
  // stand-in scenes for the about block (daylight) and the closing banner
  // (morning); the hero uses the homestay photo in website/public/foto
  simpan(merek('adegan-siang.svg'), doc(1600, 1200, pemandangan({ w: 1600, h: 1200, waktu: 'siang', matahariX: 0.3 })));
  simpan(merek('adegan-pagi.svg'), doc(1600, 1100, pemandangan({ w: 1600, h: 1100, waktu: 'pagi', matahariX: 0.3, pondokX: 0.5 })));
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
}
