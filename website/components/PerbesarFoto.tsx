'use client';
// Full screen photo viewer. Opens fitted to the screen, one tap or the button
// shows the photo at its real size to pan around. Arrows, swipe and the arrow
// keys move between photos, Esc or a tap beside the photo closes it.
//
// Rendered into <body> through a portal, so no ancestor with a transform or a
// filter can trap the fixed layer. The page under it is frozen while open.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Ikon from './Ikon';
import type { Bahasa, Foto } from '@/lib/jenis';
import { KAMUS } from '@/lib/kamus';
import { useKunciGulir, useTutupLuar } from '@/lib/kait';

type FotoBesar = Pick<Foto, 'url' | 'lebar' | 'tinggi' | 'keterangan'>;

export default function PerbesarFoto({ b, foto, awal, tutup }: { b: Bahasa; foto: FotoBesar[]; awal: number; tutup: () => void }) {
  const k = KAMUS[b].foto;
  const [i, setI] = useState(awal);
  const [asli, setAsli] = useState(false);
  const panggung = useRef<HTMLDivElement>(null);
  const gambar = useRef<HTMLImageElement>(null);
  const kontrol = useRef<HTMLDivElement>(null);
  const bawah = useRef<HTMLDivElement>(null);
  const kiri = useRef<HTMLButtonElement>(null);
  const kanan = useRef<HTMLButtonElement>(null);
  const tombolTutup = useRef<HTMLButtonElement>(null);
  // a tap anywhere but these, on the dark space around the photo, closes it
  const dalam = useRef([gambar, kontrol, bawah, kiri, kanan]).current;
  const sentuh = useRef<{ x: number; y: number } | null>(null);
  const n = foto.length;
  const f = foto[i];

  useKunciGulir(true);
  useTutupLuar(true, tutup, dalam);

  const geser = useCallback((arah: number) => {
    if (n < 2) return;
    setI((x) => (x + arah + n) % n);
    setAsli(false);
  }, [n]);

  useEffect(() => {
    const kembali = document.activeElement as HTMLElement | null;
    tombolTutup.current?.focus();
    const tombol = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') geser(1);
      if (e.key === 'ArrowLeft') geser(-1);
    };
    document.addEventListener('keydown', tombol);
    return () => {
      document.removeEventListener('keydown', tombol);
      kembali?.focus?.();
    };
  }, [geser]);

  // start a real size view at the middle of the photo
  useEffect(() => {
    const el = panggung.current;
    if (!asli || !el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [asli, i]);

  if (!f) return null;
  const dasar = 'size-12 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/25';
  const bulat = `inline-flex ${dasar}`;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={k.jendela} className="fixed inset-0 z-[100] flex flex-col bg-laut-3 text-white">
      <div ref={kontrol} className="relative z-10 flex items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-5">
        {n > 1 && <span className="text-sm font-semibold tabular-nums text-white/80">{k.urutan(i + 1, n)}</span>}
        <button type="button" onClick={() => setAsli((a) => !a)}
          className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-white/12 px-4 text-sm font-semibold hover:bg-white/25">
          <Ikon nama={asli ? 'kecilkan' : 'besarkan'} className="size-4" /> {asli ? k.pasLayar : k.ukuranAsli}
        </button>
        <button ref={tombolTutup} type="button" onClick={tutup} aria-label={k.tutup} className={bulat}>
          <Ikon nama="silang" className="size-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={panggung}
          className={`absolute inset-0 overscroll-contain ${asli ? 'overflow-auto' : 'flex items-center justify-center overflow-hidden px-3 sm:px-20'}`}
          onTouchStart={(e) => { sentuh.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={(e) => {
            const s = sentuh.current;
            sentuh.current = null;
            if (!s || asli) return;
            const dx = e.changedTouches[0].clientX - s.x;
            const dy = e.changedTouches[0].clientY - s.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) geser(dx < 0 ? 1 : -1);
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={gambar} key={f.url} src={f.url} alt={f.keterangan} width={f.lebar || undefined} height={f.tinggi || undefined}
            onClick={() => setAsli((a) => !a)}
            style={asli && f.lebar ? { width: f.lebar, maxWidth: 'none', height: 'auto' } : undefined}
            className={asli ? 'm-auto block cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in rounded-xl object-contain'} />
        </div>
        {n > 1 && (
          <>
            <button ref={kiri} type="button" onClick={() => geser(-1)} aria-label={k.sebelum} className={`${dasar} absolute top-1/2 left-3 z-10 hidden -translate-y-1/2 sm:inline-flex`}>
              <Ikon nama="kiri" className="size-5" />
            </button>
            <button ref={kanan} type="button" onClick={() => geser(1)} aria-label={k.berikut} className={`${dasar} absolute top-1/2 right-3 z-10 hidden -translate-y-1/2 sm:inline-flex`}>
              <Ikon nama="kanan" className="size-5" />
            </button>
          </>
        )}
      </div>

      <div ref={bawah} className="px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
        {f.keterangan && <p className="mx-auto max-w-2xl text-sm text-white/85">{f.keterangan}</p>}
        {n > 1 && (
          <div className="mt-3 flex justify-center gap-3 sm:hidden">
            <button type="button" onClick={() => geser(-1)} aria-label={k.sebelum} className={bulat}><Ikon nama="kiri" className="size-5" /></button>
            <button type="button" onClick={() => geser(1)} aria-label={k.berikut} className={bulat}><Ikon nama="kanan" className="size-5" /></button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
