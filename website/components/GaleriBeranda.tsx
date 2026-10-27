'use client';
// Photo gallery on the home page, every photo opens the full screen viewer.
import { useState } from 'react';
import PerbesarFoto from './PerbesarFoto';
import type { Bahasa, Foto } from '@/lib/jenis';
import { KAMUS } from '@/lib/kamus';

export default function GaleriBeranda({ b, foto }: { b: Bahasa; foto: Foto[] }) {
  const [buka, setBuka] = useState(-1);
  return (
    <>
      <div className="columns-2 gap-4 md:columns-3">
        {foto.map((f, i) => (
          <figure key={f.id} className="mb-4 break-inside-avoid">
            <button type="button" onClick={() => setBuka(i)} aria-label={`${KAMUS[b].foto.perbesar}${f.keterangan ? `, ${f.keterangan}` : ''}`}
              className="block w-full cursor-zoom-in overflow-hidden rounded-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.keterangan} width={f.lebar} height={f.tinggi} loading="lazy" className="w-full transition-transform duration-500 hover:scale-[1.03]" />
            </button>
            {f.keterangan && <figcaption className="mt-1.5 text-sm text-abu">{f.keterangan}</figcaption>}
          </figure>
        ))}
      </div>
      {buka >= 0 && <PerbesarFoto b={b} foto={foto} awal={buka} tutup={() => setBuka(-1)} />}
    </>
  );
}
