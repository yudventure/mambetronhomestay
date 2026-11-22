// Guide for Google Search Console in the panel, the owner's request, November
// 2026: "bisa buatkan panduan setting google search consolenya di admin".
// What the site has ready (lib/seo.ts), where it stands now (developer mode,
// SITE_URL, the verification tag, the DNS record, the sitemap), the steps in
// Search Console with every address to paste beside a copy button, and the
// verification code field for the HTML tag method.
import Link from 'next/link';
import Ikon from '@/components/Ikon';
import Salin from '@/components/Salin';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import { simpanVerifikasiGoogle } from '@/app/admin/aksi';
import { asalHalaman } from '@/lib/asal';
import { ambilSitus, daftarKamar } from '@/lib/data';
import { alamatSitus } from '@/lib/env';
import { kodeVerifikasiGoogle } from '@/lib/seo';
import { domainUtama, txtGoogle } from '@/lib/seo-server';

export const metadata = { title: 'Google Search Console' };

const PESAN = {
  'ok:kode': 'Kode verifikasi tersimpan dan tag meta-nya sudah tampil di semua halaman. Sekarang tekan Verifikasi di Search Console.',
  'ok:hapus': 'Kode verifikasi dikosongkan. Tag meta-nya tidak tampil lagi di situs.',
  'galat:bentuk': 'Kode itu tidak dikenali. Salin tag meta dari Search Console, metode Tag HTML, lalu tempel utuh di sini.',
};

const CONSOLE = 'https://search.google.com/search-console';

type Nada = 'baik' | 'perlu' | 'netral';
const WARNA: Record<Nada, string> = { baik: 'bg-[#dff5e6] text-[#1f7a3d]', perlu: 'bg-pasir text-laut', netral: 'bg-panel-latar text-abu' };

function Keadaan({ judul, lencana, nada, children }: { judul: string; lencana: string; nada: Nada; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl bg-embun px-4 py-3" data-keadaan-google={nada}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-laut">{judul}</span>
        <span className={`rounded-full px-3 py-0.5 text-xs font-bold whitespace-nowrap ${WARNA[nada]}`}>{lencana}</span>
      </div>
      <div className="mt-1 text-sm text-abu">{children}</div>
    </div>
  );
}

function Alamat({ url, label }: { url: string; label: string }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <code className="w-full min-w-0 rounded-xl bg-white px-3 py-2 font-mono text-sm break-all text-laut ring-1 ring-buih-2 sm:w-auto sm:flex-1">{url}</code>
      <Salin teks={url} label={label} sudah="Tersalin" />
    </span>
  );
}

