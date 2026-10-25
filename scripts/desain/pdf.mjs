// Printable brand guide, A4 landscape, written to brand/panduan-merek.pdf.
import path from 'path';
import { PALET, W, rgb, cmyk } from '../lib/palet.mjs';
import { buka, simpan } from '../lib/render.mjs';
import { varian } from './logo.mjs';
import { LOGO_INFO, SOSIAL, SOROTAN, MERCH, AMEN, PAPAN, POSE_INFO, WAJAH_INFO, ATURAN_MASKOT } from './panduan-html.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function cetak({ K, B }) {
  const img = (p, cls = '') => `<img src="${B}/${p}" class="${cls}" alt="">`;
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const logo = varian().map(([n, , bg]) => [n, bg]);
  const warna = PALET.map((p) => ({ ...p, rgb: rgb(p.hex).join(' '), cmyk: cmyk(p.hex).join(' ') }));
  const BAB = ['Cerita merek', 'Logo', 'Aturan logo', 'Warna', 'Huruf', 'Elemen grafis', 'Maskot', 'Stiker maskot', 'Website', 'Media sosial', 'Kaos dan jaket', 'Amenities', 'Papan dan banner', 'Sebelum cetak'];
  let n = 1;
  const hal = (bab, judul, isi, kelas = '') => `<section class="hal ${kelas}"><header><span class="bab">${bab}</span><span class="nomor">${++n}</span></header><h2>${judul}</h2>${isi}<footer>Mambetron Homestay · Panduan merek</footer></section>`;

  const fig = (src, t, d, style = '') => `<figure${style ? ` style="${style}"` : ''}>${img(src)}<figcaption><b>${t}</b>${d ? `<span>${d}</span>` : ''}</figcaption></figure>`;

  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Panduan Merek Mambetron Homestay</title>
