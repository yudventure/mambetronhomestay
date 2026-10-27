// Calendar sync with booking sites (Booking.com, Airbnb, Agoda) and travel
// agents through iCal links.
//
// An iCal calendar only says taken or free, so every link belongs to one unit
// of one hut type. Bookings made on this site carry no unit number, they are
// spread over the units here, around the nights the other sites already took.
//
// Each link has its own export, which leaves out what came in through that
// same link. A block read from Booking.com therefore never goes back to
// Booking.com, and two calendars cannot keep each other's old blocks alive.
import crypto from 'crypto';
import { baris, jalankan, satu, transaksi } from './db';
import { daftarKamar, kamarDariId } from './data';
import { alamatSitus, dbDiatur } from './env';
import { bacaIcal, buatIcal, rangkai } from './ical.mjs';
import type { Kamar } from './jenis';
import { ZONA, daftarMalam, hariIni, tambahHari } from './tanggal';

export type Sambungan = {
  id: number;
  kamar_id: number;
  unit: number;
  nama: string;
  url: string;
  token: string;
  dicoba: string | null;
  berhasil: string | null;
  galat: string;
  jumlah: number;
};

export type BlokLuar = { sambungan_id: number; kamar_id: number; unit: number; mulai: string; selesai: string; ringkas: string; nama: string };

// A link is read again when its last read is older than this.
const SEGAR_MENIT = 15;
// How far ahead the export reaches.
const KE_DEPAN = 500;

export class GalatSinkron extends Error {
  constructor(pesan: string, readonly kode = 'baca') {
    super(pesan);
  }
}

export const buatToken = () => crypto.randomBytes(16).toString('hex');

export async function daftarSambungan() {
  return baris<Sambungan>('SELECT id, kamar_id, unit, nama, url, token, dicoba, berhasil, galat, jumlah FROM kalender_sambungan ORDER BY kamar_id, unit, id');
}

export async function sambunganDariToken(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  return satu<Sambungan>('SELECT id, kamar_id, unit, nama, url, token, dicoba, berhasil, galat, jumlah FROM kalender_sambungan WHERE token = ?', [token]);
}

// Imported nights overlapping [dari, sampai).
export async function blokLuar(dari: string, sampai: string, kamarId?: number) {
  return baris<BlokLuar>(
    `SELECT b.sambungan_id, b.kamar_id, b.unit, b.mulai, b.selesai, b.ringkas, s.nama
     FROM kalender_luar b JOIN kalender_sambungan s ON s.id = b.sambungan_id
     WHERE b.mulai < ? AND b.selesai > ?${kamarId ? ' AND b.kamar_id = ?' : ''}
     ORDER BY b.mulai`,
    [sampai, dari, ...(kamarId ? [kamarId] : [])],
  );
}

// The link a booking site gives is checked before the server fetches it.
// webcal is the same address over https. Addresses inside the server's own
// network are refused.
export function rapikanUrl(masukan: string) {
  const s = masukan.trim().replace(/^webcals?:\/\//i, 'https://');
  if (!s) return '';
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    throw new GalatSinkron('Tautan kalender tidak terbaca. Salin ulang tautan iCal dari situs pemesanan.', 'url-baca');
  }
  if (!['http:', 'https:'].includes(u.protocol)) throw new GalatSinkron('Tautan kalender harus diawali https.', 'url-https');
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const dalam = h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || (!h.includes('.') && !h.includes(':'))
    || /^(127|10|0)\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)
    || h === '::1' || /^f[cd][0-9a-f]{2}:/.test(h) || /^fe80:/.test(h);
  if (dalam && process.env.SINKRON_IZINKAN_LOKAL !== '1') throw new GalatSinkron('Tautan kalender harus alamat internet umum.', 'url-umum');
  if (s.length > 1000) throw new GalatSinkron('Tautan kalender terlalu panjang.', 'url-panjang');
  return u.toString();
}

