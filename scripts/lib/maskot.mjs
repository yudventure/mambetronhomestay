// Mambe, the kuskus mascot, drawn after the Waigeo spotted cuscus
// (Spilocuscus papuensis) of Raja Ampat: cream fur with dark patches, tiny
// ears hidden in the fur, large round eyes with an amber rim, pink nose,
// pink long-fingered hands that grip, and a long tail that curls with a
// bare pink tip. Flat vector on a 400 × 440 box, feet on the ground at
// y 420, face centred at x 200.
//
// Parts of the same colour are drawn as one group: every outline first,
// every fill after, so overlapping parts (body and arms, head and ears)
// read as one shape with a single clean outline. Stickers get their white
// rim from the outer silhouettes only, never from details inside.
import { W } from './palet.mjs';
import { text } from './huruf.mjs';

const f = (n) => +n.toFixed(2);
export const P = {
  bulu: '#F3EDDF', perut: '#FBF7EE', garis: '#B9AC98', bercak: '#2B2522',
  mata: W.hitam, lingkar: W.senja, kilau: W.putih, hidung: '#E6938B', kulit: '#F2BCB0', kulitTua: '#D98C80',
  pipi: '#F3A694', kumis: '#C9BDAD', stripe: '#DCD2C2', dahan: '#9C6A3C', daun: W.biru,
};
const TEBAL = 7; // outline drawn under the fill, so 3.5 shows outside

// Filled ribbon that tapers along a polyline, with round ends.
function pita(pts, w0, w1) {
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[Math.max(0, i - 1)], [nx, ny] = pts[Math.min(pts.length - 1, i + 1)];
    const dx = nx - px, dy = ny - py;
    const len = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
    L.push([x - (dy / len) * w, y + (dx / len) * w]);
    R.push([x + (dy / len) * w, y - (dx / len) * w]);
  }
  const all = L.concat(R.reverse());
  const [sx, sy] = pts[0], [ex, ey] = pts[pts.length - 1];
  return `M${all.map(([a, b]) => `${f(a)} ${f(b)}`).join('L')}Z` + bulat(sx, sy, w0 / 2) + bulat(ex, ey, w1 / 2);
}
const bulat = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
const elips = (cx, cy, rx, ry) => `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;

function bez(p0, p1, p2, p3, n = 24) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, m = 1 - t;
    out.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
      m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]);
  }
  return out;
}
function spiral(cx, cy, r0, r1, a0, turns, dir = 1, n = 40) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = a0 + dir * t * turns * 2 * Math.PI;
    const r = r0 + (r1 - r0) * t;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

// Irregular dark patch, like the spots on the cuscus's back.
function bercak(cx, cy, rx, ry, seed = 1, rot = 0) {
  const pts = [];
  for (let i = 0; i < 28; i++) {
    const t = (i / 28) * Math.PI * 2;
    const k = 1 + 0.16 * Math.sin(3 * t + seed) + 0.1 * Math.sin(5 * t + 2 * seed) + 0.06 * Math.cos(7 * t + seed);
    pts.push(`${f(cx + rx * k * Math.cos(t))} ${f(cy + ry * k * Math.sin(t))}`);
  }
  return `<path d="M${pts.join('L')}Z" fill="${P.bercak}" transform="rotate(${rot} ${cx} ${cy})"/>`;
}

let uid = 0;
const HEAD_D = 'M94 154C94 94 142 64 200 64C258 64 306 94 306 154C306 190 282 224 240 250C226 260 212 270 200 270C188 270 174 260 160 250C118 224 94 190 94 154Z';
const BODY_D = 'M110 330C110 262 150 236 200 236C250 236 290 262 290 330C290 392 254 416 200 416C146 416 110 392 110 330Z';
const TELINGA = [-1, 1].map((k) => bulat(200 + 92 * k, 116, 17));

// One colour group: outlines of every part, then fills, then details clipped
// to the union of the parts.
// Every closed piece is its own <path>, so overlapping pieces never cancel
// each other out and leave holes.
const pisah = (d) => d.split(/(?=M)/).filter(Boolean);
const potong = (parts, attr) => parts.flatMap(pisah).map((d) => `<path d="${d}"${attr}/>`).join('');

function grup(parts, { warna = P.bulu, garis = P.garis, tebal = TEBAL, detail = '' } = {}) {
  const id = `g${++uid}`;
  return potong(parts, ` fill="${garis}" stroke="${garis}" stroke-width="${tebal}" stroke-linejoin="round"`)
    + potong(parts, ` fill="${warna}"`)
    + (detail ? `<defs><clipPath id="${id}">${potong(parts, '')}</clipPath></defs><g clip-path="url(#${id})">${detail}</g>` : '');
}

// Arm as a tapered ribbon from the shoulder to the wrist.
function lenganD(dari, ke, lebar = 30) {
  const pts = bez(dari, [dari[0], (dari[1] + ke[1]) / 2], [ke[0], (dari[1] + ke[1]) / 2], ke, 12);
  return pita(pts, lebar, lebar * 0.78);
}

// Pink hand: palm and four long fingers fanned towards (dx, dy).
function tangan(x, y, dx, dy, r = 13) {
  const a0 = Math.atan2(dy, dx);
  const jari = [-0.62, -0.21, 0.21, 0.62].map((k) => {
    const a = a0 + k;
    const len = r * (2.45 - Math.abs(k) * 0.9);
    return `M${f(x + Math.cos(a) * r * 0.4)} ${f(y + Math.sin(a) * r * 0.4)}L${f(x + Math.cos(a) * len)} ${f(y + Math.sin(a) * len)}`;
  }).join('');
  const w = r * 0.58;
  const svg = `<path d="${jari}" stroke="${P.kulitTua}" stroke-width="${f(w + 4)}" stroke-linecap="round" fill="none"/><circle cx="${f(x)}" cy="${f(y)}" r="${r + 2}" fill="${P.kulitTua}"/>`
    + `<path d="${jari}" stroke="${P.kulit}" stroke-width="${f(w)}" stroke-linecap="round" fill="none"/><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${P.kulit}"/>`;
  const sil = `<path d="${jari}" stroke-width="${f(w)}"/><circle cx="${f(x)}" cy="${f(y)}" r="${r}"/>`;
  return { svg, sil };
}

