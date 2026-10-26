import Link from 'next/link';
import Ikon from './Ikon';
import LatarPahlawan from './LatarPahlawan';
import type { Bahasa, Foto, Situs } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { dwi, tautanWa } from '@/lib/format';

// What visitors see while developer mode is on. Same framed photo as the
// home page hero, with the closed page title and text from the admin panel.
export default function HalamanTutup({ b, situs, foto }: { b: Bahasa; situs: Situs; foto?: Foto }) {
  const k = kamus(b);
  const wa = tautanWa(situs.whatsapp, k.pesanWaUmum);
  const ig = situs.instagram.replace(/^@/, '').trim();
  const baris = dwi(situs.tutupJudul, b).split('\n').map((x) => x.trim()).filter(Boolean);
  const lain = b === 'id' ? 'en' : 'id';
  return (
    <main id="isi" className="situs flex min-h-svh flex-col p-3 sm:p-4">
      <div className="bingkai relative isolate flex flex-1 flex-col overflow-hidden bg-laut-3">
        <LatarPahlawan foto={foto} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/0 to-black/45" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/35 lg:bg-transparent lg:bg-gradient-to-r lg:from-black/75 lg:via-black/40 lg:via-45% lg:to-transparent lg:to-80%" />

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex items-center justify-between gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/merek/logo-horizontal-putih.svg" alt={situs.nama} width={198} height={44} className="h-9 w-auto sm:h-11" />
            <a href={`/bahasa?ke=${lain}`} hrefLang={lain} className="rounded-full px-3 py-2 text-sm font-bold text-sorot hover:bg-white/15">
              {k.gantiBahasa}
            </a>
          </div>

          <div className="my-auto py-16">
            {dwi(situs.lokasi, b) && <p className="label-kecil !text-sorot">{dwi(situs.lokasi, b)}</p>}
            <h1 className="mt-4 text-[clamp(3.4rem,2.2rem+5.6vw,6.75rem)] leading-[0.94] !text-white">
              {baris.map((x, i) => (
                <span key={i} className={`block ${baris.length > 1 && i === baris.length - 1 ? 'text-sorot' : ''}`}>{x}</span>
              ))}
            </h1>
            {dwi(situs.tutupTeks, b) && (
              <p className="mt-6 max-w-lg text-lg text-white/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.5)]">{dwi(situs.tutupTeks, b)}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {wa && <a href={wa} target="_blank" rel="noopener" className="tombol"><Ikon nama="chat" className="size-4" /> {k.tanyaWa}</a>}
              {ig && (
                <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener" className="tombol tombol-garis-putih">
                  <Ikon nama="kamera" className="size-4" /> @{ig}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-white/80">
            <Link href="/cek-pesanan" className="inline-flex items-center gap-1.5 font-semibold hover:text-white">
              {k.sudahPesan} <Ikon nama="panah" className="size-4" />
            </Link>
            {situs.email && <a href={`mailto:${situs.email}`} className="hover:text-white">{situs.email}</a>}
          </div>
        </div>
      </div>
    </main>
  );
}
