'use client';
// Room filter on the calendar. Changing it opens the same month for that room.
import { useRouter } from 'next/navigation';

export default function PilihPondok({ kamar, nilai, bulan }: { kamar: { id: number; nama: string }[]; nilai: string; bulan: string }) {
  const router = useRouter();
  return (
    <label className="relative">
      <span className="sr-only">Pondok</span>
      <select value={nilai} onChange={(e) => router.push(`/admin/kalender?bulan=${bulan}${e.target.value ? `&pondok=${e.target.value}` : ''}`)}
        className="isian !h-11 !min-h-0 !w-auto !rounded-full !py-0 font-semibold text-panel-utama">
        <option value="">Semua pondok</option>
        {kamar.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
      </select>
    </label>
  );
}
