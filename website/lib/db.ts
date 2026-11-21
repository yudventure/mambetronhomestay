// MySQL connection pool. Tables are created and filled with the default
// content on the first query after the server starts, so a fresh Hostinger
// database needs no manual import.
import fs from 'fs';
import mysql from 'mysql2/promise';
import { SKEMA, tambahKolom } from './skema.mjs';
import { KAMAR_AWAL, KAMAR_LAMA, KAMAR_NAMA_LAMA, KAMAR_TEKS_LAMA, LAYANAN_AWAL, VIDEO_AWAL, situsBawaan } from './bawaan.mjs';
import { dbDiatur, envDb } from './env';

export class DbBelumDiatur extends Error {
  constructor() {
    super('Database belum diatur. Isi DB_NAME, DB_USER, dan DB_PASSWORD.');
  }
}

type Simpan = { pool?: mysql.Pool; siap?: Promise<void>; kunci?: string; cari?: Promise<mysql.Pool>; cara?: string };
const g = globalThis as unknown as { __mambetronDb?: Simpan };
const S: Simpan = (g.__mambetronDb ??= {});

type Env = ReturnType<typeof envDb>;
type Cara = { label: string; opsi: { host?: string; port?: number; socketPath?: string } };

const SOKET = ['/var/lib/mysql/mysql.sock', '/run/mysqld/mysqld.sock', '/var/run/mysqld/mysqld.sock', '/tmp/mysql.sock'];
// Existing sockets, each once. /var/run is often a link to /run.
function soketAda() {
  const asli = new Set<string>();
  return SOKET.filter((p) => {
    try {
      const r = fs.realpathSync(p);
      if (asli.has(r) || !fs.statSync(r).isSocket()) return false;
      asli.add(r);
      return true;
    } catch {
      return false;
    }
  });
}

// Ways to reach the server, tried in order. A local host goes through the
// MySQL socket first, then 127.0.0.1, then the name itself. Node can resolve
// localhost to ::1 while MySQL on shared hosting only listens on IPv4, and
// some hosts only let database users in through the socket.
function caraHubung(e: Env): Cara[] {
  if (e.socket) return [{ label: `soket ${e.socket}`, opsi: { socketPath: e.socket } }];
  if (!['localhost', '127.0.0.1', '::1'].includes(e.host)) return [{ label: `${e.host}:${e.port}`, opsi: { host: e.host, port: e.port } }];
  return [
    ...soketAda().map((p) => ({ label: `soket ${p}`, opsi: { socketPath: p } })),
    { label: `127.0.0.1:${e.port}`, opsi: { host: '127.0.0.1', port: e.port } },
    ...(e.host === '127.0.0.1' ? [] : [{ label: `${e.host}:${e.port}`, opsi: { host: e.host, port: e.port } }]),
  ];
}

// The first way that lets this user in, or every reply joined in the error.
async function pilihCara(e: Env): Promise<Cara> {
  const gagal: string[] = [];
  for (const c of caraHubung(e)) {
    try {
      const k = await mysql.createConnection({ user: e.user, password: e.password, database: e.database, connectTimeout: 8_000, ...c.opsi });
      await k.end();
      return c;
    } catch (x) {
      gagal.push(`${c.label} menjawab ${(x as Error).message}`);
    }
  }
  throw new Error(gagal.join(' | '));
}

async function buatPool() {
  const e = envDb();
  const kunci = `${e.host}|${e.port}|${e.socket}|${e.user}|${e.database}|${e.password.length}`;
  if (S.pool && S.kunci === kunci) return S.pool;
  S.cari ??= pilihCara(e).then((c) => pasangPool(e, c, kunci)).finally(() => {
    S.cari = undefined;
  });
  return S.cari;
}

