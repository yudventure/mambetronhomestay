// Booking and payment through DAMPIER. While the DAMPIER listing link is set
// in the panel (Pemesanan dan pembayaran), every book button of this site
// leads to the Mambetron listing on thedampier.com with the chosen dates and
// guests, and the guest books and pays there. This is the partner site
// button DAMPIER provides (lib/tombol-situs-mitra.ts in DAMPIER), which reads
// tiba, pulang and dewasa from the address. DAMPIER's payment account is
// never installed on this site.
import type { Bahasa, Situs } from './jenis';
import { dwi, tautanLuar } from './format';

function alamat(dasar: string) {
  const t = tautanLuar(dasar);
  if (!t) return null;
  try {
    return new URL(t);
  } catch {
    return null;
  }
}

// The listing in the visitor's language, with dates and guests when known.
export function tautanDampier(dasar: string, b: Bahasa, o: { masuk?: string; keluar?: string; tamu?: number } = {}) {
  const u = alamat(dasar);
  if (!u) return '';
  u.pathname = u.pathname.replace(/^\/(id|en|zh|ru)(?=\/|$)/, `/${b}`);
  for (const k of ['tiba', 'pulang', 'dewasa']) u.searchParams.delete(k);
  if (o.masuk) {
    u.searchParams.set('tiba', o.masuk);
    if (o.keluar) u.searchParams.set('pulang', o.keluar);
  }
  if (o.tamu) u.searchParams.set('dewasa', String(o.tamu));
  return u.toString();
}

// DAMPIER's home page in the visitor's language, for the word DAMPIER.
export function berandaDampier(dasar: string, b: Bahasa) {
  const u = alamat(dasar);
  return u ? `${u.origin}/${b}` : '';
}

// Button words and the managed by sentence, or null while bookings stay on this site.
export function tombolDampier(s: Situs, b: Bahasa) {
  const beranda = berandaDampier(s.dampierTautan, b);
  return beranda ? { tombol: dwi(s.dampierTombol, b), teks: dwi(s.dampierTeks, b), beranda } : null;
}
