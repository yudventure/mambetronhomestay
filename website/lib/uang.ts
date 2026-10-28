// Prices are set, shown and paid in rupiah. Beneath a rupiah price the site
// shows what it comes to in the one currency the visitor picked in the
// header, from the exchange rates in lib/kurs.ts. Safe to use in client
// components.
import type { Bahasa } from './jenis';

export const MATA_UANG = ['USD', 'EUR', 'JPY', 'CNY'] as const;
export type UangAsing = (typeof MATA_UANG)[number];

// Rupiah per one unit of each currency.
export type Kurs = Record<UangAsing, number>;

// What the header picker offers. Rupiah means no estimate line at all.
export const PILIHAN_UANG = ['IDR', ...MATA_UANG] as const;
export type PilihanUang = (typeof PILIHAN_UANG)[number];
export const sahUang = (v: unknown): v is PilihanUang => PILIHAN_UANG.includes(v as PilihanUang);

export const NAMA_UANG: Record<PilihanUang, { id: string; en: string }> = {
  IDR: { id: 'Rupiah Indonesia', en: 'Indonesian rupiah' },
  USD: { id: 'Dolar Amerika', en: 'US dollar' },
  EUR: { id: 'Euro', en: 'Euro' },
  JPY: { id: 'Yen Jepang', en: 'Japanese yen' },
  CNY: { id: 'Yuan Tiongkok', en: 'Chinese yuan' },
};

// A rupiah amount in each currency with a rate, rounded to whole units.
// The rates handed to pages carry only the visitor's currency, so this is
// one amount such as "US$33", or nothing when rupiah was picked.
export function perkiraan(idr: number, kurs: Kurs, b: Bahasa) {
  const lokal = b === 'en' ? 'en-US' : 'id-ID';
  return MATA_UANG.filter((c) => kurs[c] > 0)
    .map((c) => new Intl.NumberFormat(lokal, { style: 'currency', currency: c, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(idr / kurs[c]))
    .join(' · ');
}
