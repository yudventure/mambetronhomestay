'use client';
// Admin shell after the DAMPIER operator desk. A white top bar with the logo,
// a link back to the site, a bell for bookings waiting on a deposit and the
// account menu. A white sidebar with the menu, groups that fold open and a
// HARI INI card. On phones the sidebar becomes a sheet from the bottom.
//
// Reused for other homestays by passing another MENU and logo. Colours come
// from the --color-panel-* tokens in globals.css.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Ikon from '../Ikon';
import { keluar } from '@/app/admin/aksi';
import { useKunciGulir, useTutupLuar } from '@/lib/kait';
import { tanggal } from '@/lib/format';
import type { RingkasPanel } from '@/lib/data';

type Tautan = { href: string; label: string; ikon: string; lencana?: number };
type Grup = { grup: string; ikon: string; isi: { href: string; label: string }[] };
type Butir = Tautan | Grup;

const aktifDi = (jalur: string, href: string) => (href === '/admin' ? jalur === '/admin' : jalur === href || jalur.startsWith(`${href}/`));

function menu(menunggu: number): Butir[] {
  return [
    { href: '/admin', label: 'Ringkasan', ikon: 'dasbor' },
    { href: '/admin/pesanan', label: 'Pesanan', ikon: 'tiket', lencana: menunggu },
    { href: '/admin/kalender', label: 'Kalender', ikon: 'kalender' },
    { href: '/admin/sinkron', label: 'Sinkron OTA', ikon: 'sinkron' },
    { href: '/admin/kamar', label: 'Pondok', ikon: 'kamar' },
    { href: '/admin/layanan', label: 'Kegiatan', ikon: 'perahu' },
    { href: '/admin/ulasan', label: 'Ulasan', ikon: 'bintang' },
    { grup: 'Situs web', ikon: 'globe', isi: [{ href: '/admin/pengaturan', label: 'Isi situs' }, { href: '/admin/foto', label: 'Foto situs' }] },
    { href: '/admin/sandi', label: 'Akun & kata sandi', ikon: 'orang' },
  ];
}