async function ambil(url: string) {
  let r: Response;
  try {
    r = await fetch(url, {
      headers: { 'user-agent': 'MambetronKalender/1.0 (+iCal sync)', accept: 'text/calendar, text/plain, */*' },
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    });
  } catch (e) {
    throw new GalatSinkron(/timeout|abort/i.test(String(e)) ? 'Situs itu tidak menjawab dalam 20 detik.' : 'Situs itu tidak bisa dihubungi.');
  }
  if (r.status === 404 || r.status === 410) throw new GalatSinkron('Tautan tidak ditemukan di situs itu. Mungkin tautannya sudah diganti.');
  if (r.status === 401 || r.status === 403) throw new GalatSinkron('Situs itu menolak tautan ini. Salin ulang tautan iCal terbaru.');
  if (!r.ok) throw new GalatSinkron(`Situs itu menjawab dengan galat ${r.status}.`);
  const teks = await r.text();
  if (teks.length > 5_000_000) throw new GalatSinkron('Kalender dari situs itu terlalu besar.');
  return teks;
}

// Reads one link and replaces its nights. A failed read keeps the nights
// from the last good read, so a site that is down for a moment does not
// open its dates here.
export async function sinkronSatu(s: Pick<Sambungan, 'id' | 'kamar_id' | 'unit' | 'url'>) {
  if (!s.url) return { ok: true, jumlah: 0 };
  try {
    let acara;
    try {
      acara = bacaIcal(await ambil(s.url), { zona: ZONA });
    } catch (e) {
      if (e instanceof GalatSinkron) throw e;
      throw new GalatSinkron('Isi tautan itu bukan kalender iCal. Pastikan yang disalin tautan ekspor kalender, bukan alamat halaman.');
    }
    const batas = tambahHari(hariIni(), -1);
    const simpan = acara.filter((a) => a.selesai > batas).slice(0, 3000);
    await transaksi(async (c) => {
      await c.query('DELETE FROM kalender_luar WHERE sambungan_id = ?', [s.id]);
      for (let i = 0; i < simpan.length; i += 200) {
        const bagian = simpan.slice(i, i + 200);
        await c.query(
          `INSERT INTO kalender_luar (sambungan_id, kamar_id, unit, mulai, selesai, uid, ringkas) VALUES ${bagian.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}`,
          bagian.flatMap((a) => [s.id, s.kamar_id, s.unit, a.mulai, a.selesai, a.uid, a.ringkas]),
        );
      }
      await c.query("UPDATE kalender_sambungan SET dicoba = UTC_TIMESTAMP(), berhasil = UTC_TIMESTAMP(), galat = '', jumlah = ? WHERE id = ?", [simpan.length, s.id]);
    });
    return { ok: true, jumlah: simpan.length };
  } catch (e) {
    const pesan = e instanceof GalatSinkron ? e.message : 'Kalender gagal disimpan.';
    if (!(e instanceof GalatSinkron)) console.error('[mambetron] sinkron kalender', e);
    await jalankan('UPDATE kalender_sambungan SET dicoba = UTC_TIMESTAMP(), galat = ? WHERE id = ?', [pesan.slice(0, 300), s.id]).catch(() => {});
    return { ok: false, pesan };
  }
}

type Simpan = { jalan?: Promise<void>; cek?: number };
const g = globalThis as unknown as { __mambetronSinkron?: Simpan };
const S: Simpan = (g.__mambetronSinkron ??= {});

// Reads every link whose last read is older than SEGAR_MENIT, or all of them
// when paksa. One run at a time per server process.
export function sinkronSemua(o: { paksa?: boolean } = {}): Promise<void> {
  if (!dbDiatur()) return Promise.resolve();
  if (S.jalan) return o.paksa ? S.jalan.then((): Promise<void> => sinkronSemua(o)) : S.jalan;
  S.jalan = (async () => {
    const semua = await baris<Sambungan>(
      `SELECT id, kamar_id, unit, url FROM kalender_sambungan
       WHERE url <> ''${o.paksa ? '' : ` AND (dicoba IS NULL OR dicoba < UTC_TIMESTAMP() - INTERVAL ${SEGAR_MENIT} MINUTE)`}`,
    );
    // a few at a time, a slow site does not hold up the others
    for (let i = 0; i < semua.length; i += 4) await Promise.all(semua.slice(i, i + 4).map(sinkronSatu));
  })()
    .catch((e) => console.error('[mambetron] sinkron kalender', e))
    .finally(() => {
      S.jalan = undefined;
    });
  return S.jalan;
}

