// Draws website/public/merek/peta-rute.svg, the sea and land under the route
// map in the Getting here section (website/components/PetaRute.tsx). Routes,
// numbers and place names are drawn on top of it by the page.
//
// Land comes from GSHHG full resolution (Wessel & Smith, LGPL), shifted about
// 1 km north onto OpenStreetMap the same way as the DAMPIER map of Raja Ampat.
// The data is too large to keep in the repo. Fetch it once with
//   pip download basemap-data-hires==2.0.0 --no-deps
//   unzip basemap_data_hires-2.0.0-py3-none-any.whl 'mpl_toolkits/basemap_data/gshhs*_f.dat'
// then run from the repo root
//   node --max-old-space-size=4000 scripts/desain/peta-rute.mjs \
//     mpl_toolkits/basemap_data/gshhsmeta_f.dat mpl_toolkits/basemap_data/gshhs_f.dat
import fs from 'node:fs';
import { BINGKAI as B, LEBAR, TINGGI, titik } from '../../website/lib/peta-rute.mjs';

const [meta, dat, keluar = 'website/public/merek/peta-rute.svg'] = process.argv.slice(2);
if (!meta || !dat) {
  console.error('Pakai: node scripts/desain/peta-rute.mjs gshhsmeta_f.dat gshhs_f.dat [keluaran.svg]');
  process.exit(1);
}

const GESER = [0.003, 0.008];
// land runs a little past the frame so its clipped edge never shows
const TEPI = 0.02;
const K = { w: B.barat - TEPI, e: B.timur + TEPI, n: B.utara + TEPI, s: B.selatan - TEPI };

function bacaGshhs() {
  const buf = fs.readFileSync(dat);
  const hasil = [];
  for (const baris of fs.readFileSync(meta, 'utf8').split('\n')) {
    const p = baris.trim().split(/\s+/);
    if (p.length < 7 || p[0] !== '1') continue; // land only
    const npts = Number(p[2]), selatan = Number(p[3]), utara = Number(p[4]), awal = Number(p[5]);
    if (utara < K.s || selatan > K.n) continue;
    const r = [];
    let w = 1e9, e = -1e9;
    for (let i = 0; i < npts; i++) {
      let x = buf.readFloatLE(awal + i * 8);
      if (x > 180) x -= 360;
      r.push([x + GESER[0], buf.readFloatLE(awal + i * 8 + 4) + GESER[1]]);
      w = Math.min(w, x);
      e = Math.max(e, x);
    }
    if (e >= K.w && w <= K.e) hasil.push(r);
  }
  return hasil;
}

// Sutherland-Hodgman clipping against the frame
function potong(r) {
  const silang = (a, b, i, v) => {
    const t = (v - a[i]) / (b[i] - a[i]);
    return i === 0 ? [v, a[1] + t * (b[1] - a[1])] : [a[0] + t * (b[0] - a[0]), v];
  };
  const sisi = [[(p) => p[0] >= K.w, 0, K.w], [(p) => p[0] <= K.e, 0, K.e], [(p) => p[1] <= K.n, 1, K.n], [(p) => p[1] >= K.s, 1, K.s]];
  let k = r;
  for (const [dalam, i, v] of sisi) {
    const baru = [];
    for (let j = 0; j < k.length; j++) {
      const a = k[j], b = k[(j + 1) % k.length];
      if (dalam(a)) {
        baru.push(a);
        if (!dalam(b)) baru.push(silang(a, b, i, v));
      } else if (dalam(b)) baru.push(silang(a, b, i, v));
    }
    k = baru;
    if (!k.length) break;
  }
  return k;
}

// Chaikin smoothing turns the small steps of GSHHG into curves
function chaikin(r) {
  const baru = [];
  for (let i = 0; i < r.length; i++) {
    const a = r[i], b = r[(i + 1) % r.length];
    baru.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
  }
  return baru;
}

