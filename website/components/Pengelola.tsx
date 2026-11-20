// "Managed by thedampier.com" beside the booking and payment buttons, with
// the homestay owner's approval, so guests see who runs bookings here. The
// same line closes the footer (Kaki.tsx) and the e-mails.
import type { DataPengelola } from '@/lib/format';

export default function Pengelola({ p, className = '' }: { p: DataPengelola | null | undefined; className?: string }) {
  if (!p) return null;
  return (
    <p className={`text-abu ${className}`}>
      {p.teks}{' '}
      <a href={p.href} target="_blank" rel="noopener" className="font-semibold text-biru-tua underline-offset-4 hover:underline">{p.nama}</a>
    </p>
  );
}
