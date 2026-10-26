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
  rincian: BarisLayanan[];
  bahasa: Bahasa;
  status: StatusPesanan;
  sumber: string;
  catatan_admin: string;
  dibuat: string;
};

type Sorotan = { ikon: string; judul: Dua; teks: Dua };
type Kata = { ikon: string; teks: Dua };
type Langkah = { judul: Dua; teks: Dua };
type Faq = { tanya: Dua; jawab: Dua };
type Rekening = { bank: string; nomor: string; atasNama: string };

// Mirrors PENGATURAN in bawaan.mjs.
export type Situs = {
  nama: string;
  slogan: Dua;
  lokasi: Dua;
  seoJudul: Dua;
  seoDeskripsi: Dua;
  kakiTeks: Dua;
  whatsapp: string;
  email: string;
  instagram: string;
  alamat: Dua;
  petaKoordinat: string;
  petaTautan: string;
  heroLabel: Dua;
  heroJudul: Dua;
  heroTeks: Dua;
  heroKata: Kata[];
  heroVideo: string;
  sorotanJudul: Dua;
  sorotan: Sorotan[];
  kamarJudul: Dua;
  kamarTeks: Dua;
  tentangJudul: Dua;
  tentangTeks: Dua;
  galeriJudul: Dua;
  layananJudul: Dua;
  layananTeks: Dua;
  ulasanJudul: Dua;
  caraJudul: Dua;
  langkah: Langkah[];
  lokasiJudul: Dua;
  caraSampai: Dua;
  faqJudul: Dua;
  faq: Faq[];
  ajakanLabel: Dua;
  ajakanJudul: Dua;
  ajakanTeks: Dua;
  tutup: boolean;
  tutupJudul: Dua;
  tutupTeks: Dua;
  checkIn: string;
  checkOut: string;
  dpPersen: number;
  batasHari: number;
  jedaHari: number;
  bank: Rekening[];
  catatanBayar: Dua;
  pesanTerima: Dua;
  ketentuan: Dua;
};
