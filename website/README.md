# Situs pemesanan Mambetron Homestay

Situs ini dibuat dengan Next.js 16.2, Tailwind CSS 4, dan database MySQL. Isinya halaman utama, daftar pondok, pemesanan dengan kalender tanggal kosong, halaman pesanan untuk tamu, dan panel pengelola di `/admin`. Bahasa Indonesia dan Inggris.

Situs tetap bisa dibangun dan dibuka walau environment variables masih kosong. Tanpa database, situs tampil dengan isi bawaan dan tombol kirim pesanan belum aktif. Setelah database diisi, tabel dan isi awal dibuat sendiri pada kunjungan pertama.

## Isi folder

Bagian penting di folder ini sebagai berikut.

| Folder atau berkas | Isi |
| --- | --- |
| `app/(situs)` | Halaman untuk tamu |
| `app/admin` | Panel pengelola dan semua aksi simpan |
| `app/api/foto/[id]` | Mengirim foto yang tersimpan di database |
| `app/api/sehat` | Cek cepat apakah database dan panel sudah siap |
| `components` | Bagian tampilan, termasuk kalender dan formulir pesan |
| `lib/bawaan.mjs` | Isi bawaan dan daftar semua teks yang bisa diubah dari panel |
| `lib/kamus.ts` | Teks tombol dan label dalam dua bahasa |
| `lib/skema.mjs` | Tabel database |
| `database/skema.sql` | Salinan skema untuk diimpor lewat phpMyAdmin bila perlu |
| `public/merek` | Logo, maskot, dan ilustrasi dari folder `brand` |
| `.env.example` | Daftar environment variables dengan nilai bawaan |

Aset di `public/merek` dan huruf di `app/fonts` dibuat dari folder `brand` dengan perintah `npm run build` di akar repo, jadi jangan diubah tangan.

## Deploy ke Hostinger

Langkahnya sebagai berikut. Nama menu di hPanel bisa sedikit berbeda karena Hostinger sering memperbarui tampilannya.

1. Buat database di hPanel, menu Databases lalu MySQL Databases. Catat nama database, nama pengguna, dan kata sandinya. Hostinger biasanya menambahkan awalan seperti `u123456789_` pada nama database dan pengguna.
2. Buat aplikasi Node.js di hPanel, lalu hubungkan repo GitHub ini atau unggah isi repo sebagai zip.
3. Isi pengaturan build seperti tabel di bawah.
4. Isi environment variables. Salin daftar dari `.env.example`, lalu isi nilainya. Minimal isi `DB_NAME`, `DB_USER`, `DB_PASSWORD`, dan `ADMIN_PASSWORD`.
5. Jalankan deploy. Setelah selesai, buka `https://domainmu/api/sehat`. Bila tertulis `"database":"terhubung"` dan `"panelPengelola":"siap"`, situs sudah siap.
6. Buka `https://domainmu/admin`, masuk dengan `ADMIN_PASSWORD`, lalu ikuti daftar di dasbor. Isi nomor WhatsApp, rekening, foto pondok, dan periksa semua teks bawaan.

| Isian di hPanel | Nilai |
| --- | --- |
| Preset framework | Next.js. Bila tidak ada di daftar, biarkan Other |
| Branch | Branch yang berisi kode ini |
| Versi node | 22.x atau 20.x |
| Root directory | `./website` |
| Build command | `npm run build` |
| Package manager | npm |
| Direktori output | `.next` |
| Entry file | `server.js` |

Root directory wajib diubah ke `./website`. Bila dibiarkan `./`, Hostinger akan membangun alat pembuat berkas merek di akar repo, bukan situsnya.

Berkas `server.js` menjalankan hasil build sama seperti `npm start`. Berkas ini dipakai bila Hostinger menjalankan aplikasi dengan `node server.js`, misalnya saat preset Other dipilih.

Port diatur Hostinger sendiri lewat variabel `PORT`, tidak perlu diisi.

### Catatan versi Next.js

