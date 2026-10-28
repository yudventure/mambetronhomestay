// A chosen date as a small tear-off calendar leaf, the weekday over the day
// number, beside its label and the month. Without a date the leaf holds a
// calendar icon and the line says what to do.
import Ikon from './Ikon';
import type { Bahasa } from '@/lib/jenis';
import { bulanTahun, tanggal } from '@/lib/format';

export default function KotakTanggal({ b, label, d, catatan, kosong = '' }: { b: Bahasa; label: string; d: string; catatan?: string; kosong?: string }) {
  if (!d) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-buih p-2.5 pr-4">
        <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white text-biru-tua shadow-tipis">
          <Ikon nama="kalender" className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-abu">{label}</span>
          <span className="block font-semibold text-abu/80">{kosong}</span>
        </span>
      </div>
    );
  }
  const hari = new Intl.DateTimeFormat(b === 'en' ? 'en-GB' : 'id-ID', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`)).replace('.', '');
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-buih p-2.5 pr-4">
      <span aria-hidden className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-laut shadow-tipis">
        <span className="text-[0.625rem] font-bold uppercase leading-none tracking-wider text-biru-tua">{hari}</span>
        <span className="mt-1 font-judul text-2xl font-bold leading-none tabular-nums">{Number(d.slice(8))}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-sm text-abu">{label}</span>
          {catatan && <span className="text-xs font-bold text-biru-tua">{catatan}</span>}
        </span>
        <span aria-hidden className="block text-lg font-semibold text-laut">{bulanTahun(d, b)}</span>
        <span className="sr-only">{tanggal(d, b, 'panjang')}</span>
      </span>
    </div>
  );
}
