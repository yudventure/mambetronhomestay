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

export function hitungHarga(
  kamar: Pick<Kamar, 'harga' | 'harga_anak' | 'skema_harga'>,
  o: { malam: number; jumlahKamar: number; dewasa: number; anak: number; layanan: Layanan[]; dpPersen: number },
) {
  const malam = Math.max(0, o.malam);
  const biayaKamar = kamar.skema_harga === 'kamar'
    ? kamar.harga * o.jumlahKamar * malam
    : (kamar.harga * o.dewasa + (kamar.harga_anak ?? kamar.harga) * o.anak) * malam;
  const tamu = o.dewasa + o.anak;
  const rincian: BarisLayanan[] = o.layanan.map((l) => {
    const jumlah = jumlahSatuan(l.satuan, tamu, malam);
    return { id: l.id, nama: l.nama, nama_en: l.nama_en, harga: l.harga, satuan: l.satuan, jumlah, subtotal: l.harga * jumlah };
  });
  const biayaLayanan = rincian.reduce((a, r) => a + r.subtotal, 0);
  const total = biayaKamar + biayaLayanan;
  const dp = o.dpPersen > 0 ? Math.min(total, Math.ceil((total * o.dpPersen) / 100 / 1000) * 1000) : 0;
  return { biayaKamar, rincian, biayaLayanan, total, dp };
}
