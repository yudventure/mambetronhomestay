import Link from 'next/link';
import Ikon from './Ikon';
import LatarPahlawan from './LatarPahlawan';
import type { Bahasa, Foto, Situs } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { dwi } from '@/lib/format';

// Hero in a rounded frame. The header floats over its top, the room cards
// overlap its bottom edge. Without an uploaded photo it shows the dusk
// illustration, drawn in a tall version for phones.
export default function Pahlawan({ b, s, foto }: { b: Bahasa; s: Situs; foto?: Foto }) {
  const k = kamus(b);
  const baris = dwi(s.heroJudul, b).split('\n').map((x) => x.trim()).filter(Boolean);
  const kata = s.heroKata.filter((x) => dwi(x.teks, b));
  const video = /^https:\/\/\S+$/.test(s.heroVideo.trim()) ? s.heroVideo.trim() : '';
  return (
    <section className="px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="bingkai relative isolate overflow-hidden bg-laut-3">
        <LatarPahlawan foto={foto} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-laut-3/60 via-laut-3/5 to-laut-3/70" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-laut-3/55 via-laut-3/10 to-transparent" />

        <div className="mx-auto flex min-h-[38rem] max-w-6xl flex-col px-5 pt-28 pb-24 sm:min-h-[44rem] sm:px-8 sm:pt-36 sm:pb-36 lg:min-h-[47rem]">
          {dwi(s.heroLabel, b) && <p className="label-kecil !text-pasir">{dwi(s.heroLabel, b)}</p>}
          <h1 className="mt-4 text-[clamp(3.4rem,2.2rem+5.6vw,6.75rem)] leading-[0.94] !text-white">
            {baris.map((x, i) => (
              <span key={i} className={`block ${baris.length > 1 && i === baris.length - 1 ? 'text-pasir' : ''}`}>{x}</span>
            ))}
          </h1>
          {dwi(s.heroTeks, b) && <p className="mt-6 max-w-md text-lg text-white/90 [text-shadow:0_1px_12px_rgb(8_42_53/0.6)]">{dwi(s.heroTeks, b)}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/kamar" className="tombol">{k.lihatPondok} <Ikon nama="panah" className="size-4" /></Link>
            {video && (
              <a href={video} target="_blank" rel="noopener" className="inline-flex items-center gap-3 font-semibold text-white lg:hidden">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/60"><Ikon nama="putar" className="size-4" /></span>
                {k.tontonVideo}
              </a>
            )}
          </div>
          {kata.length > 0 && (
            <ul className="mt-auto flex flex-wrap gap-x-7 gap-y-3 pt-12 text-[0.9375rem] font-medium text-white [text-shadow:0_1px_10px_rgb(8_42_53/0.7)] lg:justify-end">
              {kata.map((x, i) => (
                <li key={i} className="inline-flex items-center gap-2.5">
                  <span className="inline-flex size-8 items-center justify-center rounded-full ring-1 ring-white/55"><Ikon nama={x.ikon} className="size-4" /></span>
                  {dwi(x.teks, b)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {video && (
          <a href={video} target="_blank" rel="noopener"
            className="absolute top-[36%] right-[9%] hidden size-36 flex-col items-center justify-center gap-2 rounded-full text-center text-xs font-semibold text-white ring-1 ring-white/70 transition-colors hover:bg-white/10 lg:flex">
            <Ikon nama="putar" className="size-7" />
            <span className="max-w-[6rem] leading-tight">{k.tontonVideo}</span>
          </a>
        )}
      </div>
    </section>
  );
}
