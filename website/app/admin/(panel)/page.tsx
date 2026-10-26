import Link from 'next/link';
import Ikon from '@/components/Ikon';
import BarisPesanan from '@/components/admin/BarisPesanan';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import TombolYakin from '@/components/admin/TombolYakin';
import { aturTutup } from '@/app/admin/aksi';
import { baris } from '@/lib/db';
import { ambilSitus, cariPesanan, daftarKamar } from '@/lib/data';
import { alamatSitus, surelDiatur } from '@/lib/env';
import { tanggal } from '@/lib/format';
import { daftarMalam, hariIni, tambahHari } from '@/lib/tanggal';

export const metadata = { title: 'Dasbor' };

function Angka({ label, nilai, ket, href }: { label: string; nilai: string | number; ket?: string; href?: string }) {
  const isi = (
    <>
      <p className="text-sm font-semibold text-abu">{label}</p>
      <p className="mt-1 font-judul text-4xl font-semibold text-laut">{nilai}</p>
      {ket && <p className="mt-1 text-sm text-abu">{ket}</p>}
    </>
  );
  return href
    ? <Link href={href} className="kartu block p-5 transition-shadow hover:shadow-angkat">{isi}</Link>
    : <div className="kartu p-5">{isi}</div>;
}

export default async function Dasbor({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const hari = hariIni();
  const sampai = tambahHari(hari, 30);
  const [situs, kamar, aktifRentang, terbaru, [{ menunggu }]] = await Promise.all([
    ambilSitus(),
    daftarKamar(true),
    cariPesanan({ dari: hari, sampai, urut: 'tiba', batas: 1000 }),
    cariPesanan({ batas: 6 }),
    baris<{ menunggu: number }>("SELECT COUNT(*) AS menunggu FROM pesanan WHERE status = 'menunggu'"),
  ]);
  const hidup = aktifRentang.filter((p) => p.status !== 'batal');
  const tiba = hidup.filter((p) => p.check_in === hari);
  const pulang = hidup.filter((p) => p.check_out === hari);
  const menginap = hidup.filter((p) => p.check_in <= hari && p.check_out > hari);
  const tamuMalamIni = menginap.reduce((a, p) => a + p.dewasa + p.anak, 0);
  const unitAktif = kamar.filter((k) => k.aktif).reduce((a, k) => a + k.jumlah_unit, 0);
  const malamTerisi = hidup.reduce((a, p) => a + daftarMalam(p.check_in < hari ? hari : p.check_in, p.check_out > sampai ? sampai : p.check_out).length * p.jumlah_kamar, 0);
  const okupansi = unitAktif ? Math.round((malamTerisi / (unitAktif * 30)) * 100) : 0;
  const tibaSegera = hidup.filter((p) => p.check_in >= hari && p.check_in <= tambahHari(hari, 7));

  const daftarCek = [
    { ok: Boolean(situs.whatsapp), teks: 'Isi nomor WhatsApp homestay', href: '/admin/pengaturan#kontak' },
    { ok: situs.bank.length > 0, teks: 'Isi rekening untuk uang muka', href: '/admin/pengaturan#pemesanan' },
    { ok: kamar.length > 0 && kamar.every((k) => k.foto.length > 0), teks: 'Unggah foto setiap pondok', href: '/admin/kamar' },
    { ok: Boolean(situs.petaKoordinat), teks: 'Isi titik peta lokasi homestay', href: '/admin/pengaturan#kontak' },
    { ok: Boolean(alamatSitus()), teks: 'Isi SITE_URL di environment variables hPanel', href: '' },
    { ok: surelDiatur(), teks: 'Atur surel untuk pemberitahuan pesanan dan kode ganti kata sandi', href: '' },
  ];
  const belum = daftarCek.filter((c) => !c.ok);

  return (
    <>
      <JudulAdmin judul="Selamat datang" teks={`Hari ini ${tanggal(hari, 'id', 'panjang')}, waktu Raja Ampat.`}>
        <Link href="/admin/pesanan/baru" className="tombol tombol-kecil"><Ikon nama="tambah" className="size-4" /> Catat pesanan</Link>
      </JudulAdmin>

      <Kabar ok={ok} pesan={{
        'ok:tutup': 'Situs ditutup. Pengunjung sekarang melihat halaman segera dibuka.',
        'ok:buka': 'Situs dibuka lagi untuk semua pengunjung.',
        'ok:sandi': 'Kata sandi panel sudah diganti. Perangkat lain yang masih masuk sudah dikeluarkan.',
      }} />

      <section className={`kartu mb-6 flex flex-wrap items-center gap-4 p-5 sm:p-6 ${situs.tutup ? 'ring-2 ring-senja' : ''}`}>
        <span className={`inline-flex size-12 shrink-0 items-center justify-center rounded-2xl ${situs.tutup ? 'bg-senja text-hitam' : 'bg-buih text-biru-tua'}`}>
          <Ikon nama={situs.tutup ? 'gembok' : 'globe'} className="size-6" />
        </span>
        <div className="mr-auto min-w-0 flex-1 basis-64">
          <h2 className="text-2xl">{situs.tutup ? 'Mode pengembang menyala' : 'Situs terbuka untuk umum'}</h2>
          <p className="mt-1 text-abu">
            {situs.tutup
              ? 'Pengunjung hanya melihat halaman segera dibuka. Kamu tetap melihat dan bisa menguji situs karena sudah masuk ke panel.'
              : 'Nyalakan mode pengembang untuk menutup situs sementara selama masih disiapkan atau diperbaiki.'}
          </p>
          <Link href="/admin/pengaturan#tutup" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-biru-tua hover:underline">
            Ubah tulisan halaman tutup <Ikon nama="panah" className="size-4" />
          </Link>
        </div>
        <form action={aturTutup}>
          <input type="hidden" name="tutup" value={situs.tutup ? 'tidak' : 'ya'} />
          {situs.tutup ? (
            <TombolYakin tanya="Buka situs lagi untuk semua pengunjung?" className="tombol tombol-kecil">
              <Ikon nama="globe" className="size-4" /> Buka situs lagi
            </TombolYakin>
          ) : (
            <TombolYakin tanya="Tutup situs untuk pengunjung? Mereka akan melihat halaman segera dibuka sampai situs dibuka lagi." className="tombol tombol-laut tombol-kecil">
              <Ikon nama="gembok" className="size-4" /> Tutup situs sementara
            </TombolYakin>
          )}
        </form>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Angka label="Menunggu uang muka" nilai={menunggu} ket="Perlu dicek dan dikonfirmasi" href="/admin/pesanan?status=menunggu" />
        <Angka label="Tiba hari ini" nilai={tiba.length} ket={`${pulang.length} pesanan pulang hari ini`} />
        <Angka label="Tamu menginap malam ini" nilai={tamuMalamIni} ket={`${menginap.reduce((a, p) => a + p.jumlah_kamar, 0)} dari ${unitAktif} pondok terisi`} />
        <Angka label="Keterisian 30 hari" nilai={`${okupansi}%`} ket="Dari semua pondok aktif" href="/admin/kalender" />
      </div>

      {belum.length > 0 && (
        <section className="kartu mt-6 p-5 sm:p-6">
          <h2 className="text-2xl">Supaya situs siap dipakai</h2>
          <p className="mt-1 text-abu">Beberapa hal berikut masih perlu dilengkapi. Teks bawaan di Isi situs juga sebaiknya diperiksa dan disesuaikan.</p>
          <ul className="mt-4 grid gap-2">
            {belum.map((c) => (
              <li key={c.teks}>
                {c.href ? (
                  <Link href={c.href} className="flex items-center gap-3 rounded-2xl bg-buih px-4 py-3 font-semibold text-laut hover:bg-buih-2">
                    <Ikon nama="info" className="size-5 shrink-0 text-senja-tua" /> {c.teks} <Ikon nama="panah" className="ml-auto size-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-3 rounded-2xl bg-buih px-4 py-3 font-semibold text-laut">
                    <Ikon nama="info" className="size-5 shrink-0 text-senja-tua" /> {c.teks}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 text-2xl">Tiba dalam 7 hari</h2>
          {tibaSegera.length ? (
            <div className="grid gap-2">{tibaSegera.map((p) => <BarisPesanan key={p.id} p={p} />)}</div>
          ) : <p className="rounded-2xl bg-white px-4 py-3 text-abu">Belum ada tamu yang tiba minggu ini.</p>}
        </section>
        <section>
          <h2 className="mb-3 text-2xl">Pesanan terbaru</h2>
          {terbaru.length ? (
            <div className="grid gap-2">{terbaru.map((p) => <BarisPesanan key={p.id} p={p} />)}</div>
          ) : <p className="rounded-2xl bg-white px-4 py-3 text-abu">Belum ada pesanan.</p>}
          <Link href="/admin/pesanan" className="mt-3 inline-flex items-center gap-1 font-semibold text-biru-tua hover:underline">Semua pesanan <Ikon nama="panah" className="size-4" /></Link>
        </section>
      </div>
    </>
  );
}