// Called from pages that show or take bookings. Looks at most once a minute,
// and waits up to `tunggu` ms for stale links, never longer.
export async function pastikanSegar(tunggu = 0) {
  if (!dbDiatur()) return;
  const kini = Date.now();
  if (!S.jalan && S.cek && kini - S.cek < 60_000) return;
  S.cek = kini;
  const p = sinkronSemua();
  if (tunggu > 0) await Promise.race([p, new Promise((r) => setTimeout(r, tunggu))]);
}

type PetaPakai = { langsung: Map<number, Set<string>>; luar: Map<number, Map<string, Set<number>>>; tutup: Set<string> };

// Which unit is taken on which night, for one hut type. Imported nights stay
// on their own unit, closed dates take every unit, bookings from this site
// go to the lowest unit free for the whole stay, or night by night when no
// single unit is free throughout.
export async function petaUnit(kamar: Pick<Kamar, 'id' | 'jumlah_unit'>, dari: string, sampai: string): Promise<PetaPakai> {
  const n = kamar.jumlah_unit;
  const [pesanan, luar, tutup] = await Promise.all([
    baris<{ id: number; check_in: string; check_out: string; jumlah_kamar: number }>(
      "SELECT id, check_in, check_out, jumlah_kamar FROM pesanan WHERE status <> 'batal' AND kamar_id = ? AND check_in < ? AND check_out > ? ORDER BY check_in, id",
      [kamar.id, sampai, dari],
    ),
    baris<{ sambungan_id: number; unit: number; mulai: string; selesai: string }>(
      'SELECT sambungan_id, unit, mulai, selesai FROM kalender_luar WHERE kamar_id = ? AND mulai < ? AND selesai > ?',
      [kamar.id, sampai, dari],
    ),
    baris<{ mulai: string; akhir: string }>(
      'SELECT mulai, akhir FROM tutup WHERE (kamar_id IS NULL OR kamar_id = ?) AND mulai < ? AND akhir >= ?',
      [kamar.id, sampai, dari],
    ),
  ]);
  const potong = (a: string, b: string) => daftarMalam(a > dari ? a : dari, b < sampai ? b : sampai);
  const h: PetaPakai = { langsung: new Map(), luar: new Map(), tutup: new Set() };
  for (const t of tutup) for (const m of potong(t.mulai, tambahHari(t.akhir, 1))) h.tutup.add(m);
  for (const b of luar) {
    if (b.unit < 1 || b.unit > n) continue;
    const peta = h.luar.get(b.unit) ?? new Map<string, Set<number>>();
    h.luar.set(b.unit, peta);
    for (const m of potong(b.mulai, b.selesai)) {
      const s = peta.get(m) ?? new Set<number>();
      s.add(b.sambungan_id);
      peta.set(m, s);
    }
  }
  const terpakai = (u: number, m: string) => h.tutup.has(m) || Boolean(h.luar.get(u)?.get(m)?.size) || Boolean(h.langsung.get(u)?.has(m));
  const pakai = (u: number, m: string) => {
    const s = h.langsung.get(u) ?? new Set<string>();
    s.add(m);
    h.langsung.set(u, s);
  };
  for (const p of pesanan) {
    const malam = potong(p.check_in, p.check_out);
    for (let q = 0; q < p.jumlah_kamar; q++) {
      let u = 1;
      while (u <= n && malam.some((m) => terpakai(u, m))) u++;
      if (u <= n) {
        for (const m of malam) pakai(u, m);
        continue;
      }
      for (const m of malam) {
        let v = 1;
        while (v <= n && terpakai(v, m)) v++;
        if (v <= n) pakai(v, m);
      }
    }
  }
  return h;
}

