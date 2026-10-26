import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Bagian from '@/components/Bagian';
import Galeri from '@/components/Galeri';
import Ikon from '@/components/Ikon';
import KalenderKamar from '@/components/KalenderKamar';
import KartuKamar from '@/components/KartuKamar';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus, daftarKamar, gambarCadangan, kamarDariSlug, pemesananAktif, sisaKamar } from '@/lib/data';
import { kamus } from '@/lib/kamus';
import { paragraf, pilih, rupiah, tautanWa } from '@/lib/format';
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
        <Link href="/kamar" className="inline-flex items-center gap-1 text-sm font-semibold text-biru-tua hover:underline">
          <Ikon nama="kiri" className="size-4" /> {k.semuaPondok}
        </Link>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
          <Galeri foto={km.foto} cadangan={gambarCadangan(i)} nama={nama} />
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
                <Link href={`/pesan?kamar=${km.slug}`} className="tombol">{k.pesanPondok}</Link>
                {wa && <a href={wa} target="_blank" rel="noopener" className="tombol tombol-putih"><Ikon nama="chat" /> {k.tanyaWa}</a>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
          <div className="prosa text-lg">
            {paragraf(pilih(b, km.deskripsi, km.deskripsi_en)).map((p, j) => <p key={j}>{p}</p>)}
          </div>
          {fasilitas.length > 0 && (
            <div>
              <h2 className="text-2xl">{k.fasilitas}</h2>
              <ul className="mt-4 grid gap-2">
                {fasilitas.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-buih text-biru-tua"><Ikon nama="centang" className="size-4" tebal={2.4} /></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Bagian>

      {aktif && (
        <Bagian latar="buih" id="tanggal">
          <div className="kartu p-5 sm:p-8">
            <h2 className="mb-6 text-3xl">{k.kalender.judul}</h2>
            <KalenderKamar b={b} slug={km.slug} sisa={sisa} unit={km.jumlah_unit} minMalam={km.min_malam} awal={awal} akhir={akhir} />
          </div>
        </Bagian>
      )}

      {lain.length > 0 && (
        <Bagian latar={aktif ? 'putih' : 'buih'}>
          <h2 className="mb-8 text-3xl">{k.semuaPondok}</h2>
          <div className={`${KISI} gap-6`}>
            {lain.map((x, j) => <KartuKamar key={x.id} kamar={x} b={b} kurs={kurs} i={semua.indexOf(x)} className={rentang(lain.length, j)} />)}
          </div>
        </Bagian>
      )}
    </>
  );
}
