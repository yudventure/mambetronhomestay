// Display currencies. Prices are set and paid in rupiah, the other
// currencies are estimates from the exchange rates in lib/kurs.ts. Safe to
// use in client components.
import type { Bahasa } from './jenis';
import { rupiah } from './format';

export const MATA_UANG = ['IDR', 'USD', 'EUR', 'JPY', 'CNY'] as const;
export type Uang = (typeof MATA_UANG)[number];
export type UangAsing = Exclude<Uang, 'IDR'>;
export const KUKI_UANG = 'uang';

export const NAMA_UANG: Record<Uang, { simbol: string; id: string; en: string }> = {
  IDR: { simbol: 'Rp', id: 'Rupiah', en: 'Indonesian rupiah' },
  USD: { simbol: '$', id: 'Dolar Amerika', en: 'US dollar' },
  EUR: { simbol: '€', id: 'Euro', en: 'Euro' },
  JPY: { simbol: '¥', id: 'Yen Jepang', en: 'Japanese yen' },
  CNY: { simbol: '¥', id: 'Yuan Tiongkok', en: 'Chinese yuan' },
};

export const sahUang = (s: unknown): s is Uang => MATA_UANG.includes(s as Uang);

// The chosen currency and how many rupiah one unit of it is worth.
export type KonteksUang = { uang: Uang; idrPer: number };

export const asing = (u: KonteksUang) => u.uang !== 'IDR' && u.idrPer > 0;

// A rupiah amount in the chosen currency, rounded to whole units.
export function nominal(idr: number, u: KonteksUang, b: Bahasa) {
  if (!asing(u)) return rupiah(idr, b);
  return new Intl.NumberFormat(b === 'en' ? 'en-US' : 'id-ID', {
    style: 'currency', currency: u.uang, minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(idr / u.idrPer);
}
