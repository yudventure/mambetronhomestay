import Link from 'next/link';
import Ikon from './Ikon';
import type { Bahasa, Situs } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { dwi, tautanWa } from '@/lib/format';

export default function Kaki({ b, situs }: { b: Bahasa; situs: Situs }) {
  const k = kamus(b);
  const wa = tautanWa(situs.whatsapp, k.pesanWaUmum);
  const ig = situs.instagram.replace(/^@/, '').trim();
  const tahun = new Date().getFullYear();
  return (
    <footer className="bg-laut text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-14 pb-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merek/logo-horizontal-putih.svg" alt={situs.nama} width={213} height={44} className="h-11 w-auto" />
          <p className="mt-4 max-w-sm text-white/80">{dwi(situs.kakiTeks, b)}</p>
          <p className="mt-3 text-sm text-pasir">{dwi(situs.lokasi, b)}</p>
        </div>
        <div>
          <h2 className="text-lg text-white">{k.kaki.hubungi}</h2>
          <ul className="mt-3 grid gap-2 text-white/85">
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-pasir">
                  <Ikon nama="chat" /> WhatsApp
                </a>
              </li>
            )}
            {situs.email && (
              <li>
                <a href={`mailto:${situs.email}`} className="inline-flex items-center gap-2 break-all hover:text-pasir">
                  <Ikon nama="surel" /> {situs.email}
                </a>
              </li>
            )}
            {ig && (
              <li>
                <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-pasir">
                  <Ikon nama="kamera" /> @{ig}
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="text-lg text-white">{k.kaki.pesanLangsung}</h2>
          <ul className="mt-3 grid gap-2 text-white/85">
            <li><Link href="/kamar" className="hover:text-pasir">{k.semuaPondok}</Link></li>
            <li><Link href="/pesan" className="hover:text-pasir">{k.pesanSekarang}</Link></li>
            <li><Link href="/cek-pesanan" className="hover:text-pasir">{k.nav.cek}</Link></li>
            <li><Link href="/ketentuan" className="hover:text-pasir">{k.kaki.ketentuan}</Link></li>
          </ul>
        </div>
      </div>
      <div className="bg-laut-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-white/65 sm:px-6">
          <p>© {tahun} {situs.nama}</p>
          <a href={`/bahasa?ke=${b === 'id' ? 'en' : 'id'}`} className="inline-flex items-center gap-2 hover:text-white">
            <Ikon nama="globe" className="size-4" /> {k.gantiBahasa}
          </a>
        </div>
      </div>
    </footer>
  );
}
