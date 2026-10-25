// Chromium rendering of SVG documents to PNG and PDF.
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const FONT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../brand/font/web');
let browser;
export async function buka() {
  browser = browser || (await chromium.launch());
  return browser;
}
export async function tutup() {
  if (browser) await browser.close();
  browser = null;
}

function dims(svg) {
  const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  return { w: vb[2], h: vb[3] };
}

// PNG at a pixel width. Transparent unless the SVG paints a background.
export async function png(svg, file, { width, height, scale = 1, jpeg = false } = {}) {
  const { w, h } = dims(svg);
  const pw = Math.round(width || (height ? (height * w) / h : w));
  const ph = Math.round(height || (pw * h) / w);
  const b = await buka();
  const p = await b.newPage({ viewport: { width: pw, height: ph }, deviceScaleFactor: scale });
  const inner = svg.replace(/<svg([^>]*?)\swidth="[^"]*"\sheight="[^"]*"/, `<svg$1 width="${pw}" height="${ph}"`);
  await p.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${inner}</body></html>`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await p.screenshot({ path: file, omitBackground: !jpeg, type: jpeg ? 'jpeg' : 'png', quality: jpeg ? 88 : undefined, clip: { x: 0, y: 0, width: pw, height: ph } });
  await p.close();
}

// Vector PDF at the physical size given in millimetres.
export async function pdf(svg, file, { mmW, mmH }) {
  const b = await buka();
  const p = await b.newPage();
  const inner = svg.replace(/<svg([^>]*?)\swidth="[^"]*"\sheight="[^"]*"/, `<svg$1 width="${mmW}mm" height="${mmH}mm"`);
  await p.setContent(`<!doctype html><html><head><style>@page{size:${mmW}mm ${mmH}mm;margin:0}html,body{margin:0}svg{display:block}</style></head><body>${inner}</body></html>`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await p.pdf({ path: file, width: `${mmW}mm`, height: `${mmH}mm`, printBackground: true, pageRanges: '1' });
  await p.close();
}

// Render arbitrary HTML (brand guide previews etc.).
export async function htmlPng(html, file, { width, height, scale = 1, full = false } = {}) {
  const b = await buka();
  const p = await b.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await p.setContent(html, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await p.screenshot({ path: file, fullPage: full });
  await p.close();
}

export function simpan(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

export { FONT_DIR };
