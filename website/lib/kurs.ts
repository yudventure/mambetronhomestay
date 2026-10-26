// Exchange rates for the display currencies, as rupiah per one unit. Taken
// from the European Central Bank reference rates through Frankfurter (no key
// needed) and kept for 12 hours. When automatic rates are switched off in
// the admin panel, or the fetch fails, the rates typed in Isi situs are used.
import { ambilSitus } from './data';
import type { UangAsing } from './uang';

const ALAMAT = process.env.KURS_URL || 'https://api.frankfurter.app/latest?from=IDR&to=USD,EUR,JPY,CNY';
const UMUR = 12 * 3600e3;
const JEDA_GAGAL = 30 * 60e3;
const ASING: UangAsing[] = ['USD', 'EUR', 'JPY', 'CNY'];

export type Kurs = { idrPer: Record<UangAsing, number>; sumber: 'otomatis' | 'manual'; tanggal: string };

// Rates from a Frankfurter style reply: { amount, base, date, rates }.
// Works for any base currency as long as rupiah is among the rates.
export function bacaKurs(j: unknown): { idrPer: Record<UangAsing, number>; tanggal: string } | null {
  const d = j as { amount?: number; base?: string; date?: string; rates?: Record<string, number> } | null;
  if (!d?.rates || !d.base) return null;
  const nilai: Record<string, number> = { ...d.rates, [d.base.toUpperCase()]: Number(d.amount) || 1 };
  if (!(nilai.IDR > 0)) return null;
  const idrPer = {} as Record<UangAsing, number>;
  for (const c of ASING) {
    if (!(nilai[c] > 0)) return null;
    idrPer[c] = nilai.IDR / nilai[c];
  }
  return { idrPer, tanggal: String(d.date ?? '') };
}

let tersimpan: { idrPer: Record<UangAsing, number>; tanggal: string; diambil: number } | null = null;
let gagalTerakhir = 0;
let berjalan: Promise<void> | null = null;

async function perbarui() {
  try {
    const r = await fetch(ALAMAT, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const hasil = bacaKurs(await r.json());
    if (!hasil) throw new Error('isi kurs tidak dikenal');
    tersimpan = { ...hasil, diambil: Date.now() };
  } catch (e) {
    gagalTerakhir = Date.now();
    console.error('[mambetron] gagal mengambil kurs', e);
  }
}

export async function ambilKurs(): Promise<Kurs> {
  const s = await ambilSitus();
  const manual: Kurs = { idrPer: { USD: s.kursUSD, EUR: s.kursEUR, JPY: s.kursJPY, CNY: s.kursCNY }, sumber: 'manual', tanggal: '' };
  if (!s.kursOtomatis) return manual;
  const basi = !tersimpan || Date.now() - tersimpan.diambil > UMUR;
  if (basi && Date.now() - gagalTerakhir > JEDA_GAGAL) {
    berjalan ??= perbarui().finally(() => { berjalan = null; });
    // the first visitor waits for the rates, later ones get the stored
    // rates while they refresh in the background
    if (!tersimpan) await berjalan;
  }
  return tersimpan ? { idrPer: tersimpan.idrPer, sumber: 'otomatis', tanggal: tersimpan.tanggal } : manual;
}
