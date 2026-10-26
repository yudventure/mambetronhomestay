// Currency chosen by the visitor, kept in a cookie by app/uang/route.ts.
import { cache } from 'react';
import { cookies } from 'next/headers';
import { ambilKurs } from './kurs';
import { KUKI_UANG, sahUang, type KonteksUang } from './uang';

export const konteksUang = cache(async (): Promise<KonteksUang> => {
  const k = (await cookies()).get(KUKI_UANG)?.value;
  if (!sahUang(k) || k === 'IDR') return { uang: 'IDR', idrPer: 1 };
  return { uang: k, idrPer: (await ambilKurs()).idrPer[k] };
});
