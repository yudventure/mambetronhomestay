// Default content and the shape of every setting the owner can edit.
// PENGATURAN drives both the admin settings form and the public pages, so a
// new field added here shows up in the panel by itself. Plain JS so the
// migration script can seed the database without a build.
//
// Field kinds
//   teks        one line            panjang     several lines
//   dua         one line, ID + EN   duaPanjang  several lines, ID + EN
//   angka       whole number        jam         time like 12:00
//   ikon        icon picker         daftar      repeatable rows of sub fields
//   saklar      on or off

const dua = (id, en) => ({ id, en });

export const IKON_LABEL = {
  snorkel: 'Snorkel', makan: 'Makanan', perahu: 'Perahu', hati: 'Hati', kamar: 'Kasur', karang: 'Karang',
  ikan: 'Ikan', burung: 'Burung', matahari: 'Matahari', lokasi: 'Lokasi', bintang: 'Bintang', daun: 'Daun',
  air: 'Air', kamera: 'Kamera', wifi: 'Wifi', bulan: 'Bulan', jam: 'Jam', globe: 'Bola dunia',
};
export const IKON_PILIHAN = Object.keys(IKON_LABEL);

export const PENGATURAN = [
  {
    kunci: 'umum',
    judul: 'Identitas',
    keterangan: 'Nama, slogan, dan teks yang muncul di Google dan pratinjau tautan.',
    isian: [
      { k: 'nama', label: 'Nama homestay', jenis: 'teks', bawaan: 'Mambetron Homestay' },
      { k: 'slogan', label: 'Slogan', jenis: 'dua', bawaan: dua('Pelukan hangat dari Raja Ampat', 'A warm hug from Raja Ampat') },
      { k: 'lokasi', label: 'Lokasi singkat', jenis: 'dua', bawaan: dua('Raja Ampat, Papua Barat Daya', 'Raja Ampat, Southwest Papua') },
      { k: 'seoJudul', label: 'Judul di Google', jenis: 'dua', bawaan: dua('Mambetron Homestay Raja Ampat, pesan langsung', 'Mambetron Homestay Raja Ampat, book direct') },
      {
        k: 'seoDeskripsi', label: 'Deskripsi di Google', jenis: 'duaPanjang', bawaan: dua(
          'Homestay keluarga di Raja Ampat. Pondok kayu di tepi laut, makan tiga kali sehari, jemputan dari Waisai, dan karang di depan dermaga. Pesan langsung dari situs resmi.',
          'A family homestay in Raja Ampat. Wooden huts by the sea, three meals a day, pickup from Waisai and a reef right off the jetty. Book direct on the official site.'),
      },
      { k: 'kakiTeks', label: 'Teks di kaki halaman', jenis: 'duaPanjang', bawaan: dua('Homestay keluarga di Raja Ampat. Dikelola dengan sepenuh hati, untuk laut yang tetap biru.', 'A family homestay in Raja Ampat. Run with heart, for a sea that stays blue.') },
    ],
  },
  {
    kunci: 'kontak',
    judul: 'Kontak dan lokasi',
    keterangan: 'Nomor WhatsApp dipakai untuk semua tombol WhatsApp di situs. Nomor, surel, dan media sosial tampil di kolom Hubungi kami di kaki halaman.',
    isian: [
      { k: 'whatsapp', label: 'Nomor WhatsApp', jenis: 'teks', bawaan: '6281390849237', bantuan: 'Tulis dengan kode negara tanpa tanda plus, misalnya 6281234567890.' },
      { k: 'email', label: 'Surel', jenis: 'teks', bawaan: 'halo@mambetronhomestay.com' },
      { k: 'instagram', label: 'Akun Instagram', jenis: 'teks', bawaan: 'mambetronhomestay', bantuan: 'Tanpa tanda @. Kosongkan bila ikon Instagram tidak ingin ditampilkan.' },
      { k: 'facebook', label: 'Tautan Facebook', jenis: 'teks', bawaan: 'https://www.facebook.com/', bantuan: 'Tempel tautan lengkap halaman Facebook. Selama belum diganti, ikonnya membuka halaman depan Facebook. Kosongkan bila ikon tidak ingin ditampilkan.' },
      { k: 'tiktok', label: 'Tautan TikTok', jenis: 'teks', bawaan: 'https://www.tiktok.com/', bantuan: 'Tempel tautan lengkap akun TikTok. Selama belum diganti, ikonnya membuka halaman depan TikTok. Kosongkan bila ikon tidak ingin ditampilkan.' },
      { k: 'youtube', label: 'Tautan YouTube', jenis: 'teks', bawaan: 'https://www.youtube.com/', bantuan: 'Tempel tautan lengkap kanal YouTube. Selama belum diganti, ikonnya membuka halaman depan YouTube. Kosongkan bila ikon tidak ingin ditampilkan.' },
      { k: 'alamat', label: 'Alamat', jenis: 'duaPanjang', bawaan: dua('', '') },
      { k: 'petaKoordinat', label: 'Titik peta', jenis: 'teks', bawaan: '', bantuan: 'Garis lintang dan bujur dari Google Maps, misalnya -0.4312, 130.6411. Kosongkan bila belum ingin menampilkan peta.' },
      { k: 'petaTautan', label: 'Tautan Google Maps', jenis: 'teks', bawaan: '', bantuan: 'Salin dari tombol Bagikan di Google Maps.' },
    ],
  },
  {
    kunci: 'beranda',
    judul: 'Halaman utama',
    keterangan: 'Semua judul dan teks di halaman utama, urut dari atas ke bawah.',
    isian: [
      { k: 'heroLabel', label: 'Label kecil di atas judul', jenis: 'dua', bawaan: dua('', ''), bantuan: 'Kosongkan bila tidak ingin ditampilkan.' },
      {
        k: 'heroJudul', label: 'Judul besar', jenis: 'duaPanjang', bawaan: dua('Laut.\nPulau.\nKamu.', 'Sea.\nIslands.\nYou.'),
        bantuan: 'Tiap baris tampil sebagai baris sendiri. Baris terakhir berwarna pasir. Judul pendek tiga baris terlihat paling baik.',
      },
      {
        k: 'heroTeks', label: 'Teks di bawah judul', jenis: 'duaPanjang', bawaan: dua(
          'Keramahtamahan khas Raja Ampat dan pemandangan yang luar biasa, dinikmati dengan cara yang masih autentik.',
          'Genuine Raja Ampat hospitality and extraordinary scenery, enjoyed the authentic way.'),
      },
      {
        k: 'heroKata', label: 'Kata kesan di pojok foto utama', jenis: 'daftar', tambah: 'Tambah kata',
        bantuan: 'Dua sampai empat kata pendek. Kosongkan semua bila tidak ingin ditampilkan.',
        isian: [
          { k: 'ikon', label: 'Ikon', jenis: 'ikon' },
          { k: 'teks', label: 'Kata', jenis: 'dua' },
        ],
        bawaan: [],
      },
      { k: 'heroVideo', label: 'Tautan video', jenis: 'teks', bawaan: '', bantuan: 'Tautan video YouTube atau Instagram, diawali https://. Bila diisi, tombol putar muncul di foto utama. Kosongkan bila belum ada.' },
      {
        k: 'unggulan', label: 'Kartu keunggulan di bawah foto utama', jenis: 'daftar', tambah: 'Tambah kartu',
        bantuan: 'Tiga kartu terlihat paling baik. Tulis {harga} di teks untuk menampilkan harga pondok termurah, lengkap dengan perkiraan dalam mata uang asing. Foto tiap kartu diunggah di Foto situs.',
        isian: [
          { k: 'judul', label: 'Judul', jenis: 'dua' },
          { k: 'teks', label: 'Teks', jenis: 'duaPanjang' },
        ],
        bawaan: [
          { judul: dua('Kamar tepi pantai', 'Beachfront huts'), teks: dua('Setiap pondok langsung menghadap ke laut.', 'Every hut looks straight out to sea.') },
          { judul: dua('Harga terjangkau', 'Affordable rates'), teks: dua('Mulai {harga}.', 'From {harga}.') },
          { judul: dua('Wifi dan makan', 'Wi-Fi and meals'), teks: dua('Ada wifi, dan makan tiga kali sehari sudah termasuk harga.', 'Wi-Fi on site, and three meals a day are in the rate.') },
        ],
      },
      { k: 'kamarJudul', label: 'Judul halaman semua pondok', jenis: 'dua', bawaan: dua('Pilih pondokmu', 'Choose your hut') },
      { k: 'kamarTeks', label: 'Teks halaman semua pondok', jenis: 'duaPanjang', bawaan: dua('Semua pondok menghadap laut dan sudah termasuk makan tiga kali sehari.', 'Every hut faces the sea and includes three meals a day.') },
      { k: 'ulasanSkor', label: 'Nilai ulasan di samping kartu', jenis: 'teks', bawaan: '8,7', bantuan: 'Nilai dari situs ulasan, misalnya 8,7. Kosongkan bila tidak ingin ditampilkan.' },
      { k: 'ulasanSkala', label: 'Nilai tertinggi di situs ulasan', jenis: 'angka', bawaan: 10, min: 1, max: 100, bantuan: 'Booking.com memakai 10, Google memakai 5.' },
      { k: 'ulasanSumber', label: 'Nama situs ulasan', jenis: 'teks', bawaan: 'Booking.com' },
      { k: 'ulasanTautan', label: 'Tautan tombol ke situs ulasan', jenis: 'teks', bawaan: 'https://www.booking.com/hotel/id/mambetron-homestay.html', bantuan: 'Tombol Lihat di Booking.com di bawah nilai membuka tautan ini. Bawaannya halaman Mambetron di Booking.com. Bila dikosongkan, tombol membuka halaman semua pondok.' },
      {
        k: 'ulasanWajah', label: 'Lingkaran tamu di samping nilai', jenis: 'daftar', tambah: 'Tambah tamu',
        bantuan: 'Tamu yang mengulas di situs ulasan. Tiap tamu tampil sebagai lingkaran berisi satu huruf, paling banyak enam.',
        isian: [
          { k: 'nama', label: 'Nama', jenis: 'teks' },
          { k: 'huruf', label: 'Huruf di lingkaran', jenis: 'teks', bantuan: 'Kosongkan untuk memakai huruf pertama nama.' },
        ],
        bawaan: [
          { nama: 'Adam', huruf: 'A' },
          { nama: 'Rijnders', huruf: 'L' },
          { nama: 'Linda', huruf: 'L' },
          { nama: 'Justyna', huruf: 'J' },
          { nama: 'Jeroen', huruf: 'J' },
          { nama: 'Christopher', huruf: 'C' },
        ],
      },
      { k: 'tentangJudul', label: 'Judul bagian tentang kami', jenis: 'dua', bantuan: 'Tampil di samping kotak rencana menginap.', bawaan: dua('Rumah kecil di ujung dermaga', 'A little home at the end of the jetty') },
      {
        k: 'tentangTeks', label: 'Teks tentang kami', jenis: 'duaPanjang', bawaan: dua(
          'Mambetron Homestay adalah rumah singgah keluarga di Raja Ampat. Maskot kami, Mambe, adalah kuskus, hewan pemalu bermata besar yang suka mengintip dari balik dahan hutan pulau.\n\nDi sini hari dimulai dengan matahari terbit di atas laut dan ditutup dengan obrolan di dermaga. Tidak ada yang terburu-buru. Kamu cukup datang, kami yang urus sisanya.',
          'Mambetron Homestay is a family guesthouse in Raja Ampat. Our mascot Mambe is a cuscus, the shy big-eyed animal that peeks out from the branches of the island forest.\n\nDays here start with sunrise over the sea and end with stories on the jetty. Nobody is in a hurry. Just come, we will take care of the rest.'),
      },
      { k: 'sorotanJudul', label: 'Judul bagian keunggulan', jenis: 'dua', bantuan: 'Tidak tampil di layar. Dibaca oleh pembaca layar dan mesin pencari.', bawaan: dua('Kenapa menginap di sini', 'Why stay with us') },
      {
        k: 'sorotan', label: 'Keunggulan', jenis: 'daftar', tambah: 'Tambah keunggulan',
        isian: [
          { k: 'ikon', label: 'Ikon', jenis: 'ikon' },
          { k: 'judul', label: 'Judul', jenis: 'dua' },
          { k: 'teks', label: 'Teks', jenis: 'duaPanjang' },
        ],
        bawaan: [
          { ikon: 'snorkel', judul: dua('Karang di depan rumah', 'A reef at the doorstep'), teks: dua('Turun dari dermaga dan langsung berenang bersama ikan karang, penyu, dan kadang hiu sirip hitam.', 'Step off the jetty and swim with reef fish, turtles and the odd blacktip shark.') },
          { ikon: 'makan', judul: dua('Makan tiga kali sehari', 'Three meals a day'), teks: dua('Masakan rumahan dengan ikan segar, sayur kebun, dan sambal buatan mama. Sudah termasuk dalam harga.', 'Home cooking with fresh fish, garden greens and homemade sambal. Included in the rate.') },
          { ikon: 'perahu', judul: dua('Dijemput di Waisai', 'Pickup in Waisai'), teks: dua('Kabari jadwal kapal cepatmu, kami menunggu di pelabuhan dengan perahu.', 'Tell us your ferry time and we will wait at the harbour with our boat.') },
          { ikon: 'hati', judul: dua('Tuan rumah yang hangat', 'Warm hosts'), teks: dua('Kami mengenal setiap sudut pulau dan senang berbagi cerita kampung.', 'We know every corner of the island and love sharing village stories.') },
        ],
      },
      { k: 'ajakanLabel', label: 'Label kecil di kotak ajakan', jenis: 'dua', bawaan: dua('Pesan langsung', 'Book direct') },
      { k: 'ajakanJudul', label: 'Judul kotak ajakan', jenis: 'dua', bawaan: dua('Laut sudah menunggu', 'The sea is waiting') },
      { k: 'ajakanTeks', label: 'Teks kotak ajakan', jenis: 'duaPanjang', bawaan: dua('Cek tanggal kosong dan amankan pondokmu sekarang.', 'Check open dates and secure your hut now.') },
      { k: 'layananJudul', label: 'Judul bagian kegiatan', jenis: 'dua', bawaan: dua('Kegiatan dan antar jemput', 'Trips and transfers') },
      { k: 'layananTeks', label: 'Teks bagian kegiatan', jenis: 'duaPanjang', bawaan: dua('Tambahkan saat memesan atau tanyakan langsung ke kami.', 'Add them when you book or just ask us.') },
      { k: 'galeriJudul', label: 'Judul bagian galeri foto', jenis: 'dua', bawaan: dua('Sehari di Mambetron', 'A day at Mambetron') },
      { k: 'ulasanJudul', label: 'Judul bagian ulasan', jenis: 'dua', bawaan: dua('Kata tamu', 'What guests say') },
      { k: 'caraJudul', label: 'Judul bagian cara memesan', jenis: 'dua', bawaan: dua('Cara memesan', 'How to book') },
      {
        k: 'langkah', label: 'Langkah memesan', jenis: 'daftar', tambah: 'Tambah langkah',
        isian: [
          { k: 'judul', label: 'Judul', jenis: 'dua' },
          { k: 'teks', label: 'Teks', jenis: 'duaPanjang' },
        ],
        bawaan: [
          { judul: dua('Pilih pondok dan tanggal', 'Pick a hut and dates'), teks: dua('Lihat tanggal kosong di kalender lalu isi data tamu.', 'Check open dates on the calendar and fill in guest details.') },
          { judul: dua('Bayar uang muka', 'Pay the deposit'), teks: dua('Transfer uang muka ke rekening yang tertera di halaman pesanan.', 'Transfer the deposit to the account shown on your booking page.') },
          { judul: dua('Kirim bukti lewat WhatsApp', 'Send the receipt on WhatsApp'), teks: dua('Kami mengonfirmasi pesananmu dan mengatur jemputan di Waisai.', 'We confirm your booking and arrange your pickup in Waisai.') },
        ],
      },
      { k: 'lokasiJudul', label: 'Judul bagian lokasi', jenis: 'dua', bawaan: dua('Cara ke sini', 'Getting here') },
      {
        k: 'caraSampai', label: 'Petunjuk perjalanan', jenis: 'duaPanjang', bawaan: dua(
          'Terbang ke Sorong, lalu naik kapal cepat ke Waisai sekitar dua jam. Dari Pelabuhan Waisai perjalanan berlanjut dengan perahu kami.\n\nSetiap tamu Raja Ampat wajib memiliki Kartu Jasa Lingkungan. Kartu ini bisa dibeli di Sorong atau Waisai.',
          'Fly to Sorong, then take the fast ferry to Waisai, about two hours. From Waisai harbour you continue on our boat.\n\nEvery visitor to Raja Ampat needs the environmental service card. You can buy it in Sorong or Waisai.'),
      },
      { k: 'faqJudul', label: 'Judul bagian tanya jawab', jenis: 'dua', bawaan: dua('Sering ditanyakan', 'Good to know') },
      {
        k: 'faq', label: 'Tanya jawab', jenis: 'daftar', tambah: 'Tambah pertanyaan',
        isian: [
          { k: 'tanya', label: 'Pertanyaan', jenis: 'dua' },
          { k: 'jawab', label: 'Jawaban', jenis: 'duaPanjang' },
        ],
        bawaan: [
          { tanya: dua('Apakah harga sudah termasuk makan?', 'Are meals included?'), jawab: dua('Ya. Harga pondok sudah termasuk makan pagi, siang, dan malam, juga air minum, teh, dan kopi.', 'Yes. The rate includes breakfast, lunch and dinner, plus drinking water, tea and coffee.') },
          { tanya: dua('Bagaimana listrik dan sinyal?', 'What about power and phone signal?'), jawab: dua('Listrik menyala dari sore sampai pagi. Sinyal telepon terbatas, jadi kabari keluarga sebelum menyeberang.', 'Power runs from late afternoon until morning. Phone signal is limited, so let your family know before you cross.') },
          { tanya: dua('Bagaimana cara membayar?', 'How do I pay?'), jawab: dua('Setelah memesan, transfer uang muka ke rekening yang tertera lalu kirim bukti lewat WhatsApp. Sisanya dibayar saat tiba.', 'After booking, transfer the deposit to the account shown and send the receipt on WhatsApp. Pay the rest when you arrive.') },
          { tanya: dua('Bisakah membatalkan pesanan?', 'Can I cancel?'), jawab: dua('Bisa. Aturan pengembalian uang muka ada di halaman ketentuan menginap.', 'Yes. The deposit refund rules are on the house rules page.') },
        ],
      },
    ],
  },
  {
    kunci: 'pemesanan',
    judul: 'Pemesanan dan pembayaran',
    keterangan: 'Jam tiba dan pulang, uang muka, rekening, dan ketentuan menginap.',
    isian: [
      { k: 'checkIn', label: 'Jam check-in', jenis: 'jam', bawaan: '12:00' },
      { k: 'checkOut', label: 'Jam check-out', jenis: 'jam', bawaan: '10:00' },
      { k: 'dpPersen', label: 'Uang muka dalam persen', jenis: 'angka', min: 0, max: 100, bawaan: 30, bantuan: 'Isi 0 bila tamu tidak perlu membayar uang muka.' },
      { k: 'batasHari', label: 'Bisa dipesan sampai berapa hari ke depan', jenis: 'angka', min: 30, max: 730, bawaan: 365 },
      { k: 'jedaHari', label: 'Paling cepat berapa hari sebelum tiba', jenis: 'angka', min: 0, max: 30, bawaan: 1, bantuan: 'Isi 0 bila tamu boleh memesan untuk hari ini juga.' },
      {
        k: 'bank', label: 'Rekening pembayaran', jenis: 'daftar', tambah: 'Tambah rekening',
        isian: [
          { k: 'bank', label: 'Bank', jenis: 'teks' },
          { k: 'nomor', label: 'Nomor rekening', jenis: 'teks' },
          { k: 'atasNama', label: 'Atas nama', jenis: 'teks' },
        ],
        bawaan: [],
      },
      {
        k: 'catatanBayar', label: 'Petunjuk pembayaran', jenis: 'duaPanjang', bawaan: dua(
          'Transfer uang muka dalam 24 jam setelah memesan, lalu kirim bukti transfer lewat WhatsApp. Sisa pembayaran dilunasi saat tiba, tunai atau transfer.',
          'Transfer the deposit within 24 hours of booking, then send the receipt on WhatsApp. Pay the balance when you arrive, in cash or by transfer.'),
      },
      {
        k: 'pesanTerima', label: 'Ucapan setelah tamu memesan', jenis: 'duaPanjang', bawaan: dua(
          'Terima kasih, pesananmu sudah kami terima. Pondok kami tahan sambil menunggu uang muka.',
          'Thank you, we have your booking. We are holding the hut for you while we wait for the deposit.'),
      },
      {
        k: 'ketentuan', label: 'Ketentuan menginap', jenis: 'duaPanjang', bawaan: dua(
          'Jam tiba dan pulang bisa disesuaikan dengan jadwal kapal. Kabari kami bila jadwalmu berubah.\n\nPembatalan 14 hari atau lebih sebelum tiba, uang muka kembali penuh. Pembatalan kurang dari 14 hari, uang muka tidak kembali tetapi bisa dipakai untuk tanggal lain dalam satu tahun.\n\nJaga laut kita. Jangan menginjak atau mengambil karang, dan bawa pulang sampah plastikmu.',
          'Arrival and departure times can follow the ferry schedule. Let us know if your plans change.\n\nCancel 14 days or more before arrival and the deposit is refunded in full. Cancel later and the deposit is not refunded, but you can use it for other dates within a year.\n\nLook after our sea. Do not stand on or take coral, and take your plastic home with you.'),
      },
    ],
  },
  {
    kunci: 'uang',
    judul: 'Mata uang',
    keterangan: 'Harga pondok dan kegiatan diisi, ditampilkan, dan dibayar dalam rupiah. Di bawah setiap harga, tamu melihat perkiraannya dalam dolar Amerika, euro, yen, dan yuan.',
    isian: [
      {
        k: 'kursOtomatis', label: 'Perbarui kurs otomatis', jenis: 'saklar', bawaan: true,
        bantuan: 'Kurs acuan Bank Sentral Eropa diambil dua kali sehari. Angka di bawah dipakai bila kurs otomatis dimatikan atau gagal diambil.',
      },
      { k: 'kursUSD', label: 'Rupiah untuk 1 dolar Amerika', jenis: 'angka', min: 1, max: 1000000, bawaan: 16500 },
      { k: 'kursEUR', label: 'Rupiah untuk 1 euro', jenis: 'angka', min: 1, max: 1000000, bawaan: 19000 },
      { k: 'kursJPY', label: 'Rupiah untuk 1 yen', jenis: 'angka', min: 1, max: 100000, bawaan: 110 },
      { k: 'kursCNY', label: 'Rupiah untuk 1 yuan', jenis: 'angka', min: 1, max: 100000, bawaan: 2300 },
    ],
  },
  {
    kunci: 'tutup',
    judul: 'Mode pengembang',
    keterangan: 'Tutup situs sementara selama masih disiapkan atau diperbaiki. Pengunjung hanya melihat halaman segera dibuka, sedangkan kamu yang sudah masuk ke panel tetap melihat dan bisa menguji situs seperti biasa.',
    isian: [
      {
        k: 'tutup', label: 'Tutup situs untuk pengunjung', jenis: 'saklar', bawaan: false,
        bantuan: 'Tamu yang sudah memesan tetap bisa membuka halaman pesanannya dan halaman cek pesanan.',
      },
      { k: 'tutupJudul', label: 'Judul halaman tutup', jenis: 'duaPanjang', bawaan: dua('Segera\ndibuka.', 'Opening\nsoon.'), bantuan: 'Tiap baris tampil sebagai baris sendiri. Baris terakhir berwarna pasir.' },
      {
        k: 'tutupTeks', label: 'Teks halaman tutup', jenis: 'duaPanjang', bawaan: dua(
          'Rumah kecil kami di ujung dermaga sedang disiapkan. Sementara itu, tanyakan tanggal kosong lewat WhatsApp.',
          'Our little home at the end of the jetty is getting ready. In the meantime, ask about open dates on WhatsApp.'),
      },
    ],
  },
];

