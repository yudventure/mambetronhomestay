import Ikon from '@/components/Ikon';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import TombolYakin from '@/components/admin/TombolYakin';
import { hapusLayanan, simpanLayanan } from '@/app/admin/aksi';
import { daftarLayanan } from '@/lib/data';
import { IKON_LABEL } from '@/lib/bawaan.mjs';
import { SATUAN } from '@/lib/satuan.mjs';
import type { Layanan } from '@/lib/jenis';

export const metadata = { title: 'Kegiatan' };

function FormLayanan({ l }: { l?: Layanan }) {
  const id = l?.id ?? 0;
  const k = (s: string) => `${s}-${id}`;
  return (
    <form action={simpanLayanan} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={id} />
      <div><label className="label-isian" htmlFor={k('nama')}>Nama</label><input id={k('nama')} name="nama" required defaultValue={l?.nama} className="isian" /></div>
      <div><label className="label-isian" htmlFor={k('nama_en')}>Nama dalam bahasa Inggris</label><input id={k('nama_en')} name="nama_en" defaultValue={l?.nama_en} className="isian" /></div>
      <div><label className="label-isian" htmlFor={k('ket')}>Keterangan</label><textarea id={k('ket')} name="keterangan" defaultValue={l?.keterangan} rows={3} className="isian" /></div>
      <div><label className="label-isian" htmlFor={k('ket_en')}>Keterangan dalam bahasa Inggris</label><textarea id={k('ket_en')} name="keterangan_en" defaultValue={l?.keterangan_en} rows={3} className="isian" /></div>
      <div><label className="label-isian" htmlFor={k('harga')}>Harga</label><input id={k('harga')} name="harga" inputMode="numeric" required defaultValue={l?.harga ?? ''} className="isian" /></div>
      <div>
        <label className="label-isian" htmlFor={k('satuan')}>Dihitung</label>
        <select id={k('satuan')} name="satuan" defaultValue={l?.satuan ?? 'orang'} className="isian">
          {Object.entries(SATUAN).map(([kunci, v]) => <option key={kunci} value={kunci}>{v.id}</option>)}
        </select>
      </div>
      <div>
        <label className="label-isian" htmlFor={k('ikon')}>Ikon</label>
        <select id={k('ikon')} name="ikon" defaultValue={l?.ikon ?? 'perahu'} className="isian">
          {Object.entries(IKON_LABEL).map(([n, label]) => <option key={n} value={n}>{label}</option>)}
        </select>
      </div>
      <div><label className="label-isian" htmlFor={k('urutan')}>Urutan tampil</label><input id={k('urutan')} name="urutan" type="number" defaultValue={l?.urutan ?? 0} className="isian" /></div>
      <label className="flex items-center gap-3 rounded-2xl bg-buih px-4 py-3 font-semibold text-laut sm:col-span-2">
        <input type="checkbox" name="aktif" value="ya" defaultChecked={l?.aktif ?? true} className="size-5 accent-[#0a7a73]" /> Tampilkan di situs dan formulir pesan
      </label>
      <div className="sm:col-span-2"><button className="tombol tombol-laut tombol-kecil">{l ? 'Simpan' : 'Tambah kegiatan'}</button></div>
    </form>
  );
}

export default async function LayananAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const layanan = await daftarLayanan(true);
  return (
    <>
      <JudulAdmin judul="Kegiatan dan antar jemput" teks="Tambahan yang bisa dipilih tamu saat memesan, misalnya jemputan perahu atau trip snorkeling." />
      <Kabar ok={sp.ok ?? (sp.hapus ? 'hapus' : undefined)} galat={sp.galat} pesan={{ ok: 'Tersimpan.', 'ok:hapus': 'Kegiatan dihapus.', 'galat:nama': 'Nama kegiatan wajib diisi.' }} />
      <div className="grid gap-5">
        {layanan.map((l) => (
          <section key={l.id} className="kartu p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-buih text-toska-tua"><Ikon nama={l.ikon} className="size-6" /></span>
              <h2 className="flex-1 text-2xl">{l.nama}</h2>
              {!l.aktif && <span className="rounded-full bg-[#fbe4df] px-3 py-1 text-xs font-bold text-merah">Nonaktif</span>}
              <form action={hapusLayanan}><input type="hidden" name="id" value={l.id} />
                <TombolYakin tanya={`Hapus ${l.nama}?`} className="inline-flex size-10 items-center justify-center rounded-full bg-buih text-merah"><Ikon nama="sampah" className="size-5" /><span className="sr-only">Hapus</span></TombolYakin>
              </form>
            </div>
            <FormLayanan key={JSON.stringify(l)} l={l} />
          </section>
        ))}
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-4 text-2xl">Tambah kegiatan</h2>
          <FormLayanan key={`baru-${layanan.length}`} />
        </section>
      </div>
    </>
  );
}
