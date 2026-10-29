import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Bagian from '@/components/Bagian';
import Galeri from '@/components/Galeri';
import TeksPanjang from '@/components/TeksPanjang';
import Ikon from '@/components/Ikon';
import CariCepat from '@/components/CariCepat';
import KartuKamar from '@/components/KartuKamar';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus, daftarKamar, gambarCadangan, kamarDariSlug, pemesananAktif, sisaKamar } from '@/lib/data';
import { pastikanSegar } from '@/lib/sinkron';
import { kamus } from '@/lib/kamus';
import { pilih, rupiah, tautanWa } from '@/lib/format';
import { hariIni, tambahHari } from '@/lib/tanggal';
import { KISI, rentang } from '@/lib/kisi';
import Perkiraan from '@/components/Perkiraan';
import { kursAktif } from '@/lib/uang-server';

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const [{ slug }, b] = await Promise.all([params, bahasaAktif()]);
  const km = await kamarDariSlug(slug);
  if (!km) return {};
  return {
    title: pilih(b, km.nama, km.nama_en),
    description: pilih(b, km.ringkas, km.ringkas_en),
    ...(km.foto[0] ? { openGraph: { images: [{ url: km.foto[0].url }] } } : {}),
  };
}

export default async function HalamanPondok({ params }: P) {
  const { slug } = await params;
  const [b, situs, semua, aktif, kurs] = await Promise.all([bahasaAktif(), ambilSitus(), daftarKamar(), pemesananAktif(), kursAktif()]);
  if (aktif) pastikanSegar().catch(() => {});
  const i = semua.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const km = semua[i];
  const k = kamus(b);
  const nama = pilih(b, km.nama, km.nama_en);
  const fasilitas = b === 'en' && km.fasilitas_en.length ? km.fasilitas_en : km.fasilitas;
  const hari = hariIni();
  const awal = tambahHari(hari, situs.jedaHari);
  const akhir = tambahHari(hari, situs.batasHari);
  const sisa = aktif ? ((await sisaKamar([km], hari, tambahHari(akhir, 61)).catch(() => new Map())).get(km.id) ?? {}) : {};
  const lain = semua.filter((x) => x.id !== km.id);
  const wa = tautanWa(situs.whatsapp, `${k.pesanWaUmum} ${nama}`);

  return (
    <>
      <Bagian className="!pt-8 md:!pt-12">
        {/* with one bungalow type Accommodation opens this page, there is no list to go back to */}
        {semua.length > 1 && (
          <Link href="/kamar" className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-biru-tua hover:underline">
            <Ikon nama="kiri" className="size-4" /> {k.semuaPondok}
          </Link>
        )}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
          <Galeri b={b} foto={km.foto} cadangan={gambarCadangan(i)} nama={nama} />
          <div>
            <h1 className="text-[clamp(2.2rem,1.7rem+2vw,3.25rem)]">{nama}</h1>
            <p className="mt-3 text-lg text-abu">{pilih(b, km.ringkas, km.ringkas_en)}</p>
            <ul className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-laut">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-buih px-3 py-1"><Ikon nama="orang" className="size-4" />{k.muat(km.kapasitas)}</li>
              {km.min_malam > 1 && <li className="inline-flex items-center gap-1.5 rounded-full bg-buih px-3 py-1"><Ikon nama="bulan" className="size-4" />{k.minMalam(km.min_malam)}</li>}
              {km.jumlah_unit > 1 && <li className="inline-flex items-center gap-1.5 rounded-full bg-buih px-3 py-1"><Ikon nama="kamar" className="size-4" />{k.unit(km.jumlah_unit)}</li>}
            </ul>
            <div className="mt-6 rounded-3xl bg-buih p-5">
              <p className="text-sm text-abu">{k.mulai}</p>
              <p className="font-judul text-3xl font-semibold text-laut">{rupiah(km.harga, b)}</p>
              <p className="text-sm text-abu">{k.perSkema[km.skema_harga]}</p>
              <Perkiraan idr={km.harga} kurs={kurs} b={b} className="mt-1 text-abu" />
              {km.skema_harga === 'orang' && km.harga_anak != null && km.harga_anak !== km.harga && (
                <p className="mt-2 text-sm font-semibold text-biru-tua">{k.hargaAnak(rupiah(km.harga_anak, b))}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {aktif
                  ? <a href="#rencana" className="tombol"><Ikon nama="kalender" className="size-4" /> {k.pilihTanggal}</a>
                  : <Link href={`/pesan?kamar=${km.slug}`} className="tombol">{k.pesanPondok}</Link>}
                {wa && <a href={wa} target="_blank" rel="noopener" className="tombol tombol-putih"><Ikon nama="chat" /> {k.tanyaWa}</a>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12 md:mt-20">
          <div>
            <h2 className="text-[clamp(1.75rem,1.4rem+1.4vw,2.4rem)]">{k.tentangPondok}</h2>
            <div className="prosa mt-5 text-lg text-laut/85">
              <TeksPanjang teks={pilih(b, km.deskripsi, km.deskripsi_en)} />
            </div>
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl bg-embun p-6 sm:p-7">
              {fasilitas.length > 0 && (
                <>
                  <h2 className="text-2xl">{k.fasilitas}</h2>
                  <ul className="mt-4 grid gap-2.5">
                    {fasilitas.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-biru-tua shadow-tipis"><Ikon nama="centang" className="size-4" tebal={2.4} /></span>
                        <span className="text-laut">{f}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className={`grid grid-cols-2 gap-3 ${fasilitas.length ? 'mt-6' : ''}`}>
                <p className="rounded-2xl bg-white px-4 py-3 text-sm text-abu shadow-tipis">{k.checkInOut.masuk}<span className="mt-0.5 block font-judul text-xl text-laut">{situs.checkIn}</span></p>
                <p className="rounded-2xl bg-white px-4 py-3 text-sm text-abu shadow-tipis">{k.checkInOut.keluar}<span className="mt-0.5 block font-judul text-xl text-laut">{situs.checkOut}</span></p>
              </div>
            </div>
          </aside>
        </div>
      </Bagian>

      {/* the same planner as on the home page, for this bungalow */}
      {aktif && (
        <Bagian latar="buih" id="tanggal">
          <CariCepat b={b} awal={awal} akhir={akhir} checkIn={situs.checkIn} checkOut={situs.checkOut} sisa={sisa} unit={km.jumlah_unit}
            kapasitas={km.kapasitas} minMalam={km.min_malam} maksTamu={Math.min(20, km.kapasitas * km.jumlah_unit)}
            kamar={km.slug} judul={k.pilihTanggal} tombol={k.pesanPondok} />
        </Bagian>
      )}

      {lain.length > 0 && (
        <Bagian latar={aktif ? 'putih' : 'buih'}>
          <h2 className="mb-8 text-3xl">{k.semuaPondok}</h2>
          <div className={`${KISI} gap-6`}>
            {lain.map((x, j) => <KartuKamar key={x.id} kamar={x} b={b} kurs={kurs} i={semua.indexOf(x)} lebar={lain.length === 1} className={rentang(lain.length, j)} />)}
          </div>
        </Bagian>
      )}
    </>
  );
}
