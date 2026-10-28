// Exchange rate for the price estimates, read once per request. Only the
// currency the visitor picked in the header keeps its rate, the others are
// zero, so every estimate line on the page shows that one currency.
import { cookies } from 'next/headers';
import { cache } from 'react';
import { ambilSitus } from './data';
import { ambilKurs } from './kurs';
import { MATA_UANG, sahUang, type Kurs, type PilihanUang } from './uang';

export const KUKI_UANG = 'uang';

// The cookie set by the header picker, otherwise the default from Isi situs.
export const uangAktif = cache(async (): Promise<PilihanUang> => {
  const k = (await cookies()).get(KUKI_UANG)?.value;
  if (sahUang(k)) return k;
  const s = await ambilSitus();
  return sahUang(s.uangBawaan) ? s.uangBawaan : 'USD';
});

export const kursAktif = cache(async (): Promise<Kurs> => {
  const [semua, pilih] = await Promise.all([ambilKurs(), uangAktif()]);
  return Object.fromEntries(MATA_UANG.map((c) => [c, c === pilih ? semua.idrPer[c] : 0])) as Kurs;
});
