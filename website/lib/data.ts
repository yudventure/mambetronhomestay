// Reads for the public pages and the admin panel. Without a database the
// public pages fall back to the default content in bawaan.mjs.
import { cache } from 'react';
import { KAMAR_AWAL, LAYANAN_AWAL, gabungSitus } from './bawaan.mjs';
import { baris, satu, type Koneksi, type Baris } from './db';
import { dbDiatur } from './env';
import type { Foto, Kamar, Layanan, Pesanan, Situs, Ulasan } from './jenis';
import { daftarMalam, tambahHari } from './tanggal';

const urlFoto = (id: number) => `/api/foto/${id}`;
const baris2 = (s: string | null | undefined) => (s ?? '').split('\n').map((x) => x.trim()).filter(Boolean);

function catat(e: unknown, apa: string) {
  console.error(`[mambetron] gagal membaca ${apa}`, e);
}

export const ambilSitus = cache(async (): Promise<Situs> => {
  if (!dbDiatur()) return gabungSitus(null) as Situs;
  try {
    const r = await satu<{ nilai: string }>("SELECT nilai FROM pengaturan WHERE kunci = 'situs'");
    return gabungSitus(r ? JSON.parse(r.nilai) : null) as Situs;
  } catch (e) {
    catat(e, 'pengaturan');
    return gabungSitus(null) as Situs;
  }
});

// Whether bookings can be saved right now.
export const pemesananAktif = cache(async () => {
  if (!dbDiatur()) return false;
  try {
    await satu('SELECT 1');
    return true;
  } catch (e) {
    catat(e, 'koneksi database');
    return false;
  }
});

type BarisKamar = Omit<Kamar, 'fasilitas' | 'fasilitas_en' | 'aktif' | 'foto'> & { fasilitas: string | null; fasilitas_en: string | null; aktif: number };

function keKamar(r: BarisKamar, foto: Foto[]): Kamar {
  return {
    ...r,
    deskripsi: r.deskripsi ?? '',
    deskripsi_en: r.deskripsi_en ?? '',
    fasilitas: baris2(r.fasilitas),
    fasilitas_en: baris2(r.fasilitas_en),
    harga_anak: r.harga_anak == null ? null : Number(r.harga_anak),
    skema_harga: r.skema_harga === 'kamar' ? 'kamar' : 'orang',
    aktif: Boolean(r.aktif),
    foto,
  };
}

function kamarBawaan(): Kamar[] {
  return KAMAR_AWAL.map((k, i) => ({
    ...k,
    id: i + 1,
    harga_anak: k.harga_anak ?? null,
    skema_harga: k.skema_harga === 'kamar' ? 'kamar' : 'orang',
    aktif: true,
    foto: [],
  }));
}

async function fotoMenurutKamar() {
  const r = await baris<{ id: number; kamar_id: number; lebar: number; tinggi: number; keterangan: string }>(
    "SELECT id, kamar_id, lebar, tinggi, keterangan FROM foto WHERE wadah = 'kamar' ORDER BY urutan, id",
  );
  const m = new Map<number, Foto[]>();
  for (const f of r) {
    const daftar = m.get(f.kamar_id) ?? [];
    daftar.push({ id: f.id, lebar: f.lebar, tinggi: f.tinggi, keterangan: f.keterangan, url: urlFoto(f.id) });
    m.set(f.kamar_id, daftar);
  }
  return m;
}

export const daftarKamar = cache(async (semua = false): Promise<Kamar[]> => {
  if (!dbDiatur()) return kamarBawaan();
  try {
    const [r, foto] = await Promise.all([
      baris<BarisKamar>(`SELECT * FROM kamar ${semua ? '' : 'WHERE aktif = 1'} ORDER BY urutan, id`),
      fotoMenurutKamar(),
    ]);
    return r.map((k) => keKamar(k, foto.get(k.id) ?? []));
  } catch (e) {
    catat(e, 'kamar');
    return semua ? [] : kamarBawaan();
  }
});

