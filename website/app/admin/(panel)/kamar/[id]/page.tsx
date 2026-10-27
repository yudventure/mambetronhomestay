import Link from 'next/link';
import { notFound } from 'next/navigation';
import Ikon from '@/components/Ikon';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import KelolaFoto from '@/components/admin/KelolaFoto';
import TombolYakin from '@/components/admin/TombolYakin';
import { hapusKamar, simpanKamar } from '@/app/admin/aksi';
import { kamarDariId } from '@/lib/data';
import type { Kamar } from '@/lib/jenis';

export const metadata = { title: 'Ubah bungalow' };

const KOSONG: Kamar = {
  id: 0, slug: '', nama: '', nama_en: '', ringkas: '', ringkas_en: '', deskripsi: '', deskripsi_en: '', fasilitas: [], fasilitas_en: [],
  harga: 0, harga_anak: null, skema_harga: 'orang', kapasitas: 2, jumlah_unit: 1, min_malam: 1, aktif: true, urutan: 0, foto: [],
};

function Dua({ label, nama, k, panjang = false, bantuan, wajib = false }: { label: string; nama: string; k: Kamar; panjang?: boolean; bantuan?: string; wajib?: boolean }) {
  const nilai = (s: string) => {
    const v = (k as unknown as Record<string, unknown>)[s];
    return Array.isArray(v) ? v.join('\n') : String(v ?? '');
  };
  const Isian = panjang ? 'textarea' : 'input';
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="label-isian">{label}</legend>
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wider text-abu uppercase" htmlFor={nama}>Indonesia</label>
        <Isian id={nama} name={nama} defaultValue={nilai(nama)} required={wajib} className="isian" rows={panjang ? 6 : undefined} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wider text-abu uppercase" htmlFor={`${nama}_en`}>English</label>
        <Isian id={`${nama}_en`} name={`${nama}_en`} defaultValue={nilai(`${nama}_en`)} className="isian" rows={panjang ? 6 : undefined} />
      </div>
      {bantuan && <p className="bantuan sm:col-span-2">{bantuan}</p>}
    </fieldset>
  );
}

