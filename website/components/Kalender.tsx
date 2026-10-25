'use client';
// Availability calendar with range selection. A night is full when fewer
// units are free than the guest needs. A full night can still be the
// check-out day, because the guest leaves that morning.
import { useMemo, useState } from 'react';
import Ikon from './Ikon';
import type { Bahasa } from '@/lib/jenis';
import { KAMUS } from '@/lib/kamus';
import { bulanTahun, tanggal } from '@/lib/format';
import { awalBulan, hariDalamMinggu, jumlahHariBulan, selisihHari, tambahBulan, tambahHari } from '@/lib/tanggal';

export type PropsKalender = {
  b: Bahasa;
  sisa: Record<string, number>;
  unit: number;
  butuh: number;
  minMalam: number;
  awal: string;
  akhir: string;
  masuk: string;
  keluar: string;
  onPilih: (masuk: string, keluar: string) => void;
};

const MAKS_MALAM = 60;

export default function Kalender({ b, sisa, unit, butuh, minMalam, awal, akhir, masuk, keluar, onPilih }: PropsKalender) {
  const k = KAMUS[b].kalender;
  const [bulan, setBulan] = useState(() => awalBulan(masuk || awal));
  const [sorot, setSorot] = useState('');

  const penuh = (d: string) => (sisa[d] ?? unit) < butuh;
  const bisaMasuk = (d: string) => d >= awal && d <= akhir && !penuh(d);

  // the last day that can be the check-out for the chosen check-in
  const batasKeluar = useMemo(() => {
    if (!masuk) return '';
    let d = masuk;
    for (let i = 0; i < MAKS_MALAM; i++) {
      if ((sisa[d] ?? unit) < butuh) return d;
      d = tambahHari(d, 1);
    }
    return d;
  }, [masuk, sisa, unit, butuh]);

  const memilihKeluar = Boolean(masuk && !keluar);
  const bisaKeluar = (d: string) => memilihKeluar && d > masuk && d <= batasKeluar && selisihHari(masuk, d) >= minMalam;

  function ketuk(d: string) {
    if (memilihKeluar && bisaKeluar(d)) {
      onPilih(masuk, d);
      setSorot('');
      return;
    }
    if (bisaMasuk(d)) onPilih(d, '');
  }

  const ujung = keluar || (memilihKeluar && sorot && bisaKeluar(sorot) ? sorot : '');
  const awalBln = awalBulan(awal);
  const akhirBln = awalBulan(akhir);

  const namaHari = useMemo(() => {
    const f = new Intl.DateTimeFormat(b === 'en' ? 'en-GB' : 'id-ID', { weekday: 'narrow', timeZone: 'UTC' });
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2026, 10, 2 + i))));
  }, [b]);

  function bulanIni(mulai: string, className = '') {
    const n = jumlahHariBulan(mulai);
    const geser = (hariDalamMinggu(mulai) + 6) % 7;
    const sel: (string | null)[] = [...Array(geser).fill(null), ...Array.from({ length: n }, (_, i) => tambahHari(mulai, i))];
    return (
      <div className={className}>
        <p className="mb-3 text-center font-judul text-lg font-semibold text-laut">{bulanTahun(mulai, b)}</p>
        <div className="grid grid-cols-7 text-center text-xs font-bold text-abu" aria-hidden>
          {namaHari.map((h, i) => <span key={i} className="py-1">{h}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {sel.map((d, i) => {
            if (!d) return <span key={`k${i}`} />;
            const ujungKiri = d === masuk;
            const ujungKanan = d === ujung;
            const dalam = masuk && ujung && d > masuk && d < ujung;
            const malamPenuh = penuh(d);
            const aktif = memilihKeluar ? bisaKeluar(d) || bisaMasuk(d) : bisaMasuk(d);
            const lewat = d < awal || d > tambahHari(akhir, MAKS_MALAM);
            let gaya = 'text-laut hover:bg-buih';
            if (lewat) gaya = 'text-abu/35';
            else if (!aktif) gaya = malamPenuh ? 'text-merah/55 line-through' : 'text-abu/45';
            if (dalam) gaya = 'bg-buih-2 text-laut rounded-none';
            if (ujungKiri || ujungKanan) gaya = 'bg-toska-tua text-white';
            const label = `${tanggal(d, b, 'panjang')}${malamPenuh ? `, ${k.penuh}` : ''}`;
            return (
              <div key={d} className={`relative flex justify-center ${dalam ? 'bg-buih-2' : ''} ${ujungKiri && ujung ? 'bg-linear-to-r from-transparent from-50% to-buih-2 to-50%' : ''} ${ujungKanan && masuk ? 'bg-linear-to-l from-transparent from-50% to-buih-2 to-50%' : ''}`}>
                <button
                  type="button"
                  disabled={!aktif}
                  onClick={() => ketuk(d)}
                  onMouseEnter={() => memilihKeluar && setSorot(d)}
                  aria-label={label}
                  aria-pressed={ujungKiri || ujungKanan}
                  className={`flex size-10 items-center justify-center rounded-full text-[0.9375rem] font-semibold tabular-nums transition-colors sm:size-11 ${gaya} disabled:cursor-not-allowed`}
                >
                  {Number(d.slice(8))}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const pesan = !masuk ? k.pilihTiba : !keluar ? `${k.pilihPulang}${minMalam > 1 ? ` (${KAMUS[b].minMalam(minMalam).toLowerCase()})` : ''}` : '';

  return (
    <div onMouseLeave={() => setSorot('')}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button type="button" onClick={() => setBulan(tambahBulan(bulan, -1))} disabled={bulan <= awalBln}
          className="inline-flex size-10 items-center justify-center rounded-full bg-buih text-laut disabled:opacity-35" aria-label={k.sebelum}>
          <Ikon nama="kiri" />
        </button>
        <p className="text-center text-sm font-semibold text-toska-tua" aria-live="polite">
          {pesan || `${tanggal(masuk, b, 'hari')} ${k.sampai} ${tanggal(keluar, b, 'hari')}, ${KAMUS[b].form.malam(selisihHari(masuk, keluar))}`}
        </p>
        <button type="button" onClick={() => setBulan(tambahBulan(bulan, 1))} disabled={bulan >= akhirBln}
          className="inline-flex size-10 items-center justify-center rounded-full bg-buih text-laut disabled:opacity-35" aria-label={k.berikut}>
          <Ikon nama="kanan" />
        </button>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {bulanIni(bulan)}
        {bulanIni(tambahBulan(bulan, 1), 'hidden md:block')}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-abu">
        <ul className="flex flex-wrap gap-4">
          <li className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-buih ring-2 ring-buih-2" />{k.kosong}</li>
          <li className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-[#f6d6cf]" />{k.penuh}</li>
          <li className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-toska-tua" />{k.pilihan}</li>
        </ul>
        {masuk && (
          <button type="button" onClick={() => onPilih('', '')} className="font-semibold text-toska-tua underline underline-offset-4">
            {k.ulangi}
          </button>
        )}
      </div>
    </div>
  );
}
