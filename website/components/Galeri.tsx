'use client';
// Room photos. One large picture with thumbnails underneath, no overlay. The
// large picture opens the full screen viewer.
import { useState } from 'react';
import Ikon from './Ikon';
import PerbesarFoto from './PerbesarFoto';
import type { Bahasa, Foto } from '@/lib/jenis';
import { KAMUS } from '@/lib/kamus';

export default function Galeri({ b, foto, cadangan, nama }: { b: Bahasa; foto: Foto[]; cadangan: string; nama: string }) {
  const [aktif, setAktif] = useState(0);
  const [besar, setBesar] = useState(false);
  const utama = foto[aktif];
  return (
    <div>
      {utama ? (
        <button type="button" onClick={() => setBesar(true)} aria-label={`${KAMUS[b].foto.perbesar}, ${utama.keterangan || nama}`}
          className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-3xl bg-buih shadow-lembut">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={utama.url} alt={utama.keterangan || nama} width={utama.lebar || 1200} height={utama.tinggi || 800} className="size-full object-cover" />
          <span aria-hidden className="absolute right-3 bottom-3 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-laut shadow-tipis transition-transform group-hover:scale-110">
            <Ikon nama="besarkan" className="size-4" />
          </span>
        </button>
      ) : (
        <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-buih shadow-lembut">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cadangan} alt={nama} width={1200} height={800} className="size-full object-cover" />
        </div>
      )}
      {utama?.keterangan && <p className="mt-2 text-sm text-abu">{utama.keterangan}</p>}
      {foto.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {foto.map((f, i) => (
            <button key={f.id} type="button" onClick={() => setAktif(i)} aria-label={f.keterangan || `${nama} ${i + 1}`} aria-pressed={i === aktif}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl transition-opacity sm:h-20 sm:w-28 ${i === aktif ? 'ring-3 ring-biru' : 'opacity-70 hover:opacity-100'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {besar && <PerbesarFoto b={b} foto={foto} awal={aktif} tutup={() => setBesar(false)} />}
    </div>
  );
}