export default async function UbahKamar({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const baru = id === 'baru';
  const k = baru ? KOSONG : await kamarDariId(Number(id));
  if (!k) notFound();
  return (
    <>
      <Link href="/admin/kamar" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-biru-tua hover:underline">
        <Ikon nama="kiri" className="size-4" /> Semua bungalow
      </Link>
      <JudulAdmin judul={baru ? 'Bungalow baru' : k.nama}>
        {!baru && <Link href={`/kamar/${k.slug}`} target="_blank" className="tombol tombol-putih tombol-kecil"><Ikon nama="luar" className="size-4" /> Lihat di situs</Link>}
      </JudulAdmin>
      <Kabar ok={sp.ok} galat={sp.galat} pesan={{ ok: 'Bungalow tersimpan.', 'galat:nama': 'Nama bungalow wajib diisi.', 'galat:dipakai': 'Bungalow ini sudah punya pesanan, jadi tidak dihapus tetapi dinonaktifkan supaya tidak bisa dipesan lagi.' }} />

      <div className="grid gap-6 2xl:grid-cols-[1fr_28rem]">
        <form key={JSON.stringify({ ...k, foto: undefined })} action={simpanKamar} className="kartu grid gap-6 p-5 sm:p-6">
          <input type="hidden" name="id" value={k.id} />
          <Dua label="Nama bungalow" nama="nama" k={k} wajib />
          <Dua label="Ringkasan di kartu bungalow" nama="ringkas" k={k} panjang />
          <Dua label="Deskripsi lengkap" nama="deskripsi" k={k} panjang bantuan="Pisahkan paragraf dengan satu baris kosong. Awali baris dengan ## untuk subjudul, dan apit kata dengan ** supaya tebal, misalnya **Snorkeling di depan bungalow**." />
          <Dua label="Fasilitas" nama="fasilitas" k={k} panjang bantuan="Satu fasilitas per baris. Urutan bahasa Inggris mengikuti bahasa Indonesia." />

          <fieldset className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <legend className="label-isian">Harga dan kapasitas</legend>
            <div>
              <label className="label-isian" htmlFor="harga">Harga</label>
              <input id="harga" name="harga" inputMode="numeric" required defaultValue={k.harga || ''} placeholder="550000" className="isian" />
            </div>
            <div>
              <label className="label-isian" htmlFor="skema_harga">Dihitung</label>
              <select id="skema_harga" name="skema_harga" defaultValue={k.skema_harga} className="isian">
                <option value="orang">Per orang per malam</option>
                <option value="kamar">Per bungalow per malam</option>
              </select>
            </div>
            <div>
              <label className="label-isian" htmlFor="harga_anak">Harga anak</label>
              <input id="harga_anak" name="harga_anak" inputMode="numeric" defaultValue={k.harga_anak ?? ''} className="isian" />
              <p className="bantuan">Kosongkan bila sama dengan dewasa. Hanya untuk harga per orang.</p>
            </div>
            <div>
              <label className="label-isian" htmlFor="kapasitas">Muat berapa orang per bungalow</label>
              <input id="kapasitas" name="kapasitas" type="number" min={1} max={50} defaultValue={k.kapasitas} className="isian" />
            </div>
            <div>
              <label className="label-isian" htmlFor="jumlah_unit">Jumlah unit serupa</label>
              <input id="jumlah_unit" name="jumlah_unit" type="number" min={1} max={50} defaultValue={k.jumlah_unit} className="isian" />
              <p className="bantuan">Misalnya 2 bila ada dua bungalow yang sama persis.</p>
            </div>
            <div>
              <label className="label-isian" htmlFor="min_malam">Minimal malam</label>
              <input id="min_malam" name="min_malam" type="number" min={1} max={30} defaultValue={k.min_malam} className="isian" />
            </div>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="label-isian">Tampilan</legend>
            <div>
              <label className="label-isian" htmlFor="slug">Alamat halaman</label>
              <input id="slug" name="slug" defaultValue={k.slug} placeholder="bungalow-tepi-pantai" className="isian" />
              <p className="bantuan">Kosongkan untuk dibuat dari nama.</p>
            </div>
            <div>
              <label className="label-isian" htmlFor="urutan">Urutan tampil</label>
              <input id="urutan" name="urutan" type="number" defaultValue={k.urutan} className="isian" />
              <p className="bantuan">Angka kecil tampil lebih dulu.</p>
            </div>
            <label className="flex items-center gap-3 rounded-2xl bg-buih px-4 py-3 font-semibold text-laut sm:col-span-2">
              <input type="checkbox" name="aktif" value="ya" defaultChecked={k.aktif} className="size-5 accent-[#036f87]" />
              Tampilkan di situs dan bisa dipesan
            </label>
          </fieldset>
          <button className="tombol justify-self-start">{baru ? 'Simpan bungalow baru' : 'Simpan perubahan'}</button>
        </form>

        <div className="grid content-start gap-6">
          <section className="kartu p-5 sm:p-6">
            <h2 className="mb-3 text-2xl">Foto</h2>
            {baru ? <p className="text-abu">Simpan bungalow dulu, lalu foto bisa diunggah di sini.</p>
              : <KelolaFoto wadah="kamar" kamarId={k.id} foto={k.foto} catatan="Foto pertama dipakai di kartu bungalow. Foto mendatar terlihat paling baik." />}
          </section>
          {!baru && (
            <section className="kartu p-5 sm:p-6">
              <h2 className="text-xl">Hapus bungalow</h2>
              <p className="mt-1 text-sm text-abu">Bungalow yang sudah punya pesanan hanya dinonaktifkan supaya riwayat pesanan tetap utuh.</p>
              <form action={hapusKamar} className="mt-3">
                <input type="hidden" name="id" value={k.id} />
                <TombolYakin tanya={`Hapus ${k.nama} beserta fotonya?`}>Hapus bungalow</TombolYakin>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
