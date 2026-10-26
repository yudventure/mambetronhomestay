// Prices are set, shown and paid in rupiah. Beneath a rupiah price the site
// shows what it comes to in a few other currencies, from the exchange
// rates in lib/kurs.ts. Safe to use in client components.
import type { Bahasa } from './jenis';

export const MATA_UANG = ['USD', 'EUR', 'JPY', 'CNY'] as const;
export type UangAsing = (typeof MATA_UANG)[number];

// Rupiah per one unit of each currency.
export type Kurs = Record<UangAsing, number>;

export const NAMA_UANG: Record<UangAsing, { id: string; en: string }> = {
  USD: { id: 'Dolar Amerika', en: 'US dollar' },
  EUR: { id: 'Euro', en: 'Euro' },
  JPY: { id: 'Yen Jepang', en: 'Japanese yen' },
  CNY: { id: 'Yuan Tiongkok', en: 'Chinese yuan' },
};

// A rupiah amount in each currency, rounded to whole units, for example
// "US$33 · €29 · JP¥5.005 · CN¥237".
export function perkiraan(idr: number, kurs: Kurs, b: Bahasa) {
  const lokal = b === 'en' ? 'en-US' : 'id-ID';
  return MATA_UANG.filter((c) => kurs[c] > 0)
    .map((c) => new Intl.NumberFormat(lokal, { style: 'currency', currency: c, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(idr / kurs[c]))
    .join(' · ');
}
