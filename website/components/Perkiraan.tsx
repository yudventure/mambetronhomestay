import type { Bahasa } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { perkiraan, type Kurs } from '@/lib/uang';

// Small line under a rupiah price with what it comes to in other currencies.
export default function Perkiraan({ idr, kurs, b, className = 'text-abu' }: { idr: number; kurs: Kurs; b: Bahasa; className?: string }) {
  const teks = idr > 0 ? perkiraan(idr, kurs, b) : '';
  if (!teks) return null;
  return (
    <p className={`text-xs leading-snug tabular-nums ${className}`} title={kamus(b).perkiraanKet}>
      <span aria-hidden>≈ </span><span className="sr-only">{kamus(b).perkiraanKet} </span>{teks}
    </p>
  );
}
