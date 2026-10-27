'use server';
// Every admin change goes through here. Each action checks the session
// first, because server actions are reachable without the admin pages.
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { PENGATURAN, gabungSitus, rapikan } from '@/lib/bawaan.mjs';
import { jalankan, satu, transaksi, type Baris } from '@/lib/db';
import { ambilSitus, daftarKamar, daftarLayanan, kamarDariId, pesananDariId, sisaKamar } from '@/lib/data';
import { hitungHarga } from '@/lib/harga';
import type { StatusPesanan } from '@/lib/jenis';
import { GalatPesan, simpanPesanan, surelSah } from '@/lib/pesan';
import { pesanGalat } from '@/lib/kamus';
import { tanggal } from '@/lib/format';
import { alamatPengunjung, bolehMencoba, buatSesi, catatGagal, hapusSesi, lupakanGagal, sandiCocok, sandiDiatur, wajibMasuk } from '@/lib/sesi';
import { daftarMalam, sahTanggal, selisihHari } from '@/lib/tanggal';
import { GalatSinkron, buatToken, rapikanUrl, sinkronSatu, sinkronSemua, type Sambungan } from '@/lib/sinkron';

const teks = (fd: FormData, k: string, n = 2000) => String(fd.get(k) ?? '').trim().slice(0, n);
const bulat = (fd: FormData, k: string) => {
  const n = Number.parseInt(String(fd.get(k) ?? '').replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};
const rupiahKe = (fd: FormData, k: string) => Math.max(0, Number(String(fd.get(k) ?? '').replace(/\D/g, '')) || 0);
const centang = (fd: FormData, k: string) => fd.get(k) === 'ya' || fd.get(k) === 'on';
const segarkan = () => revalidatePath('/', 'layout');

const STATUS: StatusPesanan[] = ['menunggu', 'dikonfirmasi', 'lunas', 'selesai', 'batal'];

// Sign in and out.
export async function masuk(_: { galat: string }, fd: FormData): Promise<{ galat: string }> {
  if (!sandiDiatur()) return { galat: 'ADMIN_PASSWORD belum diisi di environment variables.' };
  const ip = await alamatPengunjung();
  if (!bolehMencoba(ip)) return { galat: 'Terlalu banyak percobaan. Tunggu 15 menit lalu coba lagi.' };
  const surel = String(fd.get('surel') ?? '').trim().toLowerCase();
  if (!(await sandiCocok(surel, String(fd.get('sandi') ?? '')))) {
    catatGagal(ip);
    return { galat: 'Surel atau kata sandi salah.' };
  }
  lupakanGagal(ip);
  await buatSesi(surel);
  redirect('/admin');
}

export async function keluar() {
  await hapusSesi();
  redirect('/admin/masuk');
}

// Site settings, one section of PENGATURAN at a time.
export async function simpanPengaturan(_: { pesan: string; ok: boolean }, fd: FormData) {
  await wajibMasuk();
  const g = PENGATURAN.find((x) => x.kunci === fd.get('bagian'));
  if (!g) return { pesan: 'Bagian pengaturan tidak dikenal.', ok: false };
  let masukan: Record<string, unknown>;
  try {
    masukan = JSON.parse(String(fd.get('data') ?? '{}'));
  } catch {
    return { pesan: 'Isian tidak terbaca. Muat ulang halaman lalu coba lagi.', ok: false };
  }
  const r = await satu<{ nilai: string }>("SELECT nilai FROM pengaturan WHERE kunci = 'situs'");
  const lama = (r ? JSON.parse(r.nilai) : {}) as Record<string, unknown>;
  const baru = gabungSitus(lama) as Record<string, unknown>;
  for (const f of g.isian) baru[f.k] = rapikan(f, masukan[f.k]);
  if (typeof baru.whatsapp === 'string') baru.whatsapp = baru.whatsapp.replace(/[^\d]/g, '').replace(/^0/, '62');
  if (typeof baru.instagram === 'string') baru.instagram = baru.instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '');
  for (const k of ['checkIn', 'checkOut'] as const) {
    if (typeof baru[k] === 'string' && !/^\d{2}:\d{2}$/.test(baru[k] as string)) return { pesan: 'Jam ditulis seperti 12:00.', ok: false };
  }
  await jalankan(
    "INSERT INTO pengaturan (kunci, nilai) VALUES ('situs', ?) ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)",
    [JSON.stringify(baru)],
  );
  segarkan();
  return { pesan: 'Tersimpan. Perubahan langsung tampil di situs.', ok: true };
}

