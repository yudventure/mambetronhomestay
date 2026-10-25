import Link from 'next/link';
import { bahasaAktif } from '@/lib/bahasa';
import { kamus } from '@/lib/kamus';

export default async function TidakDitemukan() {
  const k = kamus(await bahasaAktif()).tidakDitemukan;
  return (
    <main className="flex min-h-svh items-center justify-center bg-buih px-4 py-16">
      <div className="max-w-md text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/merek/wajah-kaget.svg" alt="" aria-hidden width={180} height={146} className="mx-auto h-36 w-auto" />
        <h1 className="mt-6 text-4xl">{k.judul}</h1>
        <p className="mt-3 text-lg text-abu">{k.teks}</p>
        <Link href="/" className="tombol mt-8">{k.kembali}</Link>
      </div>
    </main>
  );
}
