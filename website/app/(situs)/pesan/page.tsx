import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Bagian from '@/components/Bagian';
import FormPesan, { type KamarForm } from '@/components/FormPesan';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus, daftarKamar, daftarLayanan, gambarCadangan, pemesananAktif, sisaKamar } from '@/lib/data';
import { pastikanSegar } from '@/lib/sinkron';
import { lembarDampierSitus } from '@/lib/dampier';
import { asalHalaman } from '@/lib/asal';
import { daftarPaket } from '@/lib/paket';
import { pondokUntuk } from '@/lib/harga';
import { kamus } from '@/lib/kamus';
import { dataPengelola, tautanWa } from '@/lib/format';
import { kursAktif } from '@/lib/uang-server';
import { daftarMalam, hariIni, sahTanggal, selisihHari, tambahHari } from '@/lib/tanggal';

export async function generateMetadata(): Promise<Metadata> {
  return { title: kamus(await bahasaAktif()).form.judul };
}

const angka = (v: unknown, min: number, maks: number, cadangan: number) => {
  const n = Number.parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? Math.min(maks, Math.max(min, n)) : cadangan;
};

export default async function Pesan({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  // While DAMPIER takes the bookings, its payment sheet opens over the
  // bungalow page (LembarDampier), with the dates when the link had them.
  const dampier = await lembarDampierSitus(await asalHalaman());
  if (dampier && (sp.kamar ? sp.kamar === dampier.kamar : dampier.satu)) {
    const q = new URLSearchParams();
    if (sahTanggal(sp.masuk) && sahTanggal(sp.keluar) && sp.keluar > sp.masuk) {
      q.set('dampier_tiba', sp.masuk);
      q.set('dampier_pulang', sp.keluar);
      q.set('dampier_tamu', String(angka(sp.tamu, 1, 20, 2)));
      if (angka(sp.anak, 0, 8, 0)) q.set('dampier_anak', String(angka(sp.anak, 0, 8, 0)));
      if (angka(sp.pondok, 0, 20, 0) > 1) q.set('dampier_pondok', String(angka(sp.pondok, 0, 20, 0)));
      const perahu = sp.layanan ? (await daftarLayanan()).find((l) => String(l.id) === sp.layanan && l.satuan === 'perahu') : undefined;
      if (perahu) q.set('dampier_tambahan', perahu.nama);
    }
    redirect(`/kamar/${dampier.kamar}${q.size ? `?${q}` : ''}#rencana`);
  }
  const [b, situs, kamar, layanan, aktif] = await Promise.all([bahasaAktif(), ambilSitus(), daftarKamar(), daftarLayanan(), pemesananAktif()]);
  const k = kamus(b);
  const hari = hariIni();
  const awal = tambahHari(hari, situs.jedaHari);
  const akhir = tambahHari(hari, situs.batasHari);

  if (aktif) await pastikanSegar(2500).catch(() => {});
  const peta = aktif ? await sisaKamar(kamar, hari, tambahHari(akhir, 61)).catch(() => new Map()) : new Map();
  const sisa: Record<number, Record<string, number>> = Object.fromEntries(peta);

  const km = kamar.find((x) => x.slug === sp.kamar) ?? kamar[0];
  let masuk = sahTanggal(sp.masuk) && sp.masuk >= awal && sp.masuk <= akhir ? sp.masuk : '';
  let keluar = masuk && sahTanggal(sp.keluar) && sp.keluar > masuk ? sp.keluar : '';
  const tamu = angka(sp.tamu, 1, 20, 2);
  const anakTautan = angka(sp.anak, 0, 8, 0);
  // without a bungalow count, enough bungalows for the guests from the home page
  const cukup = km ? Math.min(km.jumlah_unit, pondokUntuk(tamu, anakTautan, km.kapasitas, situs.anakPerPondok)) : 1;
  const jumlahKamar = !km ? 1 : sp.pondok ? Math.max(cukup, angka(sp.pondok, 1, km.jumlah_unit, 1)) : cukup;
  const kap = km ? km.kapasitas * jumlahKamar : 2;
  if (km && masuk && keluar) {
    const p = sisa[km.id] ?? {};
    const muat = selisihHari(masuk, keluar) >= km.min_malam && daftarMalam(masuk, keluar).every((d) => (p[d] ?? km.jumlah_unit) >= jumlahKamar);
    if (!muat) keluar = '';
  }
  if (km && masuk && (sisa[km.id]?.[masuk] ?? km.jumlah_unit) < jumlahKamar) masuk = keluar = '';
  // dates from the home page that cannot be kept get a notice instead of vanishing
  const dariTautan = sahTanggal(sp.masuk);
  const ditolak = dariTautan && (!masuk || (sahTanggal(sp.keluar) && !keluar))
    ? { masuk: sp.masuk as string, keluar: sahTanggal(sp.keluar) && sp.keluar > (sp.masuk as string) ? sp.keluar : '' }
    : null;

  const daftar: KamarForm[] = kamar.map((x, i) => ({
    id: x.id, slug: x.slug, nama: x.nama, nama_en: x.nama_en, harga: x.harga, harga_anak: x.harga_anak, skema_harga: x.skema_harga, harga_sendiri: x.harga_sendiri, harga_tambah: x.harga_tambah,
    kapasitas: x.kapasitas, jumlah_unit: x.jumlah_unit, min_malam: x.min_malam, gambar: x.foto[0]?.url ?? gambarCadangan(i),
  }));

  return (
    <Bagian latar="buih" className="!pt-10 md:!pt-14">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="label-kecil">{situs.nama}</p>
          <h1 className="mt-2 text-[clamp(2.1rem,1.6rem+2vw,3rem)]">{k.form.judul}</h1>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/merek/simbol.svg" alt="" aria-hidden width={160} height={110} className="hidden h-24 w-auto sm:block" />
      </div>
      <FormPesan
        b={b}
        kurs={await kursAktif()}
        kamar={daftar}
        layanan={layanan}
        sisa={sisa}
        awal={awal}
        akhir={akhir}
        dpPersen={situs.dpPersen}
        paket={daftarPaket(situs)}
        aktif={aktif}
        wa={tautanWa(situs.whatsapp, k.pesanWaUmum)}
        mula={{ kamarId: km?.id ?? 0, masuk, keluar, dewasa: Math.min(tamu, kap), anak: Math.min(anakTautan, situs.anakPerPondok * jumlahKamar), jumlahKamar, layanan: layanan.filter((l) => String(l.id) === sp.layanan).map((l) => l.id) }}
        ditolak={ditolak}
        dariTautan={dariTautan}
        pengelola={dataPengelola(situs, b)}
        usiaGratis={situs.usiaGratis}
        anakPerPondok={situs.anakPerPondok}
      />
    </Bagian>
  );
}
