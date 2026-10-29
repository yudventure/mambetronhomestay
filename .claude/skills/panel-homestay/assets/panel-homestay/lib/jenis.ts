// Shared types for rows read from the database and for site settings.

export type Bahasa = 'id' | 'en';
export type Dua = { id: string; en: string };

export type Foto = { id: number; lebar: number; tinggi: number; keterangan: string; url: string };

export type SkemaHarga = 'orang' | 'kamar';

export type Kamar = {
  id: number;
  slug: string;
  nama: string;
  nama_en: string;
  ringkas: string;
  ringkas_en: string;
  deskripsi: string;
  deskripsi_en: string;
  fasilitas: string[];
  fasilitas_en: string[];
  harga: number;
  harga_anak: number | null;
  skema_harga: SkemaHarga;
  kapasitas: number;
  jumlah_unit: number;
  min_malam: number;
  aktif: boolean;
  urutan: number;
  foto: Foto[];
};

export type Satuan = 'pesanan' | 'orang' | 'malam' | 'orang_malam';

export type Layanan = {
  id: number;
  nama: string;
  nama_en: string;
  keterangan: string;
  keterangan_en: string;
  harga: number;
  satuan: Satuan;
  ikon: string;
  aktif: boolean;
  urutan: number;
};

export type Ulasan = {
  id: number;
  nama: string;
  asal: string;
  isi: string;
  bintang: number;
  tampil: boolean;
  urutan: number;
};

export type StatusPesanan = 'menunggu' | 'dikonfirmasi' | 'lunas' | 'selesai' | 'batal';

export type BarisLayanan = { id: number; nama: string; nama_en: string; harga: number; satuan: Satuan; jumlah: number; subtotal: number };

// One Midtrans transaction for a booking. The order id is the booking code
// with a running number, a new one only when the last could not be paid.
export type CobaBayar = {
  orderId: string;
  jumlah: number;
  dibuat: string;
  status: string;
  metode: string;
  saluran?: string;
  waktu?: string;
  // the paid amount has been added to the booking
  masuk?: boolean;
};
export type BayarOnline = {
  n: number;
  // the Snap token of the latest transaction, reused while it can still be paid
  token: string;
  coba: CobaBayar[];
};

export type Pesanan = {
  id: number;
  kode: string;
  token: string;
  kamar_id: number;
  kamar_nama: string;
  jumlah_kamar: number;
  check_in: string;
  check_out: string;
  malam: number;
  dewasa: number;
  anak: number;
  nama: string;
  email: string;
  telepon: string;
  negara: string;
  kedatangan: string;
  catatan: string;
  harga_satuan: number;
  skema_harga: SkemaHarga;
  biaya_kamar: number;
  biaya_layanan: number;
  total: number;
  dp: number;
  dibayar: number;
  // payments through Midtrans, null until the guest first pays online
  bayar_online: BayarOnline | null;
  rincian: BarisLayanan[];
  // rate tier with its terms as booked, null for bookings without one
  paket: { nama: Dua; syarat: Dua; persen: number } | null;
  bahasa: Bahasa;
  status: StatusPesanan;
  sumber: string;
  catatan_admin: string;
  dibuat: string;
};

type Kata = { ikon: string; teks: Dua };
type Faq = { tanya: Dua; jawab: Dua };
type Rute = { judul: Dua; label: Dua; teks: Dua };
type Rekening = { bank: string; nomor: string; atasNama: string; swift: string };

// Mirrors PENGATURAN in bawaan.mjs.
export type Situs = {
  nama: string;
  slogan: Dua;
  lokasi: Dua;
  seoJudul: Dua;
  seoDeskripsi: Dua;
  kakiTeks: Dua;
  pengelolaTeks: Dua;
  pengelola: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  alamat: Dua;
  petaKoordinat: string;
  petaTautan: string;
  heroLabel: Dua;
  heroJudul: Dua;
  heroTeks: Dua;
  heroKata: Kata[];
  heroVideo: string;
  kamarJudul: Dua;
  kamarTeks: Dua;
  ulasanSkor: string;
  ulasanSkala: number;
  ulasanSumber: string;
  ulasanTautan: string;
  ulasanWajah: { nama: string; wajah: string }[];
  tentangJudul: Dua;
  tentangTeks: Dua;
  tentangVideo: { url: string; judul: string }[];
  galeriJudul: Dua;
  layananJudul: Dua;
  layananTeks: Dua;
  ulasanJudul: Dua;
  lokasiLabel: Dua;
  lokasiJudul: Dua;
  caraSampai: Dua;
  rute: Rute[];
  lokasiInfo: { ikon: string; teks: Dua }[];
  lokasiCatatan: Dua;
  faqJudul: Dua;
  faq: Faq[];
  uangBawaan: string;
  kursOtomatis: boolean;
  kursUSD: number;
  kursEUR: number;
  kursJPY: number;
  kursCNY: number;
  tutup: boolean;
  tutupJudul: Dua;
  tutupTeks: Dua;
  checkIn: string;
  checkOut: string;
  dpPersen: number;
  paketHarga: { nama: Dua; syarat: Dua; persen: number | string }[];
  batasHari: number;
  jedaHari: number;
  bank: Rekening[];
  catatanBayar: Dua;
  pesanTerima: Dua;
  ketentuan: Dua;
};
