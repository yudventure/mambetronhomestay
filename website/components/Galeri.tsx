'use client';
// Room photos. One large picture with thumbnails underneath, no overlay.
import { useState } from 'react';
import type { Foto } from '@/lib/jenis';

export default function Galeri({ foto, cadangan, nama }: { foto: Foto[]; cadangan: string; nama: string }) {
  const [aktif, setAktif] = useState(0);
  const utama = foto[aktif];
  return (
    <div>
      <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-buih shadow-lembut">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={utama?.url ?? cadangan} alt={utama?.keterangan || nama} width={utama?.lebar || 1200} height={utama?.tinggi || 800} className="size-full object-cover" />
      </div>
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
    </div>
  );
}
