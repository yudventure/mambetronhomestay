// Trips and transfers on the home page. Deep sea cards, unlike the light
// highlight cards above them, each with its icon drawn large and faint in
// a corner, the price picked out in the light sea colour and an arrow to the
// booking form, where the trip is ticked. A card alone on the last row of
// three lies flat across the width.
import Link from 'next/link';
import Ikon from './Ikon';
import Perkiraan from './Perkiraan';
import type { Bahasa, Layanan } from '@/lib/jenis';
import { pilih, rupiah } from '@/lib/format';
import { SATUAN } from '@/lib/satuan.mjs';
import type { Kurs } from '@/lib/uang';

const LAUT = ['from-laut to-laut-2', 'from-biru-tua to-laut', 'from-laut-2 to-laut-3'];

export default function KartuKegiatan({ b, l, i, mendatar, kurs, label, className = '' }: {
  b: Bahasa; l: Layanan; i: number; mendatar: boolean; kurs: Kurs; label: string; className?: string;
}) {
  const nama = pilih(b, l.nama, l.nama_en);
  return (
    <Link href="/pesan" aria-label={`${label}, ${nama}`}
      className={`group relative isolate flex flex-col overflow-hidden rounded-[1.75rem] bg-linear-to-br p-6 text-white shadow-lembut transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-angkat sm:p-7 ${LAUT[i % LAUT.length]} ${mendatar ? 'lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-x-8' : ''} ${className}`}>
      <Ikon nama={l.ikon} tebal={1.1}
        className="pointer-events-none absolute -right-8 -bottom-10 -z-10 size-52 text-white/[0.07] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
      <span aria-hidden className="pointer-events-none absolute -top-20 -left-16 -z-10 size-56 rounded-full bg-sorot/10" />

      <span aria-hidden className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-sorot ring-1 ring-white/15">
        <Ikon nama={l.ikon} className="size-7" tebal={1.6} />
      </span>

      <div className={mendatar ? 'mt-5 lg:mt-0' : 'mt-5'}>
        <h3 className="text-2xl leading-tight !text-white">{nama}</h3>
        <p className="mt-2 text-[0.95rem] text-white/75">{pilih(b, l.keterangan, l.keterangan_en)}</p>
      </div>

      <div className={`flex items-end justify-between gap-4 pt-6 ${mendatar ? 'mt-auto lg:mt-0 lg:gap-8 lg:pt-0' : 'mt-auto'}`}>
        <div>
          <p className="font-judul text-3xl leading-none text-sorot tabular-nums">{rupiah(l.harga, b)}</p>
          <p className="mt-1.5 text-sm font-semibold text-white/80">{SATUAN[l.satuan][b]}</p>
          <Perkiraan idr={l.harga} kurs={kurs} b={b} className="mt-0.5 text-white/55" />
        </div>
        <span aria-hidden className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-laut transition-transform duration-300 group-hover:translate-x-1">
          <Ikon nama="panah" className="size-5" />
        </span>
      </div>
    </Link>
  );
}
