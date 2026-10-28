'use client';
// Language and currency pickers in the header. A small button with the
// current choice opens a panel. Each option is a plain link to /bahasa or
// /uang, which sets a cookie and returns to this page.
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Ikon from './Ikon';
import { useTutupLuar } from '@/lib/kait';

export type OpsiKepala = { kode: string; nama: string; href: string; lang?: string };

export default function PilihanKepala({ id, label, ikon, ikonHp = true, aktif, opsi, catatan }: {
  id: string; label: string; ikon: string; ikonHp?: boolean; aktif: string; opsi: OpsiKepala[]; catatan?: string;
}) {
  const [buka, setBuka] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const tombol = useRef<HTMLButtonElement>(null);
  const tutup = useCallback(() => setBuka(false), []);
  const dalam = useRef([panel, tombol]).current;
  const jalur = usePathname();

  useTutupLuar(buka, tutup, dalam);
  useEffect(() => setBuka(false), [jalur]);

  // on phones the panel hangs from the whole header bar, not from the
  // button, so it stays on screen whichever of the two buttons opened it
  return (
    <div className="relative max-sm:static">
      <button ref={tombol} type="button" onClick={() => setBuka((x) => !x)} aria-expanded={buka} aria-controls={id} aria-label={label}
        className="inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-[0.75rem] font-bold tracking-[0.08em] text-laut transition-colors hover:bg-buih sm:px-3">
        <Ikon nama={ikon} className={`size-[1.125rem] ${ikonHp ? '' : 'hidden sm:block'}`} />
        <span>{aktif.toUpperCase()}</span>
        <Ikon nama="bawah" className={`hidden size-3.5 transition-transform sm:block ${buka ? 'rotate-180' : ''}`} tebal={2.2} />
      </button>
      <div ref={panel} id={id} hidden={!buka} role="dialog" aria-label={label}
        className="absolute top-full right-0 z-50 mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-3xl bg-white p-3 text-[0.9375rem] text-laut shadow-angkat ring-1 ring-laut/5">
        <p className="label-kecil px-3 pt-1">{label}</p>
        <ul className="mt-2 grid gap-1">
          {opsi.map((x) => (
            <li key={x.kode}>
              <a href={x.href} hrefLang={x.lang} lang={x.lang} aria-current={x.kode === aktif ? 'true' : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${x.kode === aktif ? 'bg-buih font-semibold' : 'text-laut/80 hover:bg-embun hover:text-laut'}`}>
                <span className="w-9 text-xs font-bold tracking-wider text-biru-tua uppercase">{x.kode}</span>
                <span className="flex-1">{x.nama}</span>
                {x.kode === aktif && <Ikon nama="centang" className="size-4 text-biru-tua" tebal={2.4} />}
              </a>
            </li>
          ))}
        </ul>
        {catatan && <p className="px-3 pt-2 pb-1 text-xs leading-snug text-abu">{catatan}</p>}
      </div>
    </div>
  );
}
