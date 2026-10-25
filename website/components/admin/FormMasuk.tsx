'use client';
import { useActionState } from 'react';
import { masuk } from '@/app/admin/aksi';

export default function FormMasuk() {
  const [hasil, aksi, sedang] = useActionState(masuk, { galat: '' });
  return (
    <form action={aksi} className="grid gap-4">
      <div>
        <label htmlFor="sandi" className="label-isian">Kata sandi</label>
        <input id="sandi" name="sandi" type="password" required autoComplete="current-password" autoFocus className="isian" />
      </div>
      {hasil.galat && <p role="alert" className="rounded-2xl bg-[#fbe4df] px-4 py-3 font-semibold text-merah">{hasil.galat}</p>}
      <button className="tombol tombol-laut" disabled={sedang}>{sedang ? 'Memeriksa' : 'Masuk'}</button>
    </form>
  );
}