Next.js sengaja dikunci di versi 16.2.12. Mulai versi 16.3, mesin kompilasi Next.js butuh pustaka sistem glibc 2.30, sedangkan server build Hostinger memakai versi yang lebih lama, sehingga build gagal dengan pesan tentang `GLIBC_2.29` atau `@next/swc-linux-x64-gnu`. Jangan menaikkan versi Next.js sebelum memastikan server Hostinger sudah mendukungnya.

Perintah build juga sengaja memakai webpack (`next build --webpack`), bukan Turbopack bawaan Next.js 16. Turbopack memanggil perintah `node` dari PATH sistem untuk memproses CSS, dan di server build Hostinger perintah itu tidak menjalankan Node yang sama, sehingga build gagal dengan pesan `node process exited before we could connect to it` pada `/icon.svg/route`. Webpack memproses CSS di dalam proses Node yang sedang berjalan, jadi tidak terkena masalah ini. Saat mencoba di komputer sendiri, `npm run dev` tetap memakai Turbopack.

### Environment variables

Semua nilai dibaca saat aplikasi berjalan. Bila nilai diubah di hPanel, mulai ulang aplikasi supaya terbaca.

| Nama | Wajib | Keterangan |
| --- | --- | --- |
| `DB_HOST` | Tidak | Bawaan `localhost`. Pakai host yang tertulis di hPanel bila berbeda |
| `DB_PORT` | Tidak | Bawaan `3306` |
| `DB_NAME` | Ya | Nama database dari hPanel |
| `DB_USER` | Ya | Pengguna database dari hPanel |
| `DB_PASSWORD` | Ya | Kata sandi pengguna database |
| `ADMIN_PASSWORD` | Ya | Kata sandi awal semua akun panel `/admin`. Pakai minimal 10 karakter |
| `SESSION_SECRET` | Tidak | 32 karakter acak untuk menandatangani sesi masuk |
| `SITE_URL` | Tidak | Alamat lengkap situs, contoh `https://mambetronhomestay.com` |
| `SMTP_HOST` | Tidak | Server surel keluar. Untuk surel Hostinger `smtp.hostinger.com` |
| `SMTP_PORT` | Tidak | Bawaan `465` |
| `SMTP_USER` | Tidak | Alamat kotak surel pengirim, contoh `halo@mambetronhomestay.com` |
| `SMTP_PASSWORD` | Tidak | Kata sandi kotak surel itu |
| `EMAIL_FROM` | Tidak | Nama dan alamat pengirim, contoh `Mambetron Homestay <halo@mambetronhomestay.com>`. Alamatnya harus sama dengan `SMTP_USER` |
| `EMAIL_ADMIN` | Tidak | Surel pemilik untuk masuk panel, sekaligus penerima pemberitahuan pesanan baru. Bila kosong, dipakai `SMTP_USER`, lalu `halo@mambetronhomestay.com` |
| `EMAIL_DEVELOPER` | Tidak | Surel pengembang yang juga boleh masuk panel. Boleh lebih dari satu, dipisah koma |

Untuk host `localhost`, aplikasi mencoba soket MySQL lebih dulu, lalu `127.0.0.1`, lalu nama host itu sendiri. Node bisa membaca `localhost` sebagai alamat IPv6 `::1`, padahal MySQL di hosting bersama biasanya hanya mendengar di IPv4 atau soket. Jalur soket tertentu bisa dipaksa dengan `DB_SOCKET`.

Variabel database juga terbaca dengan nama lain yang sering dipakai, yaitu `DB_DATABASE`, `DB_USERNAME`, `DB_PASS`, awalan `MYSQL_`, atau satu `DATABASE_URL` berbentuk `mysql://pengguna:sandi@host:3306/nama`. Selama database belum terhubung, panel menampilkan nilai mana yang terbaca dan mana yang kosong tanpa menampilkan kata sandinya, jawaban server untuk tiap alamat yang dicoba, dan arti jawaban itu, misalnya kata sandi database ditolak.

