'use client';
// Photo gallery on the home page, between the about text and the date card.
// The owner's request, November 2026: "tambahkan foto galeri diantara
// tanggal dan about", then "tidak perlu diberi judul, galery seksinya gabung
// dengan" the about section, so it has no heading of its own and sits close
// under the about text, named only for screen readers. From md up five
// photos in a grid, one large and the
// rest small, with no empty cell whatever the count, and the fifth opens all
// of them. On phones every photo in a row to swipe sideways. Every photo
// opens the full screen viewer.
import { useState } from 'react';
import PerbesarFoto from './PerbesarFoto';
import type { Bahasa, Foto } from '@/lib/jenis';
import { KAMUS } from '@/lib/kamus';

// grid places from md up for the n photos shown, four columns and two rows
function tempat(n: number, i: number) {
  if (n === 1) return 'md:col-span-4 md:row-span-2';
  if (n === 2) return 'md:col-span-2 md:row-span-2';
  if (i === 0) return 'md:col-span-2 md:row-span-2';
  if (n === 3) return 'md:col-span-2';
  if (n === 4 && i === 1) return 'md:col-span-2';
  return '';
}

export default function GaleriBeranda({ b, foto, judul }: { b: Bahasa; foto: Foto[]; judul: string }) {
  const [buka, setBuka] = useState(-1);
  const k = KAMUS[b];
  const n = Math.min(5, foto.length);
  const lebih = foto.length - n;
  return (
    <div role="group" aria-label={judul || undefined}>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-1 md:grid md:h-[min(30rem,48vw)] md:grid-cols-4 md:grid-rows-2 md:overflow-visible md:pb-0"
        data-galeri-beranda={foto.length} data-muncul-anak>
        {foto.map((f, i) => (
          <button key={f.id} type="button" onClick={() => setBuka(i)} aria-label={`${k.foto.perbesar}${f.keterangan ? `, ${f.keterangan}` : ''}`}
            className={`group relative aspect-[4/3] w-[80%] shrink-0 snap-start overflow-hidden rounded-3xl bg-buih md:aspect-auto md:w-auto ${i >= n ? 'md:hidden' : tempat(n, i)}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt={f.keterangan} width={f.lebar || 1200} height={f.tinggi || 900} loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            {i === n - 1 && lebih > 0 && (
              <span className="absolute inset-0 hidden items-center justify-center bg-[rgba(11,59,74,.55)] font-judul text-xl font-semibold text-white md:flex" data-galeri-lebih>
                {k.galeriSemua(foto.length)}
              </span>
            )}
          </button>
        ))}
      </div>
      {buka >= 0 && <PerbesarFoto b={b} foto={foto} awal={buka} tutup={() => setBuka(-1)} />}
    </div>
  );
}
