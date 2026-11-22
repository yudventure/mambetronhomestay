// The price list this site sends to DAMPIER with its bookings, the owner's
// request, November 2026: the boat ticked on the date card was missing from
// DAMPIER's payment sheet, the sheet still said the boat transfer was not
// included, "dan untuk harga juga masih ngikut yang the dampier".
//
// DAMPIER keeps it with this site's connection and its payment sheet opened
// over this site charges these prices (DAMPIER data/harga-situs.ts):
// - harga, the price per person per night for two guests in a bungalow
// - isi, the price per person for 1, 2, 3 ... guests in one bungalow, from
//   the bungalow price, the solo price and the price for the third guest
// - tambahan, the boat transfers priced per boat one way, the guest picks
//   there and back or one way on the sheet as on the date card
// The first rate tier's percentage is added, as on the date card. Children
// under the free age stay free on both sides. Thedampier.com's own listing
// page keeps DAMPIER's price.
import { hargaIsiPondok } from './harga';
import type { Kamar, Layanan } from './jenis';

export type TambahanDampier = { nama: string; namaEn?: string; harga: number; per: 'perahu'; maks?: number; pulangPergi: true };
export type HargaDampier = { harga: number; isi: number[]; tambahan: TambahanDampier[] };

type KamarHarga = Pick<Kamar, 'harga' | 'skema_harga' | 'harga_sendiri' | 'harga_tambah' | 'kapasitas'>;
type PerahuHarga = Pick<Layanan, 'nama' | 'nama_en' | 'harga' | 'satuan' | 'muat'>;

export function hargaUntukDampier(kamar: KamarHarga | null, layanan: PerahuHarga[], persenPaket = 0): HargaDampier | null {
  const naik = (x: number) => (persenPaket > 0 ? (x * (100 + persenPaket)) / 100 : x);
  let harga = 0;
  let isi: number[] = [];
  if (kamar && Number(kamar.harga) > 0) {
    const k = { ...kamar, harga: Number(kamar.harga), harga_sendiri: Number(kamar.harga_sendiri) || 0, harga_tambah: Number(kamar.harga_tambah) || 0, kapasitas: Math.max(1, Number(kamar.kapasitas) || 1) };
    if (k.skema_harga === 'kamar') {
      isi = Array.from({ length: Math.min(12, k.kapasitas) }, (_, i) => Math.round(naik(hargaIsiPondok(k, i + 1)) / (i + 1)));
      harga = isi[Math.min(2, isi.length) - 1];
    } else {
      harga = Math.round(naik(k.harga));
    }
  }
  const tambahan: TambahanDampier[] = layanan
    .filter((l) => l.satuan === 'perahu' && Number(l.harga) > 0 && l.nama.trim())
    .slice(0, 8)
    .map((l) => ({
      nama: l.nama.trim().slice(0, 80),
      ...(l.nama_en?.trim() && l.nama_en.trim() !== l.nama.trim() ? { namaEn: l.nama_en.trim().slice(0, 80) } : {}),
      harga: Math.round(Number(l.harga)),
      per: 'perahu' as const,
      ...(Number(l.muat) >= 1 ? { maks: Math.min(50, Math.round(Number(l.muat))) } : {}),
      pulangPergi: true as const,
    }));
  if (!harga && !tambahan.length) return null;
  return { harga, isi, tambahan };
}
