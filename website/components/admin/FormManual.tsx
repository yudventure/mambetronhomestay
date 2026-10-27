'use client';
// Booking taken over WhatsApp or in person. Same checks as the public form,
// without the lead time and booking window.
import { useActionState } from 'react';
import { kirimTanpaReset } from '@/lib/kait';
import { pesananManual } from '@/app/admin/aksi';
import type { Kamar, Layanan } from '@/lib/jenis';
import { rupiah } from '@/lib/format';
import { SATUAN } from '@/lib/satuan.mjs';
import { KAMUS } from '@/lib/kamus';

export default function FormManual({ kamar, layanan, hari }: { kamar: Pick<Kamar, 'id' | 'nama' | 'aktif' | 'jumlah_unit' | 'kapasitas'>[]; layanan: Layanan[]; hari: string }) {
  const [hasil, aksi, sedang] = useActionState(pesananManual, { galat: '' });
  return (
    <form onSubmit={kirimTanpaReset(aksi)} className="grid gap-6 xl:grid-cols-2">
      <section className="kartu grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="text-2xl sm:col-span-2">Bungalow dan tanggal</h2>
        <div className="sm:col-span-2">
          <label className="label-isian" htmlFor="kamar">Bungalow</label>
          <select id="kamar" name="kamar" className="isian" required>
            {kamar.map((k) => <option key={k.id} value={k.id}>{k.nama} ({k.jumlah_unit} unit, muat {k.kapasitas}){k.aktif ? '' : ', nonaktif'}</option>)}
          </select>
        </div>
        <div><label className="label-isian" htmlFor="masuk">Tiba</label><input id="masuk" name="masuk" type="date" defaultValue={hari} required className="isian" /></div>
        <div><label className="label-isian" htmlFor="keluar">Pulang</label><input id="keluar" name="keluar" type="date" required className="isian" /></div>
        <div><label className="label-isian" htmlFor="jumlahKamar">Jumlah bungalow</label><input id="jumlahKamar" name="jumlahKamar" type="number" min={1} defaultValue={1} className="isian" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label-isian" htmlFor="dewasa">Dewasa</label><input id="dewasa" name="dewasa" type="number" min={1} defaultValue={2} className="isian" /></div>
          <div><label className="label-isian" htmlFor="anak">Anak</label><input id="anak" name="anak" type="number" min={0} defaultValue={0} className="isian" /></div>
        </div>
        {layanan.length > 0 && (
          <fieldset className="sm:col-span-2">
            <legend className="label-isian">Kegiatan tambahan</legend>
            <div className="grid gap-2">
              {layanan.map((l) => (
                <label key={l.id} className="flex items-center gap-3 rounded-2xl bg-buih px-4 py-2.5">
                  <input type="checkbox" name="layanan" value={l.id} className="size-5 accent-[#036f87]" />
                  <span className="flex-1">{l.nama}</span>
                  <span className="text-sm text-abu">{rupiah(l.harga)} {SATUAN[l.satuan].id}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </section>

      <section className="kartu grid content-start gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="text-2xl sm:col-span-2">Data tamu</h2>
        <div className="sm:col-span-2"><label className="label-isian" htmlFor="nama">Nama</label><input id="nama" name="nama" required className="isian" /></div>
        <div><label className="label-isian" htmlFor="telepon">WhatsApp</label><input id="telepon" name="telepon" type="tel" className="isian" /></div>
        <div><label className="label-isian" htmlFor="email">Surel</label><input id="email" name="email" type="email" className="isian" /></div>
        <div><label className="label-isian" htmlFor="negara">Asal</label><input id="negara" name="negara" className="isian" /></div>
        <div>
          <label className="label-isian" htmlFor="bahasa">Bahasa tamu</label>
          <select id="bahasa" name="bahasa" className="isian"><option value="id">Indonesia</option><option value="en">Inggris</option></select>
        </div>
        <div className="sm:col-span-2"><label className="label-isian" htmlFor="kedatangan">Rencana tiba</label><input id="kedatangan" name="kedatangan" className="isian" /></div>
        <div className="sm:col-span-2"><label className="label-isian" htmlFor="catatan">Catatan tamu</label><textarea id="catatan" name="catatan" className="isian" /></div>
        <div>
          <label className="label-isian" htmlFor="status">Status</label>
          <select id="status" name="status" className="isian" defaultValue="menunggu">
            {(['menunggu', 'dikonfirmasi', 'lunas'] as const).map((s) => <option key={s} value={s}>{KAMUS.id.status[s]}</option>)}
          </select>
        </div>
        <div><label className="label-isian" htmlFor="catatan_admin">Catatan pengelola</label><input id="catatan_admin" name="catatan_admin" className="isian" /></div>
        {hasil.galat && <p role="alert" className="rounded-2xl bg-[#fbe4df] px-4 py-3 font-semibold text-merah sm:col-span-2">{hasil.galat}</p>}
        <button className="tombol sm:col-span-2" disabled={sedang}>{sedang ? 'Menyimpan' : 'Simpan pesanan'}</button>
      </section>
    </form>
  );
}
