// Brand guide page (brand/panduan-merek.html) and the preview images it uses.
import * as L from '../lib/logo.mjs';
import * as A from '../lib/seni.mjs';
import { W, PALET, rgb, cmyk } from '../lib/palet.mjs';
import { doc, rect } from '../lib/tata.mjs';
import { png, simpan, buka } from '../lib/render.mjs';
import { varian } from './logo.mjs';
import { halaman } from './panduan-html.mjs';

export default async function ({ out, K, ROOT }) {
  // graphic element previews
  await png(doc(1600, 640, A.lanskap({ w: 1600, h: 640, horizon: 0.66, seed: 11 })), out('panduan/elemen-ilustrasi.png'));
  await png(doc(800, 640, A.pola({ w: 800, h: 640, tile: 160 })), out('panduan/elemen-pola.png'));
  const nama = Object.keys(A.IKON);
  let ik = rect(0, 0, 800, 640, W.buih);
  nama.forEach((k, i) => {
    const x = 50 + (i % 6) * 120, y = 50 + Math.floor(i / 6) * 180;
    ik += `<circle cx="${x + 50}" cy="${y + 50}" r="50" fill="${W.putih}"/>` + A.ikon(k, { x: x + 20, y: y + 20, size: 60, color: W.laut, stroke: 1.8 });
  });
  await png(doc(800, 640, ik), out('panduan/elemen-ikon.png'));
  await png(doc(800, 640, rect(0, 0, 800, 640, W.putih) + A.ekor({ x: 150, y: 400, R: 110, len: 3.2, color: W.biru })), out('panduan/elemen-ekor.png'));

  // screenshots of the sample website page
  const b = await buka();
  for (const [w, f] of [[1280, 'contoh-website.png'], [390, 'contoh-website-ponsel.png']]) {
    const p = await b.newPage({ viewport: { width: w, height: w > 500 ? 860 : 780 }, deviceScaleFactor: w > 500 ? 1 : 2 });
    await p.goto('file://' + out('web/contoh-halaman.html'));
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: out('panduan/' + f) });
    await p.close();
  }

  const warna = PALET.map((p) => ({ ...p, rgb: rgb(p.hex).join(' '), cmyk: cmyk(p.hex).join(' ') }));
  const isi = halaman({ K, warna, logo: varian().map(([n, , bg]) => [n, bg]) });
  // the published artifact gets its own document skeleton, the repo copy needs one
  simpan(ROOT + '/build-cache/panduan-merek.html', isi);
  const i = isi.indexOf('<header class="pembuka">');
  simpan(out('panduan-merek.html'), `<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${isi.slice(0, i)}</head>\n<body>\n${isi.slice(i)}</body>\n</html>\n`);
}
