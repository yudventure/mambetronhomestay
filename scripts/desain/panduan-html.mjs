// HTML of the brand guide. Copy follows the owner's writing rules: no colons
// or semicolons in visible sentences, no long dashes, labels and values on
// separate lines, no horizontal rules.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const LOGO_INFO = {
  'mambetron-logo-utama-hitam': ['Logo utama', 'Versi pertama yang dipilih. Untuk latar putih dan terang.'],
  'mambetron-logo-utama-laut': ['Logo utama Laut Dalam', 'Latar terang yang ingin terasa lebih lembut dari hitam.'],
  'mambetron-logo-utama-putih': ['Logo utama putih', 'Latar gelap, kaos gelap, dan sablon satu warna putih.'],
  'mambetron-logo-utama-stiker': ['Logo stiker', 'Di atas foto, pola, atau latar berwarna ramai.'],
  'mambetron-logo-horizontal': ['Logo horizontal', 'Header website, kop surat, dan papan yang lebar.'],
  'mambetron-logo-horizontal-putih': ['Logo horizontal putih', 'Footer website dan latar gelap.'],
  'mambetron-ikon': ['Ikon bulat', 'Foto profil, favicon, stiker kecil.'],
  'mambetron-ikon-toska': ['Ikon bulat toska', 'Ikon di atas latar Laut Dalam.'],
  'mambetron-ikon-stempel-hitam': ['Stempel hitam', 'Cap, grafir laser, cetak satu warna.'],
  'mambetron-ikon-stempel-putih': ['Stempel putih', 'Bordir dan sablon putih di bahan gelap.'],
  'mambetron-wordmark-hitam': ['Tulisan saja', 'Saat kuskus sudah tampil di dekatnya.'],
  'mambetron-wordmark-putih': ['Tulisan saja putih', 'Lengan jaket, latar gelap.'],
};

const SOSIAL = [
  ['foto-profil-pasir', 'Foto profil', '1080 × 1080 px, Instagram, WhatsApp, Facebook'],
  ['post-info', 'Post info', '1080 × 1350 px'],
  ['post-foto', 'Post foto', '1080 × 1350 px, ganti ilustrasi dengan foto asli'],
  ['post-ulasan', 'Post ulasan tamu', '1080 × 1350 px, isi dengan ulasan asli'],
  ['story', 'Story', '1080 × 1920 px'],
  ['sampul-facebook', 'Sampul Facebook', '1640 × 624 px'],
];
const SOROTAN = ['kamar', 'makan', 'snorkel', 'jemput', 'lokasi', 'ulasan'];

const MERCH = [
  ['kaos-seragam-putih', 'Kaos seragam putih', 'Dada kiri ikon bulat 9 cm, sablon DTF. Punggung logo utama 28 cm, sablon plastisol hitam.'],
  ['kaos-seragam-laut', 'Kaos seragam Laut Dalam', 'Dada kiri stempel putih 9 cm. Punggung logo utama putih 28 cm. Satu warna putih, sablon plastisol.'],
  ['kaos-suvenir', 'Kaos suvenir', 'Emblem 25 cm di dada, sablon DTF penuh warna. Cocok dijual ke tamu.'],
  ['jaket', 'Jaket bomber', 'Dada kiri bordir stempel putih 8 cm. Punggung logo utama putih 26 cm, bordir atau DTF. Lengan bisa diberi tulisan Mambetron 9 cm.'],
];

const AMEN = [
  ['handuk', 'Handuk', 'Bordir logo horizontal satu warna selebar 16 cm, benang Laut Dalam di handuk putih dan benang putih di handuk gelap.'],
  ['sabun', 'Pembungkus sabun', 'Pita kertas 200 × 60 mm, kertas kraft atau art paper 150 gsm.'],
  ['botol', 'Label botol isi ulang', 'Stiker vinyl tahan air 60 × 80 mm. Sampo toska, sabun cair jingga, kondisioner pasir.'],
  ['gantungan-kunci', 'Gantungan kunci kamar', 'Kayu bundar 50 mm, tebal 5 mm, grafir laser. Depan stempel, belakang nomor kamar.'],
  ['gantungan-pintu', 'Gantungan pintu', 'Art carton 310 gsm, laminasi doff, potong pola 90 × 230 mm. Dua sisi.'],
  ['kartu-selamat-datang', 'Kartu selamat datang', 'A6, art carton 260 gsm. Berisi WiFi, tiga ajakan menjaga pulau, dan kontak.'],
  ['sandal', 'Sandal kamar', 'Ikon bulat dicetak di tumit alas sandal, sekitar 5 cm.'],
];