// Douglas-Peucker simplification
function ringkas(t, eps) {
  if (t.length < 3) return t;
  const a = t[0], b = t[t.length - 1];
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-9;
  let maks = 0, idx = 0;
  for (let i = 1; i < t.length - 1; i++) {
    const d = Math.abs(dy * t[i][0] - dx * t[i][1] + b[0] * a[1] - b[1] * a[0]) / L;
    if (d > maks) { maks = d; idx = i; }
  }
  if (maks <= eps) return [a, b];
  return [...ringkas(t.slice(0, idx + 1), eps).slice(0, -1), ...ringkas(t.slice(idx), eps)];
}

const luas = (r) => Math.abs(r.reduce((n, p, i) => { const q = r[(i + 1) % r.length]; return n + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
const didalam = (p, r) => {
  let isi = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    if ((r[i][1] > p[1]) !== (r[j][1] > p[1]) && p[0] < ((r[j][0] - r[i][0]) * (p[1] - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) isi = !isi;
  }
  return isi;
};

const darat = [];
for (const r of bacaGshhs()) {
  const k = potong(r);
  if (k.length < 3) continue;
  let t = k.map(([x, y]) => titik(x, y));
  if (luas(t) < 3) continue; // specks smaller than a few hectares
  t = ringkas(chaikin(chaikin(t)), 0.45);
  if (t.length >= 3) darat.push(t);
}
darat.sort((a, b) => luas(b) - luas(a));
const diDarat = (p) => darat.some((r) => didalam(p, r));
const jauhDariDarat = (p, jarak) => darat.every((r) => r.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > jarak));
const f = (n) => Number(n.toFixed(1));
const jalur = (t) => `M${t.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;

// waves in open water, houses in Waisai and Sorong, trees on Waigeo
const ombak = [[130.93, -0.53], [131.13, -0.6], [130.99, -0.77], [131.24, -0.46], [130.79, -0.65], [131.07, -0.42], [130.55, -0.69], [131.2, -0.72], [130.86, -0.88]]
  .map(([a, b]) => titik(a, b)).filter((p) => jauhDariDarat(p, 22));
const rumah = [[130.806, -0.4245], [130.817, -0.4215], [130.826, -0.425], [131.262, -0.872], [131.274, -0.868], [131.256, -0.864]]
  .map(([a, b]) => titik(a, b)).filter(diDarat);
const pohon = [[130.86, -0.37], [130.875, -0.385], [130.76, -0.36], [130.95, -0.355], [130.74, -0.38], [131.3, -0.82], [131.33, -0.84]]
  .map(([a, b]) => titik(a, b)).filter(diDarat);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LEBAR} ${TINGGI}" width="${LEBAR}" height="${TINGGI}">
<!-- Coastline GSHHG (Wessel & Smith, LGPL), shifted onto OpenStreetMap -->
<rect width="${LEBAR}" height="${TINGGI}" fill="#d3ecf3"/>
<defs><g id="darat">${darat.map((t) => `<path d="${jalur(t)}"/>`).join('')}</g></defs>
<use href="#darat" fill="none" stroke="#e7f6f9" stroke-width="9" stroke-linejoin="round"/>
<use href="#darat" fill="#e3efd1" stroke="#c6dcae" stroke-width="1.4" stroke-linejoin="round"/>
<g fill="#cfe3b6">${pohon.map(([x, y], i) => `<circle cx="${f(x)}" cy="${f(y)}" r="${[7, 5, 6, 8, 5, 7, 6][i % 7]}"/>`).join('')}</g>
<g fill="#fff" stroke="#0b3b4a" stroke-opacity=".55" stroke-width="1.3">${rumah.map(([x, y]) => `<rect x="${f(x - 5)}" y="${f(y - 3.5)}" width="10" height="7" rx="1.5"/>`).join('')}</g>
<g fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="2" stroke-linecap="round">${ombak.map(([x, y]) => `<path d="M${f(x - 16)} ${f(y)}q8 -6 16 0t16 0"/>`).join('')}</g>
</svg>
`;
fs.writeFileSync(keluar, svg);
console.log(keluar, (svg.length / 1024).toFixed(1), 'KB', `${darat.length} pulau, ${ombak.length} ombak, ${rumah.length} rumah, ${pohon.length} pohon`);
