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
          <KelolaFoto wadah="beranda" foto={foto.beranda} catatan="Tampil penuh sebagai latar bagian paling atas di komputer dan tablet, di belakang judul besar. Pakai foto mendatar. Sisi kiri foto diberi bayangan gelap supaya tulisan putih terbaca. Hanya foto pertama yang dipakai. Tanpa foto, situs memakai foto pondok berjajar di tepi pantai yang sudah terpasang di situs." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto utama untuk ponsel</h2>
          <KelolaFoto wadah="berandaHp" foto={foto.berandaHp} catatan="Latar bagian paling atas di layar ponsel. Pakai foto tegak, misalnya 9 banding 16. Hanya foto pertama yang dipakai. Tanpa foto ini, ponsel memakai foto utama di atas bila ada, kalau tidak foto tegak dermaga pondok yang sudah terpasang di situs." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto kartu keunggulan</h2>
          <KelolaFoto wadah="unggulan" foto={foto.unggulan} catatan="Tiga kartu di bawah foto utama, misalnya kamar tepi pantai, harga, serta wifi dan makan. Foto pertama untuk kartu pertama, foto kedua untuk kartu kedua, dan seterusnya. Urutkan dengan tombol panah. Kartu tanpa foto memakai ilustrasi laut. Judul dan teks kartu diubah di Isi situs." />
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
