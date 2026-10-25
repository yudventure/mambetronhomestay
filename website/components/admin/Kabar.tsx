// Message strip after an admin action, driven by ?ok= and ?galat= in the URL.
import Ikon from '../Ikon';

export default function Kabar({ ok, galat, pesan }: { ok?: string; galat?: string; pesan: Record<string, string> }) {
  const teks = galat ? pesan[`galat:${galat}`] ?? pesan.galat ?? 'Ada yang belum benar.' : ok ? pesan[`ok:${ok}`] ?? pesan.ok ?? 'Tersimpan.' : '';
  if (!teks) return null;
  return (
    <p role={galat ? 'alert' : 'status'} className={`mb-6 flex items-start gap-3 rounded-2xl px-4 py-3 font-semibold ${galat ? 'bg-[#fbe4df] text-merah' : 'bg-buih-2 text-toska-tua'}`}>
      <Ikon nama={galat ? 'info' : 'centang'} className="mt-0.5 size-5 shrink-0" tebal={2.2} /> {teks}
    </p>
  );
}

export function JudulAdmin({ judul, teks, children }: { judul: string; teks?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl">{judul}</h1>
        {teks && <p className="mt-1 max-w-2xl text-abu">{teks}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
