// Saving a booking. The room row is locked for the length of the
// transaction, so two guests can never book the last unit of the same night.
import crypto from 'crypto';
import { transaksi, type Baris, type Hasil } from './db';
import { sisaKamar } from './data';
import { hitungHarga } from './harga';
import type { Bahasa, Kamar, Layanan, Situs, StatusPesanan } from './jenis';
import { daftarMalam, hariIni, sahTanggal, selisihHari, tambahHari } from './tanggal';

export type KodeGalat =
  | 'kamar' | 'tanggal' | 'terlaluCepat' | 'terlaluJauh' | 'minMalam' | 'maksMalam'
  | 'jumlahKamar' | 'tamu' | 'kapasitas' | 'nama' | 'kontak' | 'email' | 'penuh';

export class GalatPesan extends Error {
  constructor(public kode: KodeGalat, public isi: Record<string, string | number> = {}) {
    super(kode);
  }
}

export type MasukanPesan = {
  kamarId: number;
  masuk: string;
  keluar: string;
  jumlahKamar: number;
  dewasa: number;
  anak: number;
  layanan: number[];
  nama: string;
  email: string;
  telepon: string;
  negara: string;
  kedatangan: string;
  catatan: string;
  bahasa: Bahasa;
  sumber: 'situs' | 'admin';
  status?: StatusPesanan;
  catatanAdmin?: string;
};

const HURUF = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function kodeBaru() {
  const b = crypto.randomBytes(6);
  return `MB${Array.from(b, (x) => HURUF[x % HURUF.length]).join('')}`;
}

const potong = (s: string, n: number) => s.trim().slice(0, n);
export const surelSah = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// Checks that do not need the database. Admins may book past dates and
// bypass the lead time and the booking window.
export function periksa(m: MasukanPesan, kamar: Kamar | null, situs: Situs) {
  if (!kamar || (!kamar.aktif && m.sumber !== 'admin')) throw new GalatPesan('kamar');
  if (!sahTanggal(m.masuk) || !sahTanggal(m.keluar) || m.keluar <= m.masuk) throw new GalatPesan('tanggal');
  const malam = selisihHari(m.masuk, m.keluar);
  if (m.sumber !== 'admin') {
    const paling = tambahHari(hariIni(), situs.jedaHari);
    if (m.masuk < paling) throw new GalatPesan('terlaluCepat', { hari: situs.jedaHari });
    if (m.masuk > tambahHari(hariIni(), situs.batasHari)) throw new GalatPesan('terlaluJauh', { hari: situs.batasHari });
    if (malam < kamar.min_malam) throw new GalatPesan('minMalam', { n: kamar.min_malam });
  }
  if (malam > 60) throw new GalatPesan('maksMalam');
  if (!Number.isInteger(m.jumlahKamar) || m.jumlahKamar < 1 || m.jumlahKamar > kamar.jumlah_unit) throw new GalatPesan('jumlahKamar', { n: kamar.jumlah_unit });
  if (!Number.isInteger(m.dewasa) || m.dewasa < 1 || !Number.isInteger(m.anak) || m.anak < 0) throw new GalatPesan('tamu');
  if (m.dewasa + m.anak > kamar.kapasitas * m.jumlahKamar) throw new GalatPesan('kapasitas', { n: kamar.kapasitas * m.jumlahKamar });
  if (potong(m.nama, 120).length < 2) throw new GalatPesan('nama');
  if (m.sumber !== 'admin' && m.telepon.replace(/\D/g, '').length < 8) throw new GalatPesan('kontak');
  if (m.email && !surelSah(m.email.trim())) throw new GalatPesan('email');
  return malam;
}

export async function simpanPesanan(m: MasukanPesan, kamar: Kamar, layananAda: Layanan[], situs: Situs) {
  const malam = periksa(m, kamar, situs);
  const pilihan = layananAda.filter((l) => m.layanan.includes(l.id));
  const h = hitungHarga(kamar, { malam, jumlahKamar: m.jumlahKamar, dewasa: m.dewasa, anak: m.anak, layanan: pilihan, dpPersen: situs.dpPersen });
  const token = crypto.randomBytes(16).toString('hex');

  return transaksi(async (c) => {
    await c.query<Baris[]>('SELECT id FROM kamar WHERE id = ? FOR UPDATE', [kamar.id]);
    const sisa = (await sisaKamar([kamar], m.masuk, m.keluar, { conn: c })).get(kamar.id) ?? {};
    const penuh = daftarMalam(m.masuk, m.keluar).filter((d) => (sisa[d] ?? kamar.jumlah_unit) < m.jumlahKamar);
    if (penuh.length) throw new GalatPesan('penuh', { malam: penuh[0] });

    for (let coba = 0; coba < 5; coba++) {
      const kode = kodeBaru();
      try {
        const [r] = await c.query<Hasil>(
          `INSERT INTO pesanan (kode, token, kamar_id, kamar_nama, jumlah_kamar, check_in, check_out, malam, dewasa, anak,
            nama, email, telepon, negara, kedatangan, catatan, harga_satuan, skema_harga, biaya_kamar, biaya_layanan,
            total, dp, rincian, bahasa, status, sumber, catatan_admin)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [kode, token, kamar.id, kamar.nama, m.jumlahKamar, m.masuk, m.keluar, malam, m.dewasa, m.anak,
            potong(m.nama, 120), potong(m.email, 160), potong(m.telepon, 40), potong(m.negara, 80), potong(m.kedatangan, 200),
            potong(m.catatan, 2000), kamar.harga, kamar.skema_harga, h.biayaKamar, h.biayaLayanan, h.total, h.dp,
            JSON.stringify(h.rincian), m.bahasa, m.status ?? 'menunggu', m.sumber, potong(m.catatanAdmin ?? '', 2000)],
        );
        return { id: r.insertId, kode, token };
      } catch (e) {
        if ((e as { code?: string }).code !== 'ER_DUP_ENTRY') throw e;
      }
    }
    throw new Error('Gagal membuat kode pesanan.');
  });
}

// Simple in-memory limit per visitor, enough to stop a script from filling
// every night with fake bookings. Only saved bookings count, so a guest who
// fixes a typo is never locked out. Resets when the server restarts.
const jejak = new Map<string, number[]>();
const JENDELA = 30 * 60_000;
const terbaru = (kunci: string) => (jejak.get(kunci) ?? []).filter((t) => Date.now() - t < JENDELA);
export const bolehKirim = (kunci: string, maks = 4) => terbaru(kunci).length < maks;
export function catatKirim(kunci: string) {
  if (jejak.size > 5000) jejak.clear();
  jejak.set(kunci, [...terbaru(kunci), Date.now()]);
}
