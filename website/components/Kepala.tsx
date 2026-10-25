import Link from 'next/link';
import MenuSeluler from './MenuSeluler';
import type { Bahasa, Situs } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { tautanWa } from '@/lib/format';

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
    <header className="sticky top-0 z-40 bg-white shadow-tipis">
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-laut focus:px-4 focus:py-2 focus:text-white">
        {k.lewati}
      </a>
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="mr-auto shrink-0" aria-label={situs.nama}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merek/logo-horizontal.svg" alt={situs.nama} width={213} height={44} className="h-9 w-auto sm:h-11" />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {tautan.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-full px-3 py-2 text-[0.9375rem] font-semibold text-laut hover:bg-buih">
              {t.label}
            </Link>
          ))}
        </nav>
        <a href={`/bahasa?ke=${lain}`} hrefLang={lain} className="hidden rounded-full px-3 py-2 text-sm font-bold text-toska-tua hover:bg-buih lg:inline-flex" title={k.gantiBahasa}>
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
    </header>
  );
}
