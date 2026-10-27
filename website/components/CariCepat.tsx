'use client';
// Stay planner card on the home page, a plain GET form into /pesan. Both
// dates are required, so the booking page always opens with the stay already
// picked. The choice is remembered in this browser for the next pages.
import { useEffect, useState } from 'react';
import Ikon from './Ikon';
import type { Bahasa } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { bacaRencana, simpanRencana } from '@/lib/rencana';
import { tambahHari } from '@/lib/tanggal';

export default function CariCepat({ b, awal, akhir, checkIn, checkOut }: { b: Bahasa; awal: string; akhir: string; checkIn: string; checkOut: string }) {
  const k = kamus(b);
  const [masuk, setMasuk] = useState('');
  const [keluar, setKeluar] = useState('');
  const [tamu, setTamu] = useState('2');

  useEffect(() => {
    const r = bacaRencana();
    if (!r || r.masuk < awal || r.masuk > akhir) return;
    setMasuk(r.masuk);
    setKeluar(r.keluar);
    setTamu(String(Math.min(6, r.tamu)));
  }, [awal, akhir]);

  // a check-in date pulls the check-out to the next morning when it is not later already
  function ubahMasuk(v: string) {
    const k2 = v && (!keluar || keluar <= v) ? tambahHari(v, 1) : keluar;
    setMasuk(v);
    setKeluar(k2);
    simpanRencana({ masuk: v, keluar: k2, tamu: Number(tamu) });
  }
  function ubahKeluar(v: string) {
    setKeluar(v);
    simpanRencana({ masuk, keluar: v, tamu: Number(tamu) });
  }
  function ubahTamu(v: string) {
    setTamu(v);
    if (masuk) simpanRencana({ masuk, keluar, tamu: Number(v) });
  }

  const kotak = 'relative block rounded-2xl bg-embun px-4 py-2.5 transition-shadow focus-within:shadow-[0_0_0_2px_var(--color-biru)]';
  const label = 'block text-xs font-semibold text-abu';
  const isian = 'mt-0.5 block w-full bg-transparent font-semibold text-laut outline-none';
  return (
    <form action="/pesan" method="get" className="kartu p-5 shadow-angkat">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/merek/wajah-senang.svg" alt="" aria-hidden width={64} height={52} className="size-16 shrink-0 rounded-2xl bg-buih object-contain p-1.5" />
        <h3 className="text-[1.65rem] leading-[1.02]">{k.rencana}</h3>
      </div>
      <div className="mt-5 grid gap-2.5">
        <label className={kotak}>
          <span className={label}>{k.tiba}</span>
          <input name="masuk" type="date" required min={awal} max={akhir} value={masuk} onChange={(e) => ubahMasuk(e.target.value)} className={isian} />
        </label>
        <label className={kotak}>
          <span className={label}>{k.pulang}</span>
          <input name="keluar" type="date" required min={masuk ? tambahHari(masuk, 1) : tambahHari(awal, 1)} value={keluar} onChange={(e) => ubahKeluar(e.target.value)} className={isian} />
        </label>
        <label className={kotak}>
          <span className={label}>{k.tamu}</span>
          <select name="tamu" value={tamu} onChange={(e) => ubahTamu(e.target.value)} className={`${isian} appearance-none pr-6`}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <Ikon nama="bawah" className="pointer-events-none absolute right-4 bottom-3.5 size-4 text-biru-tua" />
        </label>
      </div>
      <button className="tombol mt-4 w-full">{k.cekKetersediaan}</button>
      <div className="mt-4 grid grid-cols-2 items-end gap-2 text-xs text-abu">
        <p>{k.checkInOut.masuk}<span className="block text-sm font-semibold text-laut">{checkIn}</span></p>
        <p>{k.checkInOut.keluar}<span className="block text-sm font-semibold text-laut">{checkOut}</span></p>
      </div>
    </form>
  );
}
