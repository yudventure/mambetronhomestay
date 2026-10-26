// Printable brand guide, A4 landscape, written to brand/panduan-merek.pdf.
// Every page shares one grid: a chapter band across the top, a title row
// (title left, intro right), then a content area of fixed height that each
// page fills with a grid of tiles, so no page runs short or overflows.
import path from 'path';
import { PALET, W, rgb, cmyk } from '../lib/palet.mjs';
import { buka, simpan } from '../lib/render.mjs';
import { varian } from './logo.mjs';
import { LOGO_INFO, SOSIAL, SOROTAN, MERCH, AMEN, PAPAN, POSE_INFO, WAJAH_INFO, ATURAN_MASKOT } from './panduan-html.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const MUTED = '#4A6369';

export function cetak({ K, B }) {
  const img = (p, extra = '') => `<img src="${B}/${p}" alt=""${extra}>`;
  const tgl = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const logo = varian().map(([n, , bg]) => [n, bg]);
  const warna = PALET.map((p) => ({ ...p, rgb: rgb(p.hex).join(' '), cmyk: cmyk(p.hex).join(' ') }));

  // tile with an image and a caption; fit contain (default) or cover
  const fig = (src, judul, ket = '', { bg = W.buih, cover = false, pad = false, style = '' } = {}) =>
    `<figure${style ? ` style="${style}"` : ''}><div class="tile${cover ? ' cover' : ''}${pad ? ' pad' : ''}" style="background:${bg}">${img(src)}</div><figcaption><b>${judul}</b>${ket ? `<span>${ket}</span>` : ''}</figcaption></figure>`;
  const kartu = (label, judul, isi, extra = '') => `<div class="kartu"${extra}>${label ? `<span class="label">${label}</span>` : ''}${judul ? `<h3>${judul}</h3>` : ''}<p>${isi}</p></div>`;

  const BAB = [];
  let nomor = 2;
  // bab: chapter name, judul: page title, intro: paragraph beside the title,
  // isi: content area, grid: grid-template for the content area
  const hal = (bab, judul, intro, isi, grid = '') => {
    nomor += 1;
    if (!BAB.find((b) => b[0] === bab)) BAB.push([bab, nomor]);
    const idx = BAB.findIndex((b) => b[0] === bab) + 1;
    return `<section class="hal"><header class="pita"><span>${String(idx).padStart(2, '0')} · ${bab}</span><span>Mambetron Homestay · Panduan merek · ${nomor}</span></header>
<div class="judul"><h2>${judul}</h2><p>${intro}</p></div>
<div class="isi" style="${grid}">${isi}</div></section>`;
  };

  const pages = [];

  pages.push(hal('Cerita merek', 'Kenapa hammock',
    'Logo Mambetron menggambar seorang tamu yang tidur siang di hammock, diikat di antara dua pohon kelapa di pulau pasir kecil. Matanya terpejam, bajunya bermotif bunga, kakinya bersilang. Itulah janji kami kepada setiap tamu. Datang, lepaskan penat, dan biarkan laut Raja Ampat yang bekerja.',
    kartu('Sikap', 'Hangat', 'Bicara seperti tuan rumah yang menyambut keluarga. Sapa dengan nama, tawarkan bantuan, jangan kaku.')
    + kartu('Irama', 'Santai', 'Seperti tamu di hammock, kami tidak terburu-buru. Kalimat pendek, ruang kosong yang lega, gambar yang tenang.')
    + kartu('Rumah', 'Dekat dengan alam', 'Laut, karang, dan pulau karst adalah halaman rumah kami. Warna dan ilustrasi diambil dari sana.')
    + fig('logo/png/mambetron-logo-utama-biru.png', 'Logo utama', 'Tamu terlelap di hammock di antara dua pohon kelapa', { pad: true, style: 'grid-column:span 2' })
    + fig('maskot/pose/mambe-sapa.png', 'Mambe', 'Maskot kuskus Waigeo, tetangga di hutan pulau', { pad: true }),
    'grid-template-columns:repeat(3,1fr);grid-template-rows:38mm 1fr'));

  // two left on the last row of four share it, one left takes it all
  const sisaLogo = logo.length % 4;
  const lebarLogo = (i) => (i < logo.length - sisaLogo ? '' : `grid-column:span ${4 / sisaLogo}`);
  pages.push(hal('Logo', 'Satu hammock, beberapa bentuk',
    'Logo asli sudah diubah menjadi vektor sehingga tajam di ukuran berapa pun. Logo ini satu warna, Biru Mambetron, jadi mudah disablon. Pilih versi sesuai latar dan cara cetaknya. Bentuk dan susunan logo tidak diubah. Berkas SVG, PDF, dan PNG ada di folder brand/logo.',
    logo.map(([nm, bg], i) => fig(`logo/png/kecil/${nm}-500.png`, LOGO_INFO[nm][0], LOGO_INFO[nm][1], { bg, pad: true, style: lebarLogo(i) })).join(''),
    `grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(${Math.ceil(logo.length / 4)},1fr)`));

  const salah = [['transform:scaleX(1.45)', 'Ditarik atau dipampatkan'], ['transform:rotate(-14deg)', 'Dimiringkan'], ['filter:hue-rotate(160deg) saturate(6) brightness(1.4)', 'Diganti warna di luar palet'], ['', 'Logo biru di atas latar gelap']];
  pages.push(hal('Logo', 'Ruang kosong, ukuran terkecil, larangan',
    'Beri ruang kosong di sekeliling logo paling sedikit setinggi huruf M pada tulisan MAMBETRON, tanpa teks atau gambar lain di dalamnya. Garis gambar orang dan hammock sangat halus. Untuk bordir dan benda kecil, pakai tulisan Mambetron atau monogram M.',
    `<figure style="grid-row:span 2"><div class="tile" style="background:${W.buih}"><div class="ruang"><div class="ruang-dalam">${img('logo/png/kecil/mambetron-logo-utama-biru-500.png')}<span class="m m1">M</span><span class="m m2">M</span></div></div></div><figcaption><b>Ruang kosong</b><span>Area berwarna lebih terang adalah ruang kosong setinggi huruf M</span></figcaption></figure>`
    + salah.map(([st, cap], i) => `<figure class="salah"><div class="tile pad" style="background:${i === 3 ? W.laut : W.putih};border:0.3mm solid #D9E6E4"><img src="${B}/logo/png/kecil/mambetron-logo-utama-biru-500.png" style="${st}" alt=""></div><span class="silang">×</span><figcaption><b>${cap}</b></figcaption></figure>`).join('')
    + kartu('Logo utama', 'Lebar 35 mm · 160 px', 'Ukuran terkecil di cetakan dan di layar. Lebih kecil dari itu, wajah dan tali hammock tidak terbaca.')
    + kartu('Ikon bulat', '20 mm · 96 px', 'Foto profil, stiker, dan cap.')
    + kartu('Tulisan saja', 'Lebar 20 mm', 'Bordir dan label kecil. Di bawah 60 mm, bordir tanpa HOMESTAY.')
    + kartu('Monogram M', '5 mm · 16 px', 'Favicon, ikon aplikasi, dan benda sangat kecil.'),
    'grid-template-columns:1.6fr 1fr 1fr 1fr 1fr;grid-template-rows:1.4fr 1fr'));

  pages.push(hal('Warna', 'Diambil dari laut dan senja Raja Ampat',
    'Biru Mambetron diambil langsung dari logo. Warna lain datang dari laut dalam, pasir pulau, buih ombak, dan langit sore. Nilai CMYK adalah perkiraan, minta percetakan mencetak contoh lebih dulu. Jingga Senja hanya untuk tombol pesan dan sorotan kecil.',
    warna.map((w) => `<div class="cw"><div class="cat" style="background:${w.hex};color:${['hitam', 'laut', 'biru'].includes(w.kunci) ? '#fff' : W.laut}">${w.nama}</div><div class="nilai"><span class="peran">${w.peran}</span><b>HEX</b><code>${w.hex}</code><b>RGB</b><code>${w.rgb}</code><b>CMYK</b><code>${w.cmyk}</code></div></div>`).join('')
    + `<div class="pasangan" style="grid-column:1 / -1"><div style="background:${W.laut};color:#fff"><b>Aa</b><span>Putih di atas Laut Dalam</span></div><div style="background:${W.pasir};color:${W.hitam}"><b>Aa</b><span>Hitam di atas Pasir Pulau</span></div><div style="background:${W.buih};color:${W.laut}"><b>Aa</b><span>Laut Dalam di atas Buih Laut</span></div><div style="background:${W.senja};color:${W.hitam}"><b>Aa</b><span>Hitam di atas Jingga Senja</span></div><div style="background:#fff;color:${W.biruTua};border:0.3mm solid #D9E6E4"><b>Aa</b><span>Biru tua ${W.biruTua} untuk teks dan tautan di latar putih</span></div></div>`,
    'grid-template-columns:repeat(6,1fr);grid-template-rows:1fr 30mm'));

  pages.push(hal('Huruf', 'Dua huruf untuk website dan cetakan',
    'Tulisan MAMBETRON di logo memakai huruf tinggi dan tebal yang tepinya seperti dipotong tangan. Londrina Solid punya watak yang sama, karena itu judul memakai Londrina Solid. Teks panjang memakai Plus Jakarta Sans, huruf buatan Tokotype dari Jakarta yang jelas dibaca di layar ponsel dan senada dengan tulisan HOMESTAY. Keduanya berlisensi SIL Open Font License, bebas dipakai untuk usaha.',
    `<div class="kartu"><span class="label">Judul · Londrina Solid</span><div class="peraga">Pelukan hangat<br>dari Raja Ampat</div><div class="abjad" style="font-family:'Londrina Solid';font-weight:400">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789</div><div class="berat" style="font-family:'Londrina Solid'"><span style="font-weight:400">Regular 400</span><span style="font-weight:900">Black 900</span></div></div>`
    + `<div class="kartu"><span class="label">Teks, menu, label · Plus Jakarta Sans</span><p style="font-size:12.5pt;line-height:1.45;max-width:none">Tidur ditemani suara ombak, makan masakan rumah tiga kali sehari, lalu snorkeling di karang depan homestay. Kami jemput Anda di pelabuhan.</p><div class="abjad">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789</div><div class="berat"><span>Regular 400</span><span style="font-weight:600">SemiBold 600</span><span style="font-weight:800">ExtraBold 800</span><span class="label">Label kapital</span></div></div>`
    + `<div class="kartu skala"><span class="label">Skala ukuran</span>
      <div><small>Judul 1 · 68 / 40 px</small><span style="font-family:'Londrina Solid';font-weight:900;font-size:26pt;line-height:1;color:${W.laut}">Selamat datang</span></div>
      <div><small>Judul 2 · 44 / 32 px</small><span style="font-family:'Londrina Solid';font-weight:900;font-size:18pt;color:${W.laut}">Kamar tepi laut</span></div>
      <div><small>Judul 3 · 32 / 24 px</small><span style="font-family:'Londrina Solid';font-weight:900;font-size:14pt;color:${W.laut}">Makan tiga kali sehari</span></div>
      <div><small>Teks · 17 px</small><span style="font-size:10.5pt">Perahu kami menunggu di pelabuhan sesuai jadwal kapal Anda.</span></div>
      <div><small>Label · 13 px</small><span class="label">Homestay di Raja Ampat</span></div></div>`
    + `<div class="kartu"><span class="label">Cara pakai</span><p>Website memakai berkas di <b>brand/font/web</b> lewat <b>fonts.css</b> dan token warna serta ukuran di <b>brand/web/tokens.css</b>. Untuk CorelDRAW, Photoshop, atau Canva, pasang TTF dari <b>brand/font/desktop</b>. Semua berkas cetak di panduan ini sudah diubah ke kurva, jadi percetakan tidak perlu memasang font.</p><pre>&lt;link rel="stylesheet" href="/font/web/fonts.css"&gt;
&lt;link rel="stylesheet" href="/web/tokens.css"&gt;

h1 { font-family: var(--mb-font-judul); }
body { font-family: var(--mb-font-teks); }</pre></div>`,
    'grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr'));

  pages.push(hal('Elemen grafis', 'Pulau karst, ekor ombak, ikon garis',
    'Ilustrasi pulau karst berbentuk jamur meniru pulau-pulau kecil Raja Ampat, tetangga pulau pasir di logo. Motif ekor ombak menggulung seperti ombak di pantai, sama seperti ekor Mambe. Ikon garis dipakai untuk layanan dan petunjuk.',
    fig('panduan/elemen-ilustrasi.png', 'Ilustrasi pulau karst', 'Latar banner, post, kartu, dan pengganti foto sementara', { cover: true, style: 'grid-column:1 / -1' })
    + fig('panduan/elemen-ekor.png', 'Ekor ombak', 'Hiasan kecil di label dan kartu', { cover: true })
    + fig('panduan/elemen-pola.png', 'Pola', 'Pembungkus sabun, latar post, lapisan dalam jaket', { cover: true })
    + fig('panduan/elemen-ikon.png', 'Ikon garis', 'Kamar, makan, snorkel, perahu, lokasi, WiFi, dan lainnya', { cover: true }),
    'grid-template-columns:repeat(3,1fr);grid-template-rows:1.15fr 1fr'));

  pages.push(hal('Maskot', 'Kenalkan, Mambe',
    'Mambe digambar dari kuskus Waigeo (<i>Spilocuscus papuensis</i>), kuskus berbintik yang hanya hidup di Raja Ampat. Cirinya ikut dibawa, yaitu bulu krem dengan bercak gelap, telinga mungil yang hampir tersembunyi, mata bulat besar berlingkar jingga, hidung dan tangan merah muda berjari panjang, serta ekor panjang menggulung dengan ujung tanpa bulu. Nama Mambe hanya usulan.',
    POSE_INFO.map(([k, t, d]) => fig(`maskot/pose/mambe-${k}.png`, t, d, { pad: true })).join('')
    + `<div class="kisi4" style="grid-column:1 / -1">${ATURAN_MASKOT.map(([t, d]) => kartu('', t, d)).join('')}</div>`,
    'grid-template-columns:repeat(6,1fr);grid-template-rows:1.6fr 1fr'));

  pages.push(hal('Maskot', 'Ekspresi dan stiker WhatsApp',
    'Dua belas stiker 512 × 512 px dalam format WebP ada di folder brand/maskot/stiker-whatsapp, masing-masing di bawah 100 KB. Masukkan ke aplikasi pembuat stiker, lalu bagikan ke tamu sebelum mereka berangkat.',
    WAJAH_INFO.map(([k, t]) => fig(`maskot/wajah/mambe-${k}.png`, t, '', { bg: W.laut, pad: true })).join('')
    + fig('amenities/mockup/gantungan-pintu.png', 'Gantungan pintu', 'Mambe tidur dan Mambe menyapa', { style: 'grid-column:span 2' })
    + fig('sosial-media/post-tips-maskot.png', 'Post tips', 'Mambe snorkeling membawa tips karang')
    + fig('sosial-media/story-maskot.png', 'Story', 'Sapaan pagi dengan Mambe santai')
    + fig('papan-dan-banner/mockup/papan-jemput.png', 'Papan jemput', 'Mambe melambai ke tamu yang tiba', { style: 'grid-column:span 2' }),
    'grid-template-columns:repeat(6,1fr);grid-template-rows:1fr 1.3fr'));

  pages.push(hal('Website', 'Logo, favicon, dan contoh halaman',
    'Header memakai logo horizontal atau tulisan Mambetron saja. Monogram M muncul di tab browser dan layar utama ponsel, karena gambar hammock terlalu halus di ukuran sekecil itu. Logo lengkap tampil saat tautan dibagikan di WhatsApp. Berkas ada di brand/web, contoh halaman di contoh-halaman.html.',
    fig('panduan/contoh-website.png', 'Contoh halaman di desktop', 'brand/web/contoh-halaman.html, lebar 1280 px', { cover: true, style: 'grid-column:span 3' }).replace('class="tile cover"', 'class="tile cover atas"')
    + fig('panduan/contoh-website-ponsel.png', 'Di ponsel', 'Lebar 390 px', { cover: true, style: 'grid-row:span 2' }).replace('class="tile cover"', 'class="tile cover atas"')
    + fig('web/og-image.png', 'Gambar bagikan', '1200 × 630 px, tampil saat tautan dikirim lewat WhatsApp atau Facebook')
    + fig('web/icon-512.png', 'Favicon dan ikon aplikasi', 'favicon.ico, favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png', { cover: true })
    + kartu('Berkas di brand/web', '', 'favicon.ico, favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png, icon-maskable-512.png, site.webmanifest, og-image.png, logo-header.svg, logo-header-putih.svg, tokens.css, contoh-halaman.html'),
    'grid-template-columns:1.2fr 1fr 1fr 0.78fr;grid-template-rows:1.25fr 1fr'));

  pages.push(hal('Media sosial', 'Instagram, Facebook, WhatsApp',
    'Template disimpan sebagai SVG dan PNG di brand/sosial-media. Bagian berilustrasi laut adalah tempat foto, ganti dengan foto asli homestay. Ulasan tamu harus diisi ulasan sungguhan.',
    SOSIAL.map(([nm, t, d]) => fig(`sosial-media/${nm}.png`, t, d)).join('')
    + `<figure style="grid-column:span 4"><div class="tile" style="background:${W.buih}"><div class="sorotan">${SOROTAN.map((nm) => `<div><div class="bulat">${img(`sosial-media/sorotan/sorotan-${nm}.png`)}</div><span>${nm}</span></div>`).join('')}</div></div><figcaption><b>Sampul sorotan story</b><span>Enam ikon, 1080 × 1920 px</span></figcaption></figure>`,
    'grid-template-columns:repeat(6,1fr);grid-template-rows:1fr 1fr'));

  pages.push(hal('Kaos dan jaket', 'Seragam staf dan suvenir tamu',
    'Berkas cetak ada dalam PDF dan SVG ukuran asli, ditambah PNG 300 dpi untuk sablon DTF, di brand/merchandise/cetak. Ukuran di bawah untuk kaos M dan bisa disesuaikan.',
    MERCH.map(([nm, t, d]) => fig(`merchandise/mockup/${nm}.png`, t, d)).join(''),
    'grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr'));

  pages.push(hal('Amenities', 'Yang tamu sentuh setiap hari',
    'Berkas cetak ada di brand/amenities/cetak. Garis potong berwarna magenta hanya panduan pisau potong, bukan untuk dicetak.',
    AMEN.map(([nm, t, d]) => fig(`amenities/mockup/${nm}.png`, t, d)).join('')
    + kartu('Ukuran cetak', '', 'Bordir handuk lebar 16 cm · Pembungkus sabun 200 × 60 mm · Label botol 60 × 80 mm · Gantungan kunci 50 mm · Gantungan pintu 90 × 230 mm · Kartu selamat datang A6'),
    'grid-template-columns:repeat(4,1fr);grid-template-rows:1fr 1fr'));

  pages.push(hal('Papan dan banner', 'Terlihat dari dermaga',
    'Banner berdiri dan spanduk dibuat untuk pelabuhan tempat tamu tiba, papan nama dipasang di homestay. Huruf dibuat besar supaya terbaca dari beberapa meter. Kirim PDF dari brand/papan-dan-banner/cetak ke percetakan.',
    PAPAN.map(([nm, t, d]) => fig(`papan-dan-banner/mockup/${nm}.png`, t, d)).join(''),
    'grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr'));

  pages.push(hal('Sebelum cetak', 'Yang perlu dilengkapi',
    'Beberapa isi masih contoh karena belum diketahui. Isi data asli di berkas kontak.lokal.json lalu jalankan npm run build, semua desain akan dibuat ulang dengan data baru.',
    `<div class="cek">
      <div><b>Nomor WhatsApp</b><span>Sekarang ${esc(K.whatsapp)}</span></div>
      <div><b>Instagram dan website</b><span>${esc(K.instagram)} dan ${esc(K.situs)}</span></div>
      <div><b>Kode QR</b><span>Tautan tujuan, misalnya tautan WhatsApp</span></div>
      <div><b>Layanan di banner</b><span>Kamar, makan, antar jemput, snorkeling</span></div>
      <div><b>WiFi</b><span>Nama jaringan dan kata sandi</span></div>
      <div><b>Foto asli</b><span>Pengganti ilustrasi di template</span></div>
    </div>
    <div class="kartu"><span class="label">Catatan untuk percetakan</span><table>
      <tr><td>Roll-up, X-banner</td><td>Albatros atau luster. Bagian bawah sekitar 15 cm tertutup kaki roll-up.</td></tr>
      <tr><td>Spanduk</td><td>Flexi Korea 340 gsm, mata ayam di sudut dan tiap 50 cm.</td></tr>
      <tr><td>Papan nama</td><td>Stiker vinyl laminasi UV di atas ACP 3 mm, tahan panas dan udara laut.</td></tr>
      <tr><td>Kaos</td><td>Satu warna dengan plastisol, penuh warna dengan DTF.</td></tr>
      <tr><td>Jaket, handuk</td><td>Bordir komputer, benang putih atau Laut Dalam.</td></tr>
      <tr><td>Label botol</td><td>Stiker vinyl tahan air 60 × 80 mm.</td></tr>
      <tr><td>Gantungan pintu</td><td>Art carton 310 gsm laminasi doff, potong pola.</td></tr>
      <tr><td>Gantungan kunci</td><td>Kayu 5 mm, grafir laser.</td></tr>
    </table></div>`,
    'grid-template-columns:1fr 1.15fr'));

  // table of contents, built after the pages so it knows the numbers
  const daftar = `<section class="hal"><header class="pita"><span>Daftar isi</span><span>Mambetron Homestay · Panduan merek · 2</span></header>
<div class="judul"><h2>Isi panduan ini</h2><p>Sebelas bab, dari cerita merek sampai catatan untuk percetakan. Nomor bab dipakai di pita kepala setiap halaman.</p></div>
<div class="isi" style="grid-template-columns:1.1fr 1fr;grid-template-rows:min-content 1fr">
  <div class="toc">${BAB.map(([b, n], i) => `<div><b>${String(i + 1).padStart(2, '0')}</b><span>${b}</span><em>${n}</em></div>`).join('')}</div>
  <div class="tumpuk">
    ${kartu('Berkas', '', 'Semua berkas asli ada di folder <b>brand</b>. Logo dan berkas cetak tersedia dalam SVG dan PDF, sudah dalam ukuran cetak dan hurufnya sudah diubah menjadi kurva.')}
    ${kartu('Untuk percetakan', '', 'Kirim berkas PDF dari folder <b>cetak</b>. Garis magenta adalah garis potong, tidak dicetak. Nilai CMYK adalah perkiraan, minta contoh cetak dulu.')}
    ${kartu('Untuk desainer', '', 'Pakai SVG, font di folder <b>font/desktop</b>, dan warna di bab Warna. Panduan HTML dengan tombol salin warna ada di <b>brand/panduan-merek.html</b>.')}
  </div>
  <div class="tile" style="grid-column:1 / -1;background:${W.buih}">${img('panduan/elemen-ilustrasi.png', ' style="object-fit:cover;object-position:bottom"')}${img('maskot/pose/mambe-santai.png', ' style="left:auto;right:8%;top:auto;bottom:6%;width:auto;height:84%"')}</div>
</div></section>`;

  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Panduan Merek Mambetron Homestay</title>
<link rel="stylesheet" href="${B}/font/web/fonts.css">
<style>
@page { size: 297mm 210mm; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Plus Jakarta Sans', sans-serif; color: ${W.hitam}; font-size: 10pt; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.hal { width: 297mm; height: 210mm; overflow: hidden; position: relative; padding: 21mm 16mm 12mm; page-break-after: always; break-after: page; background: #fff; display: flex; flex-direction: column; gap: 6mm; }
.hal:last-child { page-break-after: auto; break-after: auto; }
.pita { position: absolute; top: 0; left: 0; right: 0; height: 11mm; background: ${W.laut}; color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 0 16mm; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; }
.pita span:last-child { color: ${W.pasir}; }
h1, h2, h3 { font-family: 'Londrina Solid', sans-serif; color: ${W.laut}; margin: 0; line-height: 1.1; }
.judul { display: grid; grid-template-columns: 1fr 1.6fr; gap: 12mm; align-items: end; min-height: 22mm; }
.judul h2 { font-size: 22pt; font-weight: 600; }
.judul p { margin: 0; font-size: 9.5pt; color: ${MUTED}; line-height: 1.5; }
h3 { font-size: 12pt; font-weight: 600; }
p { margin: 0; }
.label { font-size: 7.5pt; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${W.biruTua}; }
img { display: block; }

.isi { flex: 1; min-height: 0; display: grid; gap: 5mm; }
figure { margin: 0; display: flex; flex-direction: column; gap: 2mm; min-height: 0; min-width: 0; position: relative; }
.tile { flex: 1; min-height: 0; position: relative; overflow: hidden; border-radius: 3mm; }
.tile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.tile.pad img { inset: 4mm; width: calc(100% - 8mm); height: calc(100% - 8mm); }
.tile.cover img { object-fit: cover; }
.tile.atas img { object-position: top; }
figcaption { flex: none; font-size: 8pt; line-height: 1.35; display: flex; flex-direction: column; gap: 0.3mm; }
figcaption b { font-weight: 700; font-size: 8.5pt; color: ${W.hitam}; }
figcaption span { color: ${MUTED}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.kartu { background: ${W.buih}; border-radius: 3mm; padding: 5mm; display: flex; flex-direction: column; gap: 2mm; min-height: 0; min-width: 0; overflow: hidden; }
.kartu p { font-size: 9pt; line-height: 1.5; color: ${W.hitam}; }
.kartu h3 { font-size: 12pt; }
.kisi4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; min-height: 0; }
.tumpuk { display: grid; grid-auto-rows: min-content; align-content: start; gap: 4mm; min-height: 0; }

.toc { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: min-content; column-gap: 8mm; row-gap: 3.2mm; align-content: start; }
.toc div { display: grid; grid-template-columns: 9mm 1fr auto; align-items: baseline; gap: 2mm; font-size: 10pt; }
.toc b { font-family: 'Londrina Solid', sans-serif; font-weight: 900; font-size: 13pt; color: ${W.biru}; }
.toc em { font-style: normal; color: ${MUTED}; font-variant-numeric: tabular-nums; font-size: 9pt; }

.ruang { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.ruang-dalam { position: absolute; left: 7%; right: 7%; top: 50%; transform: translateY(-50%); aspect-ratio: 1.08; background: #fff; border-radius: 2mm; }
.ruang-dalam img { position: absolute; inset: 15%; width: 70%; height: 70%; object-fit: contain; }
.m { position: absolute; font-family: 'Londrina Solid', sans-serif; font-weight: 700; color: ${W.biruTua}; font-size: 11pt; line-height: 1; }
.m1 { left: 50%; top: 4%; transform: translateX(-50%); } .m2 { left: 4%; top: 50%; transform: translateY(-50%); }
.salah .silang { position: absolute; top: 2mm; right: 2mm; width: 7mm; height: 7mm; border-radius: 50%; background: #D93A3A; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 9pt; line-height: 1; }

.cw { border-radius: 3mm; overflow: hidden; background: ${W.buih}; display: flex; flex-direction: column; min-height: 0; }
.cw .cat { flex: 1; min-height: 0; display: flex; align-items: flex-end; padding: 4mm; font-family: 'Londrina Solid', sans-serif; font-weight: 600; font-size: 12pt; }
.cw .nilai { padding: 3.5mm 4mm 4mm; font-size: 8pt; display: grid; grid-template-columns: 12mm 1fr; row-gap: 0.6mm; align-items: baseline; }
.cw .peran { grid-column: 1 / -1; color: ${MUTED}; margin-bottom: 1.5mm; line-height: 1.35; min-height: 8mm; }
.cw .nilai b { font-size: 6.5pt; letter-spacing: 0.16em; color: ${MUTED}; }
.cw .nilai code { font-family: ui-monospace, Menlo, monospace; font-size: 8pt; }
.pasangan { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5mm; }
.pasangan div { border-radius: 3mm; padding: 3.5mm 4mm; display: flex; flex-direction: column; justify-content: space-between; font-weight: 600; font-size: 8.5pt; line-height: 1.3; }
.pasangan b { font-family: 'Londrina Solid', sans-serif; font-size: 16pt; font-weight: 600; }

.peraga { font-family: 'Londrina Solid', sans-serif; font-weight: 700; font-size: 25pt; line-height: 1.05; color: ${W.laut}; }
.abjad { font-size: 10.5pt; line-height: 1.4; overflow-wrap: anywhere; }
.berat { display: flex; flex-wrap: wrap; gap: 1.5mm 5mm; font-size: 9.5pt; align-items: baseline; }
.skala div { display: grid; grid-template-columns: 32mm 1fr; align-items: baseline; gap: 4mm; }
.skala small { color: ${MUTED}; font-size: 7.5pt; }
pre { margin: 0; background: ${W.laut}; color: #EAF4F3; border-radius: 2.5mm; padding: 3.5mm 4mm; font-family: ui-monospace, Menlo, monospace; font-size: 7.8pt; line-height: 1.5; white-space: pre-wrap; }

.sorotan { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(6, 1fr); align-items: center; padding: 4mm 6mm; gap: 3mm; }
.sorotan div { display: flex; flex-direction: column; align-items: center; gap: 2mm; font-size: 8pt; font-weight: 600; text-transform: capitalize; color: ${W.laut}; }
.bulat { width: 100%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; position: relative; }
.bulat img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

.cek { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: 4mm; min-height: 0; }
.cek div { background: ${W.buih}; border-radius: 3mm; padding: 4mm 4.5mm; display: flex; flex-direction: column; justify-content: center; gap: 1mm; font-size: 9pt; }
.cek b { font-weight: 700; } .cek span { color: ${MUTED}; }
table { border-collapse: separate; border-spacing: 0 1.2mm; width: 100%; font-size: 8.8pt; }
td { padding: 1.4mm 2.5mm; vertical-align: top; background: #fff; }
td:first-child { font-weight: 700; width: 36mm; border-radius: 2mm 0 0 2mm; } td:last-child { border-radius: 0 2mm 2mm 0; }

.sampul { padding: 0; gap: 0; }
.sampul .atas { display: grid; grid-template-columns: 1.05fr 1fr; align-items: center; gap: 14mm; padding: 20mm 22mm 10mm; flex: 1; min-height: 0; }
.sampul .teks { display: flex; flex-direction: column; gap: 4mm; }
.sampul h1 { font-size: 46pt; font-weight: 700; line-height: 1; }
.sampul .teks p { font-size: 11pt; color: ${MUTED}; max-width: 100mm; }
.sampul .slogan { display: inline-flex; align-self: flex-start; background: ${W.pasir}; color: ${W.laut}; font-family: 'Londrina Solid', sans-serif; font-weight: 600; font-size: 12pt; padding: 2mm 5mm; border-radius: 99mm; }
.sampul .versi { font-size: 8.5pt; color: ${MUTED}; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; }
.sampul .logo { background: #fff; border-radius: 8mm; padding: 12mm; box-shadow: 0 6mm 16mm rgba(11, 59, 74, 0.10); }
.sampul .logo img { width: 100%; }
.sampul .laut { position: relative; height: 64mm; flex: none; }
.sampul .laut img.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sampul .laut img.mambe { position: absolute; right: 26mm; bottom: 12mm; height: 54mm; }
</style></head><body>

<section class="hal sampul" style="background:${W.buih}">
  <div class="atas">
    <div class="teks">
      <span class="label">Panduan merek</span>
      <h1>Mambetron Homestay</h1>
      <p>Logo, warna, huruf, maskot, dan semua penerapannya, dari website sampai banner di pelabuhan.</p>
      <span class="slogan">${esc(K.slogan)}</span>
      <span class="versi">Versi 2 · ${tgl}</span>
    </div>
    <div class="logo">${img('logo/png/mambetron-logo-utama-biru.png')}</div>
  </div>
  <div class="laut">${img('panduan/elemen-ilustrasi.png', ' class="bg"')}${img('maskot/pose/mambe-sapa.png', ' class="mambe"')}</div>
</section>
${daftar}
${pages.join('\n')}
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
