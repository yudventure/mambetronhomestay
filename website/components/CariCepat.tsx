'use client';
// Stay planner on the home page and on a bungalow page, a plain GET form into /pesan,
// or DAMPIER's payment sheet over the page while DAMPIER takes bookings. The
// availability calendar, the same one as the booking page, is shown open
// right away, so full nights show before the visitor commits. Both dates are
// required, and the choice is remembered in this browser for the next pages.
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Ikon from './Ikon';
import FasilitasBeranda from './FasilitasBeranda';
import Kalender from './Kalender';
import KotakTanggal from './KotakTanggal';
import Pengelola from './Pengelola';
import Perkiraan from './Perkiraan';
import { rentangTanggal, rupiah, tanggal, type DataPengelola } from '@/lib/format';
import type { Bahasa, Kamar, Layanan } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { bacaRencana, simpanRencana } from '@/lib/rencana';
import { daftarMalam, selisihHari } from '@/lib/tanggal';
import { barisIsi, hitungHarga, isiPondok, jumlahSatuan, pondokUntuk, satuanLayanan } from '@/lib/harga';
import { pilih as pilihBahasa } from '@/lib/format';
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
  // Contact us on WhatsApp: the wa.me link without text, the message from
  // the panel with {tiba} {pulang} {malam} {tamu} {bungalow} once dates are
  // picked, and the bungalow's name for {bungalow}
  wa?: { tautan: string; pesan: string; bungalow: string } | null;
  // children under this age stay free and share their parents' bed, a few per bungalow
  usiaGratis: number;
  anakPerPondok: number;
  // the bungalow priced on this card (none when the site has several types),
  // the first rate tier's percentage, and the rates for the estimate. The
  // owner's request, November 2026: the price and the total in the card.
  harga?: { kamar: Pick<Kamar, 'harga' | 'skema_harga' | 'harga_sendiri' | 'harga_tambah' | 'kapasitas'>; persenPaket: number; kurs: Kurs } | null;
  // boat transfers priced per boat (Kegiatan, Dihitung per perahu), picked
  // here with the stay: the owner's request, November 2026, "masukan dalam
  // add on pesanan kamar untuk boat transfernya"
  perahu?: Pick<Layanan, 'id' | 'nama' | 'nama_en' | 'harga' | 'satuan' | 'muat'>[];
  // what a stay includes, above the boat transfer (home page only, the
  // bungalow page lists it beside the description)
  fasilitas?: string[];
};
type Rentang = { masuk: string; keluar: string };

const KOSONG: Rentang = { masuk: '', keluar: '' };

