// Connection to the DAMPIER partner calendar (thedampier.com, kalender
// mitra, Sambungkan OTA, Sambungkan website). DAMPIER keeps every room of
// the homestay in one calendar, with Booking.com, guests who book on
// DAMPIER and the owner's own notes. This site sends it its bookings and
// closed dates, and reads back how many rooms are taken there per night.
//
// Bookings here carry no unit number (see sinkron.ts), so they go to DAMPIER
// as a room count and DAMPIER puts them in empty rooms. DAMPIER's count per
// night includes them, so what is kept here is that count less the rooms
// this site sent for the night. The list is sent whole (ganti) whenever it
// changes, and again when DAMPIER holds a different number of website
// bookings than were sent, so both sides agree on what is subtracted.
//
// Once connected, DAMPIER is the channel manager. Booking.com, Airbnb and
// the other OTAs are connected to its calendar, room by room, and this site
// is one more channel of it. The site's own iCal links (sinkron.ts) then go
// quiet, see dampierAktif.
//
// The API address carries DAMPIER's key. It lives in its own pengaturan row,
// is only called from this server, and only its last characters reach the
// panel.
import crypto from 'crypto';
import { baris, jalankan, satu, transaksi } from './db';
import { dbDiatur } from './env';
import { alamatDalam, izinkanLokal } from './jaringan';
import type { Kamar, StatusPesanan } from './jenis';
import { daftarMalam, hariIni, tambahHari } from './tanggal';

export type KamarDampier = { nomor: number; nama: string };
export type BentrokDampier = { id: string; mulai: string; selesai: string };
type Simpanan = {
  api: string;
  kamarId: number;
  dicoba?: string;
  berhasil?: string;
  galat?: string;
  // the homestay and its rooms as DAMPIER names them, from the last read
  nama?: string;
  kamar?: KamarDampier[];
  pesananWebsite?: number;
  kirim?: { sidik: string; waktu: string; jumlah: number };
  bentrok?: BentrokDampier[];
};
export type StatusDampier = Omit<Simpanan, 'api'> & { host: string; akhiran: string };

// Reads at most this often, and before a booking is saved.
const SEGAR_MENIT = 5;
// The whole list goes again after this long even when nothing changed.
const KIRIM_ULANG_JAM = 6;
// How far ahead DAMPIER is read, its own limit.
const HARI_BACA = 400;
// DAMPIER's limits per booking and per request.
const MAKS_MALAM = 90;
const MAKS_KIRIM = 500;

export class GalatDampier extends Error {
  constructor(readonly kode: string, pesan = '') {
    super(pesan || kode);
  }
}

async function bacaSimpanan(): Promise<Simpanan | null> {
  if (!dbDiatur()) return null;
  try {
    const r = await satu<{ nilai: string }>("SELECT nilai FROM pengaturan WHERE kunci = 'dampier'");
    const o = r ? (JSON.parse(r.nilai) as Partial<Simpanan>) : null;
    return o && typeof o.api === 'string' && o.api ? { ...o, api: o.api, kamarId: Number(o.kamarId) || 0 } : null;
  } catch {
    return null;
  }
}
const tulisSimpanan = (o: Simpanan) =>
  jalankan("INSERT INTO pengaturan (kunci, nilai) VALUES ('dampier', ?) ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)", [JSON.stringify(o)]);

// DAMPIER is the channel manager here. The site's own iCal links are then
// not read, and their exports to sites that also send a calendar stay
// empty, so every OTA hears from DAMPIER alone and nothing counts twice.
export async function dampierAktif() {
  if (!dbDiatur()) return false;
  const r = await satu<{ n: number }>("SELECT COUNT(*) AS n FROM pengaturan WHERE kunci = 'dampier'").catch(() => null);
  return Boolean(r?.n);
}

export async function statusDampier(): Promise<StatusDampier | null> {
  const o = await bacaSimpanan();
  if (!o) return null;
  const { api, ...lain } = o;
  const u = new URL(api);
  return { ...lain, host: u.host, akhiran: api.slice(-4) };
}

