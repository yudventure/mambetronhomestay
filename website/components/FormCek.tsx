'use client';
import { useActionState } from 'react';
import { kirimTanpaReset } from '@/lib/kait';
import { cariPesananTamu } from '@/app/(tamu)/cek-pesanan/aksi';
import type { Bahasa } from '@/lib/jenis';
import { KAMUS } from '@/lib/kamus';

export default function FormCek({ b }: { b: Bahasa }) {
  const k = KAMUS[b].cek;
  const [hasil, aksi, sedang] = useActionState(cariPesananTamu, { galat: '' });
  return (
    <form onSubmit={kirimTanpaReset(aksi)} className="grid gap-4">
      <input type="hidden" name="bahasa" value={b} />
      <div>
        <label htmlFor="kode" className="label-isian">{k.kode}</label>
        <input id="kode" name="kode" required autoCapitalize="characters" autoComplete="off" placeholder="MB7K2Q9X" className="isian uppercase" />
      </div>
      <div>
        <label htmlFor="kontak" className="label-isian">{k.kontak}</label>
        <input id="kontak" name="kontak" required autoComplete="email" className="isian" />
      </div>
      {hasil.galat && <p role="alert" className="rounded-2xl bg-[#fbe4df] px-4 py-3 font-semibold text-merah">{hasil.galat}</p>}
      <button className="tombol tombol-laut" disabled={sedang}>{k.tombol}</button>
    </form>
  );
}
