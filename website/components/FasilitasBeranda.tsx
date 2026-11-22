import Ikon from './Ikon';
import type { Bahasa, Kamar } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';

// What a stay includes, on the home page between the gallery and the date
// card (the owner's request, November 2026). The list comes from the
// bungalows' facilities in the panel (Bungalow, Fasilitas), each shown once.
// The icon follows the words, a tick when none fits.
function ikonUntuk(teks: string) {
  const t = teks.toLowerCase();
  if (/wifi|wi-fi|internet|starlink/.test(t)) return 'wifi';
  if (/makan|sarapan|meal|breakfast|dinner|food/.test(t)) return 'makan';
  if (/listrik|genset|power|electric/.test(t)) return 'bulan';
  if (/kamar mandi|mandi|bathroom|shower|toilet/.test(t)) return 'air';
  if (/snorkel|karang|reef/.test(t)) return 'karang';
  if (/pantai|laut|beach|sea/.test(t)) return 'ikan';
  return 'centang';
}

// Two columns on tablets, four on wide screens. The last row is shared
// evenly, so a facility left alone fills the row.
function tempat(n: number, i: number) {
  const k = [n % 2 === 1 && i === n - 1 ? 'sm:col-span-2' : ''];
  const sisa = n % 4;
  if (sisa && i >= n - sisa) k.push(sisa === 1 ? 'lg:col-span-12' : sisa === 2 ? 'lg:col-span-6' : 'lg:col-span-4');
  else k.push('lg:col-span-3');
  return k.join(' ');
}

export function fasilitasSemua(kamar: Pick<Kamar, 'fasilitas' | 'fasilitas_en'>[], b: Bahasa) {
  const daftar = kamar.flatMap((x) => (b === 'en' && x.fasilitas_en.length ? x.fasilitas_en : x.fasilitas)).map((x) => x.trim()).filter(Boolean);
  return [...new Set(daftar)];
}

export default function FasilitasBeranda({ b, fasilitas }: { b: Bahasa; fasilitas: string[] }) {
  if (!fasilitas.length) return null;
  const k = kamus(b);
  return (
    <section aria-label={k.fasilitas} data-fasilitas-beranda={fasilitas.length}>
      <p className="label-kecil">{k.fasilitas}</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
        {fasilitas.map((f, i) => (
          <li key={f} className={`flex items-center gap-3 rounded-2xl bg-embun px-4 py-3.5 ${tempat(fasilitas.length, i)}`}>
            <span aria-hidden className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-biru-tua shadow-tipis">
              <Ikon nama={ikonUntuk(f)} className="size-5" />
            </span>
            <span className="text-[0.95rem] font-semibold leading-snug text-laut">{f}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
