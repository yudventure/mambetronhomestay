// Mambe, the kuskus mascot, drawn after the Waigeo spotted cuscus
// (Spilocuscus papuensis) of Raja Ampat: cream fur with dark patches, tiny
// ears hidden in the fur, large round eyes with an amber rim, pink nose,
// pink long-fingered hands that grip, and a long tail that curls with a
// bare pink tip. Flat vector on a 400 × 440 box, feet on the ground at
// y 420, face centred at x 200.
import { W } from './palet.mjs';
import { text } from './huruf.mjs';

const f = (n) => +n.toFixed(2);
export const P = {
  bulu: '#F3EDDF', perut: '#FBF7EE', garis: '#B9AC98', bercak: '#2B2522',
  mata: W.hitam, lingkar: W.senja, kilau: W.putih, hidung: '#E6938B', kulit: '#F2BCB0', kulitTua: '#D98C80',
  pipi: '#F3A694', kumis: '#C9BDAD', stripe: '#DCD2C2', dahan: '#9C6A3C', daun: W.toska,
};
const GARIS = `stroke="${P.garis}" stroke-width="3.5" stroke-linejoin="round"`;

// Filled stroke that tapers along a polyline: width w0 at the start, w1 at the end.
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
  return `M${all.map(([a, b]) => `${f(a)} ${f(b)}`).join('L')}Z` + `M${f(sx - w0 / 2)} ${f(sy)}a${w0 / 2} ${w0 / 2} 0 1 0 ${w0} 0a${w0 / 2} ${w0 / 2} 0 1 0 ${-w0} 0Z` + `M${f(ex - w1 / 2)} ${f(ey)}a${w1 / 2} ${w1 / 2} 0 1 0 ${w1} 0a${w1 / 2} ${w1 / 2} 0 1 0 ${-w1} 0Z`;
}
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

// Pink hand: palm, then long thin fingers fanned towards direction (dx, dy).
function tangan(x, y, dx, dy, r = 13) {
  const a0 = Math.atan2(dy, dx);
  let s = `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${P.kulit}"/>`;
  for (const k of [-0.6, -0.2, 0.2, 0.6]) {
    const a = a0 + k;
    const len = r * (2.5 - Math.abs(k) * 0.9);
    s += `<path d="M${f(x + Math.cos(a) * r * 0.4)} ${f(y + Math.sin(a) * r * 0.4)}L${f(x + Math.cos(a) * len)} ${f(y + Math.sin(a) * len)}" stroke="${P.kulit}" stroke-width="${r * 0.56}" stroke-linecap="round"/>`;
  }
  return s;
}

function lengan({ dari, ke, lebar = 30, jari = [0, 1] }) {
  const pts = bez(dari, [dari[0], (dari[1] + ke[1]) / 2], [ke[0], (dari[1] + ke[1]) / 2], ke, 10);
  return `<path d="${pita(pts, lebar, lebar * 0.8)}" fill="${P.bulu}" ${GARIS}/><circle cx="${dari[0]}" cy="${dari[1]}" r="${lebar / 2 + 2}" fill="${P.bulu}"/>` + tangan(ke[0], ke[1], jari[0], jari[1]);
}

function kaki(x, y, sisi) {
  let s = `<ellipse cx="${x}" cy="${y}" rx="30" ry="16" fill="${P.kulit}" stroke="${P.kulitTua}" stroke-width="2.5"/>`;
  for (const k of [-1, 0, 1]) s += `<ellipse cx="${x + sisi * 8 + k * 11}" cy="${y + 9}" rx="5" ry="6" fill="${P.kulitTua}"/>`;
  return s;
}