const PAPAN = [
  ['banner-pelabuhan', 'Banner berdiri di pelabuhan', 'Roll-up 80 × 200 cm dan X-banner 60 × 160 cm. Bahan albatros atau luster. Bagian bawah sekitar 15 cm tertutup kaki roll-up, jadi hanya berisi pola.'],
  ['spanduk-pelabuhan', 'Spanduk', '300 × 100 cm, flexi Korea 340 gsm, mata ayam di setiap sudut dan tiap 50 cm.'],
  ['papan-nama', 'Papan nama homestay', '120 × 80 cm. Cetak stiker vinyl dengan laminasi UV di atas ACP 3 mm supaya tahan panas dan udara laut. Tiang kayu atau besi galvanis.'],
  ['papan-jemput', 'Papan jemput tamu', 'A3 mendatar, laminasi glossy. Tulis nama tamu dengan spidol papan tulis lalu hapus untuk tamu berikutnya.'],
];

const fig = (src, alt, cls = '') => `<img src="${src}" alt="${esc(alt)}" loading="lazy" class="${cls}">`;

export function halaman({ K, warna, logo }) {
  const repo = 'https://github.com/yudventure/mambetronhomestay';
  return `<title>Panduan Merek Mambetron</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Logo, warna, huruf, dan penerapan merek Mambetron Homestay">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap">
<style>
/* Layout: one reading column for words, wider frames for artwork, a chip bar
   that keeps the chapters close. Brand colours are fixed, page colours follow
   the viewer's theme. */
:root {
  --bg: #FFFFFF;
  --surface: #E6F5F3;
  --surface-2: #F3FAF9;
  --fg: #161616;
  --muted: #415C63;
  --head: #0B3B4A;
  --accent: #0A7A73;
  --chip-bg: #E6F5F3;
  --chip-fg: #0B3B4A;
  --shadow: 0 10px 30px rgba(11, 59, 74, 0.10);
  --display: 'Fredoka', 'Trebuchet MS', 'Segoe UI', sans-serif;
  --body: 'Plus Jakarta Sans', 'Segoe UI', system-ui, -apple-system, sans-serif;
  --mono: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  --laut: #0B3B4A; --toska: #12A39A; --senja: #F27A3D; --pasir: #F7DFA8; --buih: #E6F5F3; --hitam: #161616; --putih: #FFFFFF;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #071F27; --surface: #0D3340; --surface-2: #0A2932; --fg: #EAF4F3; --muted: #A6C4C6;
    --head: #F7DFA8; --accent: #4FD1C5; --chip-bg: #0D3340; --chip-fg: #EAF4F3;
    --shadow: 0 10px 30px rgba(0, 0, 0, 0.35); color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #071F27; --surface: #0D3340; --surface-2: #0A2932; --fg: #EAF4F3; --muted: #A6C4C6;
  --head: #F7DFA8; --accent: #4FD1C5; --chip-bg: #0D3340; --chip-fg: #EAF4F3;
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.35); color-scheme: dark;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font-family: var(--body); font-size: 16px; line-height: 1.65; }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }
.wadah { max-width: 1120px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1, h2, h3 { font-family: var(--display); color: var(--head); line-height: 1.12; text-wrap: balance; margin: 0; }
h1 { font-size: clamp(2.4rem, 1.6rem + 3.6vw, 4.4rem); font-weight: 700; }
h2 { font-size: clamp(1.9rem, 1.4rem + 2vw, 2.8rem); font-weight: 600; }
h3 { font-size: 1.3rem; font-weight: 600; }
p { margin: 0; max-width: 66ch; }
a { color: var(--accent); text-underline-offset: 0.18em; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; border-radius: 6px; }
.label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); }
.redup { color: var(--muted); }
img { max-width: 100%; height: auto; display: block; }

.pembuka { background: var(--surface); padding-block: 56px 64px; }
.pembuka .wadah { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr); gap: 48px; align-items: center; }
.pembuka .teks { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.pembuka .logo { background: var(--putih); border-radius: 32px; padding: 36px; box-shadow: var(--shadow); }
.slogan { display: inline-flex; align-self: flex-start; background: var(--pasir); color: var(--laut); font-family: var(--display); font-weight: 600; font-size: 1.15rem; padding: 8px 18px; border-radius: 999px; }

nav.bab { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); box-shadow: 0 6px 18px rgba(11, 59, 74, 0.08); }
nav.bab .wadah { display: flex; gap: 8px; overflow-x: auto; padding-block: 12px; scrollbar-width: none; }
nav.bab a { flex: none; text-decoration: none; background: var(--chip-bg); color: var(--chip-fg); font-weight: 600; font-size: 0.9rem; padding: 7px 14px; border-radius: 999px; }
nav.bab a:hover { background: var(--pasir); color: var(--laut); }

section { padding-block: 72px 8px; scroll-margin-top: 64px; }
.kepala { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
.kisi { display: grid; gap: 20px; }
.k2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.k3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.k4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.k6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
figure { margin: 0; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
figcaption { display: flex; flex-direction: column; gap: 2px; font-size: 0.92rem; }
figcaption b { font-weight: 700; color: var(--fg); }
.bingkai { border-radius: 20px; overflow: hidden; box-shadow: var(--shadow); }
.ubin { border-radius: 20px; aspect-ratio: 4 / 3; display: flex; align-items: center; justify-content: center; padding: 22px; box-shadow: var(--shadow); max-width: 100%; }
.ubin img { max-height: 100%; width: auto; object-fit: contain; }

.kartu { background: var(--surface-2); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.kartu h3 { font-size: 1.2rem; }

.contoh-salah { position: relative; }
.contoh-salah .ubin { background: var(--putih); overflow: hidden; }
.silang { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; background: #D93A3A; display: grid; place-items: center; }
.silang svg { width: 16px; height: 16px; }

.warna { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.contoh-warna { border-radius: 20px; overflow: hidden; box-shadow: var(--shadow); background: var(--surface-2); display: flex; flex-direction: column; }
.contoh-warna .cat { height: 140px; display: flex; align-items: flex-end; padding: 16px 18px; font-family: var(--display); font-weight: 600; font-size: 1.35rem; }
.contoh-warna .isi { padding: 16px 18px 20px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; font-size: 0.85rem; }
.contoh-warna .isi > p { grid-column: 1 / -1; color: var(--muted); }
.nilai { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.nilai span { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.nilai button { all: unset; cursor: pointer; font-family: var(--mono); font-variant-numeric: tabular-nums; font-size: 0.85rem; overflow-wrap: anywhere; border-radius: 4px; }
.nilai button:hover { color: var(--accent); }
.nilai button:focus-visible { outline: 2px solid var(--accent); }
.pasangan { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 20px; }
.pasangan div { border-radius: 16px; padding: 18px; min-height: 96px; display: flex; flex-direction: column; justify-content: space-between; font-weight: 600; }
.pasangan b { font-family: var(--display); font-size: 1.4rem; font-weight: 600; }

.huruf { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.huruf .kartu { gap: 14px; }
.peraga { font-size: clamp(2.2rem, 1.6rem + 2.4vw, 3.4rem); line-height: 1.05; color: var(--head); }
.abjad { font-size: 1.25rem; overflow-wrap: anywhere; color: var(--fg); }
.berat { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 1.05rem; }
.skala { display: flex; flex-direction: column; gap: 14px; margin-top: 20px; background: var(--surface-2); border-radius: 20px; padding: 24px; }
.skala div { display: grid; grid-template-columns: 9rem minmax(0, 1fr); gap: 16px; align-items: baseline; }
.skala small { color: var(--muted); font-size: 0.8rem; font-variant-numeric: tabular-nums; }
pre { margin: 0; background: #0B3B4A; color: #EAF4F3; border-radius: 16px; padding: 20px; overflow-x: auto; font-family: var(--mono); font-size: 0.85rem; line-height: 1.6; }

.daftar { display: flex; flex-direction: column; gap: 12px; }
.daftar div { background: var(--surface-2); border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 4px; }
.daftar b { font-weight: 700; }
.daftar code, p code { font-family: var(--mono); font-size: 0.88em; background: var(--surface); padding: 1px 6px; border-radius: 6px; overflow-wrap: anywhere; }

.penutup { margin-top: 72px; background: var(--laut); color: var(--putih); padding-block: 48px; }
.penutup .wadah { display: flex; gap: 32px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
.penutup h2 { color: var(--pasir); }
.penutup p { color: #DCEDEB; }
.penutup a { color: var(--pasir); font-weight: 700; }

@media (max-width: 900px) {
  .k4, .k6 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .pasangan { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .warna { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 680px) {
  .pembuka .wadah, .huruf, .k2, .k3 { grid-template-columns: minmax(0, 1fr); }
  .k4, .k6 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .warna { grid-template-columns: minmax(0, 1fr); }
  .skala div { grid-template-columns: minmax(0, 1fr); gap: 2px; }
  .pembuka .logo { padding: 22px; }
}
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
</style>

<header class="pembuka">
  <div class="wadah">
    <div class="teks">
      <span class="label">Panduan merek</span>
      <h1>Mambetron Homestay</h1>
      <p>Seekor kuskus memeluk papan nama homestay. Begitulah cara kami menyambut tamu di Raja Ampat, hangat dan tanpa terburu-buru. Halaman ini merangkum logo, warna, huruf, dan semua penerapannya, dari website sampai banner di pelabuhan.</p>
      <span class="slogan">${esc(K.slogan)}</span>
    </div>
    <div class="logo">${fig('logo/png/mambetron-logo-utama-hitam.png', 'Logo Mambetron Homestay')}</div>
  </div>
</header>

<nav class="bab" aria-label="Bab">
  <div class="wadah">
    <a href="#cerita">Cerita</a><a href="#logo">Logo</a><a href="#warna">Warna</a><a href="#huruf">Huruf</a><a href="#elemen">Elemen</a><a href="#website">Website</a><a href="#sosial">Media sosial</a><a href="#kaos">Kaos dan jaket</a><a href="#amenities">Amenities</a><a href="#papan">Papan dan banner</a><a href="#lengkapi">Perlu dilengkapi</a>
  </div>
</nav>

<main>
<section id="cerita"><div class="wadah">
  <div class="kepala">
    <span class="label">Cerita merek</span>
    <h2>Kenapa kuskus</h2>
    <p>Kuskus adalah hewan berkantung dari hutan Papua. Ia aktif di malam hari, bergerak pelan, dan memakai ekornya yang melingkar untuk berpegangan. Di logo, kuskus memeluk papan nama dan ekornya melingkar seperti ombak. Pelukan itu yang ingin dirasakan setiap tamu.</p>
  </div>
  <div class="kisi k3">
    <div class="kartu"><h3>Hangat</h3><p class="redup">Bicara seperti tuan rumah yang menyambut keluarga. Sapa dengan nama, tawarkan bantuan, jangan kaku.</p></div>
    <div class="kartu"><h3>Pelan</h3><p class="redup">Seperti kuskus, kami tidak terburu-buru. Kalimat pendek, ruang kosong yang lega, gambar yang tenang.</p></div>
    <div class="kartu"><h3>Dekat dengan alam</h3><p class="redup">Laut, karang, dan pulau karst adalah halaman rumah kami. Warna dan ilustrasi diambil dari sana.</p></div>
  </div>
</div></section>

<section id="logo"><div class="wadah">
  <div class="kepala">
    <span class="label">Logo</span>
    <h2>Satu kuskus, beberapa bentuk</h2>
    <p>Logo asli sudah diubah menjadi vektor sehingga tajam di ukuran berapa pun, dari favicon 16 piksel sampai spanduk 3 meter. Pilih versi sesuai latar dan cara cetaknya. Bentuk dan susunan logo tidak diubah.</p>
  </div>
  <div class="kisi k4">
    ${logo.map(([n, bg]) => `<figure><div class="ubin" style="background:${bg}">${fig(`logo/png/kecil/${n}-500.png`, LOGO_INFO[n][0])}</div><figcaption><b>${LOGO_INFO[n][0]}</b><span class="redup">${LOGO_INFO[n][1]}</span></figcaption></figure>`).join('\n    ')}
  </div>

  <div class="kepala" style="margin-top:56px">
    <h3>Ruang kosong dan ukuran terkecil</h3>
    <p>Beri ruang kosong di sekeliling logo paling sedikit setinggi huruf M pada tulisan Mambetron. Jangan cetak lebih kecil dari ukuran di bawah ini, nanti mata kuskus tidak terbaca.</p>
  </div>
  <div class="kisi k3">
    <div class="kartu"><span class="label">Logo utama</span><h3>25 mm</h3><p class="redup">120 px di layar</p></div>
    <div class="kartu"><span class="label">Logo horizontal</span><h3>Tinggi 10 mm</h3><p class="redup">Tinggi 32 px di layar</p></div>
    <div class="kartu"><span class="label">Ikon bulat</span><h3>8 mm</h3><p class="redup">16 px di layar</p></div>
  </div>

  <div class="kepala" style="margin-top:56px">
    <h3>Yang tidak boleh dilakukan</h3>
  </div>
  <div class="kisi k4">
    ${[
      ['transform:scaleX(1.45)', 'Ditarik atau dipampatkan'],
      ['transform:rotate(-14deg)', 'Dimiringkan'],
      ['filter:hue-rotate(160deg) saturate(6) brightness(1.4)', 'Diganti warna di luar palet'],
      ['', 'Logo hitam di atas latar gelap'],
    ].map(([st, cap], i) => `<figure class="contoh-salah"><div class="ubin" style="${i === 3 ? 'background:#0B3B4A' : ''}">${fig('logo/png/kecil/mambetron-logo-utama-hitam-500.png', cap).replace('<img ', `<img style="${st}${i === 3 ? '' : ''}" `)}</div><span class="silang" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg></span><figcaption><b>${cap}</b></figcaption></figure>`).join('\n    ')}
  </div>
</div></section>

<section id="warna"><div class="wadah">
  <div class="kepala">
    <span class="label">Warna</span>
    <h2>Diambil dari laut dan senja Raja Ampat</h2>
    <p>Hitam kuskus tetap jadi warna utama logo. Lima warna lain datang dari laut dalam, laguna, pasir, buih, dan langit sore. Ketuk nilai warna untuk menyalinnya. Nilai CMYK adalah perkiraan, jadi minta percetakan mencetak contoh lebih dulu.</p>
  </div>
  <div class="warna">
    ${warna.map((w) => `<div class="contoh-warna"><div class="cat" style="background:${w.hex};color:${['hitam', 'laut', 'toska'].includes(w.kunci) ? '#FFFFFF' : '#0B3B4A'}">${w.nama}</div><div class="isi"><p>${w.peran}</p><div class="nilai"><span>HEX</span><button type="button" data-salin="${w.hex}">${w.hex}</button></div><div class="nilai"><span>RGB</span><button type="button" data-salin="${w.rgb}">${w.rgb}</button></div><div class="nilai"><span>CMYK</span><button type="button" data-salin="${w.cmyk}">${w.cmyk}</button></div></div></div>`).join('\n    ')}
  </div>
  <div class="pasangan">
    <div style="background:#0B3B4A;color:#FFFFFF"><b>Aa</b>Putih di atas Laut Dalam</div>
    <div style="background:#F7DFA8;color:#161616"><b>Aa</b>Hitam di atas Pasir Pantai</div>
    <div style="background:#E6F5F3;color:#0B3B4A"><b>Aa</b>Laut Dalam di atas Buih Laut</div>
    <div style="background:#F27A3D;color:#161616"><b>Aa</b>Hitam di atas Jingga Senja</div>
  </div>
  <p class="redup" style="margin-top:16px">Jingga Senja khusus untuk tombol pesan dan sorotan kecil. Untuk teks dan tautan berwarna toska di latar putih, pakai toska tua <code>#0A7A73</code> supaya tetap mudah dibaca.</p>
</div></section>

<section id="huruf"><div class="wadah">
  <div class="kepala">
    <span class="label">Huruf</span>
    <h2>Dua huruf untuk website dan cetakan</h2>
    <p>Tulisan Mambetron di logo ternyata memakai bentuk Fredoka Bold. Karena itu judul memakai Fredoka, sehingga website terasa satu keluarga dengan logo. Teks panjang memakai Plus Jakarta Sans, huruf buatan studio Tokotype dari Jakarta yang jelas dibaca di layar ponsel. Keduanya gratis dan boleh dipakai untuk usaha.</p>
  </div>
  <div class="huruf">
    <div class="kartu">
      <span class="label">Judul</span>
      <h3 style="font-size:1.6rem">Fredoka</h3>
      <div class="peraga" style="font-family:var(--display);font-weight:700">Pelukan hangat dari Raja Ampat</div>
      <div class="abjad" style="font-family:var(--display);font-weight:500">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789</div>
      <div class="berat" style="font-family:var(--display)"><span style="font-weight:500">Medium 500</span><span style="font-weight:600">SemiBold 600</span><span style="font-weight:700">Bold 700</span></div>
    </div>
    <div class="kartu">
      <span class="label">Teks, menu, label</span>
      <h3 style="font-size:1.6rem;font-family:var(--body);font-weight:700">Plus Jakarta Sans</h3>
      <p style="font-size:1.15rem">Tidur ditemani suara ombak, makan masakan rumah tiga kali sehari, lalu snorkeling di karang depan homestay. Kami jemput Anda di pelabuhan.</p>
      <div class="abjad" style="font-family:var(--body)">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789</div>
      <div class="berat" style="font-family:var(--body)"><span>Regular 400</span><span style="font-weight:600">SemiBold 600</span><span style="font-weight:800">ExtraBold 800</span><span class="label" style="color:var(--accent)">Label kapital</span></div>
    </div>
  </div>
  <div class="skala">
    <div><small>Judul 1 · 68 / 40 px</small><span style="font-family:var(--display);font-weight:700;font-size:clamp(2.2rem,1.75rem + 3.5vw,4.25rem);line-height:1.05;color:var(--head)">Selamat datang</span></div>
    <div><small>Judul 2 · 44 / 32 px</small><span style="font-family:var(--display);font-weight:600;font-size:clamp(1.8rem,1.5rem + 2vw,2.75rem);line-height:1.1;color:var(--head)">Kamar tepi laut</span></div>
    <div><small>Judul 3 · 32 / 24 px</small><span style="font-family:var(--display);font-weight:600;font-size:clamp(1.4rem,1.25rem + 1vw,2rem);color:var(--head)">Makan tiga kali sehari</span></div>
    <div><small>Teks · 17 px</small><span style="font-size:1.0625rem">Perahu kami menunggu di pelabuhan sesuai jadwal kapal Anda.</span></div>
    <div><small>Label · 13 px</small><span class="label">Homestay di Raja Ampat</span></div>
  </div>
  <div class="kisi k2" style="margin-top:20px">
    <div class="kartu"><h3>Untuk website</h3><p class="redup">Berkas font sudah ada di folder <code>brand/font/web</code>, tinggal dipasang. Token warna dan ukuran huruf ada di <code>brand/web/tokens.css</code>.</p>
<pre>&lt;link rel="stylesheet" href="/font/web/fonts.css"&gt;
&lt;link rel="stylesheet" href="/web/tokens.css"&gt;

h1 { font-family: var(--mb-font-judul); }
body { font-family: var(--mb-font-teks); }</pre></div>
    <div class="kartu"><h3>Untuk desain cetak dan Canva</h3><p class="redup">Pasang berkas TTF di folder <code>brand/font/desktop</code> ke komputer, lalu kedua font muncul di CorelDRAW, Photoshop, atau Illustrator. Di Canva, cari nama fontnya di daftar font. Kalau belum ada, unggah berkas TTF yang sama.</p><p class="redup">Semua berkas cetak di folder ini sudah diubah ke kurva, jadi percetakan tidak perlu memasang font.</p></div>
  </div>
</div></section>

<section id="elemen"><div class="wadah">
  <div class="kepala">
    <span class="label">Elemen grafis</span>
    <h2>Pulau karst, ekor ombak, ikon garis</h2>
    <p>Ilustrasi pulau karst berbentuk jamur meniru pulau-pulau kecil Raja Ampat. Motif ekor ombak diambil dari ekor kuskus di logo yang melingkar seperti gulungan ombak. Ikon garis dipakai untuk layanan dan petunjuk.</p>
  </div>
  <div class="kisi k3">
    <figure style="grid-column:1 / -1"><div class="bingkai">${fig('panduan/elemen-ilustrasi.png', 'Ilustrasi pulau karst dan laut')}</div><figcaption><b>Ilustrasi pulau karst</b><span class="redup">Latar banner, post, kartu, dan pengganti foto sementara.</span></figcaption></figure>
    <figure><div class="bingkai">${fig('panduan/elemen-ekor.png', 'Motif ekor ombak')}</div><figcaption><b>Ekor ombak</b><span class="redup">Hiasan kecil di label dan kartu.</span></figcaption></figure>
    <figure><div class="bingkai">${fig('panduan/elemen-pola.png', 'Pola ekor ombak')}</div><figcaption><b>Pola</b><span class="redup">Pembungkus sabun, latar post, lapisan dalam jaket.</span></figcaption></figure>
    <figure><div class="bingkai">${fig('panduan/elemen-ikon.png', 'Ikon garis')}</div><figcaption><b>Ikon garis</b><span class="redup">Kamar, makan, snorkel, perahu, lokasi, WiFi, dan lainnya.</span></figcaption></figure>
  </div>
</div></section>

<section id="website"><div class="wadah">
  <div class="kepala">
    <span class="label">Website</span>
    <h2>Logo, favicon, dan contoh halaman</h2>
    <p>Header memakai logo horizontal. Ikon kuskus muncul di tab browser, di layar utama ponsel, dan saat tautan dibagikan di WhatsApp. Contoh halaman di bawah sudah memakai font dan warna merek, tinggal diisi foto dan isi asli.</p>
  </div>
  <div class="kisi k3">
    <figure style="grid-column:span 2"><div class="bingkai">${fig('panduan/contoh-website.png', 'Contoh halaman website di desktop')}</div><figcaption><b>Contoh halaman di desktop</b><span class="redup">brand/web/contoh-halaman.html</span></figcaption></figure>
    <figure><div class="bingkai">${fig('panduan/contoh-website-ponsel.png', 'Contoh halaman website di ponsel')}</div><figcaption><b>Di ponsel</b><span class="redup">Lebar 390 px</span></figcaption></figure>
    <figure style="grid-column:span 2"><div class="bingkai">${fig('web/og-image.png', 'Gambar saat tautan dibagikan')}</div><figcaption><b>Gambar bagikan</b><span class="redup">1200 × 630 px, tampil saat tautan dikirim lewat WhatsApp atau Facebook</span></figcaption></figure>
    <figure><div class="ubin" style="background:#E6F5F3;aspect-ratio:1">${fig('web/icon-512.png', 'Ikon aplikasi')}</div><figcaption><b>Favicon dan ikon aplikasi</b><span class="redup">favicon.ico, favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png</span></figcaption></figure>
  </div>
</div></section>

<section id="sosial"><div class="wadah">
  <div class="kepala">
    <span class="label">Media sosial</span>
    <h2>Instagram, Facebook, WhatsApp</h2>
    <p>Template disimpan sebagai SVG dan PNG. Bagian berilustrasi laut adalah tempat foto, ganti dengan foto asli homestay. Ulasan tamu juga harus diisi ulasan sungguhan.</p>
  </div>
  <div class="kisi k3">
    ${SOSIAL.map(([n, t, d]) => `<figure><div class="bingkai">${fig(`sosial-media/${n}.png`, t)}</div><figcaption><b>${t}</b><span class="redup">${d}</span></figcaption></figure>`).join('\n    ')}
  </div>
  <div class="kepala" style="margin-top:40px"><h3>Sampul sorotan story</h3></div>
  <div class="kisi k6">
    ${SOROTAN.map((n) => `<figure><div class="bingkai" style="border-radius:50%;aspect-ratio:1;max-width:100%">${fig(`sosial-media/sorotan/sorotan-${n}.png`, n).replace('<img ', '<img style="width:100%;height:100%;object-fit:cover" ')}</div><figcaption style="align-items:center"><b style="text-transform:capitalize">${n}</b></figcaption></figure>`).join('\n    ')}
  </div>
</div></section>

<section id="kaos"><div class="wadah">
  <div class="kepala">
    <span class="label">Kaos dan jaket</span>
    <h2>Seragam staf dan suvenir tamu</h2>
    <p>Berkas cetak ada dalam PDF dan SVG ukuran asli, ditambah PNG 300 dpi untuk sablon DTF. Ukuran di bawah untuk kaos M dan bisa disesuaikan.</p>
  </div>
  <div class="kisi k2">
    ${MERCH.map(([n, t, d]) => `<figure><div class="bingkai">${fig(`merchandise/mockup/${n}.png`, t)}</div><figcaption><b>${t}</b><span class="redup">${d}</span></figcaption></figure>`).join('\n    ')}
  </div>
</div></section>

<section id="amenities"><div class="wadah">
  <div class="kepala">
    <span class="label">Amenities</span>
    <h2>Yang tamu sentuh setiap hari</h2>
    <p>Handuk, sabun, botol isi ulang, kunci, gantungan pintu, kartu selamat datang, dan sandal. Garis potong berwarna magenta di berkas cetak hanya panduan pisau potong, bukan untuk dicetak.</p>
  </div>
  <div class="kisi k2">
    ${AMEN.map(([n, t, d], i) => `<figure${i === AMEN.length - 1 ? ' style="grid-column:1 / -1"' : ''}><div class="bingkai">${fig(`amenities/mockup/${n}.png`, t)}</div><figcaption><b>${t}</b><span class="redup">${d}</span></figcaption></figure>`).join('\n    ')}
  </div>
</div></section>

<section id="papan"><div class="wadah">
  <div class="kepala">
    <span class="label">Papan dan banner</span>
    <h2>Terlihat dari dermaga</h2>
    <p>Banner berdiri dan spanduk dibuat untuk Pelabuhan Waisai atau dermaga tempat tamu tiba, sedangkan papan nama dipasang di homestay. Huruf dibuat besar supaya terbaca dari beberapa meter. Kirim berkas PDF ke percetakan, ukurannya sudah sesuai ukuran cetak.</p>
  </div>
  <div class="kisi k2">
    ${PAPAN.map(([n, t, d]) => `<figure><div class="bingkai">${fig(`papan-dan-banner/mockup/${n}.png`, t)}</div><figcaption><b>${t}</b><span class="redup">${d}</span></figcaption></figure>`).join('\n    ')}
  </div>
</div></section>

<section id="lengkapi"><div class="wadah">
  <div class="kepala">
    <span class="label">Sebelum cetak</span>
    <h2>Yang perlu dilengkapi</h2>
    <p>Beberapa isi masih contoh karena belum diketahui. Isi data asli di berkas <code>kontak.lokal.json</code> di folder utama, lalu jalankan <code>npm run build</code>. Semua desain akan dibuat ulang dengan data baru. Berkas itu tidak ikut tersimpan di GitHub, jadi nomor WhatsApp tetap pribadi.</p>
  </div>
  <div class="daftar">
    <div><b>Nomor WhatsApp</b><span class="redup">Sekarang tertulis ${esc(K.whatsapp)}</span></div>
    <div><b>Akun Instagram dan alamat website</b><span class="redup">Sekarang ${esc(K.instagram)} dan ${esc(K.situs)}. Pastikan namanya memang milik Mambetron.</span></div>
    <div><b>Kode QR</b><span class="redup">Isi tautan tujuan, misalnya tautan WhatsApp. Selama kosong, banner menampilkan kotak bertulisan KODE QR.</span></div>
    <div><b>Daftar layanan di banner</b><span class="redup">Kamar tepi laut, makan tiga kali, antar jemput perahu, snorkeling di karang. Ubah kalau tidak sesuai kenyataan.</span></div>
    <div><b>Nama dan kata sandi WiFi</b><span class="redup">Untuk kartu selamat datang.</span></div>
    <div><b>Foto asli</b><span class="redup">Ganti ilustrasi laut di template post, story, dan sampul Facebook dengan foto homestay.</span></div>
  </div>
</div></section>
</main>

<footer class="penutup">
  <div class="wadah">
    <div style="display:flex;flex-direction:column;gap:10px;min-width:0">
      <h2>Semua berkas</h2>
      <p>Logo, font, berkas cetak PDF, template media sosial, dan mockup tersimpan di folder <code style="background:rgba(255,255,255,0.12);color:#fff">brand</code> pada repositori <a href="${repo}" target="_blank" rel="noopener">yudventure/mambetronhomestay</a>.</p>
    </div>
    <img src="logo/png/kecil/mambetron-logo-horizontal-putih-500.png" alt="Mambetron Homestay" style="width:260px">
  </div>
</footer>

<script>
document.querySelectorAll('[data-salin]').forEach(function (b) {
  b.addEventListener('click', function () {
    var t = b.getAttribute('data-salin'), asli = b.textContent;
    var tandai = function (pesan) { b.textContent = pesan; setTimeout(function () { b.textContent = asli; }, 1200); };
    var pilih = function () { var r = document.createRange(); r.selectNodeContents(b); var s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try {
      navigator.clipboard.writeText(t).then(function () { tandai('Tersalin'); }, pilih);
    } catch (e) { pilih(); }
  });
});
</script>
`;
}
