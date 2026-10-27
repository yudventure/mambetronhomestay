'use client';
// Stay planner card on the home page, a plain GET form into /pesan. The dates
// open our own calendar, the same one as the booking page, as a centred
// window on wide screens and a sheet from the bottom on phones, so full
// nights show before the visitor commits. Both dates are required, and the
// choice is remembered in this browser for the next pages.
import { useCallback, useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import Ikon from './Ikon';
import Kalender from './Kalender';
import type { Bahasa } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { bulanTahun } from '@/lib/format';
import { useKunciGulir, useTutupLuar } from '@/lib/kait';
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
};
type Rentang = { masuk: string; keluar: string };

const KOSONG: Rentang = { masuk: '', keluar: '' };

export default function CariCepat({ b, awal, akhir, checkIn, checkOut, sisa, unit, kapasitas, minMalam, maksTamu }: Props) {
  const k = kamus(b);
  const t = k.rencanaTanggal;
  const [{ masuk, keluar }, setRentang] = useState<Rentang>(KOSONG);
  const [tamu, setTamu] = useState(Math.min(2, maksTamu));
  const [buka, setBuka] = useState(false);
  const [galat, setGalat] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  const tombolTutup = useRef<HTMLButtonElement>(null);
  const pemicu = useRef<HTMLButtonElement | null>(null);
  const dalam = useRef([panel]).current;
  // the check-out picked before the visitor reopened the calendar to change it
  const cadangan = useRef<Rentang | null>(null);
  const jeda = useRef<ReturnType<typeof setTimeout>>(undefined);

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
    // run once, later changes come from the visitor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(jeda.current), []);

  const tutup = useCallback(() => {
    clearTimeout(jeda.current);
    const c = cadangan.current;
    cadangan.current = null;
    if (c) setRentang((r) => (!r.keluar && r.masuk === c.masuk ? c : r));
    setBuka(false);
    setGalat('');
    pemicu.current?.focus();
  }, []);

  useKunciGulir(buka);
  useTutupLuar(buka, tutup, dalam);

  useEffect(() => {
    if (buka) tombolTutup.current?.focus();
  }, [buka]);

  function bukaDari(e: MouseEvent<HTMLButtonElement>, ujung: 'masuk' | 'keluar') {
    pemicu.current = e.currentTarget;
    cadangan.current = null;
    if (ujung === 'keluar' && masuk && keluar) {
      cadangan.current = { masuk, keluar };
      setRentang({ masuk, keluar: '' });
    }
    setBuka(true);
  }

  function pilih(a: string, z: string) {
    cadangan.current = null;
    setRentang({ masuk: a, keluar: z });
    setGalat('');
    simpanRencana({ masuk: a, keluar: z, tamu });
    clearTimeout(jeda.current);
    // close a moment after the check-out, so the chosen stay is seen first
    if (a && z) jeda.current = setTimeout(tutup, 450);
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
    pemicu.current = e.currentTarget.querySelector<HTMLButtonElement>(masuk ? '[data-ujung=keluar]' : '[data-ujung=masuk]');
    setGalat(t.dulu);
    setBuka(true);
  }

  const malam = masuk && keluar ? selisihHari(masuk, keluar) : 0;
  const hariPendek = new Intl.DateTimeFormat(b === 'en' ? 'en-GB' : 'id-ID', { weekday: 'short', timeZone: 'UTC' });

  // a tear-off calendar leaf, the weekday over the day number, or a calendar icon while empty
  const lembar = (d: string) => (
    <span aria-hidden className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-laut shadow-tipis">
      {d ? (
        <>
          <span className="text-[0.625rem] font-bold uppercase leading-none tracking-wider text-biru-tua">{hariPendek.format(new Date(`${d}T00:00:00Z`)).replace('.', '')}</span>
          <span className="mt-0.5 font-judul text-xl font-bold leading-none tabular-nums">{Number(d.slice(8))}</span>
        </>
      ) : (
        <Ikon nama="kalender" className="size-5 text-biru-tua" />
      )}
    </span>
  );

  const kotak = 'flex w-full items-center gap-3 rounded-2xl bg-embun p-2 pr-4 text-left outline-none transition-shadow hover:shadow-[0_0_0_2px_var(--color-buih-2)] focus-visible:shadow-[0_0_0_2px_var(--color-biru)]';
  const label = 'block text-xs font-semibold text-abu';
  const nilai = (d: string) => <span className={`block truncate font-semibold ${d ? 'text-laut' : 'text-abu/80'}`}>{d ? bulanTahun(d, b) : t.pilih}</span>;
  const bulat = 'inline-flex size-9 items-center justify-center rounded-full bg-white text-laut shadow-tipis transition-colors hover:bg-buih disabled:opacity-35 disabled:shadow-none';

  return (
    <form action="/pesan" method="get" onSubmit={kirim} className="kartu p-5 shadow-angkat">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/merek/wajah-senang.svg" alt="" aria-hidden width={64} height={52} className="size-16 shrink-0 rounded-2xl bg-buih object-contain p-1.5" />
        <h3 className="text-[1.65rem] leading-[1.02]">{k.rencana}</h3>
      </div>
      <input type="hidden" name="masuk" value={masuk} />
      <input type="hidden" name="keluar" value={keluar} />
      <input type="hidden" name="tamu" value={tamu} />

      <div className="mt-5 grid gap-2.5">
        <button type="button" data-ujung="masuk" onClick={(e) => bukaDari(e, 'masuk')} aria-haspopup="dialog" aria-expanded={buka} className={kotak}>
          {lembar(masuk)}
          <span className="min-w-0">
            <span className={label}>{k.tiba}</span>
            {nilai(masuk)}
          </span>
        </button>
        <button type="button" data-ujung="keluar" onClick={(e) => bukaDari(e, 'keluar')} aria-haspopup="dialog" aria-expanded={buka} className={kotak}>
          {lembar(keluar)}
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className={label}>{k.pulang}</span>
              {malam > 0 && <span className="text-xs font-bold text-biru-tua">{k.form.malam(malam)}</span>}
            </span>
            {nilai(keluar)}
          </span>
        </button>
        <div className="flex items-center gap-3 rounded-2xl bg-embun p-2 pr-2.5">
          <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-biru-tua shadow-tipis">
            <Ikon nama="orang" className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={label} id="label-tamu">{k.tamu}</span>
            <output aria-labelledby="label-tamu" aria-live="polite" className="block font-semibold tabular-nums text-laut">{tamu}</output>
          </span>
          <button type="button" onClick={() => ubahTamu(tamu - 1)} disabled={tamu <= 1} aria-label={t.kurangTamu} className={bulat}>
            <Ikon nama="kurang" className="size-4" />
          </button>
          <button type="button" onClick={() => ubahTamu(tamu + 1)} disabled={tamu >= maksTamu} aria-label={t.tambahTamu} className={bulat}>
            <Ikon nama="tambah" className="size-4" />
          </button>
        </div>
      </div>
      {galat && !buka && <p role="alert" className="mt-3 rounded-2xl bg-[#fde3dc] px-4 py-3 text-sm font-semibold text-merah">{galat}</p>}
      <button className="tombol mt-4 w-full">{k.cekKetersediaan}</button>
      <div className="mt-4 grid grid-cols-2 items-end gap-2 text-xs text-abu">
        <p>{k.checkInOut.masuk}<span className="block text-sm font-semibold text-laut">{checkIn}</span></p>
        <p>{k.checkInOut.keluar}<span className="block text-sm font-semibold text-laut">{checkOut}</span></p>
      </div>

      {buka && createPortal(
        <>
          <div aria-hidden className="fixed inset-0 z-[60] bg-laut/45" />
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[61] md:inset-0 md:flex md:items-center md:justify-center md:p-6">
            <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="judul-tanggal"
              className="tinggi-lembar pointer-events-auto overflow-y-auto overscroll-contain rounded-t-3xl bg-white px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-angkat md:w-full md:max-w-[46rem] md:rounded-[1.75rem] md:p-7">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-buih-2 md:hidden" aria-hidden />
              <div className="flex items-start justify-between gap-4">
                <h2 id="judul-tanggal" className="text-2xl md:text-[1.75rem]">{t.judul}</h2>
                <button ref={tombolTutup} type="button" onClick={tutup} aria-label={t.tutup}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-buih text-laut transition-colors hover:bg-buih-2">
                  <Ikon nama="silang" className="size-5" />
                </button>
              </div>
              {galat && <p role="alert" className="mt-4 rounded-2xl bg-[#fde3dc] px-4 py-3 text-sm font-semibold text-merah">{galat}</p>}
              <div className="mt-5">
                <Kalender b={b} sisa={sisa} unit={unit} butuh={butuh} minMalam={minMalam}
                  awal={awal} akhir={akhir} masuk={masuk} keluar={keluar} onPilih={pilih} />
              </div>
              <div className="mt-5 flex justify-end">
                <button type="button" onClick={tutup} className="tombol w-full md:w-auto md:px-8">{t.selesai}</button>
              </div>
            </div>
          </div>
        </>,
        document.body,
      )}
    </form>
  );
}
