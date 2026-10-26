import Link from 'next/link';
import Ikon from '@/components/Ikon';
import { JudulAdmin } from '@/components/admin/Kabar';
import FormManual from '@/components/admin/FormManual';
import { daftarKamar, daftarLayanan } from '@/lib/data';
import { hariIni } from '@/lib/tanggal';

export const metadata = { title: 'Catat pesanan' };

export default async function PesananBaru() {
  const [kamar, layanan] = await Promise.all([daftarKamar(true), daftarLayanan(true)]);
  return (
    <>
      <Link href="/admin/pesanan" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-biru-tua hover:underline">
        <Ikon nama="kiri" className="size-4" /> Semua pesanan
      </Link>
      <JudulAdmin judul="Catat pesanan" teks="Untuk tamu yang memesan lewat WhatsApp, telepon, atau datang langsung. Ketersediaan tetap diperiksa supaya tidak ada pondok yang terisi dua kali." />
      <FormManual kamar={kamar.map((k) => ({ id: k.id, nama: k.nama, aktif: k.aktif, jumlah_unit: k.jumlah_unit, kapasitas: k.kapasitas }))} layanan={layanan} hari={hariIni()} />
    </>
  );
}
