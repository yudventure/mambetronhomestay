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
          <KelolaFoto wadah="beranda" foto={foto.beranda} catatan="Tampil penuh sebagai latar bagian paling atas, di belakang judul besar. Pakai foto mendatar yang agak gelap supaya tulisan putih terbaca. Hanya foto pertama yang dipakai. Tanpa foto, situs memakai ilustrasi senja." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto bagian tentang kami</h2>
          <KelolaFoto wadah="tentang" foto={foto.tentang} catatan="Tampil besar di samping kotak rencana menginap. Hanya foto pertama yang dipakai. Tanpa foto, situs memakai ilustrasi pondok di siang hari." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto kotak ajakan</h2>
          <KelolaFoto wadah="ajakan" foto={foto.ajakan} catatan="Tampil di kotak ajakan berwarna laut. Hanya foto pertama yang dipakai. Tanpa foto, situs memakai ilustrasi pagi." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Galeri</h2>
          <KelolaFoto wadah="galeri" foto={foto.galeri} catatan="Kumpulan foto suasana, makanan, laut, dan kegiatan. Bagian galeri tampil bila ada minimal satu foto." />
        </section>
      </div>
    </>
  );
}
