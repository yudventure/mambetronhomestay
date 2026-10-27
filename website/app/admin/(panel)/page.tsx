import Link from 'next/link';
import Ikon from '@/components/Ikon';
import JamLangsung from '@/components/admin/JamLangsung';
import Kabar from '@/components/admin/Kabar';
import MejaPesanan from '@/components/admin/MejaPesanan';
import StatistikSitus from '@/components/admin/StatistikSitus';
import TombolYakin from '@/components/admin/TombolYakin';
import { aturTutup } from '@/app/admin/aksi';
import { akunDari } from '@/lib/akun';
import { ambilSitus, angkaRingkasan, cariPesanan, daftarKamar, hitungPesanan } from '@/lib/data';
import { alamatSitus, surelDiatur } from '@/lib/env';
import { bulanTahun, rentangTanggal, rupiah, rupiahRingkas, tanggal } from '@/lib/format';
import { sesiAkun } from '@/lib/sesi';
import { blokLuar, cariBentrok, pastikanSegar, type BlokLuar, type Bentrok } from '@/lib/sinkron';
import { ZONA, daftarMalam, hariIni, selisihHari, tambahHari } from '@/lib/tanggal';

export const metadata = { title: 'Ringkasan' };

function salam() {
  const j = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: ZONA }).format(new Date()));
  return j < 4 ? 'malam' : j < 11 ? 'pagi' : j < 15 ? 'siang' : j < 18 ? 'sore' : 'malam';
}

function Angka({ label, nilai, ket, baik, href }: { label: string; nilai: React.ReactNode; ket?: string; baik?: boolean; href?: string }) {
  const isi = (
    <>
      <p className="text-[0.8125rem] text-abu sm:text-sm">{label}</p>
      <p className="mt-1.5 text-[1.45rem] leading-none font-bold text-panel-utama tabular-nums [overflow-wrap:anywhere] sm:text-[2rem]">{nilai}</p>
      {ket && <p className={`mt-2 text-[0.8125rem] sm:text-sm ${baik ? 'font-semibold text-[#1f7a3d]' : 'text-abu'}`}>{ket}</p>}
    </>
  );
  return href
    ? <Link href={href} className="kartu block p-4 transition-colors hover:bg-panel-latar sm:p-5">{isi}</Link>
    : <div className="kartu p-4 sm:p-5">{isi}</div>;
}

function KartuKecil({ label, judul, children, tombol }: { label: string; judul: string; children?: React.ReactNode; tombol?: React.ReactNode }) {
  return (
    <section className="kartu flex flex-col p-5 sm:p-6">
      <p className="label-kecil">{label}</p>
      <h2 className="mt-1 text-[1.4rem] text-panel-utama">{judul}</h2>
      <div className="mt-2 flex-1 text-[0.9375rem] text-abu">{children}</div>
      {tombol && <div className="mt-4">{tombol}</div>}
    </section>
  );
}

const tombolGaris = 'flex h-11 w-full items-center justify-center gap-2 rounded-full text-[0.9375rem] font-semibold text-panel-utama ring-1 ring-panel-garis hover:bg-panel-latar';

