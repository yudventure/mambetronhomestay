import Link from 'next/link';
import { notFound } from 'next/navigation';
import Ikon from '@/components/Ikon';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import { LencanaStatus } from '@/components/admin/BarisPesanan';
import TombolYakin from '@/components/admin/TombolYakin';
import { hapusPesanan, tandaiPesanan, ubahJadwal, ubahPesanan } from '@/app/admin/aksi';
import { ambilSitus, daftarKamar, pesananDariId } from '@/lib/data';
import { alamatSitus } from '@/lib/env';
import { rupiah, tanggal, tautanWa, waktu } from '@/lib/format';
import { KAMUS } from '@/lib/kamus';
import { SATUAN } from '@/lib/satuan.mjs';
import { headers } from 'next/headers';

export const metadata = { title: 'Rincian pesanan' };

const PESAN = {
  ok: 'Perubahan tersimpan.',
  'ok:baru': 'Pesanan baru sudah dicatat.',
  'ok:jadwal': 'Jadwal sudah diubah dan harga dihitung ulang dengan tarif sekarang.',
  'galat:penuh': 'Tanggal itu sudah penuh untuk bungalow ini, jadi perubahan tidak disimpan.',
  'galat:tanggal': 'Tanggal tiba dan pulang belum benar.',
  'galat:kamar': 'Bungalow tidak ditemukan.',
  'galat:jumlah': 'Jumlah bungalow melebihi unit yang ada.',
  'galat:yakin': 'Ketik HAPUS dengan huruf besar untuk menghapus pesanan.',
};

function Data({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-buih px-4 py-3">
      <dt className="text-sm text-abu">{label}</dt>
      <dd className="font-semibold break-words text-laut">{children}</dd>
    </div>
  );
}