// Plain object of default values, keyed by field.
export function situsBawaan() {
  const o = {};
  for (const g of PENGATURAN) for (const f of g.isian) o[f.k] = structuredClone(f.bawaan);
  return o;
}

const teks = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const duaV = (v, b) => (v && typeof v === 'object' ? { id: teks(v.id), en: teks(v.en) } : b ? structuredClone(b) : { id: '', en: '' });

// Clean one value against its field, falling back to the default.
export function rapikan(f, v) {
  switch (f.jenis) {
    case 'teks': case 'panjang': case 'jam': case 'ikon':
      return v === undefined ? structuredClone(f.bawaan ?? '') : teks(v);
    case 'dua': case 'duaPanjang':
      return v === undefined ? duaV(f.bawaan) : duaV(v);
    case 'saklar':
      return v === undefined ? Boolean(f.bawaan) : v === true || v === 'ya';
    case 'angka': {
      const n = Number(v);
      if (v === undefined || v === '' || !Number.isFinite(n)) return f.bawaan ?? 0;
      return Math.min(f.max ?? Infinity, Math.max(f.min ?? -Infinity, Math.round(n)));
    }
    case 'daftar':
      if (!Array.isArray(v)) return structuredClone(f.bawaan ?? []);
      return v.map((baris) => Object.fromEntries(f.isian.map((s) => [s.k, rapikan({ ...s, bawaan: s.jenis.startsWith('dua') ? dua('', '') : '' }, baris?.[s.k])])));
    default:
      return v;
  }
}