function kaki(x, y, sisi) {
  let svg = `<ellipse cx="${x}" cy="${y}" rx="31" ry="17" fill="${P.kulit}" stroke="${P.kulitTua}" stroke-width="3"/>`;
  for (const k of [-1, 0, 1]) svg += `<ellipse cx="${x + sisi * 8 + k * 11}" cy="${y + 8}" rx="4.6" ry="5.6" fill="${P.kulitTua}"/>`;
  return { svg, sil: `<ellipse cx="${x}" cy="${y}" rx="31" ry="17"/>` };
}

// Tail from behind the body, out to the side and curling up, bare pink tip.
function ekor({ sisi = 1, naik = 0 } = {}) {
  const hip = [200 + 30 * sisi, 372];
  const sweep = bez(hip, [200 + 110 * sisi, 398 - naik], [200 + 178 * sisi, 372 - naik], [200 + 174 * sisi, 316 - naik], 26);
  const c = [200 + 148 * sisi, 312 - naik];
  const curl = spiral(c[0], c[1], 26, 6, sisi === 1 ? 0 : Math.PI, 1.2, -sisi, 36).slice(1);
  const pts = sweep.concat(curl);
  const w0 = 26, w1 = 8, k = Math.round(pts.length * 0.58);
  const wk = w0 + (w1 - w0) * (k / (pts.length - 1));
  const d = pita(pts, w0, w1);
  const svg = grup([d], { detail: `<path d="${pita(pts.slice(k), wk + 2, w1 + 2)}" fill="${P.kulit}"/>` + bercak(200 + 112 * sisi, 386 - naik, 11, 7, 4) });
  return { svg, sil: potong([d], '') };
}

