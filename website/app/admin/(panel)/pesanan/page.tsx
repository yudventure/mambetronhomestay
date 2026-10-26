import Link from 'next/link';
import Ikon from '@/components/Ikon';
import BarisPesanan from '@/components/admin/BarisPesanan';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import { cariPesanan } from '@/lib/data';
import { KAMUS } from '@/lib/kamus';
import { hariIni } from '@/lib/tanggal';

export const metadata = { title: 'Pesanan' };

const TAB = [
  { kunci: '', label: 'Semua' },
  { kunci: 'menunggu', label: KAMUS.id.status.menunggu },
  { kunci: 'dikonfirmasi', label: KAMUS.id.status.dikonfirmasi },
  { kunci: 'lunas', label: KAMUS.id.status.lunas },
  { kunci: 'selesai', label: KAMUS.id.status.selesai },
  { kunci: 'batal', label: KAMUS.id.status.batal },
];

export default async function DaftarPesanan({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const status = TAB.some((t) => t.kunci === sp.status) ? sp.status ?? '' : '';
  const q = (sp.q ?? '').trim().slice(0, 60);
  const akanDatang = sp.waktu === 'datang';
  const pesanan = await cariPesanan({ status: status || undefined, q: q || undefined, dari: akanDatang ? hariIni() : undefined, urut: akanDatang ? 'tiba' : 'dibuat', batas: 300 });
  const tautan = (o: Record<string, string>) => {
    const u = new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), ...(akanDatang ? { waktu: 'datang' } : {}), ...o });
    for (const [k, v] of [...u.entries()]) if (!v) u.delete(k);
    const s = u.toString();
    return `/admin/pesanan${s ? `?${s}` : ''}`;
  };

  return (
    <>
      <JudulAdmin judul="Pesanan" teks="Pesanan dari situs dan yang dicatat sendiri.">
        <Link href="/admin/pesanan/baru" className="tombol tombol-kecil"><Ikon nama="tambah" className="size-4" /> Catat pesanan</Link>
      </JudulAdmin>
      <Kabar ok={sp.hapus ? 'hapus' : undefined} pesan={{ 'ok:hapus': 'Pesanan sudah dihapus.' }} />

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/pesanan">
        {status && <input type="hidden" name="status" value={status} />}
        {akanDatang && <input type="hidden" name="waktu" value="datang" />}
        <label htmlFor="q" className="sr-only">Cari</label>
        <input id="q" name="q" defaultValue={q} placeholder="Cari kode, nama, nomor, atau surel" className="isian max-w-md flex-1" />
        <button className="tombol tombol-laut tombol-kecil"><Ikon nama="cari" className="size-4" /> Cari</button>
      </form>

      <div className="mb-5 flex flex-wrap gap-2">
        {TAB.map((t) => (
          <Link key={t.kunci} href={tautan({ status: t.kunci })} className={`rounded-full px-4 py-2 text-sm font-bold ${status === t.kunci ? 'bg-laut text-white' : 'bg-white text-laut hover:bg-buih-2'}`}>
            {t.label}
          </Link>
        ))}
        <Link href={tautan({ waktu: akanDatang ? '' : 'datang' })} className={`rounded-full px-4 py-2 text-sm font-bold ${akanDatang ? 'bg-biru-tua text-white' : 'bg-white text-biru-tua hover:bg-buih-2'}`}>
          {akanDatang ? 'Urut menurut tanggal tiba' : 'Hanya yang akan datang'}
        </Link>
      </div>

      {pesanan.length ? (
        <div className="grid gap-2">{pesanan.map((p) => <BarisPesanan key={p.id} p={p} />)}</div>
      ) : (
        <p className="rounded-2xl bg-white px-4 py-6 text-center text-abu">Tidak ada pesanan yang cocok.</p>
      )}
    </>
  );
}