export default async function Ringkasan({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const hari = hariIni();
  const sampai = tambahHari(hari, 30);
  const q = (sp.q ?? '').trim().slice(0, 80);
  const status = ['menunggu', 'dikonfirmasi', 'lunas', 'selesai', 'batal'].includes(sp.status ?? '') ? sp.status : undefined;
  pastikanSegar().catch(() => {});
  const [situs, kamar, rentang, angka, meja, jumlahMeja, surel, luar, bentrok] = await Promise.all([
    ambilSitus(),
    daftarKamar(true),
    cariPesanan({ dari: hari, sampai, urut: 'tiba', batas: 1000 }),
    angkaRingkasan(hari),
    cariPesanan({ q: q || undefined, status, batas: 10 }),
    hitungPesanan({ q: q || undefined, status }),
    sesiAkun(),
    blokLuar(hari, sampai).catch(() => [] as BlokLuar[]),
    cariBentrok(hari, tambahHari(hari, 180)).catch(() => [] as Bentrok[]),
  ]);
  const peran = akunDari(surel)?.peran === 'pengembang' ? 'Pengembang' : 'Pemilik';
  const hidup = rentang.filter((p) => p.status !== 'batal');
  const tiba = hidup.filter((p) => p.check_in === hari);
  const pulang = hidup.filter((p) => p.check_out === hari);
  const menginap = hidup.filter((p) => p.check_in <= hari && p.check_out > hari);
  const tamuMalamIni = menginap.reduce((a, p) => a + p.dewasa + p.anak, 0);
  const unitAktif = kamar.filter((k) => k.aktif).reduce((a, k) => a + k.jumlah_unit, 0);
  // a unit counts once a night, whether booked here or on a booking site
  const aktif = kamar.filter((k) => k.aktif);
  const luarAda = luar.filter((b) => aktif.some((k) => k.id === b.kamar_id && b.unit <= k.jumlah_unit));
  const terisi = (kamarId: number, unit: number, m: string) => Math.min(unit,
    hidup.filter((p) => p.kamar_id === kamarId && p.check_in <= m && p.check_out > m).reduce((a, p) => a + p.jumlah_kamar, 0)
    + new Set(luarAda.filter((b) => b.kamar_id === kamarId && b.mulai <= m && b.selesai > m).map((b) => b.unit)).size);
  const malamTerisi = aktif.reduce((a, k) => a + daftarMalam(hari, sampai).reduce((s, m) => s + terisi(k.id, k.jumlah_unit, m), 0), 0);
  const terisiMalamIni = aktif.reduce((a, k) => a + terisi(k.id, k.jumlah_unit, hari), 0);
  const luarMalamIni = luarAda.filter((b) => b.mulai <= hari && b.selesai > hari);
  const okupansi = unitAktif ? Math.round((malamTerisi / (unitAktif * 30)) * 100) : 0;
  const tibaTerdekat = hidup.filter((p) => p.check_in >= hari).slice(0, 3);
  const perhatian = hidup.filter((p) =>
    (p.status === 'menunggu' && Date.now() - new Date(`${p.dibuat.replace(' ', 'T')}Z`).getTime() > 24 * 3600_000)
    || (p.status === 'dikonfirmasi' && p.dibayar < p.total && p.check_in >= hari && selisihHari(hari, p.check_in) <= 3));
  const bulan = bulanTahun(hari, 'id');
  const nama = situs.nama.split(' ')[0];

  const daftarCek = [
    { ok: Boolean(situs.whatsapp), teks: 'Isi nomor WhatsApp homestay', href: '/admin/pengaturan#kontak' },
    { ok: situs.bank.length > 0, teks: 'Isi rekening untuk uang muka', href: '/admin/pengaturan#pemesanan' },
    { ok: kamar.length > 0 && kamar.every((k) => k.foto.length > 0), teks: 'Unggah foto setiap bungalow', href: '/admin/kamar' },
    { ok: Boolean(situs.petaKoordinat), teks: 'Isi titik peta lokasi homestay', href: '/admin/pengaturan#kontak' },
    { ok: Boolean(alamatSitus()), teks: 'Isi SITE_URL di environment variables hPanel', href: '' },
    { ok: surelDiatur(), teks: 'Atur surel untuk pemberitahuan pesanan dan kode ganti kata sandi', href: '' },
  ];
  const belum = daftarCek.filter((c) => !c.ok);

  return (
    <div className="grid gap-6">
      <Kabar ok={sp.ok} pesan={{
        'ok:tutup': 'Situs ditutup. Pengunjung sekarang melihat halaman segera dibuka.',
        'ok:buka': 'Situs dibuka lagi untuk semua pengunjung.',
        'ok:sandi': 'Kata sandi panel sudah diganti. Perangkat lain yang masih masuk sudah dikeluarkan.',
      }} />

      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-panel-utama px-6 py-7 sm:px-8 sm:py-8">
        <svg aria-hidden viewBox="0 0 1200 260" preserveAspectRatio="none" className="absolute inset-0 -z-10 size-full">
          <path d="M0 190 C 160 150 260 210 420 175 S 700 120 860 160 S 1080 200 1200 150 V260 H0Z" fill="rgb(255 255 255 / 0.05)" />
          <path d="M0 220 C 200 190 330 240 520 210 S 860 170 1010 205 S 1150 225 1200 200 V260 H0Z" fill="rgb(143 220 232 / 0.09)" />
          <path d="M760 160 q 40 -70 90 -62 q 30 -40 70 -6 q 46 -8 60 68 Z" fill="rgb(255 255 255 / 0.04)" />
        </svg>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="label-kecil !text-sorot">{peran} · meja pengelola</p>
            <h1 className="mt-2 text-[2.2rem] leading-[1.05] text-white sm:text-[2.6rem]">Selamat {salam()}, tim {nama}.</h1>
            <p className="mt-2 text-white/75">
              {angka.menunggu
                ? `Ada ${angka.menunggu} pesanan yang menunggu konfirmasi uang muka.`
                : 'Tidak ada pesanan yang menunggu konfirmasi saat ini.'}
            </p>
          </div>
          <JamLangsung awal={Date.now()} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <Angka label={`Pesanan masuk · ${bulan}`} nilai={angka.masuk} ket={`${angka.masukLalu} bulan lalu`} href="/admin/pesanan" />
        <Angka label={`Dikonfirmasi · ${bulan}`} nilai={angka.dikonfirmasi}
          ket={angka.masuk ? `${Math.round((angka.dikonfirmasi / angka.masuk) * 100)}% dari pesanan masuk` : 'Belum ada pesanan bulan ini'} />
        <Angka label="Menunggu konfirmasi" nilai={angka.menunggu} ket={angka.menunggu ? 'Cek uang muka lalu konfirmasi' : 'Semua sudah ditanggapi'} baik={!angka.menunggu} href="/admin/pesanan?status=menunggu" />
        <Angka label="Tiba hari ini" nilai={tiba.length} ket={`${pulang.length} pulang, ${tamuMalamIni} tamu menginap malam ini`} />
        <Angka label="Keterisian 30 hari" nilai={`${okupansi}%`} ket={`${malamTerisi} dari ${unitAktif * 30} malam bungalow terisi`} href="/admin/kalender" />
        <Angka label={`Nilai pesanan · ${bulan}`} nilai={<><span className="sm:hidden">{rupiahRingkas(angka.nilai)}</span><span className="max-sm:hidden">{rupiah(angka.nilai)}</span></>} ket={`${rupiah(angka.dibayar)} sudah dibayar`} baik={angka.nilai > 0 && angka.dibayar >= angka.nilai} />
      </div>

      <StatistikSitus hari={hari} pilih={sp.hari} rentang={sp.rentang === '30' ? 30 : 7} />

      <section className="kartu flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0 flex-1 basis-80">
          <p className="label-kecil">Perlu perhatian</p>
          <h2 className="mt-1 text-[1.4rem] text-panel-utama">
            {perhatian.length + bentrok.length ? `${perhatian.length + bentrok.length} hal perlu ditindaklanjuti` : 'Tidak ada yang perlu dikejar'}
          </h2>
          {perhatian.length + bentrok.length ? (
            <ul className="mt-3 grid gap-2">
              {bentrok.map((b) => (
                <li key={`b${b.kamar_id}-${b.mulai}`}>
                  <Link href="/admin/sinkron" className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-[#fde3dc] px-4 py-3 hover:bg-[#f9d6cc]">
                    <span className="font-semibold text-panel-utama">{b.nama}</span>
                    <span className="text-sm text-panel-utama/80">{rentangTanggal(b.mulai, b.selesai)}</span>
                    <span className="ml-auto text-sm font-semibold text-merah">{b.terpakai} pemesanan untuk {b.unit} unit, bentrok dengan OTA</span>
                  </Link>
                </li>
              ))}
              {perhatian.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/pesanan/${p.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-panel-latar px-4 py-3 hover:bg-panel-lembut">
                    <span className="font-semibold text-panel-utama">{p.nama}</span>
                    <span className="text-sm text-abu">{p.kode}, {rentangTanggal(p.check_in, p.check_out)}</span>
                    <span className="ml-auto text-sm font-semibold text-merah">
                      {p.status === 'menunggu' ? 'Menunggu lebih dari sehari' : `Tiba ${selisihHari(hari, p.check_in) === 0 ? 'hari ini' : `${selisihHari(hari, p.check_in)} hari lagi`}, belum lunas`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="mt-1 text-[0.9375rem] text-abu">Pesanan yang menunggu lebih dari sehari, atau tamu yang tiba dalam tiga hari tapi belum lunas, akan muncul di sini.</p>}
        </div>
        <Link href="/admin/pesanan" className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.9375rem] font-semibold text-panel-utama ring-1 ring-panel-garis hover:bg-panel-latar">
          Buka meja pesanan <Ikon nama="panah" className="size-4" />
        </Link>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <KartuKecil label="Tiba terdekat" judul={tibaTerdekat.length ? `${tibaTerdekat.length} tamu berikutnya` : 'Belum ada kedatangan'}
          tombol={<Link href="/admin/kalender" className={tombolGaris}>Buka kalender <Ikon nama="panah" className="size-4" /></Link>}>
          {tibaTerdekat.length ? (
            <ul className="grid gap-2">
              {tibaTerdekat.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-panel-utama">{p.nama}</span>
                    <span className="block truncate text-sm">{p.kamar_nama}, {p.malam} malam</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-panel-utama">{tanggal(p.check_in, 'id')}</span>
                </li>
              ))}
            </ul>
          ) : 'Tamu yang akan datang dalam 30 hari tampil di sini.'}
        </KartuKecil>

        <KartuKecil label="Malam ini" judul={terisiMalamIni ? `${terisiMalamIni} dari ${unitAktif} bungalow terisi` : 'Semua bungalow kosong'}
          tombol={<Link href="/admin/kamar" className={tombolGaris}>Buka bungalow <Ikon nama="panah" className="size-4" /></Link>}>
          {menginap.length + luarMalamIni.length ? (
            <ul className="grid gap-2">
              {menginap.slice(0, 3).map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate font-semibold text-panel-utama">{p.nama}</span>
                  <span className="shrink-0 text-sm">{p.kamar_nama}</span>
                </li>
              ))}
              {luarMalamIni.slice(0, Math.max(0, 3 - menginap.length)).map((b, i) => (
                <li key={`l${b.sambungan_id}-${i}`} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate font-semibold text-panel-utama">Tamu {b.nama}</span>
                  <span className="shrink-0 text-sm">unit {b.unit}</span>
                </li>
              ))}
            </ul>
          ) : `Tidak ada tamu yang menginap malam ini.${pulang.length ? ` ${pulang.length} pesanan pulang hari ini.` : ''}`}
        </KartuKecil>

        <KartuKecil label="Status situs" judul={situs.tutup ? 'Mode pengembang menyala' : 'Terbuka untuk umum'}
          tombol={(
            <form action={aturTutup}>
              <input type="hidden" name="tutup" value={situs.tutup ? 'tidak' : 'ya'} />
              {situs.tutup ? (
                <TombolYakin tanya="Buka situs lagi untuk semua pengunjung?" className={`${tombolGaris} !bg-panel-utama !text-white !ring-0`}>
                  <Ikon nama="globe" className="size-4" /> Buka situs lagi
                </TombolYakin>
              ) : (
                <TombolYakin tanya="Tutup situs untuk pengunjung? Mereka akan melihat halaman segera dibuka sampai situs dibuka lagi." className={tombolGaris}>
                  <Ikon nama="gembok" className="size-4" /> Tutup situs sementara
                </TombolYakin>
              )}
            </form>
          )}>
          {situs.tutup
            ? 'Pengunjung hanya melihat halaman segera dibuka. Kamu tetap bisa melihat dan menguji situs karena sudah masuk ke panel.'
            : 'Nyalakan mode pengembang untuk menutup situs sementara selama masih disiapkan atau diperbaiki.'}
          <Link href="/admin/pengaturan#tutup" className="mt-2 flex items-center gap-1 text-sm font-semibold text-panel-aksen hover:underline">
            Ubah tulisan halaman tutup <Ikon nama="panah" className="size-4" />
          </Link>
        </KartuKecil>
      </div>

      {belum.length > 0 && (
        <section className="kartu p-5 sm:p-6">
          <p className="label-kecil">Persiapan situs</p>
          <h2 className="mt-1 text-[1.4rem] text-panel-utama">{belum.length} hal lagi supaya situs siap dipakai</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {belum.map((c, i) => {
              const isi = <><Ikon nama="info" className="size-5 shrink-0 text-senja-tua" /> {c.teks}{c.href && <Ikon nama="panah" className="ml-auto size-4" />}</>;
              const gaya = `flex items-center gap-3 rounded-2xl bg-panel-latar px-4 py-3 font-semibold text-panel-utama ${belum.length % 2 === 1 && i === belum.length - 1 ? 'sm:col-span-2' : ''}`;
              return <li key={c.teks}>{c.href ? <Link href={c.href} className={`${gaya} hover:bg-panel-lembut`}>{isi}</Link> : <span className={gaya}>{isi}</span>}</li>;
            })}
          </ul>
        </section>
      )}

      <MejaPesanan pesanan={meja} homestay={situs.nama} jumlah={jumlahMeja} q={q} status={status} aksi="/admin"
        teks="Pesanan terbaru dari situs dan yang dicatat manual. Yang masuk dalam sehari terakhir ditandai baru." />
    </div>
  );
}