// The address from the box Untuk programmer website. A per-room .ics link
// from the same box is taken too.
export function rapikanAlamatDampier(masukan: string) {
  let u: URL;
  try {
    u = new URL(masukan.trim());
  } catch {
    throw new GalatDampier('alamat');
  }
  if (u.protocol !== 'https:' && !(izinkanLokal() && u.protocol === 'http:')) throw new GalatDampier('alamat');
  if (alamatDalam(u.hostname) && !izinkanLokal()) throw new GalatDampier('alamat');
  const m = /^\/api\/kamar\/([A-Za-z0-9_-]{32,64})(?:\/\d{1,3}\.ics)?\/?$/.exec(u.pathname);
  if (!m) throw new GalatDampier('alamat');
  return `${u.origin}/api/kamar/${m[1]}`;
}

type Malam = { tanggal: string; terisi: number };
type Bacaan = { nama: string; kamar: KamarDampier[]; pesananWebsite: number; malam: Malam[] };

async function panggil(api: string, isi?: unknown): Promise<Record<string, unknown>> {
  let r: Response;
  try {
    r = await fetch(isi ? api : `${api}?hari=${HARI_BACA}`, {
      method: isi ? 'POST' : 'GET',
      headers: { 'user-agent': 'MambetronKalender/1.0 (+DAMPIER)', accept: 'application/json', ...(isi ? { 'content-type': 'application/json' } : {}) },
      body: isi ? JSON.stringify(isi) : undefined,
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    });
  } catch (e) {
    throw new GalatDampier('jaringan', /timeout|abort/i.test(String(e)) ? 'DAMPIER tidak menjawab dalam 20 detik.' : 'DAMPIER tidak bisa dihubungi dari server situs ini.');
  }
  const j = (await r.json().catch(() => null)) as Record<string, unknown> | null;
  const galat = j && typeof j.galat === 'string' ? j.galat.slice(0, 300) : '';
  if (r.status === 404) throw new GalatDampier('kunci', 'DAMPIER tidak mengenal alamat ini. Kuncinya mungkin sudah diganti atau sambungannya diputus di DAMPIER. Salin alamat API yang baru.');
  if (r.status === 429) throw new GalatDampier('sering', 'DAMPIER meminta jeda karena terlalu sering dihubungi. Sinkron dicoba lagi nanti.');
  if (!r.ok || !j) throw new GalatDampier('jawab', galat ? `DAMPIER menolak kiriman. ${galat}` : `DAMPIER menjawab dengan galat ${r.status}.`);
  return j;
}

const TGL = /^\d{4}-\d{2}-\d{2}$/;
function bacaJawaban(j: Record<string, unknown>): Bacaan {
  const kamar = Array.isArray(j.kamar)
    ? (j.kamar as Record<string, unknown>[]).filter((x) => x && Number.isInteger(x.nomor)).map((x) => ({ nomor: Number(x.nomor), nama: String(x.nama ?? '').slice(0, 80) }))
    : [];
  const malam = Array.isArray(j.malam)
    ? (j.malam as Record<string, unknown>[]).filter((x) => x && typeof x.tanggal === 'string' && TGL.test(x.tanggal) && Number.isFinite(Number(x.terisi)))
      .map((x) => ({ tanggal: x.tanggal as string, terisi: Math.max(0, Math.round(Number(x.terisi))) }))
    : [];
  if (!kamar.length || !malam.length) throw new GalatDampier('bentuk', 'Jawaban DAMPIER tidak dikenali. Pastikan alamatnya alamat API dari kotak Untuk programmer website.');
  return { nama: String(j.nama ?? '').slice(0, 120), kamar: kamar.slice(0, 50), pesananWebsite: Math.max(0, Number(j.pesananWebsite) || 0), malam };
}

// Reads DAMPIER once with an address that is not saved yet, for the panel.
export async function ujiAlamatDampier(api: string) {
  return bacaJawaban(await panggil(api));
}

type Kiriman = { id: string; masuk: string; keluar: string; jumlahKamar: number; tamu?: number; nama?: string; negara?: string; nilai?: number; ket?: string };

const KATA: Record<StatusPesanan, string> = {
  menunggu: 'belum dibayar',
  dikonfirmasi: 'uang muka sudah dibayar',
  lunas: 'lunas',
  selesai: 'selesai',
  batal: 'batal',
};