function pasangPool(e: Env, c: Cara, kunci: string) {
  const pool = mysql.createPool({
    user: e.user,
    password: e.password,
    database: e.database,
    ...c.opsi,
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
  S.cara = c.label;
  return pool;
}

// How the pool reached the server, for the health check.
export const caraTerhubung = () => S.cara ?? '';

type BarisAngka = mysql.RowDataPacket & { n: number };

// Moves a database that still holds the three sample huts to the real rooms,
// once. The first hut keeps its id, photos and bookings and becomes the new
// type, the other two go only when nobody booked them and they have no
// photos. Anything the owner already changed is left alone.
async function pindahKamarLama(pool: mysql.Pool) {
  const [r] = await pool.query<mysql.ResultSetHeader>("INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('kamar-awal-2', '1')");
  if (r.affectedRows !== 1) return;
  const [ada] = await pool.query<(mysql.RowDataPacket & { id: number; slug: string; nama: string; harga: number })[]>('SELECT id, slug, nama, harga FROM kamar');
  const lama = KAMAR_LAMA.map((l) => ada.find((k) => k.slug === l.slug && k.nama === l.nama));
  if (ada.length !== KAMAR_LAMA.length || lama.some((k) => !k)) return;
  const [utama, ...sisa] = lama as NonNullable<(typeof lama)[number]>[];
  const ids = sisa.map((k) => k.id);
  const [[p]] = await pool.query<BarisAngka[]>('SELECT COUNT(*) AS n FROM pesanan WHERE kamar_id IN (?)', [ids]);
  const [[f]] = await pool.query<BarisAngka[]>("SELECT COUNT(*) AS n FROM foto WHERE wadah = 'kamar' AND kamar_id IN (?)", [ids]);
  if (p.n > 0 || f.n > 0) return;
  const k = KAMAR_AWAL[0];
  await pool.query(
    `UPDATE kamar SET slug = ?, nama = ?, nama_en = ?, ringkas = ?, ringkas_en = ?, deskripsi = ?, deskripsi_en = ?, fasilitas = ?,
      fasilitas_en = ?, harga = ?, harga_anak = ?, skema_harga = ?, harga_sendiri = ?, harga_tambah = ?, kapasitas = ?, jumlah_unit = ?, min_malam = ?, urutan = ? WHERE id = ?`,
    [k.slug, k.nama, k.nama_en, k.ringkas, k.ringkas_en, k.deskripsi, k.deskripsi_en, k.fasilitas.join('\n'), k.fasilitas_en.join('\n'),
      utama.harga === KAMAR_LAMA[0].harga ? k.harga : utama.harga, k.harga_anak, k.skema_harga, k.harga_sendiri, k.harga_tambah, k.kapasitas, k.jumlah_unit, k.min_malam,
      k.urutan, utama.id],
  );
  await pool.query('DELETE FROM tutup WHERE kamar_id IN (?)', [ids]);
  await pool.query('DELETE FROM kamar WHERE id IN (?)', [ids]);
}

// Room texts still equal to the first release take the current ones, once.
// A text the owner changed is not touched.
async function perbaruiTeksKamar(pool: mysql.Pool) {
  const [r] = await pool.query<mysql.ResultSetHeader>("INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('kamar-teks-2', '1')");
  if (r.affectedRows !== 1) return;
  const k = KAMAR_AWAL[0];
  const baru: Record<keyof typeof KAMAR_TEKS_LAMA, string> = {
    ringkas: k.ringkas, ringkas_en: k.ringkas_en, deskripsi: k.deskripsi, deskripsi_en: k.deskripsi_en,
    fasilitas: k.fasilitas.join('\n'), fasilitas_en: k.fasilitas_en.join('\n'),
  };
  for (const [kolom, lama] of Object.entries(KAMAR_TEKS_LAMA) as [keyof typeof KAMAR_TEKS_LAMA, string][]) {
    await pool.query(`UPDATE kamar SET ${kolom} = ? WHERE ${kolom} = ?`, [baru[kolom], lama]);
  }
}

// The same once more for rooms saved in the panel before line breaks were
// normalised, whose first release texts carry CRLF and so slipped past the
// exact comparison above.
async function perbaruiTeksKamarCrlf(pool: mysql.Pool) {
  const [r] = await pool.query<mysql.ResultSetHeader>("INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('kamar-teks-3', '1')");
  if (r.affectedRows !== 1) return;
  const k = KAMAR_AWAL[0];
  const baru: Record<keyof typeof KAMAR_TEKS_LAMA, string> = {
    ringkas: k.ringkas, ringkas_en: k.ringkas_en, deskripsi: k.deskripsi, deskripsi_en: k.deskripsi_en,
    fasilitas: k.fasilitas.join('\n'), fasilitas_en: k.fasilitas_en.join('\n'),
  };
  const rata = (s: unknown) => String(s ?? '').replace(/\r\n?/g, '\n').trim();
  const [ada] = await pool.query<mysql.RowDataPacket[]>('SELECT id, ringkas, ringkas_en, deskripsi, deskripsi_en, fasilitas, fasilitas_en FROM kamar');
  for (const baris of ada) {
    for (const [kolom, lama] of Object.entries(KAMAR_TEKS_LAMA) as [keyof typeof KAMAR_TEKS_LAMA, string][]) {
      if (baris[kolom] !== lama && rata(baris[kolom]) === rata(lama)) await pool.query(`UPDATE kamar SET ${kolom} = ? WHERE id = ?`, [baru[kolom], baris.id]);
    }
  }
}

// The huts became bungalows. Only the untouched default name changes, the
// address (slug) stays so shared links keep working.
async function namaBungalow(pool: mysql.Pool) {
  const [r] = await pool.query<mysql.ResultSetHeader>("INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('kamar-bungalow', '1')");
  if (r.affectedRows !== 1) return;
  for (const [kolom, [lama, baru]] of Object.entries(KAMAR_NAMA_LAMA)) {
    await pool.query(`UPDATE kamar SET ${kolom} = ? WHERE ${kolom} = ?`, [baru, lama]);
  }
}

// The owner's price, November 2026: the beachfront bungalow costs
// Rp1.200.000 a night for two and a guest alone Rp850.000 (first 30% less,
// then a set Rp850.000, hence the second key). Set once on the beachfront
// bungalow (its address is still pondok-tepi-pantai on sites from before
// the rename), or on the only bungalow, whatever it cost before. Changes
// in the panel afterwards stick.
async function hargaBungalow(pool: mysql.Pool) {
  const [r] = await pool.query<mysql.ResultSetHeader>("INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('harga-bungalow-2026-11b', '1')");
  if (r.affectedRows !== 1) return;
  const k = KAMAR_AWAL[0];
  const [ada] = await pool.query<(mysql.RowDataPacket & { id: number; slug: string })[]>('SELECT id, slug FROM kamar');
  const ids = ada.length === 1 ? [ada[0].id] : ada.filter((x) => x.slug === k.slug || x.slug === 'pondok-tepi-pantai').map((x) => x.id);
  if (!ids.length) return;
  await pool.query('UPDATE kamar SET harga = ?, skema_harga = ?, harga_sendiri = ? WHERE id IN (?)', [k.harga, k.skema_harga, k.harga_sendiri, ids]);
}

// The owner, November 2026: "bir watching per rombongan maksimal 4 orang".
// Bird watching was priced once per booking, now per group of up to four.
// Done once, and only while the owner has not set its own group size.
async function burungRombongan(pool: mysql.Pool) {
  const [r] = await pool.query<mysql.ResultSetHeader>("INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('cenderawasih-rombongan', '1')");
  if (r.affectedRows !== 1) return;
  const burung = LAYANAN_AWAL.find((l) => l.ikon === 'burung');
  if (!burung) return;
  await pool.query("UPDATE layanan SET satuan = ?, muat = ? WHERE ikon = 'burung' AND satuan IN ('pesanan', 'rombongan') AND muat = 0", [burung.satuan, burung.muat]);
}

// The owner's beds, November 2026: each bungalow has a king bed and a
// single bed, so it sleeps three, and the third guest pays Rp600.000 like
// the other two (Rp1.800.000 for three). Done once on the beachfront
// bungalow or the only one. The texts that still say "for two" are fixed
// phrase by phrase, so a text the owner rewrote is left as it is.
async function tigaOrang(pool: mysql.Pool) {
  const [r] = await pool.query<mysql.ResultSetHeader>("INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('bungalow-tiga-orang', '1')");
  if (r.affectedRows !== 1) return;
  const k = KAMAR_AWAL[0];
  const [ada] = await pool.query<(mysql.RowDataPacket & { id: number; slug: string })[]>('SELECT id, slug FROM kamar');
  const ids = ada.length === 1 ? [ada[0].id] : ada.filter((x) => x.slug === k.slug || x.slug === 'pondok-tepi-pantai').map((x) => x.id);
  if (!ids.length) return;
  await pool.query('UPDATE kamar SET kapasitas = ?, harga_tambah = ? WHERE id IN (?)', [k.kapasitas, k.harga_tambah, ids]);
  for (const [kolom, lama, baru] of [
    ['ringkas', 'masing-masing untuk dua orang, dengan kamar mandi dalam dan beranda', 'masing-masing dengan kasur king dan kasur single untuk sampai tiga orang, kamar mandi dalam, dan beranda'],
    ['deskripsi', 'masing-masing untuk dua orang, dengan kamar mandi dalam', 'masing-masing dengan kasur king dan kasur single untuk sampai tiga orang, kamar mandi dalam,'],
    ['ringkas_en', 'each sleeping two, with a private bathroom and', 'each with a king bed and a single bed for up to three, a private bathroom and'],
    ['deskripsi_en', 'each sleeping two, with a private bathroom', 'each with a king bed and a single bed for up to three, a private bathroom'],
  ]) {
    await pool.query(`UPDATE kamar SET ${kolom} = REPLACE(${kolom}, ?, ?) WHERE id IN (?)`, [lama, baru, ids]);
  }
}

// The owner's trips and transfers, November 2026: the Waisai transfer
// becomes a small longboat for up to 5 people (Rp1.250.000 per boat, 15 PK)
// with a faster speedboat beside it for up to 6 (Rp1.750.000, 2 × 40 PK),
// snorkelling from Rp400.000, bird watching Rp2.500.000. Done once on the
// rows that still carry the first names, so extras the owner renamed or
// added are left alone, and later panel changes stick.
async function layananBaru(pool: mysql.Pool) {
  const [r] = await pool.query<mysql.ResultSetHeader>("INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('layanan-2026-11', '1')");
  if (r.affectedRows !== 1) return;
  const [ada] = await pool.query<(mysql.RowDataPacket & { id: number; nama: string; nama_en: string; urutan: number })[]>('SELECT id, nama, nama_en, urutan FROM layanan');
  const cari = (nama: string, en: string) => ada.find((x) => x.nama === nama || x.nama_en === en);
  const [longboat, speedboat, snorkel, burung] = LAYANAN_AWAL;
  const jemput = cari('Antar jemput Waisai', 'Waisai transfer');
  if (jemput) {
    await pool.query('UPDATE layanan SET nama = ?, nama_en = ?, keterangan = ?, keterangan_en = ?, harga = ?, satuan = ?, muat = ?, ikon = ? WHERE id = ?',
      [longboat.nama, longboat.nama_en, longboat.keterangan, longboat.keterangan_en, longboat.harga, longboat.satuan, longboat.muat, longboat.ikon, jemput.id]);
    if (!cari(speedboat.nama, speedboat.nama_en)) {
      // the same place in the list, right after the longboat
      await pool.query('INSERT INTO layanan (nama, nama_en, keterangan, keterangan_en, harga, satuan, muat, mulai, ikon, urutan) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)',
        [speedboat.nama, speedboat.nama_en, speedboat.keterangan, speedboat.keterangan_en, speedboat.harga, speedboat.satuan, speedboat.muat, speedboat.ikon, jemput.urutan]);
    }
  }
  const s = cari(snorkel.nama, snorkel.nama_en);
  if (s) await pool.query('UPDATE layanan SET harga = ?, mulai = 1 WHERE id = ?', [snorkel.harga, s.id]);
  const c = cari(burung.nama, burung.nama_en);
  if (c) await pool.query('UPDATE layanan SET harga = ?, satuan = ? WHERE id = ?', [burung.harga, burung.satuan, c.id]);
}

// The about video the owner sent, put in once when the site has no video
// link yet. Removing it in the panel afterwards sticks.
async function videoAwal(pool: mysql.Pool) {
  const [r] = await pool.query<mysql.ResultSetHeader>("INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('video-awal-1', '1')");
  if (r.affectedRows !== 1) return;
  const [[baris]] = await pool.query<(mysql.RowDataPacket & { nilai: string })[]>("SELECT nilai FROM pengaturan WHERE kunci = 'situs'");
  if (!baris) return;
  const s = JSON.parse(baris.nilai);
  const ada = Array.isArray(s.tentangVideo) && s.tentangVideo.some((x: { url?: unknown }) => String(x?.url ?? '').trim());
  if (ada) return;
  s.tentangVideo = structuredClone(VIDEO_AWAL);
  await pool.query("UPDATE pengaturan SET nilai = ? WHERE kunci = 'situs'", [JSON.stringify(s)]);
}

async function siapkan(pool: mysql.Pool) {
  for (const sql of SKEMA) await pool.query(sql);
  await tambahKolom(async (sql: string, nilai: unknown[]) => (await pool.query(sql, nilai))[0] as unknown[]);
  await pindahKamarLama(pool);
  await perbaruiTeksKamar(pool);
  await perbaruiTeksKamarCrlf(pool);
  await namaBungalow(pool);
  await hargaBungalow(pool);
  await layananBaru(pool);
  await tigaOrang(pool);
  await burungRombongan(pool);
  await videoAwal(pool);
  // the first process to claim this row fills the empty database
  const [r] = await pool.query<mysql.ResultSetHeader>(
    "INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES ('benih', '1')",
  );
  if (r.affectedRows !== 1) return;
  await pool.query('INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES (?, ?)', ['situs', JSON.stringify(situsBawaan())]);
  const [[{ n }]] = await pool.query<BarisAngka[]>('SELECT COUNT(*) AS n FROM kamar');
  if (n === 0) {
    for (const k of KAMAR_AWAL) {
      await pool.query(
        `INSERT INTO kamar (slug, nama, nama_en, ringkas, ringkas_en, deskripsi, deskripsi_en, fasilitas, fasilitas_en,
          harga, harga_anak, skema_harga, harga_sendiri, harga_tambah, kapasitas, jumlah_unit, min_malam, urutan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [k.slug, k.nama, k.nama_en, k.ringkas, k.ringkas_en, k.deskripsi, k.deskripsi_en,
          k.fasilitas.join('\n'), k.fasilitas_en.join('\n'), k.harga, k.harga_anak, k.skema_harga, k.harga_sendiri, k.harga_tambah,
          k.kapasitas, k.jumlah_unit, k.min_malam, k.urutan],
      );
    }
  }
  const [[{ m }]] = await pool.query<(mysql.RowDataPacket & { m: number })[]>('SELECT COUNT(*) AS m FROM layanan');
  if (m === 0) {
    for (const l of LAYANAN_AWAL) {
      await pool.query(
        'INSERT INTO layanan (nama, nama_en, keterangan, keterangan_en, harga, satuan, muat, mulai, ikon, urutan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [l.nama, l.nama_en, l.keterangan, l.keterangan_en, l.harga, l.satuan, l.muat, l.mulai ? 1 : 0, l.ikon, l.urutan],
      );
    }
  }
}

// The ready pool. Throws DbBelumDiatur when the env values are empty.
export async function db() {
  if (!dbDiatur()) throw new DbBelumDiatur();
  const pool = await buatPool();
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
  if (!dbDiatur()) return { ok: false, pesan: 'Nama database atau pengguna database belum terbaca dari environment variables.' };
  try {
    await db();
    return { ok: true, pesan: 'Database terhubung.' };
  } catch (e) {
    return { ok: false, pesan: `Database belum bisa dihubungi. ${(e as Error).message}` };
  }
}