// Nights a unit is taken, leaving out what came in through one link.
function malamUnit(h: PetaPakai, unit: number, kecuali?: number) {
  const malam = new Set<string>([...h.tutup, ...(h.langsung.get(unit) ?? [])]);
  for (const [m, dari] of h.luar.get(unit) ?? []) {
    if ([...dari].some((id) => id !== kecuali)) malam.add(m);
  }
  return [...malam];
}

// The export calendar for one link, or null for an unknown token.
export async function feedSambungan(token: string) {
  const s = await sambunganDariToken(token);
  if (!s) return null;
  const kamar = await kamarDariId(s.kamar_id);
  const hari = hariIni();
  const sampai = tambahHari(hari, KE_DEPAN);
  let malam: string[];
  // a unit that no longer exists, or a hut type that was switched off, is
  // shown as taken so nobody books it elsewhere
  if (!kamar || !kamar.aktif || s.unit > kamar.jumlah_unit) malam = daftarMalam(hari, sampai);
  else malam = malamUnit(await petaUnit(kamar, hari, sampai), s.unit, s.id);
  const host = (alamatSitus().replace(/^https?:\/\//, '') || 'mambetronhomestay.com').replace(/\/.*/, '');
  const namaSitus = host.split('.')[0];
  return buatIcal({
    nama: `${kamar?.nama ?? 'Bungalow'} unit ${s.unit} untuk ${s.nama}`,
    prodid: `-//${namaSitus}//Kalender bungalow//ID`,
    acara: rangkai(malam).map((r) => ({ uid: `${s.id}-${r.mulai}@${host}`, mulai: r.mulai, selesai: r.selesai, ringkas: 'Tidak tersedia' })),
  });
}

export type Bentrok = { kamar_id: number; nama: string; mulai: string; selesai: string; terpakai: number; unit: number };

// Nights where bookings here and on other sites together need more units
// than the hut type has. Those guests need a phone call.
export async function cariBentrok(dari: string, sampai: string): Promise<Bentrok[]> {
  if (!dbDiatur()) return [];
  const kamar = await daftarKamar(true);
  const hasil: Bentrok[] = [];
  for (const k of kamar) {
    const [pesanan, luar] = await Promise.all([
      baris<{ check_in: string; check_out: string; jumlah_kamar: number }>(
        "SELECT check_in, check_out, jumlah_kamar FROM pesanan WHERE status <> 'batal' AND kamar_id = ? AND check_in < ? AND check_out > ?",
        [k.id, sampai, dari],
      ),
      baris<{ unit: number; mulai: string; selesai: string }>(
        'SELECT unit, mulai, selesai FROM kalender_luar WHERE kamar_id = ? AND mulai < ? AND selesai > ?',
        [k.id, sampai, dari],
      ),
    ]);
    if (!luar.length) continue;
    const potong = (a: string, b: string) => daftarMalam(a > dari ? a : dari, b < sampai ? b : sampai);
    const sini = new Map<string, number>();
    for (const p of pesanan) for (const m of potong(p.check_in, p.check_out)) sini.set(m, (sini.get(m) ?? 0) + p.jumlah_kamar);
    const sana = new Map<string, Set<number>>();
    for (const b of luar) {
      if (b.unit < 1 || b.unit > k.jumlah_unit) continue;
      for (const m of potong(b.mulai, b.selesai)) sana.set(m, (sana.get(m) ?? new Set()).add(b.unit));
    }
    const lebih = new Map<string, number>();
    for (const [m, u] of sana) {
      const total = u.size + (sini.get(m) ?? 0);
      if (total > k.jumlah_unit) lebih.set(m, total);
    }
    for (const r of rangkai([...lebih.keys()])) {
      const puncak = Math.max(...daftarMalam(r.mulai, r.selesai).map((m) => lebih.get(m) ?? 0));
      hasil.push({ kamar_id: k.id, nama: k.nama, mulai: r.mulai, selesai: r.selesai, terpakai: puncak, unit: k.jumlah_unit });
    }
  }
  return hasil;
}