// Stored settings over the defaults, so fields added later get their default.
// Defaults from earlier versions. Saving any settings section stores every
// field, so an untouched default stays in the database. A stored value that
// still equals an old default is treated as unset and takes the current one.
const BAWAAN_LAMA = {
  ulasanTautan: ['', 'https://www.booking.com/searchresults.html?ss=Mambetron+Homestay'],
  whatsapp: [''],
  email: [''],
  heroLabel: [dua('Homestay keluarga di Raja Ampat', 'Family homestay in Raja Ampat')],
  heroJudul: [dua('Bangun pagi di atas laut paling biru', 'Wake up above the bluest sea')],
  heroTeks: [
    dua(
      'Pondok kayu di tepi laut, ikan segar dari nelayan kampung, dan terumbu karang beberapa langkah dari dermaga. Pesan langsung tanpa perantara.',
      'Wooden huts by the water, fresh fish from village fishermen and coral a few steps from the jetty. Book direct with no middleman.'),
    dua(
      'Pondok kayu di atas laut paling biru, karang selangkah dari dermaga, dan tuan rumah yang hangat.',
      'Wooden huts above the bluest sea, a reef a step from the jetty and warm hosts.'),
    dua(
      'Pondok kayu beratap rumbia di tepi pantai, dengan makan tiga kali sehari dan jemputan dari Waisai.',
      'Thatched wooden huts on the beach, with three meals a day and pickup from Waisai.'),
  ],
  heroKata: [[
    { ikon: 'air', teks: dua('Tenang', 'Calm') },
    { ikon: 'daun', teks: dua('Alami', 'Natural') },
    { ikon: 'hati', teks: dua('Hangat', 'Warm') },
  ]],
};
const sama = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function gabungSitus(simpanan) {
  const o = {};
  for (const g of PENGATURAN) {
    for (const f of g.isian) {
      const v = simpanan?.[f.k];
      o[f.k] = rapikan(f, BAWAAN_LAMA[f.k]?.some((x) => sama(v, x)) ? undefined : v);
    }
  }
  return o;
}

