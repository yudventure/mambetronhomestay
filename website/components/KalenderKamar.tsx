'use client';
// Availability on the room page. Picking dates leads to the booking form.
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import Kalender from './Kalender';
import type { Bahasa } from '@/lib/jenis';
import { KAMUS } from '@/lib/kamus';
import { bacaRencana, simpanRencana } from '@/lib/rencana';
import { daftarMalam, selisihHari } from '@/lib/tanggal';

export default function KalenderKamar({ b, slug, sisa, unit, minMalam, awal, akhir, tombol, catatan }: {
  b: Bahasa; slug: string; sisa: Record<string, number>; unit: number; minMalam: number; awal: string; akhir: string;
  // button words and a line under the button while bookings go through DAMPIER
  tombol?: string; catatan?: ReactNode;
}) {
  const [masuk, setMasuk] = useState('');
  const [keluar, setKeluar] = useState('');
  const [pulih, setPulih] = useState(0);
  const k = KAMUS[b];

  // show the stay picked on the home page when those nights are still free
  useEffect(() => {
    const r = bacaRencana();
    if (!r || r.masuk < awal || r.masuk > akhir || (sisa[r.masuk] ?? unit) < 1) return;
    const muat = r.keluar && selisihHari(r.masuk, r.keluar) >= minMalam && daftarMalam(r.masuk, r.keluar).every((d) => (sisa[d] ?? unit) >= 1);
    setMasuk(r.masuk);
    setKeluar(muat ? r.keluar : '');
    setPulih((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const tujuan = `/pesan?kamar=${slug}${masuk && keluar ? `&masuk=${masuk}&keluar=${keluar}` : ''}`;
  return (
    <div>
      <Kalender key={pulih} b={b} sisa={sisa} unit={unit} butuh={1} minMalam={minMalam} awal={awal} akhir={akhir} masuk={masuk} keluar={keluar}
        onPilih={(a, z) => { setMasuk(a); setKeluar(z); simpanRencana({ masuk: a, keluar: z }); }} />
      <Link href={tujuan} className="tombol mt-6 w-full sm:w-auto">{tombol || k.pesanPondok}</Link>
      {catatan && <div className="mt-3">{catatan}</div>}
    </div>
  );
}
