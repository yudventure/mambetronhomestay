import Kepala from '@/components/Kepala';
import Kaki from '@/components/Kaki';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus } from '@/lib/data';

export default async function SitusLayout({ children }: { children: React.ReactNode }) {
  const [b, situs] = await Promise.all([bahasaAktif(), ambilSitus()]);
  return (
    <>
      <Kepala b={b} situs={situs} />
      <main id="isi">{children}</main>
      <Kaki b={b} situs={situs} />
    </>
  );
}
