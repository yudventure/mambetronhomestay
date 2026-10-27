---
name: panel-homestay
description: Panel pengelola (dashboard admin) homestay bergaya meja pengelola DAMPIER, dibangun untuk Mambetron Homestay dan siap dipakai ulang di situs homestay lain milik pemilik yang sama. Bilah atas dan menu samping putih, kartu HARI INI, kartu sapaan dengan jam WIT, enam angka ringkasan, statistik pengunjung tanpa cookie, meja pesanan dengan cari dan saring status, kalender bulan dengan tamu, unit terisi, dan tanggal tutup, sinkron kalender iCal per unit dengan Booking.com, Airbnb, Agoda, dan agen perjalanan, lembar menu ponsel, tema lewat enam token warna. Pakai SETIAP KALI pemilik meminta dashboard admin, panel pengelola, "admin seperti DAMPIER" atau "seperti Mambetron", meja pesanan, kalender pemesanan, sinkron kalender OTA atau iCal, statistik pengunjung di panel, atau membangun dan menata ulang admin untuk homestay, penginapan, guesthouse, dive center, atau situs pemesanan lain, bahkan kalau kata "skill" tidak disebut.
---

# Panel pengelola homestay

Panel ini lahir di repo Mambetron (`yudventure/mambetronhomestay`, folder
`website/`), mengikuti tangkapan layar panel DAMPIER ("Meja pengelola")
yang dikirim pemilik. Pemilik meminta tampilannya disimpan supaya bisa
dipakai berulang untuk homestay lain, dengan isi yang disesuaikan
kebutuhan homestay itu. Skill ini membawa kode, token warna, dan aturan
tata letaknya.

## Isi skill

| Berkas | Gunanya |
|---|---|
| `assets/panel-homestay/panel.css` | Token `--color-panel-*`, kelas tombol, isian, kartu, dan pengarah warna di dalam `.panel`. Tempel ke stylesheet utama (Tailwind 4). |
| `assets/panel-homestay/components/admin/RangkaPanel.tsx` | Rangka panel. Bilah atas, menu samping, lonceng, menu akun, lembar menu ponsel. |
| `assets/panel-homestay/components/admin/Kabar.tsx` | `JudulAdmin` (alis "Meja pengelola · bulan", judul besar, teks, tombol di kanan) dan pesan berhasil atau galat. |
| `assets/panel-homestay/components/admin/JamLangsung.tsx` | Jam detik berjalan dalam zona situs. |
| `assets/panel-homestay/components/admin/MejaPesanan.tsx` | Meja pesanan dan `BarisMeja`. Label di atas nilai, chip status dan bayar, tombol Kabari tamu lewat WhatsApp. |
| `assets/panel-homestay/components/admin/StatistikSitus.tsx` | Statistik pengunjung. Empat ubin, grafik batang 7 atau 30 hari, rincian hari, asal negara. |
| `assets/panel-homestay/app/admin/(panel)/page.tsx` | Halaman Ringkasan. Sapaan, angka, statistik, perlu perhatian, tiba terdekat, malam ini, status situs, persiapan situs, meja pesanan. |
| `assets/panel-homestay/app/admin/(panel)/kalender/page.tsx` | Kalender bulan mulai Senin, chip per hari, rincian tanggal, tutup tanggal. |
| `assets/panel-homestay/app/admin/(panel)/pesanan/page.tsx` | Daftar pesanan dengan pil status dan "Hanya yang akan datang". |
| `assets/panel-homestay/lib/statistik.ts`, `app/api/kunjungan/route.ts`, `components/Kunjungan.tsx` | Penghitung kunjungan milik situs sendiri. |
| `assets/panel-homestay/lib/sinkron.ts`, `lib/ical.mjs`, `app/ical/[berkas]/route.ts`, `app/admin/(panel)/sinkron/page.tsx`, `instrumentation.ts` | Sinkron kalender iCal per unit dengan OTA dan agen. Baca, simpan, bagi unit, ekspor tanpa pantulan, cari bentrok. Uji `node --test lib/*.test.mjs`. |
| `assets/panel-homestay/lib/*.ts`, `database/skema.sql`, `app/globals.css` | Pendukung dari Mambetron (tanggal, format, kait, data, ikon, skema) sebagai acuan. |
| `scripts/cek-token.mjs` | Memeriksa enam warna panel. Kontras setiap pasangan yang muncul di panel, dan menolak krem keabuan. |
| `scripts/perbarui-aset.sh` | Menyalin ulang semua berkas di atas dari repo Mambetron setelah panel di sana berubah. |
| `references/anatomi.md` | Rincian tiap bagian panel, ukuran, perilaku, dan alasannya. |
| `references/memasang.md` | Langkah memasang di situs homestay baru, kontrak data, daftar yang wajib diganti per homestay, uji Playwright. |
| `references/tema.md` | Cara memilih enam warna panel dari logo homestay baru dan memeriksanya. |
| `references/sinkron.md` | Cara kerja sinkron kalender OTA, data, pembagian unit, jadwal baca, uji dengan OTA tiruan. |
| `references/aturan-pemilik.md` | Aturan tulisan, tata letak, ponsel, dan laporan yang berlaku di semua situs pemilik. |

