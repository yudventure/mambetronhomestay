import Link from 'next/link';
import BingkaiKepala from './BingkaiKepala';
import MenuSeluler from './MenuSeluler';
import type { Bahasa, Situs } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { tautanWa } from '@/lib/format';

// The group-data-[bening]/kepala variants switch colours while the header
// floats clear over the hero photo. Tailwind only sees whole class names, so
// they are written out in full.
export default function Kepala({ b, situs }: { b: Bahasa; situs: Situs }) {
  const k = kamus(b);
  const tautan = [
    { href: '/kamar', label: k.nav.kamar },
    { href: '/#kegiatan', label: k.nav.layanan },
    { href: '/#tentang', label: k.nav.tentang },
    { href: '/#lokasi', label: k.nav.lokasi },
    { href: '/#tanya', label: k.nav.faq },
    { href: '/cek-pesanan', label: k.nav.cek },
  ];
  const lain = b === 'id' ? 'en' : 'id';
  return (
    <BingkaiKepala>
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-laut focus:px-4 focus:py-2 focus:text-white">
        {k.lewati}
      </a>
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="mr-auto shrink-0" aria-label={situs.nama}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merek/logo-horizontal.svg" alt={situs.nama} width={198} height={44} className="h-9 w-auto sm:h-11 group-data-[bening]/kepala:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merek/logo-horizontal-putih.svg" alt={situs.nama} width={198} height={44} className="hidden h-9 w-auto sm:h-11 group-data-[bening]/kepala:block" />
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex">
          {tautan.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-full px-3 py-2 text-[0.9375rem] font-medium text-laut hover:bg-buih group-data-[bening]/kepala:text-white group-data-[bening]/kepala:hover:bg-white/15">
              {t.label}
            </Link>
          ))}
        </nav>
        <a href={`/bahasa?ke=${lain}`} hrefLang={lain} title={k.gantiBahasa}
          className="hidden rounded-full px-3 py-2 text-sm font-bold text-biru-tua hover:bg-buih lg:inline-flex group-data-[bening]/kepala:text-pasir group-data-[bening]/kepala:hover:bg-white/15">
          {k.kodeBahasaLain}
        </a>
        <Link href="/pesan" className="tombol tombol-kecil whitespace-nowrap max-[339px]:hidden">
          <span className="sm:hidden">{k.pesanPendek}</span><span className="hidden sm:inline">{k.pesanSekarang}</span>
        </Link>
        <MenuSeluler
          tautan={tautan}
          label={k.menu}
          tutupLabel={k.tutup}
          bahasa={{ href: `/bahasa?ke=${lain}`, label: k.gantiBahasa }}
          wa={tautanWa(situs.whatsapp, k.pesanWaUmum)}
          waLabel={k.tanyaWa}
          pesan={{ href: '/pesan', label: k.pesanSekarang }}
        />
      </div>
    </BingkaiKepala>
  );
}
