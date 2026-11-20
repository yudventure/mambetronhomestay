import HalamanTutup from '@/components/HalamanTutup';
import KerangkaSitus from '@/components/KerangkaSitus';
import LembarDampier from '@/components/LembarDampier';
import { asalHalaman } from '@/lib/asal';
import { bahasaAktif } from '@/lib/bahasa';
import { catatAsalSitus, lembarDampierSitus } from '@/lib/dampier';
import { ambilSitus, fotoSitus } from '@/lib/data';
import { sesiSah } from '@/lib/sesi';

// While developer mode is on, visitors get the closed page instead of any
// page in this group. A signed in admin still sees the real site.
export default async function SitusLayout({ children }: { children: React.ReactNode }) {
  const asal = await asalHalaman();
  // DAMPIER lets its payment sheet open only on the address it was told.
  // Until the panel or SITE_URL names one, the first address visitors use.
  await catatAsalSitus(asal).catch(() => {});
  const [b, situs, admin, dampier] = await Promise.all([bahasaAktif(), ambilSitus(), sesiSah(), lembarDampierSitus(asal)]);
  if (situs.tutup && !admin) {
    const foto = await fotoSitus();
    return <HalamanTutup b={b} situs={situs} foto={foto.beranda[0]} fotoHp={foto.berandaHp[0]} />;
  }
  return (
    <KerangkaSitus b={b} situs={situs} admin={admin}>
      {children}
      {dampier && <LembarDampier b={b} d={dampier} />}
    </KerangkaSitus>
  );
}
