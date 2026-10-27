'use client';
// Booking form with live availability and price.
import Link from 'next/link';
import { useActionState, useEffect, useMemo, useState } from 'react';
import Ikon from './Ikon';
import Kalender from './Kalender';
import { kirimTanpaReset } from '@/lib/kait';
import { kirimPesanan, type HasilKirim } from '@/app/(situs)/pesan/aksi';
import type { Bahasa, Kamar, Layanan } from '@/lib/jenis';
import { KAMUS } from '@/lib/kamus';
import { SATUAN } from '@/lib/satuan.mjs';
import { hitungHarga } from '@/lib/harga';
import { pilih, rentangTanggal, rupiah, tanggal } from '@/lib/format';
import { bacaRencana, simpanRencana } from '@/lib/rencana';
import Perkiraan from './Perkiraan';
import type { Kurs } from '@/lib/uang';
import { daftarMalam, selisihHari } from '@/lib/tanggal';

export type KamarForm = Pick<Kamar, 'id' | 'slug' | 'nama' | 'nama_en' | 'harga' | 'harga_anak' | 'skema_harga' | 'kapasitas' | 'jumlah_unit' | 'min_malam'> & { gambar: string };

type Props = {
  b: Bahasa;
  kamar: KamarForm[];
  layanan: Layanan[];
  sisa: Record<number, Record<string, number>>;
  awal: string;
  akhir: string;
  dpPersen: number;
  aktif: boolean;
  wa: string;
  kurs: Kurs;
  mula: { kamarId: number; masuk: string; keluar: string; dewasa: number; anak: number; jumlahKamar: number };
  // dates that came in the link and could not be kept, null when none came
  ditolak: { masuk: string; keluar: string } | null;
  dariTautan: boolean;
};

function Kotak({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section className="kartu p-5 sm:p-7">
      <h2 className="mb-5 text-2xl">{judul}</h2>
      {children}
    </section>
  );
}

function Hitung({ label, ket, nilai, min, maks, ubah, kurang, tambah }: {
  label: string; ket?: string; nilai: number; min: number; maks: number; ubah: (n: number) => void; kurang: string; tambah: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-buih px-4 py-3">
      <div>
        <p className="font-semibold text-laut">{label}</p>
        {ket && <p className="text-sm text-abu">{ket}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => ubah(Math.max(min, nilai - 1))} disabled={nilai <= min} aria-label={`${kurang} ${label}`}
          className="inline-flex size-10 items-center justify-center rounded-full bg-white text-laut shadow-tipis disabled:opacity-40">
          <Ikon nama="kurang" />
        </button>
        <span className="w-6 text-center font-judul text-xl font-semibold tabular-nums text-laut" aria-live="polite">{nilai}</span>
        <button type="button" onClick={() => ubah(Math.min(maks, nilai + 1))} disabled={nilai >= maks} aria-label={`${tambah} ${label}`}
          className="inline-flex size-10 items-center justify-center rounded-full bg-white text-laut shadow-tipis disabled:opacity-40">
          <Ikon nama="tambah" />
        </button>
      </div>
    </div>
  );
}

