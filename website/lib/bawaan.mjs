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
  air: 'Air', kamera: 'Kamera', wifi: 'Wifi', bulan: 'Bulan', jam: 'Jam', globe: 'Bola dunia', speedboat: 'Speedboat',
};
export const IKON_PILIHAN = Object.keys(IKON_LABEL);

// The about video the owner sent, a TikTok from DAMPIER media. New sites get
// it as the default, lib/db.ts puts it in once on sites that have no video yet.
export const VIDEO_AWAL = [{ url: 'https://www.tiktok.com/@thedampiermedia/video/7699821441662930182', judul: '' }];

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
      {
        k: 'googleVerifikasi', label: 'Kode verifikasi Google Search Console', jenis: 'teks', bawaan: '',
        bantuan: 'Di Search Console pilih properti Awalan URL dengan alamat situs ini, lalu metode Tag HTML. Tempel tag meta itu utuh atau isinya saja, simpan, lalu tekan Verifikasi di Search Console. Tidak perlu diisi bila situs diverifikasi lewat DNS. Peta situs untuk Search Console ada di alamat situs ditambah /sitemap.xml.',
      },
      { k: 'kakiTeks', label: 'Teks di kaki halaman', jenis: 'duaPanjang', bawaan: dua('Homestay keluarga di Raja Ampat. Dikelola dengan sepenuh hati, untuk laut yang tetap biru.', 'A family homestay in Raja Ampat. Run with heart, for a sea that stays blue.') },
      { k: 'pengelolaTeks', label: 'Tulisan pengelola', jenis: 'dua', bawaan: dua('Dikelola oleh', 'Managed by'), bantuan: 'Tampil di baris paling bawah kaki halaman, di bawah kartu pilih tanggal, tombol kirim pesanan, dan bagian bayar halaman pesanan, serta di kaki surel, diikuti alamat situs pengelola.' },
      { k: 'pengelola', label: 'Situs pengelola', jenis: 'teks', bawaan: 'thedampier.com', bantuan: 'Alamat situs yang tampil dan bisa diketuk, misalnya thedampier.com. Kosongkan bila baris pengelola tidak ingin ditampilkan di mana pun.' },
    ],
  },
  {
    kunci: 'kontak',
    judul: 'Kontak dan lokasi',
    keterangan: 'Nomor WhatsApp dipakai untuk semua tombol WhatsApp di situs. Nomor, surel, dan media sosial tampil di kolom Hubungi kami di kaki halaman.',
    isian: [
      { k: 'whatsapp', label: 'Nomor WhatsApp', jenis: 'teks', bawaan: '6281390849237', bantuan: 'Tulis dengan kode negara tanpa tanda plus, misalnya 6281234567890.' },
      {
        k: 'pesanCekWa', label: 'Pesan WhatsApp tombol Cek ketersediaan', jenis: 'duaPanjang', bawaan: dua(
          'Halo Mambetron Homestay, apakah {bungalow} masih tersedia untuk {tamu}, tiba {tiba} dan pulang {pulang} ({malam})? Terima kasih.',
          'Hi Mambetron Homestay, is {bungalow} available for {tamu}, arriving {tiba} and leaving {pulang} ({malam})? Thank you.'),
        bantuan: 'Terkirim lewat WhatsApp saat tamu mengetuk Cek ketersediaan di kartu pilih tanggal. {tiba} dan {pulang} diganti tanggal yang dipilih, {malam} jumlah malamnya, {tamu} jumlah tamunya, dan {bungalow} nama bungalownya.',
      },
      { k: 'email', label: 'Surel', jenis: 'teks', bawaan: 'halo@mambetronhomestay.com' },
      { k: 'instagram', label: 'Akun Instagram', jenis: 'teks', bawaan: 'mambetronhomestay', bantuan: 'Tanpa tanda @. Kosongkan bila ikon Instagram tidak ingin ditampilkan.' },
      { k: 'facebook', label: 'Tautan Facebook', jenis: 'teks', bawaan: 'https://www.facebook.com/', bantuan: 'Tempel tautan lengkap halaman Facebook, untuk ikon di kaki halaman. Selama belum diganti, ikonnya membuka halaman depan Facebook. Kosongkan bila ikon tidak ingin ditampilkan.' },
      { k: 'tiktok', label: 'Tautan TikTok', jenis: 'teks', bawaan: 'https://www.tiktok.com/', bantuan: 'Tempel tautan lengkap akun TikTok, misalnya https://www.tiktok.com/@namaakun, untuk ikon di kaki halaman. Tautan satu video untuk halaman utama diisi di bagian Halaman utama, isian Video tentang kami. Kosongkan bila ikon tidak ingin ditampilkan.' },
      { k: 'youtube', label: 'Tautan YouTube', jenis: 'teks', bawaan: 'https://www.youtube.com/', bantuan: 'Tempel tautan lengkap kanal YouTube, untuk ikon di kaki halaman. Selama belum diganti, ikonnya membuka halaman depan YouTube. Kosongkan bila ikon tidak ingin ditampilkan.' },
      { k: 'alamat', label: 'Alamat', jenis: 'duaPanjang', bawaan: dua('', '') },
      { k: 'petaKoordinat', label: 'Titik peta', jenis: 'teks', bawaan: '', bantuan: 'Garis lintang dan bujur dari Google Maps, misalnya -0.5605, 130.668. Dipakai untuk tombol Buka di Google Maps di bagian lokasi bila tautan Google Maps kosong.' },
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
      {
        k: 'tentangVideo', label: 'Video tentang kami', jenis: 'daftar', tambah: 'Tambah video',
        bantuan: 'Tautan YouTube, YouTube Shorts, Instagram Reels, atau TikTok, paling banyak tiga, menggantikan foto di samping teks tentang kami. Video pertama tampil paling tinggi di tengah, video kedua di kiri dan ketiga di kanan lebih pendek, lalu membesar saat disentuh kursor. Di HP video digeser ke samping. Video tegak paling pas. Tanpa video, bagian ini memakai foto tentang kami dari Foto situs.',
        isian: [
          { k: 'url', label: 'Tautan video', jenis: 'teks' },
          { k: 'judul', label: 'Judul singkat', jenis: 'teks', bantuan: 'Untuk pembaca layar, tidak tampil di halaman. Boleh dikosongkan.' },
        ],
        bawaan: VIDEO_AWAL,
      },
      { k: 'layananJudul', label: 'Judul bagian kegiatan', jenis: 'dua', bawaan: dua('Kegiatan dan antar jemput', 'Trips and transfers') },
      { k: 'layananTeks', label: 'Teks bagian kegiatan', jenis: 'duaPanjang', bawaan: dua('Tambahkan saat memesan atau tanyakan langsung ke kami.', 'Add them when you book or just ask us.') },
      { k: 'galeriJudul', label: 'Nama galeri foto, tidak tampil dan hanya dibacakan pembaca layar', jenis: 'dua', bawaan: dua('Sehari di Mambetron', 'A day at Mambetron') },
      { k: 'ulasanJudul', label: 'Judul bagian ulasan', jenis: 'dua', bawaan: dua('Kata tamu', 'What guests say') },
      { k: 'lokasiLabel', label: 'Label kecil bagian lokasi', jenis: 'dua', bawaan: dua('Menuju Pulau Kri', 'Getting to Kri Island') },
      { k: 'lokasiJudul', label: 'Judul bagian lokasi', jenis: 'dua', bawaan: dua('Cara ke sini', 'How to get here') },
      {
        k: 'caraSampai', label: 'Teks pembuka bagian lokasi', jenis: 'duaPanjang', bantuan: 'Tampil di samping judul, di atas peta rute.', bawaan: dua(
          'Mambetron ada di Pulau Kri, di tengah Selat Dampier. Dari mana pun kamu berangkat, jalurnya sama. Terbang ke Sorong, naik kapal cepat ke Waisai, lalu menyeberang ke Kri dengan perahu kami.',
          'Mambetron is on Kri Island in the Dampier Strait. Wherever you start, the route is the same. Fly to Sorong, take the fast ferry to Waisai, then cross to Kri on our boat.'),
      },
      {
        k: 'rute', label: 'Langkah perjalanan', jenis: 'daftar', tambah: 'Tambah langkah',
        bantuan: 'Kartu bernomor di samping peta. Tiga langkah pertama juga bernomor di peta, berurutan di Bandara Sorong, di kapal cepat menuju Waisai, dan di Pulau Kri.',
        isian: [
          { k: 'judul', label: 'Judul', jenis: 'dua' },
          { k: 'label', label: 'Keterangan singkat', jenis: 'dua', bantuan: 'Tampil di pojok kartu, misalnya Sekitar 2 jam. Boleh dikosongkan.' },
          { k: 'teks', label: 'Teks', jenis: 'duaPanjang' },
        ],
        bawaan: [
          { judul: dua('Terbang ke Sorong', 'Fly to Sorong'), label: dua('Bandara SOQ', 'SOQ airport'), teks: dua('Mendarat di Bandara Domine Eduard Osok (SOQ) di Sorong. Penerbangan biasanya transit di Jakarta atau Makassar.', 'Land at Domine Eduard Osok Airport (SOQ) in Sorong. Flights usually connect through Jakarta or Makassar.') },
          { judul: dua('Kapal cepat ke Waisai', 'Fast ferry to Waisai'), label: dua('Sekitar 2 jam', 'About 2 hours'), teks: dua('Dari bandara sekitar 15–20 menit ke Pelabuhan Rakyat Sorong. Kapal cepat ke Waisai berangkat setiap hari.', 'From the airport it is about 15–20 minutes to Pelabuhan Rakyat harbour in Sorong. Fast ferries to Waisai leave every day.') },
          { judul: dua('Perahu ke Pulau Kri', 'Boat to Kri Island'), label: dua('Sekitar 1 jam', 'About 1 hour'), teks: dua('Perahu kami menunggu di Pelabuhan Waisai lalu mengantarmu ke bungalow di tepi pantai Pulau Kri.', 'Our boat waits at Waisai harbour and takes you to the beachfront bungalows on Kri Island.') },
        ],
      },
      {
        k: 'lokasiInfo', label: 'Kartu info perjalanan', jenis: 'daftar', tambah: 'Tambah kartu', bantuan: 'Kartu kecil berikon di bawah peta.',
        isian: [
          { k: 'ikon', label: 'Ikon', jenis: 'ikon' },
          { k: 'teks', label: 'Teks', jenis: 'duaPanjang' },
        ],
        bawaan: [
          { ikon: 'perahu', teks: dua('Perahu kami menjemput di Pelabuhan Waisai. Tambahkan antar jemput saat memesan bungalow.', 'Our boat picks you up at Waisai harbour. Add the transfer when you book your bungalow.') },
          { ikon: 'tiket', teks: dua('Setiap tamu Raja Ampat wajib membawa Kartu Jasa Lingkungan. Kartu ini bisa dibeli di Sorong atau Waisai.', 'Every visitor to Raja Ampat needs the environmental service card. You can buy it in Sorong or Waisai.') },
        ],
      },
      {
        k: 'lokasiCatatan', label: 'Catatan perjalanan', jenis: 'duaPanjang', bantuan: 'Tampil di bawah langkah perjalanan, di atas tombol WhatsApp.', bawaan: dua(
          'Jadwal kapal cepat bisa berubah karena cuaca. Kirim jadwal kapalmu lewat WhatsApp supaya perahu kami menunggu di Waisai.',
          'Ferry times can change with the weather. Send us your ferry time on WhatsApp so our boat is waiting in Waisai.'),
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
          { tanya: dua('Bagaimana listrik, wifi, dan sinyal?', 'What about power, Wi-Fi and phone signal?'), jawab: dua('Listrik menyala 12 jam, pukul 18.00 sampai 06.00, dan selama itu ada wifi internet Starlink gratis. Sinyal telepon terbatas, jadi kabari keluarga sebelum menyeberang.', 'Power is on for 12 hours, from 18:00 to 06:00, with free Starlink Wi-Fi the whole time. Phone signal is limited, so let your family know before you cross.') },
          { tanya: dua('Bagaimana cara membayar?', 'How do I pay?'), jawab: dua('Setelah memesan, transfer total pembayaran ke rekening yang tertera lalu kirim bukti lewat WhatsApp.', 'After booking, transfer the full amount to the account shown and send the receipt on WhatsApp.') },
          { tanya: dua('Bisakah membatalkan pesanan?', 'Can I cancel?'), jawab: dua('Tergantung paket harga yang kamu pilih saat memesan. Syarat ganti tanggal dan pembatalan tiap paket tertulis di halaman pesan dan di halaman pesananmu.', 'It depends on the rate you pick when booking. The date change and cancellation terms of each rate are shown on the booking form and on your booking page.') },
        ],
      },
    ],
  },
  {
    kunci: 'pemesanan',
    judul: 'Pemesanan dan pembayaran',
    keterangan: 'Jam tiba dan pulang, pembayaran, paket harga, rekening, dan ketentuan menginap.',
    isian: [
      { k: 'checkIn', label: 'Jam check-in', jenis: 'jam', bawaan: '12:00' },
      { k: 'checkOut', label: 'Jam check-out', jenis: 'jam', bawaan: '10:00' },
      {
        k: 'dpPersen', label: 'Dibayar di muka dalam persen', jenis: 'angka', min: 0, max: 100, bawaan: 100,
        bantuan: 'Isi 100 supaya tamu membayar penuh setelah memesan, tanpa uang muka. Isi angka lebih kecil bila ingin memakai uang muka lagi, sisanya dibayar saat tiba. Isi 0 bila semua dibayar saat tiba.',
      },
      {
        k: 'paketHarga', label: 'Paket harga', jenis: 'daftar', tambah: 'Tambah paket',
        bantuan: 'Pilihan harga di halaman pesan. Harga bungalow tiap paket adalah harga bungalow ditambah persen paket itu, harga kegiatan tidak berubah. Paket pertama terpilih lebih dulu. Syaratnya ikut tersimpan di setiap pesanan, jadi pesanan lama tetap memakai syarat saat dipesan. Kosongkan semua paket bila tidak memakai paket.',
        isian: [
          { k: 'nama', label: 'Nama paket', jenis: 'dua' },
          { k: 'syarat', label: 'Syarat ganti tanggal dan pembatalan', jenis: 'duaPanjang' },
          { k: 'persen', label: 'Tambahan harga bungalow dalam persen', jenis: 'angka', min: 0, max: 200 },
        ],
        bawaan: [
          {
            nama: dua('Standar', 'Standard'), persen: 0,
            syarat: dua('Harga paling hemat. Tanggal tidak bisa diganti dan pembayaran tidak dikembalikan bila batal.', 'Our lowest price. Dates cannot be changed and the payment is not refunded if you cancel.'),
          },
          {
            nama: dua('Comfort', 'Comfort'), persen: 10,
            syarat: dua('Bisa ganti tanggal paling lambat 7 hari sebelum tiba. Pembayaran tidak dikembalikan bila batal.', 'Change your dates up to 7 days before arrival. The payment is not refunded if you cancel.'),
          },
          {
            nama: dua('Flexible', 'Flexible'), persen: 20,
            syarat: dua('Bisa ganti tanggal kapan saja sampai hari kedatangan. Batal gratis dengan uang kembali penuh sampai 7 hari sebelum tiba.', 'Change your dates any time up to your arrival day. Free cancellation with a full refund until 7 days before arrival.'),
          },
        ],
      },
      { k: 'batasHari', label: 'Bisa dipesan sampai berapa hari ke depan', jenis: 'angka', min: 30, max: 730, bawaan: 365 },
      { k: 'jedaHari', label: 'Paling cepat berapa hari sebelum tiba', jenis: 'angka', min: 0, max: 30, bawaan: 1, bantuan: 'Isi 0 bila tamu boleh memesan untuk hari ini juga.' },
      {
        k: 'usiaGratis', label: 'Anak gratis di bawah usia (tahun)', jenis: 'angka', min: 1, max: 12, bawaan: 5,
        bantuan: 'Anak di bawah usia ini menginap gratis dan tidur bersama orang tuanya. Anak sejak usia ini membayar penuh seperti dewasa. Berlaku di kartu pilih tanggal, formulir pesan, dan halaman bungalow. Untuk lembar bayar DAMPIER, isi aturan yang sama di listing Mambetron di DAMPIER.',
      },
      { k: 'anakPerPondok', label: 'Anak gratis per bungalow', jenis: 'angka', min: 1, max: 4, bawaan: 1, bantuan: 'Berapa anak di bawah usia gratis yang boleh ikut di satu bungalow, di luar tamu yang membayar.' },
      {
        k: 'bank', label: 'Rekening pembayaran', jenis: 'daftar', tambah: 'Tambah rekening',
        isian: [
          { k: 'bank', label: 'Bank', jenis: 'teks' },
          { k: 'nomor', label: 'Nomor rekening', jenis: 'teks' },
          { k: 'atasNama', label: 'Atas nama', jenis: 'teks' },
          { k: 'swift', label: 'Kode SWIFT', jenis: 'teks', bantuan: 'Untuk tamu yang mentransfer dari luar negeri, 8 atau 11 huruf, misalnya BRINIDJA untuk BRI. Pastikan ke bank bila ragu. Boleh dikosongkan.' },
        ],
        bawaan: [],
      },
      {
        k: 'catatanBayar', label: 'Petunjuk pembayaran', jenis: 'duaPanjang', bawaan: dua(
          'Transfer total pembayaran dalam 24 jam setelah memesan, lalu kirim bukti transfer lewat WhatsApp.',
          'Transfer the full amount within 24 hours of booking, then send the receipt on WhatsApp.'),
      },
      {
        k: 'pesanTerima', label: 'Ucapan setelah tamu memesan', jenis: 'duaPanjang', bawaan: dua(
          'Terima kasih, pesananmu sudah kami terima. Bungalow kami tahan sambil menunggu pembayaran.',
          'Thank you, we have your booking. We are holding the bungalow for you while we wait for your payment.'),
      },
      {
        k: 'ketentuan', label: 'Ketentuan menginap', jenis: 'duaPanjang', bawaan: dua(
          'Jam tiba dan pulang bisa disesuaikan dengan jadwal kapal. Kabari kami bila jadwalmu berubah.\n\nGanti tanggal dan pembatalan mengikuti paket harga yang kamu pilih saat memesan. Syaratnya tertulis di halaman pesananmu.\n\nJaga laut kita. Jangan menginjak atau mengambil karang, dan bawa pulang sampah plastikmu.',
          'Arrival and departure times can follow the ferry schedule. Let us know if your plans change.\n\nDate changes and cancellations follow the rate you picked when booking. The terms are shown on your booking page.\n\nLook after our sea. Do not stand on or take coral, and take your plastic home with you.'),
      },
    ],
  },
  {
    kunci: 'kebijakan',
    judul: 'Kebijakan privasi dan syarat',
    keterangan: 'Halaman Kebijakan privasi dan Syarat dan ketentuan, yang ditautkan di baris paling bawah footer dan di persetujuan formulir pesan. Tulisan {nama}, {lokasi}, {kontak}, {checkIn}, {checkOut}, dan {usiaGratis} diganti otomatis dengan isian di Identitas, Kontak dan lokasi, dan Pemesanan. Baris yang diawali ## menjadi subjudul, dan baris yang diawali - menjadi daftar.',
    isian: [
      { k: 'kebijakanTanggal', label: 'Terakhir diperbarui', jenis: 'teks', bawaan: '2026-11-22', bantuan: 'Tanggal dengan bentuk tahun-bulan-tanggal, misalnya 2026-11-22. Ubah setiap kali isi kebijakan atau syarat diubah.' },
      { k: 'privasiTeks', label: 'Kebijakan privasi', jenis: 'duaPanjang', bawaan: dua(
        "Kebijakan privasi ini menjelaskan data apa yang {nama} kumpulkan saat kamu membuka situs ini, memesan bungalow, atau menghubungi kami, untuk apa data itu dipakai, dan apa hakmu atas data itu. Kami mengikuti Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.\n\n## Data yang kami kumpulkan\nSaat memesan, kamu mengisi nama, nomor WhatsApp atau telepon, alamat email, negara asal, rencana kedatangan, dan catatan bila ada. Kami juga menyimpan rincian pesanan, yaitu tanggal menginap, jumlah tamu, bungalow, kegiatan tambahan, dan status pembayaran.\n\nSaat kamu membuka situs, kami menghitung kunjungan sendiri tanpa cookie dan tanpa menyimpan alamat IP. Yang tercatat hanya halaman yang dibuka, situs asal kunjungan, perkiraan negara, dan jenis perangkat secara umum.\n\n## Untuk apa data dipakai\nData pribadimu kami pakai untuk hal-hal berikut.\n- Memproses dan mengonfirmasi pesananmu.\n- Menghubungimu tentang pesanan, jemputan perahu, dan perubahan jadwal.\n- Mengirim email konfirmasi pesanan dan pembayaran.\n- Memenuhi kewajiban pembukuan dan pajak.\n\nKami tidak menjual data pribadimu dan tidak memakainya untuk iklan.\n\n## Pembayaran\nPembayaran online diproses oleh penyedia pembayaran Midtrans atau PayPal, langsung atau lewat DAMPIER (thedampier.com), mitra pemesanan online kami. Data kartu dan rekeningmu diisi langsung di halaman penyedia pembayaran itu dan tidak pernah sampai ke server kami.\n\n## Dengan siapa data dibagikan\nData hanya dibagikan sejauh perlu untuk menjalankan pesananmu.\n- DAMPIER, yang mengelola kalender kamar dan pemesanan online kami, menerima nama, tanggal, dan jumlah tamu pesananmu, dan data lengkap untuk pesanan yang dibayar lewat lembar pesan DAMPIER.\n- Midtrans dan PayPal, untuk memproses pembayaran.\n- Penyedia hosting dan email situs ini, untuk menyimpan data dan mengirim email.\n- Juru mudi perahu yang menjemputmu, hanya nama dan jadwal kedatanganmu.\n\nSitus pemesanan lain seperti Booking.com hanya menerima tanggal bungalow yang terisi, tanpa data pribadimu.\n\n## Cookie dan penyimpanan di peramban\nSitus ini hanya memakai cookie yang diperlukan, untuk mengingat bahasa dan mata uang pilihanmu dan untuk menjaga sesi pengelola yang masuk ke panel. Tanggal yang kamu pilih di kalender disimpan di peramban supaya tidak perlu dipilih ulang. Kami tidak memakai cookie iklan atau pelacak pihak ketiga. Video YouTube diputar lewat youtube-nocookie.com, sedangkan video TikTok dan Instagram mengikuti kebijakan privasi masing-masing.\n\n## Berapa lama data disimpan\nData pesanan disimpan selama diperlukan untuk pesanan itu dan selama diwajibkan aturan pembukuan dan pajak di Indonesia. Setelah itu data dihapus atau dibuat tanpa nama.\n\n## Keamanan\nData disimpan di server dengan akses terbatas untuk pengelola homestay. Halaman pesananmu hanya bisa dibuka lewat tautan rahasia yang dikirim kepadamu.\n\n## Anak\nKami tidak meminta data pribadi anak selain jumlah dan usianya untuk menghitung harga.\n\n## Hakmu\nKamu berhak meminta salinan data pribadimu, membetulkan data yang salah, meminta data dihapus bila tidak lagi diperlukan, dan menarik persetujuan. Kirim permintaanmu lewat {kontak}, dan kami akan menjawab secepatnya.\n\n## Perubahan kebijakan\nKebijakan ini bisa diperbarui sewaktu-waktu. Tanggal pembaruan terakhir tertulis di atas halaman ini.\n\n## Hubungi kami\n{nama}, {lokasi}. Pertanyaan tentang privasi bisa dikirim lewat {kontak}.",
        "This privacy policy explains what data {nama} collects when you visit this site, book a bungalow or contact us, what we use it for, and your rights over it. We follow Indonesia's Personal Data Protection Law, Law Number 27 of 2022.\n\n## Data we collect\nWhen you book, you give your name, WhatsApp or phone number, email address, country, arrival plans and any notes. We also keep the booking details, namely your dates, number of guests, bungalow, extras and payment status.\n\nWhen you visit the site, we count visits ourselves, without cookies and without storing your IP address. Only the page visited, the referring site, an estimated country and the general device type are recorded.\n\n## What we use it for\nWe use your personal data for the following.\n- Processing and confirming your booking.\n- Contacting you about your booking, boat pickup and schedule changes.\n- Sending booking and payment confirmation emails.\n- Meeting bookkeeping and tax obligations.\n\nWe do not sell your personal data and do not use it for advertising.\n\n## Payment\nOnline payments are processed by the payment providers Midtrans or PayPal, directly or through DAMPIER (thedampier.com), our online booking partner. Your card and bank details are entered on the payment provider's own page and never reach our server.\n\n## Who we share data with\nWe share data only as far as needed to carry out your booking.\n- DAMPIER, which manages our room calendar and online bookings, receives the name, dates and number of guests of your booking, and the full details of bookings paid through the DAMPIER booking sheet.\n- Midtrans and PayPal, to process payments.\n- The hosting and email providers of this site, to store data and send emails.\n- The boat crew who picks you up, only your name and arrival time.\n\nOther booking sites such as Booking.com receive only the dates a bungalow is taken, with no personal data.\n\n## Cookies and browser storage\nThis site uses only necessary cookies, to remember your language and currency and to keep an operator signed in to the panel. The dates you pick in the calendar are stored in your browser so you do not have to pick them again. We use no advertising cookies or third-party trackers. YouTube videos play through youtube-nocookie.com, while TikTok and Instagram videos follow their own privacy policies.\n\n## How long we keep data\nBooking data is kept as long as needed for the booking and for as long as Indonesian bookkeeping and tax rules require. After that it is deleted or made anonymous.\n\n## Security\nData is stored on a server with access limited to the homestay's operators. Your booking page opens only through the private link sent to you.\n\n## Children\nWe do not ask for children's personal data beyond their number and age, which we need to work out the price.\n\n## Your rights\nYou may ask for a copy of your personal data, have wrong data corrected, ask for data to be deleted when it is no longer needed, and withdraw your consent. Send your request through {kontak}, and we will reply as soon as we can.\n\n## Changes to this policy\nThis policy may be updated from time to time. The date of the last update is shown at the top of this page.\n\n## Contact us\n{nama}, {lokasi}. Questions about privacy can be sent through {kontak}.") },
      { k: 'syaratTeks', label: 'Syarat dan ketentuan', jenis: 'duaPanjang', bawaan: dua(
        "Syarat dan ketentuan ini berlaku untuk setiap pemesanan di {nama}, baik lewat situs ini, lewat lembar pesan DAMPIER, maupun lewat WhatsApp. Dengan memesan, kamu menyatakan sudah membaca dan menyetujuinya.\n\n## Pemesanan\nPesanan menjadi pasti setelah pembayaran kami terima dan kami konfirmasi. Sebelum itu, bungalow hanya kami tahan sementara. Harga mengikuti bungalow, jumlah tamu, dan paket harga yang kamu pilih, seperti tertulis saat memesan, dan sudah termasuk makan tiga kali sehari. Anak di bawah {usiaGratis} tahun menginap gratis.\n\n## Pembayaran\nPembayaran dilakukan penuh saat memesan, kecuali disepakati lain secara tertulis. Pembayaran online diproses oleh Midtrans atau PayPal, langsung atau lewat DAMPIER (thedampier.com). Harga ditulis dalam rupiah. Perkiraan dalam mata uang lain hanya gambaran, dan biaya bank atau selisih kurs ditanggung pembayar.\n\n## Ganti tanggal dan pembatalan\nGanti tanggal dan pembatalan mengikuti paket harga yang kamu pilih saat memesan. Syarat tiap paket tertulis di halaman pesan, di halaman pesananmu, dan di halaman Ketentuan menginap. Uang yang kembali dikirim lewat cara bayar semula, dan biaya transfer atau selisih kurs saat pengembalian mengikuti penyedia pembayaran.\n\n## Cuaca dan keadaan di luar kendali\nRaja Ampat adalah daerah kepulauan, dan jadwal kapal cepat serta perahu bisa berubah karena cuaca atau gelombang. Bila perahu tidak bisa berangkat demi keselamatan, kami membantu mengatur jadwal atau tanggal baru. Untuk keadaan kahar seperti bencana alam atau penutupan oleh pemerintah, kami mencari jalan keluar bersama tamu dengan iktikad baik.\n\n## Transport perahu dan kegiatan\nHarga perahu antar jemput adalah harga sekali jalan per perahu, dan pulang pergi dihitung dua kali. Kegiatan seperti snorkeling, trip perahu, dan melihat cenderawasih bergantung pada cuaca. Ikuti petunjuk juru mudi dan pemandu, dan pakai pelampung selama di perahu.\n\n## Selama menginap\nCheck-in pukul {checkIn} dan check-out pukul {checkOut}, dan jamnya bisa disesuaikan dengan jadwal kapal. Listrik menyala 12 jam, pukul 18.00 sampai 06.00. Hormati adat kampung, berpakaian sopan di kampung, jangan menginjak atau mengambil karang, dan bawa kembali sampah plastik ke Waisai. Kerusakan yang disengaja menjadi tanggungan tamu.\n\n## Retribusi dan izin\nRetribusi wisata dan kartu masuk kawasan konservasi Raja Ampat dibayar tamu sendiri, kecuali tertulis sudah termasuk dalam pesanan.\n\n## Tanggung jawab\nKami menjaga keselamatan dan kenyamanan tamu sebaik mungkin, tapi tidak bertanggung jawab atas kehilangan barang pribadi atau kecelakaan karena kelalaian tamu sendiri. Kami menyarankan asuransi perjalanan yang menanggung kegiatan air.\n\n## Hukum yang berlaku\nSyarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Perselisihan diselesaikan dengan musyawarah lebih dulu.\n\n## Hubungi kami\nPertanyaan tentang syarat ini bisa dikirim lewat {kontak}.",
        "These terms and conditions apply to every booking at {nama}, whether made on this site, through the DAMPIER booking sheet or on WhatsApp. By booking, you confirm that you have read and accept them.\n\n## Bookings\nA booking is confirmed once we have received and confirmed your payment. Until then, the bungalow is only held for you for a short time. The price follows the bungalow, the number of guests and the rate you choose, as shown when you book, and includes three meals a day. Children under {usiaGratis} stay free.\n\n## Payment\nPayment is made in full when you book, unless agreed otherwise in writing. Online payments are processed by Midtrans or PayPal, directly or through DAMPIER (thedampier.com). Prices are in Indonesian rupiah. Estimates in other currencies are only a guide, and bank charges or exchange rate differences are paid by the payer.\n\n## Date changes and cancellations\nDate changes and cancellations follow the rate you choose when you book. The terms of each rate are shown on the booking form, on your booking page and on the House rules page. Refunds are sent back through the original payment method, and any transfer charges or exchange rate differences on a refund follow the payment provider.\n\n## Weather and events beyond our control\nRaja Ampat is an island region, and fast ferry and boat schedules can change with the weather or the waves. If a boat cannot leave for safety reasons, we help arrange a new time or date. In cases of force majeure, such as natural disasters or closures by the government, we work out a solution with you in good faith.\n\n## Boat transfers and activities\nBoat transfer prices are one way per boat, and a return trip counts twice. Activities such as snorkelling, boat trips and bird watching depend on the weather. Follow the boat crew and guides, and wear a life jacket while on the boat.\n\n## During your stay\nCheck-in is at {checkIn} and check-out at {checkOut}, and the times can follow the ferry schedule. Power is on for 12 hours, from 18:00 to 06:00. Respect village customs, dress modestly in the village, do not stand on or take coral, and take plastic waste back to Waisai. Damage caused on purpose is paid by the guest.\n\n## Fees and permits\nThe Raja Ampat tourism fee and the marine park entry card are paid by guests themselves, unless your booking says they are included.\n\n## Liability\nWe look after our guests' safety and comfort as best we can, but we are not liable for lost personal belongings or accidents caused by a guest's own negligence. We recommend travel insurance that covers water activities.\n\n## Governing law\nThese terms and conditions are governed by the laws of the Republic of Indonesia. Disputes are first settled by talking things through.\n\n## Contact us\nQuestions about these terms can be sent through {kontak}.") },
    ],
  },
  {
    kunci: 'uang',
    judul: 'Mata uang',
    keterangan: 'Harga bungalow dan kegiatan diisi, ditampilkan, dan dibayar dalam rupiah. Di bawah setiap harga, tamu melihat perkiraannya dalam satu mata uang, dolar Amerika, euro, yen, atau yuan, yang bisa ia ganti lewat tombol mata uang di samping pilihan bahasa.',
    isian: [
      {
        k: 'uangBawaan', label: 'Mata uang perkiraan bawaan', jenis: 'pilihan', bawaan: 'USD',
        pilihan: [['USD', 'Dolar Amerika (USD)'], ['EUR', 'Euro (EUR)'], ['JPY', 'Yen Jepang (JPY)'], ['CNY', 'Yuan Tiongkok (CNY)'], ['IDR', 'Rupiah saja, tanpa perkiraan']],
        bantuan: 'Dipakai untuk pengunjung yang belum memilih sendiri. Pilihan pengunjung di tombol mata uang diingat di perangkatnya.',
      },
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
    case 'pilihan':
      return (f.pilihan ?? []).some(([x]) => x === v) ? v : (f.bawaan ?? '');
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
  lokasiJudul: [dua('Cara ke sini', 'Getting here')],
  caraSampai: [dua(
    'Terbang ke Sorong, lalu naik kapal cepat ke Waisai sekitar dua jam. Dari Pelabuhan Waisai perjalanan berlanjut dengan perahu kami.\n\nSetiap tamu Raja Ampat wajib memiliki Kartu Jasa Lingkungan. Kartu ini bisa dibeli di Sorong atau Waisai.',
    'Fly to Sorong, then take the fast ferry to Waisai, about two hours. From Waisai harbour you continue on our boat.\n\nEvery visitor to Raja Ampat needs the environmental service card. You can buy it in Sorong or Waisai.')],
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
// Defaults from before full payment and rate tiers, when the site asked for a deposit.
const SEBELUM_LUNAS = {"dpPersen": 30, "faq": [{"tanya": {"id": "Apakah harga sudah termasuk makan?", "en": "Are meals included?"}, "jawab": {"id": "Ya. Harga bungalow sudah termasuk makan pagi, siang, dan malam, juga air minum, teh, dan kopi.", "en": "Yes. The rate includes breakfast, lunch and dinner, plus drinking water, tea and coffee."}}, {"tanya": {"id": "Bagaimana listrik dan sinyal?", "en": "What about power and phone signal?"}, "jawab": {"id": "Listrik menyala dari sore sampai pagi. Sinyal telepon terbatas, jadi kabari keluarga sebelum menyeberang.", "en": "Power runs from late afternoon until morning. Phone signal is limited, so let your family know before you cross."}}, {"tanya": {"id": "Bagaimana cara membayar?", "en": "How do I pay?"}, "jawab": {"id": "Setelah memesan, transfer uang muka ke rekening yang tertera lalu kirim bukti lewat WhatsApp. Sisanya dibayar saat tiba.", "en": "After booking, transfer the deposit to the account shown and send the receipt on WhatsApp. Pay the rest when you arrive."}}, {"tanya": {"id": "Bisakah membatalkan pesanan?", "en": "Can I cancel?"}, "jawab": {"id": "Bisa. Aturan pengembalian uang muka ada di halaman ketentuan menginap.", "en": "Yes. The deposit refund rules are on the house rules page."}}], "catatanBayar": {"id": "Transfer uang muka dalam 24 jam setelah memesan, lalu kirim bukti transfer lewat WhatsApp. Sisa pembayaran dilunasi saat tiba, tunai atau transfer.", "en": "Transfer the deposit within 24 hours of booking, then send the receipt on WhatsApp. Pay the balance when you arrive, in cash or by transfer."}, "pesanTerima": {"id": "Terima kasih, pesananmu sudah kami terima. Bungalow kami tahan sambil menunggu uang muka.", "en": "Thank you, we have your booking. We are holding the bungalow for you while we wait for the deposit."}, "ketentuan": {"id": "Jam tiba dan pulang bisa disesuaikan dengan jadwal kapal. Kabari kami bila jadwalmu berubah.\n\nPembatalan 14 hari atau lebih sebelum tiba, uang muka kembali penuh. Pembatalan kurang dari 14 hari, uang muka tidak kembali tetapi bisa dipakai untuk tanggal lain dalam satu tahun.\n\nJaga laut kita. Jangan menginjak atau mengambil karang, dan bawa pulang sampah plastikmu.", "en": "Arrival and departure times can follow the ferry schedule. Let us know if your plans change.\n\nCancel 14 days or more before arrival and the deposit is refunded in full. Cancel later and the deposit is not refunded, but you can use it for other dates within a year.\n\nLook after our sea. Do not stand on or take coral, and take your plastic home with you."}};
for (const [k, v] of Object.entries(SEBELUM_LUNAS)) (BAWAAN_LAMA[k] ??= []).push(v, sebelumBungalow(v));
// The questions from the short time bookings went through DAMPIER, so a
// panel saved then shows the transfer answer again.
const faqDampier = PENGATURAN.flatMap((g) => g.isian).find((f) => f.k === 'faq').bawaan.map((x) => (x.tanya.en === 'How do I pay?'
  ? { ...x, jawab: dua('Pesan dan bayar lunas di halaman DAMPIER, mitra pemesanan online kami, dengan kartu, QRIS, virtual account bank, dompet digital, atau PayPal.', 'Book and pay in full on the DAMPIER page, our online booking partner, by card, QRIS, bank virtual account, e-wallet or PayPal.') }
  : x));
BAWAAN_LAMA.faq.push(faqDampier);
// The power answer before the owner's facilities, November 2026 (12 hours
// of power from 18.00, free Starlink Wi-Fi while it is on).
const LISTRIK_LAMA = { tanya: dua('Bagaimana listrik dan sinyal?', 'What about power and phone signal?'), jawab: dua('Listrik menyala dari sore sampai pagi. Sinyal telepon terbatas, jadi kabari keluarga sebelum menyeberang.', 'Power runs from late afternoon until morning. Phone signal is limited, so let your family know before you cross.') };
const sebelumListrik = (faq) => faq.map((x) => (x.tanya.en === 'What about power, Wi-Fi and phone signal?' ? LISTRIK_LAMA : x));
for (const v of [PENGATURAN.flatMap((g) => g.isian).find((f) => f.k === 'faq').bawaan, faqDampier]) BAWAAN_LAMA.faq.push(sebelumListrik(v), sebelumBungalow(sebelumListrik(v)));
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
    ringkas: 'Tujuh bungalow di tepi pantai Pulau Kri, masing-masing dengan kasur king dan kasur single untuk sampai tiga orang, kamar mandi dalam, dan beranda menghadap laut.',
    ringkas_en: 'Seven beachfront bungalows on Kri Island, each with a king bed and a single bed for up to three, a private bathroom and a sea-facing veranda.',
    deskripsi: 'Tujuh bungalow di tepi pantai sisi barat Pulau Kri, dekat dermaga Yenkoranu, dengan karang penuh ikan tepat di depan beranda. Kri adalah pulau kecil di tengah titik selam paling terkenal di Raja Ampat, sekitar satu jam naik perahu dari Waisai.\n\n## Bungalow\nKetujuh bungalow berdiri langsung di pantai, masing-masing dengan kasur king dan kasur single untuk sampai tiga orang, kamar mandi dalam, dan beranda menghadap laut. Saat air pasang, laut bisa sampai dekat bungalow. Bungalownya sederhana, tanpa AC dan air panas, dibuat untuk tamu yang mencari kehidupan pulau, bukan resor. Tamu bilang bungalownya lapang dan bersih.\n\n## Makan, listrik, dan internet\nMakan tiga kali sehari dimasak di dapur keluarga, biasanya ikan segar, nasi, tempe, sayur, dan sambal. Tamu bilang masakannya enak dan segar, walau menunya sederhana dan sering berulang. Listrik menyala 12 jam, pukul 18.00 sampai 06.00, dan selama listrik menyala ada wifi internet Starlink gratis.\n\n## Kegiatan\n**Snorkeling langsung dari depan bungalow**, di karang yang membentang dari dermaga Yenkoranu sampai depan Mambetron. Tamu menyebutnya salah satu karang tepi pantai terbaik di Raja Ampat. Cape Kri dan Sardine Reef, dua titik selam terkenal, ada di dekatnya, dan penyelaman bisa diatur dengan dive center di Kri. Perjalanan perahu ke tempat sekitar, seperti melihat cenderawasih atau ke Kali Biru, juga bisa diatur. Sepakati harganya sebelum berangkat.\n\n## Cara ke sini\nKri hanya bisa dicapai dengan perahu, sekitar satu jam dari Waisai. Tanyakan jemputan perahu saat memesan, dan kabari jadwal kapal cepatmu dari Sorong supaya perahu bisa disiapkan.\n\n## Perlu diketahui\nTuan rumahmu keluarga setempat, dan tamu menyebut mereka ramah dan suka membantu. Bawa uang tunai secukupnya karena tidak ada ATM di pulau. Mohon bawa kembali sampah plastik ke Waisai.',
    deskripsi_en: "Seven beachfront bungalows on the west side of Kri Island, near the Yenkoranu jetty, with a fish-filled reef right in front of the verandas. Kri is a small island in the middle of Raja Ampat's most famous dive sites, about an hour by boat from Waisai.\n\n## The bungalows\nAll seven bungalows sit right on the beach, each with a king bed and a single bed for up to three, a private bathroom and a sea-facing veranda. At high tide the sea can come close to the bungalows. They are simple, with no air conditioning or hot water, made for guests who want island life rather than a resort. Guests say the bungalows are spacious and clean.\n\n## Meals, power and internet\nThree meals a day are cooked in the family kitchen, usually fresh fish, rice, tempeh, vegetables and sambal. Guests say the food is tasty and fresh, though the menu is simple and often repeats. Power is on for 12 hours, from 18:00 to 06:00, and free Starlink Wi-Fi works whenever the power is on.\n\n## Things to do\n**Snorkel right off the bungalows**, on a reef that runs from the Yenkoranu jetty to the front of Mambetron. Guests call it one of the best shore reefs in Raja Ampat. Cape Kri and Sardine Reef, two famous dive sites, are close by, and dives can be arranged with a dive centre on Kri. Boat trips to nearby spots, such as birds of paradise or Kali Biru, can be arranged. Agree on the price before you go.\n\n## Getting there\nKri can only be reached by boat, about an hour from Waisai. Ask us about a boat pickup when you book, and share your fast ferry schedule from Sorong so the boat can be ready.\n\n## Good to know\nYour hosts are a local family, and guests describe them as friendly and helpful. Bring enough cash, as there is no ATM on the island. Please take plastic waste back to Waisai.",
    // the owner's facilities, November 2026
    fasilitas: ['Kamar mandi dalam', 'Makan tiga kali sehari', 'Wifi internet Starlink gratis selama listrik menyala', 'Listrik menyala 12 jam, pukul 18.00 sampai 06.00'],
    fasilitas_en: ['Private bathroom', 'Three meals a day', 'Free Starlink Wi-Fi while the power is on', 'Power for 12 hours, from 18:00 to 06:00'],
    // per bungalow for two, a guest alone Rp850.000, a king and a single bed
    // so a third guest adds Rp600.000 (the owner, November 2026)
    harga: 1200000, harga_anak: null, skema_harga: 'kamar', harga_sendiri: 850000, harga_tambah: 600000, kapasitas: 3, jumlah_unit: 7, min_malam: 1, urutan: 1,
  },
];