function mata({ x, y, gaya = 'buka', arah = [0, 0] }) {
  if (gaya === 'tutup') return `<path d="M${x - 20} ${y + 2}Q${x} ${y + 22} ${x + 20} ${y + 2}" fill="none" stroke="${P.mata}" stroke-width="5" stroke-linecap="round"/>`;
  if (gaya === 'cinta') return `<path transform="translate(${x} ${y + 4}) scale(1.3)" d="M0 14C-8 6 -20 0 -20 -8A9 9 0 0 1 0 -8A9 9 0 0 1 20 -8C20 0 8 6 0 14Z" fill="${P.lingkar}"/>`;
  const kaget = gaya === 'kaget';
  const px = x + arah[0] * 6, py = y + arah[1] * 6;
  let s = `<circle cx="${x}" cy="${y}" r="${kaget ? 32 : 30}" fill="${P.lingkar}"/>`;
  s += `<circle cx="${px}" cy="${py}" r="${kaget ? 18 : 24}" fill="${P.mata}"/>`;
  s += `<circle cx="${px - 8}" cy="${py - 9}" r="7" fill="${P.kilau}"/><circle cx="${px + 7}" cy="${py + 8}" r="3" fill="${P.kilau}"/>`;
  return s;
}

const EKS = {
  senang: { kiri: 'buka', kanan: 'buka', mulut: 'senyum' },
  kedip: { kiri: 'buka', kanan: 'tutup', mulut: 'senyum' },
  tidur: { kiri: 'tutup', kanan: 'tutup', mulut: 'kecil' },
  kaget: { kiri: 'kaget', kanan: 'kaget', mulut: 'o' },
  cinta: { kiri: 'cinta', kanan: 'cinta', mulut: 'senyum' },
  tawa: { kiri: 'tutup', kanan: 'tutup', mulut: 'tawa' },
};

function kepala({ ekspresi = 'senang', arah = [0, 0], miring = 0 } = {}) {
  const E = EKS[ekspresi];
  // patches on the crown, kept inside the head
  const id = `h${++uid}`;
  let s = grup([HEAD_D, ...TELINGA]);
  s += [-1, 1].map((k) => `<circle cx="${200 + 93 * k}" cy="116" r="8.5" fill="${P.kulit}"/>`).join('');
  s += `<defs><clipPath id="${id}"><path d="${HEAD_D}"/></clipPath></defs><g clip-path="url(#${id})">${bercak(250, 86, 32, 19, 2, -12)}${bercak(140, 102, 19, 13, 5, 20)}${bercak(298, 150, 15, 21, 7)}</g>`;
  // lighter muzzle narrowing to the nose, pale stripe from the forehead into it
  s += `<path d="M166 186Q200 172 234 186Q238 234 200 264Q162 234 166 186Z" fill="${P.perut}"/>`;
  s += `<path d="M189 72Q200 60 211 72L207 206Q200 212 193 206Z" fill="${P.stripe}"/>`;
  s += `<path d="M185 228Q200 218 215 228Q215 246 200 254Q185 246 185 228Z" fill="${P.hidung}"/><circle cx="195" cy="233" r="2.4" fill="${P.kulitTua}"/><circle cx="205" cy="233" r="2.4" fill="${P.kulitTua}"/>`;
  s += {
    senyum: `<path d="M188 256Q194 263 200 257Q206 263 212 256" fill="none" stroke="${P.mata}" stroke-width="3.2" stroke-linecap="round"/>`,
    kecil: `<path d="M195 258Q200 262 205 258" fill="none" stroke="${P.mata}" stroke-width="3" stroke-linecap="round"/>`,
    o: `<ellipse cx="200" cy="259" rx="6" ry="7" fill="${P.mata}"/>`,
    tawa: `<path d="M186 254Q200 274 214 254Z" fill="${P.mata}"/><path d="M192 261Q200 268 208 261Z" fill="${P.pipi}"/>`,
  }[E.mulut];
  // whiskers stay inside the face
  for (const k of [-1, 1]) s += `<path d="M${200 + 24 * k} 230L${200 + 62 * k} 220M${200 + 25 * k} 238L${200 + 64 * k} 240" fill="none" stroke="${P.kumis}" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<ellipse cx="140" cy="205" rx="15" ry="9" fill="${P.pipi}" opacity="0.5"/><ellipse cx="260" cy="205" rx="15" ry="9" fill="${P.pipi}" opacity="0.5"/>`;
  s += mata({ x: 158, y: 160, gaya: E.kiri, arah }) + mata({ x: 242, y: 160, gaya: E.kanan, arah });
  if (ekspresi === 'kaget') s += `<path d="M132 112Q158 104 180 110M268 112Q242 104 220 110" fill="none" stroke="${P.bercak}" stroke-width="4" stroke-linecap="round"/>`;
  const rot = miring ? ` transform="rotate(${miring} 200 165)"` : '';
  return { svg: `<g${rot}>${s}</g>`, sil: `<g${rot}>${potong([HEAD_D, ...TELINGA], '')}</g>` };
}