<link rel="stylesheet" href="${B}/font/web/fonts.css">
<style>
@page { size: 297mm 210mm; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Plus Jakarta Sans', sans-serif; color: ${W.hitam}; font-size: 10.5pt; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.hal { width: 297mm; height: 210mm; overflow: hidden; position: relative; padding: 14mm 16mm 12mm; page-break-after: always; break-after: page; background: #fff; display: flex; flex-direction: column; gap: 5mm; }
.hal:last-child { page-break-after: auto; break-after: auto; }
header { display: flex; justify-content: space-between; align-items: baseline; }
.bab { font-size: 8.5pt; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: ${W.toskaTua}; }
.nomor { font-size: 8.5pt; color: #7A8F94; font-variant-numeric: tabular-nums; }
footer { position: absolute; left: 16mm; bottom: 7mm; font-size: 7.5pt; color: #7A8F94; }
h1, h2, h3 { font-family: 'Fredoka', sans-serif; color: ${W.laut}; margin: 0; line-height: 1.1; }
h2 { font-size: 24pt; font-weight: 600; }
h3 { font-size: 13pt; font-weight: 600; }
p { margin: 0; max-width: 150mm; }
.redup { color: #4A6369; }
.intro { font-size: 11pt; }
img { max-width: 100%; height: auto; display: block; }
.kisi { display: grid; gap: 5mm; }
.k2 { grid-template-columns: repeat(2, 1fr); } .k3 { grid-template-columns: repeat(3, 1fr); } .k4 { grid-template-columns: repeat(4, 1fr); } .k6 { grid-template-columns: repeat(6, 1fr); }
figure { margin: 0; display: flex; flex-direction: column; gap: 2mm; min-width: 0; }
figure img { border-radius: 3mm; width: 100%; }
figcaption { font-size: 8.5pt; line-height: 1.35; display: flex; flex-direction: column; }
figcaption b { font-weight: 700; } figcaption span { color: #4A6369; }
.ubin { border-radius: 3mm; position: relative; aspect-ratio: 4 / 3; overflow: hidden; }
.ubin img { position: absolute; inset: 4mm; width: calc(100% - 8mm); height: calc(100% - 8mm); object-fit: contain; }
.ubin.penuh img { inset: 0; width: 100%; height: 100%; object-fit: cover; }
.kartu { background: ${W.buih}; border-radius: 3mm; padding: 5mm; display: flex; flex-direction: column; gap: 1.5mm; }
.kartu p { font-size: 9.5pt; }
.label { font-size: 8pt; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${W.toskaTua}; }
.isi { display: flex; flex-direction: column; gap: 5mm; flex: 1; min-height: 0; }

.sampul { background: ${W.buih}; padding: 0; }
.sampul .atas { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 10mm; padding: 22mm 20mm 0; flex: 1; }
.sampul .judul { display: flex; flex-direction: column; gap: 4mm; }
.sampul h1 { font-size: 44pt; font-weight: 700; }
.sampul .slogan { display: inline-flex; align-self: flex-start; background: ${W.pasir}; color: ${W.laut}; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 12pt; padding: 2mm 5mm; border-radius: 99mm; }
.sampul .logo { background: #fff; border-radius: 8mm; padding: 10mm; }
.sampul .laut { position: relative; height: 62mm; }
.sampul .laut img.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sampul .laut img.mambe { position: absolute; right: 24mm; bottom: 10mm; height: 56mm; width: auto; }
.sampul footer { display: none; }

.daftar-bab { columns: 2; column-gap: 10mm; font-size: 10pt; }
.daftar-bab div { display: flex; justify-content: space-between; padding: 1.2mm 0; break-inside: avoid; }
.daftar-bab span:last-child { color: #7A8F94; font-variant-numeric: tabular-nums; }

.warna { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4mm; }
.cw { border-radius: 3mm; overflow: hidden; background: ${W.buih}; display: flex; flex-direction: column; }
.cw .cat { height: 28mm; display: flex; align-items: flex-end; padding: 3mm; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 11pt; }
.cw .nilai { padding: 3mm; font-size: 8pt; display: flex; flex-direction: column; gap: 1mm; }
.cw .nilai b { font-size: 7pt; letter-spacing: 0.14em; color: #4A6369; }
.cw .nilai code { font-family: ui-monospace, Menlo, monospace; font-size: 8pt; }
.pasangan { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; }
.pasangan div { border-radius: 3mm; padding: 4mm; min-height: 22mm; display: flex; flex-direction: column; justify-content: space-between; font-weight: 600; font-size: 9pt; }
.pasangan b { font-family: 'Fredoka', sans-serif; font-size: 16pt; font-weight: 600; }

.huruf { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
.peraga { font-size: 26pt; line-height: 1.05; color: ${W.laut}; }
.abjad { font-size: 11pt; overflow-wrap: anywhere; }
.berat { display: flex; flex-wrap: wrap; gap: 2mm 5mm; font-size: 10pt; }
.skala div { display: grid; grid-template-columns: 34mm 1fr; align-items: baseline; gap: 4mm; padding: 1.5mm 0; }
.skala small { color: #7A8F94; font-size: 7.5pt; }
pre { margin: 0; background: ${W.laut}; color: #EAF4F3; border-radius: 3mm; padding: 4mm; font-family: ui-monospace, Menlo, monospace; font-size: 8pt; line-height: 1.5; white-space: pre-wrap; }

.silang { position: absolute; top: 2mm; right: 2mm; width: 7mm; height: 7mm; border-radius: 50%; background: #D93A3A; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 9pt; }
.salah { position: relative; }
.salah .ubin { background: #fff; border: 0.3mm solid #D9E6E4; overflow: hidden; }

.cek { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
.cek div { background: ${W.buih}; border-radius: 3mm; padding: 3.5mm 4mm; font-size: 9.5pt; display: flex; flex-direction: column; }
.cek b { font-weight: 700; }
table { border-collapse: collapse; width: 100%; font-size: 9pt; }
td { padding: 1.8mm 2mm; vertical-align: top; }
td:first-child { font-weight: 700; width: 38mm; }
tr:nth-child(odd) td { background: ${W.buih}; }
tr td:first-child { border-radius: 2mm 0 0 2mm; } tr td:last-child { border-radius: 0 2mm 2mm 0; }
.t44 figure img { height: 44mm; object-fit: cover; } .t56 figure img { height: 56mm; object-fit: cover; } .t60 figure img { height: 60mm; object-fit: cover; }
.baris { display: flex; gap: 5mm; align-items: flex-start; } .baris figure { flex: none; } .baris figure img { width: auto; }
.bulat { aspect-ratio: 1; border-radius: 50%; overflow: hidden; } .bulat img { width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
</style></head><body>

<section class="hal sampul">
  <div class="atas">
    <div class="judul">
      <span class="label">Panduan merek</span>
      <h1>Mambetron Homestay</h1>
      <p class="intro">Logo, warna, huruf, maskot, dan semua penerapannya, dari website sampai banner di pelabuhan.</p>
      <span class="slogan">${esc(K.slogan)}</span>
      <p class="redup" style="font-size:9pt">Versi 1 · ${tgl}</p>
    </div>
    <div class="logo">${img('logo/png/mambetron-logo-utama-hitam.png')}</div>
  </div>
  <div class="laut">${img('panduan/elemen-ilustrasi.png', 'bg')}${img('maskot/pose/mambe-sapa.png', 'mambe')}</div>
</section>

${hal('Daftar isi', 'Isi panduan ini', `<div class="isi"><div class="daftar-bab">${BAB.map((b, i) => `<div><span>${b}</span><span>${i + 3}</span></div>`).join('')}</div>
<div class="kisi k3">
  <div class="kartu"><span class="label">Berkas</span><p>Semua berkas asli ada di folder <b>brand</b>. Logo dan berkas cetak tersedia dalam SVG dan PDF, sudah dalam ukuran cetak dan hurufnya sudah diubah menjadi kurva.</p></div>
  <div class="kartu"><span class="label">Untuk percetakan</span><p>Kirim berkas PDF dari folder <b>cetak</b>. Garis magenta adalah garis potong, tidak dicetak. Nilai CMYK adalah perkiraan, minta contoh cetak dulu.</p></div>
  <div class="kartu"><span class="label">Untuk desainer</span><p>Pakai SVG, font di folder <b>font/desktop</b>, dan warna di bab Warna. Panduan HTML dengan tombol salin warna ada di <b>brand/panduan-merek.html</b>.</p></div>
</div></div>`)}

${hal('Cerita merek', 'Kenapa kuskus', `<div class="isi"><p class="intro">Kuskus adalah hewan berkantung dari hutan Papua. Ia aktif di malam hari, bergerak pelan, dan memakai ekornya yang melingkar untuk berpegangan. Di logo, kuskus memeluk papan nama dan ekornya melingkar seperti ombak. Pelukan itu yang ingin dirasakan setiap tamu.</p>
<div class="kisi k3">
  <div class="kartu"><h3>Hangat</h3><p>Bicara seperti tuan rumah yang menyambut keluarga. Sapa dengan nama, tawarkan bantuan, jangan kaku.</p></div>
  <div class="kartu"><h3>Pelan</h3><p>Seperti kuskus, kami tidak terburu-buru. Kalimat pendek, ruang kosong yang lega, gambar yang tenang.</p></div>
  <div class="kartu"><h3>Dekat dengan alam</h3><p>Laut, karang, dan pulau karst adalah halaman rumah kami. Warna dan ilustrasi diambil dari sana.</p></div>
</div>
<div class="kisi k2" style="flex:1;min-height:0">
  <div class="ubin" style="background:${W.buih};aspect-ratio:auto;height:80mm">${img('logo/png/mambetron-logo-utama-hitam.png')}</div>
  <div class="ubin" style="background:${W.laut};aspect-ratio:auto;height:80mm">${img('logo/png/mambetron-logo-utama-putih.png')}</div>
</div></div>`)}

${hal('Logo', 'Satu kuskus, beberapa bentuk', `<p>Logo asli sudah diubah menjadi vektor sehingga tajam di ukuran berapa pun. Pilih versi sesuai latar dan cara cetaknya. Bentuk dan susunan logo tidak diubah.</p>
<div class="kisi k4" style="gap:4mm">${logo.map(([nm, bg]) => `<figure><div class="ubin" style="background:${bg};aspect-ratio:2/1;padding:3mm">${img(`logo/png/kecil/${nm}-500.png`)}</div><figcaption><b>${LOGO_INFO[nm][0]}</b><span>${LOGO_INFO[nm][1]}</span></figcaption></figure>`).join('')}</div>`)}

${hal('Aturan logo', 'Ruang kosong, ukuran terkecil, larangan', `<div class="kisi k3">
  <div class="kartu"><span class="label">Ruang kosong</span><h3>Setinggi huruf M</h3><p>Beri ruang kosong di sekeliling logo paling sedikit setinggi huruf M pada tulisan Mambetron. Jangan ada teks atau gambar lain di dalamnya.</p></div>
  <div class="kartu"><span class="label">Ukuran terkecil</span><h3>25 mm · 10 mm · 8 mm</h3><p>Logo utama 25 mm (120 px), logo horizontal tinggi 10 mm (32 px), ikon bulat 8 mm (16 px). Lebih kecil dari itu mata kuskus tidak terbaca.</p></div>
  <div class="kartu"><span class="label">Latar</span><h3>Pilih versi, bukan ubah warna</h3><p>Latar terang pakai versi hitam atau Laut Dalam. Latar gelap pakai versi putih. Di atas foto pakai versi stiker.</p></div>
</div>
<h3>Yang tidak boleh dilakukan</h3>
<div class="kisi k4">
  ${[['transform:scaleX(1.45)', 'Ditarik atau dipampatkan'], ['transform:rotate(-14deg)', 'Dimiringkan'], ['filter:hue-rotate(160deg) saturate(6) brightness(1.4)', 'Diganti warna di luar palet'], ['', 'Logo hitam di atas latar gelap']].map(([st, cap], i) => `<figure class="salah"><div class="ubin" style="${i === 3 ? `background:${W.laut};border:0` : ''}"><img src="${B}/logo/png/kecil/mambetron-logo-utama-hitam-500.png" style="${st}" alt=""></div><span class="silang">×</span><figcaption><b>${cap}</b></figcaption></figure>`).join('')}
</div>`)}

${hal('Warna', 'Diambil dari laut dan senja Raja Ampat', `<p>Hitam kuskus tetap warna utama logo. Lima warna lain datang dari laut dalam, laguna, pasir, buih, dan langit sore. Nilai CMYK adalah perkiraan, minta percetakan mencetak contoh lebih dulu.</p>
<div class="warna">${warna.map((w) => `<div class="cw"><div class="cat" style="background:${w.hex};color:${['hitam', 'laut', 'toska'].includes(w.kunci) ? '#fff' : W.laut}">${w.nama}</div><div class="nilai"><span style="color:#4A6369">${w.peran}</span><b>HEX</b><code>${w.hex}</code><b>RGB</b><code>${w.rgb}</code><b>CMYK</b><code>${w.cmyk}</code></div></div>`).join('')}</div>
<div class="pasangan">
  <div style="background:${W.laut};color:#fff"><b>Aa</b>Putih di atas Laut Dalam</div>
  <div style="background:${W.pasir};color:${W.hitam}"><b>Aa</b>Hitam di atas Pasir Pantai</div>
  <div style="background:${W.buih};color:${W.laut}"><b>Aa</b>Laut Dalam di atas Buih Laut</div>
  <div style="background:${W.senja};color:${W.hitam}"><b>Aa</b>Hitam di atas Jingga Senja</div>
</div>
<p class="redup">Jingga Senja khusus untuk tombol pesan dan sorotan kecil. Untuk teks dan tautan berwarna toska di latar putih, pakai toska tua ${W.toskaTua} supaya tetap mudah dibaca.</p>`)}

${hal('Huruf', 'Dua huruf untuk website dan cetakan', `<p>Tulisan Mambetron di logo memakai bentuk Fredoka Bold, karena itu judul memakai Fredoka. Teks panjang memakai Plus Jakarta Sans, huruf buatan Tokotype dari Jakarta yang jelas dibaca di layar ponsel. Keduanya berlisensi SIL Open Font License, bebas dipakai untuk usaha.</p>
<div class="huruf">
  <div class="kartu"><span class="label">Judul</span><div class="peraga" style="font-family:Fredoka;font-weight:700">Pelukan hangat dari Raja Ampat</div><div class="abjad" style="font-family:Fredoka;font-weight:500">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789</div><div class="berat" style="font-family:Fredoka"><span style="font-weight:500">Fredoka Medium 500</span><span style="font-weight:600">SemiBold 600</span><span style="font-weight:700">Bold 700</span></div></div>
  <div class="kartu"><span class="label">Teks, menu, label</span><p style="font-size:12pt">Tidur ditemani suara ombak, makan masakan rumah tiga kali sehari, lalu snorkeling di karang depan homestay. Kami jemput Anda di pelabuhan.</p><div class="abjad">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789</div><div class="berat"><span>Plus Jakarta Sans Regular 400</span><span style="font-weight:600">SemiBold 600</span><span style="font-weight:800">ExtraBold 800</span><span class="label">Label kapital</span></div></div>
</div>
<div class="kisi k2">
  <div class="skala kartu">
    <div><small>Judul 1 · 68 / 40 px</small><span style="font-family:Fredoka;font-weight:700;font-size:26pt;line-height:1;color:${W.laut}">Selamat datang</span></div>
    <div><small>Judul 2 · 44 / 32 px</small><span style="font-family:Fredoka;font-weight:600;font-size:18pt;color:${W.laut}">Kamar tepi laut</span></div>
    <div><small>Judul 3 · 32 / 24 px</small><span style="font-family:Fredoka;font-weight:600;font-size:14pt;color:${W.laut}">Makan tiga kali sehari</span></div>
    <div><small>Teks · 17 px</small><span>Perahu kami menunggu di pelabuhan sesuai jadwal kapal Anda.</span></div>
    <div><small>Label · 13 px</small><span class="label">Homestay di Raja Ampat</span></div>
  </div>
  <div class="kartu"><h3>Cara pakai</h3><p>Website memakai berkas di <b>brand/font/web</b> lewat <b>fonts.css</b> dan token di <b>brand/web/tokens.css</b>. Untuk CorelDRAW, Photoshop, atau Canva, pasang TTF dari <b>brand/font/desktop</b>.</p><pre>&lt;link rel="stylesheet" href="/font/web/fonts.css"&gt;
&lt;link rel="stylesheet" href="/web/tokens.css"&gt;
h1 { font-family: var(--mb-font-judul); }
body { font-family: var(--mb-font-teks); }</pre></div>
</div>`)}

${hal('Elemen grafis', 'Pulau karst, ekor ombak, ikon garis', `<p>Ilustrasi pulau karst berbentuk jamur meniru pulau-pulau kecil Raja Ampat. Motif ekor ombak diambil dari ekor kuskus di logo. Ikon garis dipakai untuk layanan dan petunjuk.</p>
<div class="kisi k3 t44" style="flex:1;min-height:0">
  ${fig('panduan/elemen-ilustrasi.png', 'Ilustrasi pulau karst', 'Latar banner, post, kartu, pengganti foto sementara', 'grid-column:1 / -1').replace('<img ', '<img style="height:58mm" ')}
  ${fig('panduan/elemen-ekor.png', 'Ekor ombak', 'Hiasan kecil di label dan kartu')}
  ${fig('panduan/elemen-pola.png', 'Pola', 'Pembungkus sabun, latar post, lapisan jaket')}
  ${fig('panduan/elemen-ikon.png', 'Ikon garis', 'Kamar, makan, snorkel, perahu, lokasi, WiFi')}
</div>`)}

${hal('Maskot', 'Kenalkan, Mambe', `<p>Mambe digambar dari kuskus Waigeo (<i>Spilocuscus papuensis</i>), kuskus berbintik yang hanya hidup di Raja Ampat. Cirinya ikut dibawa: bulu krem dengan bercak gelap, telinga mungil yang hampir tersembunyi, mata bulat besar berlingkar jingga, hidung dan tangan merah muda berjari panjang, serta ekor panjang yang menggulung dengan ujung tanpa bulu. Nama Mambe hanya usulan.</p>
<div class="kisi k6">${POSE_INFO.map(([k, t, d]) => `<figure><div class="ubin" style="background:${W.buih};aspect-ratio:1">${img(`maskot/pose/mambe-${k}.png`)}</div><figcaption><b>${t}</b><span>${d}</span></figcaption></figure>`).join('')}</div>
<div class="kisi k4">${ATURAN_MASKOT.map(([t, d]) => `<div class="kartu"><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>`)}

${hal('Stiker maskot', 'Ekspresi dan stiker WhatsApp', `<p>Dua belas stiker 512 × 512 px dalam format WebP ada di folder <b>brand/maskot/stiker-whatsapp</b>, masing-masing di bawah 100 KB. Masukkan ke aplikasi pembuat stiker, lalu bagikan ke tamu sebelum mereka berangkat.</p>
<div class="kisi k6">${WAJAH_INFO.map(([k, t]) => `<figure><div class="ubin" style="background:${W.laut};aspect-ratio:1">${img(`maskot/wajah/mambe-${k}.png`)}</div><figcaption style="align-items:center"><b>${t}</b></figcaption></figure>`).join('')}</div>
<div class="kisi k4 t56" style="flex:1;min-height:0">
  ${fig('amenities/mockup/gantungan-pintu.png', 'Gantungan pintu', 'Mambe tidur dan Mambe menyapa')}
  ${fig('sosial-media/post-tips-maskot.png', 'Post tips', 'Mambe snorkeling membawa tips karang')}
  ${fig('sosial-media/story-maskot.png', 'Story', 'Sapaan pagi dengan Mambe santai')}
  ${fig('papan-dan-banner/mockup/papan-jemput.png', 'Papan jemput', 'Mambe melambai ke tamu yang tiba')}
</div>`)}

${hal('Website', 'Logo, favicon, dan contoh halaman', `<p>Header memakai logo horizontal. Ikon kuskus muncul di tab browser, di layar utama ponsel, dan saat tautan dibagikan di WhatsApp. Berkas di <b>brand/web</b>, contoh halaman di <b>contoh-halaman.html</b>.</p>
<div class="baris" style="height:60mm">
  ${fig('panduan/contoh-website.png', 'Contoh halaman di desktop', 'brand/web/contoh-halaman.html').replace('<img ', '<img style="height:60mm" ')}
  ${fig('panduan/contoh-website-ponsel.png', 'Di ponsel', 'Lebar 390 px').replace('<img ', '<img style="height:60mm" ')}
  ${fig('web/og-image.png', 'Gambar bagikan', '1200 × 630 px, tampil saat tautan dikirim lewat WhatsApp').replace('<img ', '<img style="height:60mm" ')}
</div>
<div class="baris" style="margin-top:8mm">
  <figure><div class="ubin penuh" style="background:${W.buih};aspect-ratio:1;height:40mm">${img('web/icon-512.png')}</div><figcaption><b>Favicon dan ikon aplikasi</b></figcaption></figure>
  <div class="kartu" style="flex:1"><span class="label">Berkas di brand/web</span><p>favicon.ico, favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png, icon-maskable-512.png, site.webmanifest, og-image.png, logo-header.svg, logo-header-putih.svg, tokens.css, contoh-halaman.html</p></div>
</div>`)}

${hal('Media sosial', 'Instagram, Facebook, WhatsApp', `<p>Template disimpan sebagai SVG dan PNG di <b>brand/sosial-media</b>. Bagian berilustrasi laut adalah tempat foto, ganti dengan foto asli homestay. Ulasan tamu harus diisi ulasan sungguhan.</p>
<div class="kisi" style="grid-template-columns:repeat(8, 1fr)">
  ${SOSIAL.map(([nm, t, d]) => fig(`sosial-media/${nm}.png`, t, d)).join('')}
</div>
<div class="kisi k6" style="width:55%">
  ${SOROTAN.map((nm) => `<figure><div class="bulat"><img src="${B}/sosial-media/sorotan/sorotan-${nm}.png" alt=""></div><figcaption style="align-items:center"><b style="text-transform:capitalize">${nm}</b></figcaption></figure>`).join('')}
</div>`)}

${hal('Kaos dan jaket', 'Seragam staf dan suvenir tamu', `<p>Berkas cetak ada dalam PDF dan SVG ukuran asli, ditambah PNG 300 dpi untuk sablon DTF, di <b>brand/merchandise/cetak</b>. Ukuran untuk kaos M dan bisa disesuaikan.</p>
<div class="kisi k2 t56" style="flex:1;min-height:0">${MERCH.map(([nm, t, d]) => fig(`merchandise/mockup/${nm}.png`, t, d)).join('')}</div>`)}

${hal('Amenities', 'Yang tamu sentuh setiap hari', `<p>Berkas cetak di <b>brand/amenities/cetak</b>. Garis potong berwarna magenta hanya panduan pisau potong, bukan untuk dicetak.</p>
<div class="kisi k4 t44" style="flex:1;min-height:0">${AMEN.map(([nm, t, d]) => fig(`amenities/mockup/${nm}.png`, t, d)).join('')}<div class="kartu"><span class="label">Ukuran</span><p style="font-size:9pt">Handuk bordir 16 cm · Sabun 200 × 60 mm · Botol 60 × 80 mm · Kunci 50 mm · Pintu 90 × 230 mm · Kartu A6</p></div></div>`)}

${hal('Papan dan banner', 'Terlihat dari dermaga', `<p>Banner berdiri dan spanduk dibuat untuk pelabuhan tempat tamu tiba, papan nama dipasang di homestay. Huruf dibuat besar supaya terbaca dari beberapa meter. Kirim PDF dari <b>brand/papan-dan-banner/cetak</b> ke percetakan.</p>
<div class="kisi k2 t56" style="flex:1;min-height:0">${PAPAN.map(([nm, t, d]) => fig(`papan-dan-banner/mockup/${nm}.png`, t, d)).join('')}</div>`)}

${hal('Sebelum cetak', 'Yang perlu dilengkapi', `<div class="kisi k2" style="flex:1;min-height:0">
<div class="isi"><p>Beberapa isi masih contoh karena belum diketahui. Isi data asli di berkas <b>kontak.lokal.json</b> lalu jalankan <b>npm run build</b>, semua desain akan dibuat ulang.</p>
<div class="cek">
  <div><b>Nomor WhatsApp</b><span class="redup">Sekarang ${esc(K.whatsapp)}</span></div>
  <div><b>Instagram dan website</b><span class="redup">${esc(K.instagram)} dan ${esc(K.situs)}</span></div>
  <div><b>Kode QR</b><span class="redup">Tautan tujuan, misalnya tautan WhatsApp</span></div>
  <div><b>Layanan di banner</b><span class="redup">Kamar, makan, antar jemput, snorkeling</span></div>
  <div><b>WiFi</b><span class="redup">Nama jaringan dan kata sandi</span></div>
  <div><b>Foto asli</b><span class="redup">Pengganti ilustrasi di template</span></div>
</div></div>
<div class="isi"><h3>Catatan untuk percetakan</h3><table>
<tr><td>Roll-up, X-banner</td><td>Albatros atau luster. Bagian bawah sekitar 15 cm tertutup kaki roll-up.</td></tr>
<tr><td>Spanduk</td><td>Flexi Korea 340 gsm, mata ayam di sudut dan tiap 50 cm.</td></tr>
<tr><td>Papan nama</td><td>Stiker vinyl laminasi UV di atas ACP 3 mm, tahan panas dan udara laut.</td></tr>
<tr><td>Kaos</td><td>Satu warna dengan plastisol, penuh warna dengan DTF.</td></tr>
<tr><td>Jaket, handuk</td><td>Bordir komputer, benang putih atau Laut Dalam.</td></tr>
<tr><td>Label botol</td><td>Stiker vinyl tahan air 60 × 80 mm.</td></tr>
<tr><td>Gantungan pintu</td><td>Art carton 310 gsm laminasi doff, potong pola.</td></tr>
<tr><td>Gantungan kunci</td><td>Kayu 5 mm, grafir laser.</td></tr>
</table></div>
</div>`)}
</body></html>`;
}

export default async function ({ out, K, ROOT }) {
  const B = 'file://' + path.join(ROOT, 'brand');
  const html = cetak({ K, B });
  simpan(path.join(ROOT, 'build-cache/panduan-cetak.html'), html);
  const b = await buka();
  const p = await b.newPage();
  await p.goto('file://' + path.join(ROOT, 'build-cache/panduan-cetak.html'), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: out('panduan-merek.pdf'), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  await p.close();
}
