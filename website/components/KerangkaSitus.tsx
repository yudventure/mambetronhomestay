import Link from 'next/link';
import Kepala from './Kepala';
import Kaki from './Kaki';
import Ikon from './Ikon';
import Kunjungan from './Kunjungan';
import type { Bahasa, Situs } from '@/lib/jenis';

// Header, page and footer of the public site. While developer mode is on, a
// signed in admin sees the site as usual with a reminder pill in the corner.
export default function KerangkaSitus({ b, situs, admin, children }: { b: Bahasa; situs: Situs; admin: boolean; children: React.ReactNode }) {
  return (
    <div className="situs">
      <Kepala b={b} situs={situs} />
      <main id="isi">{children}</main>
      <Kaki b={b} situs={situs} />
      <Kunjungan />
      {admin && situs.tutup && (
        <Link href="/admin" className="fixed bottom-3 left-3 z-[45] inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-senja px-4 py-2.5 text-sm font-bold text-hitam shadow-angkat hover:bg-[#f58f5c]">
          <Ikon nama="gembok" className="size-4 shrink-0" />
          Mode pengembang menyala, situs tertutup untuk pengunjung
        </Link>
      )}
    </div>
  );
}
