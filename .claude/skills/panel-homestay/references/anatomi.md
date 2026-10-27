# Anatomi panel

Acuan visualnya tangkapan layar panel DAMPIER ("Meja pengelola") yang
dikirim pemilik. Semua ukuran di bawah sudah dicoba di Mambetron pada
1280 px dan 390 px.

## Daftar isi

1. Rangka (bilah atas, menu samping, lembar ponsel)
2. Kepala halaman
3. Halaman Ringkasan
4. Statistik pengunjung
5. Meja pesanan
6. Kalender
7. Sinkron OTA
8. Halaman lain
9. Database bermasalah

## 1. Rangka

Berkas `components/admin/RangkaPanel.tsx`, dipasang oleh
`app/admin/(panel)/layout.tsx`. Pembungkus terluar di `app/admin/layout.tsx`
memberi kelas `panel` dan latar, supaya halaman masuk dan ganti sandi juga
ikut tema.

**Bilah atas** putih, `sticky top-0`, tinggi 4.5rem, bayangan sangat tipis
di bawahnya (bukan garis). Isinya dari kiri

- logo horizontal homestay dan label kecil "ADMIN"
- di kanan pil "Kembali ke situs" (mulai `md`, di bawahnya pindah ke lembar menu)
- lonceng bulat dengan lencana merah jumlah pesanan menunggu. Isinya enam
  pesanan menunggu terbaru dan tautan ke `/admin/pesanan?status=menunggu`
- pil akun berisi lingkaran inisial, peran ("Pemilik" atau "Pengembang"),
  dan panah. Menunya berisi "Masuk sebagai" dengan surel di baris sendiri,
  Ganti kata sandi, Lihat situs, Keluar
- tombol menu bulat gelap, hanya di bawah `lg`

Lonceng dan menu akun saling bergantian. Ketuk tombol yang lain langsung
berpindah, ketuk di luar menutup lewat pendengar di dokumen
(`useTutupLuar`), Esc menutup.

**Menu samping** putih, lebar sekitar 18rem, hanya `lg` ke atas. Label
"MENU", lalu butir menu dengan ikon garis 20 px dan teks 1.0625rem. Butir
aktif berupa pil `bg-panel-utama` teks putih dengan bayangan lembut. Butir
Pesanan membawa lencana jumlah menunggu. Grup ("Situs web") membuka ke
bawah dan otomatis terbuka kalau salah satu isinya aktif. Di bawah menu ada
kartu **HARI INI** `bg-panel-lembut` berisi satu kalimat utuh, misalnya
"2 tamu tiba dan 1 pulang hari ini. 1 pesanan menunggu konfirmasi uang
muka."

Menu Mambetron. Ringkasan, Pesanan, Kalender, Sinkron OTA, Bungalow, Kegiatan, Ulasan,
Situs web (Isi situs, Foto situs), Akun & kata sandi. Homestay lain
mengganti isi `menu()` sesuai halaman yang ia punya.

**Lembar ponsel.** Di bawah `lg` menu samping menjadi lembar dari bawah
dengan latar `bg-panel-utama/40`, tinggi dari kelas `tinggi-lembar`
(`88svh` dengan `88vh` sebagai cadangan, ada di `panel.css`), gulir halaman dikunci dengan
membekukan body (`useKunciGulir`), ketuk di luar menutup, pindah halaman
menutup.

## 2. Kepala halaman

`JudulAdmin` di `components/admin/Kabar.tsx`. Alis kecil huruf kapital
"MEJA PENGELOLA · OKTOBER 2026" (bulan berjalan), judul besar huruf judul
situs (`text-[2.4rem] sm:text-5xl`), satu kalimat penjelas abu, dan tombol
utama di kanan yang turun ke bawah di ponsel. `Kabar` menampilkan pesan
berhasil (`bg-buih-2`) atau galat (merah muda) dari parameter `ok` dan
`galat` di alamat.

## 3. Halaman Ringkasan

Urutan dari atas, semuanya kisi `gap-6`.

1. **Kartu sapaan** `bg-panel-utama`, sudut 1.75rem, gelombang SVG samar di
   bawah. Alis "{Peran} · meja pengelola", judul "Selamat pagi, tim
   {kata pertama nama homestay}.", kalimat jumlah menunggu, dan
   `JamLangsung` (jam besar HH.MM.SS dan baris tanggal · WIT) di kanan.
   Salam mengikuti jam situs (pagi 04 sampai 11, siang sampai 15, sore
   sampai 18, lalu malam).
