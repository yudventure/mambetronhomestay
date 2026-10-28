'use client';
// Stay planner on the home page, a plain GET form into /pesan, which sends
// the visitor on to DAMPIER while bookings go through DAMPIER. The
// availability calendar, the same one as the booking page, is shown open
// right away, so full nights show before the visitor commits. Both dates are
// required, and the choice is remembered in this browser for the next pages.
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Ikon from './Ikon';
import Kalender from './Kalender';
import KotakTanggal from './KotakTanggal';
import type { Bahasa } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { bacaRencana, simpanRencana } from '@/lib/rencana';
import { daftarMalam, selisihHari } from '@/lib/tanggal';

type Props = {
  b: Bahasa;
  awal: string;
  akhir: string;
  checkIn: string;
  checkOut: string;
  // free bungalows per night over every type, a missing night has all of them free
  sisa: Record<string, number>;
  unit: number;
  kapasitas: number;
  minMalam: number;
  maksTamu: number;
  // button words and a line under the button while bookings go through DAMPIER
  tombol?: string;
  catatan?: ReactNode;
};
type Rentang = { masuk: string; keluar: string };

const KOSONG: Rentang = { masuk: '', keluar: '' };

export default function CariCepat({ b, awal, akhir, checkIn, checkOut, sisa, unit, kapasitas, minMalam, maksTamu, tombol, catatan }: Props) {
  const k = kamus(b);
  const t = k.rencanaTanggal;
  const [{ masuk, keluar }, setRentang] = useState<Rentang>(KOSONG);
  const [tamu, setTamu] = useState(Math.min(2, maksTamu));
  const [galat, setGalat] = useState('');
  // bumped when remembered dates are restored, so the calendar opens on that month
  const [pulih, setPulih] = useState(0);

  const butuhUntuk = useCallback((n: number) => Math.max(1, Math.ceil(n / Math.max(1, kapasitas))), [kapasitas]);
  const butuh = butuhUntuk(tamu);

  // a stay that no longer fits loses its check-out, or both dates when even the first night is full
  const cocokkan = useCallback((r: Rentang, n: number): Rentang => {
    const penuh = (d: string) => (sisa[d] ?? unit) < butuhUntuk(n);
    if (!r.masuk) return KOSONG;
    if (r.masuk < awal || r.masuk > akhir || penuh(r.masuk)) return KOSONG;
    if (r.keluar && (selisihHari(r.masuk, r.keluar) < minMalam || daftarMalam(r.masuk, r.keluar).some(penuh))) return { masuk: r.masuk, keluar: '' };
    return r;
  }, [sisa, unit, butuhUntuk, awal, akhir, minMalam]);

  useEffect(() => {
    const r = bacaRencana();
    if (!r) return;
    const n = Math.min(maksTamu, r.tamu);
    setTamu(n);
    setRentang(cocokkan(r, n));
    setPulih((x) => x + 1);
    // run once, later changes come from the visitor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pilih(a: string, z: string) {
    setRentang({ masuk: a, keluar: z });
    setGalat('');
    simpanRencana({ masuk: a, keluar: z, tamu });
  }

  function ubahTamu(n: number) {
    const baru = Math.min(maksTamu, Math.max(1, n));
    const r = cocokkan({ masuk, keluar }, baru);
    setTamu(baru);
    setRentang(r);
    setGalat(r.keluar !== keluar || r.masuk !== masuk ? t.tidakMuat(baru) : '');
    simpanRencana({ ...r, tamu: baru });
  }

  function kirim(e: FormEvent<HTMLFormElement>) {
    if (masuk && keluar) return;
    e.preventDefault();
    setGalat(t.dulu);
  }

  const bulat = 'inline-flex size-9 items-center justify-center rounded-full bg-white text-laut shadow-tipis transition-colors hover:bg-buih disabled:opacity-35 disabled:shadow-none';

  return (
    <form id="rencana" action="/pesan" method="get" onSubmit={kirim}
      className="kartu grid scroll-mt-24 gap-6 p-5 shadow-angkat sm:p-7 xl:grid-cols-[minmax(0,1fr)_18rem] xl:grid-rows-[auto_auto_1fr] xl:gap-x-10">
      <input type="hidden" name="masuk" value={masuk} />
      <input type="hidden" name="keluar" value={keluar} />
      <input type="hidden" name="tamu" value={tamu} />

      <div className="flex items-center gap-3 xl:col-start-2 xl:row-start-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/merek/wajah-senang.svg" alt="" aria-hidden width={64} height={52} className="size-16 shrink-0 rounded-2xl bg-buih object-contain p-1.5" />
        <h3 className="text-[1.65rem] leading-[1.02]">{k.rencana}</h3>
      </div>

      <div className="min-w-0 xl:col-start-1 xl:row-span-3 xl:row-start-1">
        <Kalender key={pulih} b={b} sisa={sisa} unit={unit} butuh={butuh} minMalam={minMalam}
          awal={awal} akhir={akhir} masuk={masuk} keluar={keluar} onPilih={pilih} />
      </div>

      {/* on wide screens the chosen stay is spelled out beside the calendar */}
      <div className="hidden gap-2 xl:col-start-2 xl:row-start-2 xl:grid">
        <KotakTanggal b={b} label={k.tiba} d={masuk} kosong={t.diKalender} />
        <KotakTanggal b={b} label={k.pulang} d={keluar} kosong={t.diKalender} catatan={masuk && keluar ? k.form.malam(selisihHari(masuk, keluar)) : undefined} />
      </div>

      <div className="grid content-end gap-3 sm:grid-cols-2 xl:col-start-2 xl:row-start-3 xl:grid-cols-1">
        <div className="flex items-center gap-3 rounded-2xl bg-embun p-2 pr-2.5">
          <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-biru-tua shadow-tipis">
            <Ikon nama="orang" className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-abu" id="label-tamu">{k.tamu}</span>
            <output aria-labelledby="label-tamu" aria-live="polite" className="block font-semibold tabular-nums text-laut">{tamu}</output>
          </span>
          <button type="button" onClick={() => ubahTamu(tamu - 1)} disabled={tamu <= 1} aria-label={t.kurangTamu} className={bulat}>
            <Ikon nama="kurang" className="size-4" />
          </button>
          <button type="button" onClick={() => ubahTamu(tamu + 1)} disabled={tamu >= maksTamu} aria-label={t.tambahTamu} className={bulat}>
            <Ikon nama="tambah" className="size-4" />
          </button>
        </div>
        <button className="tombol h-full min-h-14 w-full">{tombol || k.cekKetersediaan}</button>
        {catatan && <div className="text-center sm:col-span-2 xl:col-span-1">{catatan}</div>}
        {galat && <p role="alert" className="rounded-2xl bg-[#fde3dc] px-4 py-3 text-sm font-semibold text-merah sm:col-span-2 xl:col-span-1">{galat}</p>}
        <div className="grid grid-cols-2 items-end gap-2 pt-1 text-xs text-abu sm:col-span-2 xl:col-span-1">
          <p>{k.checkInOut.masuk}<span className="block text-sm font-semibold text-laut">{checkIn}</span></p>
          <p>{k.checkInOut.keluar}<span className="block text-sm font-semibold text-laut">{checkOut}</span></p>
        </div>
      </div>
    </form>
  );
}