Berkas `.env` berisi kata sandi tidak boleh masuk GitHub. Berkas itu sudah ada di `.gitignore`.

## Mencoba di komputer sendiri

Butuh Node.js 20.9 atau lebih baru dan MySQL atau MariaDB.

```bash
cd website
npm install
cp .env.example .env      # lalu isi DB_NAME, DB_USER, DB_PASSWORD, ADMIN_PASSWORD
npm run dev               # buka http://localhost:3000
```

Perintah lain yang tersedia sebagai berikut.

| Perintah | Guna |
| --- | --- |
| `npm run build` lalu `npm start` | Menjalankan versi produksi |
| `npm run start:node` | Sama dengan `npm start`, lewat `server.js` |
| `npm run db:migrasi` | Membuat tabel dan isi awal dengan nilai dari `.env` |
| `npm run db:sql` | Menulis ulang `database/skema.sql` dari `lib/skema.mjs` |
| `npm run cek` | Memeriksa tipe TypeScript |

## Cara kerja pemesanan

Setiap jenis pondok punya jumlah unit. Mambetron punya satu jenis, Pondok Tepi Pantai, dengan tujuh unit yang sama tipe dan ukurannya dan semuanya menghadap pantai. Satu malam penuh bila unit yang terpesan di situs ini, unit yang terisi dari OTA lewat sinkron kalender, dan tanggal tutup sudah sama dengan jumlah unit. Pesanan berstatus apa pun kecuali Dibatalkan ikut menahan pondok. Saat tamu mengirim pesanan, baris pondok dikunci di database selama pemeriksaan, jadi dua tamu tidak bisa mendapat unit terakhir di malam yang sama.

Harga dihitung per orang per malam atau per pondok per malam, sesuai pilihan di panel. Anak di bawah 12 tahun bisa diberi harga sendiri. Uang muka dihitung dari persen di menu Isi situs dan dibulatkan ke atas per seribu rupiah.

Tamu mendapat halaman pesanan dengan tautan rahasia. Dari sana tamu melihat rekening, menyalin nomor, dan mengirim bukti transfer lewat WhatsApp. Pengelola menandai uang muka diterima, lunas, atau selesai dari panel.

Foto disimpan di database supaya tidak hilang saat deploy ulang. Foto diperkecil di peramban menjadi paling lebar 1800 piksel sebelum diunggah.

Halaman utama punya lima tempat foto di menu Foto situs. Foto utama tampil penuh di belakang judul besar di komputer dan tablet, foto utama untuk ponsel menggantikannya di layar di bawah 768 piksel, foto kartu keunggulan mengisi tiga kartu di bawah foto utama sesuai urutannya, foto tentang kami tampil di samping kotak rencana menginap, dan foto ajakan tampil di kotak berwarna laut. Selama belum ada foto unggahan, foto utama memakai foto mendatar pondok di tepi pantai (`public/foto/pondok-tepi-air.jpg`) dan ponsel memakai foto tegak dermaga pondok (`public/foto/dermaga-pondok.jpg`). Bila foto bawaan ini diganti, beri nama berkas baru. CDN Hostinger dan peramban bisa terus menampilkan foto lama selama namanya sama. Bila hanya foto utama yang diunggah, ponsel ikut memakainya. Foto tentang kami dan foto ajakan memakai ilustrasi siang dan pagi di Raja Ampat yang dibuat oleh `scripts/desain/situs.mjs`, dan kartu keunggulan tanpa foto memakai ilustrasi laut `public/merek/kamar-1.svg` sampai `kamar-3.svg`.

Judul dan teks kartu keunggulan diisi di Isi situs, bagian Halaman utama. Tulisan `{harga}` di teks kartu diganti otomatis dengan harga pondok termurah beserta perkiraannya dalam mata uang asing. Di samping kartu tampil nilai ulasan dari Booking.com (bawaannya 8,7 dari 10), lingkaran huruf para tamu yang mengulas, dan tombol Lihat di Booking.com. Tombol itu membuka halaman Mambetron di Booking.com (`https://www.booking.com/hotel/id/mambetron-homestay.html`), tanpa kode pelacak sehingga Booking.com memilih bahasa sesuai peramban pengunjung. Nilai, nama situs ulasan, tautan tombol, dan daftar tamunya diubah di bagian yang sama.

