import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Bagian from '@/components/Bagian';
import Ikon from '@/components/Ikon';
import Salin from '@/components/Salin';
import BayarOnline from '@/components/BayarOnline';
import { cobaTerakhir, namaMetode, sudahTutup, tagihanOnline } from '@/lib/bayar';
import { bacaKonfigMidtrans } from '@/lib/midtrans';
import { tokenCocok } from '@/lib/pesan';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus, pesananDariKode } from '@/lib/data';
import { dbDiatur } from '@/lib/env';
import { kamus } from '@/lib/kamus';
import { dwi, paragraf, rupiah, tanggal, tautanWa } from '@/lib/format';
import Perkiraan from '@/components/Perkiraan';
import { kursAktif } from '@/lib/uang-server';
import { SATUAN } from '@/lib/satuan.mjs';
import type { StatusPesanan } from '@/lib/jenis';
import { KISI2, rentang2 } from '@/lib/kisi';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const WARNA: Record<StatusPesanan, string> = {
  menunggu: 'bg-pasir text-laut',
  dikonfirmasi: 'bg-buih-2 text-biru-tua',
  lunas: 'bg-biru-tua text-white',
  selesai: 'bg-laut text-white',
  batal: 'bg-[#fbe4df] text-merah',
};

export default async function HalamanPesanan({ params, searchParams }: {
  params: Promise<{ kode: string }>; searchParams: Promise<{ t?: string }>;
}) {
  const [{ kode }, { t }] = await Promise.all([params, searchParams]);
  if (!dbDiatur() || !t) notFound();
  const p = await pesananDariKode(kode).catch(() => null);
  if (!p || !tokenCocok(String(t), p.token)) notFound();

  const [b, situs, kurs, midtrans] = await Promise.all([bahasaAktif(), ambilSitus(), kursAktif(), bacaKonfigMidtrans().catch(() => null)]);
  const k = kamus(b);
  const h = k.hasil;
  const sisa = Math.max(0, p.total - p.dibayar);
  const waBukti = tautanWa(situs.whatsapp, h.pesanWa(p.kode));
  const waTanya = tautanWa(situs.whatsapp, h.pesanWaTanya(p.kode));
  const perluBayar = p.status === 'menunggu' && p.dp > 0;
  // accounts with a number only, a half filled row in the panel is not shown
  const rekening = situs.bank.filter((r) => r.nomor.trim());
  // Midtrans, when its keys are set and switched on in the panel
  const online = midtrans?.tampil && tagihanOnline(p) > 0;
  const terakhir = cobaTerakhir(p.bayar_online);
  const belum = !!terakhir && !terakhir.masuk && !sudahTutup(terakhir.status);
  const menunggu = belum && terakhir.status === 'pending' ? h.menungguLewat(namaMetode(terakhir.metode, terakhir.saluran, b)) : '';
  const lewat = (p.bayar_online?.coba ?? []).filter((c) => c.masuk).map((c) => namaMetode(c.metode, c.saluran, b));

  return (
    <Bagian latar="buih" lebar="max-w-4xl" className="!pt-10 md:!pt-14">
      <div className="kartu overflow-hidden">
        <div className="flex flex-col items-start gap-5 bg-laut px-5 py-7 text-white sm:flex-row sm:items-center sm:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merek/simbol-putih.svg" alt="" aria-hidden width={160} height={110} className="h-20 w-auto shrink-0" />
          <div className="min-w-0">
            <h1 className="text-3xl !text-white">{h.judul}</h1>
            <p className="mt-2 text-white/85">
              {p.status === 'menunggu' ? dwi(situs.pesanTerima, b) : p.status === 'batal' ? h.batal : p.status === 'lunas' || p.status === 'selesai' ? h.lunas : h.dikonfirmasi}
            </p>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:px-8">
          <div>
            <p className="text-sm text-abu">{h.kode}</p>
            <p className="font-judul text-3xl font-semibold tracking-wide text-laut">{p.kode}</p>
          </div>
          <span className={`justify-self-start rounded-full px-4 py-1.5 text-sm font-bold sm:justify-self-end ${WARNA[p.status]}`}>{k.status[p.status]}</span>
          <p className="text-sm text-abu sm:col-span-2">{h.simpan}</p>
        </div>

        {perluBayar && (
          <div className="bg-buih px-5 py-6 sm:px-8">
            <h2 className="text-2xl">{p.dp >= p.total ? h.totalBayar : k.form.uangMuka(situs.dpPersen)}</h2>
            <p className="mt-1 font-judul text-3xl font-semibold text-laut">{rupiah(p.dp, b)}</p>
            <Perkiraan idr={p.dp} kurs={kurs} b={b} className="text-abu" />
            {online && (
              <BayarOnline kode={p.kode} t={String(t)} status={p.status} menunggu={menunggu} periksa={belum}
                teks={{ tombol: h.bayarOnline, lanjut: h.lanjutBayar, ket: h.bayarOnlineKet, membuka: h.membuka, memeriksa: h.memeriksa, gagal: h.bayarGagal }} />
            )}
            {rekening.length > 0 ? (
              <>
                <p className={online ? 'mt-7 font-semibold text-laut' : 'mt-4'}>{online ? h.atauTransfer : h.transfer}</p>
                <div className={`mt-3 gap-3 ${KISI2}`}>
                  {rekening.map((r, i) => {
                    // the bank code for transfers from abroad, when the panel has one
                    const swift = (r.swift ?? '').replace(/\s/g, '').toUpperCase();
                    return (
                      <div key={i} className={`rounded-2xl bg-white p-4 shadow-tipis ${rentang2(rekening.length, i)}`}>
                        <p className="text-sm font-bold text-biru-tua">{r.bank}</p>
                        <p className="mt-1 font-judul text-2xl font-semibold tracking-wide text-laut">{r.nomor}</p>
                        <p className="text-sm text-abu">{h.atasNama(r.atasNama)}</p>
                        {swift && <p className="mt-2 text-sm text-abu">{h.swift} <span className="font-semibold tracking-wider text-laut">{swift}</span></p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Salin teks={r.nomor.replace(/\s/g, '')} label={swift ? h.salinNomor : h.salin} sudah={h.tersalin} />
                          {swift && <Salin teks={swift} label={h.salinSwift} sudah={h.tersalin} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : !online && (
              <p className="mt-4">{h.rekeningNanti}</p>
            )}
            {/* the transfer note and the receipt button belong to the manual transfer */}
            {(rekening.length > 0 || !online) && (
              <>
                <div className="prosa mt-4 text-[0.9375rem] text-laut">
                  {paragraf(dwi(situs.catatanBayar, b)).map((x, i) => <p key={i}>{x}</p>)}
                </div>
                {waBukti && (
                  <a href={waBukti} target="_blank" rel="noopener" className={`tombol mt-5 ${online ? 'tombol-putih' : ''}`}>
                    <Ikon nama="chat" /> {h.kirimBukti}
                  </a>
                )}
              </>
            )}
          </div>
        )}

        <div className="px-5 py-6 sm:px-8">
          <h2 className="text-2xl">{h.rincian}</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-buih px-4 py-3">
              <dt className="text-sm text-abu">{k.tiba}</dt>
              <dd className="font-semibold text-laut">{tanggal(p.check_in, b, 'panjang')}</dd>
              <dd className="text-sm text-abu">{k.checkInOut.masuk} {situs.checkIn}</dd>
            </div>
            <div className="rounded-2xl bg-buih px-4 py-3">
              <dt className="text-sm text-abu">{k.pulang}</dt>
              <dd className="font-semibold text-laut">{tanggal(p.check_out, b, 'panjang')}</dd>
              <dd className="text-sm text-abu">{k.checkInOut.keluar} {situs.checkOut}</dd>
            </div>
            <div className="rounded-2xl bg-buih px-4 py-3">
              <dt className="text-sm text-abu">{k.form.pondok}</dt>
              <dd className="font-semibold text-laut">{p.kamar_nama}</dd>
              <dd className="text-sm text-abu">{h.pondokN(p.jumlah_kamar)}, {k.form.malam(p.malam)}</dd>
            </div>
            <div className="rounded-2xl bg-buih px-4 py-3">
              <dt className="text-sm text-abu">{h.pemesan}</dt>
              <dd className="font-semibold text-laut">{p.nama}</dd>
              <dd className="text-sm text-abu">{h.tamu(p.dewasa, p.anak)}</dd>
            </div>
            {p.paket && (
              <div className="rounded-2xl bg-buih px-4 py-3 sm:col-span-2">
                <dt className="text-sm text-abu">{h.paket}</dt>
                <dd className="font-semibold text-laut">{dwi(p.paket.nama, b)}</dd>
                {dwi(p.paket.syarat, b) && <dd className="text-sm text-abu">{dwi(p.paket.syarat, b)}</dd>}
              </div>
            )}
          </dl>

          <div className="mt-6 grid gap-3 text-[0.9375rem]">
            <div className="flex justify-between gap-3">
              <span>{p.kamar_nama}<span className="block text-sm text-abu">{k.form.malam(p.malam)}{p.paket ? `, ${dwi(p.paket.nama, b)}` : ''}</span></span>
              <span className="font-semibold tabular-nums">{rupiah(p.biaya_kamar, b)}</span>
            </div>
            {p.rincian.map((r) => (
              <div key={r.id} className="flex justify-between gap-3">
                <span>{b === 'en' && r.nama_en ? r.nama_en : r.nama}<span className="block text-sm text-abu">{k.form.kali(r.jumlah, rupiah(r.harga, b))}, {SATUAN[r.satuan][b]}</span></span>
                <span className="font-semibold tabular-nums">{rupiah(r.subtotal, b)}</span>
              </div>
            ))}
            <div className="mt-2 rounded-2xl bg-buih px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-laut">{k.form.total}</span>
                <span className="font-judul text-2xl font-semibold tabular-nums text-laut">{rupiah(p.total, b)}</span>
              </div>
              <Perkiraan idr={p.total} kurs={kurs} b={b} className="text-right text-abu" />
              {p.dibayar > 0 && (
                <div className="mt-1 flex justify-between gap-3 text-sm">
                  <span>{h.dibayar}{lewat.length > 0 && <span className="block text-abu">{h.dibayarLewat(lewat.join(', '))}</span>}</span><span className="font-bold tabular-nums">{rupiah(p.dibayar, b)}</span>
                </div>
              )}
              {p.status !== 'batal' && (
                <div className="flex justify-between gap-3 text-sm text-abu">
                  <span>{h.sisa}</span><span className="tabular-nums">{rupiah(sisa, b)}</span>
                </div>
              )}
            </div>
          </div>

          {waTanya && (
            <a href={waTanya} target="_blank" rel="noopener" className="tombol tombol-putih mt-6">
              <Ikon nama="chat" /> {h.hubungiWa}
            </a>
          )}
        </div>
      </div>
    </Bagian>
  );
}
