import type { Bahasa } from './jenis';
import { ZONA } from './tanggal';

const lokal = (b: Bahasa) => (b === 'en' ? 'en-GB' : 'id-ID');

export function rupiah(n: number, b: Bahasa = 'id') {
  const angka = new Intl.NumberFormat(b === 'en' ? 'en-US' : 'id-ID', { maximumFractionDigits: 0 }).format(Math.round(n));
  return b === 'en' ? `IDR ${angka}` : `Rp ${angka}`;
}

const utc = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00Z`);

export function tanggal(s: string, b: Bahasa = 'id', gaya: 'pendek' | 'panjang' | 'hari' | 'polos' = 'pendek') {
  const o: Intl.DateTimeFormatOptions =
    gaya === 'panjang' ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : gaya === 'hari' ? { weekday: 'short', day: 'numeric', month: 'short' }
        : gaya === 'polos' ? { day: 'numeric', month: 'long', year: 'numeric' }
          : { day: 'numeric', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat(lokal(b), { ...o, timeZone: 'UTC' }).format(utc(s));
}

export function bulanTahun(s: string, b: Bahasa = 'id') {
  return new Intl.DateTimeFormat(lokal(b), { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utc(s));
}

// A UTC timestamp from the database, shown in Raja Ampat time.
export function waktu(s: string, b: Bahasa = 'id') {
  const d = new Date(`${s.replace(' ', 'T')}Z`);
  if (Number.isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat(lokal(b), { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: ZONA }).format(d) + ' WIT';
}

export const nomorWa = (s: string) => s.replace(/[^\d]/g, '').replace(/^0/, '62');

export function tautanWa(nomor: string, pesan = '') {
  const n = nomorWa(nomor);
  if (!n) return '';
  return `https://wa.me/${n}${pesan ? `?text=${encodeURIComponent(pesan)}` : ''}`;
}

export const pilih = <T,>(b: Bahasa, id: T, en: T) => (b === 'en' && en ? en : id);
export const dwi = (v: { id: string; en: string }, b: Bahasa) => (b === 'en' ? v.en || v.id : v.id || v.en);

export const paragraf = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
