// Online payment through Midtrans, the parts without the database or the
// network: reading what a booking stores, how much is still to pay online,
// which Midtrans states count as paid, and the payment method in words.
import type { Bahasa, BayarOnline, CobaBayar, Pesanan } from './jenis';

export function bacaBayarOnline(s: string | null | undefined): BayarOnline | null {
  if (!s) return null;
  try {
    const o = JSON.parse(s) as Partial<BayarOnline>;
    if (!o || typeof o.n !== 'number' || !Array.isArray(o.coba)) return null;
    return { n: o.n, token: typeof o.token === 'string' ? o.token : '', coba: o.coba.filter((c): c is CobaBayar => !!c && typeof c.orderId === 'string') };
  } catch {
    return null;
  }
}

// What is still due before arrival: the part paid in advance, all of it
// while the site asks for full payment, less what has already come in.
export const tagihanOnline = (p: Pick<Pesanan, 'dp' | 'dibayar' | 'status'>) =>
  p.status === 'menunggu' || p.status === 'dikonfirmasi' ? Math.max(0, p.dp - p.dibayar) : 0;

export const cobaTerakhir = (b: BayarOnline | null) => (b && b.coba.length ? b.coba[b.coba.length - 1] : null);

// Midtrans transaction_status and fraud_status that mean the money is in.
export const sudahMasuk = (status: string, fraud = '') => status === 'settlement' || (status === 'capture' && (fraud === '' || fraud === 'accept'));
// States after which this transaction can no longer be paid, so the next
// attempt opens a new one.
export const sudahTutup = (status: string) => ['deny', 'cancel', 'expire', 'failure'].includes(status);

// A Snap token stays valid for 24 hours, a little less is kept for safety.
const UMUR_TOKEN = 23 * 3600_000;
export function tokenMasihBisa(b: BayarOnline | null, jumlah: number, kini = Date.now()) {
  const c = cobaTerakhir(b);
  if (!b?.token || !c || c.jumlah !== jumlah || sudahTutup(c.status) || sudahMasuk(c.status)) return false;
  return kini - Date.parse(c.dibuat) < UMUR_TOKEN;
}

const BANK: Record<string, string> = { bca: 'BCA', bni: 'BNI', bri: 'BRI', permata: 'Permata', mandiri: 'Mandiri', cimb: 'CIMB Niaga', danamon: 'Danamon', bsi: 'BSI', seabank: 'SeaBank' };

// The payment method as the guest or the owner would say it.
export function namaMetode(metode: string, saluran: string | undefined, b: Bahasa) {
  const en = b === 'en';
  const bank = saluran ? BANK[saluran] ?? saluran.toUpperCase() : '';
  switch (metode) {
    case 'credit_card': return en ? 'card' : 'kartu';
    case 'bank_transfer': return bank ? `${bank} virtual account` : 'virtual account';
    case 'echannel': return 'Mandiri Bill';
    case 'permata': return 'Permata virtual account';
    case 'gopay': return 'GoPay';
    case 'shopeepay': return 'ShopeePay';
    case 'qris': return 'QRIS';
    case 'dana': return 'DANA';
    case 'cstore': return en ? 'Indomaret or Alfamart' : 'Indomaret atau Alfamart';
    case 'akulaku': return 'Akulaku';
    case 'kredivo': return 'Kredivo';
    case '': return en ? 'online payment' : 'pembayaran online';
    default: return metode.replace(/_/g, ' ');
  }
}

// Midtrans states for the owner, in the panel.
export const STATUS_MIDTRANS: Record<string, string> = {
  '': 'Halaman bayar dibuka, cara bayar belum dipilih',
  pending: 'Menunggu tamu membayar',
  settlement: 'Lunas',
  capture: 'Kartu sedang ditinjau Midtrans',
  deny: 'Ditolak bank',
  cancel: 'Dibatalkan',
  expire: 'Kedaluwarsa',
  failure: 'Gagal',
  refund: 'Dikembalikan',
  partial_refund: 'Dikembalikan sebagian',
};
