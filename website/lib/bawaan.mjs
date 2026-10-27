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
          'Homestay keluarga di Raja Ampat. Bungalow kayu di tepi laut, makan tiga kali sehari, jemputan dari Waisai, dan karang di depan dermaga. Pesan langsung dari situs resmi.',
          'A family homestay in Raja Ampat. Wooden bungalows by the sea, three meals a day, pickup from Waisai and a reef right off the jetty. Book direct on the official site.'),
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
      { k: 'kamarJudul', label: 'Judul halaman semua bungalow', jenis: 'dua', bawaan: dua('Pilih bungalowmu', 'Choose your bungalow') },
      { k: 'kamarTeks', label: 'Teks halaman semua bungalow', jenis: 'duaPanjang', bawaan: dua('Semua bungalow menghadap laut dan sudah termasuk makan tiga kali sehari.', 'Every bungalow faces the sea and includes three meals a day.') },
      { k: 'ulasanSkor', label: 'Nilai ulasan di samping kartu', jenis: 'teks', bawaan: '8,7', bantuan: 'Nilai dari situs ulasan, misalnya 8,7. Kosongkan bila tidak ingin ditampilkan.' },
      { k: 'ulasanSkala', label: 'Nilai tertinggi di situs ulasan', jenis: 'angka', bawaan: 10, min: 1, max: 100, bantuan: 'Booking.com memakai 10, Google memakai 5.' },
      { k: 'ulasanSumber', label: 'Nama situs ulasan', jenis: 'teks', bawaan: 'Booking.com' },
      { k: 'ulasanTautan', label: 'Tautan tombol ke situs ulasan', jenis: 'teks', bawaan: 'https://www.booking.com/hotel/id/mambetron-homestay.html', bantuan: 'Tombol Lihat di Booking.com di bawah nilai membuka tautan ini. Bawaannya halaman Mambetron di Booking.com. Bila dikosongkan, tombol membuka halaman semua bungalow.' },
      {
        k: 'ulasanWajah', label: 'Lingkaran tamu di samping nilai', jenis: 'daftar', tambah: 'Tambah tamu',
        bantuan: 'Tamu yang mengulas di situs ulasan, paling banyak enam. Tiap tamu tampil sebagai lingkaran berisi gambar wajah. Gambar wajah di sini adalah ilustrasi. Untuk wajah asli, unggah foto tamu di menu Foto situs, bagian Foto wajah tamu. Begitu ada foto di sana, lingkaran memakai foto itu dan daftar ini tidak dipakai. Nama hanya muncul saat lingkaran disentuh.',
        isian: [
          { k: 'nama', label: 'Nama', jenis: 'teks' },
          { k: 'wajah', label: 'Gambar wajah', jenis: 'wajah', bantuan: 'Tanpa pilihan, wajah dipilih otomatis supaya tidak ada yang kembar berdampingan.' },
        ],
        bawaan: [
          { nama: 'Adam', wajah: 'a' },
          { nama: 'Rijnders', wajah: 'f' },
          { nama: 'Linda', wajah: 'b' },
          { nama: 'Justyna', wajah: 'c' },
          { nama: 'Jeroen', wajah: 'd' },
          { nama: 'Christopher', wajah: 'h' },
        ],
      },
      { k: 'tentangJudul', label: 'Judul bagian tentang kami', jenis: 'dua', bantuan: 'Tampil di samping kotak rencana menginap.', bawaan: dua('Rumah kecil di ujung dermaga', 'A little home at the end of the jetty') },
      {
        k: 'tentangTeks', label: 'Teks tentang kami', jenis: 'duaPanjang', bawaan: dua(
          'Mambetron Homestay punya tujuh bungalow di tepi pantai sisi barat Pulau Kri, dekat dermaga Yenkoranu, dengan karang penuh ikan tepat di depan beranda. Kri adalah pulau kecil di tengah titik selam paling terkenal di Raja Ampat, sekitar satu jam naik perahu dari Waisai.\n\nTuan rumahnya keluarga setempat, dan tamu menyebut mereka ramah dan suka membantu. Makan tiga kali sehari dimasak di dapur keluarga, biasanya ikan segar, nasi, tempe, sayur, dan sambal.',
          "Mambetron Homestay has seven beachfront bungalows on the west side of Kri Island, near the Yenkoranu jetty, with a fish-filled reef right in front of the verandas. Kri is a small island in the middle of Raja Ampat's most famous dive sites, about an hour by boat from Waisai.\n\nYour hosts are a local family, and guests describe them as friendly and helpful. Three meals a day are cooked in the family kitchen, usually fresh fish, rice, tempeh, vegetables and sambal."),
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
          { ikon: 'snorkel', judul: dua('Karang di depan bungalow', 'A reef at the doorstep'), teks: dua('Snorkeling langsung dari depan bungalow, di karang yang membentang dari dermaga Yenkoranu.', 'Snorkel right off the bungalows, on a reef that runs from the Yenkoranu jetty.') },
          { ikon: 'makan', judul: dua('Makan tiga kali sehari', 'Three meals a day'), teks: dua('Dimasak di dapur keluarga, biasanya ikan segar, nasi, tempe, sayur, dan sambal.', 'Cooked in the family kitchen, usually fresh fish, rice, tempeh, vegetables and sambal.') },
          { ikon: 'perahu', judul: dua('Jemputan perahu', 'Boat pickup'), teks: dua('Kri sekitar satu jam naik perahu dari Waisai. Kabari jadwal kapal cepatmu dari Sorong, perahu kami siapkan.', 'Kri is about an hour by boat from Waisai. Share your fast ferry time from Sorong and we will have the boat ready.') },
          { ikon: 'hati', judul: dua('Tuan rumah yang hangat', 'Warm hosts'), teks: dua('Keluarga setempat yang menurut tamu ramah dan suka membantu.', 'A local family that guests describe as friendly and helpful.') },
        ],
      },
      { k: 'ajakanLabel', label: 'Label kecil di kotak ajakan', jenis: 'dua', bawaan: dua('Pesan langsung', 'Book direct') },
      { k: 'ajakanJudul', label: 'Judul kotak ajakan', jenis: 'dua', bawaan: dua('Laut sudah menunggu', 'The sea is waiting') },
      { k: 'ajakanTeks', label: 'Teks kotak ajakan', jenis: 'duaPanjang', bawaan: dua('Cek tanggal kosong dan amankan bungalowmu sekarang.', 'Check open dates and secure your bungalow now.') },
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
          { judul: dua('Pilih bungalow dan tanggal', 'Pick a bungalow and dates'), teks: dua('Lihat tanggal kosong di kalender lalu isi data tamu.', 'Check open dates on the calendar and fill in guest details.') },
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
          { tanya: dua('Apakah harga sudah termasuk makan?', 'Are meals included?'), jawab: dua('Ya. Harga bungalow sudah termasuk makan pagi, siang, dan malam, juga air minum, teh, dan kopi.', 'Yes. The rate includes breakfast, lunch and dinner, plus drinking water, tea and coffee.') },
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
          'Terima kasih, pesananmu sudah kami terima. Bungalow kami tahan sambil menunggu uang muka.',
          'Thank you, we have your booking. We are holding the bungalow for you while we wait for the deposit.'),
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
    keterangan: 'Harga bungalow dan kegiatan diisi, ditampilkan, dan dibayar dalam rupiah. Di bawah setiap harga, tamu melihat perkiraannya dalam dolar Amerika, euro, yen, dan yuan.',
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
    case 'teks': case 'panjang': case 'jam': case 'ikon': case 'wajah':
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
  tentangTeks: [dua(
    'Mambetron Homestay adalah rumah singgah keluarga di Raja Ampat. Maskot kami, Mambe, adalah kuskus, hewan pemalu bermata besar yang suka mengintip dari balik dahan hutan pulau.\n\nDi sini hari dimulai dengan matahari terbit di atas laut dan ditutup dengan obrolan di dermaga. Tidak ada yang terburu-buru. Kamu cukup datang, kami yang urus sisanya.',
    'Mambetron Homestay is a family guesthouse in Raja Ampat. Our mascot Mambe is a cuscus, the shy big-eyed animal that peeks out from the branches of the island forest.\n\nDays here start with sunrise over the sea and end with stories on the jetty. Nobody is in a hurry. Just come, we will take care of the rest.')],
  sorotan: [[
    { ikon: 'snorkel', judul: dua('Karang di depan rumah', 'A reef at the doorstep'), teks: dua('Turun dari dermaga dan langsung berenang bersama ikan karang, penyu, dan kadang hiu sirip hitam.', 'Step off the jetty and swim with reef fish, turtles and the odd blacktip shark.') },
    { ikon: 'makan', judul: dua('Makan tiga kali sehari', 'Three meals a day'), teks: dua('Masakan rumahan dengan ikan segar, sayur kebun, dan sambal buatan mama. Sudah termasuk dalam harga.', 'Home cooking with fresh fish, garden greens and homemade sambal. Included in the rate.') },
    { ikon: 'perahu', judul: dua('Dijemput di Waisai', 'Pickup in Waisai'), teks: dua('Kabari jadwal kapal cepatmu, kami menunggu di pelabuhan dengan perahu.', 'Tell us your ferry time and we will wait at the harbour with our boat.') },
    { ikon: 'hati', judul: dua('Tuan rumah yang hangat', 'Warm hosts'), teks: dua('Kami mengenal setiap sudut pulau dan senang berbagi cerita kampung.', 'We know every corner of the island and love sharing village stories.') },
  ]],
  ulasanWajah: [[
    { nama: 'Adam', huruf: 'A' }, { nama: 'Rijnders', huruf: 'L' }, { nama: 'Linda', huruf: 'L' },
    { nama: 'Justyna', huruf: 'J' }, { nama: 'Jeroen', huruf: 'J' }, { nama: 'Christopher', huruf: 'C' },
  ]],
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

