import type { Pesanan, StatusPesanan } from '@/lib/jenis';
import { KAMUS } from '@/lib/kamus';

export const WARNA_STATUS: Record<StatusPesanan, string> = {
  menunggu: 'bg-pasir text-laut',
  dikonfirmasi: 'bg-buih-2 text-biru-tua',
  lunas: 'bg-biru-tua text-white',
  selesai: 'bg-laut text-white',
  batal: 'bg-[#fbe4df] text-merah',
};

export function LencanaStatus({ status }: { status: StatusPesanan }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${WARNA_STATUS[status]}`}>{KAMUS.id.status[status]}</span>;
}