// Every booking and closed date of the connected bungalow that has not
// ended, as DAMPIER takes them. Closed dates take every DAMPIER room, and
// a long one is cut into stays DAMPIER accepts.
async function daftarKiriman(kamarId: number, kamarDampier: number, hari: string): Promise<Kiriman[]> {
  const [pesanan, tutup] = await Promise.all([
    baris<{ kode: string; check_in: string; check_out: string; jumlah_kamar: number; dewasa: number; anak: number; nama: string; negara: string; total: number; status: StatusPesanan; kedatangan: string }>(
      "SELECT kode, check_in, check_out, jumlah_kamar, dewasa, anak, nama, negara, total, status, kedatangan FROM pesanan WHERE status <> 'batal' AND kamar_id = ? AND check_out > ? ORDER BY check_in, id",
      [kamarId, hari],
    ),
    baris<{ id: number; mulai: string; akhir: string; alasan: string }>(
      'SELECT id, mulai, akhir, alasan FROM tutup WHERE (kamar_id IS NULL OR kamar_id = ?) AND akhir >= ? ORDER BY mulai, id',
      [kamarId, hari],
    ),
  ]);
  const hasil: Kiriman[] = pesanan.filter((p) => p.check_out > p.check_in).map((p) => ({
    id: p.kode,
    masuk: p.check_in,
    keluar: p.check_out,
    jumlahKamar: Math.min(kamarDampier, Math.max(1, p.jumlah_kamar)),
    tamu: p.dewasa + p.anak,
    nama: p.nama.slice(0, 60),
    ...(p.negara ? { negara: p.negara } : {}),
    ...(p.total > 0 ? { nilai: p.total } : {}),
    ket: `Pesanan website ${p.kode}, ${KATA[p.status]}.${p.kedatangan ? ` Rencana tiba ${p.kedatangan}.` : ''}`.slice(0, 200),
  }));
  for (const t of tutup) {
    const akhir = tambahHari(t.akhir, 1);
    for (let mulai = t.mulai > hari ? t.mulai : hari, k = 0; mulai < akhir; k++) {
      const keluar = [tambahHari(mulai, MAKS_MALAM), akhir].sort()[0];
      hasil.push({ id: k ? `TUTUP-${t.id}-${k}` : `TUTUP-${t.id}`, masuk: mulai, keluar, jumlahKamar: kamarDampier, nama: 'Tanggal tutup', ket: (t.alasan || 'Ditutup dari panel situs.').slice(0, 200) });
      mulai = keluar;
    }
  }
  return hasil.sort((a, b) => a.masuk.localeCompare(b.masuk)).slice(0, MAKS_KIRIM);
}

const sidikDari = (k: Kiriman[]) => crypto.createHash('sha256').update(JSON.stringify(k)).digest('hex').slice(0, 32);

// Rooms this site sent, per night.
function malamKita(k: Kiriman[]) {
  const m = new Map<string, number>();
  for (const x of k) for (const d of daftarMalam(x.masuk, x.keluar)) m.set(d, (m.get(d) ?? 0) + x.jumlahKamar);
  return m;
}

type Simpan = { jalan?: Promise<unknown>; lagi?: boolean; gagalPindah?: number };
const g = globalThis as unknown as { __mambetronDampier?: Simpan };
const S: Simpan = (g.__mambetronDampier ??= {});