// Body with any arms that grow out of its sides, as one shape.
function badan(lengan = []) {
  const arms = lengan.map(([dari, ke]) => lenganD(dari, ke));
  const detail = `<ellipse cx="200" cy="342" rx="58" ry="60" fill="${P.perut}"/>`
    + bercak(124, 300, 24, 17, 3, 30) + bercak(278, 322, 21, 28, 6, -10) + bercak(152, 394, 17, 11, 8);
  // belly and patches only on the body, not on the arms
  const id = `p${++uid}`;
  const svg = grup([BODY_D, ...arms]) + `<defs><clipPath id="${id}"><path d="${BODY_D}"/></clipPath></defs><g clip-path="url(#${id})">${detail}</g>`;
  return { svg, sil: potong([BODY_D, ...arms], '') };
}

// Arms that lie over the body (resting on the belly, holding a sign).
function lenganDepan(lengan) {
  const arms = lengan.map(([dari, ke]) => lenganD(dari, ke, 28));
  return { svg: grup(arms), sil: potong(arms, '') };
}

// Accessories, drawn in the right z order by the pose.
const AKS = {
  topi() {
    return `<ellipse cx="200" cy="80" rx="138" ry="20" fill="#E3B86B"/><path d="M130 78C130 42 150 26 200 26C250 26 270 42 270 78Z" fill="#E3B86B"/><rect x="128" y="62" width="144" height="14" fill="${W.laut}"/><path d="M62 80Q200 102 338 80" fill="none" stroke="#C99A4F" stroke-width="4"/>`;
  },
  masker() {
    return `<rect x="110" y="120" width="180" height="80" rx="38" fill="${W.buih}" opacity="0.25"/>`
      + `<rect x="110" y="120" width="180" height="80" rx="38" fill="none" stroke="${W.biru}" stroke-width="11"/>`
      + `<path d="M291 158C308 158 310 128 312 98C314 74 324 62 338 60" fill="none" stroke="${W.senja}" stroke-width="12" stroke-linecap="round"/>`
      + `<path d="M110 150C94 150 88 156 86 166" fill="none" stroke="${W.biru}" stroke-width="9" stroke-linecap="round"/>`;
  },
  kelapa(x, y) {
    return `<path d="M${x - 6} ${y - 30}C${x - 24} ${y - 56} ${x - 40} ${y - 70} ${x - 56} ${y - 74}C${x - 30} ${y - 76} ${x - 10} ${y - 60} ${x - 6} ${y - 30}Z" fill="${W.biru}"/>`
      + `<circle cx="${x}" cy="${y}" r="38" fill="#6B8E3A"/><ellipse cx="${x}" cy="${y - 24}" rx="22" ry="9" fill="#F4EBD0"/><circle cx="${x + 14}" cy="${y + 8}" r="9" fill="#86A94E"/>`
      + `<path d="M${x + 8} ${y - 26}L${x + 20} ${y - 70}" stroke="${W.putih}" stroke-width="8" stroke-linecap="round"/><path d="M${x + 8} ${y - 26}L${x + 20} ${y - 70}" stroke="${W.senja}" stroke-width="8" stroke-linecap="round" stroke-dasharray="7 7"/>`;
  },
  bintangLaut(x, y, r = 26) {
    const pts = [];
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 5 + 0.3;
      const rr = k % 2 ? r * 0.45 : r;
      pts.push(`${f(x + rr * Math.cos(a))} ${f(y + rr * Math.sin(a))}`);
    }
    return `<path d="M${pts.join('L')}Z" fill="${W.senja}" stroke="${W.senja}" stroke-width="10" stroke-linejoin="round"/><circle cx="${x - 4}" cy="${y - 2}" r="3" fill="${W.pasir}"/><circle cx="${x + 6}" cy="${y + 4}" r="3" fill="${W.pasir}"/><circle cx="${x}" cy="${y + 9}" r="2.5" fill="${W.pasir}"/>`;
  },
  papan(label) {
    let s = `<rect x="104" y="296" width="192" height="88" rx="16" fill="${W.pasir}" stroke="${W.laut}" stroke-width="6"/>`;
    s += text(label[0], { x: 200, y: 334, family: 'judul', weight: 700, size: 30, fill: W.laut, anchor: 'middle', maxWidth: 150 });
    if (label[1]) s += text(label[1], { x: 200, y: 364, family: 'jakarta', weight: 700, size: 15, tracking: 0.12, fill: W.biruTua, anchor: 'middle', maxWidth: 150 });
    return s;
  },
  dayung() {
    return `<path d="M318 160L292 400" stroke="${P.dahan}" stroke-width="12" stroke-linecap="round"/><path d="M318 160C338 120 348 110 352 70C330 86 304 112 318 160Z" fill="#B8824C"/>`;
  },
  // branch with leaves, like the one in the reference photo
  dahan() {
    let s = `<path d="M24 414C120 400 280 400 376 414" fill="none" stroke="${P.dahan}" stroke-width="22" stroke-linecap="round"/>`;
    s += `<path d="M44 411C120 402 280 402 356 411" fill="none" stroke="#B8824C" stroke-width="6" stroke-linecap="round" opacity="0.6"/>`;
    const daun = (x, y, rot, sc = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"><path d="M0 0C14 -22 44 -30 62 -18C50 4 22 14 0 0Z" fill="${P.daun}"/><path d="M4 -1C22 -10 40 -16 58 -18" fill="none" stroke="${W.biruTua}" stroke-width="2"/></g>`;
    return s + daun(30, 406, -40) + daun(46, 422, 20, 0.9) + daun(344, 406, -150) + daun(352, 420, 170, 0.85) + daun(322, 428, 140, 0.7);
  },
  zzz() {
    return text('z', { x: 292, y: 110, family: 'judul', weight: 700, size: 34, fill: W.biru })
      + text('z', { x: 316, y: 80, family: 'judul', weight: 700, size: 46, fill: W.biru })
      + text('z', { x: 348, y: 44, family: 'judul', weight: 700, size: 58, fill: W.biru });
  },
  hati() {
    return `<path transform="translate(322 92) rotate(14)" d="M0 26C-14 12 -34 0 -34 -14A16 16 0 0 1 0 -14A16 16 0 0 1 34 -14C34 0 14 12 0 26Z" fill="${W.senja}"/>`;
  },
};