// The huts were renamed bungalows in October 2026. A default stored before
// that still says pondok or hut and takes the current wording.
const idLama = (t) => t.replace(/Bungalow/g, 'Pondok').replace(/bungalow/g, 'pondok');
const enLama = (t) => t.replace(/Bungalows/g, 'Huts').replace(/bungalows/g, 'huts').replace(/Bungalow/g, 'Hut').replace(/bungalow/g, 'hut');
function sebelumBungalow(v) {
  if (typeof v === 'string') return idLama(v);
  if (Array.isArray(v)) return v.map(sebelumBungalow);
  if (v && typeof v === 'object') {
    const k = Object.keys(v);
    if (k.length === 2 && 'id' in v && 'en' in v) return { id: idLama(v.id), en: enLama(v.en) };
    return Object.fromEntries(Object.entries(v).map(([a, b]) => [a, sebelumBungalow(b)]));
  }
  return v;
}
for (const f of PENGATURAN.flatMap((g) => g.isian)) {
  const lama = sebelumBungalow(f.bawaan);
  if (JSON.stringify(lama) !== JSON.stringify(f.bawaan)) (BAWAAN_LAMA[f.k] ??= []).push(lama);
}
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
    slug: 'bungalow-tepi-pantai', nama: 'Bungalow Tepi Pantai', nama_en: 'Beachfront Bungalow',
    ringkas: 'Tujuh bungalow di tepi pantai Pulau Kri, masing-masing untuk dua orang, dengan kamar mandi dalam dan beranda menghadap laut.',
    ringkas_en: 'Seven beachfront bungalows on Kri Island, each sleeping two, with a private bathroom and a sea-facing veranda.',
    deskripsi: 'Tujuh bungalow di tepi pantai sisi barat Pulau Kri, dekat dermaga Yenkoranu, dengan karang penuh ikan tepat di depan beranda. Kri adalah pulau kecil di tengah titik selam paling terkenal di Raja Ampat, sekitar satu jam naik perahu dari Waisai.\n\n## Bungalow\nKetujuh bungalow berdiri langsung di pantai, masing-masing untuk dua orang, dengan kamar mandi dalam dan beranda menghadap laut. Saat air pasang, laut bisa sampai dekat bungalow. Bungalownya sederhana, tanpa AC dan air panas, dibuat untuk tamu yang mencari kehidupan pulau, bukan resor. Tamu bilang bungalownya lapang dan bersih.\n\n## Makan, listrik, dan internet\nMakan tiga kali sehari dimasak di dapur keluarga, biasanya ikan segar, nasi, tempe, sayur, dan sambal. Tamu bilang masakannya enak dan segar, walau menunya sederhana dan sering berulang. Listrik dari genset pada sore dan malam hari. Internet terbatas, jadi bersiaplah lebih sering luring.\n\n## Kegiatan\n**Snorkeling langsung dari depan bungalow**, di karang yang membentang dari dermaga Yenkoranu sampai depan Mambetron. Tamu menyebutnya salah satu karang tepi pantai terbaik di Raja Ampat. Cape Kri dan Sardine Reef, dua titik selam terkenal, ada di dekatnya, dan penyelaman bisa diatur dengan dive center di Kri. Perjalanan perahu ke tempat sekitar, seperti melihat cenderawasih atau ke Kali Biru, juga bisa diatur. Sepakati harganya sebelum berangkat.\n\n## Cara ke sini\nKri hanya bisa dicapai dengan perahu, sekitar satu jam dari Waisai. Tanyakan jemputan perahu saat memesan, dan kabari jadwal kapal cepatmu dari Sorong supaya perahu bisa disiapkan.\n\n## Perlu diketahui\nTuan rumahmu keluarga setempat, dan tamu menyebut mereka ramah dan suka membantu. Bawa uang tunai secukupnya karena tidak ada ATM di pulau. Mohon bawa kembali sampah plastik ke Waisai.',
    deskripsi_en: "Seven beachfront bungalows on the west side of Kri Island, near the Yenkoranu jetty, with a fish-filled reef right in front of the verandas. Kri is a small island in the middle of Raja Ampat's most famous dive sites, about an hour by boat from Waisai.\n\n## The bungalows\nAll seven bungalows sit right on the beach, each sleeping two, with a private bathroom and a sea-facing veranda. At high tide the sea can come close to the bungalows. They are simple, with no air conditioning or hot water, made for guests who want island life rather than a resort. Guests say the bungalows are spacious and clean.\n\n## Meals, power and internet\nThree meals a day are cooked in the family kitchen, usually fresh fish, rice, tempeh, vegetables and sambal. Guests say the food is tasty and fresh, though the menu is simple and often repeats. Power comes from a generator in the evening and at night. Internet is limited, so plan to be offline more often.\n\n## Things to do\n**Snorkel right off the bungalows**, on a reef that runs from the Yenkoranu jetty to the front of Mambetron. Guests call it one of the best shore reefs in Raja Ampat. Cape Kri and Sardine Reef, two famous dive sites, are close by, and dives can be arranged with a dive centre on Kri. Boat trips to nearby spots, such as birds of paradise or Kali Biru, can be arranged. Agree on the price before you go.\n\n## Getting there\nKri can only be reached by boat, about an hour from Waisai. Ask us about a boat pickup when you book, and share your fast ferry schedule from Sorong so the boat can be ready.\n\n## Good to know\nYour hosts are a local family, and guests describe them as friendly and helpful. Bring enough cash, as there is no ATM on the island. Please take plastic waste back to Waisai.",
    fasilitas: ['Di tepi pantai', 'Beranda menghadap laut', 'Kamar mandi dalam', 'Makan tiga kali sehari', 'Listrik genset sore dan malam', 'Internet terbatas'],
    fasilitas_en: ['Right on the beach', 'Sea-facing veranda', 'Private bathroom', 'Three meals a day', 'Generator power in the evening and at night', 'Limited internet'],
    harga: 550000, harga_anak: null, skema_harga: 'orang', kapasitas: 2, jumlah_unit: 7, min_malam: 1, urutan: 1,
  },
];

