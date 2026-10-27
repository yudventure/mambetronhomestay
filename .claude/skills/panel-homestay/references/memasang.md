# Memasang panel di situs homestay baru

## Daftar isi

1. Pilih jalur
2. Jalur A, situs dari kode Mambetron
3. Jalur B, situs dengan kode sendiri
4. Kontrak data
5. Yang wajib diganti per homestay
6. Uji Playwright

## 1. Pilih jalur

Lihat dulu situs tujuannya. Kalau repo itu turunan Mambetron (ada
`lib/bawaan.mjs`, `lib/data.ts`, `app/admin/(panel)/`), pakai jalur A.
Kalau situs itu dibangun dengan kode lain, pakai jalur B. Kalau situsnya
belum ada sama sekali, jalur A paling cepat, karena situs publik, pemesanan,
panel, surel, dan petunjuk database ikut sekaligus.

## 2. Jalur A, situs dari kode Mambetron

1. Salin folder `website/` Mambetron ke repo baru, tanpa `.env`,
   `node_modules`, `.next`, dan foto unggahan.
2. Ganti enam token `--color-panel-*` di `app/globals.css` (lihat
   `tema.md`), juga warna situs (`--color-laut`, `--color-biru`, dan
   seterusnya) kalau merek situsnya berbeda.
3. Ganti logo di `public/merek/` (`logo-horizontal.svg` untuk bilah atas,
   `logo-utama.svg` untuk halaman masuk) dan teks `alt` di
   `RangkaPanel.tsx`, `app/admin/masuk/page.tsx`, `app/admin/sandi/page.tsx`.
4. Ganti nama, kontak, dan isi bawaan di `lib/bawaan.mjs`. Nama homestay di
   kartu sapaan dan salam WhatsApp diambil dari `situs.nama`, jadi ikut
   berubah.
   Pondok bawaan ada di `KAMAR_AWAL` (jenis, jumlah unit, harga). Kosongkan
   `KAMAR_LAMA` di situs baru, daftar itu hanya untuk memindah tiga pondok
   contoh Mambetron versi lama.
5. Kalau homestay tidak di zona WIT, ganti `ZONA` di `lib/tanggal.ts`
   (`Asia/Makassar` untuk WITA, `Asia/Jakarta` untuk WIB), selisih
   `INTERVAL 9 HOUR` di `angkaRingkasan` (`lib/data.ts`) menjadi 8 atau 7,
   dan tulisan "WIT" di `JamLangsung.tsx`, `StatistikSitus.tsx`, dan fungsi
   `waktu()` di `lib/format.ts`.
6. Sesuaikan isi. Sebutan "Pondok" (menu, kalender, ubin, persiapan situs)
   diganti sebutan homestay itu (Kamar, Bungalow, Cottage). Menu `menu()`
   di `RangkaPanel.tsx` mengikuti halaman yang ada.
7. Jalankan build dan uji (bagian 6).

## 3. Jalur B, situs dengan kode sendiri

Syaratnya React 19 dan Tailwind 4. Next.js App Router paling mudah karena
berkasnya server component. Framework lain perlu memindahkan pengambilan
data ke loader-nya sendiri.

1. Tempel `assets/panel-homestay/panel.css` ke stylesheet utama setelah
   `@import "tailwindcss"`. Kalau situs sudah punya `.tombol`, `.kartu`, atau
   `.isian`, jangan tempel dua kali, cukup bagian `@theme` panel dan blok
   `.panel`.
2. Bungkus seluruh admin dengan elemen ber-kelas `panel` dan latar putih,
   seperti `assets/panel-homestay/app/admin/layout.tsx`.
