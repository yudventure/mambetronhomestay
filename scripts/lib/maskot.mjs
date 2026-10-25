// Mambe, the kuskus mascot. Flat vector character in the logo's style
// (black body, white eye rings, sand muzzle). Drawn on a 400 × 440 box,
// feet on the ground at y 420, face centred at x 200.
import { W } from './palet.mjs';
import { text } from './huruf.mjs';

const f = (n) => +n.toFixed(2);
const P = { tubuh: W.hitam, perut: W.pasir, mata: W.putih, pipi: W.senja, hidung: '#2A2A2A' };

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

// Points along a cubic bezier.
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

// Prehensile tail: starts behind the body, sweeps out to the side and curls up.
function ekor({ sisi = 1, naik = 0 } = {}) {
  const hip = [200 + 30 * sisi, 372];
  const sweep = bez(hip, [200 + 110 * sisi, 396 - naik], [200 + 175 * sisi, 372 - naik], [200 + 172 * sisi, 316 - naik], 26);
  const c = [200 + 146 * sisi, 312 - naik];
  const curl = spiral(c[0], c[1], 26, 6, sisi === 1 ? 0 : Math.PI, 1.2, -sisi, 36).slice(1);
  return `<path d="${pita(sweep.concat(curl), 24, 7)}" fill="${P.tubuh}" fill-rule="nonzero"/>`;
}

function lengan({ dari, ke, lebar = 32, tangan = true }) {
  const pts = bez(dari, [dari[0], (dari[1] + ke[1]) / 2], [ke[0], (dari[1] + ke[1]) / 2], ke, 10);
  let s = `<path d="${pita(pts, lebar, lebar * 0.85)}" fill="${P.tubuh}"/>`;
  if (tangan) s += `<circle cx="${f(ke[0])}" cy="${f(ke[1])}" r="${lebar * 0.36}" fill="${P.perut}"/>`;
  return s;
}

function kaki(x, y, sisi) {
  let s = `<ellipse cx="${x}" cy="${y}" rx="34" ry="19" fill="${P.tubuh}"/>`;
  for (const k of [-1, 0, 1]) s += `<circle cx="${x + sisi * 10 + k * 11}" cy="${y + 6}" r="4.5" fill="${P.perut}"/>`;
  return s;
}

function mata({ x, y, gaya = 'buka', arah = [0, 0] }) {
  let s = `<ellipse cx="${x}" cy="${y}" rx="30" ry="34" fill="${P.mata}"/>`;
  if (gaya === 'tutup') return s + `<path d="M${x - 17} ${y + 4}Q${x} ${y + 18} ${x + 17} ${y + 4}" fill="none" stroke="${P.tubuh}" stroke-width="5" stroke-linecap="round"/>`;
  if (gaya === 'cinta') return s + `<path transform="translate(${x} ${y + 2}) scale(1.15)" d="M0 14C-8 6 -20 0 -20 -8A9 9 0 0 1 0 -8A9 9 0 0 1 20 -8C20 0 8 6 0 14Z" fill="${P.pipi}"/>`;
  const px = x + arah[0] * 7, py = y + arah[1] * 7;
  const r = gaya === 'kaget' ? 15 : 21;
  s += `<circle cx="${px}" cy="${py}" r="${r}" fill="${P.tubuh}"/>`;
  s += `<circle cx="${px - 7}" cy="${py - 8}" r="6" fill="${P.mata}"/><circle cx="${px + 6}" cy="${py + 7}" r="2.6" fill="${P.mata}"/>`;
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
  let s = `<g transform="rotate(${miring} 200 165)">`;
  // ears
  for (const k of [-1, 1]) {
    s += `<circle cx="${200 + 84 * k}" cy="92" r="27" fill="${P.tubuh}"/>`;
    s += `<circle cx="${200 + 86 * k}" cy="95" r="13" fill="${P.perut}"/>`;
  }
  // head
  s += `<path d="M98 160C98 95 143 62 200 62C257 62 302 95 302 160C302 215 262 252 200 252C138 252 98 215 98 160Z" fill="${P.tubuh}"/>`;
  // muzzle and nose
  s += `<path d="M156 205C156 178 178 166 200 166C222 166 244 178 244 205C244 228 224 240 200 240C176 240 156 228 156 205Z" fill="${P.perut}"/>`;
  s += `<ellipse cx="200" cy="189" rx="13" ry="9.5" fill="${P.hidung}"/><ellipse cx="195" cy="186" rx="4" ry="2.6" fill="${P.mata}" opacity="0.8"/>`;
  const mulut = {
    senyum: `<path d="M184 206Q200 222 216 206" fill="none" stroke="${P.tubuh}" stroke-width="4.5" stroke-linecap="round"/>`,
    kecil: `<path d="M192 210Q200 216 208 210" fill="none" stroke="${P.tubuh}" stroke-width="4" stroke-linecap="round"/>`,
    o: `<ellipse cx="200" cy="214" rx="9" ry="11" fill="${P.tubuh}"/>`,
    tawa: `<path d="M180 204Q200 234 220 204Z" fill="${P.tubuh}"/><path d="M188 215Q200 226 212 215Z" fill="${P.pipi}"/>`,
  }[E.mulut];
  s += mulut;
  // cheeks
  s += `<circle cx="128" cy="200" r="12" fill="${P.pipi}" opacity="0.85"/><circle cx="272" cy="200" r="12" fill="${P.pipi}" opacity="0.85"/>`;
  // eyes, drawn last so lids and hearts sit on top
  s += mata({ x: 160, y: 146, gaya: E.kiri, arah }) + mata({ x: 240, y: 146, gaya: E.kanan, arah });
  if (ekspresi === 'kaget') s += `<path d="M138 102Q160 94 180 100M262 102Q240 94 220 100" fill="none" stroke="${P.mata}" stroke-width="5" stroke-linecap="round"/>`;
  return s + '</g>';
}

