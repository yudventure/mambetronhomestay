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
| `ADMIN_PASSWORD` | Ya | Kata sandi panel `/admin`. Pakai minimal 10 karakter |
| `SESSION_SECRET` | Tidak | 32 karakter acak untuk menandatangani sesi masuk |
| `SITE_URL` | Tidak | Alamat lengkap situs, contoh `https://mambetronhomestay.com` |
| `SMTP_HOST` dan lainnya | Tidak | Surel pemberitahuan pesanan. Kosongkan bila belum dipakai |

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

Setiap jenis pondok punya jumlah unit. Satu malam penuh bila unit yang terpesan ditambah tanggal tutup sudah sama dengan jumlah unit. Pesanan berstatus apa pun kecuali Dibatalkan ikut menahan pondok. Saat tamu mengirim pesanan, baris pondok dikunci di database selama pemeriksaan, jadi dua tamu tidak bisa mendapat unit terakhir di malam yang sama.

Harga dihitung per orang per malam atau per pondok per malam, sesuai pilihan di panel. Anak di bawah 12 tahun bisa diberi harga sendiri. Uang muka dihitung dari persen di menu Isi situs dan dibulatkan ke atas per seribu rupiah.

Tamu mendapat halaman pesanan dengan tautan rahasia. Dari sana tamu melihat rekening, menyalin nomor, dan mengirim bukti transfer lewat WhatsApp. Pengelola menandai uang muka diterima, lunas, atau selesai dari panel.

Foto disimpan di database supaya tidak hilang saat deploy ulang. Foto diperkecil di peramban menjadi paling lebar 1800 piksel sebelum diunggah.

Halaman utama punya tiga tempat foto di menu Foto situs. Foto utama tampil penuh di belakang judul besar, foto tentang kami tampil di samping kotak rencana menginap, dan foto ajakan tampil di kotak berwarna laut. Selama belum ada foto, situs memakai ilustrasi senja, siang, dan pagi di Raja Ampat yang dibuat oleh `scripts/desain/situs.mjs`. Kartu pondok di bawah foto utama memakai foto pertama tiap pondok.

## Yang bisa diubah dari panel

Semua yang tampil di situs bisa diubah dari panel, yaitu teks setiap bagian halaman utama, pondok beserta harga dan fotonya, kegiatan tambahan, ulasan, foto situs, kontak, titik peta, rekening, uang muka, jam check-in dan check-out, serta ketentuan menginap.

Pengecualiannya teks tombol dan label formulir, misalnya Pesan sekarang, Rencanakan liburanmu, atau Nomor WhatsApp. Teks itu ada di `lib/kamus.ts` dan perlu diubah lewat kode. Hiasan merek seperti wajah Mambe di kotak rencana menginap dan gambar hammock samar di kotak ajakan juga tetap.
