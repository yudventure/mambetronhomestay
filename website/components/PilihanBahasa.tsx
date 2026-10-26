'use client';
// Language picker in the header. A globe button with the current language
// opens a small panel. Each option is a plain link to /bahasa, which sets a
// cookie and returns to this page.
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Ikon from './Ikon';
import type { Bahasa } from '@/lib/jenis';
import { useTutupLuar } from '@/lib/kait';

const BAHASA: { kode: Bahasa; nama: string }[] = [
  { kode: 'id', nama: 'Bahasa Indonesia' },
  { kode: 'en', nama: 'English' },
];

export default function PilihanBahasa({ b, label }: { b: Bahasa; label: string }) {
  const [buka, setBuka] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const tombol = useRef<HTMLButtonElement>(null);
  const tutup = useCallback(() => setBuka(false), []);
  const dalam = useRef([panel, tombol]).current;
  const jalur = usePathname();

  useTutupLuar(buka, tutup, dalam);
  useEffect(() => setBuka(false), [jalur]);

  return (
    <div className="relative">
      <button ref={tombol} type="button" onClick={() => setBuka((x) => !x)} aria-expanded={buka} aria-controls="pilihan-bahasa" aria-label={label}
        className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[0.75rem] font-bold tracking-[0.08em] text-laut transition-colors hover:bg-buih">
        <Ikon nama="globe" className="size-[1.125rem]" />
        <span>{b.toUpperCase()}</span>
        <Ikon nama="bawah" className={`size-3.5 transition-transform ${buka ? 'rotate-180' : ''}`} tebal={2.2} />
      </button>
      <div ref={panel} id="pilihan-bahasa" hidden={!buka} role="dialog" aria-label={label}
        className="absolute top-full right-0 z-50 mt-3 w-64 rounded-3xl bg-white p-3 text-[0.9375rem] text-laut shadow-angkat ring-1 ring-laut/5">
        <p className="label-kecil px-3 pt-1">{label}</p>
        <ul className="mt-2 grid gap-1">
          {BAHASA.map((x) => (
            <li key={x.kode}>
              <a href={`/bahasa?ke=${x.kode}`} hrefLang={x.kode} lang={x.kode} aria-current={x.kode === b ? 'true' : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${x.kode === b ? 'bg-buih font-semibold' : 'text-laut/80 hover:bg-embun hover:text-laut'}`}>
                <span className="w-7 text-xs font-bold tracking-wider text-biru-tua uppercase">{x.kode}</span>
                <span className="flex-1 whitespace-nowrap">{x.nama}</span>
                {x.kode === b && <Ikon nama="centang" className="size-4 text-biru-tua" tebal={2.4} />}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
