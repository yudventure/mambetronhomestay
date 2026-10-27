import Link from 'next/link';
import Ikon from '@/components/Ikon';
import { BarisMeja } from '@/components/admin/MejaPesanan';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import { ambilSitus, cariPesanan } from '@/lib/data';
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
  const [situs, pesanan] = await Promise.all([ambilSitus(), cariPesanan({ status: status || undefined, q: q || undefined, dari: akanDatang ? hariIni() : undefined, urut: akanDatang ? 'tiba' : 'dibuat', batas: 300 })]);
  const tautan = (o: Record<string, string>) => {
    const u = new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), ...(akanDatang ? { waktu: 'datang' } : {}), ...o });
    for (const [k, v] of [...u.entries()]) if (!v) u.delete(k);
    const s = u.toString();
    return `/admin/pesanan${s ? `?${s}` : ''}`;
  };

  return (
    <>
      <JudulAdmin judul="Pesanan" teks="Pesanan dari situs dan yang dicatat sendiri. Yang masuk dalam sehari terakhir ditandai baru.">
        <Link href="/admin/pesanan/baru" className="tombol tombol-laut tombol-kecil !bg-panel-utama"><Ikon nama="tambah" className="size-4" /> Tambah pesanan manual</Link>
      </JudulAdmin>
      <Kabar ok={sp.hapus ? 'hapus' : undefined} pesan={{ 'ok:hapus': 'Pesanan sudah dihapus.' }} />

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/pesanan">
        {status && <input type="hidden" name="status" value={status} />}
        {akanDatang && <input type="hidden" name="waktu" value="datang" />}
        <label className="relative min-w-0 flex-1 basis-64">
          <span className="sr-only">Cari</span>
          <Ikon nama="cari" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-abu" />
          <input id="q" name="q" defaultValue={q} placeholder="Cari kode, nama, atau nomor" className="isian !rounded-full !pl-11" />
        </label>
        <button className="tombol tombol-putih tombol-kecil !rounded-full">Cari</button>
      </form>

      <div className="mb-5 flex flex-wrap gap-2">
        {TAB.map((t) => (
          <Link key={t.kunci} href={tautan({ status: t.kunci })} aria-current={status === t.kunci ? 'true' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${status === t.kunci ? 'bg-panel-utama text-white' : 'bg-white text-panel-utama ring-1 ring-panel-garis hover:bg-panel-latar'}`}>
            {t.label}
          </Link>
        ))}
        <Link href={tautan({ waktu: akanDatang ? '' : 'datang' })} className={`rounded-full px-4 py-2 text-sm font-semibold ${akanDatang ? 'bg-panel-aksen text-white' : 'bg-white text-panel-aksen ring-1 ring-panel-garis hover:bg-panel-latar'}`}>
          {akanDatang ? 'Urut menurut tanggal tiba' : 'Hanya yang akan datang'}
        </Link>
      </div>

      <p className="mb-3 text-sm text-abu">{pesanan.length} pesanan</p>
      {pesanan.length ? (
        <ul className="grid gap-3">{pesanan.map((p) => <BarisMeja key={p.id} p={p} homestay={situs.nama} />)}</ul>
      ) : (
        <p className="rounded-2xl bg-panel-latar px-4 py-6 text-center text-abu">Tidak ada pesanan yang cocok.</p>
      )}
    </>
  );
}