// Rooms, extras and settings put in an empty database the first time.
export const KAMAR_AWAL = [
  {
    slug: 'pondok-laguna', nama: 'Pondok Laguna', nama_en: 'Lagoon Hut',
    ringkas: 'Pondok panggung di atas air dengan teras menghadap laguna.',
    ringkas_en: 'A stilt hut over the water with a terrace facing the lagoon.',
    deskripsi: 'Pondok kayu berdiri di atas tiang, dengan teras pribadi tepat di atas laguna. Dari kasur kamu bisa mendengar ombak kecil memukul tiang rumah.\n\nCocok untuk pasangan yang ingin bangun melihat matahari terbit lalu langsung turun berenang.',
    deskripsi_en: 'A wooden hut on stilts with a private terrace right above the lagoon. From bed you can hear small waves lapping at the posts.\n\nMade for couples who want to wake up to the sunrise and slip straight into the water.',
    fasilitas: ['Kasur ganda dengan kelambu', 'Kipas angin', 'Teras pribadi di atas air', 'Kamar mandi bersama', 'Handuk dan sabun'],
    fasilitas_en: ['Double bed with mosquito net', 'Fan', 'Private terrace over the water', 'Shared bathroom', 'Towels and soap'],
    harga: 550000, harga_anak: null, skema_harga: 'orang', kapasitas: 2, jumlah_unit: 2, min_malam: 1, urutan: 1,
  },
  {
    slug: 'pondok-senja', nama: 'Pondok Senja', nama_en: 'Sunset Hut',
    ringkas: 'Di pasir putih menghadap barat, tempat terbaik melihat matahari terbenam.',
    ringkas_en: 'On the white sand facing west, the best seat for the sunset.',
    deskripsi: 'Pondok di tepi pantai dengan pintu yang terbuka langsung ke pasir. Sore hari langit di depan pondok berubah jingga, persis seperti warna tombol pesan kami.\n\nAda kamar mandi dalam, jadi cocok untuk tamu yang ingin sedikit lebih nyaman.',
    deskripsi_en: 'A beachfront hut whose door opens straight onto the sand. In the late afternoon the sky in front turns orange, just like our booking button.\n\nIt has its own bathroom, a good pick if you like a little extra comfort.',
    fasilitas: ['Kasur ganda atau dua kasur tunggal', 'Kamar mandi dalam', 'Kipas angin', 'Kelambu', 'Kursi santai di pantai'],
    fasilitas_en: ['Double or twin beds', 'Private bathroom', 'Fan', 'Mosquito net', 'Beach loungers'],
    harga: 600000, harga_anak: null, skema_harga: 'orang', kapasitas: 2, jumlah_unit: 1, min_malam: 1, urutan: 2,
  },
  {
    slug: 'pondok-keluarga', nama: 'Pondok Keluarga', nama_en: 'Family Hut',
    ringkas: 'Dua kamar tidur dan ruang duduk untuk keluarga atau rombongan kecil.',
    ringkas_en: 'Two bedrooms and a sitting room for families or small groups.',
    deskripsi: 'Pondok terbesar kami dengan dua kamar tidur yang berbagi ruang duduk dan teras panjang. Anak-anak bisa bermain di pasir sementara orang tua bersantai di teras.\n\nAnak di bawah 12 tahun mendapat harga khusus.',
    deskripsi_en: 'Our largest hut, with two bedrooms sharing a sitting room and a long terrace. Kids can play on the sand while parents relax on the terrace.\n\nChildren under 12 get a special rate.',
    fasilitas: ['Dua kamar tidur', 'Ruang duduk', 'Teras panjang', 'Kamar mandi dalam', 'Kelambu dan kipas angin'],
    fasilitas_en: ['Two bedrooms', 'Sitting room', 'Long terrace', 'Private bathroom', 'Mosquito nets and fans'],
    harga: 500000, harga_anak: 250000, skema_harga: 'orang', kapasitas: 4, jumlah_unit: 1, min_malam: 2, urutan: 3,
  },
];

