import Ikon from './Ikon';
import type { Bahasa } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';

// Stay planner card on the home page, a plain GET form into /pesan.
export default function CariCepat({ b, awal, akhir, checkIn, checkOut }: { b: Bahasa; awal: string; akhir: string; checkIn: string; checkOut: string }) {
  const k = kamus(b);
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
          <input name="masuk" type="date" min={awal} max={akhir} className={isian} />
        </label>
        <label className={kotak}>
          <span className={label}>{k.pulang}</span>
          <input name="keluar" type="date" min={awal} className={isian} />
        </label>
        <label className={kotak}>
          <span className={label}>{k.tamu}</span>
          <select name="tamu" defaultValue="2" className={`${isian} appearance-none pr-6`}>
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
