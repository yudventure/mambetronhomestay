import { JudulAdmin } from '@/components/admin/Kabar';
import KelolaFoto from '@/components/admin/KelolaFoto';
import { fotoSitus } from '@/lib/data';

export const metadata = { title: 'Foto situs' };

export default async function FotoAdmin() {
  const foto = await fotoSitus();
  return (
    <>
      <JudulAdmin judul="Foto situs" teks="Foto di luar halaman bungalow. Foto bungalow diunggah di menu Bungalow." />
      <div className="grid gap-6">
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto utama halaman depan</h2>
          <KelolaFoto wadah="beranda" foto={foto.beranda} catatan="Tampil penuh sebagai latar bagian paling atas di komputer dan tablet, di belakang judul besar. Pakai foto mendatar. Sisi kiri foto diberi bayangan gelap supaya tulisan putih terbaca. Hanya foto pertama yang dipakai. Tanpa foto, situs memakai foto bungalow berjajar di tepi pantai yang sudah terpasang di situs." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto utama untuk ponsel</h2>
          <KelolaFoto wadah="berandaHp" foto={foto.berandaHp} catatan="Latar bagian paling atas di layar ponsel. Pakai foto tegak, misalnya 9 banding 16. Hanya foto pertama yang dipakai. Tanpa foto ini, ponsel memakai foto utama di atas bila ada, kalau tidak foto tegak dermaga bungalow yang sudah terpasang di situs." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto kartu keunggulan</h2>
          <KelolaFoto wadah="unggulan" foto={foto.unggulan} catatan="Kartu foto polos di bawah foto utama, tanpa tulisan dan tidak bisa diklik. Satu foto menjadi satu kartu, tiga foto paling pas. Urutkan dengan tombol panah. Selama belum ada foto, tiga kartu memakai ilustrasi laut. Isi keterangan foto supaya pembaca layar tahu isinya." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto bagian tentang kami</h2>
          <p className="mb-3 rounded-2xl bg-buih px-4 py-3 text-sm text-laut">
            Foto ini bisa diganti video YouTube, Instagram, atau TikTok. Tautannya diisi di{' '}
            <a href="/admin/pengaturan#beranda" className="font-bold text-biru-tua underline underline-offset-4">Isi situs, bagian Halaman utama, isian Video tentang kami</a>.
          </p>
          <KelolaFoto wadah="tentang" foto={foto.tentang} catatan="Tampil besar di samping teks tentang kami, di atas kalender rencana menginap. Hanya foto pertama yang dipakai. Tanpa foto, situs memakai ilustrasi bungalow di siang hari." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto kotak ajakan</h2>
          <KelolaFoto wadah="ajakan" foto={foto.ajakan} catatan="Tampil di kotak ajakan berwarna laut. Hanya foto pertama yang dipakai. Tanpa foto, situs memakai ilustrasi pagi." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Foto wajah tamu</h2>
          <KelolaFoto wadah="tamu" foto={foto.tamu} wajah catatan="Wajah asli tamu di lingkaran kecil samping nilai ulasan di halaman depan, paling banyak enam. Pakai foto tamu yang sudah memberi izin, misalnya foto saat mereka menginap. Foto dipotong bulat di bagian atas tengah, jadi foto wajah dari dada ke atas paling pas. Isi nama tamu di samping fotonya, nama itu muncul saat lingkaran disentuh. Selama belum ada foto di sini, lingkaran memakai gambar wajah ilustrasi dari Isi situs." />
        </section>
        <section className="kartu p-5 sm:p-6">
          <h2 className="mb-1 text-2xl">Galeri</h2>
          <KelolaFoto wadah="galeri" foto={foto.galeri} catatan="Kumpulan foto suasana, makanan, laut, dan kegiatan. Bagian galeri tampil bila ada minimal satu foto." />
        </section>
      </div>
    </>
  );
}