export async function kamarDariSlug(slug: string) {
  return (await daftarKamar()).find((k) => k.slug === slug) ?? null;
}

export async function kamarDariId(id: number, semua = true) {
  return (await daftarKamar(semua)).find((k) => k.id === id) ?? null;
}

// Placeholder picture for rooms without photos.
export const gambarCadangan = (i: number) => `/merek/kamar-${(i % 3) + 1}.svg`;

type BarisLayanan = Omit<Layanan, 'aktif'> & { aktif: number };
export const daftarLayanan = cache(async (semua = false): Promise<Layanan[]> => {
  if (!dbDiatur()) return LAYANAN_AWAL.map((l, i) => ({ ...l, id: i + 1, aktif: true } as Layanan));
  try {
    const r = await baris<BarisLayanan>(`SELECT * FROM layanan ${semua ? '' : 'WHERE aktif = 1'} ORDER BY urutan, id`);
    return r.map((l) => ({ ...l, aktif: Boolean(l.aktif) }));
  } catch (e) {
    catat(e, 'layanan');
    return [];
  }
});

type BarisUlasan = Omit<Ulasan, 'tampil'> & { tampil: number };
export const daftarUlasan = cache(async (semua = false): Promise<Ulasan[]> => {
  if (!dbDiatur()) return [];
  try {
    const r = await baris<BarisUlasan>(`SELECT * FROM ulasan ${semua ? '' : 'WHERE tampil = 1'} ORDER BY urutan, id DESC`);
    return r.map((u) => ({ ...u, tampil: Boolean(u.tampil) }));
  } catch (e) {
    catat(e, 'ulasan');
    return [];
  }
});

// Site photos outside the rooms, grouped by where they appear.
export type WadahFoto = 'beranda' | 'tentang' | 'ajakan' | 'galeri';
export const fotoSitus = cache(async (): Promise<Record<WadahFoto, Foto[]>> => {
  const kosong = { beranda: [], tentang: [], ajakan: [], galeri: [] } as Record<WadahFoto, Foto[]>;
  if (!dbDiatur()) return kosong;
  try {
    const r = await baris<{ id: number; wadah: WadahFoto; lebar: number; tinggi: number; keterangan: string }>(
      "SELECT id, wadah, lebar, tinggi, keterangan FROM foto WHERE wadah IN ('beranda', 'tentang', 'ajakan', 'galeri') ORDER BY urutan, id",
    );
    for (const f of r) kosong[f.wadah].push({ id: f.id, lebar: f.lebar, tinggi: f.tinggi, keterangan: f.keterangan, url: urlFoto(f.id) });
    return kosong;
  } catch (e) {
    catat(e, 'foto');
    return kosong;
  }
});

// Rooms left per night. Only nights with fewer than all units free are
// listed, a missing night means every unit is free. The end date is the
// check-out day and is not counted.
export type PetaSisa = Record<string, number>;

