# Aturan pemilik yang berlaku di semua situsnya

Pemilik membangun beberapa situs (DAMPIER, Zanclus Dive Center, Mambetron
Homestay, dan homestay lain). Aturan berikut ia tegaskan berulang kali dan
berlaku juga di panel, kecuali situs itu punya aturan sendiri yang berbeda.

## Tulisan yang tampil

- Tanpa **titik dua** di kalimat, judul, label, atau pembuka daftar
  (juga ：di Mandarin). Boleh di jam (07:00), rasio (16:9), alamat (https://).
- Tanpa **titik koma** (juga ；).
- Tanpa **tanda pisah panjang** (—) dan tanda pisah berspasi ( – ). Rentang
  ditulis rapat (14–16 Nov 2026, 07–21).
- Label dan nilai dipisah dengan baris atau tampilan ("KODE" di atas
  "MB2U4EH6", bukan "Kode: MB2U4EH6"). Daftar dibuka dengan kalimat utuh.
- Komentar kode tidak ikut aturan ini.

## Tata letak

- **Tanpa garis datar pemisah** (`<hr>`, `border-t`/`border-b` sebagai
  pemisah, `divide-y`). Pisahkan dengan jarak, latar, atau bayangan lembut.
  Bingkai kartu, kolom isian, dan peta boleh. Di panel, baris pesanan
  adalah blok berbingkai sendiri dengan jarak, bukan tabel bergaris.
- **Kartu yang sendirian melebar penuh.** Dua kartu di baris terakhir kisi
  tiga kolom dibagi rata.
- **Nomor atau ikon, pilih satu** di satu butir.
- Tanpa hiasan garis putus-putus berpanah.
- Pemilik tidak suka warna krem keabuan. Latar panel abu dingin.

## Ponsel

- Lembar yang ditambatkan ke bawah memakai `svh` dengan `vh` sebagai
  cadangan (`tinggi-lembar` di `panel.css`).
- Kunci gulir halaman dengan membekukan body (`position: fixed`), bukan
  `overflow: hidden` saja, karena Safari mengabaikannya untuk sentuhan
  (`useKunciGulir`).
- Ketuk di luar menutup, dengan pendengar di dokumen, bukan `onClick` di
  latar, karena iPhone tidak mengirim click ke elemen tanpa penangan
  (`useTutupLuar`).
- Jangan beri `backdrop-blur`, `filter`, atau `transform` pada leluhur
  panel `fixed`.
- Tidak boleh ada gulir menyamping di 390 px. Tabel tersembunyi untuk
  pembaca layar dibungkus `div.sr-only`, angka rupiah besar diringkas.

## Isi dan panel

- Semua yang tampil di situs publik harus bisa diubah dari panel pengelola
  (kecuali teks berkas bahasa, yang disebut terus terang ke pemilik).
- Data pribadi pendiri, nomor WhatsApp mitra, kunci API, dan rahasia tidak
  pernah masuk repo, cadangan, atau halaman publik.
- Pemilik memakai kata sandinya sendiri. Jangan menyuruhnya memakai kata
  sandi buatan Claude. Contoh nilai boleh ditawarkan, tidak diwajibkan.

## Pengujian dan laporan

- Uji di peramban, bukan hanya membaca kode. Dari lingkungan cloud hanya
  Chromium Linux yang bisa dijalankan. Katakan itu, dan sebut Windows, Mac,
  Android, dan iOS belum diperiksa.
- Laporan ke pemilik dalam bahasa Indonesia, ringkas, tanpa istilah teknis
  yang tidak perlu.
