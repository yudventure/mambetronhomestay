'use client';
// Phone menu as a sheet pinned to the bottom of the screen.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Ikon from './Ikon';
import { useKunciGulir, useTutupLuar } from '@/lib/kait';

type Tautan = { href: string; label: string };

export default function MenuSeluler({ tautan, label, tutupLabel, wa, waLabel }: {
  tautan: Tautan[]; label: string; tutupLabel: string; wa: string; waLabel: string;
}) {
  const [buka, setBuka] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const tombol = useRef<HTMLButtonElement>(null);
  const tutup = useCallback(() => setBuka(false), []);
  const jalur = usePathname();
  const dalam = useRef([panel, tombol]).current;

  useKunciGulir(buka);
  useTutupLuar(buka, tutup, dalam);
  useEffect(() => setBuka(false), [jalur]);

  return (
    <>
      <button ref={tombol} type="button" onClick={() => setBuka((b) => !b)} aria-expanded={buka} aria-controls="menu-seluler"
        className="pointer-events-auto inline-flex size-11 items-center justify-center rounded-full bg-buih text-laut lg:hidden">
        <Ikon nama={buka ? 'silang' : 'menu'} className="size-6" />
        <span className="sr-only">{buka ? tutupLabel : label}</span>
      </button>
      {buka && <div aria-hidden className="pointer-events-auto fixed inset-0 z-40 bg-laut/40 lg:hidden" />}
      <div ref={panel} id="menu-seluler" role="dialog" aria-modal="true" aria-label={label} hidden={!buka}
        className="tinggi-lembar pointer-events-auto fixed inset-x-0 bottom-0 z-50 overflow-y-auto rounded-t-3xl bg-white px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-angkat lg:hidden">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-buih-2" aria-hidden />
        <nav className="grid gap-1">
          {tautan.map((t) => (
            <Link key={t.href} href={t.href} onClick={tutup} className="rounded-2xl px-4 py-3 text-lg font-semibold text-laut hover:bg-buih">
              {t.label}
            </Link>
          ))}
        </nav>
        {wa && (
          <a href={wa} target="_blank" rel="noopener" className="tombol tombol-garis mt-4 w-full">
            <Ikon nama="chat" /> {waLabel}
          </a>
        )}
      </div>
    </>
  );
}
