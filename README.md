# Mambetron Homestay

Identitas merek Mambetron Homestay di Raja Ampat. Isinya logo dalam bentuk vektor, warna, font website, template media sosial, dan berkas cetak siap kirim ke percetakan untuk kaos, jaket, amenities, papan nama, serta banner di pelabuhan.

Buka `brand/panduan-merek.html` di browser untuk melihat semuanya dalam satu halaman, atau cetak `brand/panduan-merek.pdf`.

## Isi folder `brand`

| Folder | Isinya |
|---|---|
| `logo/svg`, `logo/pdf` | 12 versi logo dalam vektor. Pakai ini untuk percetakan dan desainer. |
| `logo/png` | Logo PNG transparan lebar 2000 px, versi kecil 500 px di `logo/png/kecil`. |
| `logo/sumber` | Gambar logo asli dan hasil penjiplakan vektornya. |
| `maskot` | Mambe, maskot kuskus. Enam pose dan enam ekspresi (SVG dan PNG), paket stiker WhatsApp (WebP 512 px), lembar maskot. |
| `font/desktop` | Fredoka dan Plus Jakarta Sans dalam TTF untuk dipasang di komputer. |
| `font/web` | Berkas font website (woff2) beserta `fonts.css`. |
| `web` | Favicon, ikon aplikasi, gambar bagikan 1200 × 630, logo header, `tokens.css`, dan `contoh-halaman.html`. |
| `sosial-media` | Foto profil, template post, story, sampul sorotan, sampul Facebook. SVG ada di `sosial-media/svg`. |
| `merchandise/cetak` | Berkas sablon dan bordir kaos serta jaket dalam ukuran asli (PDF, SVG, PNG 300 dpi). |
| `amenities/cetak` | Bordir handuk, pembungkus sabun, label botol, gantungan kunci, gantungan pintu, kartu selamat datang. |
| `papan-dan-banner/cetak` | Roll-up 80 × 200 cm, X-banner 60 × 160 cm, spanduk 300 × 100 cm, papan nama 120 × 80 cm, papan jemput A3. |
| `*/mockup` | Gambar contoh pemakaian untuk presentasi. |

## Versi logo yang dipilih

| Keperluan | Berkas |
|---|---|
| Latar putih atau terang | `mambetron-logo-utama-hitam` |
| Latar gelap, kaos gelap, sablon satu warna putih | `mambetron-logo-utama-putih` |
| Di atas foto atau latar ramai | `mambetron-logo-utama-stiker` |
| Header website, kop surat | `mambetron-logo-horizontal` |
| Foto profil, favicon | `mambetron-ikon` |
| Bordir, grafir, cap satu warna | `mambetron-ikon-stempel-hitam` atau `-putih` |

Ruang kosong di sekitar logo paling sedikit setinggi huruf M pada tulisan Mambetron. Ukuran terkecil logo utama 25 mm (120 px), logo horizontal tinggi 10 mm (32 px), ikon 8 mm (16 px).

## Maskot Mambe

Mambe digambar dari kuskus Waigeo (*Spilocuscus papuensis*), kuskus berbintik yang hanya hidup di Raja Ampat: bulu krem berbercak gelap, telinga mungil, mata bulat besar berlingkar jingga, hidung dan tangan merah muda, ekor panjang menggulung. Pakai di media sosial, stiker WhatsApp, kartu tamu, gantungan pintu, dan kaos anak. Untuk kop surat dan nota resmi cukup logo. Warna dan proporsi wajahnya tidak diubah. Nama Mambe hanya usulan.

Stiker WhatsApp ada di `brand/maskot/stiker-whatsapp` (WebP 512 × 512 px, masing-masing di bawah 100 KB, ikon paket 96 px). Masukkan ke aplikasi pembuat stiker seperti Sticker Maker lalu bagikan ke tamu.

## Warna

