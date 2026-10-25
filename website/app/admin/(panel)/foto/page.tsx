import { JudulAdmin } from '@/components/admin/Kabar';
import KelolaFoto from '@/components/admin/KelolaFoto';
import { fotoSitus } from '@/lib/data';

export const metadata = { title: 'Foto situs' };

export default async function FotoAdmin() {
  const foto = await fotoSitus();
  return (
    <>
      <JudulAdmin judul="Foto situs" teks="Foto di luar halaman pondok. Foto pondok diunggah di menu Pondok." />
      <div className="grid gap-6">
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto utama halaman depan</h2>
          <KelolaFoto wadah="beranda" foto={foto.beranda} catatan="Tampil besar di bagian paling atas. Hanya foto pertama yang dipakai. Tanpa foto, situs memakai ilustrasi laut dan maskot." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto bagian tentang kami</h2>
          <KelolaFoto wadah="tentang" foto={foto.tentang} catatan="Hanya foto pertama yang dipakai. Tanpa foto, situs menampilkan Mambe sedang santai." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Galeri</h2>
          <KelolaFoto wadah="galeri" foto={foto.galeri} catatan="Kumpulan foto suasana, makanan, laut, dan kegiatan. Bagian galeri tampil bila ada minimal satu foto." />
        </section>
      </div>
    </>
  );
}
