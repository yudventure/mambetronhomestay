'use client';
// Language and currency picker in the header. A globe button with the
// current choice opens a small panel. Every option is a plain link to the
// switch routes, which set a cookie and return to this page.
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Ikon from './Ikon';
import type { Bahasa } from '@/lib/jenis';
import { MATA_UANG, NAMA_UANG, type Uang } from '@/lib/uang';
import { useTutupLuar } from '@/lib/kait';

const BAHASA: { kode: Bahasa; nama: string }[] = [
  { kode: 'id', nama: 'Bahasa Indonesia' },
  { kode: 'en', nama: 'English' },
];

export default function PilihanTampil({ b, uang, label }: {
  b: Bahasa; uang: Uang; label: { tombol: string; bahasa: string; uang: string; catatan: string };
}) {
  const [buka, setBuka] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const tombol = useRef<HTMLButtonElement>(null);
  const tutup = useCallback(() => setBuka(false), []);
  const dalam = useRef([panel, tombol]).current;
  const jalur = usePathname();

  useTutupLuar(buka, tutup, dalam);
  useEffect(() => setBuka(false), [jalur]);

  const pilihan = (aktif: boolean) =>
    `flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${aktif ? 'bg-buih font-semibold text-laut' : 'text-laut/80 hover:bg-embun hover:text-laut'}`;

  return (
    <div className="relative">
      <button ref={tombol} type="button" onClick={() => setBuka((x) => !x)} aria-expanded={buka} aria-controls="pilihan-tampil" aria-label={label.tombol}
        className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[0.75rem] font-bold tracking-[0.08em] text-laut transition-colors hover:bg-buih group-data-[bening]/kepala:text-white group-data-[bening]/kepala:hover:bg-white/15">
        <Ikon nama="globe" className="size-[1.125rem]" />
        <span>{b.toUpperCase()}</span>
        <span aria-hidden className="opacity-50">/</span>
        <span>{uang}</span>
        <Ikon nama="bawah" className={`size-3.5 transition-transform ${buka ? 'rotate-180' : ''}`} tebal={2.2} />
      </button>
      <div ref={panel} id="pilihan-tampil" hidden={!buka} role="dialog" aria-label={label.tombol}
        className="z-50 rounded-3xl bg-white p-4 text-[0.9375rem] text-laut shadow-angkat ring-1 ring-laut/5 max-sm:fixed max-sm:inset-x-3 max-sm:top-[4.75rem] sm:absolute sm:top-full sm:right-0 sm:mt-3 sm:w-80">
        <p className="label-kecil px-3">{label.bahasa}</p>
        <ul className="mt-2 grid gap-1">
          {BAHASA.map((x) => (
            <li key={x.kode}>
              <a href={`/bahasa?ke=${x.kode}`} hrefLang={x.kode} lang={x.kode} aria-current={x.kode === b ? 'true' : undefined} className={pilihan(x.kode === b)}>
                <span className="w-9 text-xs font-bold tracking-wider text-biru-tua uppercase">{x.kode}</span>
                <span className="flex-1">{x.nama}</span>
                {x.kode === b && <Ikon nama="centang" className="size-4 text-biru-tua" tebal={2.4} />}
              </a>
            </li>
          ))}
        </ul>
        <p className="label-kecil mt-4 px-3">{label.uang}</p>
        <ul className="mt-2 grid gap-1">
          {MATA_UANG.map((c) => (
            <li key={c}>
              <a href={`/uang?ke=${c}`} aria-current={c === uang ? 'true' : undefined} className={pilihan(c === uang)}>
                <span className="w-9 text-xs font-bold tracking-wider text-biru-tua">{c}</span>
                <span className="flex-1">{NAMA_UANG[c][b]}</span>
                <span className="text-abu">{NAMA_UANG[c].simbol}</span>
                {c === uang && <Ikon nama="centang" className="size-4 text-biru-tua" tebal={2.4} />}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 px-3 text-xs leading-relaxed text-abu">{label.catatan}</p>
      </div>
    </div>
  );
}
