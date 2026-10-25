// Dates are plain YYYY-MM-DD strings in Raja Ampat time (WIT, UTC+9).
// Arithmetic runs on UTC midnights so daylight saving never shifts a day.

export const ZONA = 'Asia/Jayapura';
const HARI = 86_400_000;

const keMs = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const keTeks = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function hariIni() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export const tambahHari = (s: string, n: number) => keTeks(keMs(s) + n * HARI);
export const selisihHari = (dari: string, sampai: string) => Math.round((keMs(sampai) - keMs(dari)) / HARI);

export function sahTanggal(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return keTeks(keMs(s)) === s;
}

// Every night from check-in up to the night before check-out.
export function daftarMalam(masuk: string, keluar: string) {
  const out: string[] = [];
  for (let d = masuk; d < keluar; d = tambahHari(d, 1)) out.push(d);
  return out;
}

export const hariDalamMinggu = (s: string) => new Date(keMs(s)).getUTCDay();
export const awalBulan = (s: string) => `${s.slice(0, 7)}-01`;
export function tambahBulan(s: string, n: number) {
  const d = new Date(keMs(awalBulan(s)));
  d.setUTCMonth(d.getUTCMonth() + n);
  return keTeks(d.getTime());
}
export const jumlahHariBulan = (s: string) => new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7), 0)).getUTCDate();