export default function FormPesan({ b, kamar, layanan, sisa, awal, akhir, dpPersen, aktif, wa, kurs, mula, ditolak, dariTautan }: Props) {
  const k = KAMUS[b];
  const f = k.form;
  const [hasil, aksi, sedang] = useActionState<HasilKirim, FormData>(kirimPesanan, { galat: '' });

  const [kamarId, setKamarId] = useState(mula.kamarId);
  const [masuk, setMasuk] = useState(mula.masuk);
  const [keluar, setKeluar] = useState(mula.keluar);
  const [jumlahKamar, setJumlahKamar] = useState(mula.jumlahKamar);
  const [dewasa, setDewasa] = useState(mula.dewasa);
  const [anak, setAnak] = useState(mula.anak);
  const [pilihan, setPilihan] = useState<number[]>([]);
  const [data, setData] = useState({ nama: '', telepon: '', email: '', negara: '', kedatangan: '', catatan: '' });
  const [setuju, setSetuju] = useState(false);

  const km = kamar.find((x) => x.id === kamarId) ?? kamar[0];
  const sisaKm = useMemo(() => sisa[km?.id] ?? {}, [sisa, km]);
  // bumped when remembered dates are restored, so the calendar opens on that month
  const [pulih, setPulih] = useState(0);

  // no dates in the link, take the stay picked on the home page or a room page
  useEffect(() => {
    if (dariTautan || mula.masuk || !km) return;
    const r = bacaRencana();
    if (!r || r.masuk < awal || r.masuk > akhir || (sisaKm[r.masuk] ?? km.jumlah_unit) < jumlahKamar) return;
    setMasuk(r.masuk);
    setKeluar(cocok(r.masuk, r.keluar, km.jumlah_unit, jumlahKamar, sisaKm, km.min_malam) ? r.keluar : '');
    const kap = km.kapasitas * jumlahKamar;
    setDewasa(Math.max(1, Math.min(r.tamu, kap)));
    setPulih((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (masuk) simpanRencana({ masuk, keluar, tamu: dewasa + anak });
  }, [masuk, keluar, dewasa, anak]);

  // keep the chosen dates only while every night still fits
  function cocok(masukBaru: string, keluarBaru: string, unit: number, butuh: number, peta: Record<string, number>, minM: number) {
    if (!masukBaru || !keluarBaru) return true;
    if (selisihHari(masukBaru, keluarBaru) < minM) return false;
    return daftarMalam(masukBaru, keluarBaru).every((d) => (peta[d] ?? unit) >= butuh);
  }

  function gantiKamar(id: number) {
    const baru = kamar.find((x) => x.id === id);
    if (!baru) return;
    setKamarId(id);
    const jk = Math.min(jumlahKamar, baru.jumlah_unit);
    setJumlahKamar(jk);
    const kap = baru.kapasitas * jk;
    if (dewasa > kap) setDewasa(kap);
    if (dewasa + anak > kap) setAnak(Math.max(0, kap - Math.min(dewasa, kap)));
    if (!cocok(masuk, keluar, baru.jumlah_unit, jk, sisa[id] ?? {}, baru.min_malam)) setKeluar('');
  }

  function gantiJumlah(n: number) {
    setJumlahKamar(n);
    if (!cocok(masuk, keluar, km.jumlah_unit, n, sisaKm, km.min_malam)) setKeluar('');
  }

  const kapasitas = km ? km.kapasitas * jumlahKamar : 0;
  const malam = masuk && keluar ? selisihHari(masuk, keluar) : 0;
  const terpilih = layanan.filter((l) => pilihan.includes(l.id));
  const harga = km ? hitungHarga(km, { malam, jumlahKamar, dewasa, anak, layanan: terpilih, dpPersen }) : null;
  const siap = aktif && Boolean(km && masuk && keluar && malam > 0);

  if (!km) {
    return <p className="kartu p-6 text-lg">{k.tidakAdaPondok}</p>;
  }

  return (
    <form onSubmit={kirimTanpaReset(aksi)} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8">
      <input type="hidden" name="bahasa" value={b} />
      <input type="hidden" name="kamar" value={km.id} />
      <input type="hidden" name="masuk" value={masuk} />
      <input type="hidden" name="keluar" value={keluar} />
      <input type="hidden" name="jumlahKamar" value={jumlahKamar} />
      <input type="hidden" name="dewasa" value={dewasa} />
      <input type="hidden" name="anak" value={anak} />
      {pilihan.map((id) => <input key={id} type="hidden" name="layanan" value={id} />)}
      <div className="hidden" aria-hidden>
        <label>Situs web<input name="situs_web" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>

      <div className="grid min-w-0 gap-6">
        {!aktif && (
          <div className="flex gap-3 rounded-2xl bg-pasir px-5 py-4 text-laut">
            <Ikon nama="info" className="mt-0.5 size-5 shrink-0" />
            <p>{f.belumAktif} {wa && <a href={wa} target="_blank" rel="noopener" className="font-bold underline underline-offset-4">{k.tanyaWa}</a>}</p>
          </div>
        )}

        <Kotak judul={f.bagianPondok}>
          <fieldset>
            <legend className="sr-only">{f.pondok}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {kamar.map((x, i) => {
                const aktifKm = x.id === km.id;
                return (
                  <label key={x.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition-colors ${aktifKm ? 'bg-buih ring-2 ring-biru' : 'bg-white ring-1 ring-buih-2 hover:bg-buih'} ${kamar.length % 2 === 1 && i === kamar.length - 1 ? 'sm:col-span-2' : ''}`}>
                    <input type="radio" name="pilih_kamar" className="sr-only" checked={aktifKm} onChange={() => gantiKamar(x.id)} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={x.gambar} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                    <span className="min-w-0">
                      <span className="block font-judul text-lg font-semibold leading-tight text-laut">{pilih(b, x.nama, x.nama_en)}</span>
                      <span className="block text-sm text-abu">{rupiah(x.harga, b)} {k.perSkema[x.skema_harga]}</span>
                    </span>
                    {aktifKm && <Ikon nama="centang" className="ml-auto size-6 shrink-0 text-biru-tua" tebal={2.4} />}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6">
            {ditolak && !keluar && (
              <p role="alert" className="mb-4 rounded-2xl bg-[#fde3dc] px-4 py-3 text-sm font-semibold text-merah">
                {f.tanggalDitolak(ditolak.keluar ? rentangTanggal(ditolak.masuk, ditolak.keluar, b) : tanggal(ditolak.masuk, b))}
              </p>
            )}
            <Kalender key={pulih} b={b} sisa={sisaKm} unit={km.jumlah_unit} butuh={jumlahKamar} minMalam={km.min_malam}
              awal={awal} akhir={akhir} masuk={masuk} keluar={keluar}
              onPilih={(a, z) => { setMasuk(a); setKeluar(z); }} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-buih px-4 py-3">
              <p className="text-sm text-abu">{k.tiba}</p>
              <p className="font-semibold text-laut">{masuk ? tanggal(masuk, b, 'hari') : '...'}</p>
            </div>
            <div className="rounded-2xl bg-buih px-4 py-3">
              <p className="text-sm text-abu">{k.pulang}</p>
              <p className="font-semibold text-laut">{keluar ? tanggal(keluar, b, 'hari') : '...'}</p>
            </div>
          </div>
        </Kotak>

        <Kotak judul={f.bagianTamu}>
          <div className="grid gap-3">
            {km.jumlah_unit > 1 && (
              <Hitung label={f.jumlahKamar} ket={k.unit(km.jumlah_unit)} nilai={jumlahKamar} min={1} maks={km.jumlah_unit} ubah={gantiJumlah} kurang={f.kurang} tambah={f.tambah} />
            )}
            <Hitung label={f.dewasa} nilai={dewasa} min={1} maks={Math.max(1, kapasitas - anak)} ubah={setDewasa} kurang={f.kurang} tambah={f.tambah} />
            <Hitung label={f.anak} ket={f.anakKet} nilai={anak} min={0} maks={Math.max(0, kapasitas - dewasa)} ubah={setAnak} kurang={f.kurang} tambah={f.tambah} />
            <p className="text-sm text-abu">{k.muat(kapasitas)}</p>
          </div>
        </Kotak>

        {layanan.length > 0 && (
          <Kotak judul={f.bagianLayanan}>
            <div className="grid gap-3">
              {layanan.map((l) => {
                const on = pilihan.includes(l.id);
                return (
                  <label key={l.id} className={`grid cursor-pointer grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2 rounded-2xl p-4 transition-colors sm:grid-cols-[auto_1fr_auto] ${on ? 'bg-buih ring-2 ring-biru' : 'ring-1 ring-buih-2 hover:bg-buih'}`}>
                    <input type="checkbox" className="mt-1 size-5 shrink-0 accent-[#036f87]" checked={on}
                      onChange={() => setPilihan((p) => (on ? p.filter((x) => x !== l.id) : [...p, l.id]))} />
                    <span className="min-w-0">
                      <span className="block font-semibold text-laut">{pilih(b, l.nama, l.nama_en)}</span>
                      <span className="block text-sm text-abu">{pilih(b, l.keterangan, l.keterangan_en)}</span>
                    </span>
                    <span className="col-start-2 text-sm sm:col-start-3 sm:text-right">
                      <span className="block font-bold text-laut">{rupiah(l.harga, b)}</span>
                      <span className="block text-abu">{SATUAN[l.satuan][b]}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </Kotak>
        )}

        <Kotak judul={f.bagianData}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nama" className="label-isian">{f.nama}</label>
              <input id="nama" name="nama" required autoComplete="name" maxLength={120} className="isian" value={data.nama} onChange={(e) => setData({ ...data, nama: e.target.value })} />
            </div>
            <div>
              <label htmlFor="telepon" className="label-isian">{f.telepon}</label>
              <input id="telepon" name="telepon" type="tel" required autoComplete="tel" inputMode="tel" maxLength={40} className="isian" value={data.telepon} onChange={(e) => setData({ ...data, telepon: e.target.value })} />
              <p className="bantuan">{f.teleponKet}</p>
            </div>
            <div>
              <label htmlFor="email" className="label-isian">{f.email}</label>
              <input id="email" name="email" type="email" autoComplete="email" maxLength={160} className="isian" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
              <p className="bantuan">{f.emailKet}</p>
            </div>
            <div>
              <label htmlFor="negara" className="label-isian">{f.negara}</label>
              <input id="negara" name="negara" autoComplete="country-name" maxLength={80} className="isian" value={data.negara} onChange={(e) => setData({ ...data, negara: e.target.value })} />
            </div>
            <div>
              <label htmlFor="kedatangan" className="label-isian">{f.kedatangan}</label>
              <input id="kedatangan" name="kedatangan" maxLength={200} className="isian" value={data.kedatangan} onChange={(e) => setData({ ...data, kedatangan: e.target.value })} />
              <p className="bantuan">{f.kedatanganKet}</p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="catatan" className="label-isian">{f.catatan}</label>
              <textarea id="catatan" name="catatan" maxLength={2000} className="isian" value={data.catatan} onChange={(e) => setData({ ...data, catatan: e.target.value })} />
              <p className="bantuan">{f.catatanKet}</p>
            </div>
          </div>
        </Kotak>
      </div>

      <aside className="kartu p-5 sm:p-7 lg:sticky lg:top-24">
        <h2 className="text-2xl">{f.ringkasan}</h2>
        <div className="mt-4 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={km.gambar} alt="" className="size-14 rounded-xl object-cover" />
          <div>
            <p className="font-judul text-lg font-semibold leading-tight text-laut">{pilih(b, km.nama, km.nama_en)}</p>
            <p className="text-sm text-abu">{k.hasil.pondokN(jumlahKamar)}, {k.hasil.tamu(dewasa, anak)}</p>
          </div>
        </div>

        {malam > 0 && harga ? (
          <div className="mt-5 grid gap-3 text-[0.9375rem]">
            <div className="flex justify-between gap-3">
              <span>{pilih(b, km.nama, km.nama_en)}<span className="block text-sm text-abu">{f.malam(malam)}</span></span>
              <span className="font-semibold tabular-nums">{rupiah(harga.biayaKamar, b)}</span>
            </div>
            {harga.rincian.map((r) => (
              <div key={r.id} className="flex justify-between gap-3">
                <span>{pilih(b, r.nama, r.nama_en)}<span className="block text-sm text-abu">{f.kali(r.jumlah, rupiah(r.harga, b))}</span></span>
                <span className="font-semibold tabular-nums">{rupiah(r.subtotal, b)}</span>
              </div>
            ))}
            <div className="mt-2 rounded-2xl bg-buih px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-laut">{f.total}</span>
                <span className="font-judul text-2xl font-semibold tabular-nums text-laut">{rupiah(harga.total, b)}</span>
              </div>
              <Perkiraan idr={harga.total} kurs={kurs} b={b} className="text-right text-abu" />
              {harga.dp > 0 && (
                <>
                  <div className="mt-1 flex justify-between gap-3 text-sm">
                    <span>{f.uangMuka(dpPersen)}</span>
                    <span className="font-bold tabular-nums">{rupiah(harga.dp, b)}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm text-abu">
                    <span>{f.sisaTiba}</span>
                    <span className="tabular-nums">{rupiah(harga.total - harga.dp, b)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-buih px-4 py-3 text-sm text-laut">{f.pilihTanggalDulu}</p>
        )}

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-[0.9375rem]">
          <input type="checkbox" name="setuju" value="ya" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} className="mt-1 size-5 shrink-0 accent-[#036f87]" />
          <span>{f.setuju} <Link href="/ketentuan" target="_blank" className="font-semibold text-biru-tua underline underline-offset-4">{f.ketentuan}</Link></span>
        </label>

        {hasil.galat && (
          <p role="alert" className="mt-4 rounded-2xl bg-[#fbe4df] px-4 py-3 text-[0.9375rem] font-semibold text-merah">{hasil.galat}</p>
        )}

        <button type="submit" className="tombol mt-5 w-full" disabled={!siap || sedang}>
          {sedang ? f.mengirim : f.kirim}
        </button>
        {!siap && aktif && <p className="mt-2 text-center text-sm text-abu">{f.pilihTanggalDulu}</p>}
      </aside>
    </form>
  );
}