// Accessories already are outer shapes; strip colours to use them as silhouette.
const polos = (s) => s.replace(/(fill|stroke|opacity|stroke-dasharray)="[^"]*"/g, '');

export const POSE = {
  sapa: { nama: 'Menyapa', untuk: 'Sambutan, halaman utama, pesan WhatsApp pertama' },
  snorkel: { nama: 'Snorkeling', untuk: 'Kegiatan laut, tips karang' },
  perahu: { nama: 'Nelayan', untuk: 'Antar jemput, jadwal kapal' },
  tidur: { nama: 'Tidur', untuk: 'Gantungan pintu, selamat malam, kamar' },
  santai: { nama: 'Santai di dahan', untuk: 'Promo, hari libur, sore di dermaga' },
  papan: { nama: 'Bawa papan', untuk: 'Pengumuman, harga, selamat datang' },
};

// White rim behind the outer silhouette, for stickers and busy grounds.
function rim(sil, s) {
  return `<g fill="${W.putih}" stroke="${W.putih}" stroke-width="18" stroke-linejoin="round" stroke-linecap="round">${sil}</g>${s}`;
}

// Build a pose from layers drawn back to front: each layer is { svg, sil }.
function susun(lapis) {
  return { svg: lapis.map((l) => l.svg).join(''), sil: lapis.map((l) => l.sil).join('') };
}
const aks = (svg) => ({ svg, sil: polos(svg) });

