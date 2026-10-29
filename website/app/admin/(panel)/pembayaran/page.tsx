// Online payment through Midtrans: the keys, the address for payment
// notifications, and the last notification Midtrans sent.
import { headers } from 'next/headers';
import Ikon from '@/components/Ikon';
import Salin from '@/components/Salin';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import TombolYakin from '@/components/admin/TombolYakin';
import { lepasMidtrans, simpanMidtrans, tampilMidtrans } from '@/app/admin/aksi';
import { alamatSitus } from '@/lib/env';
import { waktu } from '@/lib/format';
import { statusMidtrans, type HasilKabar } from '@/lib/midtrans';

export const metadata = { title: 'Pembayaran' };

const PESAN = {
  'ok:simpan': 'Kunci Midtrans diterima Midtrans dan sudah terpasang.',
  'ok:lepas': 'Kunci Midtrans sudah dilepas. Tamu kembali hanya melihat transfer manual.',
  'ok:tampil': 'Tombol Bayar online tampil lagi di halaman pesanan tamu.',
  'ok:sembunyi': 'Tombol Bayar online disembunyikan dari tamu. Kuncinya tetap tersimpan.',
  'galat:env': 'Kunci sedang dipasang lewat environment variables di hPanel, jadi diganti di sana.',
  'galat:bentuk': 'Bentuk kuncinya belum benar. Server Key diawali Mid-server- dan Client Key diawali Mid-client-, untuk sandbox keduanya diawali SB-.',
  'galat:campur': 'Server Key dan Client Key harus dari mode yang sama, keduanya sandbox atau keduanya produksi.',
  'galat:ditolak': 'Server Key ditolak Midtrans. Salin lagi dari Dashboard Midtrans, menu Settings, Access Keys.',
  'galat:jaringan': 'Server situs belum bisa menghubungi Midtrans untuk menguji kuncinya. Coba lagi sebentar lagi.',
};

// What the last notification means for the owner.
const ARTI: Record<HasilKabar, [boolean, string]> = {
  diterapkan: [true, 'diterima dan diterapkan ke pesanannya.'],
  tidakBerubah: [true, 'diterima. Pesanannya sudah tercatat dengan status itu.'],
  bukanPesanan: [true, 'diterima. Ordernya bukan pesanan situs ini, misalnya kabar uji dari tombol Test notification URL, jadi tidak mengubah apa pun.'],
  tandaTanganSalah: [false, 'ditolak karena tanda tangannya tidak cocok dengan Server Key yang terpasang. Biasanya kabar datang dari Dashboard produksi padahal yang terpasang kunci sandbox, atau sebaliknya.'],
  belumDipasang: [false, 'sampai, tetapi kunci belum dipasang, jadi keasliannya tidak bisa diperiksa dan tidak dipakai.'],
};

