// Price of a stay. Used by the booking form for the live total and by the
// server when the booking is saved, so both always agree.
import type { Bahasa, BarisLayanan, Kamar, Layanan, Pesanan, Satuan } from './jenis';
import { KAMUS } from './kamus';
import { rupiah } from './format';
import { SATUAN } from './satuan.mjs';

// The unit of an extra as shown, with how many one boat takes.
export function satuanLayanan(l: Pick<Layanan, 'satuan' | 'muat'>, b: Bahasa) {
  const s = SATUAN[l.satuan]?.[b] ?? '';
  return l.satuan === 'perahu' && l.muat > 0 ? `${s}, ${KAMUS[b].muatPerahu(l.muat)}` : s;
}

// `orang` is everyone on board for a boat, children under the free age
// included, and `muat` how many one boat takes.
export function jumlahSatuan(satuan: Satuan, tamu: number, malam: number, orang = tamu, muat = 0) {
  switch (satuan) {
    case 'pesanan': return 1;
    case 'orang': return tamu;
    case 'malam': return malam;
    case 'orang_malam': return tamu * malam;
    case 'perahu': return muat > 0 ? Math.max(1, Math.ceil(Math.max(1, orang) / muat)) : 1;
  }
}

// Bungalows a party needs: paying guests (adults and children from the free
// age) fill the beds, children under it share their parents' bed, a few per
// bungalow (Isi situs, Anak gratis per bungalow).
export function pondokUntuk(tamu: number, anak: number, kapasitas: number, anakPerPondok: number) {
  return Math.max(1, Math.ceil(Math.max(1, tamu) / Math.max(1, kapasitas)), Math.ceil(Math.max(0, anak) / Math.max(1, anakPerPondok)));
}

// Price of a bungalow holding one paying guest. The owner's price,
// November 2026: a bungalow for two is Rp1.200.000, a guest alone
// Rp850.000. Only for bungalows priced per bungalow that sleep two or more,
// and only when it is below the usual price, otherwise the usual price.
export function hargaSendiri(k: Pick<Kamar, 'harga' | 'skema_harga' | 'harga_sendiri' | 'kapasitas'>) {
  const h = Math.max(0, Math.round(k.harga_sendiri) || 0);
  return k.skema_harga === 'kamar' && k.kapasitas >= 2 && h > 0 && h < k.harga ? h : k.harga;
}

// Paying guests spread evenly over the bungalows booked. `sendiri` are the
// bungalows holding one paying guest or none (a second bungalow for a
// parent with two children under the free age), which take the solo price,
// the others the usual price. Only for bungalows priced per bungalow.
export type IsiPondok = { penuh: number; sendiri: number; harga: number; hargaSendiri: number };
export function isiPondok(kamar: Pick<Kamar, 'harga' | 'skema_harga' | 'harga_sendiri' | 'kapasitas'>, jumlahKamar: number, dewasa: number): IsiPondok | null {
  if (kamar.skema_harga !== 'kamar') return null;
  const r = Math.max(1, Math.round(jumlahKamar) || 1), t = Math.max(0, Math.round(dewasa) || 0);
  const hs = hargaSendiri(kamar);
  // fewer guests than bungalows leaves none with two
  const q = Math.floor(t / r);
  const sendiri = hs >= kamar.harga ? 0 : q === 0 ? r : q === 1 ? r - (t % r) : 0;
  return { penuh: r - sendiri, sendiri, harga: kamar.harga, hargaSendiri: hs };
}

// `dewasa` are the paying guests, adults and children from the free age
// (Isi situs, usiaGratis), who pay in full. `anak` are the children under
// it, free and not counted for extras per person or in a bungalow's guests.
// The owner's rule, November 2026: under 5 free, from 5 the full price.
export function hitungHarga(
  kamar: Pick<Kamar, 'harga' | 'skema_harga' | 'harga_sendiri' | 'kapasitas'>,
  o: { malam: number; jumlahKamar: number; dewasa: number; anak: number; layanan: Layanan[]; dpPersen: number; persenPaket?: number },
) {
  const malam = Math.max(0, o.malam);
  const isi = isiPondok(kamar, o.jumlahKamar, o.dewasa);
  const dasar = isi
    ? (isi.penuh * isi.harga + isi.sendiri * isi.hargaSendiri) * malam
    : kamar.harga * o.dewasa * malam;
  // a rate tier adds its percentage to the bungalow part only, rounded to whole thousands
  const persen = o.persenPaket ?? 0;
  const biayaKamar = persen > 0 ? Math.round((dasar * (100 + persen)) / 100 / 1000) * 1000 : dasar;
  const tamu = o.dewasa;
  const rincian: BarisLayanan[] = o.layanan.map((l) => {
    const jumlah = jumlahSatuan(l.satuan, tamu, malam, o.dewasa + Math.max(0, o.anak), l.muat);
    return { id: l.id, nama: l.nama, nama_en: l.nama_en, harga: l.harga, satuan: l.satuan, jumlah, subtotal: l.harga * jumlah };
  });
  const biayaLayanan = rincian.reduce((a, r) => a + r.subtotal, 0);
  const total = biayaKamar + biayaLayanan;
  const dp = o.dpPersen > 0 ? Math.min(total, Math.ceil((total * o.dpPersen) / 100 / 1000) * 1000) : 0;
  return { biayaKamar, rincian, biayaLayanan, total, dp, isi };
}

// The solo price to keep on a booking, 0 when the bungalow gives none.
export const hargaSendiriSimpan = (k: Pick<Kamar, 'harga' | 'skema_harga' | 'harga_sendiri' | 'kapasitas'>) => {
  const h = hargaSendiri(k);
  return h < k.harga ? h : 0;
};

// The same split for a saved booking, from the prices it was booked with.
// Bookings from the first release kept a percentage instead (30% less).
export function isiPesanan(p: Pick<Pesanan, 'harga_satuan' | 'skema_harga' | 'harga_sendiri' | 'persen_sendiri' | 'jumlah_kamar' | 'dewasa'>) {
  const persen = Math.min(90, Math.max(0, p.persen_sendiri || 0));
  const sendiri = p.harga_sendiri || (persen ? Math.round((p.harga_satuan * (100 - persen)) / 100 / 1000) * 1000 : 0);
  return isiPondok({ harga: p.harga_satuan, skema_harga: p.skema_harga, harga_sendiri: sendiri, kapasitas: 2 }, p.jumlah_kamar, p.dewasa);
}

// Lines under the bungalow in a price summary, one for bungalows at the
// usual price and one for bungalows holding one guest.
export function barisIsi(b: Bahasa, isi: IsiPondok | null) {
  if (!isi) return [];
  const f = KAMUS[b].form;
  return [
    isi.penuh > 0 ? f.isiPenuh(isi.penuh, rupiah(isi.harga, b)) : '',
    isi.sendiri > 0 ? f.isiSendiri(isi.sendiri, rupiah(isi.hargaSendiri, b)) : '',
  ].filter(Boolean);
}
