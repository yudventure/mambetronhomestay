// Website kit: favicons, app icons, share image, fonts.css, tokens.css.
import fs from 'fs';
import { execFileSync } from 'child_process';
import * as L from '../lib/logo.mjs';
import * as A from '../lib/seni.mjs';
import { W, PALET } from '../lib/palet.mjs';
import { text, paragraph } from '../lib/huruf.mjs';
import { png, simpan } from '../lib/render.mjs';

const doc = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;

export function ogImage(K) {
  const w = 1200, h = 630;
  let s = `<rect width="${w}" height="${h}" fill="${W.buih}"/>`;
  s += `<g transform="translate(0 ${h * 0.6})">${A.lanskap({ w, h: h * 0.4, horizon: 0.62, sunX: 0.9, seed: 4, sky: W.buih })}</g>`;
  s += L.taruh(L.utama(), { x: 70, y: 40, w: 420, h: 330 }).svg;
  s += text('Pelukan hangat', { x: 560, y: 150, family: 'judul', weight: 900, size: 76, fill: W.laut });
  s += text('dari Raja Ampat', { x: 560, y: 232, family: 'judul', weight: 900, size: 76, fill: W.laut });
  s += text(`Homestay di ${K.lokasi}`, { x: 562, y: 290, family: 'jakarta', weight: 500, size: 26, fill: W.hitam });
  s += `<rect x="560" y="318" width="${330}" height="58" rx="29" fill="${W.senja}"/>`;
  s += text('Pesan lewat WhatsApp', { x: 560 + 165, y: 355, family: 'jakarta', weight: 700, size: 22, fill: W.hitam, anchor: 'middle' });
  return doc(w, h, s);
}

const FONTS_CSS = (ranges) => `/* Font website Mambetron Homestay.
   Londrina Solid untuk judul, senada dengan huruf MAMBETRON di logo yang tinggi, tebal, dan bergaya potongan tangan.
   Plus Jakarta Sans untuk teks, menu, dan label, senada dengan tulisan HOMESTAY.
   Keduanya berlisensi SIL Open Font License 1.1, bebas dipakai dan di-host sendiri. */
${[400, 900].map((wt) => `
@font-face {
  font-family: 'Londrina Solid';
  font-style: normal;
  font-weight: ${wt};
  font-display: swap;
  src: url('./londrina-solid-${wt}-latin.woff2') format('woff2');
  unicode-range: ${ranges.latin};
}`).join('\n')}
${['normal', 'italic'].flatMap((style) => ['latin-ext', 'latin'].map((sub) => `
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: ${style};
  font-weight: 200 800;
  font-display: swap;
  src: url('./plus-jakarta-sans${style === 'italic' ? '-italic' : ''}-${sub}.woff2') format('woff2');
  unicode-range: ${ranges[sub]};
}`)).join('\n')}
`;

const TOKENS_CSS = () => `/* Token desain Mambetron Homestay. Pakai bersama ../font/web/fonts.css */
:root {
${PALET.map((p) => `  --mb-${p.kunci}: ${p.hex}; /* ${p.nama} */`).join('\n')}
  --mb-biru-tua: ${W.biruTua}; /* biru untuk teks dan tautan di latar putih */
  --mb-putih: #ffffff;

  --mb-font-judul: 'Londrina Solid', 'Arial Narrow', 'Trebuchet MS', system-ui, sans-serif;
  --mb-font-teks: 'Plus Jakarta Sans', 'Segoe UI', system-ui, -apple-system, sans-serif;

  /* skala huruf, lentur antara layar ponsel dan desktop */
  --mb-teks-kecil: 0.875rem;
  --mb-teks: 1.0625rem;
  --mb-teks-besar: clamp(1.125rem, 1rem + 0.4vw, 1.25rem);
  --mb-judul-4: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
  --mb-judul-3: clamp(1.5rem, 1.25rem + 1vw, 2rem);
  --mb-judul-2: clamp(2rem, 1.5rem + 2vw, 2.75rem);
  --mb-judul-1: clamp(2.5rem, 1.75rem + 3.5vw, 4.25rem);

  --mb-radius: 18px;
  --mb-radius-tombol: 999px;
  --mb-bayangan: 0 10px 30px rgba(11, 59, 74, 0.12);
}

body {
  font-family: var(--mb-font-teks);
  font-size: var(--mb-teks);
  line-height: 1.65;
  color: var(--mb-hitam);
  background: var(--mb-putih);
}

h1, h2, h3, h4, .mb-judul {
  font-family: var(--mb-font-judul);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: 0.005em;
  color: var(--mb-laut);
}
h1 { font-size: var(--mb-judul-1); }
h2 { font-size: var(--mb-judul-2); }
h3 { font-size: var(--mb-judul-3); }
h4 { font-size: var(--mb-judul-4); }

/* label kecil berhuruf kapital, senada dengan tulisan HOMESTAY di logo */
.mb-label {
  font-family: var(--mb-font-teks);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--mb-biru-tua);
}

a { color: var(--mb-biru-tua); text-underline-offset: 0.18em; }

.mb-tombol {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.85em 1.6em;
  border-radius: var(--mb-radius-tombol);
  background: var(--mb-senja);
  color: var(--mb-hitam);
  font-family: var(--mb-font-teks);
  font-weight: 700;
  text-decoration: none;
}
.mb-tombol:hover { background: #f58f5c; }
.mb-tombol--laut { background: var(--mb-laut); color: var(--mb-putih); }
`;

const MANIFEST = (K) => JSON.stringify({
  name: K.nama,
  short_name: 'Mambetron',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  theme_color: W.laut,
  background_color: W.putih,
  display: 'standalone',
}, null, 2);

export default async function ({ out, K, ROOT }) {
  const fav = L.monogram({ sudut: 0.24, isi: 0.62 });
  const favSvg = L.svgDoc(fav);
  simpan(out('web/favicon.svg'), favSvg);
  for (const s of [16, 32, 48]) await png(favSvg, out(`build-tmp/fav-${s}.png`), { width: s });
  execFileSync('convert', [16, 32, 48].map((s) => out(`build-tmp/fav-${s}.png`)).concat(out('web/favicon.ico')));
  fs.rmSync(out('build-tmp'), { recursive: true, force: true });

  const sq = L.svgDoc(L.monogram({ sudut: 0, isi: 0.5 }));
  await png(sq, out('web/apple-touch-icon.png'), { width: 180 });
  await png(sq, out('web/icon-192.png'), { width: 192 });
  await png(sq, out('web/icon-512.png'), { width: 512 });
  await png(L.svgDoc(L.monogram({ sudut: 0, isi: 0.4 })), out('web/icon-maskable-512.png'), { width: 512 });
  simpan(out('web/site.webmanifest'), MANIFEST(K));

  const og = ogImage(K);
  simpan(out('web/og-image.svg'), og);
  await png(og, out('web/og-image.png'), { width: 1200 });

  simpan(out('web/logo-header.svg'), L.svgDoc(L.horizontal()));
  simpan(out('web/logo-header-putih.svg'), L.svgDoc(L.horizontal({ ink: W.putih, sub: W.pasir })));

  // fonts.css from the subsets downloaded off Google Fonts
  const ranges = {
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
  };
  simpan(out('font/web/fonts.css'), FONTS_CSS(ranges));
  simpan(out('web/tokens.css'), TOKENS_CSS());
}
