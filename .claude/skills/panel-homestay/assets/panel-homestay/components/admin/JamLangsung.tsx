'use client';
// Live clock in Raja Ampat time for the greeting card.
import { useEffect, useState } from 'react';
import { ZONA } from '@/lib/tanggal';

const jam = (d: Date) => new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: ZONA }).format(d).replace(/:/g, '.');
const hari = (d: Date) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA }).format(d);

export default function JamLangsung({ awal }: { awal: number }) {
  const [kini, setKini] = useState(() => new Date(awal));
  useEffect(() => {
    const t = setInterval(() => setKini(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="sm:text-right">
      <p suppressHydrationWarning className="text-4xl leading-none font-bold text-white tabular-nums sm:text-5xl">{jam(kini)}</p>
      <p suppressHydrationWarning className="mt-2 text-sm text-white/70">{hari(kini)} · WIT</p>
    </div>
  );
}
