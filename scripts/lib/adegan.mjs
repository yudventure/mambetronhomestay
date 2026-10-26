// Wide scenes for the booking website: a stilt hut over the water with its
// jetty, two palms holding a hammock on a sand spit, and karst islets on the
// horizon. They stand in for photos until the owner uploads real ones.
import { W } from './palet.mjs';
import { acak, pulau } from './seni.mjs';

const f = (n) => +n.toFixed(2);

export const WAKTU = {
  senja: {
    langit: [[0, '#082F3B'], [0.42, '#145467'], [0.74, '#C9805F'], [0.9, '#F2AE78'], [1, '#F8D49B']],
    matahari: '#FCE6B8', cahaya: W.senja, bintang: true,
    jauh: '#2F6C7C', dekat: '#124656',
    laut: [[0, '#D99A70'], [0.08, '#3A7585'], [0.4, '#0F4453'], [1, '#05212B']],
    kilau: '#F9D8A0',
    tiang: '#06242E', dinding: '#0A3340', atap: '#06242E', jendela: '#FFC56E', lampu: true,
    pantai: '#0B3440', pohon: '#05212A',
  },
  siang: {
    langit: [[0, '#A8DDE7'], [1, '#E8F6F8']],
    matahari: '#FFF3D2', cahaya: null, bintang: false,
    jauh: '#76C2D0', dekat: '#2E8A9C',
    laut: [[0, '#5CC1D3'], [0.12, W.biru], [0.6, '#036A80'], [1, W.laut]],
    kilau: '#FFFFFF',
    tiang: W.laut, dinding: W.pasir, atap: '#D9622A', jendela: W.laut, lampu: false,
    pantai: W.pasir, pohon: W.laut,
  },
  pagi: {
    langit: [[0, '#F9DDB0'], [1, '#FDF1D8']],
    matahari: W.senja, cahaya: '#F7B98A', bintang: false,
    jauh: '#7FBFCB', dekat: '#2C7F91',
    laut: [[0, '#8ACBD6'], [0.14, W.biru], [0.6, '#036A80'], [1, W.laut]],
    kilau: '#FFFFFF',
    tiang: W.laut, dinding: '#FFF6E2', atap: '#D9622A', jendela: W.laut, lampu: false,
    pantai: W.pasir, pohon: W.laut,
  },
};

let uid = 0;
const stops = (s) => s.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');

// Stilt hut with a veranda, centred on x with its posts standing in the
// water at y. One unit is s pixels, the hut is about 280 units wide.
function pondok(x, y, s, P, jetiKiri = 420) {
  const X = (v) => f(x + v * s), Y = (v) => f(y + v * s), S = (v) => f(v * s);
  const r = (x0, y0, x1, y1, fill, extra = '') => `<rect x="${X(x0)}" y="${Y(y0)}" width="${S(x1 - x0)}" height="${S(y1 - y0)}" fill="${fill}"${extra}/>`;
  let g = '';
  // jetty to the left, a step lower than the hut deck
  for (let px = -150; px >= -jetiKiri; px -= 62) g += r(px - 3, -44, px + 3, 4, P.tiang);
  g += r(-jetiKiri - 10, -50, -132, -43, P.tiang);
  // posts and deck
  for (const px of [-118, -60, 0, 60, 118]) g += r(px - 4, -76, px + 4, 4, P.tiang);
  g += r(-142, -84, 142, -75, P.tiang);
  // veranda rail outside the walls
  g += r(-142, -112, -100, -108, P.tiang) + r(100, -112, 142, -108, P.tiang);
  for (const px of [-139, -128, -117, -106, 103, 114, 125, 136]) g += r(px, -112, px + 3, -84, P.tiang);
  // walls, door and windows
  g += r(-100, -178, 100, -84, P.dinding);
  const terang = P.lampu ? ` filter="url(#glow${uid})"` : '';
  g += r(-17, -150, 17, -84, P.jendela, terang);
  g += r(-80, -150, -40, -118, P.jendela, terang) + r(40, -150, 80, -118, P.jendela, terang);
  if (!P.lampu) {
    // window bars in daylight
    g += r(-61, -150, -59, -118, P.dinding) + r(59, -150, 61, -118, P.dinding);
  }
  // hipped thatch roof with a little sag
  g += `<path d="M${X(-152)} ${Y(-166)}Q${X(-110)} ${Y(-170)} ${X(-70)} ${Y(-252)}Q${X(0)} ${Y(-258)} ${X(70)} ${Y(-252)}Q${X(110)} ${Y(-170)} ${X(152)} ${Y(-166)}Q${X(0)} ${Y(-178)} ${X(-152)} ${Y(-166)}Z" fill="${P.atap}"/>`;
  if (!P.lampu) {
    // thatch rows
    for (const t of [0.35, 0.65]) {
      const yy = -252 + (86 * t);
      const half = 70 + 82 * t;
      g += `<path d="M${X(-half)} ${Y(yy)}Q${X(0)} ${Y(yy - 5)} ${X(half)} ${Y(yy)}" fill="none" stroke="#B94F1F" stroke-width="${S(3)}" stroke-linecap="round"/>`;
    }
  }
  if (P.lampu) {
    // lantern on the veranda and warm light on the water
    g += `<circle cx="${X(-122)}" cy="${Y(-130)}" r="${S(42)}" fill="url(#lampu${uid})"/>`;
    g += `<circle cx="${X(-122)}" cy="${Y(-130)}" r="${S(5)}" fill="#FFE2A8"/>`;
    const rr = acak(9);
    for (let i = 0; i < 9; i++) {
      const lx = [-60, 0, 60][i % 3] + (rr() - 0.5) * 30;
      const ww = 18 + rr() * 30;
      g += `<rect x="${X(lx - ww / 2)}" y="${Y(14 + i * 9)}" width="${S(ww)}" height="${S(3)}" rx="${S(1.5)}" fill="${P.jendela}" opacity="${f(0.55 - i * 0.05)}"/>`;
    }
  }
  return g;
}

