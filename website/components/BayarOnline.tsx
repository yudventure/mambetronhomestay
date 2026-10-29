'use client';
// The Pay online button on the guest's booking page. It opens the Midtrans
// payment window over the page, so the guest never leaves the site. When
// the window closes, or the guest comes back from a method that leaves the
// page, the payments are checked with Midtrans and the page is refreshed.
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Ikon from './Ikon';

type Snap = { pay: (token: string, o: { onSuccess?: () => void; onPending?: () => void; onError?: () => void; onClose?: () => void }) => void };
declare global {
  interface Window {
    snap?: Snap;
  }
}

// snap.js once per page, with the client key it reads from its own tag
function muatSnap(src: string, client: string) {
  return new Promise<Snap>((ok, gagal) => {
    if (window.snap) return ok(window.snap);
    let s = document.querySelector<HTMLScriptElement>('script[data-snap-mambetron]');
    if (!s) {
      s = document.createElement('script');
      s.src = src;
      s.setAttribute('data-client-key', client);
      s.setAttribute('data-snap-mambetron', '');
      document.head.appendChild(s);
    }
    s.addEventListener('load', () => (window.snap ? ok(window.snap) : gagal(new Error('snap'))), { once: true });
    s.addEventListener('error', () => gagal(new Error('snap')), { once: true });
  });
}

export default function BayarOnline({ kode, t, status, menunggu, periksa, teks }: {
  kode: string;
  t: string;
  status: string;
  // a payment method chosen earlier and not yet paid, in words
  menunggu: string;
  // an earlier transaction may have changed since the page was made
  periksa: boolean;
  teks: { tombol: string; lanjut: string; ket: string; membuka: string; memeriksa: string; gagal: string };
}) {
  const router = useRouter();
  const [tahap, setTahap] = useState<'' | 'buka' | 'cek'>('');
  const [galat, setGalat] = useState('');
  const selesai = useRef(false);
  const isi = JSON.stringify({ kode, t });

  async function cek(segarkan: boolean) {
    setTahap('cek');
    try {
      const r = await fetch('/api/bayar/cek', { method: 'POST', headers: { 'content-type': 'application/json' }, body: isi, cache: 'no-store' });
      const o = (await r.json().catch(() => ({}))) as { status?: string; berubah?: boolean };
      if (segarkan || o.berubah || (o.status && o.status !== status)) router.refresh();
    } finally {
      setTahap('');
    }
  }

  // back from a method that left the page, or reopened later
  useEffect(() => {
    if (periksa) void cek(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function bayar() {
    setGalat('');
    setTahap('buka');
    try {
      const r = await fetch('/api/bayar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: isi, cache: 'no-store' });
      const o = (await r.json().catch(() => ({}))) as { token?: string; client?: string; snap?: string; galat?: string };
      if (o.galat === 'tidakPerlu') return router.refresh();
      if (!r.ok || !o.token || !o.client || !o.snap) throw new Error(o.galat ?? 'bayar');
      const snap = await muatSnap(o.snap, o.client);
      selesai.current = false;
      const tutup = () => {
        if (selesai.current) return;
        selesai.current = true;
        void cek(true);
      };
      snap.pay(o.token, {
        onSuccess: tutup,
        onPending: tutup,
        onError: () => {
          setGalat(teks.gagal);
          tutup();
        },
        onClose: tutup,
      });
      setTahap('');
    } catch {
      setGalat(teks.gagal);
      setTahap('');
    }
  }

  return (
    <div className="mt-5">
      {menunggu && <p className="mb-3 rounded-2xl bg-white px-4 py-3 text-[0.9375rem] font-semibold text-laut shadow-tipis">{menunggu}</p>}
      <button type="button" onClick={bayar} disabled={tahap !== ''} className="tombol w-full disabled:opacity-70 sm:w-auto">
        <Ikon nama="gembok" className="size-4" />
        {tahap === 'buka' ? teks.membuka : tahap === 'cek' ? teks.memeriksa : menunggu ? teks.lanjut : teks.tombol}
      </button>
      <p className="mt-2 text-sm text-abu">{teks.ket}</p>
      {galat && <p role="alert" className="mt-3 rounded-2xl bg-[#fde3dc] px-4 py-3 text-sm font-semibold text-merah">{galat}</p>}
    </div>
  );
}
