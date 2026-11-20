// Price of a stay. Used by the booking form for the live total and by the
// server when the booking is saved, so both always agree.
import type { BarisLayanan, Kamar, Layanan, Satuan } from './jenis';

export function jumlahSatuan(satuan: Satuan, tamu: number, malam: number) {
  switch (satuan) {
    case 'pesanan': return 1;
    case 'orang': return tamu;
    case 'malam': return malam;
    case 'orang_malam': return tamu * malam;
  }
}

// Bungalows a party needs: paying guests (adults and children from the free
// age) fill the beds, children under it share their parents' bed, a few per
// bungalow (Isi situs, Anak gratis per bungalow).
export function pondokUntuk(tamu: number, anak: number, kapasitas: number, anakPerPondok: number) {
  return Math.max(1, Math.ceil(Math.max(1, tamu) / Math.max(1, kapasitas)), Math.ceil(Math.max(0, anak) / Math.max(1, anakPerPondok)));
}

// `dewasa` are the paying guests, adults and children from the free age
// (Isi situs, usiaGratis), who pay in full. `anak` are the children under
// it, free and not counted for extras per person. The owner's rule,
// November 2026: under 5 free, from 5 the full price.
export function hitungHarga(
  kamar: Pick<Kamar, 'harga' | 'skema_harga'>,
  o: { malam: number; jumlahKamar: number; dewasa: number; anak: number; layanan: Layanan[]; dpPersen: number; persenPaket?: number },
) {
  const malam = Math.max(0, o.malam);
  const dasar = kamar.skema_harga === 'kamar'
    ? kamar.harga * o.jumlahKamar * malam
    : kamar.harga * o.dewasa * malam;
  // a rate tier adds its percentage to the bungalow part only, rounded to whole thousands
  const persen = o.persenPaket ?? 0;
  const biayaKamar = persen > 0 ? Math.round((dasar * (100 + persen)) / 100 / 1000) * 1000 : dasar;
  const tamu = o.dewasa;
  const rincian: BarisLayanan[] = o.layanan.map((l) => {
    const jumlah = jumlahSatuan(l.satuan, tamu, malam);
    return { id: l.id, nama: l.nama, nama_en: l.nama_en, harga: l.harga, satuan: l.satuan, jumlah, subtotal: l.harga * jumlah };
  });
  const biayaLayanan = rincian.reduce((a, r) => a + r.subtotal, 0);
  const total = biayaKamar + biayaLayanan;
  const dp = o.dpPersen > 0 ? Math.min(total, Math.ceil((total * o.dpPersen) / 100 / 1000) * 1000) : 0;
  return { biayaKamar, rincian, biayaLayanan, total, dp };
}