// Coconut palm growing from (x, y), height h, leaning by lean (fraction of h).
function palem(x, y, h, lean, warna, seed = 3) {
  const r = acak(seed);
  const tx = x + lean * h, ty = y - h;
  const b0 = h * 0.045, b1 = h * 0.022;
  const cx = x + lean * h * 0.1 - h * 0.08 * Math.sign(lean || 1), cy = y - h * 0.5;
  let g = `<path d="M${f(x - b0)} ${f(y)}Q${f(cx - b0)} ${f(cy)} ${f(tx - b1)} ${f(ty)}L${f(tx + b1)} ${f(ty)}Q${f(cx + b0)} ${f(cy)} ${f(x + b0)} ${f(y)}Z" fill="${warna}"/>`;
  const sudut = [-172, -146, -118, -88, -58, -30, -4, 22];
  for (const a0 of sudut) {
    const a = ((a0 + (r() - 0.5) * 10) * Math.PI) / 180;
    const L = h * (0.36 + r() * 0.1);
    const ex = tx + Math.cos(a) * L;
    const ey = ty + Math.sin(a) * L + L * 0.38;
    const mx = tx + Math.cos(a) * L * 0.55, my = ty + Math.sin(a) * L * 0.55 - L * 0.06;
    const nx = -(ey - ty), ny = ex - tx;
    const nl = Math.hypot(nx, ny) || 1;
    const lw = L * 0.13;
    g += `<path d="M${f(tx)} ${f(ty)}Q${f(mx + (nx / nl) * lw)} ${f(my + (ny / nl) * lw)} ${f(ex)} ${f(ey)}Q${f(mx - (nx / nl) * lw * 0.35)} ${f(my - (ny / nl) * lw * 0.35)} ${f(tx)} ${f(ty)}Z" fill="${warna}"/>`;
  }
  for (const [dx, dy] of [[-0.02, 0.02], [0.015, 0.025], [0, 0.04]]) g += `<circle cx="${f(tx + dx * h)}" cy="${f(ty + dy * h)}" r="${f(h * 0.022)}" fill="${warna}"/>`;
  return { svg: g, titik: (t) => ({ x: x + (tx - x) * t + (cx - (x + tx) / 2) * 4 * t * (1 - t) * 0.5, y: y - h * t }) };
}