function badan() {
  let s = `<path d="M118 330C118 262 158 236 200 236C242 236 282 262 282 330C282 388 248 412 200 412C152 412 118 388 118 330Z" fill="${P.tubuh}"/>`;
  s += `<ellipse cx="200" cy="338" rx="52" ry="56" fill="${P.perut}"/>`;
  return s;
}

// Accessories, drawn in the right z order by the pose.
const AKS = {
  topi() {
    return `<ellipse cx="200" cy="78" rx="138" ry="20" fill="#E3B86B"/><path d="M130 76C130 40 150 24 200 24C250 24 270 40 270 76Z" fill="#E3B86B"/><rect x="128" y="60" width="144" height="14" fill="${W.laut}"/><path d="M62 78Q200 100 338 78" fill="none" stroke="#C99A4F" stroke-width="4"/>`;
  },
  masker() {
    return `<rect x="118" y="112" width="164" height="72" rx="34" fill="${W.buih}" opacity="0.3"/>`
      + `<rect x="118" y="112" width="164" height="72" rx="34" fill="none" stroke="${W.toska}" stroke-width="11"/>`
      + `<path d="M283 146C300 146 302 120 304 92C306 70 316 60 330 58" fill="none" stroke="${W.senja}" stroke-width="12" stroke-linecap="round"/>`
      + `<path d="M118 140C100 140 94 146 92 156" fill="none" stroke="${W.toska}" stroke-width="9" stroke-linecap="round"/>`;
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
    return `<path d="M318 160L292 400" stroke="#9C6A3C" stroke-width="12" stroke-linecap="round"/><path d="M318 160C338 120 348 110 352 70C330 86 304 112 318 160Z" fill="#B8824C"/>`;
  },
  zzz() {
    return text('z', { x: 292, y: 110, family: 'fredoka', weight: 700, size: 34, fill: W.toska })
      + text('z', { x: 316, y: 80, family: 'fredoka', weight: 700, size: 46, fill: W.toska })
      + text('z', { x: 348, y: 44, family: 'fredoka', weight: 700, size: 58, fill: W.toska });
  },
  hati() {
    return `<path transform="translate(318 96) rotate(14)" d="M0 26C-14 12 -34 0 -34 -14A16 16 0 0 1 0 -14A16 16 0 0 1 34 -14C34 0 14 12 0 26Z" fill="${W.senja}"/>`;
  },
};

