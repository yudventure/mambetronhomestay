'use client';
// Two steps on one page. The second form stays visible, so a code that
// already sits in the mailbox can be used after a reload.
import { useActionState } from 'react';
import { gantiSandi, mintaKode, type HasilSandi } from '@/app/admin/sandi/aksi';

const AWAL: HasilSandi = { galat: '', pesan: '' };

function Kabar({ h }: { h: HasilSandi }) {
  if (h.galat) return <p role="alert" className="rounded-2xl bg-[#fbe4df] px-4 py-3 font-semibold text-merah">{h.galat}</p>;
  if (h.pesan) return <p role="status" className="rounded-2xl bg-buih-2 px-4 py-3 font-semibold text-biru-tua">{h.pesan}</p>;
  return null;
}

export default function FormSandi({ tujuan }: { tujuan: string }) {
  const [kirim, aksiKirim, mengirim] = useActionState(mintaKode, AWAL);
  const [ganti, aksiGanti, mengganti] = useActionState(gantiSandi, AWAL);
  return (
    <div className="grid gap-6">
      <form action={aksiKirim} className="grid gap-3">
        <h2 className="flex items-center gap-3 text-xl">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-buih font-judul text-biru-tua">1</span>
          Minta kode
        </h2>
        <p className="text-sm text-abu">Kode 6 angka dikirim ke surel admin {tujuan}.</p>
        <Kabar h={kirim} />
        <button className="tombol tombol-garis" disabled={mengirim}>{mengirim ? 'Mengirim' : 'Kirim kode ke surel'}</button>
      </form>

      <form action={aksiGanti} className="grid gap-4">
        <h2 className="flex items-center gap-3 text-xl">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-buih font-judul text-biru-tua">2</span>
          Buat kata sandi baru
        </h2>
        <div>
          <label htmlFor="kode" className="label-isian">Kode dari surel</label>
          <input id="kode" name="kode" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="\d{6}" required
            className="isian tracking-[0.4em] tabular-nums" />
        </div>
        <div>
          <label htmlFor="sandi-baru" className="label-isian">Kata sandi baru</label>
          <input id="sandi-baru" name="sandi" type="password" autoComplete="new-password" minLength={10} maxLength={200} required className="isian" />
          <p className="bantuan">Minimal 10 karakter.</p>
        </div>
        <div>
          <label htmlFor="ulangi" className="label-isian">Ulangi kata sandi baru</label>
          <input id="ulangi" name="ulangi" type="password" autoComplete="new-password" minLength={10} maxLength={200} required className="isian" />
        </div>
        <Kabar h={ganti} />
        <button className="tombol tombol-laut" disabled={mengganti}>{mengganti ? 'Menyimpan' : 'Simpan kata sandi baru'}</button>
      </form>
    </div>
  );
}
