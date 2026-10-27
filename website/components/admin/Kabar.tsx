// Message strip after an admin action, driven by ?ok= and ?galat= in the URL.
import Ikon from '../Ikon';
import { bulanTahun } from '@/lib/format';
import { hariIni } from '@/lib/tanggal';

export default function Kabar({ ok, galat, pesan }: { ok?: string; galat?: string; pesan: Record<string, string> }) {
  const teks = galat ? pesan[`galat:${galat}`] ?? pesan.galat ?? 'Ada yang belum benar.' : ok ? pesan[`ok:${ok}`] ?? pesan.ok ?? 'Tersimpan.' : '';
  if (!teks) return null;
  return (
    <p role={galat ? 'alert' : 'status'} className={`mb-6 flex items-start gap-3 rounded-2xl px-4 py-3 font-semibold ${galat ? 'bg-[#fbe4df] text-merah' : 'bg-buih-2 text-biru-tua'}`}>
      <Ikon nama={galat ? 'info' : 'centang'} className="mt-0.5 size-5 shrink-0" tebal={2.2} /> {teks}
    </p>
  );
}

// Page title with the MEJA PENGELOLA eyebrow and the current month.
export function JudulAdmin({ judul, teks, label, children }: { judul: string; teks?: string; label?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="label-kecil !text-panel-utama">{label ?? `Meja pengelola · ${bulanTahun(hariIni(), 'id')}`}</p>
        <h1 className="mt-2 text-[2.4rem] leading-[1.02] text-panel-utama sm:text-5xl">{judul}</h1>
        {teks && <p className="mt-2 max-w-2xl text-[1.0625rem] text-abu">{teks}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
