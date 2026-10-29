# Sinkron kalender OTA

Dibangun di Mambetron (7 unit Pondok Tepi Pantai) supaya kalender situs
pemesanan sendiri tersambung dengan Booking.com, Airbnb, Agoda, Google
Calendar, dan agen perjalanan. Lewat iCal, bukan API channel manager, jadi
yang berpindah hanya malam terisi. Harga, nama tamu, dan jumlah unit tidak.

## Daftar isi

1. Data
2. Pembagian unit
3. Ekspor tanpa pantulan
4. Membaca kalender situs lain
5. Kapan dibaca
6. Ketersediaan, kalender, dan bentrok
7. Keterbatasan tiap situs
8. Uji dengan OTA tiruan
9. Kalender mitra DAMPIER

## 1. Data

- `kalender_sambungan`. Satu baris per tautan, terikat ke `kamar_id` dan
  `unit` (1 sampai `jumlah_unit`). `nama` situsnya, `url` kalender yang
  dibaca dari situs itu (kosong untuk sambungan yang hanya mengirim, misalnya
  agen), `token` 32 huruf heksa untuk tautan ekspor `/ical/<token>.ics`,
  lalu `dicoba`, `berhasil`, `galat`, `jumlah` dari bacaan terakhir.
- `kalender_luar`. Malam yang terbaca, `mulai` malam pertama dan `selesai`
  hari pulang (bukan malam), sama seperti DTEND iCal. Diganti seluruhnya
  setiap bacaan yang berhasil, di dalam transaksi.

Tanggal selalu teks `YYYY-MM-DD` dalam zona situs.

## 2. Pembagian unit

Pesanan situs sendiri tidak membawa nomor unit. `petaUnit()` di
`lib/sinkron.ts` membaginya setiap kali dibutuhkan.

- Malam dari OTA tetap di unitnya sendiri.
- Tanggal tutup mengambil semua unit.
- Pesanan situs (urut tanggal tiba, lalu id) mendapat unit bernomor
  terkecil yang kosong sepanjang menginap. Bila tidak ada satu unit pun yang
  kosong sepanjang menginap, dibagi malam per malam.

Karena dihitung ulang, pesanan yang batal atau OTA yang menjual unit tertentu
menggeser pesanan situs ke unit lain. Itu tidak masalah, yang dikirim ke OTA
hanya terisi atau kosong.

## 3. Ekspor tanpa pantulan

Tautan ekspor sebuah sambungan berisi malam unit itu yang terisi oleh
pesanan situs, tanggal tutup, dan malam dari sambungan lain di unit yang
sama, tapi tidak malam dari sambungan itu sendiri. Kalau dikirim balik,
blokir Booking.com yang dibaca dari Booking.com akan kembali ke Booking.com,
dan bila Booking.com ikut mengekspor blokir yang ia impor, malam itu tidak
pernah terbuka lagi walau tamunya batal.

Unit yang sudah tidak ada (jumlah unit dikurangi) atau pondok yang
dinonaktifkan diekspor penuh selama 500 hari, supaya tidak ada yang
memesannya di tempat lain. Tautan ekspor tidak memuat nama tamu, kode, atau
kontak, ringkasannya "Tidak tersedia". Saat database mati, tautan menjawab
503 dengan `retry-after`, bukan kalender kosong.

## 4. Membaca kalender situs lain

`lib/ical.mjs` (JS murni, uji `node --test lib/*.test.mjs`).

- Baris terlipat disambung, CRLF dan LF diterima.
- `DTSTART;VALUE=DATE` dipakai apa adanya. Waktu UTC (`...Z`) dipindah ke
  zona situs dulu, waktu lokal atau ber-TZID memakai tanggalnya sendiri.
- Tanpa DTEND berarti satu malam. DTEND sama dengan DTSTART dianggap satu
  malam.
- `STATUS:CANCELLED` dilewati. Isi yang bukan VCALENDAR ditolak.

`rapikanUrl()` mengubah `webcal://` menjadi `https://`, menolak selain http
dan https, dan menolak alamat jaringan dalam (localhost, 10.x, 192.168.x,
dan sejenisnya). `SINKRON_IZINKAN_LOKAL=1` hanya untuk uji lokal.