export default async function Pembayaran({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [sp, st, h] = await Promise.all([searchParams, statusMidtrans(), headers()]);
  const dasar = alamatSitus() || `${(h.get('x-forwarded-proto') ?? 'http').split(',')[0]}://${h.get('x-forwarded-host') ?? h.get('host')}`;
  const notifikasi = `${dasar}/api/midtrans/notifikasi`;
  const mode = st.produksi ? 'Produksi, pembayaran sungguhan' : 'Sandbox, uji coba tanpa uang sungguhan';
  return (
    <>
      <JudulAdmin judul="Pembayaran" teks="Pembayaran online lewat Midtrans. Tamu membayar dari halaman pesanannya dengan kartu, QRIS, virtual account bank, atau dompet digital, tanpa meninggalkan situs. Transfer manual ke rekening tetap tersedia." />
      <Kabar ok={sp.ok} galat={sp.galat} pesan={PESAN} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="grid content-start gap-6">
          <section className="kartu p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl">Midtrans</h2>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${st.aktif ? (st.produksi ? 'bg-biru-tua text-white' : 'bg-pasir text-laut') : 'bg-panel-latar text-abu'}`}>
                {st.aktif ? (st.produksi ? 'Produksi' : 'Sandbox') : 'Belum terpasang'}
              </span>
            </div>
            {st.envSalah && (
              <p role="alert" className="mt-4 rounded-2xl bg-[#fde3dc] px-4 py-3 text-sm font-semibold text-merah">
                MIDTRANS_SERVER_KEY di environment variables hPanel terisi, tetapi MIDTRANS_CLIENT_KEY kosong, bentuknya salah, atau keduanya dari mode yang berbeda. Periksa keduanya di hPanel.
              </p>
            )}
            {st.aktif ? (
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-buih px-4 py-3">
                  <dt className="text-sm text-abu">Mode</dt>
                  <dd className="font-semibold text-laut">{mode}</dd>
                </div>
                <div className="rounded-2xl bg-buih px-4 py-3">
                  <dt className="text-sm text-abu">Server Key</dt>
                  <dd className="font-semibold text-laut">berakhiran {st.akhiran}</dd>
                </div>
                <div className="rounded-2xl bg-buih px-4 py-3 sm:col-span-2">
                  <dt className="text-sm text-abu">Client Key</dt>
                  <dd className="font-semibold break-all text-laut">{st.client}</dd>
                </div>
                <div className="rounded-2xl bg-buih px-4 py-3 sm:col-span-2">
                  <dt className="text-sm text-abu">Dipasang</dt>
                  <dd className="font-semibold text-laut">{st.sumber === 'env' ? 'Lewat environment variables di hPanel' : st.diuji ? `Dari panel ini, diuji ${waktu(st.diuji.slice(0, 19).replace('T', ' '))}` : 'Dari panel ini'}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-abu">Selama kunci belum dipasang, halaman pesanan tamu hanya menampilkan transfer manual ke rekening.</p>
            )}

            {st.aktif && (
              <form action={tampilMidtrans} className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-embun px-4 py-3">
                <input type="hidden" name="tampil" value={st.tampil ? 'tidak' : 'ya'} />
                <p className="min-w-0 flex-1 text-sm text-laut">
                  {st.tampil ? 'Tombol Bayar online tampil di halaman pesanan tamu yang menunggu pembayaran.' : 'Tombol Bayar online sedang disembunyikan dari tamu.'}
                </p>
                <button className={`tombol tombol-kecil ${st.tampil ? 'tombol-putih' : ''}`}>{st.tampil ? 'Sembunyikan dari tamu' : 'Tampilkan ke tamu'}</button>
              </form>
            )}
          </section>

          <section className="kartu p-5 sm:p-7">
            <h2 className="text-2xl">{st.aktif ? 'Ganti kunci' : 'Pasang kunci'}</h2>
            {st.sumber === 'env' ? (
              <p className="mt-2 text-abu">Kunci sedang dipasang lewat environment variables MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY di hPanel, jadi diganti di sana lalu aplikasinya dimulai ulang.</p>
            ) : (
              <form action={simpanMidtrans} className="mt-4 grid gap-4">
                <div>
                  <label className="label-isian" htmlFor="server">Server Key</label>
                  <input id="server" name="server" type="password" autoComplete="off" spellCheck={false} required placeholder={st.aktif ? `Tersimpan, berakhiran ${st.akhiran}` : 'SB-Mid-server-…'} className="isian font-mono" />
                  <p className="bantuan">Rahasia. Hanya dibaca server situs, tidak pernah tampil lagi di panel selain empat huruf terakhirnya.</p>
                </div>
                <div>
                  <label className="label-isian" htmlFor="client">Client Key</label>
                  <input id="client" name="client" autoComplete="off" spellCheck={false} required defaultValue={st.sumber === 'panel' ? st.client : ''} placeholder="SB-Mid-client-…" className="isian font-mono" />
                  <p className="bantuan">Dipakai peramban tamu untuk membuka jendela pembayaran, jadi boleh terlihat.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="tombol tombol-kecil"><Ikon nama="gembok" className="size-4" /> Uji dan simpan</button>
                  <p className="text-sm text-abu">Kunci diuji ke Midtrans dulu sebelum disimpan.</p>
                </div>
              </form>
            )}
          </section>

          <section className="kartu p-5 sm:p-7">
            <h2 className="text-2xl">Cara memasang</h2>
            <p className="mt-2 text-abu">Ikuti langkah berikut sekali saja. Mulai dari Sandbox untuk mencoba tanpa uang sungguhan, lalu ganti ke Produksi setelah akun Midtrans disetujui.</p>
            <ol className="mt-4 grid gap-3">
              {[
                ['Masuk ke Dashboard Midtrans', 'Pilih lingkungan Sandbox atau Production di kiri atas. Kunci dan alamat notifikasi diatur terpisah di keduanya.'],
                ['Salin kedua kunci', 'Buka Settings, Access Keys, lalu salin Server Key dan Client Key ke isian di atas dan tekan Uji dan simpan.'],
                ['Pasang alamat notifikasi', 'Buka Settings, Payment, Notification URL, tempel alamat notifikasi di samping, lalu simpan. Dari sana Midtrans mengabari situs saat tamu sudah membayar.'],
                ['Coba satu pesanan', 'Buat pesanan di situs, buka halamannya, lalu tekan Bayar online. Di Sandbox pembayaran diselesaikan lewat simulator Midtrans, dan pesanannya berubah menjadi Lunas.'],
              ].map(([judul, isi], i) => (
                <li key={judul} className="flex gap-4 rounded-2xl bg-embun p-4">
                  <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-panel-utama font-judul text-white">{i + 1}</span>
                  <span>
                    <span className="block font-semibold text-laut">{judul}</span>
                    <span className="mt-0.5 block text-sm text-abu">{isi}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="grid content-start gap-6">
          <section className="kartu p-5 sm:p-6">
            <h2 className="text-xl">Alamat notifikasi</h2>
            <p className="mt-1 text-sm text-abu">Tempel di Dashboard Midtrans, Settings, Payment, Notification URL.</p>
            <p className="mt-3 rounded-2xl bg-buih px-4 py-3 font-mono text-sm break-all text-laut">{notifikasi}</p>
            <div className="mt-3"><Salin teks={notifikasi} label="Salin alamat" sudah="Tersalin" /></div>
            <p className="mt-3 text-sm text-abu">Finish URL di Dashboard tidak perlu diisi. Setiap pembayaran sudah membawa alamat halaman pesanan tamunya sendiri.</p>
          </section>

          <section className="kartu p-5 sm:p-6">
            <h2 className="text-xl">Kabar terakhir dari Midtrans</h2>
            {st.kabar ? (
              <div className={`mt-3 rounded-2xl px-4 py-3 text-sm ${ARTI[st.kabar.hasil]?.[0] ? 'bg-buih text-laut' : 'bg-[#fde3dc] text-merah'}`}>
                <p className="font-semibold">{waktu(st.kabar.waktu.slice(0, 19).replace('T', ' '))}</p>
                <p className="mt-1">Order {st.kabar.orderId} {ARTI[st.kabar.hasil]?.[1] ?? ''}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-abu">Belum ada kabar yang sampai. Setelah alamat notifikasi dipasang, tombol Test notification URL di Dashboard Midtrans mengirim satu kabar uji ke sini.</p>
            )}
          </section>

          {st.aktif && st.sumber === 'panel' && (
            <section className="kartu p-5 sm:p-6">
              <h2 className="text-xl">Lepas kunci</h2>
              <p className="mt-1 text-sm text-abu">Kunci dihapus dari situs dan tamu kembali hanya melihat transfer manual. Pesanan yang sudah dibayar online tidak berubah.</p>
              <form action={lepasMidtrans} className="mt-4">
                <TombolYakin tanya="Lepas kunci Midtrans dari situs? Tombol Bayar online hilang dari halaman pesanan tamu.">Lepas kunci</TombolYakin>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
