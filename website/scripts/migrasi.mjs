// Create the tables and the default content by hand.
//   npm run db:migrasi     connect with the values in .env and set up the database
//   npm run db:sql         write database/skema.sql for import through phpMyAdmin
// The site does the same on its first database call, so this is optional.
import { createRequire } from 'module';
import { SKEMA, sqlLengkap } from '../lib/skema.mjs';
import { KAMAR_AWAL, LAYANAN_AWAL, situsBawaan } from '../lib/bawaan.mjs';

if (process.argv.includes('--sql')) {
  process.stdout.write(sqlLengkap());
  process.exit(0);
}

const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const mysql = require('mysql2/promise');

const e = (k, c = '') => (process.env[k] ?? '').trim() || c;
if (!e('DB_USER') || !e('DB_NAME')) {
  console.error('DB_NAME dan DB_USER belum diisi. Salin .env.example menjadi .env lalu isi nilainya.');
  process.exit(1);
}
const db = await mysql.createConnection({
  host: e('DB_HOST', 'localhost'), port: Number(e('DB_PORT', '3306')), user: e('DB_USER'), password: process.env.DB_PASSWORD ?? '',
  database: e('DB_NAME'), charset: 'utf8mb4',
});
for (const s of SKEMA) await db.query(s);
const [r] = await db.query("INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('benih', '1')");
if (r.affectedRows === 1) {
  await db.query('INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES (?, ?)', ['situs', JSON.stringify(situsBawaan())]);
  const [[{ n }]] = await db.query('SELECT COUNT(*) AS n FROM kamar');
  if (n === 0) {
    for (const k of KAMAR_AWAL) {
      await db.query(
        `INSERT INTO kamar (slug, nama, nama_en, ringkas, ringkas_en, deskripsi, deskripsi_en, fasilitas, fasilitas_en,
          harga, harga_anak, skema_harga, kapasitas, jumlah_unit, min_malam, urutan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [k.slug, k.nama, k.nama_en, k.ringkas, k.ringkas_en, k.deskripsi, k.deskripsi_en, k.fasilitas.join('\n'), k.fasilitas_en.join('\n'),
          k.harga, k.harga_anak, k.skema_harga, k.kapasitas, k.jumlah_unit, k.min_malam, k.urutan],
      );
    }
  }
  const [[{ m }]] = await db.query('SELECT COUNT(*) AS m FROM layanan');
  if (m === 0) {
    for (const l of LAYANAN_AWAL) {
      await db.query('INSERT INTO layanan (nama, nama_en, keterangan, keterangan_en, harga, satuan, ikon, urutan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [l.nama, l.nama_en, l.keterangan, l.keterangan_en, l.harga, l.satuan, l.ikon, l.urutan]);
    }
  }
  console.log('Tabel dibuat dan isi awal dimasukkan.');
} else {
  console.log('Tabel sudah lengkap. Isi yang ada tidak diubah.');
}
await db.end();
