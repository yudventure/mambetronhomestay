import KerangkaSitus from '@/components/KerangkaSitus';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus } from '@/lib/data';
import { sesiSah } from '@/lib/sesi';

// Pages for guests who already booked. They stay open in developer mode so
// a guest can still see the bank details and the status of a booking.
export default async function TamuLayout({ children }: { children: React.ReactNode }) {
  const [b, situs, admin] = await Promise.all([bahasaAktif(), ambilSitus(), sesiSah()]);
  return <KerangkaSitus b={b} situs={situs} admin={admin}>{children}</KerangkaSitus>;
}
