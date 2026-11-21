'use client';
// Stay planner on the home page and on a bungalow page, a plain GET form into /pesan,
// or DAMPIER's payment sheet over the page while DAMPIER takes bookings. The
// availability calendar, the same one as the booking page, is shown open
// right away, so full nights show before the visitor commits. Both dates are
// required, and the choice is remembered in this browser for the next pages.
import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import Ikon from './Ikon';
import Kalender from './Kalender';
import KotakTanggal from './KotakTanggal';
import Pengelola from './Pengelola';
import Perkiraan from './Perkiraan';
import { rupiah, tanggal, type DataPengelola } from '@/lib/format';
import type { Bahasa, Kamar } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { bacaRencana, simpanRencana } from '@/lib/rencana';
import { daftarMalam, selisihHari } from '@/lib/tanggal';
import { barisIsi, hitungHarga, pondokUntuk } from '@/lib/harga';
import type { Kurs } from '@/lib/uang';

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
  // on a bungalow page, that bungalow with its own heading and button
  kamar?: string;
  judul?: string;
  tombol?: string;
  // "Managed by thedampier.com" under the card
  pengelola?: DataPengelola | null;
  // Check availability on WhatsApp: the wa.me link without text, the
  // message from the panel with {tiba} {pulang} {malam} {tamu} {bungalow},
  // and the bungalow's name for {bungalow}
  wa?: { tautan: string; pesan: string; bungalow: string } | null;
  // children under this age stay free and share their parents' bed, a few per bungalow
  usiaGratis: number;
  anakPerPondok: number;
  // the bungalow priced on this card (none when the site has several types),
  // the first rate tier's percentage, and the rates for the estimate. The
  // owner's request, November 2026: the price and the total in the card.
  harga?: { kamar: Pick<Kamar, 'harga' | 'skema_harga' | 'harga_sendiri' | 'kapasitas'>; persenPaket: number; kurs: Kurs } | null;
};
type Rentang = { masuk: string; keluar: string };

const KOSONG: Rentang = { masuk: '', keluar: '' };