// Names of the first release of KAMAR_AWAL, renamed once to bungalow (lib/db.ts).
export const KAMAR_NAMA_LAMA = { nama: ['Pondok Tepi Pantai', 'Bungalow Tepi Pantai'], nama_en: ['Beachfront Hut', 'Beachfront Bungalow'] };

// Room texts of the first release of KAMAR_AWAL. A room whose text still
// equals these takes the current text once (lib/db.ts), so the description
// from the DAMPIER listing reaches sites that never edited it.
export const KAMAR_TEKS_LAMA = {
  ringkas: 'Tujuh pondok dengan tipe dan ukuran yang sama, semuanya di tepi pantai menghadap laut.',
  ringkas_en: 'Seven huts of the same type and size, all on the beach facing the sea.',
  deskripsi: 'Semua pondok kami sama tipe dan ukurannya, dan semuanya berdiri di tepi pantai menghadap langsung ke laut. Jadi pondok mana pun yang kamu dapat, pemandangannya sama.\n\nHarga sudah termasuk makan tiga kali sehari, dan wifi tersedia untuk tamu.',
  deskripsi_en: 'All our huts share the same type and size, and every one stands on the beach facing straight out to sea. Whichever hut you get, the view is the same.\n\nThe rate includes three meals a day, and Wi-Fi is available for guests.',
  fasilitas: 'Di tepi pantai\nMenghadap langsung ke laut\nMakan tiga kali sehari\nWifi',
  fasilitas_en: 'Right on the beach\nFacing straight out to sea\nThree meals a day\nWi-Fi',
};

