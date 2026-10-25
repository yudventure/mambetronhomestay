import Ikon from '@/components/Ikon';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import TombolYakin from '@/components/admin/TombolYakin';
import { hapusUlasan, simpanUlasan } from '@/app/admin/aksi';
import { daftarUlasan } from '@/lib/data';
import type { Ulasan } from '@/lib/jenis';

export const metadata = { title: 'Ulasan' };

function FormUlasan({ u }: { u?: Ulasan }) {
  const id = u?.id ?? 0;
  const k = (s: string) => `${s}-${id}`;
  return (
    <form action={simpanUlasan} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={id} />
      <div><label className="label-isian" htmlFor={k('nama')}>Nama tamu</label><input id={k('nama')} name="nama" required defaultValue={u?.nama} className="isian" /></div>
      <div><label className="label-isian" htmlFor={k('asal')}>Asal</label><input id={k('asal')} name="asal" defaultValue={u?.asal} placeholder="Jakarta, atau Belanda" className="isian" /></div>
      <div className="sm:col-span-2"><label className="label-isian" htmlFor={k('isi')}>Isi ulasan</label><textarea id={k('isi')} name="isi" required defaultValue={u?.isi} rows={4} className="isian" /></div>
      <div>
        <label className="label-isian" htmlFor={k('bintang')}>Bintang</label>
        <select id={k('bintang')} name="bintang" defaultValue={u?.bintang ?? 5} className="isian">
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div><label className="label-isian" htmlFor={k('urutan')}>Urutan tampil</label><input id={k('urutan')} name="urutan" type="number" defaultValue={u?.urutan ?? 0} className="isian" /></div>
      <label className="flex items-center gap-3 rounded-2xl bg-buih px-4 py-3 font-semibold text-laut sm:col-span-2">
        <input type="checkbox" name="tampil" value="ya" defaultChecked={u?.tampil ?? true} className="size-5 accent-[#0a7a73]" /> Tampilkan di halaman utama
      </label>
      <div className="sm:col-span-2"><button className="tombol tombol-laut tombol-kecil">{u ? 'Simpan' : 'Tambah ulasan'}</button></div>
    </form>
  );
}

export default async function UlasanAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const ulasan = await daftarUlasan(true);
  return (
    <>
      <JudulAdmin judul="Ulasan tamu" teks="Salin ulasan asli dari tamu, misalnya dari WhatsApp atau Google, dengan izin mereka. Bagian ulasan baru tampil di situs bila ada minimal satu ulasan." />
      <Kabar ok={sp.ok ?? (sp.hapus ? 'hapus' : undefined)} galat={sp.galat} pesan={{ ok: 'Tersimpan.', 'ok:hapus': 'Ulasan dihapus.', 'galat:isi': 'Nama dan isi ulasan wajib diisi.' }} />
      <div className="grid gap-5">
        {ulasan.map((u) => (
          <section key={u.id} className="kartu p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="flex-1 text-2xl">{u.nama}</h2>
              {!u.tampil && <span className="rounded-full bg-[#fbe4df] px-3 py-1 text-xs font-bold text-merah">Disembunyikan</span>}
              <form action={hapusUlasan}><input type="hidden" name="id" value={u.id} />
                <TombolYakin tanya="Hapus ulasan ini?" className="inline-flex size-10 items-center justify-center rounded-full bg-buih text-merah"><Ikon nama="sampah" className="size-5" /><span className="sr-only">Hapus</span></TombolYakin>
              </form>
            </div>
            <FormUlasan key={JSON.stringify(u)} u={u} />
          </section>
        ))}
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-4 text-2xl">Tambah ulasan</h2>
          <FormUlasan key={`baru-${ulasan.length}`} />
        </section>
      </div>
    </>
  );
}