export default function CariCepat({ b, awal, akhir, checkIn, checkOut, sisa, unit, kapasitas, minMalam, maksTamu, kamar, judul, tombol, pengelola, wa, usiaGratis, anakPerPondok, harga }: Props) {
  const k = kamus(b);
  const t = k.rencanaTanggal;
  const [{ masuk, keluar }, setRentang] = useState<Rentang>(KOSONG);
  // paying guests (adults and children from the free age) and the children under it
  const [tamu, setTamu] = useState(Math.min(2, maksTamu));
  const [anak, setAnak] = useState(0);
  const maksAnak = Math.min(8, anakPerPondok * unit);
  const [galat, setGalat] = useState('');
  // bumped when remembered dates are restored, so the calendar opens on that month
  const [pulih, setPulih] = useState(0);

  const butuhUntuk = useCallback((n: number, a: number) => pondokUntuk(n, a, kapasitas, anakPerPondok), [kapasitas, anakPerPondok]);
  const butuh = butuhUntuk(tamu, anak);

  // a stay that no longer fits loses its check-out, or both dates when even the first night is full
  const cocokkan = useCallback((r: Rentang, n: number, a: number): Rentang => {
    const penuh = (d: string) => (sisa[d] ?? unit) < butuhUntuk(n, a);
    if (!r.masuk) return KOSONG;
    if (r.masuk < awal || r.masuk > akhir || penuh(r.masuk)) return KOSONG;
    if (r.keluar && (selisihHari(r.masuk, r.keluar) < minMalam || daftarMalam(r.masuk, r.keluar).some(penuh))) return { masuk: r.masuk, keluar: '' };
    return r;
  }, [sisa, unit, butuhUntuk, awal, akhir, minMalam]);

  useEffect(() => {
    const r = bacaRencana();
    if (!r) return;
    const n = Math.min(maksTamu, r.tamu), a = Math.min(maksAnak, r.anak);
    setTamu(n);
    setAnak(a);
    setRentang(cocokkan(r, n, a));
    setPulih((x) => x + 1);
    // run once, later changes come from the visitor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pilih(a: string, z: string) {
    setRentang({ masuk: a, keluar: z });
    setGalat('');
    simpanRencana({ masuk: a, keluar: z, tamu, anak });
  }

  function ubahTamu(n: number, a = anak) {
    const baru = Math.min(maksTamu, Math.max(1, n)), anakBaru = Math.min(maksAnak, Math.max(0, a));
    const r = cocokkan({ masuk, keluar }, baru, anakBaru);
    setTamu(baru);
    setAnak(anakBaru);
    setRentang(r);
    setGalat(r.keluar !== keluar || r.masuk !== masuk ? t.tidakMuat(baru + anakBaru) : '');
    simpanRencana({ ...r, tamu: baru, anak: anakBaru });
  }

  function kirim(e: FormEvent<HTMLFormElement>) {
    if (!masuk || !keluar) {
      e.preventDefault();
      setGalat(t.dulu);
      return;
    }
    // DAMPIER's payment sheet takes the stay when it is on (LembarDampier),
    // otherwise the form goes on to /pesan.
    const tanya = new CustomEvent('mambetron:pesan', { cancelable: true, detail: { masuk, keluar, tamu, anak, kamar } });
    if (!window.dispatchEvent(tanya)) e.preventDefault();
  }

  // the WhatsApp message with the chosen stay filled in
  const tautanCek = wa?.tautan && masuk && keluar
    ? `${wa.tautan}?text=${encodeURIComponent(wa.pesan
      .replaceAll('{tiba}', tanggal(masuk, b, 'polos')).replaceAll('{pulang}', tanggal(keluar, b, 'polos'))
      .replaceAll('{malam}', k.form.malam(selisihHari(masuk, keluar))).replaceAll('{tamu}', t.tamuN(tamu) + (anak ? t.danAnak(anak, usiaGratis) : ''))
      .replaceAll('{bungalow}', wa.bungalow))}`
    : '';
  function cekWa(e: MouseEvent<HTMLAnchorElement>) {
    if (tautanCek) return;
    e.preventDefault();
    setGalat(t.dulu);
  }

  // the price of the chosen guests per night, and the total once both dates are in
  const malam = masuk && keluar ? selisihHari(masuk, keluar) : 0;
  const hitung = (n: number) => (harga ? hitungHarga(harga.kamar, { malam: n, jumlahKamar: butuh, dewasa: tamu, anak, layanan: [], dpPersen: 0, persenPaket: harga.persenPaket }) : null);
  const satuMalam = hitung(1), semua = malam > 0 ? hitung(malam) : null;
  const isi = satuMalam?.isi ?? null;
  const ketHarga = isi && isi.penuh > 0 && isi.sendiri > 0
    ? barisIsi(b, isi)
    : [t.isiPondok(butuh, tamu) + (anak ? `, ${t.anakGratis(anak)}` : '')];

  const bulat = 'inline-flex size-9 items-center justify-center rounded-full bg-white text-laut shadow-tipis transition-colors hover:bg-buih disabled:opacity-35 disabled:shadow-none';

  return (
    <form id="rencana" action="/pesan" method="get" onSubmit={kirim}
      className="kartu grid scroll-mt-24 gap-6 p-5 shadow-angkat sm:p-7 xl:grid-cols-[minmax(0,1fr)_18rem] xl:grid-rows-[auto_auto_1fr] xl:gap-x-10">
      <input type="hidden" name="masuk" value={masuk} />
      <input type="hidden" name="keluar" value={keluar} />
      <input type="hidden" name="tamu" value={tamu} />
      {anak > 0 && <input type="hidden" name="anak" value={anak} />}
      {kamar && <input type="hidden" name="kamar" value={kamar} />}

      <div className="flex items-center gap-3 xl:col-start-2 xl:row-start-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/merek/ikon.svg" alt="" aria-hidden width={64} height={64} className="size-16 shrink-0 rounded-2xl bg-buih object-contain p-1" />
        <h3 className="text-[1.65rem] leading-[1.02]">{judul ?? k.rencana}</h3>
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
        {/* paying guests, then the children under the free age who stay free */}
        <div className="grid gap-1 rounded-2xl bg-embun p-2 pr-2.5 sm:col-span-2 xl:col-span-1" data-rincian-tamu>
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-biru-tua shadow-tipis">
              <Ikon nama="orang" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-abu" id="label-tamu">{k.tamu}</span>
              <output aria-labelledby="label-tamu" aria-live="polite" className="block font-semibold tabular-nums text-laut">{tamu}</output>
              <span className="block text-[0.6875rem] leading-tight text-abu">{k.form.dewasaKet(usiaGratis)}</span>
            </span>
            <button type="button" onClick={() => ubahTamu(tamu - 1)} disabled={tamu <= 1} aria-label={t.kurangTamu} className={bulat}>
              <Ikon nama="kurang" className="size-4" />
            </button>
            <button type="button" onClick={() => ubahTamu(tamu + 1)} disabled={tamu >= maksTamu} aria-label={t.tambahTamu} className={bulat}>
              <Ikon nama="tambah" className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-biru-tua shadow-tipis">
              <Ikon nama="hati" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-abu" id="label-anak">{k.form.anak(usiaGratis)}</span>
              <output aria-labelledby="label-anak" aria-live="polite" className="block font-semibold tabular-nums text-laut">{anak}</output>
              <span className="block text-[0.6875rem] leading-tight text-abu">{k.form.anakKet}</span>
            </span>
            <button type="button" onClick={() => ubahTamu(tamu, anak - 1)} disabled={anak <= 0} aria-label={t.kurangAnak} className={bulat}>
              <Ikon nama="kurang" className="size-4" />
            </button>
            <button type="button" onClick={() => ubahTamu(tamu, anak + 1)} disabled={anak >= maksAnak} aria-label={t.tambahAnak} className={bulat}>
              <Ikon nama="tambah" className="size-4" />
            </button>
          </div>
        </div>
        {satuMalam && (
          <div className="grid gap-1 rounded-2xl bg-embun px-4 py-3 sm:col-span-2 xl:col-span-1" data-harga-rencana aria-live="polite">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-abu">{t.hargaMalam}</span>
              <span className="whitespace-nowrap font-semibold tabular-nums text-laut" data-harga-malam>{rupiah(satuMalam.biayaKamar, b)}</span>
            </div>
            {ketHarga.map((x) => <p key={x} className="text-xs leading-snug text-abu">{x}</p>)}
            {semua ? (
              <>
                <div className="mt-2 flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-laut">{t.totalMalam(malam)}</span>
                  <span className="whitespace-nowrap font-judul text-2xl font-semibold tabular-nums text-laut" data-total-rencana>{rupiah(semua.biayaKamar, b)}</span>
                </div>
                <Perkiraan idr={semua.biayaKamar} kurs={harga!.kurs} b={b} className="text-right text-abu" />
              </>
            ) : (
              <p className="mt-1 text-xs font-semibold text-biru-tua">{t.pilihUntukTotal}</p>
            )}
          </div>
        )}
        {/* Pay goes straight to payment, DAMPIER's sheet or the booking form.
            Check availability asks on WhatsApp with the chosen stay. */}
        <div className={`grid gap-3 sm:col-span-2 xl:col-span-1 ${wa?.tautan ? 'sm:grid-cols-2 xl:grid-cols-1' : ''}`}>
          <button className="tombol min-h-14 w-full" data-bayar>{tombol ?? k.bayarSekarang}</button>
          {wa?.tautan && (
            <a href={tautanCek || wa.tautan} onClick={cekWa} target="_blank" rel="noopener noreferrer" aria-label={t.waBaru}
              className="tombol tombol-putih min-h-14 w-full" data-cek-wa>
              <Ikon nama="chat" className="size-5" /> {k.cekKetersediaan}
            </a>
          )}
        </div>
        {galat && <p role="alert" className="rounded-2xl bg-[#fde3dc] px-4 py-3 text-sm font-semibold text-merah sm:col-span-2 xl:col-span-1">{galat}</p>}
        <div className="grid grid-cols-2 items-end gap-2 pt-1 text-xs text-abu sm:col-span-2 xl:col-span-1">
          <p>{k.checkInOut.masuk}<span className="block text-sm font-semibold text-laut">{checkIn}</span></p>
          <p>{k.checkInOut.keluar}<span className="block text-sm font-semibold text-laut">{checkOut}</span></p>
        </div>
        <Pengelola p={pengelola} className="text-xs sm:col-span-2 xl:col-span-1" />
      </div>
    </form>
  );
}