// Poses. Each returns the finished character on the 400 × 440 box.
export const POSE = {
  sapa: { nama: 'Menyapa', untuk: 'Sambutan, halaman utama, pesan WhatsApp pertama' },
  snorkel: { nama: 'Snorkeling', untuk: 'Kegiatan laut, tips karang' },
  perahu: { nama: 'Nelayan', untuk: 'Antar jemput, jadwal kapal' },
  tidur: { nama: 'Tidur', untuk: 'Gantungan pintu, selamat malam, kamar' },
  santai: { nama: 'Santai', untuk: 'Promo, hari libur, sore di dermaga' },
  papan: { nama: 'Bawa papan', untuk: 'Pengumuman, harga, selamat datang' },
};

export function maskot(pose = 'sapa', { label = ['Selamat', 'DATANG'], stiker = false } = {}) {
  let s = '';
  const kiriTurun = lengan({ dari: [138, 290], ke: [104, 352] });
  const kananTurun = lengan({ dari: [262, 290], ke: [296, 352] });
  switch (pose) {
    case 'sapa':
      s += ekor({ sisi: 1 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan() + kiriTurun;
      s += kepala({ ekspresi: 'senang', arah: [0, 0] });
      s += lengan({ dari: [262, 290], ke: [318, 214] });
      break;
    case 'snorkel':
      s += ekor({ sisi: -1 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan() + kiriTurun;
      s += kepala({ ekspresi: 'senang', arah: [0.2, -0.3] });
      s += AKS.masker();
      s += AKS.bintangLaut(326, 250) + lengan({ dari: [262, 290], ke: [314, 262] });
      break;
    case 'perahu':
      s += ekor({ sisi: -1 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan() + kiriTurun + AKS.dayung();
      s += kepala({ ekspresi: 'kedip', arah: [0, 0] });
      s += AKS.topi();
      s += lengan({ dari: [262, 290], ke: [306, 250] });
      break;
    case 'tidur':
      s += ekor({ sisi: 1, naik: 10 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan();
      s += lengan({ dari: [138, 290], ke: [150, 352] }) + lengan({ dari: [262, 290], ke: [250, 352] });
      s += kepala({ ekspresi: 'tidur', miring: 8 });
      s += AKS.zzz();
      break;
    case 'santai':
      s += ekor({ sisi: 1 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan() + kiriTurun;
      s += kepala({ ekspresi: 'cinta' });
      s += AKS.kelapa(334, 318) + lengan({ dari: [262, 290], ke: [306, 322] });
      break;
    case 'papan':
      s += ekor({ sisi: -1 }) + kaki(165, 410, -1) + kaki(235, 410, 1) + badan();
      s += kepala({ ekspresi: 'senang' });
      s += AKS.papan(label);
      s += lengan({ dari: [138, 290], ke: [112, 322] }) + lengan({ dari: [262, 290], ke: [288, 322] });
      break;
  }
  if (stiker) s = `<g stroke="${W.putih}" stroke-width="18" stroke-linejoin="round" stroke-linecap="round" fill="${W.putih}">${s.replace(/fill="[^"]*"/g, '').replace(/stroke="[^"]*"/g, '').replace(/stroke-width="[^"]*"/g, '').replace(/opacity="[^"]*"/g, '')}</g>` + s;
  return { svg: s, box: [0, 0, 400, 440] };
}

// Head only, for stickers and avatars. Box 80..320 × 40..260.
export const EKSPRESI = {
  senang: 'Senang', kedip: 'Kedip', tidur: 'Ngantuk', kaget: 'Kaget', cinta: 'Suka', tawa: 'Tertawa',
};
export function wajah(ekspresi = 'senang', { stiker = false } = {}) {
  let s = kepala({ ekspresi });
  if (ekspresi === 'cinta') s += AKS.hati();
  if (ekspresi === 'tidur') s += AKS.zzz().replace(/translate\(/g, 'translate(');
  if (stiker) s = `<g stroke="${W.putih}" stroke-width="18" stroke-linejoin="round" stroke-linecap="round" fill="${W.putih}">${s.replace(/fill="[^"]*"/g, '').replace(/stroke="[^"]*"/g, '').replace(/stroke-width="[^"]*"/g, '').replace(/opacity="[^"]*"/g, '')}</g>` + s;
  return { svg: s, box: [60, 20, 400, 270] };
}
