import type { Metadata } from 'next';
import Bagian from '@/components/Bagian';
import FormCek from '@/components/FormCek';
import { bahasaAktif } from '@/lib/bahasa';
import { kamus } from '@/lib/kamus';

export async function generateMetadata(): Promise<Metadata> {
  return { title: kamus(await bahasaAktif()).cek.judul, robots: { index: false } };
}

export default async function CekPesanan() {
  const b = await bahasaAktif();
  const k = kamus(b).cek;
  return (
    <Bagian latar="buih" lebar="max-w-xl" className="!pt-10 md:!pt-14">
      <div className="kartu p-6 sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/merek/wajah-kedip.svg" alt="" aria-hidden width={110} height={90} className="h-20 w-auto" />
        <h1 className="mt-4 text-3xl">{k.judul}</h1>
        <p className="mt-2 text-abu">{k.teks}</p>
        <div className="mt-6"><FormCek b={b} /></div>
      </div>
    </Bagian>
  );
}
