// Price of a stay. Used by the booking form for the live total and by the
// server when the booking is saved, so both always agree.
import type { Bahasa, BarisLayanan, Kamar, Layanan, Pesanan, Satuan } from './jenis';
import { KAMUS } from './kamus';
import { rupiah } from './format';
import { SATUAN } from './satuan.mjs';

// Extras counted by how many one boat or one group takes (Kegiatan, muat).
export const satuanMuat = (s: Satuan) => s === 'perahu' || s === 'rombongan';

// The unit of an extra as shown, with how many one boat or group takes.
export function satuanLayanan(l: Pick<Layanan, 'satuan' | 'muat'>, b: Bahasa) {
  const s = SATUAN[l.satuan]?.[b] ?? '';
  return satuanMuat(l.satuan) && l.muat > 0 ? `${s}, ${KAMUS[b].muatPerahu(l.muat)}` : s;
}

// `orang` is everyone on a boat seat or in the group, the paying guests
// (children under the free age sit on a lap, as at DAMPIER), and `muat` how
// many one boat or group takes. Boats are priced one way (the owner,
// November 2026), so a boat there and back (`pp`) counts twice.
export function jumlahSatuan(satuan: Satuan, tamu: number, malam: number, orang = tamu, muat = 0, pp = false) {
  const muatan = muat > 0 ? Math.max(1, Math.ceil(Math.max(1, orang) / muat)) : 1;
  switch (satuan) {
    case 'pesanan': return 1;
    case 'orang': return tamu;
    case 'malam': return malam;
    case 'orang_malam': return tamu * malam;
    case 'perahu': return muatan * (pp ? 2 : 1);
    case 'rombongan': return muatan;
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

type HargaPondok = Pick<Kamar, 'harga' | 'skema_harga' | 'harga_sendiri' | 'harga_tambah' | 'kapasitas'>;

// Price of one bungalow per night with `n` paying guests in it. The owner's
// prices, November 2026: one guest Rp850.000, two Rp1.200.000, and with a
// king bed and a single bed a third guest adds Rp600.000 like the others,
// Rp1.800.000 for three. A bungalow with no paying guest in it (a second
// one for a parent with two children under the free age) is priced as one.
export function hargaIsiPondok(k: HargaPondok, n: number) {
  if (n <= 1) return hargaSendiri(k);
  const tambah = k.skema_harga === 'kamar' ? Math.max(0, Math.round(k.harga_tambah) || 0) : 0;
  return k.harga + Math.max(0, n - 2) * tambah;
}

// Paying guests spread evenly over the bungalows booked, grouped by how
// many sit in each, the fullest first, with the price per night of each
// group. Only for bungalows priced per bungalow.
export type BarisIsi = { orang: number; bungalow: number; harga: number };
export type IsiPondok = { baris: BarisIsi[]; perMalam: number };
export function isiPondok(kamar: HargaPondok, jumlahKamar: number, dewasa: number): IsiPondok | null {
  if (kamar.skema_harga !== 'kamar') return null;
  const r = Math.max(1, Math.round(jumlahKamar) || 1), t = Math.max(0, Math.round(dewasa) || 0);
  const q = Math.floor(t / r), lebih = t % r;
  const baris: BarisIsi[] = [];
  const tambah = (orang: number, bungalow: number) => {
    if (bungalow <= 0) return;
    const n = Math.max(1, orang);
    const ada = baris.find((x) => x.orang === n);
    if (ada) ada.bungalow += bungalow;
    else baris.push({ orang: n, bungalow, harga: hargaIsiPondok(kamar, n) });
  };
  tambah(q + 1, lebih);
  tambah(q, r - lebih);
  return { baris, perMalam: baris.reduce((a, x) => a + x.bungalow * x.harga, 0) };
}

// `dewasa` are the paying guests, adults and children from the free age
// (Isi situs, usiaGratis), who pay in full. `anak` are the children under
// it, free and not counted for extras per person or in a bungalow's guests.
// The owner's rule, November 2026: under 5 free, from 5 the full price.
export function hitungHarga(
  kamar: HargaPondok,
  o: { malam: number; jumlahKamar: number; dewasa: number; anak: number; layanan: Layanan[]; dpPersen: number; persenPaket?: number; pulangPergi?: boolean },
) {
  const malam = Math.max(0, o.malam);
  const isi = isiPondok(kamar, o.jumlahKamar, o.dewasa);
  const dasar = isi ? isi.perMalam * malam : kamar.harga * o.dewasa * malam;
  // a rate tier adds its percentage to the bungalow part only, rounded to whole thousands
  const persen = o.persenPaket ?? 0;
  const biayaKamar = persen > 0 ? Math.round((dasar * (100 + persen)) / 100 / 1000) * 1000 : dasar;
  const tamu = o.dewasa;
  // boats go there and back unless the guest picked one way (pulangPergi false)
  const pp = o.pulangPergi !== false;
  const rincian: BarisLayanan[] = o.layanan.map((l) => {
    const perahuPp = l.satuan === 'perahu' && pp;
    const jumlah = jumlahSatuan(l.satuan, tamu, malam, o.dewasa, l.muat, perahuPp);
    return {
      id: l.id, nama: l.nama, nama_en: l.nama_en, harga: l.harga, satuan: l.satuan, jumlah, subtotal: l.harga * jumlah,
      ...(perahuPp ? { pp: true as const, perahu: jumlah / 2 } : {}),
    };
  });
  const biayaLayanan = rincian.reduce((a, r) => a + r.subtotal, 0);
  const total = biayaKamar + biayaLayanan;
  const dp = o.dpPersen > 0 ? Math.min(total, Math.ceil((total * o.dpPersen) / 100 / 1000) * 1000) : 0;
  return { biayaKamar, rincian, biayaLayanan, total, dp, isi };
}

// The solo price and the third guest's price to keep on a booking, 0 when
// the bungalow gives none.
export const hargaSendiriSimpan = (k: Pick<Kamar, 'harga' | 'skema_harga' | 'harga_sendiri' | 'kapasitas'>) => {
  const h = hargaSendiri(k);
  return h < k.harga ? h : 0;
};
export const hargaTambahSimpan = (k: Pick<Kamar, 'skema_harga' | 'harga_tambah'>) => (k.skema_harga === 'kamar' ? Math.max(0, Math.round(k.harga_tambah) || 0) : 0);

// The same split for a saved booking, from the prices it was booked with.
// Bookings from the first release kept a percentage instead (30% less).
export function isiPesanan(p: Pick<Pesanan, 'harga_satuan' | 'skema_harga' | 'harga_sendiri' | 'persen_sendiri' | 'harga_tambah' | 'jumlah_kamar' | 'dewasa'>) {
  const persen = Math.min(90, Math.max(0, p.persen_sendiri || 0));
  const sendiri = p.harga_sendiri || (persen ? Math.round((p.harga_satuan * (100 - persen)) / 100 / 1000) * 1000 : 0);
  return isiPondok({ harga: p.harga_satuan, skema_harga: p.skema_harga, harga_sendiri: sendiri, harga_tambah: p.harga_tambah || 0, kapasitas: 3 }, p.jumlah_kamar, p.dewasa);
}

// One line per group under the bungalow in a price summary, for example
// "1 bungalow untuk 3 orang, Rp 1.800.000 per malam".
export function barisIsi(b: Bahasa, isi: IsiPondok | null) {
  if (!isi) return [];
  const f = KAMUS[b].form;
  return isi.baris.map((x) => f.isiBaris(x.bungalow, x.orang, rupiah(x.harga, b)));
}

// The name of an extra on a booking, with the boat's way when it goes there and back.
export function namaBaris(r: Pick<BarisLayanan, 'nama' | 'nama_en' | 'pp'>, b: Bahasa) {
  const nama = b === 'en' && r.nama_en ? r.nama_en : r.nama;
  return r.pp ? `${nama}, ${KAMUS[b].form.arahPp}` : nama;
}