## Memasang di situs baru (ringkas)

Baca `references/memasang.md` untuk rinciannya. Intinya:

1. **Situs dibangun dari kode Mambetron** (Next.js 16, React 19, Tailwind 4,
   MySQL). Panel sudah ikut. Cukup ganti enam token di `globals.css`, logo
   di `public/merek/`, nama homestay di pengaturan, dan zona waktu di
   `lib/tanggal.ts` kalau homestay tidak di Papua.
2. **Situs punya kode sendiri.** Salin `panel.css` dan berkas di
   `assets/panel-homestay/` sesuai jalurnya, lalu sambungkan ke lapisan data
   situs itu lewat kontrak di `references/memasang.md` (fungsi
   `ringkasPanel`, `angkaRingkasan`, `cariPesanan`, `hitungPesanan`,
   `daftarTutup`, `daftarKamar`, `statistikSitus`). Bungkus semua halaman
   admin dengan `<div className="panel">` supaya warnanya ikut tema panel.
3. **Isi disesuaikan homestay itu.** Menu di `RangkaPanel.tsx` (`menu()`),
   ubin di halaman Ringkasan, nama "Pondok" untuk unit, status pesanan, dan
   daftar persiapan situs. Bentuk dan gaya tetap sama.
4. **Tema.** Pilih enam warna dari logo homestay dengan `references/tema.md`,
   lalu periksa dengan `node scripts/cek-token.mjs utama=#... aksen=#...`.
   Jangan ubah ukuran, sudut, atau susunan. Yang membedakan homestay adalah
   warna, logo, dan isi.
5. **Uji di peramban.** Desktop 1280 px dan ponsel 390 px untuk setiap
   halaman admin, tanpa gulir menyamping, tanpa galat konsol, panel tetap
   terbuka saat database salah. Contoh uji ada di `references/memasang.md`.

Panel ini sudah lolos di Mambetron: build lolos, uji alur pesan, admin,
ponsel, tutup situs, kata sandi (34 pemeriksaan), pemulihan, dan database
rusak (16 pemeriksaan) di Chromium Linux.

## Aturan yang tidak boleh dilanggar

- **Bentuk sama, isi menyesuaikan.** Bilah atas putih, menu samping putih
  dengan menu aktif berupa pil gelap, kartu sapaan gelap, kartu berbingkai
  garis rambut di halaman putih. Isi menu dan ubin mengikuti kebutuhan
  homestay itu, bukan disalin mentah.
- **Warna hanya lewat token.** Halaman admin tidak menulis kode warna merek
  langsung. Tambah warna baru sebagai token, bukan `bg-[#...]`, kecuali
  warna status (merah tutup, hijau lunas, jingga menunggu) yang sama di
  semua situs.
- **Statistik pengunjung menjaga privasi.** Tanpa cookie, alamat IP tidak
  disimpan, pengunjung dihitung dengan sidik harian yang tidak bisa
  dilacak ke hari lain, Do Not Track dan GPC dihormati, pengelola yang
  sedang masuk tidak dihitung, robot disaring. Negara dari header host
  kalau ada, kalau tidak ditebak dari bahasa peramban. Katakan itu ke
  pemilik.
- **Sinkron kalender per unit.** iCal hanya tahu terisi atau kosong, jadi
  satu sambungan untuk satu unit. Ekspor sebuah sambungan tidak memuat malam
  yang datang dari sambungan itu sendiri, supaya blokir tidak memantul.
  Bacaan yang gagal tidak membuka malam dari bacaan terakhir yang berhasil.
  Tautan ekspor tidak memuat nama tamu. Katakan ke pemilik bahwa Booking.com
  hanya menyinkronkan tipe kamar satu unit, dan Traveloka serta Tiket.com
  tidak memakai iCal. Lihat `references/sinkron.md`.
- **Panel tetap terbuka saat database bermasalah.** Rangka dan halaman
  memakai nilai kosong dan menampilkan petunjuk database, bukan halaman
  galat. Lihat `references/anatomi.md` bagian "Database bermasalah".
- **Semua teks tampil mengikuti aturan pemilik** di
  `references/aturan-pemilik.md`. Tanpa titik dua, titik koma, tanda pisah
  panjang, dan garis datar pemisah. Kartu yang sendirian melebar penuh.
- **Rahasia tidak masuk repo.** Kata sandi admin, data database, dan surel
  pengembang hanya di environment variables hosting.

## Sebelum mengaku selesai

- [ ] Build situs lolos, tanpa galat konsol di semua halaman admin
- [ ] Setiap halaman admin dicek di 1280 px dan 390 px tanpa gulir menyamping
- [ ] Menu aktif, lencana pesanan, lonceng, menu akun, dan lembar menu ponsel bekerja, ketuk di luar menutup
- [ ] Panel terbuka dan menampilkan petunjuk saat database salah atau kosong
- [ ] Teks tampil bersih dari titik dua, titik koma, tanda pisah panjang
- [ ] Warna merek homestay baru hanya diganti lewat token
- [ ] Katakan terus terang hanya Chromium Linux yang diuji, Windows, Mac, Android, dan iOS belum
- [ ] Laporan ke pemilik dalam bahasa Indonesia