export default function CariCepat({ b, awal, akhir, checkIn, checkOut, sisa, unit, kapasitas, minMalam, maksTamu, kamar, judul, tombol, pengelola, wa, usiaGratis, anakPerPondok, harga, perahu = [], fasilitas = [] }: Props) {
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

  // One more bungalow than the guests need can be picked when a bungalow
  // would hold three: the owner's request, November 2026, "Rp600.000 untuk
  // satu kamar 3 orang, jika ingin kamar sendiri tambahan 850.000".
  const [tambahPondok, setTambahPondok] = useState(false);
  // the boat transfer picked, a Kegiatan id, 0 for none, priced one way and
  // going there and back unless the guest picks one way (the owner, November 2026)
  const [perahuId, setPerahuId] = useState(0);
  const [pulangPergi, setPulangPergi] = useState(true);
  const bisaTambah = useCallback((n: number, a: number) => {
    const min = pondokUntuk(n, a, kapasitas, anakPerPondok);
    const isi = harga ? isiPondok(harga.kamar, min, n) : null;
    return !!isi && isi.baris.some((x) => x.orang >= 3) && min + 1 <= unit && min + 1 <= n;
  }, [harga, kapasitas, anakPerPondok, unit]);
  const butuhUntuk = useCallback((n: number, a: number, tambah = tambahPondok) => pondokUntuk(n, a, kapasitas, anakPerPondok) + (tambah && bisaTambah(n, a) ? 1 : 0),
    [kapasitas, anakPerPondok, tambahPondok, bisaTambah]);
  const butuhMin = pondokUntuk(tamu, anak, kapasitas, anakPerPondok);
  const pilihanPondok = bisaTambah(tamu, anak);
  const butuh = butuhUntuk(tamu, anak);

  // a stay that no longer fits loses its check-out, or both dates when even the first night is full
  const cocokkan = useCallback((r: Rentang, n: number, a: number, tambah = tambahPondok): Rentang => {
    const penuh = (d: string) => (sisa[d] ?? unit) < butuhUntuk(n, a, tambah);
    if (!r.masuk) return KOSONG;
    if (r.masuk < awal || r.masuk > akhir || penuh(r.masuk)) return KOSONG;
    if (r.keluar && (selisihHari(r.masuk, r.keluar) < minMalam || daftarMalam(r.masuk, r.keluar).some(penuh))) return { masuk: r.masuk, keluar: '' };
    return r;
  }, [sisa, unit, butuhUntuk, awal, akhir, minMalam, tambahPondok]);

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

  // one more bungalow, kept off when the chosen nights have no room for it
  function pilihTambah(v: boolean) {
    if (v && masuk) {
      const r = cocokkan({ masuk, keluar }, tamu, anak, true);
      if (r.masuk !== masuk || r.keluar !== keluar) {
        setGalat(t.tambahPenuh);
        return;
      }
    }
    setTambahPondok(v);
    setGalat('');
  }

  function kirim(e: FormEvent<HTMLFormElement>) {
    if (!masuk || !keluar) {
      e.preventDefault();
      setGalat(t.dulu);
      return;
    }
    // DAMPIER's payment sheet takes the stay when it is on (LembarDampier),
    // otherwise the form goes on to /pesan.
    const tanya = new CustomEvent('mambetron:pesan', { cancelable: true, detail: { masuk, keluar, tamu, anak, kamar, pondok: butuh, tambahan: perahuPilih ? perahuPilih.l.nama : '', sekali: !!perahuPilih && !pulangPergi } });
    if (!window.dispatchEvent(tanya)) e.preventDefault();
  }

  // Contact us opens WhatsApp with the chosen stay filled in, or with a plain
  // greeting before the dates are picked (the owner's request, November
  // 2026, "tombol cek availibilty ganti dengan hubungi kami saja").
  const tautanHubungi = !wa?.tautan ? ''
    : masuk && keluar
      ? `${wa.tautan}?text=${encodeURIComponent(wa.pesan
        .replaceAll('{tiba}', tanggal(masuk, b, 'polos')).replaceAll('{pulang}', tanggal(keluar, b, 'polos'))
        .replaceAll('{malam}', k.form.malam(selisihHari(masuk, keluar))).replaceAll('{tamu}', t.tamuN(tamu) + (anak ? t.danAnak(anak, usiaGratis) : '') + (butuh > 1 ? `, ${t.bungalowN(butuh)}` : ''))
        .replaceAll('{bungalow}', wa.bungalow))}`
      : `${wa.tautan}?text=${encodeURIComponent(k.pesanWaUmum)}`;

  // Bungalows still free for the picked stay, the fewest over its nights, or
  // on the arrival night while the check-out is not picked yet (the owner's
  // request, November 2026, "tambahkan ketersediaan pada hari yang dipilih
  // sisa kamar berapa"). A night missing from sisa has every bungalow free.
  const malamPilih = masuk ? (keluar ? daftarMalam(masuk, keluar) : [masuk]) : [];
  const tersedia = malamPilih.length ? Math.min(...malamPilih.map((d) => sisa[d] ?? unit)) : null;

  // the price of the chosen guests per night, and the total once both dates are in
  const malam = masuk && keluar ? selisihHari(masuk, keluar) : 0;
  const hitung = (n: number) => (harga ? hitungHarga(harga.kamar, { malam: n, jumlahKamar: butuh, dewasa: tamu, anak, layanan: [], dpPersen: 0, persenPaket: harga.persenPaket }) : null);
  const satuMalam = hitung(1), semua = malam > 0 ? hitung(malam) : null;
  const isi = satuMalam?.isi ?? null;
  const ketHarga = isi && isi.baris.length > 1
    ? barisIsi(b, isi)
    : [t.isiPondok(butuh, tamu) + (anak ? `, ${t.anakGratis(anak)}` : '')];
  // each boat transfer with the boats this party needs; children under the free age sit on a lap
  const perahuHarga = perahu.map((l) => {
    const kapal = jumlahSatuan(l.satuan, tamu, 1, tamu, l.muat);
    const n = jumlahSatuan(l.satuan, tamu, 1, tamu, l.muat, pulangPergi);
    return { l, kapal, n, total: l.harga * n };
  });
  const perahuPilih = perahuHarga.find((x) => x.l.id === perahuId) ?? null;
  // the two choices, each with its bungalows and price per night
  const pilihan = pilihanPondok && harga ? [false, true].map((v) => {
    const n = butuhMin + (v ? 1 : 0);
    const h = hitungHarga(harga.kamar, { malam: 1, jumlahKamar: n, dewasa: tamu, anak, layanan: [], dpPersen: 0, persenPaket: harga.persenPaket });
    return { v, judul: v ? t.tambahPondok : t.bertiga, isi: (h.isi?.baris ?? []).map((x) => t.isiPondok(x.bungalow, x.orang)).join(', '), harga: h.biayaKamar };
  }) : [];

  const bulat = 'inline-flex size-9 items-center justify-center rounded-full bg-white text-laut shadow-tipis transition-colors hover:bg-buih disabled:opacity-35 disabled:shadow-none';

  return (
    <form id="rencana" action="/pesan" method="get" onSubmit={kirim}
      className="kartu grid scroll-mt-24 gap-6 p-5 shadow-angkat sm:p-7 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start xl:gap-x-10">
      <input type="hidden" name="masuk" value={masuk} />
      <input type="hidden" name="keluar" value={keluar} />
      <input type="hidden" name="tamu" value={tamu} />
      {anak > 0 && <input type="hidden" name="anak" value={anak} />}
      {butuh > butuhMin && <input type="hidden" name="pondok" value={butuh} />}
      {perahuPilih && <input type="hidden" name="layanan" value={perahuPilih.l.id} />}
      {perahuPilih && !pulangPergi && <input type="hidden" name="arah" value="sekali" />}
      {kamar && <input type="hidden" name="kamar" value={kamar} />}

      {/* Two columns on wide screens: the calendar with the bungalow choice,
          what a stay includes and the boat transfer under it, and beside it
          the stay, the guests, the price and the buttons. Below that one
          column: heading, calendar, guests, choices, facilities, boat, price,
          buttons. */}
      <div className="contents xl:flex xl:min-w-0 xl:flex-col xl:gap-5">
        <div className="order-2 min-w-0 xl:order-none">
          <Kalender key={pulih} b={b} sisa={sisa} unit={unit} butuh={butuh} minMalam={minMalam}
            awal={awal} akhir={akhir} masuk={masuk} keluar={keluar} onPilih={pilih} />
        </div>
          {/* the bungalow choice belongs with the guests, under them */}
          {pilihan.length > 0 && (
            <fieldset className="order-4 grid gap-2 rounded-2xl bg-embun p-3 sm:grid-cols-2 xl:order-none" data-pilih-pondok>
              <legend className="float-left mb-1 w-full text-sm text-abu sm:col-span-2">{t.pilihPondok}</legend>
              {pilihan.map((x) => {
                const on = x.v === (butuh > butuhMin);
                return (
                  <label key={String(x.v)} className={`flex cursor-pointer items-start gap-2.5 rounded-xl bg-white px-3 py-2.5 transition-shadow ${on ? 'ring-2 ring-biru' : 'ring-1 ring-buih-2'}`}>
                    <input type="radio" name="pilih_pondok" form="rencana-pilihan" checked={on} onChange={() => pilihTambah(x.v)} className="mt-0.5 size-4 shrink-0 accent-[#036f87]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-tight text-laut">{x.judul}</span>
                      <span className="block text-xs leading-snug text-abu">{x.isi}</span>
                    </span>
                    <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-laut">{rupiah(x.harga, b)}</span>
                  </label>
                );
              })}
            </fieldset>
          )}
          {/* what a stay includes, just above the boat transfer */}
          {fasilitas.length > 0 && (
            <div className="order-4 xl:order-none">
              <FasilitasBeranda b={b} fasilitas={fasilitas} />
            </div>
          )}
          {perahuHarga.length > 0 && (
            <fieldset className="order-4 grid gap-2 rounded-2xl bg-embun p-3 sm:grid-cols-3 xl:order-none" data-pilih-perahu>
              <legend className="float-left mb-1 w-full text-sm text-abu sm:col-span-3">{t.perahuJudul}</legend>
              {[null, ...perahuHarga].map((x) => {
                const on = (x?.l.id ?? 0) === perahuId;
                return (
                  <label key={x?.l.id ?? 0} className={`flex cursor-pointer items-start gap-2.5 rounded-xl bg-white px-3 py-2.5 transition-shadow ${on ? 'ring-2 ring-biru' : 'ring-1 ring-buih-2'}`}>
                    <input type="radio" name="pilih_perahu" form="rencana-pilihan" checked={on} onChange={() => setPerahuId(x?.l.id ?? 0)} className="mt-0.5 size-4 shrink-0 accent-[#036f87]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-tight text-laut">{x ? pilihBahasa(b, x.l.nama, x.l.nama_en) : t.perahuTidak}</span>
                      {x && <span className="block text-xs leading-snug text-abu">{satuanLayanan(x.l, b)}</span>}
                      {x && <span className="mt-0.5 block text-sm font-semibold tabular-nums text-laut">{t.perahuArah(x.kapal, pulangPergi)}, {rupiah(x.total, b)}</span>}
                    </span>
                  </label>
                );
              })}
              {perahuPilih && (
                <div className="flex flex-wrap items-center gap-2 sm:col-span-3" role="radiogroup" aria-label={t.arahJudul} data-arah-perahu>
                  <span className="text-sm text-abu">{t.arahJudul}</span>
                  {([true, false] as const).map((v) => (
                    <label key={String(v)} className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-biru ${pulangPergi === v ? 'bg-laut text-white' : 'bg-white text-laut ring-1 ring-buih-2 hover:bg-buih'}`}>
                      <input type="radio" name="pilih_arah" form="rencana-pilihan" className="sr-only" checked={pulangPergi === v} onChange={() => setPulangPergi(v)} />
                      {v ? t.pulangPergi : t.sekaliJalan}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          )}
      </div>

      <div className="contents xl:flex xl:flex-col xl:gap-4">
        <div className="order-1 flex items-center gap-3 xl:order-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merek/ikon.svg" alt="" aria-hidden width={64} height={64} className="size-16 shrink-0 rounded-2xl bg-buih object-contain p-1" />
          <h3 className="text-[1.65rem] leading-[1.02]">{judul ?? k.rencana}</h3>
        </div>

        {/* The stay beside the calendar: check-in and check-out on wide
            screens, then the guests under them and above the price (the
            owner's request, November 2026). */}
        <div className="contents xl:grid xl:gap-2">
          <div className="hidden gap-2 xl:grid">
            <KotakTanggal b={b} label={k.tiba} d={masuk} kosong={t.diKalender} />
            <KotakTanggal b={b} label={k.pulang} d={keluar} kosong={t.diKalender} catatan={masuk && keluar ? k.form.malam(selisihHari(masuk, keluar)) : undefined} />
          </div>
          {/* bungalows left for the picked dates, under the dates and above the guests */}
          <div className="order-3 empty:hidden xl:order-none" aria-live="polite" data-sisa-pondok>
            {tersedia !== null && (
              <div className="flex items-center gap-3 rounded-2xl bg-buih p-2.5 pr-4">
                <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white text-biru-tua shadow-tipis">
                  <Ikon nama="kamar" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-abu">{t.sisaJudul}</span>
                  <span className={`block text-lg font-semibold tabular-nums ${tersedia <= 2 && unit > 2 ? 'text-merah' : 'text-laut'}`} data-sisa-angka={tersedia}>{t.sisaN(tersedia, unit)}</span>
                  <span className="block text-xs leading-snug text-abu">{keluar ? t.sisaRentang(rentangTanggal(masuk, keluar, b)) : t.sisaMalam(tanggal(masuk, b))}</span>
                </span>
              </div>
            )}
          </div>
          {/* paying guests, then the children under the free age who stay free */}
          <div className="order-3 grid gap-1 rounded-2xl bg-embun p-2 pr-2.5 xl:order-none xl:gap-2" data-rincian-tamu>
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
        </div>

        <div className="order-5 grid gap-3 sm:grid-cols-2 xl:order-none xl:grid-cols-1">
          {satuMalam && (
            <div className="grid gap-1 rounded-2xl bg-embun px-4 py-3 sm:col-span-2 xl:col-span-1" data-harga-rencana aria-live="polite">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-abu">{t.hargaMalam}</span>
                <span className="whitespace-nowrap font-semibold tabular-nums text-laut" data-harga-malam>{rupiah(satuMalam.biayaKamar, b)}</span>
              </div>
              {ketHarga.map((x) => <p key={x} className="text-xs leading-snug text-abu">{x}</p>)}
              {perahuPilih && (
                <div className="mt-1 flex items-baseline justify-between gap-3" data-harga-perahu>
                  <span className="text-sm text-abu">{pilihBahasa(b, perahuPilih.l.nama, perahuPilih.l.nama_en)}, {t.perahuArah(perahuPilih.kapal, pulangPergi)}</span>
                  <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-laut">{rupiah(perahuPilih.total, b)}</span>
                </div>
              )}
              {semua ? (
                <>
                  <div className="mt-2 flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-laut">{perahuPilih ? t.totalSemua(malam) : t.totalMalam(malam)}</span>
                    <span className="whitespace-nowrap font-judul text-2xl font-semibold tabular-nums text-laut" data-total-rencana>{rupiah(semua.biayaKamar + (perahuPilih?.total ?? 0), b)}</span>
                  </div>
                  <Perkiraan idr={semua.biayaKamar + (perahuPilih?.total ?? 0)} kurs={harga!.kurs} b={b} className="text-right text-abu" />
                </>
              ) : (
                <p className="mt-1 text-xs font-semibold text-biru-tua">{t.pilihUntukTotal}</p>
              )}
            </div>
          )}
          {/* Pay goes straight to payment, DAMPIER's sheet or the booking form.
              Contact us opens WhatsApp, with the chosen stay once it is picked. */}
          <div className={`grid gap-3 sm:col-span-2 xl:col-span-1 ${wa?.tautan ? 'sm:grid-cols-2 xl:grid-cols-1' : ''}`}>
            <button className="tombol min-h-14 w-full" data-bayar>{tombol ?? k.bayarSekarang}</button>
            {wa?.tautan && (
              <a href={tautanHubungi} target="_blank" rel="noopener noreferrer" aria-label={t.waBaru}
                className="tombol tombol-putih min-h-14 w-full" data-cek-wa>
                <Ikon nama="chat" className="size-5" /> {k.hubungiKami}
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
      </div>

    </form>
  );
}