2. **Enam ubin angka** `grid-cols-2 xl:grid-cols-3`. Pesanan masuk bulan
   ini (dengan bulan lalu), dikonfirmasi (persen dari masuk), menunggu
   konfirmasi, tiba hari ini (dengan pulang dan tamu menginap), keterisian
   30 hari (malam pondok terisi dari malam tersedia), nilai pesanan bulan
   ini (dengan yang sudah dibayar). Angka rupiah diringkas di ponsel
   (`rupiahRingkas`, "Rp 5,1 jt") supaya tidak patah. Ubin yang punya
   halaman tujuan menjadi tautan.
3. **Statistik pengunjung** (bagian 4).
4. **Perlu perhatian.** Pesanan menunggu lebih dari sehari, atau
   dikonfirmasi tapi belum lunas dengan tanggal tiba tiga hari lagi atau
   kurang. Kosong berarti kalimat "Tidak ada yang perlu dikejar".
5. **Tiga kartu kecil.** Tiba terdekat (tiga tamu), Malam ini (pondok
   terisi dan jumlah tamu), Status situs (buka atau mode pengembang, dengan
   tombol yakin untuk menutup atau membuka).
6. **Persiapan situs**, hanya tampil kalau ada yang belum. Butir berupa
   kotak latar dengan ikon info dan panah. WhatsApp, rekening, foto setiap
   pondok, titik peta, SITE_URL, surel.
7. **Meja pesanan** sepuluh terbaru (bagian 5), formulir mengarah ke
   `/admin` sendiri.

## 4. Statistik pengunjung

`components/admin/StatistikSitus.tsx` (server), data dari
`lib/statistik.ts`.

- Kepala. Alis "STATISTIK SITUS", judul "Pengunjung website", chip hijau
  "Langsung", "Diperbarui HH.MM WIT".
- Empat ubin `grid-cols-2 xl:grid-cols-4`. "Aktif sekarang" (5 menit
  terakhir) berlatar gelap, lalu Hari ini, 7 hari terakhir, 30 hari
  terakhir, masing-masing dengan tampilan halaman.
- Grafik batang satu warna (`bg-panel-utama-2`), tanpa legenda karena hanya
  satu deret. Angka di atas batang, untuk 30 hari hanya hari ini dan
  puncaknya. Hari ini ditandai lewat label "Hari ini" tebal, bukan warna
  kedua. Setiap batang tautan ke `?hari=YYYY-MM-DD&rentang=7#statistik`
  dengan `scroll={false}`. Tabel tersembunyi untuk pembaca layar dibungkus
  `div.sr-only`, karena tabel yang diberi `sr-only` langsung tetap melebar
  dan membuat halaman ponsel bergulir menyamping.
- Rincian hari (`bg-panel-lembut`). Pengunjung, tampilan, negara dengan
  bendera dari `Intl.DisplayNames`, halaman teratas.
- Asal negara 30 hari, batang tipis dan persen, dengan catatan privasi.

Penghitungan. `components/Kunjungan.tsx` mengirim `navigator.sendBeacon`
ke `/api/kunjungan` setiap jalur berubah. Rute itu melewati Do Not Track,
GPC, dan sesi pengelola, lalu `catatKunjungan` menyaring robot, membatasi
60 per menit per IP, dan menyimpan sidik
`sha256(rahasia|tanggal|ip|ua)` 16 huruf. Baris lebih tua dari 400 hari
dibersihkan sesekali.

## 5. Meja pesanan

`components/admin/MejaPesanan.tsx`. Setiap pesanan satu blok berbingkai
`ring-1 ring-panel-garis` sudut 1rem, jarak antarbaris, tidak pernah
bergaris pemisah. Pesanan kurang dari 24 jam berlatar `bg-panel-lembut/60`
dengan chip BARU.

Kisi `grid-cols-2` di ponsel dan tablet, `xl:grid-cols-[1fr_1.1fr_1.5fr_0.9fr]`
di layar lebar. Label kecil kapital di atas nilai (KODE, TAMU, YANG
DIPESAN, TANGGAL, TOTAL, STATUS), tanpa titik dua. Status memakai
`LencanaStatus` dan chip bayar (LUNAS hijau, DIBAYAR Rp... rona merek,
BELUM DIBAYAR merah muda). Tombol "Kabari tamu" membuka WhatsApp dengan
salam berisi nama homestay dari pengaturan, "Lihat detail" ke halaman
pesanan.

Di atas daftar ada formulir GET (kotak cari bulat dengan ikon, pilihan
status, tombol Saring), jadi saringan tersimpan di alamat. Halaman
`/admin/pesanan` memakai pil status (Semua, Menunggu uang muka,
Dikonfirmasi, Lunas, Selesai, Dibatalkan) dan pil "Hanya yang akan datang".

