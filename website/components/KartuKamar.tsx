import Link from 'next/link';
import Ikon from './Ikon';
import type { Bahasa, Kamar } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { pilih, rupiah } from '@/lib/format';
import { gambarCadangan } from '@/lib/data';
import Perkiraan from './Perkiraan';
import type { Kurs } from '@/lib/uang';

// A lone card spans the full row, so from md up it lies on its side with the
// photo beside the text instead of a photo as wide as the page.
export default function KartuKamar({ kamar, b, kurs, i, lebar = false, className = '' }: { kamar: Kamar; b: Bahasa; kurs: Kurs; i: number; lebar?: boolean; className?: string }) {
  const k = kamus(b);
  const foto = kamar.foto[0];
  const nama = pilih(b, kamar.nama, kamar.nama_en);
  return (
    <article className={`kartu group flex flex-col overflow-hidden transition-shadow hover:shadow-angkat ${lebar ? 'md:flex-row' : ''} ${className}`}>
      <Link href={`/kamar/${kamar.slug}`} className={`relative block aspect-[4/3] overflow-hidden bg-buih ${lebar ? 'md:aspect-auto md:min-h-[24rem] md:w-1/2 md:shrink-0' : ''}`} tabIndex={-1} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto?.url ?? gambarCadangan(i)} alt="" loading="lazy" width={foto?.lebar || 1200} height={foto?.tinggi || 800}
          className={`size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${lebar ? 'md:absolute md:inset-0' : ''}`} />
      </Link>
      <div className={`flex flex-1 flex-col p-5 sm:p-6 ${lebar ? 'md:p-10' : ''}`}>
        <h3 className={lebar ? 'text-2xl md:text-4xl' : 'text-2xl'}>
          <Link href={`/kamar/${kamar.slug}`} className="hover:text-biru-tua">{nama}</Link>
        </h3>
        <p className="mt-2 text-abu">{pilih(b, kamar.ringkas, kamar.ringkas_en)}</p>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-laut">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-buih px-3 py-1"><Ikon nama="orang" className="size-4" />{k.muat(kamar.kapasitas)}</li>
          {kamar.min_malam > 1 && <li className="inline-flex items-center gap-1.5 rounded-full bg-buih px-3 py-1"><Ikon nama="bulan" className="size-4" />{k.minMalam(kamar.min_malam)}</li>}
        </ul>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
          <div>
            <p className="text-sm text-abu">{k.mulai}</p>
            <p className="font-judul text-2xl font-semibold text-laut">{rupiah(kamar.harga, b)}</p>
            <p className="text-sm text-abu">{k.perSkema[kamar.skema_harga]}</p>
            <Perkiraan idr={kamar.harga} kurs={kurs} b={b} className="mt-1 text-abu" />
          </div>
          <Link href={`/kamar/${kamar.slug}`} className="tombol tombol-laut tombol-kecil">
            {k.lihatDetail} <Ikon nama="panah" className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
