// Database tables. Plain JS so scripts/migrasi.mjs can use it without a build.
// Every statement is safe to run again, the site runs them on its first
// database call after start. Works on MySQL 5.7+, MySQL 8 and MariaDB 10.3+.

const T = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

export const SKEMA = [
  `CREATE TABLE IF NOT EXISTS pengaturan (
  kunci VARCHAR(64) NOT NULL PRIMARY KEY,
  nilai LONGTEXT NOT NULL,
  diubah TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ${T}`,

  `CREATE TABLE IF NOT EXISTS kamar (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL,
  nama VARCHAR(120) NOT NULL,
  nama_en VARCHAR(120) NOT NULL DEFAULT '',
  ringkas VARCHAR(400) NOT NULL DEFAULT '',
  ringkas_en VARCHAR(400) NOT NULL DEFAULT '',
  deskripsi TEXT NULL,
  deskripsi_en TEXT NULL,
  fasilitas TEXT NULL,
  fasilitas_en TEXT NULL,
  harga INT UNSIGNED NOT NULL DEFAULT 0,
  harga_anak INT UNSIGNED NULL,
  skema_harga VARCHAR(10) NOT NULL DEFAULT 'orang',
  kapasitas TINYINT UNSIGNED NOT NULL DEFAULT 2,
  jumlah_unit TINYINT UNSIGNED NOT NULL DEFAULT 1,
  min_malam TINYINT UNSIGNED NOT NULL DEFAULT 1,
  aktif TINYINT(1) NOT NULL DEFAULT 1,
  urutan INT NOT NULL DEFAULT 0,
  dibuat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY kamar_slug (slug)
) ${T}`,

  `CREATE TABLE IF NOT EXISTS foto (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  wadah VARCHAR(20) NOT NULL DEFAULT 'kamar',
  kamar_id INT UNSIGNED NULL,
  mime VARCHAR(40) NOT NULL,
  data MEDIUMBLOB NOT NULL,
  lebar SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  tinggi SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  ukuran INT UNSIGNED NOT NULL DEFAULT 0,
  keterangan VARCHAR(200) NOT NULL DEFAULT '',
  urutan INT NOT NULL DEFAULT 0,
  dibuat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY foto_wadah (wadah, kamar_id, urutan)
) ${T}`,

  `CREATE TABLE IF NOT EXISTS layanan (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(120) NOT NULL,
  nama_en VARCHAR(120) NOT NULL DEFAULT '',
  keterangan VARCHAR(400) NOT NULL DEFAULT '',
  keterangan_en VARCHAR(400) NOT NULL DEFAULT '',
  harga INT UNSIGNED NOT NULL DEFAULT 0,
  satuan VARCHAR(16) NOT NULL DEFAULT 'orang',
  ikon VARCHAR(20) NOT NULL DEFAULT 'perahu',
  aktif TINYINT(1) NOT NULL DEFAULT 1,
  urutan INT NOT NULL DEFAULT 0
) ${T}`,

  `CREATE TABLE IF NOT EXISTS pesanan (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(16) NOT NULL,
  token CHAR(32) NOT NULL,
  kamar_id INT UNSIGNED NOT NULL,
  kamar_nama VARCHAR(120) NOT NULL DEFAULT '',
  jumlah_kamar TINYINT UNSIGNED NOT NULL DEFAULT 1,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  malam SMALLINT UNSIGNED NOT NULL,
  dewasa TINYINT UNSIGNED NOT NULL DEFAULT 1,
  anak TINYINT UNSIGNED NOT NULL DEFAULT 0,
  nama VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL DEFAULT '',
  telepon VARCHAR(40) NOT NULL DEFAULT '',
  negara VARCHAR(80) NOT NULL DEFAULT '',
  kedatangan VARCHAR(200) NOT NULL DEFAULT '',
  catatan TEXT NULL,
  harga_satuan INT UNSIGNED NOT NULL DEFAULT 0,
  skema_harga VARCHAR(10) NOT NULL DEFAULT 'orang',
  biaya_kamar INT UNSIGNED NOT NULL DEFAULT 0,
  biaya_layanan INT UNSIGNED NOT NULL DEFAULT 0,
  total INT UNSIGNED NOT NULL DEFAULT 0,
  dp INT UNSIGNED NOT NULL DEFAULT 0,
  dibayar INT UNSIGNED NOT NULL DEFAULT 0,
  rincian LONGTEXT NULL,
  bahasa CHAR(2) NOT NULL DEFAULT 'id',
  status VARCHAR(16) NOT NULL DEFAULT 'menunggu',
  sumber VARCHAR(16) NOT NULL DEFAULT 'situs',
  catatan_admin TEXT NULL,
  dibuat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY pesanan_kode (kode),
  KEY pesanan_tanggal (kamar_id, check_in, check_out),
  KEY pesanan_status (status),
  KEY pesanan_dibuat (dibuat)
) ${T}`,

  `CREATE TABLE IF NOT EXISTS tutup (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  kamar_id INT UNSIGNED NULL,
  mulai DATE NOT NULL,
  akhir DATE NOT NULL,
  alasan VARCHAR(200) NOT NULL DEFAULT '',
  dibuat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY tutup_tanggal (mulai, akhir)
) ${T}`,

  `CREATE TABLE IF NOT EXISTS ulasan (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(120) NOT NULL,
  asal VARCHAR(120) NOT NULL DEFAULT '',
  isi TEXT NOT NULL,
  bintang TINYINT UNSIGNED NOT NULL DEFAULT 5,
  tampil TINYINT(1) NOT NULL DEFAULT 1,
  urutan INT NOT NULL DEFAULT 0,
  dibuat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ${T}`,
];

// The whole schema as one SQL file, for import through phpMyAdmin.
export function sqlLengkap() {
  return `-- Skema database Mambetron Homestay.
-- Situs membuat tabel ini sendiri saat pertama terhubung, berkas ini hanya
-- cadangan bila ingin membuatnya lewat phpMyAdmin (menu Import).

${SKEMA.map((s) => `${s};`).join('\n\n')}
`;
}