export default async function GoogleSearch({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [sp, situs, kamar, dasar] = await Promise.all([searchParams, ambilSitus(), daftarKamar().catch(() => []), asalHalaman()]);
  const tetap = alamatSitus();
  const domain = domainUtama(dasar);
  const dns = await txtGoogle(domain);
  const kode = kodeVerifikasiGoogle(situs.googleVerifikasi);
  const sitemap = `${dasar}/sitemap.xml`;
  const halaman = [
    { nama: 'Beranda', url: `${dasar}/` },
    ...kamar.map((k) => ({ nama: k.nama, url: `${dasar}/kamar/${k.slug}` })),
  ];
  const jumlahSitemap = 4 + kamar.length + (kamar.length > 1 ? 1 : 0);
  const terverifikasi = !!kode || dns?.keadaan === 'ada';

  return (
    <>
      <JudulAdmin label="Situs web" judul="Google Search Console"
        teks="Search Console menunjukkan apakah halaman situs ini sudah masuk Google, kata apa yang dipakai tamu untuk menemukannya, dan masalah yang perlu dibetulkan. Ikuti langkah di halaman ini sekali saja." />
      <Kabar ok={sp.ok} galat={sp.galat} pesan={PESAN} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="grid min-w-0 grid-cols-1 content-start gap-6">
          <section className="kartu p-5 sm:p-7" data-keadaan-search-console>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl">Keadaan sekarang</h2>
              <a href={CONSOLE} target="_blank" rel="noopener noreferrer" className="tombol tombol-kecil"><Ikon nama="luar" className="size-4" /> Buka Search Console</a>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3">
              <Keadaan judul="Situs untuk Google" nada={situs.tutup ? 'perlu' : 'baik'} lencana={situs.tutup ? 'Masih tertutup' : 'Terbuka'}>
                {situs.tutup
                  ? <>Mode pengembang menyala, jadi semua halaman bertanda noindex dan belum akan masuk Google. Verifikasi dan sitemap tetap bisa disiapkan sekarang. Matikan Mode pengembang di <Link href="/admin" className="font-semibold text-biru-tua underline-offset-4 hover:underline">Ringkasan</Link> saat situs siap dibuka.</>
                  : 'Halaman publik boleh masuk Google. Panel, halaman pesanan tamu, dan formulir pesan tetap tidak masuk.'}
              </Keadaan>
              <Keadaan judul="Alamat situs" nada={tetap ? 'baik' : 'perlu'} lencana={tetap ? 'Terpasang' : 'SITE_URL kosong'}>
                {tetap
                  ? <>Sitemap dan alamat utama tiap halaman memakai {tetap}.</>
                  : <>SITE_URL belum diisi di hPanel, jadi sementara dipakai alamat yang sedang dibuka, {dasar}. Isi SITE_URL dengan https://mambetronhomestay.com supaya Google selalu melihat alamat utama.</>}
              </Keadaan>
              <Keadaan judul="Verifikasi lewat DNS" nada={dns?.keadaan === 'ada' ? 'baik' : 'netral'}
                lencana={dns === null ? 'Tidak diperiksa' : dns.keadaan === 'ada' ? 'Ditemukan' : dns.keadaan === 'kosong' ? 'Belum ada' : 'Belum terbaca'}>
                {dns === null ? 'Diperiksa begitu panel dibuka dari domain situs, bukan dari alamat lokal.'
                  : dns.keadaan === 'ada' ? <>Rekaman TXT Google ditemukan di DNS {domain}. Tekan Verifikasi di Search Console kalau belum.</>
                  : dns.keadaan === 'kosong' ? <>Belum ada rekaman TXT Google di DNS {domain}. Kalau baru ditambahkan di hPanel, tunggu beberapa menit lalu muat ulang halaman ini.</>
                  : 'DNS belum bisa diperiksa dari server sekarang. Coba muat ulang halaman ini sebentar lagi.'}
              </Keadaan>
              <Keadaan judul="Verifikasi lewat tag HTML" nada={kode ? 'baik' : 'netral'} lencana={kode ? 'Terpasang' : 'Belum diisi'}>
                {kode ? 'Tag meta Google tampil di semua halaman, juga selama Mode pengembang menyala.' : 'Tidak perlu diisi kalau situs diverifikasi lewat DNS.'}
              </Keadaan>
              <Keadaan judul="Peta situs" nada="baik" lencana={`${jumlahSitemap} halaman`}>
                <span className="mb-2 block">Beranda, halaman bungalow, Ketentuan menginap, Syarat dan ketentuan, dan Kebijakan privasi.</span>
                <Alamat url={sitemap} label="Salin" />
              </Keadaan>
            </div>
          </section>

          <section className="kartu p-5 sm:p-7" data-langkah-search-console>
            <h2 className="text-2xl">Langkah memasang</h2>
            <p className="mt-2 text-abu">Pakai akun Google milik homestay, bukan akun pribadi pengelola, supaya aksesnya tidak hilang kalau pengelola berganti. Orang lain bisa ditambahkan nanti di menu Setelan, Pengguna dan izin.</p>
            <ol className="mt-4 grid grid-cols-1 gap-3">
              <Langkah n={1} judul="Masuk ke Search Console">
                Buka search.google.com/search-console lalu masuk dengan akun Google homestay.
                <span className="mt-2 block"><a href={CONSOLE} target="_blank" rel="noopener noreferrer" className="tombol tombol-putih tombol-kecil"><Ikon nama="luar" className="size-4" /> Buka Search Console</a></span>
              </Langkah>
              <Langkah n={2} judul="Tambahkan properti">
                Tekan pilihan properti di kiri atas, lalu Tambahkan properti. Ada dua pilihan, dan cukup salah satu.
                <span className="mt-3 grid grid-cols-1 gap-2">
                  <span className="min-w-0 rounded-2xl bg-white p-3 ring-1 ring-buih-2">
                    <span className="block font-semibold text-laut">Domain, disarankan</span>
                    <span className="block">Mencakup alamat dengan dan tanpa www. Isi nama domainnya saja.</span>
                    {domain && <span className="mt-2 block"><Alamat url={domain} label="Salin" /></span>}
                  </span>
                  <span className="min-w-0 rounded-2xl bg-white p-3 ring-1 ring-buih-2">
                    <span className="block font-semibold text-laut">Awalan URL</span>
                    <span className="block">Lebih cepat, verifikasinya lewat tag di halaman ini. Isi alamat lengkapnya.</span>
                    <span className="mt-2 block"><Alamat url={tetap || dasar} label="Salin" /></span>
                  </span>
                </span>
              </Langkah>
              <Langkah n={3} judul="Verifikasi kepemilikan">
                <span className="block"><b className="font-semibold text-laut">Untuk Domain.</b> Google memberi teks yang diawali google-site-verification. Di hPanel buka Domain, pilih domain situs ini, lalu menu DNS. Tambahkan rekaman baru dengan tipe TXT, nama @, dan isi teks dari Google, TTL dibiarkan. Simpan, lalu tekan Verifikasi di Search Console. Perubahan DNS bisa butuh beberapa menit sampai beberapa jam, dan keadaannya terlihat di kotak Verifikasi lewat DNS di atas.</span>
                <span className="mt-2 block"><b className="font-semibold text-laut">Untuk Awalan URL.</b> Pilih metode Tag HTML, salin tagnya, tempel di isian Kode verifikasi di samping, tekan Simpan, lalu tekan Verifikasi di Search Console. Jangan hapus kodenya setelah berhasil, karena Google memeriksanya lagi sewaktu-waktu.</span>
              </Langkah>
              <Langkah n={4} judul="Kirim peta situs">
                Buka menu Peta situs (Sitemaps) di kiri. Di kolom Tambahkan peta situs baru, isi sitemap.xml lalu tekan Kirim. Statusnya menjadi Berhasil setelah Google membacanya, biasanya dalam satu atau dua hari.
                <span className="mt-2 block"><Alamat url="sitemap.xml" label="Salin" /></span>
              </Langkah>
              <Langkah n={5} judul="Buka situs untuk Google">
                {situs.tutup
                  ? <>Mode pengembang masih menyala. Matikan di <Link href="/admin" className="font-semibold text-biru-tua underline-offset-4 hover:underline">Ringkasan</Link> saat situs siap dibuka untuk tamu, karena selama menyala Google tidak memasukkan halaman mana pun.</>
                  : 'Mode pengembang sudah mati, jadi halaman publik boleh masuk Google.'}
              </Langkah>
              <Langkah n={6} judul="Minta pengindeksan">
                Tempel alamat berikut satu per satu di kotak Periksa URL di bagian atas Search Console, tunggu hasilnya, lalu tekan Minta pengindeksan. Lakukan lagi setiap kali isi halaman banyak berubah.
                <span className="mt-2 grid grid-cols-1 gap-2">
                  {halaman.map((h) => (
                    <span key={h.url} className="block">
                      <span className="mb-1 block text-xs font-semibold text-laut">{h.nama}</span>
                      <Alamat url={h.url} label="Salin" />
                    </span>
                  ))}
                </span>
              </Langkah>
              <Langkah n={7} judul="Pantau tiap minggu">
                Menu Performa menunjukkan kata pencarian, tayangan, dan klik ke situs ini. Menu Halaman di bagian Pengindeksan menunjukkan halaman yang sudah atau belum masuk Google beserta alasannya. Situs baru biasanya butuh beberapa hari sampai beberapa minggu sampai muncul di hasil pencarian.
              </Langkah>
            </ol>
          </section>
        </div>

        <div className="grid min-w-0 grid-cols-1 content-start gap-6">
          <section className="kartu p-5 sm:p-7" data-kode-google>
            <h2 className="text-2xl">Kode verifikasi</h2>
            <p className="mt-2 text-sm text-abu">Untuk properti Awalan URL dengan metode Tag HTML. Tempel tag meta dari Search Console utuh atau isinya saja.</p>
            <form action={simpanVerifikasiGoogle} className="mt-4 grid gap-3">
              <label className="label-isian" htmlFor="kode-google">Tag atau kode dari Google</label>
              <input id="kode-google" name="kode" defaultValue={kode} autoComplete="off" spellCheck={false}
                placeholder='<meta name="google-site-verification" content="…" />' className="isian font-mono text-sm" />
              <div className="flex flex-wrap items-center gap-3">
                <button className="tombol tombol-kecil"><Ikon nama="centang" className="size-4" /> Simpan</button>
                {terverifikasi && <span className="text-sm text-abu">Kosongkan lalu simpan untuk melepas tag.</span>}
              </div>
            </form>
          </section>

          <section className="kartu p-5 sm:p-7">
            <h2 className="text-2xl">Yang sudah disiapkan situs</h2>
            <ul className="mt-4 grid gap-3 text-sm text-abu">
              {[
                'Peta situs berisi halaman publik, dan robots.txt yang menunjuknya.',
                'Alamat utama di tiap halaman, tanpa tanggal dan jumlah tamu di alamatnya, supaya Google tidak menganggapnya halaman berbeda.',
                'Data penginapan untuk Google di beranda, dari isian panel, yaitu nama, foto, WhatsApp, lokasi, jam check-in, rentang harga, jumlah bungalow, dan fasilitas.',
                'Judul dan deskripsi di Google diatur di Isi situs, bagian Identitas.',
                'Panel, halaman pesanan tamu, dan formulir pesan bertanda noindex, jadi tidak masuk Google.',
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <span aria-hidden className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#dff5e6] text-[#1f7a3d]"><Ikon nama="centang" className="size-3.5" /></span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="tombol tombol-putih tombol-kecil"><Ikon nama="luar" className="size-4" /> Lihat sitemap.xml</a>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="tombol tombol-putih tombol-kecil"><Ikon nama="luar" className="size-4" /> Lihat robots.txt</a>
            </div>
          </section>

          <section className="kartu p-5 sm:p-7">
            <h2 className="text-2xl">Tentang bahasa</h2>
            <p className="mt-2 text-sm text-abu">Bahasa situs disimpan di kuki dan alamatnya tidak memuat kode bahasa, jadi Google membaca versi bahasa Inggris. Tamu Indonesia tetap menemukan situs ini, dengan cuplikan berbahasa Inggris di hasil pencarian.</p>
          </section>
        </div>
      </div>
    </>
  );
}

function Langkah({ n, judul, children }: { n: number; judul: string; children: React.ReactNode }) {
  return (
    <li className="flex min-w-0 gap-4 rounded-2xl bg-embun p-4">
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-panel-utama font-judul text-white">{n}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-laut">{judul}</span>
        <span className="mt-0.5 block text-sm text-abu">{children}</span>
      </span>
    </li>
  );
}
