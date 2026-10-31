import Link from 'next/link';
import BingkaiKepala from './BingkaiKepala';
import LogoAtas from './LogoAtas';
import MenuSeluler from './MenuSeluler';
import PilihanKepala from './PilihanKepala';
import type { Bahasa, Situs } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { tautanWa } from '@/lib/format';
import { NAMA_UANG, PILIHAN_UANG } from '@/lib/uang';
import { uangAktif } from '@/lib/uang-server';
import { alamatAkomodasi } from '@/lib/data';

// The group-data-[datar]/kepala variants flatten the pill while the page is
// at the very top. Tailwind only sees whole class names, so they are written
// out in full.
export default async function Kepala({ b, situs }: { b: Bahasa; situs: Situs }) {
  const k = kamus(b);
  const [uang, akomodasi] = await Promise.all([uangAktif(), alamatAkomodasi()]);
  const bahasa = [
    { kode: 'id', nama: 'Bahasa Indonesia', href: '/bahasa?ke=id', lang: 'id' },
    { kode: 'en', nama: 'English', href: '/bahasa?ke=en', lang: 'en' },
  ];
  const mataUang = PILIHAN_UANG.map((c) => ({ kode: c, nama: NAMA_UANG[c][b], href: `/uang?ke=${c}` }));
  const tautan = [
    { href: '/#tentang', label: k.nav.tentang },
    { href: akomodasi, label: k.nav.akomodasi },
    { href: '/#kegiatan', label: k.nav.wisata },
  ];
  return (
    <BingkaiKepala>
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-laut focus:px-4 focus:py-2 focus:text-white">
        {k.lewati}
      </a>
      <div className="pointer-events-auto relative mx-auto flex h-16 max-w-6xl items-center gap-2 rounded-full bg-white pr-2 pl-4 shadow-angkat ring-1 ring-laut/5 transition-shadow duration-300 sm:h-[4.25rem] sm:pl-6 group-data-[datar]/kepala:shadow-none group-data-[datar]/kepala:ring-0">
        <LogoAtas label={situs.nama}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merek/logo-horizontal.svg" alt={situs.nama} width={198} height={44} className="h-9 w-auto min-[380px]:h-10 sm:h-12 lg:h-[3.25rem]" />
        </LogoAtas>
        <nav className="mr-2 hidden items-center lg:flex">
          {tautan.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-full px-2 py-2 text-[0.75rem] font-semibold tracking-[0.08em] whitespace-nowrap text-laut/75 uppercase transition-colors hover:text-laut xl:px-3.5 xl:text-[0.8125rem] xl:tracking-[0.12em]">
              {t.label}
            </Link>
          ))}
        </nav>
        {/* language and currency sit side by side as one pair */}
        <div className="flex items-center">
          <PilihanKepala id="pilihan-bahasa" label={k.pilihBahasa} ikon="globe" aktif={b} opsi={bahasa} />
          <PilihanKepala id="pilihan-uang" label={k.pilihUang} ikon="uang" ikonHp={false} aktif={uang} opsi={mataUang} catatan={k.uangCatatan} />
        </div>
        <MenuSeluler
          tautan={tautan}
          label={k.menu}
          tutupLabel={k.tutup}
          wa={tautanWa(situs.whatsapp, k.pesanWaUmum)}
          waLabel={k.tanyaWa}
        />
      </div>
    </BingkaiKepala>
  );
}