export const LAYANAN_AWAL = [
  { nama: 'Antar jemput Waisai', nama_en: 'Waisai transfer', keterangan: 'Perahu pulang pergi dari Pelabuhan Waisai ke homestay.', keterangan_en: 'Return boat between Waisai harbour and the homestay.', harga: 1500000, satuan: 'pesanan', ikon: 'perahu', urutan: 1 },
  { nama: 'Snorkeling keliling pulau', nama_en: 'Island snorkelling trip', keterangan: 'Setengah hari ke tiga titik karang terbaik di sekitar kami, ditemani pemandu.', keterangan_en: 'Half a day at three of the best reefs nearby, with a guide.', harga: 350000, satuan: 'orang', ikon: 'snorkel', urutan: 2 },
  { nama: 'Melihat cenderawasih', nama_en: 'Bird of paradise walk', keterangan: 'Berangkat subuh ke hutan untuk melihat cenderawasih menari.', keterangan_en: 'A dawn walk into the forest to watch birds of paradise dance.', harga: 400000, satuan: 'orang', ikon: 'burung', urutan: 3 },
  { nama: 'Sewa alat snorkel', nama_en: 'Snorkel gear', keterangan: 'Masker, snorkel, dan kaki katak selama menginap.', keterangan_en: 'Mask, snorkel and fins for your whole stay.', harga: 50000, satuan: 'orang_malam', ikon: 'karang', urutan: 4 },
];

export { SATUAN } from './satuan.mjs';