// The three sample huts the site shipped with before the real rooms were
// known. A database that still holds exactly these, untouched and unbooked
// apart from the first, is moved to KAMAR_AWAL once (lib/db.ts).
export const KAMAR_LAMA = [
  { slug: 'pondok-laguna', nama: 'Pondok Laguna', harga: 550000 },
  { slug: 'pondok-senja', nama: 'Pondok Senja', harga: 600000 },
  { slug: 'pondok-keluarga', nama: 'Pondok Keluarga', harga: 500000 },
];

export const LAYANAN_AWAL = [
  { nama: 'Antar jemput Waisai', nama_en: 'Waisai transfer', keterangan: 'Perahu pulang pergi dari Pelabuhan Waisai ke homestay.', keterangan_en: 'Return boat between Waisai harbour and the homestay.', harga: 1500000, satuan: 'pesanan', ikon: 'perahu', urutan: 1 },
  { nama: 'Snorkeling keliling pulau', nama_en: 'Island snorkelling trip', keterangan: 'Setengah hari ke tiga titik karang terbaik di sekitar kami, ditemani pemandu.', keterangan_en: 'Half a day at three of the best reefs nearby, with a guide.', harga: 350000, satuan: 'orang', ikon: 'snorkel', urutan: 2 },
  { nama: 'Melihat cenderawasih', nama_en: 'Bird of paradise walk', keterangan: 'Berangkat subuh ke hutan untuk melihat cenderawasih menari.', keterangan_en: 'A dawn walk into the forest to watch birds of paradise dance.', harga: 400000, satuan: 'orang', ikon: 'burung', urutan: 3 },
  { nama: 'Sewa alat snorkel', nama_en: 'Snorkel gear', keterangan: 'Masker, snorkel, dan kaki katak selama menginap.', keterangan_en: 'Mask, snorkel and fins for your whole stay.', harga: 50000, satuan: 'orang_malam', ikon: 'karang', urutan: 4 },
];

export { SATUAN } from './satuan.mjs';
