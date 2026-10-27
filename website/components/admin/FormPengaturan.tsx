'use client';
// Settings form built from one section of PENGATURAN in lib/bawaan.mjs.
import { useActionState, useState } from 'react';
import Ikon from '../Ikon';
import Wajah, { WAJAH } from '../Wajah';
import { simpanPengaturan } from '@/app/admin/aksi';
import { IKON_LABEL } from '@/lib/bawaan.mjs';

type Isian = { k: string; label: string; jenis: string; bantuan?: string; min?: number; max?: number; tambah?: string; isian?: Isian[] };
type Bagian = { kunci: string; judul: string; keterangan?: string; isian: Isian[] };
type Nilai = Record<string, unknown>;
type DuaV = { id: string; en: string };

const kosongDari = (sub: Isian[]): Nilai => Object.fromEntries(sub.map((s) => [s.k, s.jenis.startsWith('dua') ? { id: '', en: '' } : s.jenis === 'ikon' ? 'bintang' : '']));

function Kolom({ f, nilai, ubah, awalan }: { f: Isian; nilai: unknown; ubah: (v: unknown) => void; awalan: string }) {
  const id = `${awalan}-${f.k}`;
  switch (f.jenis) {
    case 'teks':
    case 'jam':
      return (
        <div>
          <label className="label-isian" htmlFor={id}>{f.label}</label>
          <input id={id} value={String(nilai ?? '')} onChange={(e) => ubah(e.target.value)} placeholder={f.jenis === 'jam' ? '12:00' : undefined} inputMode={f.jenis === 'jam' ? 'numeric' : undefined} className={`isian ${f.jenis === 'jam' ? 'max-w-40' : ''}`} />
          {f.bantuan && <p className="bantuan">{f.bantuan}</p>}
        </div>
      );
    case 'panjang':
      return (
        <div>
          <label className="label-isian" htmlFor={id}>{f.label}</label>
          <textarea id={id} value={String(nilai ?? '')} onChange={(e) => ubah(e.target.value)} className="isian" />
          {f.bantuan && <p className="bantuan">{f.bantuan}</p>}
        </div>
      );
    case 'angka':
      return (
        <div>
          <label className="label-isian" htmlFor={id}>{f.label}</label>
          <input id={id} type="number" min={f.min} max={f.max} value={String(nilai ?? '')} onChange={(e) => ubah(e.target.value)} className="isian max-w-40" />
          {f.bantuan && <p className="bantuan">{f.bantuan}</p>}
        </div>
      );
    case 'dua':
    case 'duaPanjang': {
      const v = (nilai ?? { id: '', en: '' }) as DuaV;
      const Kotak = f.jenis === 'dua' ? 'input' : 'textarea';
      return (
        <fieldset className="grid gap-3 md:grid-cols-2">
          <legend className="label-isian">{f.label}</legend>
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wider text-abu uppercase" htmlFor={`${id}-id`}>Indonesia</label>
            <Kotak id={`${id}-id`} value={v.id} onChange={(e) => ubah({ ...v, id: e.target.value })} className="isian" rows={f.jenis === 'duaPanjang' ? 5 : undefined} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wider text-abu uppercase" htmlFor={`${id}-en`}>English</label>
            <Kotak id={`${id}-en`} value={v.en} onChange={(e) => ubah({ ...v, en: e.target.value })} className="isian" rows={f.jenis === 'duaPanjang' ? 5 : undefined} />
          </div>
          {f.bantuan && <p className="bantuan md:col-span-2">{f.bantuan}</p>}
        </fieldset>
      );
    }
    case 'ikon':
      return (
        <fieldset>
          <legend className="label-isian">{f.label}</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(IKON_LABEL).map(([n, label]) => (
              <button key={n} type="button" onClick={() => ubah(n)} title={label} aria-pressed={nilai === n}
                className={`inline-flex size-11 items-center justify-center rounded-xl ${nilai === n ? 'bg-biru-tua text-white' : 'bg-white text-laut ring-1 ring-buih-2 hover:bg-buih'}`}>
                <Ikon nama={n} className="size-5" /><span className="sr-only">{label}</span>
              </button>
            ))}
          </div>
        </fieldset>
      );
    case 'wajah':
      return (
        <fieldset>
          <legend className="label-isian">{f.label}</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => ubah('')} aria-pressed={!nilai}
              className={`inline-flex h-12 items-center rounded-full px-4 text-sm font-semibold ${!nilai ? 'bg-biru-tua text-white' : 'bg-white text-laut ring-1 ring-buih-2 hover:bg-buih'}`}>
              Otomatis
            </button>
            {Object.entries(WAJAH).map(([n, w]) => (
              <button key={n} type="button" onClick={() => ubah(n)} title={w.label} aria-pressed={nilai === n}
                className={`inline-flex size-12 items-center justify-center rounded-full ${nilai === n ? 'ring-[3px] ring-biru-tua ring-offset-2' : 'ring-1 ring-buih-2 hover:ring-biru-tua/50'}`}>
                <Wajah kunci={n} className="size-full rounded-full" /><span className="sr-only">{w.label}</span>
              </button>
            ))}
          </div>
          {f.bantuan && <p className="bantuan">{f.bantuan}</p>}
        </fieldset>
      );
    case 'saklar': {
      const nyala = nilai === true;
      return (
        <div>
          <button type="button" role="switch" id={id} aria-checked={nyala} onClick={() => ubah(!nyala)}
            className="flex w-full items-center gap-4 rounded-2xl bg-buih px-4 py-3 text-left hover:bg-buih-2">
            <span aria-hidden className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${nyala ? 'bg-aksen' : 'bg-white'}`}>
              <span className={`absolute top-1 size-5 rounded-full transition-[left] ${nyala ? 'left-6 bg-white' : 'left-1 bg-laut/35'}`} />
            </span>
            <span className="font-semibold text-laut">
              {f.label}
              <span className="block text-sm font-normal text-abu">{nyala ? 'Menyala' : 'Mati'}</span>
            </span>
          </button>
          {f.bantuan && <p className="bantuan">{f.bantuan}</p>}
        </div>
      );
    }
    case 'daftar': {
      const baris = (Array.isArray(nilai) ? nilai : []) as Nilai[];
      const set = (b: Nilai[]) => ubah(b);
      return (
        <fieldset>
          <legend className="label-isian">{f.label}</legend>
          {f.bantuan && <p className="bantuan -mt-1 mb-3">{f.bantuan}</p>}
          <div className="grid gap-3">
            {baris.map((r, i) => (
              <div key={i} className="rounded-2xl bg-buih p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-judul text-lg font-semibold text-laut">{i + 1}</span>
                  <button type="button" onClick={() => { const b = [...baris]; [b[i - 1], b[i]] = [b[i], b[i - 1]]; set(b); }} disabled={i === 0}
                    className="ml-auto inline-flex size-9 items-center justify-center rounded-full bg-white text-laut disabled:opacity-35" title="Naikkan"><Ikon nama="atas" className="size-4" /><span className="sr-only">Naikkan</span></button>
                  <button type="button" onClick={() => { const b = [...baris]; [b[i + 1], b[i]] = [b[i], b[i + 1]]; set(b); }} disabled={i === baris.length - 1}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-white text-laut disabled:opacity-35" title="Turunkan"><Ikon nama="bawah" className="size-4" /><span className="sr-only">Turunkan</span></button>
                  <button type="button" onClick={() => { if (window.confirm('Hapus baris ini?')) set(baris.filter((_, j) => j !== i)); }}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-white text-merah" title="Hapus"><Ikon nama="sampah" className="size-4" /><span className="sr-only">Hapus</span></button>
                </div>
                <div className="grid gap-3">
                  {f.isian!.map((s) => (
                    <Kolom key={s.k} f={s} nilai={r[s.k]} awalan={`${id}-${i}`} ubah={(v) => set(baris.map((x, j) => (j === i ? { ...x, [s.k]: v } : x)))} />
                  ))}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => set([...baris, kosongDari(f.isian!)])} className="tombol tombol-putih tombol-kecil justify-self-start">
              <Ikon nama="tambah" className="size-4" /> {f.tambah ?? 'Tambah'}
            </button>
          </div>
        </fieldset>
      );
    }
    default:
      return null;
  }
}

export default function FormPengaturan({ bagian, nilai }: { bagian: Bagian; nilai: Nilai }) {
  const [data, setData] = useState<Nilai>(nilai);
  const [hasil, aksi, sedang] = useActionState(simpanPengaturan, { pesan: '', ok: false });
  return (
    <form action={aksi} className="grid gap-6">
      <input type="hidden" name="bagian" value={bagian.kunci} />
      <input type="hidden" name="data" value={JSON.stringify(data)} />
      {bagian.isian.map((f) => (
        <Kolom key={f.k} f={f} nilai={data[f.k]} awalan={bagian.kunci} ubah={(v) => setData((d) => ({ ...d, [f.k]: v }))} />
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button className="tombol tombol-laut" disabled={sedang}>{sedang ? 'Menyimpan' : 'Simpan bagian ini'}</button>
        {hasil.pesan && <p role="status" className={`font-semibold ${hasil.ok ? 'text-biru-tua' : 'text-merah'}`}>{hasil.pesan}</p>}
      </div>
    </form>
  );
}