3. Salin komponen panel (`RangkaPanel`, `Kabar`, `JamLangsung`,
   `MejaPesanan`, `BarisPesanan`, `StatistikSitus`, `PilihPondok`,
   `TombolYakin`), kait (`lib/kait.ts`), tanggal (`lib/tanggal.ts`), dan
   format (`lib/format.ts`). `components/Ikon.tsx` dan `lib/ikon.ts` membawa
   ikon garis yang dipakai menu. Kalau situs punya pustaka ikon sendiri,
   petakan nama ikon yang dipakai panel. Menu `dasbor`, `tiket`,
   `kalender`, `kamar`, `perahu`, `bintang`, `globe`, `orang`. Lainnya
   `lonceng`, `bawah`, `kiri`, `kanan`, `luar`, `keluar`, `gembok`,
   `silang`, `cari`, `tambah`, `panah`, `chat`, `info`, `daftar`, `sampah`,
   `galat`, dan ikon tombol menu ponsel di `RangkaPanel.tsx`.
4. Sambungkan data lewat kontrak di bagian 4. Fungsi Mambetron ada di
   `assets/panel-homestay/lib/data.ts` sebagai contoh SQL.
5. Pasang sinkron kalender bila homestay itu menjual di OTA. Tabel
   `kalender_sambungan` dan `kalender_luar`, `lib/ical.mjs`,
   `lib/sinkron.ts`, rute `app/ical/[berkas]/route.ts`, halaman
   `app/admin/(panel)/sinkron/page.tsx`, aksi sambungan di `app/admin/aksi.ts`,
   `instrumentation.ts`, dan baris `kalender_luar` di `sisaKamar`. Rincinya di
   `sinkron.md`.
6. Pasang statistik. Tabel `kunjungan` (di `database/skema.sql`),
   `lib/statistik.ts`, rute `app/api/kunjungan/route.ts`, dan
   `<Kunjungan />` di kerangka situs publik (bukan di admin). Rute memakai
   `sesiSah` untuk melewati pengelola dan `alamatPengunjung` untuk IP. Ganti
   dengan fungsi sesi situs itu.
7. Salin halaman `page.tsx` Ringkasan, `pesanan/page.tsx`, dan
   `kalender/page.tsx`, lalu ganti impor ke fungsi situs itu.
8. Halaman admin lama situs itu cukup diberi `JudulAdmin` dan `.kartu`.
   Warna lama yang memakai nama lain dipetakan di blok `.panel`.

## 4. Kontrak data

Pesanan (tabel `pesanan`). Kolom yang dipakai panel `id`, `kode`,
`kamar_id`, `kamar_nama`, `jumlah_kamar`, `check_in`, `check_out` (DATE,
malam terakhir adalah `check_out` dikurangi satu), `malam`, `dewasa`,
`anak`, `nama`, `email`, `telepon`, `negara`, `total`, `dp`, `dibayar`,
`rincian` (JSON layanan tambahan), `bahasa`, `status`, `dibuat`
(TIMESTAMP dalam UTC). Status `menunggu`, `dikonfirmasi`, `lunas`,
`selesai`, `batal`. Status lain cukup ditambah ke `WARNA_STATUS` dan
kamus.

| Fungsi | Dipakai di | Mengembalikan |
|---|---|---|
| `ringkasPanel(hari)` | rangka, lonceng, kartu HARI INI | `menunggu`, `tiba`, `pulang`, `menginap`, `daftarMenunggu` (6 terbaru). Nilai kosong kalau database gagal. |
| `angkaRingkasan(hari)` | ubin Ringkasan | `masuk`, `masukLalu`, `dikonfirmasi`, `nilai`, `dibayar`, `menunggu` bulan berjalan menurut zona situs |
| `cariPesanan({status, q, dari, sampai, urut, batas})` | meja, kalender, tiba terdekat | daftar pesanan. `dari` berarti `check_out > dari`, `sampai` berarti `check_in < sampai` |
| `hitungPesanan({status, q})` | jumlah di meja pesanan | angka |
| `daftarTutup(dari)` | kalender | `id`, `kamar_id` (null untuk semua unit), `mulai`, `akhir`, `alasan` |
| `daftarKamar(true)` | ubin keterisian, kalender, persiapan | unit dengan `nama`, `aktif`, `jumlah_unit`, `foto` |
| `statistikSitus(hari, rentang, pilih)` | statistik | lihat tipe `Statistik` di `lib/statistik.ts` |
| `ambilSitus()` | sapaan, salam WhatsApp | paling tidak `nama` |
| `blokLuar(dari, sampai)`, `cariBentrok(dari, sampai)` | kalender, Ringkasan, Sinkron OTA | malam dari OTA per unit dan bentrok, lihat `sinkron.md` |

