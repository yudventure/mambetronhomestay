'use client';
// DAMPIER's payment sheet over this site. The owner's request, November
// 2026, with the Mambetron owner's consent: once a guest has picked dates
// and guests, DAMPIER's Payment step opens right here, not DAMPIER's listing
// page. DAMPIER takes the booking and the payment, so DAMPIER's Midtrans
// account stays at DAMPIER.
//
// The sheet is DAMPIER's own page in a frame with a clear background, so
// DAMPIER's sheet and its dark backdrop lie over this page. DAMPIER lets
// only this site frame it (it learns the address from the calendar API,
// lib/dampier.ts). Its messages are read only from DAMPIER's address:
// `siap` the sheet is showing, `tutup` the guest closed it, `bayar` open
// Midtrans or PayPal in this window, since payment pages refuse frames.
// After paying, Midtrans or PayPal sends the guest back here with
// #dampier=<path of the booking page>, which opens in the same sheet.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Bahasa } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { useKunciGulir } from '@/lib/kait';

// `satu`: the only bungalow of the site, so the home page's card (no bungalow named) books it too.
type Data = { asal: string; jalur: string; kamar: string; satu: boolean };
// tamu pay (adults and children from the free age), anak are the children under it
type Pesan = { masuk: string; keluar: string; tamu: number; anak?: number; kamar?: string };

// The booking page DAMPIER sends the guest back to, nothing else.
const JALUR_PESANAN = /^\/(id|en|zh|ru|fr|es)\/bayar-mitra\/pesanan\/[A-Za-z0-9_-]{32,64}(\?paypal=(kembali|batal))?$/;
const TGL = /^\d{4}-\d{2}-\d{2}$/;
// How long the sheet may take on a weak connection before a retry is offered.
const LAMBAT_MS = 25_000;

export default function LembarDampier({ b, d }: { b: Bahasa; d: Data }) {
  const t = kamus(b).lembarDampier;
  const [src, setSrc] = useState<string | null>(null);
  const [siap, setSiap] = useState(false);
  const [lambat, setLambat] = useState(false);
  const [pindah, setPindah] = useState(false);
  const [muat, setMuat] = useState(0);
  const bingkai = useRef<HTMLIFrameElement>(null);
  useKunciGulir(!!src);

  const buka = useCallback((jalur: string) => {
    setSiap(false);
    setLambat(false);
    setPindah(false);
    setSrc(`${d.asal}${jalur}`);
  }, [d.asal]);
  const tutup = useCallback(() => setSrc(null), []);

  const bukaPesan = useCallback((p: Pesan) => {
    if (!TGL.test(p.masuk) || !TGL.test(p.keluar) || p.keluar <= p.masuk) return false;
    if (p.kamar ? p.kamar !== d.kamar : !d.satu) return false;
    const q = new URLSearchParams({ tiba: p.masuk, pulang: p.keluar, dewasa: String(Math.max(1, Math.round(p.tamu) || 1)) });
    // children under the free age go to DAMPIER as infants (bayi), free there too
    const anak = Math.max(0, Math.min(8, Math.round(p.anak ?? 0) || 0));
    if (anak) q.set('bayi', String(anak));
    buka(`/${b}${d.jalur}${d.jalur.includes('?') ? '&' : '?'}${q}`);
    return true;
  }, [b, d.jalur, d.kamar, d.satu, buka]);

  // The date card asks first (CariCepat), and keeps its own form when this
  // sheet does not take that bungalow.
  useEffect(() => {
    const dengar = (e: Event) => {
      const p = (e as CustomEvent<Pesan>).detail;
      if (p && bukaPesan(p)) e.preventDefault();
    };
    window.addEventListener('mambetron:pesan', dengar);
    return () => window.removeEventListener('mambetron:pesan', dengar);
  }, [bukaPesan]);

  // Back from Midtrans or PayPal (#dampier=…), or sent here by /pesan with
  // the dates in the address. Both are cleared from the address bar.
  useEffect(() => {
    const u = new URL(window.location.href);
    let hash = '';
    try { hash = u.hash.startsWith('#dampier=') ? decodeURIComponent(u.hash.slice(9)) : ''; } catch { /* not ours */ }
    const q = u.searchParams;
    const pesan = { masuk: q.get('dampier_tiba') ?? '', keluar: q.get('dampier_pulang') ?? '', tamu: Number(q.get('dampier_tamu')) || 2, anak: Number(q.get('dampier_anak')) || 0 };
    if (!hash && !pesan.masuk) return;
    for (const k of ['dampier_tiba', 'dampier_pulang', 'dampier_tamu', 'dampier_anak']) q.delete(k);
    window.history.replaceState(window.history.state, '', u.pathname + (q.size ? `?${q}` : ''));
    if (JALUR_PESANAN.test(hash)) buka(hash);
    else if (pesan.masuk) bukaPesan(pesan);
    // once, on the first page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!src) return;
    const dengar = (e: MessageEvent) => {
      if (e.origin !== d.asal || e.source !== bingkai.current?.contentWindow) return;
      const p = e.data as { dampier?: string; url?: unknown } | null;
      if (p?.dampier === 'siap') setSiap(true);
      else if (p?.dampier === 'tutup') tutup();
      else if (p?.dampier === 'bayar' && typeof p.url === 'string') {
        let u: URL;
        try { u = new URL(p.url); } catch { return; }
        // https, or a local stand-in while DAMPIER itself runs on this computer
        const uji = new URL(d.asal).protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(u.hostname);
        if (u.protocol !== 'https:' && !uji) return;
        setPindah(true);
        setSiap(false);
        window.location.assign(u.toString());
      }
    };
    window.addEventListener('message', dengar);
    return () => window.removeEventListener('message', dengar);
  }, [src, d.asal, tutup]);

  useEffect(() => {
    if (!src || siap || pindah) return;
    const id = setTimeout(() => setLambat(true), LAMBAT_MS);
    return () => clearTimeout(id);
  }, [src, siap, pindah, muat]);

  // Escape closes while the waiting card shows. Inside the sheet, DAMPIER's own Escape closes it.
  useEffect(() => {
    if (!src || siap) return;
    const tekan = (e: KeyboardEvent) => { if (e.key === 'Escape') tutup(); };
    document.addEventListener('keydown', tekan);
    return () => document.removeEventListener('keydown', tekan);
  }, [src, siap, tutup]);

  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={t.judul} data-lembar-dampier={siap ? 'siap' : 'memuat'}>
      {!siap && (
        <div className="absolute inset-0 grid place-items-center bg-[rgba(19,26,54,.62)] p-4">
          <div className="kartu grid w-full max-w-sm justify-items-center gap-3 p-6 text-center shadow-angkat">
            {!lambat && <span aria-hidden className="size-9 animate-spin rounded-full border-4 border-buih border-t-laut" />}
            <p className="font-semibold text-laut" role="status">{lambat ? t.lambat : t.membuka}</p>
            {lambat && (
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" className="tombol" onClick={() => { setLambat(false); setMuat((x) => x + 1); }}>{t.ulang}</button>
                <button type="button" className="tombol tombol-putih" onClick={tutup}>{t.tutup}</button>
              </div>
            )}
            <p className="text-xs text-abu">{t.dikelola}</p>
          </div>
        </div>
      )}
      <iframe key={muat} ref={bingkai} src={src} title={t.judul} allow="payment"
        className={`absolute inset-0 size-full border-0 bg-transparent ${siap ? '' : 'pointer-events-none opacity-0'}`}
        style={{ colorScheme: 'light' }} />
    </div>
  );
}