// Facilities and the power sentence of KAMAR_AWAL before the owner's list,
// November 2026. A room still holding them takes the current ones once (lib/db.ts).
export const KAMAR_FASILITAS_LAMA = {
  fasilitas: 'Di tepi pantai\nBeranda menghadap laut\nKamar mandi dalam\nMakan tiga kali sehari\nListrik genset sore dan malam\nInternet terbatas',
  fasilitas_en: 'Right on the beach\nSea-facing veranda\nPrivate bathroom\nThree meals a day\nGenerator power in the evening and at night\nLimited internet',
  deskripsi: 'Listrik dari genset pada sore dan malam hari. Internet terbatas, jadi bersiaplah lebih sering luring.',
  deskripsi_en: 'Power comes from a generator in the evening and at night. Internet is limited, so plan to be offline more often.',
};
// The power sentence that replaces it, as written in KAMAR_AWAL.
export const KALIMAT_LISTRIK = {
  deskripsi: 'Listrik menyala 12 jam, pukul 18.00 sampai 06.00, dan selama listrik menyala ada wifi internet Starlink gratis.',
  deskripsi_en: 'Power is on for 12 hours, from 18:00 to 06:00, and free Starlink Wi-Fi works whenever the power is on.',
};

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

// Prices from the owner, November 2026: a small longboat for up to 5 people
// Rp1.250.000, a faster speedboat for up to 6 Rp1.750.000, snorkelling from
// Rp400.000, bird watching Rp2.500.000.
export const LAYANAN_AWAL = [
  { nama: 'Longboat Waisai', nama_en: 'Waisai longboat', keterangan: 'Longboat kecil bermesin 15 PK antara Pelabuhan Waisai dan homestay.', keterangan_en: 'A small longboat with a 15 HP engine between Waisai harbour and the homestay.', harga: 1250000, satuan: 'perahu', muat: 5, mulai: false, ikon: 'perahu', urutan: 1 },
  { nama: 'Speedboat Waisai', nama_en: 'Waisai speedboat', keterangan: 'Lebih cepat, speedboat bermesin 2 × 40 PK antara Pelabuhan Waisai dan homestay.', keterangan_en: 'Faster, a speedboat with two 40 HP engines between Waisai harbour and the homestay.', harga: 1750000, satuan: 'perahu', muat: 6, mulai: false, ikon: 'speedboat', urutan: 2 },
  { nama: 'Snorkeling keliling pulau', nama_en: 'Island snorkelling trip', keterangan: 'Setengah hari ke tiga titik karang terbaik di sekitar kami, ditemani pemandu.', keterangan_en: 'Half a day at three of the best reefs nearby, with a guide.', harga: 400000, satuan: 'orang', muat: 0, mulai: true, ikon: 'snorkel', urutan: 3 },
  { nama: 'Melihat cenderawasih', nama_en: 'Bird of paradise walk', keterangan: 'Berangkat subuh ke hutan untuk melihat cenderawasih menari.', keterangan_en: 'A dawn walk into the forest to watch birds of paradise dance.', harga: 2500000, satuan: 'rombongan', muat: 4, mulai: false, ikon: 'burung', urutan: 4 },
  { nama: 'Sewa alat snorkel', nama_en: 'Snorkel gear', keterangan: 'Masker, snorkel, dan kaki katak selama menginap.', keterangan_en: 'Mask, snorkel and fins for your whole stay.', harga: 50000, satuan: 'orang_malam', muat: 0, mulai: false, ikon: 'karang', urutan: 5 },
];

export { SATUAN } from './satuan.mjs';