const BAHU_KIRI = [146, 282], BAHU_KANAN = [254, 282];
const KIRI_TURUN = [BAHU_KIRI, [102, 352]];

export function maskot(pose = 'sapa', { label = ['Selamat', 'DATANG'], stiker = false } = {}) {
  const kakiDua = (y = 410) => {
    const a = kaki(165, y, -1), b = kaki(235, y, 1);
    return { svg: a.svg + b.svg, sil: a.sil + b.sil };
  };
  const tgn = (x, y, dx, dy) => tangan(x, y, dx, dy);
  let L;
  switch (pose) {
    case 'sapa':
      L = [ekor({ sisi: 1 }), kakiDua(), badan([KIRI_TURUN, [BAHU_KANAN, [318, 212]]]), kepala({ ekspresi: 'senang' }),
        tgn(102, 352, -0.3, 1), tgn(318, 212, 0.2, -1)];
      break;
    case 'snorkel':
      L = [ekor({ sisi: -1 }), kakiDua(), badan([KIRI_TURUN, [BAHU_KANAN, [314, 266]]]), kepala({ ekspresi: 'senang', arah: [0.2, -0.3] }),
        aks(AKS.masker()), aks(AKS.bintangLaut(328, 248)), tgn(102, 352, -0.3, 1), tgn(314, 266, 1, -0.4)];
      break;
    case 'perahu':
      L = [ekor({ sisi: -1 }), kakiDua(), badan([KIRI_TURUN, [BAHU_KANAN, [306, 252]]]), aks(AKS.dayung()), kepala({ ekspresi: 'kedip' }),
        aks(AKS.topi()), tgn(102, 352, -0.3, 1), tgn(306, 252, 0.6, -0.8)];
      break;
    case 'tidur':
      L = [ekor({ sisi: 1, naik: 10 }), kakiDua(), badan(), lenganDepan([[[132, 290], [162, 350]], [[268, 290], [238, 350]]]),
        tgn(162, 350, 0.6, 0.8), tgn(238, 350, -0.6, 0.8), kepala({ ekspresi: 'tidur', miring: 8 }), aks(AKS.zzz())];
      break;
    case 'santai':
      L = [ekor({ sisi: 1, naik: 24 }), aks(AKS.dahan()), kakiDua(404), badan([KIRI_TURUN, [BAHU_KANAN, [306, 324]]]), kepala({ ekspresi: 'cinta' }),
        aks(AKS.kelapa(336, 318)), tgn(102, 352, -0.3, 1), tgn(306, 324, 1, 0.3)];
      break;
    case 'papan':
      L = [ekor({ sisi: -1 }), kakiDua(), badan(), kepala({ ekspresi: 'senang' }), aks(AKS.papan(label)),
        lenganDepan([[[132, 286], [112, 324]], [[268, 286], [288, 324]]]), tgn(112, 324, 0.7, 0.7), tgn(288, 324, -0.7, 0.7)];
      break;
  }
  const { svg, sil } = susun(L);
  return { svg: stiker ? rim(sil, svg) : svg, box: [0, 0, 400, 440] };
}

export const EKSPRESI = {
  senang: 'Senang', kedip: 'Kedip', tidur: 'Ngantuk', kaget: 'Kaget', cinta: 'Suka', tawa: 'Tertawa',
};
export function wajah(ekspresi = 'senang', { stiker = false } = {}) {
  const L = [kepala({ ekspresi })];
  if (ekspresi === 'cinta') L.push(aks(AKS.hati()));
  if (ekspresi === 'tidur') L.push(aks(AKS.zzz()));
  const { svg, sil } = susun(L);
  // symmetric around the face so stickers sit centred; zzz and heart fit inside
  return { svg: stiker ? rim(sil, svg) : svg, box: [20, 20, 380, 284] };
}
