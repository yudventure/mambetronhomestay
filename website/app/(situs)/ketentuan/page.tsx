import type { Metadata } from 'next';
import Bagian from '@/components/Bagian';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus } from '@/lib/data';
import { kamus } from '@/lib/kamus';
import { dwi, paragraf } from '@/lib/format';

export async function generateMetadata(): Promise<Metadata> {
  return { title: kamus(await bahasaAktif()).kaki.ketentuan };
}

export default async function Ketentuan() {
  const [b, situs] = await Promise.all([bahasaAktif(), ambilSitus()]);
  const k = kamus(b);
  return (
    <Bagian lebar="max-w-3xl" className="!pt-10 md:!pt-14">
      <p className="label-kecil">{situs.nama}</p>
      <h1 className="mt-2 text-[clamp(2.1rem,1.6rem+2vw,3rem)]">{k.kaki.ketentuan}</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-buih px-5 py-4">
          <p className="text-sm text-abu">{k.checkInOut.masuk}</p>
          <p className="font-judul text-2xl font-semibold text-laut">{situs.checkIn}</p>
        </div>
        <div className="rounded-2xl bg-buih px-5 py-4">
          <p className="text-sm text-abu">{k.checkInOut.keluar}</p>
          <p className="font-judul text-2xl font-semibold text-laut">{situs.checkOut}</p>
        </div>
      </div>
      <div className="prosa mt-8 text-lg">
        {paragraf(dwi(situs.ketentuan, b)).map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <div className="prosa mt-8 rounded-3xl bg-buih p-6 text-laut">
        {paragraf(dwi(situs.catatanBayar, b)).map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </Bagian>
  );
}
