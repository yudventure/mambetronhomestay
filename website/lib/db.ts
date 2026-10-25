// MySQL connection pool. Tables are created and filled with the default
// content on the first query after the server starts, so a fresh Hostinger
// database needs no manual import.
import mysql from 'mysql2/promise';
import { SKEMA } from './skema.mjs';
import { KAMAR_AWAL, LAYANAN_AWAL, situsBawaan } from './bawaan.mjs';
import { dbDiatur, envDb } from './env';

export class DbBelumDiatur extends Error {
  constructor() {
    super('Database belum diatur. Isi DB_NAME, DB_USER, dan DB_PASSWORD.');
  }
}

type Simpan = { pool?: mysql.Pool; siap?: Promise<void>; kunci?: string };
const g = globalThis as unknown as { __mambetronDb?: Simpan };
const S: Simpan = (g.__mambetronDb ??= {});

function buatPool() {
  const e = envDb();
  const kunci = `${e.host}|${e.port}|${e.user}|${e.database}`;
  if (S.pool && S.kunci === kunci) return S.pool;
  const pool = mysql.createPool({
    ...e,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 60_000,
    enableKeepAlive: true,
    dateStrings: true,
    charset: 'utf8mb4',
    connectTimeout: 10_000,
  });
  // store and read times in UTC, the pages convert to Raja Ampat time
  pool.pool.on('connection', (c) => {
    c.query("SET time_zone = '+00:00'");
  });
  S.pool = pool;
  S.kunci = kunci;
  S.siap = undefined;
  return pool;
}

async function siapkan(pool: mysql.Pool) {
  for (const sql of SKEMA) await pool.query(sql);
  // the first process to claim this row fills the empty database
  const [r] = await pool.query<mysql.ResultSetHeader>(
    "INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('benih', '1')",
  );
  if (r.affectedRows !== 1) return;
  await pool.query('INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES (?, ?)', ['situs', JSON.stringify(situsBawaan())]);
  const [[{ n }]] = await pool.query<(mysql.RowDataPacket & { n: number })[]>('SELECT COUNT(*) AS n FROM kamar');
  if (n === 0) {
    for (const k of KAMAR_AWAL) {
      await pool.query(
        `INSERT INTO kamar (slug, nama, nama_en, ringkas, ringkas_en, deskripsi, deskripsi_en, fasilitas, fasilitas_en,
          harga, harga_anak, skema_harga, kapasitas, jumlah_unit, min_malam, urutan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [k.slug, k.nama, k.nama_en, k.ringkas, k.ringkas_en, k.deskripsi, k.deskripsi_en,
          k.fasilitas.join('\n'), k.fasilitas_en.join('\n'), k.harga, k.harga_anak, k.skema_harga,
          k.kapasitas, k.jumlah_unit, k.min_malam, k.urutan],
      );
    }
  }
  const [[{ m }]] = await pool.query<(mysql.RowDataPacket & { m: number })[]>('SELECT COUNT(*) AS m FROM layanan');
  if (m === 0) {
    for (const l of LAYANAN_AWAL) {
      await pool.query(
        'INSERT INTO layanan (nama, nama_en, keterangan, keterangan_en, harga, satuan, ikon, urutan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [l.nama, l.nama_en, l.keterangan, l.keterangan_en, l.harga, l.satuan, l.ikon, l.urutan],
      );
    }
  }
}

// The ready pool. Throws DbBelumDiatur when the env values are empty.
export async function db() {
  if (!dbDiatur()) throw new DbBelumDiatur();
  const pool = buatPool();
  S.siap ??= siapkan(pool).catch((e) => {
    S.siap = undefined;
    throw e;
  });
  await S.siap;
  return pool;
}

export type Baris = mysql.RowDataPacket;
export type Hasil = mysql.ResultSetHeader;
export type Koneksi = mysql.PoolConnection;

export async function baris<T>(sql: string, nilai: unknown[] = []): Promise<T[]> {
  const pool = await db();
  const [r] = await pool.query<Baris[]>(sql, nilai);
  return r as T[];
}

export async function satu<T>(sql: string, nilai: unknown[] = []): Promise<T | null> {
  return (await baris<T>(sql, nilai))[0] ?? null;
}

export async function jalankan(sql: string, nilai: unknown[] = []) {
  const pool = await db();
  const [r] = await pool.query<Hasil>(sql, nilai);
  return r;
}

export async function transaksi<T>(fn: (c: Koneksi) => Promise<T>): Promise<T> {
  const pool = await db();
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const hasil = await fn(c);
    await c.commit();
    return hasil;
  } catch (e) {
    await c.rollback().catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

// Short status for the health check and the admin dashboard.
export async function cekDb(): Promise<{ ok: boolean; pesan: string }> {
  if (!dbDiatur()) return { ok: false, pesan: 'Database belum diatur di environment variables.' };
  try {
    await db();
    return { ok: true, pesan: 'Database terhubung.' };
  } catch (e) {
    return { ok: false, pesan: `Database belum bisa dihubungi. ${(e as Error).message}` };
  }
}
