import { JudulAdmin } from '@/components/admin/Kabar';
import FormPengaturan from '@/components/admin/FormPengaturan';
import { PENGATURAN } from '@/lib/bawaan.mjs';
import { ambilSitus } from '@/lib/data';

export const metadata = { title: 'Isi situs' };

export default async function Pengaturan() {
  const situs = (await ambilSitus()) as unknown as Record<string, unknown>;
  return (
    <>
      <JudulAdmin judul="Isi situs" teks="Semua teks, kontak, dan aturan pemesanan yang tampil di situs. Setiap bagian disimpan sendiri-sendiri." />
      <nav className="mb-6 flex flex-wrap gap-2">
        {PENGATURAN.map((g) => <a key={g.kunci} href={`#${g.kunci}`} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-laut hover:bg-buih-2">{g.judul}</a>)}
      </nav>
      <div className="grid gap-6">
        {PENGATURAN.map((g) => (
          <section key={g.kunci} id={g.kunci} className="kartu scroll-mt-20 p-5 sm:p-7">
            <h2 className="text-2xl">{g.judul}</h2>
            {g.keterangan && <p className="mt-1 mb-6 text-abu">{g.keterangan}</p>}
            <FormPengaturan bagian={g} nilai={Object.fromEntries(g.isian.map((f) => [f.k, situs[f.k]]))} />
          </section>
        ))}
        <section className="kartu p-5 sm:p-7">
          <h2 className="text-2xl">Teks tombol dan label</h2>
          <p className="mt-2 text-abu">Tulisan kecil pada tombol, menu, dan formulir, misalnya Pesan sekarang atau Nomor WhatsApp, ada di berkas bahasa website/lib/kamus.ts dan belum bisa diubah dari panel ini. Minta bantuan pengembang bila ingin mengubahnya.</p>
        </section>
      </div>
    </>
  );
}