function ButirGrup({ g, jalur, klik }: { g: Grup; jalur: string; klik?: () => void }) {
  const di = g.isi.some((x) => aktifDi(jalur, x.href));
  const [buka, setBuka] = useState(di);
  useEffect(() => {
    if (di) setBuka(true);
  }, [di]);
  return (
    <li>
      <button type="button" onClick={() => setBuka((b) => !b)} aria-expanded={buka}
        className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left text-[1.0625rem] text-panel-utama transition-colors hover:bg-panel-latar">
        <Ikon nama={g.ikon} className="size-5 shrink-0" /> {g.grup}
        <Ikon nama="bawah" className={`ml-auto size-4 transition-transform ${buka ? 'rotate-180' : ''}`} />
      </button>
      {buka && (
        <ul className="mt-1 grid gap-1 pl-[2.6rem]">
          {g.isi.map((x) => {
            const aktif = aktifDi(jalur, x.href);
            return (
              <li key={x.href}>
                <Link href={x.href} onClick={klik} aria-current={aktif ? 'page' : undefined}
                  className={`block rounded-xl px-4 py-2.5 text-[0.9375rem] transition-colors ${aktif ? 'bg-panel-lembut font-semibold text-panel-utama' : 'text-panel-utama/80 hover:bg-panel-latar'}`}>
                  {x.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function Navigasi({ jalur, menunggu, hariIni, klik }: { jalur: string; menunggu: number; hariIni: string; klik?: () => void }) {
  return (
    <nav aria-label="Menu panel">
      <p className="label-kecil mb-3 px-4 !text-panel-utama">Menu</p>
      <ul className="grid gap-1">
        {menu(menunggu).map((b) => {
          if ('grup' in b) return <ButirGrup key={b.grup} g={b} jalur={jalur} klik={klik} />;
          const aktif = aktifDi(jalur, b.href);
          return (
            <li key={b.href}>
              <Link href={b.href} onClick={klik} aria-current={aktif ? 'page' : undefined}
                className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-[1.0625rem] transition-colors ${aktif ? 'bg-panel-utama font-semibold text-white shadow-[0_12px_26px_rgb(11_59_74/0.28)]' : 'text-panel-utama hover:bg-panel-latar'}`}>
                <Ikon nama={b.ikon} className="size-5 shrink-0" /> {b.label}
                {!!b.lencana && (
                  <span className={`ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${aktif ? 'bg-white/20 text-white' : 'bg-[#fde3dc] text-merah'}`}>
                    {b.lencana}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 rounded-3xl bg-panel-lembut px-5 py-5">
        <p className="label-kecil">Hari ini</p>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-panel-utama/80">{hariIni}</p>
      </div>
    </nav>
  );
}

const inisial = (surel: string) => (surel.split('@')[0].replace(/[^a-z]/gi, '').slice(0, 2) || 'A').toUpperCase();

export default function RangkaPanel({ surel, peran, ringkas, hariIni, children }: {
  surel: string;
  peran: string;
  ringkas: RingkasPanel;
  hariIni: string;
  children: React.ReactNode;
}) {
  const jalur = usePathname();
  const [lembar, setLembar] = useState(false);
  const [buka, setBuka] = useState<'' | 'lonceng' | 'akun'>('');
  const tutup = useCallback(() => setBuka(''), []);
  const tutupLembar = useCallback(() => setLembar(false), []);
  const lonceng = useRef<HTMLDivElement>(null);
  const akun = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tombolLembar = useRef<HTMLButtonElement>(null);
  // a tap on the other pop-up's button switches over instead of only closing
  const dalamPop = useRef([lonceng, akun]).current;
  const dalamLembar = useRef([panel, tombolLembar]).current;
  useTutupLuar(Boolean(buka), tutup, dalamPop);
  useTutupLuar(lembar, tutupLembar, dalamLembar);
  useKunciGulir(lembar);
  useEffect(() => {
    setLembar(false);
    setBuka('');
  }, [jalur]);

  const n = ringkas.menunggu;
  return (
    <div className="min-h-svh bg-white">
      <header className="sticky top-0 z-40 bg-white shadow-[0_6px_24px_rgb(11_59_74/0.06)]">
        <div className="mx-auto flex h-[4.5rem] max-w-[100rem] items-center gap-3 px-4 sm:px-6 lg:px-10">
          <Link href="/admin" className="flex shrink-0 items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/merek/logo-horizontal.svg" alt="Mambetron Homestay" width={180} height={40} className="h-8 w-auto sm:h-9" />
            <span className="hidden text-[0.6875rem] font-bold tracking-[0.28em] text-panel-utama sm:block">ADMIN</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <a href="/" target="_blank" className="hidden h-11 items-center gap-2 rounded-full px-5 text-[0.9375rem] font-medium text-panel-utama ring-1 ring-panel-garis transition-colors hover:bg-panel-latar md:inline-flex">
              Kembali ke situs <Ikon nama="luar" className="size-4" />
            </a>

            <div ref={lonceng} className="relative">
              <button type="button" onClick={() => setBuka((b) => (b === 'lonceng' ? '' : 'lonceng'))} aria-expanded={buka === 'lonceng'} aria-controls="kabar-panel"
                className="relative inline-flex size-11 items-center justify-center rounded-full text-panel-utama ring-1 ring-panel-garis transition-colors hover:bg-panel-latar">
                <Ikon nama="lonceng" className="size-5" />
                <span className="sr-only">{n ? `${n} pesanan menunggu konfirmasi` : 'Pemberitahuan'}</span>
                {n > 0 && <span aria-hidden className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-merah px-1 text-[0.6875rem] font-bold text-white">{n}</span>}
              </button>
              <div id="kabar-panel" hidden={buka !== 'lonceng'}
                className="absolute top-full right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-3xl bg-white p-3 text-panel-utama shadow-angkat ring-1 ring-panel-garis">
                <p className="label-kecil px-3 pt-1">Menunggu konfirmasi</p>
                {ringkas.daftarMenunggu.length ? (
                  <ul className="mt-2 grid gap-1">
                    {ringkas.daftarMenunggu.map((p) => (
                      <li key={p.id}>
                        <Link href={`/admin/pesanan/${p.id}`} className="block rounded-2xl px-3 py-2.5 hover:bg-panel-latar">
                          <span className="block font-semibold">{p.nama}</span>
                          <span className="block text-sm text-abu">{p.kode}, tiba {tanggal(p.check_in, 'id')}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : <p className="px-3 py-3 text-sm text-abu">Tidak ada pesanan yang menunggu konfirmasi.</p>}
                <Link href="/admin/pesanan?status=menunggu" className="mt-1 flex items-center gap-1.5 rounded-2xl px-3 py-2.5 text-sm font-bold text-panel-aksen hover:bg-panel-latar">
                  Buka meja pesanan <Ikon nama="panah" className="size-4" />
                </Link>
              </div>
            </div>

            <div ref={akun} className="relative">
              <button type="button" onClick={() => setBuka((b) => (b === 'akun' ? '' : 'akun'))} aria-expanded={buka === 'akun'} aria-controls="akun-panel" aria-label={`Akun ${peran}`}
                className="inline-flex h-11 items-center gap-2.5 rounded-full pr-3 pl-1 text-panel-utama ring-1 ring-panel-garis transition-colors hover:bg-panel-latar sm:pr-4">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-panel-utama text-xs font-bold text-white">{inisial(surel)}</span>
                <span className="hidden text-[0.9375rem] font-medium sm:block">{peran}</span>
                <Ikon nama="bawah" className="size-4" />
              </button>
              <div id="akun-panel" hidden={buka !== 'akun'}
                className="absolute top-full right-0 z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] rounded-3xl bg-white p-3 text-panel-utama shadow-angkat ring-1 ring-panel-garis">
                <p className="px-3 pt-1 text-xs text-abu">Masuk sebagai</p>
                <p className="px-3 pb-2 font-semibold [overflow-wrap:anywhere]">{surel.split('@')[0]}@<wbr />{surel.split('@')[1]}</p>
                <Link href="/admin/sandi" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-panel-latar"><Ikon nama="gembok" className="size-4" /> Ganti kata sandi</Link>
                <a href="/" target="_blank" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-panel-latar"><Ikon nama="luar" className="size-4" /> Lihat situs</a>
                <form action={keluar}>
                  <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-merah hover:bg-[#fde3dc]"><Ikon nama="keluar" className="size-4" /> Keluar</button>
                </form>
              </div>
            </div>

            <button ref={tombolLembar} type="button" onClick={() => setLembar((b) => !b)} aria-expanded={lembar} aria-controls="menu-panel"
              className="inline-flex size-11 items-center justify-center rounded-full bg-panel-utama text-white lg:hidden">
              <Ikon nama={lembar ? 'silang' : 'menu'} className="size-5" />
              <span className="sr-only">Menu</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[100rem]">
        <aside className="sticky top-[4.5rem] hidden h-[calc(100svh-4.5rem)] w-[18.5rem] shrink-0 overflow-y-auto px-6 py-8 lg:block">
          <Navigasi jalur={jalur} menunggu={n} hariIni={hariIni} />
        </aside>
        <main id="isi" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8 lg:pr-10 lg:pl-4">{children}</main>
      </div>

      {lembar && <div aria-hidden className="fixed inset-0 z-40 bg-panel-utama/40 lg:hidden" />}
      <div ref={panel} id="menu-panel" role="dialog" aria-modal="true" aria-label="Menu panel" hidden={!lembar}
        className="tinggi-lembar fixed inset-x-0 bottom-0 z-50 overflow-y-auto rounded-t-3xl bg-white px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-panel-garis" aria-hidden />
        <Navigasi jalur={jalur} menunggu={n} hariIni={hariIni} klik={tutupLembar} />
        <a href="/" target="_blank" className="mt-4 flex items-center justify-center gap-2 rounded-full px-5 py-3 font-medium text-panel-utama ring-1 ring-panel-garis">
          Kembali ke situs <Ikon nama="luar" className="size-4" />
        </a>
      </div>
    </div>
  );
}
