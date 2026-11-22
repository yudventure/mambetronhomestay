import type { Metadata } from 'next';
import HalamanKebijakan from '@/components/HalamanKebijakan';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus } from '@/lib/data';
import { kamus } from '@/lib/kamus';

export async function generateMetadata(): Promise<Metadata> {
  return { title: kamus(await bahasaAktif()).kaki.privasi, alternates: { canonical: '/kebijakan-privasi' } };
}

export default async function Halaman() {
  const [b, situs] = await Promise.all([bahasaAktif(), ambilSitus()]);
  return <HalamanKebijakan jenis="privasi" b={b} situs={situs} />;
}
