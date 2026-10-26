'use client';
// Admin navigation. A sidebar on wide screens, a bottom sheet on phones.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Ikon from '../Ikon';
import { keluar } from '@/app/admin/aksi';
import { useKunciGulir, useTutupLuar } from '@/lib/kait';

export const MENU = [
  { href: '/admin', label: 'Dasbor', ikon: 'dasbor' },
  { href: '/admin/pesanan', label: 'Pesanan', ikon: 'tiket' },
  { href: '/admin/kalender', label: 'Kalender', ikon: 'kalender' },
  { href: '/admin/kamar', label: 'Pondok', ikon: 'kamar' },
  { href: '/admin/layanan', label: 'Kegiatan', ikon: 'perahu' },
  { href: '/admin/foto', label: 'Foto situs', ikon: 'foto' },
  { href: '/admin/ulasan', label: 'Ulasan', ikon: 'bintang' },
  { href: '/admin/pengaturan', label: 'Isi situs', ikon: 'geser' },
];

function Daftar({ jalur, klik }: { jalur: string; klik?: () => void }) {
  return (
    <nav className="grid gap-1">
      {MENU.map((m) => {
        const aktif = m.href === '/admin' ? jalur === '/admin' : jalur.startsWith(m.href);
        return (
          <Link key={m.href} href={m.href} onClick={klik} aria-current={aktif ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 font-semibold transition-colors ${aktif ? 'bg-white text-laut' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}>
            <Ikon nama={m.ikon} /> {m.label}
          </Link>
        );
      })}
      <a href="/" target="_blank" className="flex items-center gap-3 rounded-2xl px-4 py-2.5 font-semibold text-white/85 hover:bg-white/10 hover:text-white">
        <Ikon nama="luar" /> Lihat situs
      </a>
      <form action={keluar}>
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left font-semibold text-white/85 hover:bg-white/10 hover:text-white">
          <Ikon nama="keluar" /> Keluar
        </button>
      </form>
    </nav>
  );
}

export default function MenuAdmin() {
  const jalur = usePathname();
  const [buka, setBuka] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const tombol = useRef<HTMLButtonElement>(null);
  const tutup = useCallback(() => setBuka(false), []);
  const dalam = useRef([panel, tombol]).current;
  useKunciGulir(buka);
  useTutupLuar(buka, tutup, dalam);
  useEffect(() => setBuka(false), [jalur]);

  return (
    <>
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col overflow-y-auto bg-laut px-4 py-6 lg:flex">
        <Link href="/admin" className="mb-6 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merek/logo-horizontal-putih.svg" alt="Mambetron Homestay" width={180} height={40} className="h-10 w-auto" />
        </Link>
        <Daftar jalur={jalur} />
      </aside>

      <div className="sticky top-0 z-40 flex h-16 items-center justify-between bg-laut px-4 lg:hidden">
        <Link href="/admin">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merek/logo-horizontal-putih.svg" alt="Mambetron Homestay" width={144} height={32} className="h-8 w-auto" />
        </Link>
        <button ref={tombol} type="button" onClick={() => setBuka((b) => !b)} aria-expanded={buka} aria-controls="menu-admin"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white">
          <Ikon nama={buka ? 'silang' : 'menu'} className="size-6" />
          <span className="sr-only">Menu</span>
        </button>
        {buka && <div aria-hidden className="fixed inset-0 z-40 bg-laut/50" />}
        <div ref={panel} id="menu-admin" role="dialog" aria-modal="true" aria-label="Menu" hidden={!buka}
          className="tinggi-lembar fixed inset-x-0 bottom-0 z-50 overflow-y-auto rounded-t-3xl bg-laut px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/25" aria-hidden />
          <Daftar jalur={jalur} klik={tutup} />
        </div>
      </div>
    </>
  );
}