// One round with DAMPIER: read, send the list when it changed, read again,
// keep the rooms taken elsewhere. A failed round keeps the nights from the
// last good one, so DAMPIER being down for a moment opens nothing here.
async function satuPutaran(o: { paksa?: boolean; segera?: boolean }) {
  const k = await bacaSimpanan();
  if (!k) return;
  if (!o.paksa && !o.segera && k.dicoba && Date.now() - Date.parse(k.dicoba) < SEGAR_MENIT * 60_000) return;
  const dicoba = new Date().toISOString();
  let kirim = k.kirim, bentrok = k.bentrok ?? [];
  try {
    const km = await satu<{ id: number }>('SELECT id FROM kamar WHERE id = ?', [k.kamarId]);
    if (!km) throw new GalatDampier('kamar', 'Bungalow yang disambungkan ke DAMPIER sudah dihapus. Putuskan lalu sambungkan ulang.');
    const hari = hariIni();
    let baca = bacaJawaban(await panggil(k.api));
    const kiriman = await daftarKiriman(km.id, baca.kamar.length, hari);
    const sidik = sidikDari(kiriman);
    const kirimSemua = async () => {
      const j = await panggil(k.api, { pesanan: kiriman, ganti: true });
      kirim = { sidik, waktu: new Date().toISOString(), jumlah: kiriman.length };
      bentrok = (Array.isArray(j.bentrok) ? (j.bentrok as Record<string, unknown>[]) : [])
        .filter((b) => b && typeof b.id === 'string' && typeof b.mulai === 'string' && typeof b.selesai === 'string')
        .slice(0, 50).map((b) => ({ id: String(b.id).slice(0, 80), mulai: String(b.mulai), selesai: String(b.selesai) }));
      baca = bacaJawaban(await panggil(k.api));
    };
    const basi = !k.kirim || Date.now() - Date.parse(k.kirim.waktu) > KIRIM_ULANG_JAM * 3600_000;
    if (o.paksa || basi || k.kirim?.sidik !== sidik) await kirimSemua();
    // a website booking deleted at DAMPIER, or one left there from before
    else if (baca.pesananWebsite !== kiriman.length) await kirimSemua();
    const kita = malamKita(kiriman);
    const lain = baca.malam
      .map((m) => ({ malam: m.tanggal, n: Math.max(0, Math.min(baca.kamar.length, m.terisi) - (kita.get(m.tanggal) ?? 0)) }))
      .filter((m) => m.n > 0);
    // disconnected while this round ran
    if ((await bacaSimpanan())?.api !== k.api) return;
    await transaksi(async (c) => {
      await c.query('DELETE FROM kalender_dampier');
      for (let i = 0; i < lain.length; i += 200) {
        const bagian = lain.slice(i, i + 200);
        await c.query(`INSERT INTO kalender_dampier (kamar_id, malam, terisi) VALUES ${bagian.map(() => '(?, ?, ?)').join(', ')}`,
          bagian.flatMap((m) => [km.id, m.malam, Math.min(255, m.n)]));
      }
    });
    await tulisSimpanan({ ...k, dicoba, berhasil: new Date().toISOString(), galat: '', nama: baca.nama, kamar: baca.kamar, pesananWebsite: baca.pesananWebsite, kirim, bentrok });
  } catch (e) {
    const pesan = e instanceof GalatDampier ? e.message : 'Sinkron DAMPIER gagal disimpan.';
    if (!(e instanceof GalatDampier)) console.error('[mambetron] sinkron DAMPIER', e);
    if ((await bacaSimpanan())?.api !== k.api) return;
    await tulisSimpanan({ ...k, dicoba, galat: pesan.slice(0, 300), kirim, bentrok }).catch(() => {});
  }
}

// One round at a time. `segera` skips the wait between reads, for a change
// made here that DAMPIER should hear about now. A change that arrives
// during a round gets one more round after it.
export function sinkronDampier(o: { paksa?: boolean; segera?: boolean } = {}): Promise<unknown> {
  if (!dbDiatur()) return Promise.resolve();
  if (S.jalan) {
    if (o.paksa || o.segera) S.lagi = true;
    return S.jalan;
  }
  S.jalan = satuPutaran(o)
    .catch((e) => console.error('[mambetron] sinkron DAMPIER', e))
    .finally(() => {
      S.jalan = undefined;
      if (S.lagi) {
        S.lagi = false;
        void sinkronDampier({ segera: true });
      }
    });
  return S.jalan;
}

// After a booking or closed date changed here. Never waited on by a guest.
export function kabariDampier() {
  void sinkronDampier({ segera: true });
}

// The API address inside a DAMPIER link, or null. DAMPIER's sheet Sambungkan
// website gives one iCal link per room, /api/kamar/<key>/<room>.ics, made to
// be pasted into the website one room at a time. Its key opens every room.
export function apiDariTautan(url: string) {
  try {
    return rapikanAlamatDampier(url);
  } catch {
    return null;
  }
}

// DAMPIER's export for one OTA room, /api/kalender-mitra/ics/<token>.ics. It
// carries no key, so only that room can be read through it.
export const tautanSatuKamarDampier = (url: string) => /\/api\/kalender-mitra\/ics\/[^/]+\.ics$/i.test(url.split('?')[0]);