// Developer mode switch on the dashboard. Closes or reopens the public site.
export async function aturTutup(fd: FormData) {
  await wajibMasuk();
  const r = await satu<{ nilai: string }>("SELECT nilai FROM pengaturan WHERE kunci = 'situs'");
  const baru = gabungSitus(r ? JSON.parse(r.nilai) : {}) as Record<string, unknown>;
  baru.tutup = fd.get('tutup') === 'ya';
  await jalankan(
    "INSERT INTO pengaturan (kunci, nilai) VALUES ('situs', ?) ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)",
    [JSON.stringify(baru)],
  );
  segarkan();
  redirect(`/admin?ok=${baru.tutup ? 'tutup' : 'buka'}`);
}

// Rooms.
function buatSlug(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'bungalow';
}

export async function simpanKamar(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  const nama = teks(fd, 'nama', 120);
  if (!nama) redirect(`/admin/kamar/${id || 'baru'}?galat=nama`);
  let slug = buatSlug(teks(fd, 'slug', 80) || nama);
  for (let i = 2; ; i++) {
    const ada = await satu<{ id: number }>('SELECT id FROM kamar WHERE slug = ? AND id <> ?', [slug, id]);
    if (!ada) break;
    slug = `${buatSlug(teks(fd, 'slug', 80) || nama)}-${i}`;
  }
  const hargaAnak = teks(fd, 'harga_anak') ? rupiahKe(fd, 'harga_anak') : null;
  const nilai = [
    slug, nama, teks(fd, 'nama_en', 120), teks(fd, 'ringkas', 400), teks(fd, 'ringkas_en', 400),
    teks(fd, 'deskripsi', 8000), teks(fd, 'deskripsi_en', 8000), teks(fd, 'fasilitas', 4000), teks(fd, 'fasilitas_en', 4000),
    rupiahKe(fd, 'harga'), hargaAnak, fd.get('skema_harga') === 'kamar' ? 'kamar' : 'orang',
    Math.min(50, Math.max(1, bulat(fd, 'kapasitas'))), Math.min(50, Math.max(1, bulat(fd, 'jumlah_unit'))),
    Math.min(30, Math.max(1, bulat(fd, 'min_malam'))), centang(fd, 'aktif') ? 1 : 0, bulat(fd, 'urutan'),
  ];
  let tujuan = id;
  if (id) {
    await jalankan(
      `UPDATE kamar SET slug = ?, nama = ?, nama_en = ?, ringkas = ?, ringkas_en = ?, deskripsi = ?, deskripsi_en = ?, fasilitas = ?,
        fasilitas_en = ?, harga = ?, harga_anak = ?, skema_harga = ?, kapasitas = ?, jumlah_unit = ?, min_malam = ?, aktif = ?, urutan = ?
       WHERE id = ?`,
      [...nilai, id],
    );
  } else {
    const r = await jalankan(
      `INSERT INTO kamar (slug, nama, nama_en, ringkas, ringkas_en, deskripsi, deskripsi_en, fasilitas, fasilitas_en, harga, harga_anak,
        skema_harga, kapasitas, jumlah_unit, min_malam, aktif, urutan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      nilai,
    );
    tujuan = r.insertId;
  }
  segarkan();
  redirect(`/admin/kamar/${tujuan}?ok=1`);
}

export async function hapusKamar(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  const ada = await satu<{ n: number }>('SELECT COUNT(*) AS n FROM pesanan WHERE kamar_id = ?', [id]);
  if (ada && ada.n > 0) {
    await jalankan('UPDATE kamar SET aktif = 0 WHERE id = ?', [id]);
    segarkan();
    redirect(`/admin/kamar/${id}?galat=dipakai`);
  }
  await jalankan("DELETE FROM foto WHERE wadah = 'kamar' AND kamar_id = ?", [id]);
  await jalankan('DELETE FROM tutup WHERE kamar_id = ?', [id]);
  await jalankan('DELETE FROM kalender_luar WHERE kamar_id = ?', [id]);
  await jalankan('DELETE FROM kalender_sambungan WHERE kamar_id = ?', [id]);
  await jalankan('DELETE FROM kamar WHERE id = ?', [id]);
  segarkan();
  redirect('/admin/kamar?hapus=1');
}

// Photos, already resized in the browser.
const JENIS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const WADAH = ['kamar', 'beranda', 'berandaHp', 'unggulan', 'tentang', 'ajakan', 'galeri'];

export async function unggahFoto(fd: FormData): Promise<{ galat: string }> {
  await wajibMasuk();
  const wadah = String(fd.get('wadah'));
  const kamarId = wadah === 'kamar' ? bulat(fd, 'kamar_id') : null;
  const berkas = fd.get('berkas');
  if (!WADAH.includes(wadah) || (wadah === 'kamar' && !kamarId)) return { galat: 'Tempat foto tidak dikenal.' };
  if (!(berkas instanceof File) || !JENIS_FOTO.includes(berkas.type)) return { galat: 'Berkas harus foto JPG, PNG, atau WebP.' };
  if (berkas.size > 8 * 1024 * 1024) return { galat: 'Foto terlalu besar, paling besar 8 MB.' };
  const data = Buffer.from(await berkas.arrayBuffer());
  const r = await satu<{ urutan: number }>('SELECT COALESCE(MAX(urutan), 0) + 1 AS urutan FROM foto WHERE wadah = ? AND (kamar_id <=> ?)', [wadah, kamarId]);
  const urutan = Number(r?.urutan ?? 1);
  await jalankan(
    'INSERT INTO foto (wadah, kamar_id, mime, data, lebar, tinggi, ukuran, keterangan, urutan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [wadah, kamarId, berkas.type, data, Math.min(65535, bulat(fd, 'lebar')), Math.min(65535, bulat(fd, 'tinggi')), data.length, teks(fd, 'keterangan', 200), urutan],
  );
  segarkan();
  return { galat: '' };
}

export async function hapusFoto(fd: FormData) {
  await wajibMasuk();
  await jalankan('DELETE FROM foto WHERE id = ?', [bulat(fd, 'id')]);
  segarkan();
}

export async function geserFoto(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  const arah = fd.get('arah') === 'kiri' ? -1 : 1;
  await transaksi(async (c) => {
    const [[f]] = await c.query<Baris[]>('SELECT id, wadah, kamar_id FROM foto WHERE id = ?', [id]);
    if (!f) return;
    const [daftar] = await c.query<Baris[]>('SELECT id FROM foto WHERE wadah = ? AND (kamar_id <=> ?) ORDER BY urutan, id', [f.wadah, f.kamar_id]);
    const ids = daftar.map((x) => x.id as number);
    const i = ids.indexOf(id);
    const j = i + arah;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    for (let n = 0; n < ids.length; n++) await c.query('UPDATE foto SET urutan = ? WHERE id = ?', [n + 1, ids[n]]);
  });
  segarkan();
}

export async function ubahKeteranganFoto(fd: FormData) {
  await wajibMasuk();
  await jalankan('UPDATE foto SET keterangan = ? WHERE id = ?', [teks(fd, 'keterangan', 200), bulat(fd, 'id')]);
  segarkan();
}

// Extras.
export async function simpanLayanan(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  const satuan = ['pesanan', 'orang', 'malam', 'orang_malam'].includes(String(fd.get('satuan'))) ? String(fd.get('satuan')) : 'orang';
  const nilai = [teks(fd, 'nama', 120), teks(fd, 'nama_en', 120), teks(fd, 'keterangan', 400), teks(fd, 'keterangan_en', 400),
    rupiahKe(fd, 'harga'), satuan, teks(fd, 'ikon', 20) || 'perahu', centang(fd, 'aktif') ? 1 : 0, bulat(fd, 'urutan')];
  if (!nilai[0]) redirect('/admin/layanan?galat=nama');
  if (id) {
    await jalankan('UPDATE layanan SET nama = ?, nama_en = ?, keterangan = ?, keterangan_en = ?, harga = ?, satuan = ?, ikon = ?, aktif = ?, urutan = ? WHERE id = ?', [...nilai, id]);
  } else {
    await jalankan('INSERT INTO layanan (nama, nama_en, keterangan, keterangan_en, harga, satuan, ikon, aktif, urutan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', nilai);
  }
  segarkan();
  redirect('/admin/layanan?ok=1');
}

export async function hapusLayanan(fd: FormData) {
  await wajibMasuk();
  await jalankan('DELETE FROM layanan WHERE id = ?', [bulat(fd, 'id')]);
  segarkan();
  redirect('/admin/layanan?hapus=1');
}

// Reviews.
export async function simpanUlasan(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  const nilai = [teks(fd, 'nama', 120), teks(fd, 'asal', 120), teks(fd, 'isi', 3000), Math.min(5, Math.max(1, bulat(fd, 'bintang') || 5)),
    centang(fd, 'tampil') ? 1 : 0, bulat(fd, 'urutan')];
  if (!nilai[0] || !nilai[2]) redirect('/admin/ulasan?galat=isi');
  if (id) await jalankan('UPDATE ulasan SET nama = ?, asal = ?, isi = ?, bintang = ?, tampil = ?, urutan = ? WHERE id = ?', [...nilai, id]);
  else await jalankan('INSERT INTO ulasan (nama, asal, isi, bintang, tampil, urutan) VALUES (?, ?, ?, ?, ?, ?)', nilai);
  segarkan();
  redirect('/admin/ulasan?ok=1');
}

export async function hapusUlasan(fd: FormData) {
  await wajibMasuk();
  await jalankan('DELETE FROM ulasan WHERE id = ?', [bulat(fd, 'id')]);
  segarkan();
  redirect('/admin/ulasan?hapus=1');
}

// Closed dates.
export async function tambahTutup(fd: FormData) {
  await wajibMasuk();
  const mulai = teks(fd, 'mulai', 10), akhir = teks(fd, 'akhir', 10) || mulai;
  const kamarId = bulat(fd, 'kamar_id') || null;
  const kembali = teks(fd, 'kembali', 200) || '/admin/kalender';
  if (!sahTanggal(mulai) || !sahTanggal(akhir) || akhir < mulai) redirect(`${kembali}${kembali.includes('?') ? '&' : '?'}galat=tanggal`);
  await jalankan('INSERT INTO tutup (kamar_id, mulai, akhir, alasan) VALUES (?, ?, ?, ?)', [kamarId, mulai, akhir, teks(fd, 'alasan', 200)]);
  segarkan();
  redirect(`${kembali}${kembali.includes('?') ? '&' : '?'}ok=tutup`);
}

export async function hapusTutup(fd: FormData) {
  await wajibMasuk();
  await jalankan('DELETE FROM tutup WHERE id = ?', [bulat(fd, 'id')]);
  segarkan();
}

// Calendar sync links. Each belongs to one unit of one hut type.
const urlSambungan = (fd: FormData) => {
  try {
    return { url: rapikanUrl(teks(fd, 'url', 1200)) };
  } catch (e) {
    return { galat: e instanceof GalatSinkron ? e.kode : 'url-baca' };
  }
};

export async function tambahSambungan(fd: FormData) {
  await wajibMasuk();
  // the unit picker sends "kamar_id-unit"
  const [kamarId, unit] = teks(fd, 'unit', 20).split('-').map((x) => Number.parseInt(x, 10) || 0);
  const nama = teks(fd, 'nama', 80);
  const km = await kamarDariId(kamarId);
  if (!km || unit < 1 || unit > km.jumlah_unit) redirect('/admin/sinkron?galat=unit');
  if (!nama) redirect('/admin/sinkron?galat=nama');
  const u = urlSambungan(fd);
  if ('galat' in u) redirect(`/admin/sinkron?galat=${u.galat}`);
  const r = await jalankan('INSERT INTO kalender_sambungan (kamar_id, unit, nama, url, token) VALUES (?, ?, ?, ?, ?)', [kamarId, unit, nama, u.url, buatToken()]);
  if (u.url) await sinkronSatu({ id: r.insertId, kamar_id: kamarId, unit, url: u.url });
  segarkan();
  redirect(`/admin/sinkron?ok=tambah&baru=${r.insertId}#sambungan-${r.insertId}`);
}

export async function ubahSambungan(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  const s = await satu<Sambungan>('SELECT id, kamar_id, unit, url FROM kalender_sambungan WHERE id = ?', [id]);
  if (!s) redirect('/admin/sinkron');
  const nama = teks(fd, 'nama', 80);
  if (!nama) redirect(`/admin/sinkron?galat=nama#sambungan-${id}`);
  const u = urlSambungan(fd);
  if ('galat' in u) redirect(`/admin/sinkron?galat=${u.galat}#sambungan-${id}`);
  await jalankan('UPDATE kalender_sambungan SET nama = ?, url = ? WHERE id = ?', [nama, u.url, id]);
  if (!u.url) {
    await jalankan('DELETE FROM kalender_luar WHERE sambungan_id = ?', [id]);
    await jalankan("UPDATE kalender_sambungan SET galat = '', jumlah = 0, berhasil = NULL, dicoba = NULL WHERE id = ?", [id]);
  } else if (u.url !== s.url) await sinkronSatu({ ...s, url: u.url });
  segarkan();
  redirect(`/admin/sinkron?ok=ubah#sambungan-${id}`);
}

export async function hapusSambungan(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  await jalankan('DELETE FROM kalender_luar WHERE sambungan_id = ?', [id]);
  await jalankan('DELETE FROM kalender_sambungan WHERE id = ?', [id]);
  segarkan();
  redirect('/admin/sinkron?ok=hapus');
}

// A new export link, for when the old one reached the wrong hands. The site
// that used the old link has to get the new one.
export async function gantiTautanSambungan(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  await jalankan('UPDATE kalender_sambungan SET token = ? WHERE id = ?', [buatToken(), id]);
  redirect(`/admin/sinkron?ok=token#sambungan-${id}`);
}

export async function sinkronkanSekarang() {
  await wajibMasuk();
  await sinkronSemua({ paksa: true });
  segarkan();
  redirect('/admin/sinkron?ok=sinkron');
}

// Bookings.
export async function ubahPesanan(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  const p = await pesananDariId(id);
  if (!p) redirect('/admin/pesanan');
  const status = STATUS.includes(fd.get('status') as StatusPesanan) ? (fd.get('status') as StatusPesanan) : p.status;
  const total = fd.has('total') ? rupiahKe(fd, 'total') : p.total;
  const dibayar = fd.has('dibayar') ? Math.min(total, rupiahKe(fd, 'dibayar')) : p.dibayar;
  // re-opening a cancelled booking must not overbook the room
  if (p.status === 'batal' && status !== 'batal') {
    const km = await kamarDariId(p.kamar_id);
    if (km) {
      const sisa = (await sisaKamar([km], p.check_in, p.check_out, { kecuali: p.id })).get(km.id) ?? {};
      if (daftarMalam(p.check_in, p.check_out).some((d) => (sisa[d] ?? km.jumlah_unit) < p.jumlah_kamar)) {
        redirect(`/admin/pesanan/${id}?galat=penuh`);
      }
    }
  }
  await jalankan('UPDATE pesanan SET status = ?, total = ?, dibayar = ?, catatan_admin = ? WHERE id = ?', [
    status, total, dibayar, fd.has('catatan_admin') ? teks(fd, 'catatan_admin') : p.catatan_admin, id,
  ]);
  segarkan();
  redirect(`/admin/pesanan/${id}?ok=1`);
}

// Quick buttons on the booking page.
export async function tandaiPesanan(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  const p = await pesananDariId(id);
  if (!p) redirect('/admin/pesanan');
  const apa = String(fd.get('apa'));
  if (apa === 'dp') await jalankan("UPDATE pesanan SET status = 'dikonfirmasi', dibayar = GREATEST(dibayar, dp) WHERE id = ?", [id]);
  else if (apa === 'lunas') await jalankan("UPDATE pesanan SET status = 'lunas', dibayar = total WHERE id = ?", [id]);
  else if (apa === 'selesai') await jalankan("UPDATE pesanan SET status = 'selesai' WHERE id = ?", [id]);
  else if (apa === 'batal') await jalankan("UPDATE pesanan SET status = 'batal' WHERE id = ?", [id]);
  segarkan();
  redirect(`/admin/pesanan/${id}?ok=1`);
}

// Change room, dates or guests and recount the price with today's rates.
export async function ubahJadwal(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  const p = await pesananDariId(id);
  if (!p) redirect('/admin/pesanan');
  const km = await kamarDariId(bulat(fd, 'kamar_id'));
  const masuk = teks(fd, 'masuk', 10), keluar = teks(fd, 'keluar', 10);
  const jumlahKamar = Math.max(1, bulat(fd, 'jumlah_kamar')), dewasa = Math.max(1, bulat(fd, 'dewasa')), anak = Math.max(0, bulat(fd, 'anak'));
  const galat = (g: string): never => redirect(`/admin/pesanan/${id}?galat=${g}`);
  if (!km) galat('kamar');
  if (!sahTanggal(masuk) || !sahTanggal(keluar) || keluar <= masuk) galat('tanggal');
  if (jumlahKamar > km!.jumlah_unit) galat('jumlah');
  const malam = selisihHari(masuk, keluar);
  const [situs, layanan] = await Promise.all([ambilSitus(), daftarLayanan(true)]);
  const dipilih = layanan.filter((l) => p.rincian.some((r) => r.id === l.id));
  const h = hitungHarga(km!, { malam, jumlahKamar, dewasa, anak, layanan: dipilih, dpPersen: situs.dpPersen });
  let penuh = false;
  await transaksi(async (c) => {
    await c.query('SELECT id FROM kamar WHERE id = ? FOR UPDATE', [km!.id]);
    const sisa = (await sisaKamar([km!], masuk, keluar, { conn: c, kecuali: id })).get(km!.id) ?? {};
    if (p.status !== 'batal' && daftarMalam(masuk, keluar).some((d) => (sisa[d] ?? km!.jumlah_unit) < jumlahKamar)) {
      penuh = true;
      return;
    }
    await c.query(
      `UPDATE pesanan SET kamar_id = ?, kamar_nama = ?, jumlah_kamar = ?, check_in = ?, check_out = ?, malam = ?, dewasa = ?, anak = ?,
        harga_satuan = ?, skema_harga = ?, biaya_kamar = ?, biaya_layanan = ?, total = ?, dp = ?, rincian = ? WHERE id = ?`,
      [km!.id, km!.nama, jumlahKamar, masuk, keluar, malam, dewasa, anak, km!.harga, km!.skema_harga, h.biayaKamar, h.biayaLayanan,
        h.total, h.dp, JSON.stringify(h.rincian), id],
    );
  });
  if (penuh) galat('penuh');
  segarkan();
  redirect(`/admin/pesanan/${id}?ok=jadwal`);
}

export async function hapusPesanan(fd: FormData) {
  await wajibMasuk();
  const id = bulat(fd, 'id');
  if (teks(fd, 'yakin') !== 'HAPUS') redirect(`/admin/pesanan/${id}?galat=yakin`);
  await jalankan('DELETE FROM pesanan WHERE id = ?', [id]);
  segarkan();
  redirect('/admin/pesanan?hapus=1');
}

// Bookings taken over WhatsApp or at the jetty.
export async function pesananManual(_: { galat: string }, fd: FormData): Promise<{ galat: string }> {
  await wajibMasuk();
  const [situs, kamar, layanan] = await Promise.all([ambilSitus(), daftarKamar(true), daftarLayanan(true)]);
  const km = kamar.find((k) => k.id === bulat(fd, 'kamar')) ?? null;
  const status = STATUS.includes(fd.get('status') as StatusPesanan) ? (fd.get('status') as StatusPesanan) : 'menunggu';
  const email = teks(fd, 'email', 160);
  if (email && !surelSah(email)) return { galat: 'Alamat surel belum benar.' };
  let hasil;
  try {
    if (!km) throw new GalatPesan('kamar');
    hasil = await simpanPesanan({
      kamarId: km.id, masuk: teks(fd, 'masuk', 10), keluar: teks(fd, 'keluar', 10), jumlahKamar: bulat(fd, 'jumlahKamar') || 1,
      dewasa: bulat(fd, 'dewasa') || 1, anak: Math.max(0, bulat(fd, 'anak')), layanan: fd.getAll('layanan').map(Number),
      nama: teks(fd, 'nama', 120), email, telepon: teks(fd, 'telepon', 40), negara: teks(fd, 'negara', 80), kedatangan: teks(fd, 'kedatangan', 200),
      catatan: teks(fd, 'catatan'), bahasa: fd.get('bahasa') === 'en' ? 'en' : 'id', sumber: 'admin', status, catatanAdmin: teks(fd, 'catatan_admin'),
    }, km, layanan, situs);
  } catch (e) {
    if (e instanceof GalatPesan) return { galat: pesanGalat('id', e.kode, e.isi, (d) => tanggal(d, 'id', 'polos')) };
    console.error('[mambetron] pesanan manual gagal', e);
    return { galat: 'Pesanan gagal disimpan. Periksa koneksi database.' };
  }
  if (status === 'lunas') await jalankan('UPDATE pesanan SET dibayar = total WHERE id = ?', [hasil.id]);
  if (status === 'dikonfirmasi') await jalankan('UPDATE pesanan SET dibayar = dp WHERE id = ?', [hasil.id]);
  segarkan();
  redirect(`/admin/pesanan/${hasil.id}?ok=baru`);
}