Tanggal selalu teks `YYYY-MM-DD` dalam zona situs (`hariIni()`), bukan
objek `Date`, supaya tidak bergeser di server berzona UTC.

## 5. Yang wajib diganti per homestay

- Enam token warna, logo, dan `alt` logo
- `situs.nama` dan kontak di pengaturan bawaan
- Zona waktu, selisih jam di SQL, dan tulisan WIT kalau bukan Papua
- Sebutan unit (Pondok) dan isi menu
- Judul tab `template: '%s | Panel Mambetron'` di `app/admin/layout.tsx`
- Subjek surel di `lib/surel.ts` kalau surel dipakai
- Warna bayangan dan gelombang yang masih memakai angka Mambetron. Cari
  `rgb(11 59 74`, `rgb(11_59_74`, dan `143 220 232` lalu ganti dengan
  warna utama dan sorot homestay baru

Yang tidak pernah masuk repo. Kata sandi admin, data database, surel
pengembang, kunci API. Semuanya di environment variables hosting
(`ADMIN_PASSWORD`, `DB_*`, `EMAIL_ADMIN`, `EMAIL_DEVELOPER`, `SMTP_*`,
`SESSION_SECRET`).

## 6. Uji Playwright

Chromium sudah terpasang di lingkungan cloud. Jalankan build, nyalakan
server dengan database uji, lalu potret setiap halaman di dua lebar dan
periksa tidak ada yang melebar.

```js
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = 'http://localhost:3101';
const b = await chromium.launch();
for (const lebar of [1280, 390]) {
  const p = await b.newPage({ viewport: { width: lebar, height: 900 } });
  const galat = [];
  p.on('pageerror', (e) => galat.push(e.message));
  await p.goto(`${BASE}/admin/masuk`);
  await p.fill('#surel', process.env.SUREL_UJI);
  await p.fill('#sandi', process.env.SANDI_UJI);
  await p.keyboard.press('Enter');
  await p.waitForURL(`${BASE}/admin`);
  for (const h of ['/admin', '/admin/pesanan', '/admin/kalender', '/admin/kamar', '/admin/pengaturan']) {
    await p.goto(BASE + h, { waitUntil: 'networkidle' });
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    console.log(lebar, h, w > lebar ? 'MELUBER' : 'ok');
    await p.screenshot({ path: `panel${h.replace(/\//g, '-')}-${lebar}.png`, fullPage: true });
  }
  // menu akun dan keluar
  await p.getByRole('button', { name: /^Akun/ }).click();
  await p.locator('#akun-panel').getByRole('button', { name: 'Keluar' }).click();
  await p.waitForURL(/masuk/);
  console.log(lebar, 'galat', galat);
  await p.close();
}
await b.close();
```

Kalau ada yang meluber, cari elemennya.

```js
await p.evaluate(() => [...document.querySelectorAll('body *')]
  .filter((e) => e.getBoundingClientRect().right > innerWidth + 0.5)
  .map((e) => e.tagName + '.' + e.className));
```

Uji juga dua server rusak, satu dengan `DB_PASSWORD` salah dan satu tanpa
variabel database. Panel harus tetap bisa dimasuki dan halaman Ringkasan
menampilkan petunjuk database, bukan halaman galat.

Lihat potretnya sendiri, bukan hanya angka lulus. Potong potret halaman
panjang per 2400 piksel supaya terbaca.