// A DAMPIER room link saved as an iCal link on one unit, before this site
// knew DAMPIER, reads only that room, so nights full at DAMPIER never look
// full here. Its key connects the site to DAMPIER for every room instead,
// and the link goes quiet with the other iCal links (dampierAktif). Tried
// again ten minutes after a failure.
export async function sambungDariIcal() {
  if (!dbDiatur() || (S.gagalPindah && Date.now() - S.gagalPindah < 10 * 60_000) || (await dampierAktif())) return false;
  const daftar = await baris<{ kamar_id: number; url: string }>("SELECT kamar_id, url FROM kalender_sambungan WHERE url LIKE '%/api/kamar/%' ORDER BY id").catch(() => []);
  for (const r of daftar) {
    const api = apiDariTautan(r.url);
    if (!api) continue;
    try {
      await simpanAlamatDampier(api, r.kamar_id, await ujiAlamatDampier(api));
      return true;
    } catch (e) {
      S.gagalPindah = Date.now();
      if (!(e instanceof GalatDampier)) console.error('[mambetron] sambung DAMPIER dari iCal', e);
      return false;
    }
  }
  return false;
}

export async function simpanAlamatDampier(api: string, kamarId: number, b: Bacaan) {
  await tulisSimpanan({ api, kamarId, nama: b.nama, kamar: b.kamar, pesananWebsite: b.pesananWebsite });
  // nights read through the site's own iCal links reach here through DAMPIER now
  await jalankan('DELETE FROM kalender_luar');
  await sinkronDampier({ paksa: true });
}

// The site's own iCal links, if any, are read again at once. DAMPIER room
// links saved among them go too, or they would connect DAMPIER again.
export async function putuskanDampier() {
  await jalankan("DELETE FROM pengaturan WHERE kunci = 'dampier'");
  await jalankan('DELETE FROM kalender_dampier');
  const dampier = (await baris<{ id: number; url: string }>("SELECT id, url FROM kalender_sambungan WHERE url LIKE '%/api/kamar/%'"))
    .filter((x) => apiDariTautan(x.url)).map((x) => x.id);
  if (dampier.length) {
    await jalankan('DELETE FROM kalender_luar WHERE sambungan_id IN (?)', [dampier]);
    await jalankan('DELETE FROM kalender_sambungan WHERE id IN (?)', [dampier]);
  }
  await jalankan('UPDATE kalender_sambungan SET dicoba = NULL');
}

export type BlokDampier = { sambungan_id: 0; kamar_id: number; unit: number; mulai: string; selesai: string; ringkas: string; nama: string };

// Rooms taken at DAMPIER as nights on units, for the counts and the panel
// calendar. They take the highest units, bookings here fill from unit 1.
// The unit is only a place in the count, DAMPIER knows which room it is.
export async function blokDampier(
  kamar: Pick<Kamar, 'id' | 'jumlah_unit'>[],
  dari: string,
  sampai: string,
  tanya: <T>(sql: string, nilai: unknown[]) => Promise<T[]> = baris,
): Promise<BlokDampier[]> {
  if (!kamar.length || dari >= sampai || !dbDiatur()) return [];
  const rows = await tanya<{ kamar_id: number; malam: string; terisi: number }>(
    'SELECT kamar_id, malam, terisi FROM kalender_dampier WHERE kamar_id IN (?) AND malam >= ? AND malam < ? ORDER BY kamar_id, malam',
    [kamar.map((k) => k.id), dari, sampai],
  ).catch(() => []);
  const hasil: BlokDampier[] = [];
  const buka = new Map<string, BlokDampier>();
  for (const r of rows) {
    const n = kamar.find((k) => k.id === r.kamar_id)?.jumlah_unit ?? 0;
    for (let u = n; u > n - Math.min(n, r.terisi); u--) {
      const kunci = `${r.kamar_id}|${u}`;
      const b = buka.get(kunci);
      if (b && b.selesai === r.malam) {
        b.selesai = tambahHari(r.malam, 1);
        continue;
      }
      const baru: BlokDampier = { sambungan_id: 0, kamar_id: r.kamar_id, unit: u, mulai: r.malam, selesai: tambahHari(r.malam, 1), ringkas: 'terisi di kalender DAMPIER', nama: 'DAMPIER' };
      hasil.push(baru);
      buka.set(kunci, baru);
    }
  }
  return hasil.sort((a, b) => a.mulai.localeCompare(b.mulai) || a.unit - b.unit);
}
