'use client';
// Upload, caption, order and delete photos. Pictures are shrunk in the
// browser to at most 1800 px and saved as JPEG, so phone photos of 5 to 10 MB
// become a few hundred kB before they leave the phone.
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Ikon from '../Ikon';
import TombolYakin from './TombolYakin';
import { geserFoto, hapusFoto, ubahKeteranganFoto, unggahFoto } from '@/app/admin/aksi';
import type { Foto } from '@/lib/jenis';

const SISI = 1800;

async function kecilkan(berkas: File) {
  const url = URL.createObjectURL(berkas);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const s = Math.min(1, SISI / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d')!;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, w, h);
    g.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/jpeg', 0.84));
    if (!blob) throw new Error('Foto tidak bisa diproses');
    return { berkas: new File([blob], berkas.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }), w, h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function KelolaFoto({ wadah, kamarId, foto, catatan }: { wadah: string; kamarId?: number; foto: Foto[]; catatan?: string }) {
  const router = useRouter();
  const masukan = useRef<HTMLInputElement>(null);
  const [kabar, setKabar] = useState('');
  const [galat, setGalat] = useState('');
  const [sibuk, setSibuk] = useState(false);

  async function unggah(daftar: FileList | null) {
    if (!daftar?.length) return;
    setSibuk(true);
    setGalat('');
    const semua = Array.from(daftar);
    for (let i = 0; i < semua.length; i++) {
      setKabar(`Mengunggah ${i + 1} dari ${semua.length}`);
      try {
        const k = await kecilkan(semua[i]);
        const fd = new FormData();
        fd.set('wadah', wadah);
        if (kamarId) fd.set('kamar_id', String(kamarId));
        fd.set('berkas', k.berkas);
        fd.set('lebar', String(k.w));
        fd.set('tinggi', String(k.h));
        const r = await unggahFoto(fd);
        if (r.galat) setGalat(r.galat);
      } catch {
        setGalat(`${semua[i].name} gagal diunggah. Coba foto lain atau periksa sinyal.`);
      }
    }
    setKabar('');
    setSibuk(false);
    if (masukan.current) masukan.current.value = '';
    router.refresh();
  }

  return (
    <div>
      {catatan && <p className="mb-3 text-sm text-abu">{catatan}</p>}
      {foto.length > 0 && (
        <ul className="mb-4 grid gap-3 sm:grid-cols-2">
          {foto.map((f, i) => {
            const sendiri = foto.length % 2 === 1 && i === foto.length - 1;
            return (
            <li key={f.id} className={`overflow-hidden rounded-2xl bg-buih ${sendiri ? 'sm:col-span-2' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.keterangan} className={`w-full object-cover ${sendiri ? 'aspect-[4/3] sm:aspect-[2/1]' : 'aspect-[4/3]'}`} loading="lazy" />
              <div className="grid gap-2 p-3">
                <form action={ubahKeteranganFoto} className="flex gap-2">
                  <input type="hidden" name="id" value={f.id} />
                  <label className="sr-only" htmlFor={`ket-${f.id}`}>Keterangan foto</label>
                  <input id={`ket-${f.id}`} name="keterangan" defaultValue={f.keterangan} placeholder="Keterangan foto" className="isian !min-h-10 !py-1.5 text-sm" />
                  <button className="tombol tombol-putih tombol-kecil shrink-0" title="Simpan keterangan"><Ikon nama="centang" className="size-4" /><span className="sr-only">Simpan</span></button>
                </form>
                <div className="flex items-center gap-2">
                  {i === 0 && <span className="rounded-full bg-senja px-2.5 py-0.5 text-xs font-bold">Foto utama</span>}
                  <form action={geserFoto} className="ml-auto"><input type="hidden" name="id" value={f.id} /><input type="hidden" name="arah" value="kiri" />
                    <button disabled={i === 0} className="inline-flex size-9 items-center justify-center rounded-full bg-white text-laut disabled:opacity-35" title="Geser ke depan"><Ikon nama="kiri" className="size-4" /><span className="sr-only">Geser ke depan</span></button></form>
                  <form action={geserFoto}><input type="hidden" name="id" value={f.id} /><input type="hidden" name="arah" value="kanan" />
                    <button disabled={i === foto.length - 1} className="inline-flex size-9 items-center justify-center rounded-full bg-white text-laut disabled:opacity-35" title="Geser ke belakang"><Ikon nama="kanan" className="size-4" /><span className="sr-only">Geser ke belakang</span></button></form>
                  <form action={hapusFoto}><input type="hidden" name="id" value={f.id} />
                    <TombolYakin tanya="Hapus foto ini?" className="inline-flex size-9 items-center justify-center rounded-full bg-white text-merah"><Ikon nama="sampah" className="size-4" /><span className="sr-only">Hapus</span></TombolYakin></form>
                </div>
              </div>
            </li>
            );
          })}
        </ul>
      )}
      <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl bg-buih px-4 py-8 text-center text-laut ring-2 ring-buih-2 ring-inset hover:bg-buih-2 ${sibuk ? 'pointer-events-none opacity-60' : ''}`}>
        <Ikon nama="unggah" className="size-7" />
        <span className="font-semibold">{kabar || 'Pilih foto untuk diunggah'}</span>
        <span className="text-sm text-abu">Bisa beberapa sekaligus. Foto otomatis diperkecil.</span>
        <input ref={masukan} type="file" accept="image/*" multiple className="sr-only" disabled={sibuk} onChange={(e) => unggah(e.target.files)} />
      </label>
      {galat && <p role="alert" className="mt-3 rounded-2xl bg-[#fbe4df] px-4 py-3 font-semibold text-merah">{galat}</p>}
    </div>
  );
}