## 6. Kalender

`app/admin/(panel)/kalender/page.tsx`. Parameter `bulan=YYYY-MM`,
`pondok`, `tgl`.

- Kepala kalender. Dua tombol bulat sebelum dan sesudah, judul bulan,
  tautan "Ke bulan ini" kalau bukan bulan berjalan, pilihan pondok
  (`PilihPondok`) di kanan.
- Kisi tujuh kolom mulai Senin di wadah `rounded-[1.75rem] bg-panel-latar`,
  sel hari putih bersudut. Hari di luar bulan pucat. Hari ini lingkaran
  penuh gelap, tanggal terpilih `ring-2`.
- Di samping angka tanggal, jumlah unit terisi ("3/7") di layar `sm` ke
  atas. Unit dihitung sekali per malam, dari situs ini maupun dari OTA.
- Chip per hari di layar `sm` ke atas. "Penuh" `bg-panel-lembut`, "Tutup ·
  alasan" merah muda, nama tamu dengan titik status (jingga menunggu, aksen
  untuk yang lain, ditambah "×N" bila memesan beberapa unit), "Booking.com ·
  unit 1" ungu untuk malam dari OTA, lalu "+N lagi". Dengan satu jenis
  pondok chip cukup memuat nama tamu, dengan beberapa jenis "Pondok · Nama".
  Kisi chip `grid-cols-[minmax(0,1fr)]` dan `min-w-0` supaya teks panjang
  terpotong, bukan melebarkan sel.
- Di ponsel chip diganti titik kecil (ungu untuk OTA) atau bilah penuh, dan
  legenda di bawah kisi ikut berubah bentuk.
- Rincian tanggal terpilih. Tiba, Pulang, Menginap malam ini, kotak ungu
  "Terisi dari OTA" (situs, unit, rentang, ringkasan dari OTA), catatan
  tutup, tombol tutup rincian.
- Kartu "Tutup tanggal". Formulir di kiri, daftar tanggal tutup dengan
  tombol hapus bulat di kanan.

## 7. Sinkron OTA

`app/admin/(panel)/sinkron/page.tsx`, menu "Sinkron OTA" di bawah Kalender.

- Kepala dengan tombol "Sinkronkan sekarang".
- Kotak merah "Ada malam yang terjual lebih dari jumlah unit" bila ada
  bentrok, berisi pondok, rentang, dan "8 pemesanan untuk 7 unit".
- Dua kolom di layar `xl`. Kartu "Tambah sambungan" (pilihan unit dengan
  keterangan "belum tersambung", nama situs dengan saran, tautan dari situs
  itu yang boleh kosong) dan kotak lembut "Cara kerja" dengan tiga langkah
  bernomor.
- "Kalender per unit", kartu per unit dalam dua kolom (`items-start`, kartu
  terakhir yang sendirian melebar penuh). Setiap sambungan berupa blok latar
  dengan nama situs, chip status (Tersambung hijau, Gagal dibaca merah,
  Belum dibaca pasir, Hanya mengirim lembut), jumlah yang terbaca dan
  waktunya, pesan galat, tautan untuk ditempel dengan tombol Salin, dan
  lipatan "Ubah sambungan" berisi formulir, Buat tautan baru, dan Hapus.
- Kotak "Yang perlu diketahui tentang tiap situs" (Booking.com, Airbnb,
  Agoda, Traveloka dan Tiket.com, agen perjalanan).

Ringkasan juga ikut. Ubin keterisian dan kartu Malam ini menghitung unit
dari OTA, dan bentrok masuk kotak Perlu perhatian.

## 8. Halaman lain

Halaman Pondok, Kegiatan, Ulasan, Isi situs, Foto situs, detail pesanan,
pesanan manual, dan ganti sandi tidak perlu ditulis ulang. Mereka memakai
`JudulAdmin`, `.kartu`, `.tombol`, `.isian`, dan nama warna situs (`laut`,
`buih`, `biru-tua`). Di dalam `.panel` nama-nama itu diarahkan ke token
panel oleh `panel.css`, jadi mereka ikut tema tanpa disentuh.

## 9. Database bermasalah

Rangka memanggil `cekDb()` dan menampilkan `DiagnosaDb` di atas isi kalau
database belum terhubung. Fungsi rangka (`ringkasPanel`) dan statistik
mengembalikan nilai kosong saat database tidak diatur atau gagal, jadi
panel tetap bisa dibuka untuk membaca petunjuknya. Kartu petunjuk yang
sendirian melebar penuh, paragrafnya dibatasi `max-w-3xl` supaya terbaca.