## Pondok bawaan

Database baru langsung berisi Pondok Tepi Pantai dengan tujuh unit. Harga bawaannya Rp 550.000 per orang per malam untuk dua orang, ganti di menu Pondok sesuai harga sebenarnya, begitu juga foto dan teksnya.

Database yang masih berisi tiga pondok contoh dari versi lama (Pondok Laguna, Pondok Senja, Pondok Keluarga) dipindah sekali secara otomatis saat situs pertama terhubung. Pondok Laguna menjadi Pondok Tepi Pantai lengkap dengan foto dan pesanannya, dua contoh lainnya dihapus. Pemindahan ini dilewati bila contoh itu sudah diganti namanya, ditambah pondok lain, atau Pondok Senja dan Pondok Keluarga sudah punya pesanan atau foto. Dalam keadaan itu ubah pondoknya sendiri di menu Pondok.

## Sinkron kalender dengan OTA dan agen perjalanan

Menu Sinkron OTA di panel menghubungkan kalender setiap unit dengan Booking.com, Airbnb, Agoda, Google Calendar, atau agen perjalanan lewat tautan iCal. Kalender iCal hanya tahu terisi atau kosong, jadi setiap sambungan dipasang untuk satu unit. Unit yang dijual di dua situs mendapat dua sambungan.

Setiap sambungan menukar dua tautan. Tautan dari panel (berakhiran `.ics`) ditempel di menu sinkron kalender situs itu, supaya situs itu menutup malam yang sudah terisi di sini. Tautan ekspor iCal dari situs itu ditempel di kolom tautan kalender di panel, supaya malam yang terjual di sana tertutup di sini. Untuk agen perjalanan cukup tautan dari panel saja, agen bisa membukanya di Google Calendar.

Pemesanan di situs ini tidak membawa nomor unit. Situs membaginya ke unit yang kosong, menghindari malam yang sudah terisi dari OTA, lalu menutup unit itu di tautan ekspornya. Tautan setiap sambungan tidak memuat malam yang datang dari sambungan itu sendiri, jadi blokir tidak memantul bolak-balik. Tautan ekspor hanya berisi malam yang terisi, tanpa nama tamu, harga, atau kontak.

Kalender situs lain dibaca setiap 15 menit selama aplikasi menyala, setiap kali halaman pesan atau kalender dibuka bila bacaan terakhir sudah lewat 15 menit, dan sekali lagi sebelum pesanan baru disimpan. Tombol Sinkronkan sekarang membaca semuanya saat itu juga. Situs pemesanan membaca tautan kita sesuai jadwal mereka sendiri, biasanya 30 menit sampai beberapa jam, jadi masih ada jeda kecil. Bila malam yang sama terjual di dua tempat melebihi tujuh unit, halaman Sinkron OTA dan kotak Perlu perhatian di Ringkasan menandainya supaya tamunya bisa dihubungi.

Tautan yang gagal dibaca (situs tidak menjawab, tautan sudah diganti, atau isinya bukan kalender) diberi pesan di sambungannya, dan malam dari bacaan terakhir yang berhasil tetap ditutup. Bila tautan dari panel tersebar ke orang yang salah, pakai Buat tautan baru lalu tempel tautan baru di situs itu.

Hal yang perlu diketahui tentang tiap situs, sesuai keadaan Oktober 2026.

- Booking.com hanya menyinkronkan tipe kamar yang berisi satu unit. Bila tujuh pondok dijual sebagai satu tipe berisi tujuh, iklannya perlu dipecah menjadi tujuh tipe satu unit, atau pakai channel manager. Tanyakan ke Booking.com dulu.
- Airbnb menyinkronkan per iklan, satu iklan untuk satu unit.
- Agoda Homes punya impor dan ekspor iCal. Untuk Agoda YCS tanyakan ke Agoda.
- Traveloka dan Tiket.com tidak memakai iCal. Tanggalnya ditutup manual di sana atau lewat channel manager.