// Tail from behind the body, out to the side and curling up, bare pink tip.
function ekor({ sisi = 1, naik = 0 } = {}) {
  const hip = [200 + 30 * sisi, 372];
  const sweep = bez(hip, [200 + 110 * sisi, 398 - naik], [200 + 178 * sisi, 372 - naik], [200 + 174 * sisi, 316 - naik], 26);
  const c = [200 + 148 * sisi, 312 - naik];
  const curl = spiral(c[0], c[1], 26, 6, sisi === 1 ? 0 : Math.PI, 1.2, -sisi, 36).slice(1);
  const pts = sweep.concat(curl);
  const w0 = 26, w1 = 7, k = Math.round(pts.length * 0.58);
  const wk = w0 + (w1 - w0) * (k / (pts.length - 1));
  return `<path d="${pita(pts, w0, w1)}" fill="${P.bulu}" ${GARIS}/>` + `<path d="${pita(pts.slice(k), wk, w1)}" fill="${P.kulit}"/>`
    + bercak(200 + 112 * sisi, 384 - naik, 11, 7, 4);
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

function kepala({ ekspresi = 'senang', arah = [0, 0], miring = 0 } = {}) {
  const E = {
    senang: { kiri: 'buka', kanan: 'buka', mulut: 'senyum' },
    kedip: { kiri: 'buka', kanan: 'tutup', mulut: 'senyum' },
    tidur: { kiri: 'tutup', kanan: 'tutup', mulut: 'kecil' },
    kaget: { kiri: 'kaget', kanan: 'kaget', mulut: 'o' },
    cinta: { kiri: 'cinta', kanan: 'cinta', mulut: 'senyum' },
    tawa: { kiri: 'tutup', kanan: 'tutup', mulut: 'tawa' },
  }[ekspresi];
  const id = `h${++uid}`;
  let s = `<g transform="rotate(${miring} 200 165)"><defs><clipPath id="${id}"><path d="${HEAD_D}"/></clipPath></defs>`;
  // tiny ears, mostly hidden in the fur
  for (const k of [-1, 1]) {
    s += `<circle cx="${200 + 92 * k}" cy="118" r="16" fill="${P.bulu}" ${GARIS}/>`;
    s += `<circle cx="${200 + 94 * k}" cy="119" r="8" fill="${P.kulit}"/>`;
  }
  s += `<path d="${HEAD_D}" fill="${P.bulu}" ${GARIS}/>`;
  // dark patches on the crown, and a pale stripe down the face
  s += `<g clip-path="url(#${id})">${bercak(246, 84, 34, 20, 2, -12)}${bercak(140, 100, 20, 14, 5, 20)}${bercak(298, 150, 16, 22, 7)}</g>`;
  // lighter muzzle narrowing to the nose, pale stripe from the forehead into it
  s += `<path d="M168 184Q200 170 232 184Q236 232 200 262Q164 232 168 184Z" fill="${P.perut}"/>`;
  s += `<path d="M188 70Q200 58 212 70L207 206Q200 212 193 206Z" fill="${P.stripe}"/>`;
  s += `<path d="M185 228Q200 218 215 228Q215 246 200 254Q185 246 185 228Z" fill="${P.hidung}"/><circle cx="195" cy="233" r="2.4" fill="${P.kulitTua}"/><circle cx="205" cy="233" r="2.4" fill="${P.kulitTua}"/>`;
  const mulut = {
    senyum: `<path d="M188 256Q194 263 200 257Q206 263 212 256" fill="none" stroke="${P.mata}" stroke-width="3.2" stroke-linecap="round"/>`,
    kecil: `<path d="M195 258Q200 262 205 258" fill="none" stroke="${P.mata}" stroke-width="3" stroke-linecap="round"/>`,
    o: `<ellipse cx="200" cy="259" rx="6" ry="7" fill="${P.mata}"/>`,
    tawa: `<path d="M186 254Q200 274 214 254Z" fill="${P.mata}"/><path d="M192 261Q200 268 208 261Z" fill="${P.pipi}"/>`,
  }[E.mulut];
  s += mulut;
  for (const k of [-1, 1]) s += `<path d="M${200 + 26 * k} 232L${200 + 76 * k} 218M${200 + 28 * k} 240L${200 + 80 * k} 242" fill="none" stroke="${P.kumis}" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<ellipse cx="142" cy="206" rx="15" ry="9" fill="${P.pipi}" opacity="0.5"/><ellipse cx="258" cy="206" rx="15" ry="9" fill="${P.pipi}" opacity="0.5"/>`;
  s += mata({ x: 158, y: 160, gaya: E.kiri, arah }) + mata({ x: 242, y: 160, gaya: E.kanan, arah });
  if (ekspresi === 'kaget') s += `<path d="M132 112Q158 104 180 110M268 112Q242 104 220 110" fill="none" stroke="${P.bercak}" stroke-width="4" stroke-linecap="round"/>`;
  return s + '</g>';
}

function badan() {
  const id = `b${++uid}`;
  let s = `<defs><clipPath id="${id}"><path d="${BODY_D}"/></clipPath></defs>`;
  s += `<path d="${BODY_D}" fill="${P.bulu}" ${GARIS}/>`;
  s += `<ellipse cx="200" cy="340" rx="58" ry="60" fill="${P.perut}"/>`;
  s += `<g clip-path="url(#${id})">${bercak(126, 300, 26, 18, 3, 30)}${bercak(276, 320, 22, 30, 6, -10)}${bercak(150, 392, 18, 12, 8)}</g>`;
  return s;
}

// Accessories, drawn in the right z order by the pose.
const AKS = {
  topi() {
    return `<ellipse cx="200" cy="80" rx="138" ry="20" fill="#E3B86B"/><path d="M130 78C130 42 150 26 200 26C250 26 270 42 270 78Z" fill="#E3B86B"/><rect x="128" y="62" width="144" height="14" fill="${W.laut}"/><path d="M62 80Q200 102 338 80" fill="none" stroke="#C99A4F" stroke-width="4"/>`;
  },
  masker() {
    return `<rect x="110" y="120" width="180" height="80" rx="38" fill="${W.buih}" opacity="0.25"/>`
      + `<rect x="110" y="120" width="180" height="80" rx="38" fill="none" stroke="${W.toska}" stroke-width="11"/>`
      + `<path d="M291 158C308 158 310 128 312 98C314 74 324 62 338 60" fill="none" stroke="${W.senja}" stroke-width="12" stroke-linecap="round"/>`
      + `<path d="M110 150C94 150 88 156 86 166" fill="none" stroke="${W.toska}" stroke-width="9" stroke-linecap="round"/>`;
  },
  kelapa(x, y) {
    return `<circle cx="${x}" cy="${y}" r="38" fill="#6B8E3A"/><ellipse cx="${x}" cy="${y - 24}" rx="22" ry="9" fill="#F4EBD0"/><circle cx="${x - 14}" cy="${y + 2}" r="9" fill="#86A94E"/>`
      + `<path d="M${x + 8} ${y - 26}L${x + 20} ${y - 70}" stroke="${W.putih}" stroke-width="8" stroke-linecap="round"/><path d="M${x + 8} ${y - 26}L${x + 20} ${y - 70}" stroke="${W.senja}" stroke-width="8" stroke-linecap="round" stroke-dasharray="7 7"/>`
      + `<path d="M${x - 6} ${y - 30}C${x - 24} ${y - 56} ${x - 40} ${y - 70} ${x - 56} ${y - 74}C${x - 30} ${y - 76} ${x - 10} ${y - 60} ${x - 6} ${y - 30}Z" fill="${W.toska}"/>`;
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
    s += text(label[0], { x: 200, y: 334, family: 'fredoka', weight: 700, size: 30, fill: W.laut, anchor: 'middle', maxWidth: 150 });
    if (label[1]) s += text(label[1], { x: 200, y: 364, family: 'jakarta', weight: 700, size: 15, tracking: 0.12, fill: W.toskaTua, anchor: 'middle', maxWidth: 150 });
    return s;
  },
  dayung() {
    return `<path d="M318 160L292 400" stroke="${P.dahan}" stroke-width="12" stroke-linecap="round"/><path d="M318 160C338 120 348 110 352 70C330 86 304 112 318 160Z" fill="#B8824C"/>`;
  },
  // branch with leaves, like the one in the reference photo
  dahan() {
    let s = `<path d="M20 412C120 398 280 398 380 412" fill="none" stroke="${P.dahan}" stroke-width="22" stroke-linecap="round"/>`;
    s += `<path d="M40 410C120 400 280 400 360 410" fill="none" stroke="#B8824C" stroke-width="6" stroke-linecap="round" opacity="0.6"/>`;
    const daun = (x, y, rot, sc = 1) => `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})" d="M0 0C14 -22 44 -30 62 -18C50 4 22 14 0 0Z" fill="${P.daun}"/><path transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})" d="M4 -1C22 -10 40 -16 58 -18" fill="none" stroke="${W.toskaTua}" stroke-width="2"/>`;
    return s + daun(26, 404, -40) + daun(44, 420, 20, 0.9) + daun(340, 404, -150) + daun(352, 418, 170, 0.85) + daun(322, 426, 140, 0.7);
  },
  zzz() {
    return text('z', { x: 292, y: 110, family: 'fredoka', weight: 700, size: 34, fill: W.toska })
      + text('z', { x: 316, y: 80, family: 'fredoka', weight: 700, size: 46, fill: W.toska })
      + text('z', { x: 348, y: 44, family: 'fredoka', weight: 700, size: 58, fill: W.toska });
  },
  hati() {
    return `<path transform="translate(322 92) rotate(14)" d="M0 26C-14 12 -34 0 -34 -14A16 16 0 0 1 0 -14A16 16 0 0 1 34 -14C34 0 14 12 0 26Z" fill="${W.senja}"/>`;
  },
};

export const POSE = {
  sapa: { nama: 'Menyapa', untuk: 'Sambutan, halaman utama, pesan WhatsApp pertama' },
  snorkel: { nama: 'Snorkeling', untuk: 'Kegiatan laut, tips karang' },
  perahu: { nama: 'Nelayan', untuk: 'Antar jemput, jadwal kapal' },
  tidur: { nama: 'Tidur', untuk: 'Gantungan pintu, selamat malam, kamar' },
  santai: { nama: 'Santai di dahan', untuk: 'Promo, hari libur, sore di dermaga' },
  papan: { nama: 'Bawa papan', untuk: 'Pengumuman, harga, selamat datang' },
};

// White rim behind the whole drawing, for stickers and busy backgrounds.
function rim(s) {
  const polos = s.replace(/<defs>.*?<\/defs>/g, '').replace(/clip-path="[^"]*"/g, '').replace(/fill="[^"]*"/g, '').replace(/stroke="[^"]*"/g, '').replace(/stroke-width="[^"]*"/g, '').replace(/stroke-dasharray="[^"]*"/g, '').replace(/opacity="[^"]*"/g, '');
  return `<g stroke="${W.putih}" stroke-width="18" stroke-linejoin="round" stroke-linecap="round" fill="${W.putih}">${polos}</g>` + s;
}

export function maskot(pose = 'sapa', { label = ['Selamat', 'DATANG'], stiker = false } = {}) {
  let s = '';
  const kiriTurun = lengan({ dari: [138, 290], ke: [104, 352], jari: [-0.3, 1] });
  switch (pose) {
    case 'sapa':
      s += ekor({ sisi: 1 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan() + kiriTurun;
      s += kepala({ ekspresi: 'senang' });
      s += lengan({ dari: [262, 290], ke: [318, 214], jari: [0.2, -1] });
      break;
    case 'snorkel':
      s += ekor({ sisi: -1 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan() + kiriTurun;
      s += kepala({ ekspresi: 'senang', arah: [0.2, -0.3] });
      s += AKS.masker();
      s += AKS.bintangLaut(326, 250) + lengan({ dari: [262, 290], ke: [312, 266], jari: [1, -0.4] });
      break;
    case 'perahu':
      s += ekor({ sisi: -1 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan() + kiriTurun + AKS.dayung();
      s += kepala({ ekspresi: 'kedip' });
      s += AKS.topi();
      s += lengan({ dari: [262, 290], ke: [306, 250], jari: [0.6, -0.8] });
      break;
    case 'tidur':
      s += ekor({ sisi: 1, naik: 10 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan();
      s += lengan({ dari: [138, 290], ke: [156, 352], jari: [0.6, 0.8] }) + lengan({ dari: [262, 290], ke: [244, 352], jari: [-0.6, 0.8] });
      s += kepala({ ekspresi: 'tidur', miring: 8 });
      s += AKS.zzz();
      break;
    case 'santai':
      s += ekor({ sisi: 1, naik: 24 }) + AKS.dahan() + kaki(165, 404, -1) + kaki(235, 404, 1) + badan() + kiriTurun;
      s += kepala({ ekspresi: 'cinta' });
      s += AKS.kelapa(334, 318) + lengan({ dari: [262, 290], ke: [306, 322], jari: [1, 0.3] });
      break;
    case 'papan':
      s += ekor({ sisi: -1 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan();
      s += kepala({ ekspresi: 'senang' });
      s += AKS.papan(label);
      s += lengan({ dari: [138, 290], ke: [112, 322], jari: [0.7, 0.7] }) + lengan({ dari: [262, 290], ke: [288, 322], jari: [-0.7, 0.7] });
      break;
  }
  if (stiker) s = rim(s);
  return { svg: s, box: [0, 0, 400, 440] };
}

export const EKSPRESI = {
  senang: 'Senang', kedip: 'Kedip', tidur: 'Ngantuk', kaget: 'Kaget', cinta: 'Suka', tawa: 'Tertawa',
};
export function wajah(ekspresi = 'senang', { stiker = false } = {}) {
  let s = kepala({ ekspresi });
  if (ekspresi === 'cinta') s += AKS.hati();
  if (ekspresi === 'tidur') s += AKS.zzz();
  if (stiker) s = rim(s);
  return { svg: s, box: [60, 20, 400, 284] };
}