export async function sisaKamar(
  kamar: Pick<Kamar, 'id' | 'jumlah_unit'>[],
  dari: string,
  sampai: string,
  o: { conn?: Koneksi; kecuali?: number } = {},
): Promise<Map<number, PetaSisa>> {
  const hasil = new Map<number, PetaSisa>(kamar.map((k) => [k.id, {}]));
  if (!kamar.length || dari >= sampai) return hasil;
  const ids = kamar.map((k) => k.id);
  const tanya = async <T,>(sql: string, nilai: unknown[]) => {
    if (o.conn) {
      const [r] = await o.conn.query<Baris[]>(sql, nilai);
      return r as T[];
    }
    return baris<T>(sql, nilai);
  };
  const [pesanan, tutup] = await Promise.all([
    tanya<{ kamar_id: number; check_in: string; check_out: string; jumlah_kamar: number }>(
      `SELECT kamar_id, check_in, check_out, jumlah_kamar FROM pesanan
       WHERE status <> 'batal' AND check_in < ? AND check_out > ? AND kamar_id IN (?)${o.kecuali ? ' AND id <> ?' : ''}`,
      [sampai, dari, ids, ...(o.kecuali ? [o.kecuali] : [])],
    ),
    tanya<{ kamar_id: number | null; mulai: string; akhir: string }>(
      'SELECT kamar_id, mulai, akhir FROM tutup WHERE mulai < ? AND akhir >= ? AND (kamar_id IS NULL OR kamar_id IN (?))',
      [sampai, dari, ids],
    ),
  ]);
  const unit = new Map(kamar.map((k) => [k.id, k.jumlah_unit]));
  const kurangi = (id: number, malam: string, n: number) => {
    const peta = hasil.get(id);
    if (!peta) return;
    peta[malam] = Math.max(0, (peta[malam] ?? unit.get(id) ?? 0) - n);
  };
  for (const p of pesanan) {
    const a = p.check_in > dari ? p.check_in : dari;
    const b = p.check_out < sampai ? p.check_out : sampai;
    for (const m of daftarMalam(a, b)) kurangi(p.kamar_id, m, p.jumlah_kamar);
  }
  for (const t of tutup) {
    const a = t.mulai > dari ? t.mulai : dari;
    const akhir = tambahHari(t.akhir, 1);
    const b = akhir < sampai ? akhir : sampai;
    for (const id of t.kamar_id == null ? ids : [t.kamar_id]) {
      for (const m of daftarMalam(a, b)) kurangi(id, m, 999);
    }
  }
  return hasil;
}

// Booking rows.
type BarisPesanan = Omit<Pesanan, 'rincian' | 'catatan' | 'catatan_admin'> & { rincian: string | null; catatan: string | null; catatan_admin: string | null };

export function kePesanan(r: BarisPesanan): Pesanan {
  let rincian: Pesanan['rincian'] = [];
  try {
    rincian = r.rincian ? JSON.parse(r.rincian) : [];
  } catch {
    rincian = [];
  }
  return {
    ...r,
    rincian,
    catatan: r.catatan ?? '',
    catatan_admin: r.catatan_admin ?? '',
    bahasa: r.bahasa === 'en' ? 'en' : 'id',
  };
}

export async function pesananDariKode(kode: string) {
  const r = await satu<BarisPesanan>('SELECT * FROM pesanan WHERE kode = ?', [kode.toUpperCase()]);
  return r ? kePesanan(r) : null;
}

export async function pesananDariId(id: number) {
  const r = await satu<BarisPesanan>('SELECT * FROM pesanan WHERE id = ?', [id]);
  return r ? kePesanan(r) : null;
}

export async function cariPesanan(o: { status?: string; q?: string; dari?: string; sampai?: string; urut?: 'dibuat' | 'tiba'; batas?: number }) {
  const syarat: string[] = [];
  const nilai: unknown[] = [];
  if (o.status) {
    syarat.push('status = ?');
    nilai.push(o.status);
  }
  if (o.q) {
    syarat.push('(kode LIKE ? OR nama LIKE ? OR email LIKE ? OR telepon LIKE ?)');
    const q = `%${o.q}%`;
    nilai.push(q, q, q, q);
  }
  if (o.dari) {
    syarat.push('check_out > ?');
    nilai.push(o.dari);
  }
  if (o.sampai) {
    syarat.push('check_in < ?');
    nilai.push(o.sampai);
  }
  const where = syarat.length ? `WHERE ${syarat.join(' AND ')}` : '';
  const urut = o.urut === 'tiba' ? 'check_in ASC, id ASC' : 'dibuat DESC, id DESC';
  const r = await baris<BarisPesanan>(`SELECT * FROM pesanan ${where} ORDER BY ${urut} LIMIT ${Math.min(o.batas ?? 200, 1000)}`, nilai);
  return r.map(kePesanan);
}

export type Tutup = { id: number; kamar_id: number | null; mulai: string; akhir: string; alasan: string };
export async function daftarTutup(dari: string) {
  return baris<Tutup>('SELECT id, kamar_id, mulai, akhir, alasan FROM tutup WHERE akhir >= ? ORDER BY mulai', [dari]);
}