Tabelnya `kalender_sambungan` (tautan per unit) dan `kalender_luar` (malam yang terbaca dari situs lain). Pembaca iCal ada di `lib/ical.mjs` dengan uji `npm run uji`, aturan sinkron di `lib/sinkron.ts`, tautan ekspor di `app/ical/[berkas]/route.ts`.

## Bahasa dan mata uang

Tombol berikon bola dunia di kepala halaman membuka pilihan bahasa, Indonesia atau Inggris. Pilihan disimpan di kuki peramban pengunjung. Kaki halaman tidak punya tombol bahasa lagi.

Harga selalu diisi, ditampilkan, dan dibayar dalam rupiah. Di bawah harga pondok, harga kegiatan, total di formulir pesan, serta total dan uang muka di halaman pesanan ada satu baris kecil berisi perkiraannya dalam dolar Amerika, euro, yen, dan yuan.

Kurs diambil dari kurs acuan Bank Sentral Eropa lewat Frankfurter (`api.frankfurter.app`, tanpa kunci API) dan disimpan 12 jam. Bila server tidak bisa mengambilnya, situs memakai kurs yang diisi di Isi situs, bagian Mata uang, lalu mencoba lagi setelah 30 menit. Kurs otomatis bisa dimatikan di bagian yang sama. Alamat sumber kurs bisa diganti lewat environment variable `KURS_URL` bila perlu.

## Kaki halaman

Kaki halaman punya tiga kolom. Kolom kiri berisi logo dan teks singkat, kolom tengah tautan pemesanan, dan kolom kanan Hubungi kami dengan nomor WhatsApp, surel, dan ikon Instagram, Facebook, TikTok, serta YouTube. Semuanya diisi di Isi situs, bagian Kontak dan lokasi. Ikon yang kolomnya dikosongkan tidak tampil.

Nomor WhatsApp dan surel punya isian bawaan, jadi tampil walau kolomnya di panel masih kosong. Facebook, TikTok, dan YouTube untuk sementara membuka halaman depan masing-masing sampai tautan akun asli diisi.

Di pita paling bawah ada tombol Masuk operator yang membuka `/admin`. Operator yang belum masuk diarahkan ke halaman masuk.

## Masuk panel, surel pemberitahuan, dan ganti kata sandi

Panel dibuka dengan surel dan kata sandi. Surel yang boleh masuk hanya `EMAIL_ADMIN` milik pemilik dan `EMAIL_DEVELOPER` milik pengembang, keduanya diisi di hPanel, tidak bisa ditambah dari panel. Semua akun mula-mula memakai `ADMIN_PASSWORD`, lalu masing-masing bisa membuat kata sandi sendiri lewat kode surel. Akun yang sedang masuk tertulis di menu akun di pojok kanan atas panel.

Bila `SMTP_HOST`, `SMTP_USER`, dan `SMTP_PASSWORD` terisi, setiap pesanan baru dikirimkan ke `EMAIL_ADMIN`, dan tamu yang mengisi surel mendapat salinan pesanannya. Surel dikirim setelah halaman pesanan tampil, jadi tamu tidak ikut menunggu, dan pesanan tetap tersimpan walau surel gagal.

Kata sandi diganti di `/admin/sandi`, lewat menu Ganti kata sandi di panel atau tautan Lupa kata sandi di halaman masuk. Tulis surel akun, lalu kode 6 angka dikirim ke surel itu bila terdaftar. Jawabannya sama walau surel tidak terdaftar, supaya daftar akun tidak bisa ditebak. Kode berlaku 10 menit, gugur setelah 5 kali salah, dan tiap akun paling banyak meminta tiga kode sejam dengan jeda satu menit.

