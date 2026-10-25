import Link from 'next/link';
import type { Pesanan, StatusPesanan } from '@/lib/jenis';
import { rupiah, tanggal } from '@/lib/format';
import { KAMUS } from '@/lib/kamus';

export const WARNA_STATUS: Record<StatusPesanan, string> = {
  menunggu: 'bg-pasir text-laut',
  dikonfirmasi: 'bg-buih-2 text-toska-tua',
  lunas: 'bg-toska-tua text-white',
  selesai: 'bg-laut text-white',
  batal: 'bg-[#fbe4df] text-merah',
};

export function LencanaStatus({ status }: { status: StatusPesanan }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${WARNA_STATUS[status]}`}>{KAMUS.id.status[status]}</span>;
}

// One booking as a card row. Rows are spaced apart, never ruled.
export default function BarisPesanan({ p }: { p: Pesanan }) {
  return (
    <Link href={`/admin/pesanan/${p.id}`} className="block rounded-2xl bg-white px-4 py-3 shadow-tipis transition-shadow hover:shadow-lembut">
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-judul text-lg font-semibold tracking-wide text-laut">{p.kode}</span>
        <LencanaStatus status={p.status} />
        <span className="ml-auto text-sm font-semibold tabular-nums text-laut">{rupiah(p.total)}</span>
      </span>
      <span className="mt-1 block truncate font-semibold">{p.nama}</span>
      <span className="block text-sm text-abu">
        {p.kamar_nama}{p.jumlah_kamar > 1 ? ` ×${p.jumlah_kamar}` : ''}, {tanggal(p.check_in, 'id')} sampai {tanggal(p.check_out, 'id')}, {p.malam} malam
      </span>
    </Link>
  );
}
