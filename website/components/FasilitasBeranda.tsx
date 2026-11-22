import Ikon from './Ikon';
import type { Bahasa, Kamar } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';

// What a stay includes, in the home page's date card under the guests and
// above the boat transfer (the owner's requests, November 2026, "masih
// masuk di seksi kalender bukan terpisah" and "tambahkan fasilitasnya
// diatas addon boat transfer"), without a heading of its own
// ("hapus tulisan what you get"), named only for screen readers. The list comes from the
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

// Two columns from tablets up, beside the calendar as well. A facility left
// alone on the last row fills it.
const tempat = (n: number, i: number) => (n % 2 === 1 && i === n - 1 ? 'sm:col-span-2' : '');

export function fasilitasSemua(kamar: Pick<Kamar, 'fasilitas' | 'fasilitas_en'>[], b: Bahasa) {
  const daftar = kamar.flatMap((x) => (b === 'en' && x.fasilitas_en.length ? x.fasilitas_en : x.fasilitas)).map((x) => x.trim()).filter(Boolean);
  return [...new Set(daftar)];
}

export default function FasilitasBeranda({ b, fasilitas }: { b: Bahasa; fasilitas: string[] }) {
  if (!fasilitas.length) return null;
  const k = kamus(b);
  return (
    <section aria-label={k.fasilitas} className="rounded-2xl bg-embun p-3 sm:px-4" data-fasilitas-beranda={fasilitas.length}>
      <ul className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
        {fasilitas.map((f, i) => (
          <li key={f} className={`flex items-center gap-3 ${tempat(fasilitas.length, i)}`}>
            <span aria-hidden className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-biru-tua shadow-tipis">
              <Ikon nama={ikonUntuk(f)} className="size-[1.125rem]" />
            </span>
            <span className="text-sm font-semibold leading-snug text-laut">{f}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