Kata sandi baru disimpan sebagai hash scrypt di tabel `admin_akun` dan menggantikan `ADMIN_PASSWORD` untuk akun itu saja. Setelah diganti, perangkat lain yang masih masuk dengan akun itu ikut keluar, dan surel pemberitahuan dikirim ke surel akun itu. Bila kotak surel tidak bisa dibuka, ubah `ADMIN_PASSWORD` di hPanel lalu mulai ulang aplikasi. Kata sandi dari hPanel itu langsung berlaku lagi, dan kata sandi yang disimpan lewat kode diabaikan.

## Mode pengembang

Mode pengembang menutup situs sementara, misalnya selama situs masih disiapkan atau sedang diperbaiki. Nyalakan dan matikan dari kartu Status situs di Ringkasan, atau dari bagian Mode pengembang di Isi situs. Situs tetap tertutup sampai ada yang membukanya lagi dari panel.

Selama mode ini menyala, pengunjung hanya melihat halaman segera dibuka dengan tombol WhatsApp dan Instagram. Judul dan teksnya bisa diubah di Isi situs. Pemesanan dari pengunjung ditolak, dan halaman diberi tanda supaya tidak masuk Google.

Pengelola yang sudah masuk ke panel tetap melihat situs seperti biasa dan bisa mencoba memesan. Pita jingga di pojok kiri bawah mengingatkan bahwa situs sedang tertutup untuk pengunjung.

Halaman cek pesanan dan halaman pesanan tamu tetap terbuka, supaya tamu yang sudah memesan masih bisa melihat rekening dan status pesanannya.

Status buka dan tutup disimpan di database. Kalau database sedang tidak bisa dibaca, situs memakai isi bawaan dan tampil terbuka, tetapi pemesanan tetap tidak bisa dikirim.

## Tampilan panel dan statistik pengunjung

Panel mengikuti gaya meja pengelola DAMPIER. Bilah atas putih dengan lonceng pesanan menunggu dan menu akun, menu samping putih dengan kartu HARI INI, lalu halaman Ringkasan berisi kartu sapaan dengan jam WIT, enam angka bulan ini, statistik pengunjung, pesanan yang perlu dikejar, tamu yang akan tiba, dan meja pesanan. Kalender menampilkan tamu dan tanggal tutup per hari. Di ponsel menu samping menjadi lembar dari bawah.

Warna panel diatur enam token `--color-panel-*` di `app/globals.css`. Homestay lain cukup mengganti enam nilai itu, logo, dan isi pengaturan. Caranya dibukukan sebagai skill di `.claude/skills/panel-homestay/` di akar repo, lengkap dengan salinan kode, pemeriksa warna (`scripts/cek-token.mjs`), dan langkah memasang.

Statistik pengunjung dihitung situs sendiri di tabel `kunjungan`, tanpa layanan luar. Tidak ada cookie dan alamat IP tidak disimpan. Setiap pengunjung dicatat sebagai sidik acak yang berganti tiap hari, jadi satu orang dihitung sekali sehari dan tidak bisa dilacak dari hari ke hari. Pengunjung yang menyalakan Do Not Track atau GPC, robot, dan pengelola yang sedang masuk panel tidak dihitung. Negara diambil dari header hosting bila tersedia, bila tidak ditebak dari bahasa peramban, jadi angkanya perkiraan. Data lebih tua dari 400 hari dihapus sendiri.

## Yang bisa diubah dari panel

Semua yang tampil di situs bisa diubah dari panel, yaitu teks setiap bagian halaman utama, pondok beserta harga dan fotonya, kegiatan tambahan, ulasan, foto situs, kontak, titik peta, rekening, uang muka, jam check-in dan check-out, serta ketentuan menginap.

Pengecualiannya teks tombol dan label formulir, misalnya Pesan sekarang, Rencanakan liburanmu, atau Nomor WhatsApp. Teks itu ada di `lib/kamus.ts` dan perlu diubah lewat kode. Hiasan merek seperti wajah Mambe di kotak rencana menginap dan gambar hammock samar di kotak ajakan juga tetap.