export function adegan({ w, h, waktu = 'senja', hz = 0.6, matahariX = 0.4, pondokX = 0.6, pondokY = 0.86, skala = null, pantaiX = 0.8, palem: pohon = null, seed = 21, susunan = null }) {
  const P = WAKTU[waktu];
  const r = acak(seed);
  uid++;
  const hy = h * hz;
  const s = skala ?? h / 1080;
  const id = (n) => `${n}${uid}`;
  let defs = `<linearGradient id="${id('langit')}" x1="0" y1="0" x2="0" y2="1">${stops(P.langit)}</linearGradient>`;
  defs += `<linearGradient id="${id('laut')}" x1="0" y1="0" x2="0" y2="1">${stops(P.laut)}</linearGradient>`;
  if (P.cahaya) defs += `<radialGradient id="${id('sinar')}"><stop offset="0" stop-color="${P.cahaya}" stop-opacity="0.6"/><stop offset="1" stop-color="${P.cahaya}" stop-opacity="0"/></radialGradient>`;
  if (P.lampu) {
    defs += `<radialGradient id="${id('lampu')}"><stop offset="0" stop-color="#FFD58A" stop-opacity="0.75"/><stop offset="1" stop-color="#FFD58A" stop-opacity="0"/></radialGradient>`;
    defs += `<filter id="${id('glow')}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${f(6 * s)}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  }
  let g = `<rect width="${w}" height="${f(hy + 2)}" fill="url(#${id('langit')})"/>`;
  if (P.bintang) {
    for (let i = 0; i < Math.round((70 * w) / 1920 + 20); i++) {
      const bx = r() * w, by = r() * hy * 0.55;
      g += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f((0.8 + r() * 1.4) * s)}" fill="#FFFFFF" opacity="${f(0.25 + r() * 0.6 * (1 - by / (hy * 0.55)))}"/>`;
    }
  }
  const sr = 80 * s;
  const sx = w * matahariX;
  const sy = P.bintang ? hy - sr * 0.35 : hy - 320 * s;
  if (P.cahaya) g += `<ellipse cx="${f(sx)}" cy="${f(hy)}" rx="${f(Math.max(w * 0.45, 800 * s))}" ry="${f(460 * s)}" fill="url(#${id('sinar')})"/>`;
  g += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr)}" fill="${P.matahari}"/>`;

  // islets on the horizon as [x, width, height, near] with sizes in units,
  // the far ones lighter
  const plan = susunan || [
    [0.03, 300, 250, 1], [0.13, 150, 120, 1], [0.24, 110, 80, 0], [0.29, 70, 50, 0],
    [0.55, 160, 105, 0], [0.62, 80, 55, 0], [0.88, 200, 150, 0], [0.98, 220, 190, 1],
  ];
  for (const [px, pw, ph, lapis] of plan.filter((p) => !p[3]).concat(plan.filter((p) => p[3]))) {
    g += pulau({ x: w * px, y: hy + (lapis ? 12 : 3) * s, w: pw * s, h: ph * s, seed: Math.floor(r() * 1000), fill: lapis ? P.dekat : P.jauh, lean: (r() - 0.5) * 0.1 });
  }

  g += `<rect y="${f(hy)}" width="${w}" height="${f(h - hy)}" fill="url(#${id('laut')})"/>`;
  // sun path on the water
  for (let i = 0; i < 18; i++) {
    const yy = hy + 12 * s + i * 20 * s * (1 + i * 0.08);
    if (yy > h) break;
    const ww = sr * (1.4 - i * 0.05) * (0.5 + r() * 0.8);
    g += `<rect x="${f(sx - ww / 2 + (r() - 0.5) * sr * 0.6)}" y="${f(yy)}" width="${f(ww)}" height="${f(Math.max(1.5, 4 * s))}" rx="${f(2 * s)}" fill="${P.kilau}" opacity="${f(Math.max(0.12, 0.7 - i * 0.04))}"/>`;
  }
  // light ripples across the sea
  for (let i = 0; i < Math.round((14 * w) / 1920 + 4); i++) {
    const yy = hy + 60 * s + r() * (h - hy) * 0.85;
    const ww = (40 + r() * 90) * s;
    g += `<rect x="${f(r() * w)}" y="${f(yy)}" width="${f(ww)}" height="${f(Math.max(1.5, 3 * s))}" rx="${f(1.5 * s)}" fill="${P.kilau}" opacity="${f(P.bintang ? 0.12 : 0.3)}"/>`;
  }

  // sand spit with two palms and a hammock, then the hut in front
  const py = h - 70 * s;
  const px0 = w * pantaiX;
  g += `<path d="M${f(px0 - 60 * s)} ${f(h + 2)}Q${f(px0 + 40 * s)} ${f(py - 36 * s)} ${f(px0 + 320 * s)} ${f(py - 46 * s)}L${f(w + 2)} ${f(py - 52 * s)}L${f(w + 2)} ${f(h + 2)}Z" fill="${P.pantai}"/>`;
  const [pa, pb] = pohon || [[pantaiX + 0.06, 0.18, 470], [pantaiX + 0.17, -0.12, 520]];
  const a = palem(w * pa[0], py - 40 * s, pa[2] * s, pa[1], P.pohon, seed + 1);
  const b = palem(w * pb[0], py - 48 * s, pb[2] * s, pb[1], P.pohon, seed + 2);
  const ta = a.titik(0.24), tb = b.titik(0.22);
  const sag = 70 * s;
  const mx = (ta.x + tb.x) / 2, my = (ta.y + tb.y) / 2;
  g += a.svg + b.svg;
  g += `<path d="M${f(ta.x)} ${f(ta.y)}Q${f(mx)} ${f(my + sag * 1.5)} ${f(tb.x)} ${f(tb.y)}Q${f(mx)} ${f(my + sag * 2.25)} ${f(ta.x)} ${f(ta.y)}Z" fill="${P.lampu ? P.pohon : W.senja}"/>`;
  g += pondok(w * pondokX, h * pondokY, s * 1.25, P);

  return `<defs>${defs}</defs>${g}`;
}