export default async function RincianPesanan({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const p = await pesananDariId(Number(id));
  if (!p) notFound();
  const [situs, kamar] = await Promise.all([ambilSitus(), daftarKamar(true)]);
  const h = await headers();
  const dasar = alamatSitus() || `${(h.get('x-forwarded-proto') ?? 'http').split(',')[0]}://${h.get('x-forwarded-host') ?? h.get('host')}`;
  const tautanTamu = `${dasar}/pesanan/${p.kode}?t=${p.token}`;
  const salam = p.bahasa === 'en'
    ? `Hi ${p.nama}, thank you for booking ${situs.nama}. Your booking code is ${p.kode}. Details and payment are here ${tautanTamu}`
    : `Halo ${p.nama}, terima kasih sudah memesan di ${situs.nama}. Kode pesananmu ${p.kode}. Rincian dan pembayaran ada di ${tautanTamu}`;
  const waTamu = tautanWa(p.telepon, salam);
  const sisa = Math.max(0, p.total - p.dibayar);

  return (
    <>
      <Link href="/admin/pesanan" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-biru-tua hover:underline">
        <Ikon nama="kiri" className="size-4" /> Semua pesanan
      </Link>
      <JudulAdmin judul={`Pesanan ${p.kode}`} teks={`Masuk ${waktu(p.dibuat)} lewat ${p.sumber === 'admin' ? 'panel pengelola' : 'situs'}.`}>
        <LencanaStatus status={p.status} />
      </JudulAdmin>
      <Kabar ok={sp.ok} galat={sp.galat} pesan={PESAN} />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="grid gap-6">
          <section className="kartu p-5 sm:p-6">
            <h2 className="text-2xl">Tamu dan jadwal</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Data label="Nama">{p.nama}</Data>
              <Data label="WhatsApp">{p.telepon || 'Tidak diisi'}</Data>
              <Data label="Surel">{p.email || 'Tidak diisi'}</Data>
              <Data label="Asal">{p.negara || 'Tidak diisi'}</Data>
              <Data label="Tiba">{tanggal(p.check_in, 'id', 'panjang')}</Data>
              <Data label="Pulang">{tanggal(p.check_out, 'id', 'panjang')}</Data>
              <Data label="Bungalow">{p.kamar_nama}, {p.jumlah_kamar} bungalow, {p.malam} malam</Data>
              <Data label="Tamu">{KAMUS.id.hasil.tamu(p.dewasa, p.anak)}</Data>
              <Data label="Rencana tiba">{p.kedatangan || 'Tidak diisi'}</Data>
              <Data label="Bahasa tamu">{p.bahasa === 'en' ? 'Inggris' : 'Indonesia'}</Data>
            </dl>
            {p.catatan && (
              <div className="mt-3 rounded-2xl bg-pasir px-4 py-3">
                <p className="text-sm text-abu">Catatan tamu</p>
                <p className="whitespace-pre-line text-laut">{p.catatan}</p>
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {waTamu && <a href={waTamu} target="_blank" rel="noopener" className="tombol tombol-biru tombol-kecil"><Ikon nama="chat" className="size-4" /> Kirim WhatsApp ke tamu</a>}
              <a href={tautanTamu} target="_blank" rel="noopener" className="tombol tombol-putih tombol-kecil"><Ikon nama="luar" className="size-4" /> Halaman tamu</a>
            </div>
          </section>

          <section className="kartu p-5 sm:p-6">
            <h2 className="text-2xl">Rincian harga</h2>
            <div className="mt-4 grid gap-3">
              <div className="flex justify-between gap-3">
                <span>{p.kamar_nama}<span className="block text-sm text-abu">{rupiah(p.harga_satuan)} {KAMUS.id.perSkema[p.skema_harga]}, {p.malam} malam{p.paket ? `, paket ${p.paket.nama.id}${p.paket.persen ? ` +${p.paket.persen}%` : ''}` : ''}</span></span>
                <span className="font-semibold tabular-nums">{rupiah(p.biaya_kamar)}</span>
              </div>
              {p.rincian.map((r) => (
                <div key={r.id} className="flex justify-between gap-3">
                  <span>{r.nama}<span className="block text-sm text-abu">{r.jumlah} × {rupiah(r.harga)}, {SATUAN[r.satuan].id}</span></span>
                  <span className="font-semibold tabular-nums">{rupiah(r.subtotal)}</span>
                </div>
              ))}
              <div className="rounded-2xl bg-buih px-4 py-3">
                <div className="flex justify-between gap-3"><span className="font-semibold">Total</span><span className="font-judul text-2xl font-semibold tabular-nums text-laut">{rupiah(p.total)}</span></div>
                {p.dp > 0 && p.dp < p.total && <div className="flex justify-between gap-3 text-sm"><span>Uang muka</span><span className="tabular-nums">{rupiah(p.dp)}</span></div>}
                <div className="flex justify-between gap-3 text-sm"><span>Sudah dibayar</span><span className="font-bold tabular-nums">{rupiah(p.dibayar)}</span></div>
                <div className="flex justify-between gap-3 text-sm text-abu"><span>Sisa</span><span className="tabular-nums">{rupiah(sisa)}</span></div>
              </div>
              {p.paket && (
                <div className="rounded-2xl bg-embun px-4 py-3 text-sm">
                  <p className="font-semibold text-laut">Paket {p.paket.nama.id}</p>
                  {p.paket.syarat.id && <p className="mt-0.5 text-abu">{p.paket.syarat.id}</p>}
                </div>
              )}
            </div>
          </section>

          <section className="kartu p-5 sm:p-6">
            <h2 className="text-2xl">Ubah jadwal atau bungalow</h2>
            <p className="mt-1 text-sm text-abu">Ketersediaan diperiksa lagi dan harga dihitung ulang dengan tarif bungalow sekarang dan paket harga pesanan ini.</p>
            <form key={`${p.kamar_id}|${p.check_in}|${p.check_out}|${p.jumlah_kamar}|${p.dewasa}|${p.anak}`} action={ubahJadwal} className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={p.id} />
              <div className="sm:col-span-2">
                <label className="label-isian" htmlFor="kamar_id">Bungalow</label>
                <select id="kamar_id" name="kamar_id" defaultValue={p.kamar_id} className="isian">
                  {kamar.map((k) => <option key={k.id} value={k.id}>{k.nama}{k.aktif ? '' : ' (nonaktif)'}</option>)}
                </select>
              </div>
              <div><label className="label-isian" htmlFor="masuk">Tiba</label><input id="masuk" name="masuk" type="date" defaultValue={p.check_in} required className="isian" /></div>
              <div><label className="label-isian" htmlFor="keluar">Pulang</label><input id="keluar" name="keluar" type="date" defaultValue={p.check_out} required className="isian" /></div>
              <div><label className="label-isian" htmlFor="jumlah_kamar">Jumlah bungalow</label><input id="jumlah_kamar" name="jumlah_kamar" type="number" min={1} defaultValue={p.jumlah_kamar} className="isian" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-isian" htmlFor="dewasa">Dewasa</label><input id="dewasa" name="dewasa" type="number" min={1} defaultValue={p.dewasa} className="isian" /></div>
                <div><label className="label-isian" htmlFor="anak">Anak</label><input id="anak" name="anak" type="number" min={0} defaultValue={p.anak} className="isian" /></div>
              </div>
              <div className="sm:col-span-2"><button className="tombol tombol-laut tombol-kecil">Simpan jadwal</button></div>
            </form>
          </section>
        </div>

        <div className="grid content-start gap-6">
          <section className="kartu p-5 sm:p-6">
            <h2 className="text-2xl">Tindakan cepat</h2>
            <div className="mt-4 grid gap-2">
              {p.status === 'menunggu' && p.dp > 0 && p.dp < p.total && (
                <form action={tandaiPesanan}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="apa" value="dp" />
                  <button className="tombol tombol-biru w-full">Uang muka diterima</button></form>
              )}
              {(p.status === 'menunggu' || p.status === 'dikonfirmasi') && (
                <form action={tandaiPesanan}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="apa" value="lunas" />
                  <button className="tombol tombol-laut w-full">Tandai lunas</button></form>
              )}
              {p.status === 'lunas' && (
                <form action={tandaiPesanan}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="apa" value="selesai" />
                  <button className="tombol tombol-laut w-full">Tamu sudah pulang</button></form>
              )}
              {p.status !== 'batal' && (
                <form action={tandaiPesanan}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="apa" value="batal" />
                  <TombolYakin tanya="Batalkan pesanan ini? Bungalow akan terbuka lagi untuk tamu lain." className="tombol tombol-merah w-full">Batalkan pesanan</TombolYakin></form>
              )}
            </div>
          </section>

          <section className="kartu p-5 sm:p-6">
            <h2 className="text-2xl">Status dan pembayaran</h2>
            {/* keyed on the saved values so the fields reload after every change */}
            <form key={`${p.status}|${p.total}|${p.dibayar}|${p.catatan_admin}`} action={ubahPesanan} className="mt-4 grid gap-4">
              <input type="hidden" name="id" value={p.id} />
              <div>
                <label className="label-isian" htmlFor="status">Status</label>
                <select id="status" name="status" defaultValue={p.status} className="isian">
                  {(['menunggu', 'dikonfirmasi', 'lunas', 'selesai', 'batal'] as const).map((s) => <option key={s} value={s}>{KAMUS.id.status[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="label-isian" htmlFor="total">Total tagihan</label>
                <input id="total" name="total" inputMode="numeric" defaultValue={p.total} className="isian" />
                <p className="bantuan">Ubah bila memberi harga khusus.</p>
              </div>
              <div>
                <label className="label-isian" htmlFor="dibayar">Sudah dibayar</label>
                <input id="dibayar" name="dibayar" inputMode="numeric" defaultValue={p.dibayar} className="isian" />
              </div>
              <div>
                <label className="label-isian" htmlFor="catatan_admin">Catatan pengelola</label>
                <textarea id="catatan_admin" name="catatan_admin" defaultValue={p.catatan_admin} className="isian" />
                <p className="bantuan">Hanya terlihat di panel ini.</p>
              </div>
              <button className="tombol tombol-laut">Simpan</button>
            </form>
          </section>

          <section className="kartu p-5 sm:p-6">
            <h2 className="text-xl">Hapus pesanan</h2>
            <p className="mt-1 text-sm text-abu">Untuk pesanan palsu atau uji coba. Pesanan yang batal cukup diberi status Dibatalkan.</p>
            <form action={hapusPesanan} className="mt-3 grid gap-3">
              <input type="hidden" name="id" value={p.id} />
              <label className="label-isian" htmlFor="yakin">Ketik HAPUS untuk memastikan</label>
              <input id="yakin" name="yakin" autoComplete="off" className="isian" />
              <TombolYakin tanya="Hapus pesanan ini untuk selamanya?">Hapus selamanya</TombolYakin>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
