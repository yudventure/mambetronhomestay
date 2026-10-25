'use client';
// Availability on the room page. Picking dates leads to the booking form.
import Link from 'next/link';
import { useState } from 'react';
import Kalender from './Kalender';
import type { Bahasa } from '@/lib/jenis';
import { KAMUS } from '@/lib/kamus';

export default function KalenderKamar({ b, slug, sisa, unit, minMalam, awal, akhir }: {
  b: Bahasa; slug: string; sisa: Record<string, number>; unit: number; minMalam: number; awal: string; akhir: string;
}) {
  const [masuk, setMasuk] = useState('');
  const [keluar, setKeluar] = useState('');
  const k = KAMUS[b];
  const tujuan = `/pesan?kamar=${slug}${masuk && keluar ? `&masuk=${masuk}&keluar=${keluar}` : ''}`;
  return (
    <div>
      <Kalender b={b} sisa={sisa} unit={unit} butuh={1} minMalam={minMalam} awal={awal} akhir={akhir} masuk={masuk} keluar={keluar}
        onPilih={(a, z) => { setMasuk(a); setKeluar(z); }} />
      <Link href={tujuan} className="tombol mt-6 w-full sm:w-auto">{k.pesanPondok}</Link>
    </div>
  );
}
