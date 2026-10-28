// Rate tiers from Isi situs, Pemesanan dan pembayaran. Each tier adds a
// percentage to the bungalow price and carries its own date change and
// cancellation terms, which are copied into every booking made with it.
// Safe to use in client components.
import type { Dua, Situs } from './jenis';

export type Paket = { nama: Dua; syarat: Dua; persen: number };

const batas = (v: unknown) => Math.min(200, Math.max(0, Math.round(Number(v) || 0)));

export function daftarPaket(s: Pick<Situs, 'paketHarga'>): Paket[] {
  return (s.paketHarga ?? [])
    .filter((p) => p.nama.id.trim() || p.nama.en.trim())
    .map((p) => ({ nama: p.nama, syarat: p.syarat, persen: batas(p.persen) }));
}

// The tier stored with a booking, as JSON in pesanan.paket.
export function bacaPaket(v: unknown): Paket | null {
  if (typeof v !== 'string' || !v) return null;
  try {
    const p = JSON.parse(v);
    if (!p?.nama) return null;
    const dua = (x: unknown) => ({ id: String((x as Dua)?.id ?? ''), en: String((x as Dua)?.en ?? '') });
    return { nama: dua(p.nama), syarat: dua(p.syarat), persen: batas(p.persen) };
  } catch {
    return null;
  }
}
