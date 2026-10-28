'use server';
import { after } from 'next/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ambilSitus, daftarKamar, daftarLayanan, pemesananAktif, pesananDariId } from '@/lib/data';
import { tanggal } from '@/lib/format';
import { kamus, pesanGalat } from '@/lib/kamus';
import { GalatPesan, bolehKirim, catatKirim, simpanPesanan } from '@/lib/pesan';
import { alamatPengunjung, sesiSah } from '@/lib/sesi';
import { surelPesananBaru } from '@/lib/surel';

export type HasilKirim = { galat: string };

const teks = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const angka = (fd: FormData, k: string) => Number.parseInt(teks(fd, k), 10);

export async function kirimPesanan(_: HasilKirim, fd: FormData): Promise<HasilKirim> {
  const b = teks(fd, 'bahasa') === 'en' ? 'en' : 'id';
  // the hidden field is left empty by people and filled in by bots
  if (teks(fd, 'situs_web')) return { galat: pesanGalat(b, 'gagal') };
  if (teks(fd, 'setuju') !== 'ya') return { galat: pesanGalat(b, 'setuju') };
  const ip = await alamatPengunjung();
  if (!bolehKirim(ip)) return { galat: pesanGalat(b, 'sibuk') };
  if (!(await pemesananAktif())) return { galat: kamus(b).form.belumAktif };
  // developer mode closes bookings for visitors, an admin can still test
  if ((await ambilSitus()).tutup && !(await sesiSah())) return { galat: kamus(b).situsTutup };

  const [situs, semuaKamar, layanan] = await Promise.all([ambilSitus(), daftarKamar(), daftarLayanan()]);
  const kamar = semuaKamar.find((k) => k.id === angka(fd, 'kamar')) ?? null;
  let hasil;
  try {
    if (!kamar) throw new GalatPesan('kamar');
    hasil = await simpanPesanan({
      kamarId: kamar.id,
      masuk: teks(fd, 'masuk'),
      keluar: teks(fd, 'keluar'),
      jumlahKamar: angka(fd, 'jumlahKamar') || 1,
      dewasa: angka(fd, 'dewasa'),
      anak: angka(fd, 'anak') || 0,
      layanan: fd.getAll('layanan').map((v) => Number(v)).filter(Number.isFinite),
      paket: fd.has('paket') ? angka(fd, 'paket') : undefined,
      paketNama: fd.has('paket_nama') ? teks(fd, 'paket_nama') : undefined,
      nama: teks(fd, 'nama'),
      email: teks(fd, 'email'),
      telepon: teks(fd, 'telepon'),
      negara: teks(fd, 'negara'),
      kedatangan: teks(fd, 'kedatangan'),
      catatan: teks(fd, 'catatan'),
      bahasa: b,
      sumber: 'situs',
    }, kamar, layanan, situs);
  } catch (e) {
    if (e instanceof GalatPesan) return { galat: pesanGalat(b, e.kode, e.isi, (d) => tanggal(d, b, 'polos')) };
    console.error('[mambetron] pesanan gagal disimpan', e);
    return { galat: pesanGalat(b, 'gagal') };
  }
  catatKirim(ip);

  const h = await headers();
  const asal = `${(h.get('x-forwarded-proto') ?? 'http').split(',')[0]}://${h.get('x-forwarded-host') ?? h.get('host')}`;
  const id = hasil.id;
  after(async () => {
    const p = await pesananDariId(id);
    if (p) await surelPesananBaru(p, situs, asal);
  });
  redirect(`/pesanan/${hasil.kode}?t=${hasil.token}`);
}
