import { IKON } from '@/lib/ikon';

export default function Ikon({ nama, className = 'size-5', tebal = 1.8, label }: { nama: string; className?: string; tebal?: number; label?: string }) {
  const d = IKON[nama] ?? IKON.bintang;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={tebal} strokeLinecap="round" strokeLinejoin="round" aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label}>
      <path d={d} />
    </svg>
  );
}
