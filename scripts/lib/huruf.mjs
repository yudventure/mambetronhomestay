// Text set as outlines so print files never depend on installed fonts.
import fs from 'fs';
import path from 'path';
import opentype from 'opentype.js';
import { fileURLToPath } from 'url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../brand/font/desktop');
const cache = {};
const FILES = {
  // Londrina Solid for headings, it shares the tall, heavy, hand cut letters
  // of MAMBETRON in the logo. Regular for light weights, Black for the rest.
  judul: { 300: 'LondrinaSolid-Regular', 400: 'LondrinaSolid-Regular', 500: 'LondrinaSolid-Regular', 600: 'LondrinaSolid-Black', 700: 'LondrinaSolid-Black', 800: 'LondrinaSolid-Black', 900: 'LondrinaSolid-Black' },
  jakarta: {
    400: 'PlusJakartaSans-Regular', 500: 'PlusJakartaSans-Medium', 600: 'PlusJakartaSans-SemiBold',
    700: 'PlusJakartaSans-Bold', 800: 'PlusJakartaSans-ExtraBold',
    '400i': 'PlusJakartaSans-RegularItalic', '500i': 'PlusJakartaSans-MediumItalic',
  },
};

export function font(family, weight) {
  const key = `${family}-${weight}`;
  if (!cache[key]) {
    const buf = fs.readFileSync(path.join(DIR, FILES[family][weight] + '.ttf'));
    cache[key] = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  }
  return cache[key];
}

function layout(str, f, size, tracking) {
  const glyphs = f.stringToGlyphs(str);
  const scale = size / f.unitsPerEm;
  const track = tracking * size;
  const pos = [];
  let x = 0;
  glyphs.forEach((g, i) => {
    pos.push(x);
    x += g.advanceWidth * scale;
    if (i < glyphs.length - 1) x += f.getKerningValue(g, glyphs[i + 1]) * scale + track;
  });
  return { glyphs, pos, width: x };
}

export function measure(str, { family = 'jakarta', weight = 400, size = 10, tracking = 0 } = {}) {
  return layout(str, font(family, weight), size, tracking).width;
}

// Returns an SVG <path>. anchor is start | middle | end, y is the baseline.
export function text(str, { x = 0, y = 0, family = 'jakarta', weight = 400, size = 10, tracking = 0,
  anchor = 'start', fill = '#000', opacity, maxWidth } = {}) {
  const f = font(family, weight);
  let s = size;
  let l = layout(str, f, s, tracking);
  if (maxWidth && l.width > maxWidth) {
    s = (size * maxWidth) / l.width;
    l = layout(str, f, s, tracking);
  }
  const x0 = anchor === 'middle' ? x - l.width / 2 : anchor === 'end' ? x - l.width : x;
  const d = l.glyphs.map((g, i) => g.getPath(x0 + l.pos[i], y, s).toPathData(2)).join('');
  const op = opacity != null ? ` opacity="${opacity}"` : '';
  return `<path d="${d}" fill="${fill}"${op}/>`;
}

// Greedy word wrap. Returns lines of text.
export function wrap(str, width, opts) {
  const out = [];
  for (const para of str.split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (measure(t, opts) > width && line) {
        out.push(line);
        line = word;
      } else line = t;
    }
    out.push(line);
  }
  return out;
}

export function paragraph(str, { x = 0, y = 0, width, lineHeight = 1.4, ...opts }) {
  const lines = wrap(str, width, opts);
  const lh = (opts.size || 10) * lineHeight;
  return {
    svg: lines.map((ln, i) => text(ln, { ...opts, x, y: y + i * lh })).join(''),
    height: lines.length * lh,
    lines: lines.length,
  };
}

// Text along a circle. posisi atas reads clockwise over the top with letters
// pointing outward; bawah reads left to right under the bottom with letters
// pointing inward. r is the baseline radius.
export function melingkar(str, { cx, cy, r, posisi = 'atas', family = 'jakarta', weight = 700, size = 10, tracking = 0, fill = '#000' }) {
  const f = font(family, weight);
  const l = layout(str, f, size, tracking);
  const total = l.width / r;
  let out = '';
  l.glyphs.forEach((g, i) => {
    const adv = (g.advanceWidth * size) / f.unitsPerEm;
    const mid = (l.pos[i] + adv / 2) / r - total / 2;
    const d = g.getPath(-adv / 2, 0, size).toPathData(2);
    if (!d) return;
    let px, py, rot;
    if (posisi === 'atas') {
      px = cx + r * Math.sin(mid); py = cy - r * Math.cos(mid); rot = (mid * 180) / Math.PI;
    } else {
      px = cx + r * Math.sin(mid); py = cy + r * Math.cos(mid); rot = (-mid * 180) / Math.PI;
    }
    out += `<path transform="translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${rot.toFixed(3)})" d="${d}" fill="${fill}"/>`;
  });
  return out;
}