| Nama | HEX | Peran |
|---|---|---|
| Hitam Kuskus | `#161616` | Logo dan teks |
| Laut Dalam | `#0B3B4A` | Latar gelap, judul, seragam |
| Toska Laguna | `#12A39A` | Aksen dan ilustrasi. Untuk teks di latar putih pakai `#0A7A73` |
| Jingga Senja | `#F27A3D` | Tombol pesan dan sorotan |
| Pasir Pantai | `#F7DFA8` | Latar hangat dan label |
| Buih Laut | `#E6F5F3` | Latar lembut di layar |

Nilai CMYK ada di halaman panduan. Nilainya perkiraan, jadi minta percetakan membuat contoh cetak dulu.

## Font website

Judul memakai **Fredoka**, bentuk huruf yang sama dengan tulisan Mambetron di logo. Teks memakai **Plus Jakarta Sans** buatan Tokotype, Jakarta. Keduanya berlisensi SIL Open Font License 1.1 (lihat `brand/font/OFL-*.txt`), bebas dipakai untuk usaha dan boleh di-host sendiri.

```html
<link rel="stylesheet" href="/font/web/fonts.css">
<link rel="stylesheet" href="/web/tokens.css">
```

`tokens.css` berisi variabel warna, skala ukuran huruf, tombol, dan label kapital. Contoh pemakaiannya ada di `brand/web/contoh-halaman.html`.

## Yang perlu dilengkapi sebelum cetak

Beberapa isi masih contoh karena belum diketahui.

1. Nomor WhatsApp, masih tertulis `+62 8XX XXXX XXXX`.
2. Akun Instagram `@mambetronhomestay` dan alamat `mambetronhomestay.com`, pastikan memang milik Mambetron.
3. Tautan kode QR. Selama kosong, banner menampilkan kotak bertulisan KODE QR.
4. Daftar layanan di banner (kamar tepi laut, makan tiga kali, antar jemput perahu, snorkeling). Ubah kalau tidak sesuai.
5. Nama dan kata sandi WiFi untuk kartu selamat datang.
6. Foto asli homestay untuk menggantikan ilustrasi di template post, story, dan sampul Facebook (grup `foto-…` di berkas SVG).

Data umum ada di `brand/data/kontak.json`. Data pribadi seperti nomor WhatsApp sebaiknya ditulis di `kontak.lokal.json` di folder utama. Berkas itu diabaikan git sehingga tidak ikut tersimpan di GitHub. Isinya cukup bagian yang ingin diganti, misalnya

```json
{ "whatsapp": "+62 812 3456 7890", "qr": "https://wa.me/6281234567890", "wifiSandi": "rahasia" }
```

## Membuat ulang semua berkas

Butuh Node 18 atau lebih baru dan Chromium dari Playwright.

```sh
npm install
npm run build              # semua
node scripts/build.mjs papan sosial   # hanya grup tertentu
```

Grup yang tersedia `logo`, `maskot`, `web`, `sosial`, `merchandise`, `amenities`, `papan`, `panduan`, `pdf`. Semua teks di berkas cetak sudah diubah menjadi kurva, jadi percetakan tidak perlu memasang font.

Logo vektor dijiplak dari gambar asli dengan `scripts/trace_logo.py` (butuh Python, `potracer`, `numpy`, `Pillow`). Langkah ini cukup sekali, hasilnya sudah tersimpan di `brand/logo/sumber/logo-traced.json`.

## Catatan untuk percetakan

| Barang | Bahan yang disarankan |
|---|---|
| Roll-up dan X-banner | Albatros atau luster. Bagian bawah sekitar 15 cm tertutup kaki roll-up. |
| Spanduk | Flexi Korea 340 gsm, mata ayam di sudut dan tiap 50 cm. |
| Papan nama | Stiker vinyl laminasi UV di atas ACP 3 mm, tahan panas dan udara laut. |
| Papan jemput | A3 laminasi glossy, ditulis dengan spidol papan tulis. |
| Kaos | Satu warna dengan sablon plastisol, penuh warna dengan DTF. |
| Jaket dan handuk | Bordir komputer. |
| Label botol | Stiker vinyl tahan air. |
| Gantungan pintu | Art carton 310 gsm laminasi doff. Garis magenta adalah garis potong, tidak dicetak. |
| Gantungan kunci | Kayu 5 mm, grafir laser. |
