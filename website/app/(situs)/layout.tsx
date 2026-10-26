import HalamanTutup from '@/components/HalamanTutup';
import KerangkaSitus from '@/components/KerangkaSitus';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus, fotoSitus } from '@/lib/data';
import { sesiSah } from '@/lib/sesi';

// While developer mode is on, visitors get the closed page instead of any
// page in this group. A signed in admin still sees the real site.
export default async function SitusLayout({ children }: { children: React.ReactNode }) {
  const [b, situs, admin] = await Promise.all([bahasaAktif(), ambilSitus(), sesiSah()]);
  if (situs.tutup && !admin) {
    const foto = await fotoSitus();
    return <HalamanTutup b={b} situs={situs} foto={foto.beranda[0]} fotoHp={foto.berandaHp[0]} />;
  }
  return <KerangkaSitus b={b} situs={situs} admin={admin}>{children}</KerangkaSitus>;
}