Pengambilan memakai batas 20 detik dan 5 MB. Pesan galat ditulis untuk
pemilik ("Tautan tidak ditemukan di situs itu. Mungkin tautannya sudah
diganti.") dan disimpan di sambungannya. Bacaan yang gagal tidak menghapus
malam dari bacaan terakhir yang berhasil.

## 5. Kapan dibaca

- `instrumentation.ts` membaca semua tautan 20 detik setelah server
  menyala lalu setiap 15 menit, selama aplikasi bangun.
- `pastikanSegar()` dipanggil halaman pesan, detail pondok, kalender admin,
  Ringkasan, dan Sinkron OTA. Paling sering sekali semenit per proses, dan
  hanya membaca tautan yang bacaannya lebih tua dari 15 menit. Halaman pesan
  menunggu paling lama 2,5 detik, penyimpanan pesanan paling lama 6 detik.
- Tombol "Sinkronkan sekarang" membaca semuanya saat itu juga.
- Saat menambah atau mengganti tautan, tautan itu langsung dibaca.

Satu putaran pada satu waktu per proses, empat tautan sekaligus.

## 6. Ketersediaan, kalender, dan bentrok

- `sisaKamar()` mengurangi jumlah unit berbeda dari OTA di setiap malam,
  jadi kalender tamu dan pemeriksaan saat menyimpan pesanan ikut menutup
  malam itu.
- Kalender admin menghitung unit terisi per malam (pesanan situs ditambah
  unit OTA, paling banyak jumlah unit) dan menampilkan chip ungu per situs.
- `cariBentrok()` mencari malam dengan pesanan situs ditambah unit OTA
  melebihi jumlah unit. Muncul di Sinkron OTA dan Perlu perhatian.

## 7. Keterbatasan tiap situs

Periksa lagi sebelum memasang, aturan situs pemesanan bisa berubah. Keadaan
Oktober 2026, dari dokumentasi penyedia PMS dan forum, bukan halaman resmi.

- Booking.com hanya menyinkronkan tipe kamar yang berisi satu unit. Tujuh
  unit dalam satu tipe perlu dipecah menjadi tujuh tipe, atau pakai channel
  manager.
- Airbnb satu kalender per iklan.
- Agoda Homes punya impor dan ekspor iCal, Agoda YCS perlu ditanyakan.
- Traveloka dan Tiket.com tidak memakai iCal.
- Situs pemesanan membaca tautan kita tiap 30 menit sampai beberapa jam,
  jadi selalu ada jeda. iCal tidak menjamin tidak ada pesanan ganda,
  bentrok harus terlihat oleh pemilik.

## 8. Uji dengan OTA tiruan

Uji di Mambetron memakai server kecil di port 3999 yang menyajikan berkas
`.ics` dari folder, halaman HTML biasa, tautan yang menjawab setelah 30
detik, dan 404. Situs dijalankan dengan `SINKRON_IZINKAN_LOKAL=1` dan
database baru. Yang diperiksa (33 pemeriksaan).

- Tambah sambungan dengan tautan dan tanpa tautan, status di halaman.
- Ekspor berjenis `text/calendar`, tanpa nama tamu, tanpa blokir sendiri.
- Pesanan situs muncul di ekspor unit yang tepat, pembagian unit di sekitar
  malam OTA.
- Malam penuh karena OTA ditolak di kalender tamu, unit terakhir masih
  bisa dipesan.
- Bentrok tampil di Sinkron OTA dan Ringkasan.
- Kalender admin menampilkan chip dan rincian OTA.
- 404, halaman HTML, dan tautan lambat memberi pesan jelas tanpa membuang
  malam lama.
- `webcal` disimpan sebagai `https`, ftp dan tulisan biasa ditolak.
- Buat tautan baru mematikan tautan lama, token asing 404.
- Hapus sambungan menghapus malamnya.
- Ponsel 390 px tanpa gulir menyamping, tanpa galat konsol.

## 9. Kalender mitra DAMPIER

Homestay yang juga mitra DAMPIER (thedampier.com) punya kalender mitra yang
memuat semua kamarnya, dengan Booking.com, tamu DAMPIER, dan catatan
pesanan offline. `lib/dampier.ts` menyambungkan situs ke kalender itu lewat
`/api/kamar/<kunci>` DAMPIER (kalender mitra, Sambungkan OTA, Sambungkan
website, kotak Untuk programmer website). Satu sambungan untuk semua kamar
satu tipe bungalow, bukan per unit seperti iCal. Setelah tersambung, DAMPIER
menjadi channel manager. OTA disambungkan per kamar di kalender mitra
DAMPIER, dan situs hanya satu saluran lagi dari kalender itu.

- Mode channel manager (`dampierAktif()`). Saat menyambung, `kalender_luar`
  dikosongkan. Selama tersambung, `sinkronSatu()` dan `sinkronSemua()` tidak
  membaca tautan iCal situs, dan ekspor sambungan dua arah kosong, jadi tiap
  OTA hanya mendengar dari DAMPIER. Ekspor untuk agen tetap jalan dan
  membawa malam DAMPIER. Halaman bernama Channel manager, pengaturan iCal
  per unit hanya tampil tanpa DAMPIER (bagian Tanpa DAMPIER), dan
  sambungan lama disebut di kartu DAMPIER dengan tombol Hapus sambungan
  lama. Putus mengosongkan `dicoba` supaya iCal dibaca lagi saat itu juga.

- Alamatnya memuat kunci, jadi disimpan di baris `dampier` tabel
  `pengaturan`, hanya dipanggil dari server, dan panel hanya menampilkan
  empat huruf terakhirnya. Diperiksa dengan satu bacaan sebelum disimpan.
- Kirim. Pesanan yang belum batal dan belum lewat dikirim sebagai jumlah
  kamar tanpa nomor (`jumlahKamar`, kode pesanan sebagai `id`), tanggal
  tutup sebagai Tanggal tutup untuk semua kamar dan dipotong per 90 malam.
  Daftarnya dikirim utuh dengan `ganti: true` saat sidiknya berubah, tiap
  6 jam, dan saat `pesananWebsite` di DAMPIER berbeda dari jumlah yang
  dikirim. Telepon dan surel tamu tidak ikut.
- Baca. `GET ?hari=400` memberi `terisi` per malam, termasuk pesanan situs
  ini. Yang disimpan di `kalender_dampier` adalah `terisi` dikurangi kamar
  yang dikirim situs ini untuk malam itu. Karena daftar yang dikirim dan
  yang dikurangi sama, hitungannya tidak ganda.
- `blokDampier()` mengubah jumlah itu menjadi blok di unit tertinggi
  (`sambungan_id` 0, nama DAMPIER), lalu ikut dihitung `sisaKamar()`,
  `petaUnit()`, `cariBentrok()`, dan `blokLuar()`. Unitnya hanya tempat
  dalam hitungan, jadi kalender admin menulis "DAMPIER · 3 kamar".
- Dibaca paling sering tiap 5 menit dari `sinkronSemua()`, dan langsung
  (`kabariDampier()`) setelah pesanan, pembayaran, atau tanggal tutup
  berubah. Gagal baca menyimpan pesan dan mempertahankan malam terakhir.
  `bentrok` dari jawaban kirim tampil merah di kartu.
- Uji di Mambetron memakai DAMPIER tiruan di port 4557 yang mengikuti
  `ketersediaanKamarSitus` dan `terimaPesananKamarSitus` DAMPIER, situs
  dengan `SINKRON_IZINKAN_LOKAL=1`, dan OTA tiruan di port 3999 sebagai
  sambungan iCal lama. 51 pemeriksaan, dari alamat salah, kunci salah,
  kirim dan baca, impor iCal lama berhenti, pesanan tamu, batal, tanggal
  tutup, kirim ulang yang hilang, bentrok, ekspor, hapus sambungan lama,
  kalender admin, DAMPIER mati, kunci diganti, ponsel 390 px, sampai
  putus.
