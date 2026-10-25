import Ikon from './Ikon';
import type { Bahasa } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';

// Quick date search on the home page, a plain GET form into /pesan.
export default function CariCepat({ b, awal, akhir }: { b: Bahasa; awal: string; akhir: string }) {
  const k = kamus(b);
  return (
    <form action="/pesan" method="get" className="kartu grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_0.8fr_auto] lg:items-end">
      <div>
        <label htmlFor="cari-masuk" className="label-isian inline-flex items-center gap-1.5"><Ikon nama="kalender" className="size-4" />{k.tiba}</label>
        <input id="cari-masuk" name="masuk" type="date" min={awal} max={akhir} className="isian" />
      </div>
      <div>
        <label htmlFor="cari-keluar" className="label-isian inline-flex items-center gap-1.5"><Ikon nama="kalender" className="size-4" />{k.pulang}</label>
        <input id="cari-keluar" name="keluar" type="date" min={awal} className="isian" />
      </div>
      <div className="sm:col-span-2 lg:col-span-1">
        <label htmlFor="cari-tamu" className="label-isian inline-flex items-center gap-1.5"><Ikon nama="orang" className="size-4" />{k.tamu}</label>
        <select id="cari-tamu" name="tamu" defaultValue="2" className="isian">
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <button className="tombol sm:col-span-2 lg:col-span-1">
        <Ikon nama="cari" /> {k.cariPondok}
      </button>
    </form>
  );
}
